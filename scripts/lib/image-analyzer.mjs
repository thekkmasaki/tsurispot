// image-analyzer.mjs
// Sentinel-2バンドデータからNDWI水面検出→海岸線抽出→構造物分類→端点検出
//
// 核心ロジック:
// 1. NDWI で水面/陸地を分離
// 2. 海岸線（水面と陸地の境界）を検出
// 3. スポット座標に最も近い海岸線セグメント（=釣り場構造物）を特定
// 4. そのセグメントの端点のみを返す（陸地側の海岸線は無視）

/**
 * @param {{ red: Float32Array, green: Float32Array, blue: Float32Array, nir: Float32Array }} bands
 * @param {number} width
 * @param {number} height
 * @param {(px: number, py: number) => { lat: number, lng: number }} pixelToCoord
 */
export function analyzeImage(bands, width, height, pixelToCoord) {
  const { red, green, blue, nir } = bands;
  const totalPixels = width * height;
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);

  // 1. NDWI計算
  const ndwi = new Float32Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) {
    const denom = green[i] + nir[i];
    ndwi[i] = denom === 0 ? 0 : (green[i] - nir[i]) / denom;
  }

  // 2. 水面マスク
  const waterMask = new Uint8Array(totalPixels);
  let waterCount = 0;
  for (let i = 0; i < totalPixels; i++) {
    if (ndwi[i] > 0.0) {
      waterMask[i] = 1;
      waterCount++;
    }
  }
  const waterRatio = waterCount / totalPixels;
  const ndwiStats = computeNdwiStats(ndwi, waterMask, totalPixels);

  // 3. 全海岸線ピクセル検出
  const allCoastline = detectCoastline(waterMask, width, height);

  if (allCoastline.length === 0) {
    return emptyResult(waterRatio, ndwiStats);
  }

  // 4. 海岸線ピクセルを「水面側」のみフィルタ
  //    = 陸地側のピクセル（waterMask=0）で、隣に水面がある点
  //    これにより護岸/堤防の水際ラインだけ残る
  const waterEdge = allCoastline.filter(({ px, py }) => {
    const idx = py * width + px;
    // このピクセルが陸地側で、かつ水面に隣接 → 構造物の水際
    return waterMask[idx] === 0;
  });

  const coastlinePixels = waterEdge.length > 10 ? waterEdge : allCoastline;

  // 5. 釣り場構造物の水際ラインを特定
  //    水面が画像のどちら側にあるか判定し、各X列で最も海側の1点だけ取る
  const structurePixels = extractSeawardEdge(coastlinePixels, waterMask, width, height, cx, cy);

  if (structurePixels.length === 0) {
    return emptyResult(waterRatio, ndwiStats);
  }

  // 6. 構造物分類（structurePixelsのみ）
  const structureTypes = { seawall: 0, tetrapod: 0, sandy: 0, rocky: 0 };
  for (const { px, py } of structurePixels) {
    const type = classifyStructure(px, py, bands, width, height);
    structureTypes[type]++;
  }
  const dominantStructure = Object.entries(structureTypes)
    .sort((a, b) => b[1] - a[1])[0][0];

  // 7. 端点検出: 構造物セグメントのX座標で最西端・最東端
  const sorted = [...structurePixels].sort((a, b) => a.px - b.px);
  const westPixel = sorted[0];
  const eastPixel = sorted[sorted.length - 1];
  const endpoints = {
    west: pixelToCoord(westPixel.px, westPixel.py),
    east: pixelToCoord(eastPixel.px, eastPixel.py),
  };

  // 8. 信頼度
  const ndwiContrast = ndwiStats.waterMean - ndwiStats.landMean;
  const structureRatio = structurePixels.length / Math.max(coastlinePixels.length, 1);
  const confidence = clamp(ndwiContrast * 0.5 + structureRatio * 0.3 + 0.2, 0, 1);

  return {
    coastlinePixels: structurePixels,
    structureTypes,
    dominantStructure,
    endpoints,
    confidence,
    waterRatio,
    ndwiStats,
  };
}

/**
 * 海岸線ピクセルから「海側の水際ライン」だけを抽出する。
 *
 * アルゴリズム:
 * 1. 水面が画像のどちら側に多いか判定（上/下で比較）
 * 2. 各X列で、最も海側（水面方向）にある海岸線ピクセル1点だけを取る
 * 3. スポット中心から遠すぎるピクセルを除外（半径40px = 400m以内）
 * → これにより護岸/堤防の水際エッジだけが残る
 */
