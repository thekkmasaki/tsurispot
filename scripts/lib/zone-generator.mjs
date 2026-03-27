/**
 * zone-generator.mjs
 * 構造物長と種類に基づいてゾーンを生成するモジュール
 */

/**
 * 文字列からハッシュ値を生成（シード用）
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * mulberry32 シード付き疑似乱数生成器
 */
function mulberry32(seed) {
  let t = seed + 0x6D2B79F5;
  return function () {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 構造物長からゾーン数を決定
 */
function determineZoneCount(length) {
  if (length < 150) return 3;
  if (length < 300) return 4;
  if (length < 500) return 5;
  if (length < 700) return 6;
  return Math.min(8, Math.round(length / 100));
}

/**
 * bearing方向に基づく方角ラベルを返す
 */
function getDirectionLabel(bearing, position) {
  const normalized = ((bearing % 360) + 360) % 360;
  if (position === 'start') {
    if (normalized >= 315 || normalized < 45) return '南端';
    if (normalized >= 45 && normalized < 135) return '西端';
    if (normalized >= 135 && normalized < 225) return '北端';
    return '東端';
  } else {
    if (normalized >= 315 || normalized < 45) return '北端';
    if (normalized >= 45 && normalized < 135) return '東端';
    if (normalized >= 135 && normalized < 225) return '南端';
    return '西端';
  }
}

/**
 * bearing方向に基づく「側」ラベルを返す
 */
function getSideLabel(bearing, position) {
  const normalized = ((bearing % 360) + 360) % 360;
  if (position === 'start') {
    if (normalized >= 315 || normalized < 45) return '南側';
    if (normalized >= 45 && normalized < 135) return '西側';
    if (normalized >= 135 && normalized < 225) return '北側';
    return '東側';
  } else {
    if (normalized >= 315 || normalized < 45) return '北側';
    if (normalized >= 45 && normalized < 135) return '東側';
    if (normalized >= 135 && normalized < 225) return '南側';
    return '西側';
  }
}

/**
 * bearing方向に基づく中央の方角ラベルを返す
 */
function getCenterDirectionLabel(bearing, position) {
  const normalized = ((bearing % 360) + 360) % 360;
  if (position === 'start') {
    if (normalized >= 315 || normalized < 45) return '中央南';
    if (normalized >= 45 && normalized < 135) return '中央西';
    if (normalized >= 135 && normalized < 225) return '中央北';
    return '中央東';
  } else {
    if (normalized >= 315 || normalized < 45) return '中央北';
    if (normalized >= 45 && normalized < 135) return '中央東';
    if (normalized >= 135 && normalized < 225) return '中央南';
    return '中央西';
  }
}

/**
 * ゾーン名を決定
 */
function resolveZoneName(index, total, hasDetectedTetrapod, bearing = 90) {
  const startLabel = getDirectionLabel(bearing, 'start');
  const endLabel = getDirectionLabel(bearing, 'end');
  const startSide = getSideLabel(bearing, 'start');
  const endSide = getSideLabel(bearing, 'end');

  if (index === 0) return `${startLabel}エリア`;
  if (index === total - 1) return `${endLabel}エリア`;
  if (index === 1 && hasDetectedTetrapod) return `${startSide}テトラ帯`;
  if (index === total - 2 && hasDetectedTetrapod) return `${endSide}テトラ帯`;

  if (total <= 4) return '中央エリア';
  const mid = Math.floor(total / 2);
  const startCenter = getCenterDirectionLabel(bearing, 'start');
  const endCenter = getCenterDirectionLabel(bearing, 'end');
  if (index < mid) return `${startCenter}エリア`;
  if (index > mid) return `${endCenter}エリア`;
  return '中央エリア';
}

/**
 * ゾーン位置に基づいた潮流値を計算
 */
function resolveCurrentFlow(index, total, rng) {
  if (index === 0 || index === total - 1) {
    return 0.85 + rng() * 0.10;
  }
  if (index === 1 || index === total - 2) {
    return 0.70 + rng() * 0.10;
  }
  return 0.50 + rng() * 0.20;
}

/**
 * layoutTypeに対応する基本構造物
 */
const LAYOUT_STRUCTURES = {
  seawall: ['seawall'],
  pier: ['pier'],
  port: ['seawall', 'port-facility'],
  beach: ['sandy'],
};

/**
 * 海底地形を推定
 */
function resolveSeaBottomFeatures(index, total, rng) {
  const isEdge = index === 0 || index === total - 1;
  const features = [];

  if (isEdge) {
    if (rng() < 0.6) features.push('tetrapod');
    if (rng() < 0.3) features.push('rocky-bottom');
  } else {
    const r = rng();
    if (r < 0.4) features.push('sandy-bottom');
    else if (r < 0.7) features.push('reef-stone');
    else if (r < 0.9) features.push('reef-concrete');
  }

  return features;
}

/**
 * 推定水深
 */
function resolveDepth(rng) {
  const shore = 3 + rng() * 3;
  const offshore = shore + 2 + rng() * 4;
  return {
    shore: Math.round(shore * 10) / 10,
    offshore: Math.round(offshore * 10) / 10,
  };
}

/**
 * ゾーンのレーティングを決定
 */
function resolveRating(currentFlow, seaBottomFeatures) {
  if (currentFlow >= 0.85) return 'hot';
  const hasReef = seaBottomFeatures.some(
    (f) => f === 'reef-stone' || f === 'reef-concrete'
  );
  if (hasReef) return 'good';
  return 'normal';
}

/**
 * 構造物をゾーンに割り当て
 */
function resolveStructures(index, total, layoutType, mergedResult, rng) {
  const base = [...(LAYOUT_STRUCTURES[layoutType] || ['seawall'])];
  const isEdge = index === 0 || index === total - 1;

  // 端ゾーンに60%確率でテトラポッド追加
  if (isEdge && rng() < 0.6) {
    if (!base.includes('tetrapod')) {
      base.push('tetrapod');
    }
  }

  // mergedResultのdetectedStructuresがあれば位置に基づいて割当
  if (mergedResult?.detectedStructures?.length > 0) {
    const xStart = index / total;
    const xEnd = (index + 1) / total;
    for (const ds of mergedResult.detectedStructures) {
      const pos = ds.relativePosition ?? 0.5;
      if (pos >= xStart && pos < xEnd && !base.includes(ds.type)) {
        base.push(ds.type);
      }
    }
  }

  return base;
}

/**
 * ゾーンを生成する
 *
 * @param {number} structureLength - 構造物全長（メートル）
 * @param {string} layoutType - 'seawall' | 'pier' | 'port' | 'beach'
 * @param {object} mergedResult - endpoint-mergerの出力
 * @param {object} [options] - オプション（slug, bearing）
 * @param {string} [options.slug='default'] - スポットslug（シード生成用）
 * @param {number} [options.bearing=90] - 構造物の方位角（0=北, 90=東, 180=南, 270=西）
 * @returns {Array} ゾーン配列（estimatedFishは空）
 */
export function generateZones(structureLength, layoutType, mergedResult, options = {}) {
  const { slug = 'default', bearing = 90 } = options;
  const seed = hashString(slug);
  const rng = mulberry32(seed);

  const zoneCount = determineZoneCount(structureLength);

  // detectedStructuresにtetrapodがあるか
  const hasDetectedTetrapod =
    mergedResult?.detectedStructures?.some((ds) => ds.type === 'tetrapod') ?? false;

  const zones = [];
  for (let i = 0; i < zoneCount; i++) {
    const xStart = i / zoneCount;
    const xEnd = (i + 1) / zoneCount;
    const currentFlow =
      Math.round(resolveCurrentFlow(i, zoneCount, rng) * 100) / 100;
    const seaBottomFeatures = resolveSeaBottomFeatures(i, zoneCount, rng);
    const depth = resolveDepth(rng);
    const structures = resolveStructures(i, zoneCount, layoutType, mergedResult, rng);
    const rating = resolveRating(currentFlow, seaBottomFeatures);

    zones.push({
      id: `zone-${i + 1}`,
      name: resolveZoneName(i, zoneCount, hasDetectedTetrapod, bearing),
      xRange: [
        Math.round(xStart * 100) / 100,
        Math.round(xEnd * 100) / 100,
      ],
      currentFlow,
      structures,
      seaBottomFeatures,
      estimatedDepth: depth,
      rating,
      estimatedFish: [],
    });
  }

  return zones;
}