function extractSeawardEdge(coastlinePixels, waterMask, width, height, cx, cy) {
  if (coastlinePixels.length === 0) return [];

  // 画像の上半分と下半分の水面ピクセル数を比較
  let waterTop = 0, waterBottom = 0;
  const midY = Math.floor(height / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (waterMask[y * width + x] === 1) {
        if (y < midY) waterTop++; else waterBottom++;
      }
    }
  }
  // 水面が多い方向が「海側」
  const seaIsBelow = waterBottom >= waterTop;

  // 左半分と右半分の水面ピクセル数も比較（左右方向の海判定）
  let waterLeft = 0, waterRight = 0;
  const midX = Math.floor(width / 2);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (waterMask[y * width + x] === 1) {
        if (x < midX) waterLeft++; else waterRight++;
      }
    }
  }

  // 各X列で最も海側の海岸線ピクセルを選択
  const columnBest = new Map(); // x -> {px, py}
  for (const p of coastlinePixels) {
    const existing = columnBest.get(p.px);
    if (!existing) {
      columnBest.set(p.px, p);
    } else {
      // 海が下なら最大Y、海が上なら最小Yを選ぶ
      if (seaIsBelow ? p.py > existing.py : p.py < existing.py) {
        columnBest.set(p.px, p);
      }
    }
  }

  // スポット中心から半径30px（300m）以内に絞る
  const maxRadius = 30;
  const radiusFiltered = [];
  for (const p of columnBest.values()) {
    const dx = p.px - cx;
    const dy = p.py - cy;
    if (dx * dx + dy * dy <= maxRadius * maxRadius) {
      radiusFiltered.push(p);
    }
  }

  if (radiusFiltered.length < 5) return radiusFiltered;

  // 構造物分離: 不連続点検出で実際の構造物だけを抽出
  // 自然海岸線から構造物（護岸・防波堤）への遷移点を検出
  const sorted = [...radiusFiltered].sort((a, b) => a.px - b.px);

  // 隣接ピクセル間のY座標変化が小さい連続セグメントを探す
  const MAX_X_GAP = 3;   // 隣接X列の最大ギャップ（30m）
  const MAX_Y_JUMP = 2;  // 隣接X列のY座標最大変化（20m）

  // セグメント分割
  const segments = [];
  let segStart = 0;
  for (let i = 1; i < sorted.length; i++) {
    const xGap = sorted[i].px - sorted[i - 1].px;
    const yJump = Math.abs(sorted[i].py - sorted[i - 1].py);
    if (xGap > MAX_X_GAP || yJump > MAX_Y_JUMP) {
      segments.push({ start: segStart, end: i - 1, len: i - segStart });
      segStart = i;
    }
  }
  segments.push({ start: segStart, end: sorted.length - 1, len: sorted.length - segStart });

  // 最長のセグメントを選択（構造物は自然海岸線より長い連続セグメントになる）
  // ただしスポット中心に最も近いセグメントを優先
  let bestSeg = segments[0];
  let bestScore = -Infinity;
  for (const seg of segments) {
    if (seg.len < 3) continue; // 3px未満は無視
    // スコア: セグメント長 × 中心への近さ
    const segCenterX = sorted[Math.floor((seg.start + seg.end) / 2)].px;
    const distToCenter = Math.abs(segCenterX - cx);
    const score = seg.len * 2 - distToCenter;
    if (score > bestScore) {
      bestScore = score;
      bestSeg = seg;
    }
  }

  let segPoints = sorted.slice(bestSeg.start, bestSeg.end + 1);

  // 線形回帰フィット: 直線的な構造物（護岸・桟橋）から曲がる自然海岸線を除去
  // 構造物は直線的、公園境界等は曲がる → 回帰直線からの偏差で除去
  if (segPoints.length >= 10) {
    segPoints = trimToLinearSection(segPoints);
  }

  return segPoints;
}

/**
 * 線形回帰フィットからの偏差が大きい端部を除去。
 * 護岸・桟橋は直線的だが、公園境界は曲がるのでフィットから外れる。
 * 中央70%で回帰直線を計算し、両端から偏差>1.5pxの点を除去。
 */
function trimToLinearSection(points) {
  const n = points.length;
  // 中央70%で線形回帰
  const margin = Math.floor(n * 0.15);
  const core = points.slice(margin, n - margin);
  if (core.length < 5) return points;

  // y = a*x + b の最小二乗法
  let sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;
  for (const p of core) {
    sumX += p.px; sumY += p.py;
    sumXX += p.px * p.px; sumXY += p.px * p.py;
  }
  const cn = core.length;
  const denom = cn * sumXX - sumX * sumX;
  if (denom === 0) return points;
  const a = (cn * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / cn;

  // 各点の偏差を計算
  const threshold = 1.5; // 1.5px = 15m
  // 西端（左端）からトリム
  let startIdx = 0;
  for (let i = 0; i < n; i++) {
    const expected = a * points[i].px + b;
    const dev = Math.abs(points[i].py - expected);
    if (dev <= threshold) { startIdx = i; break; }
  }
  // 東端（右端）からトリム
  let endIdx = n - 1;
  for (let i = n - 1; i >= 0; i--) {
    const expected = a * points[i].px + b;
    const dev = Math.abs(points[i].py - expected);
    if (dev <= threshold) { endIdx = i; break; }
  }

  const trimmed = points.slice(startIdx, endIdx + 1);
  // 最低10点は残す
  return trimmed.length >= 10 ? trimmed : points;
}

function emptyResult(waterRatio, ndwiStats) {
  return {
    coastlinePixels: [],
    structureTypes: { seawall: 0, tetrapod: 0, sandy: 0, rocky: 0 },
    dominantStructure: 'seawall',
    endpoints: { west: { lat: 0, lng: 0 }, east: { lat: 0, lng: 0 } },
    confidence: 0,
    waterRatio,
    ndwiStats,
  };
}

function computeNdwiStats(ndwi, waterMask, totalPixels) {
  let sum = 0, min = Infinity, max = -Infinity;
  let waterSum = 0, wc = 0;
  let landSum = 0, lc = 0;

  for (let i = 0; i < totalPixels; i++) {
    const v = ndwi[i];
    sum += v;
    if (v < min) min = v;
    if (v > max) max = v;
    if (waterMask[i] === 1) { waterSum += v; wc++; }
    else { landSum += v; lc++; }
  }

  return {
    mean: totalPixels > 0 ? sum / totalPixels : 0,
    min: min === Infinity ? 0 : min,
    max: max === -Infinity ? 0 : max,
    waterMean: wc > 0 ? waterSum / wc : 0,
    landMean: lc > 0 ? landSum / lc : 0,
  };
}

function detectCoastline(waterMask, width, height) {
  const coastline = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const val = waterMask[idx];
      const up = waterMask[(y - 1) * width + x];
      const down = waterMask[(y + 1) * width + x];
      const left = waterMask[y * width + (x - 1)];
      const right = waterMask[y * width + (x + 1)];
      if (val !== up || val !== down || val !== left || val !== right) {
        coastline.push({ px: x, py: y });
      }
    }
  }
  return coastline;
}

function classifyStructure(px, py, bands, width, height) {
  const { red, green, blue, nir } = bands;
  let redSum = 0, greenSum = 0, blueSum = 0, nirSum = 0, redSqSum = 0, count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const idx = ny * width + nx;
      redSum += red[idx]; greenSum += green[idx];
      blueSum += blue[idx]; nirSum += nir[idx];
      redSqSum += red[idx] * red[idx]; count++;
    }
  }
  if (count === 0) return 'seawall';

  const meanRed = redSum / count;
  const meanGreen = greenSum / count;
  const meanBlue = blueSum / count;
  const meanNir = nirSum / count;
  const avg = (meanRed + meanGreen + meanBlue) / 3;
  const redVar = (redSqSum / count) - (meanRed * meanRed);
  const ndviD = meanNir + meanRed;
  const ndvi = ndviD === 0 ? 0 : (meanNir - meanRed) / ndviD;

  if (avg > 1500 && ndvi < 0.2) {
    return meanRed > meanGreen * 1.1 ? 'sandy' : 'seawall';
  }
  if (avg >= 800 && avg <= 1500 && redVar > 50000) return 'tetrapod';
  if (avg < 800) return 'rocky';
  return 'seawall';
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
