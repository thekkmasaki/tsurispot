/**
 * 座標検証・修正スクリプト
 *
 * - Nominatim forward geocoding でスポット名から正しい座標を検索
 * - 現在の座標と比較し、距離が閾値以上なら修正候補として出力
 * - --fix オプションで自動修正（5件ごとに中間保存）
 *
 * 使い方:
 *   node scripts/validate-coordinates.mjs                    # 全ファイル検証のみ
 *   node scripts/validate-coordinates.mjs --fix              # 全ファイル修正
 *   node scripts/validate-coordinates.mjs spots-extra.ts     # 特定ファイル検証
 *   node scripts/validate-coordinates.mjs spots-extra.ts --fix  # 特定ファイル修正
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'lib', 'data');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// === Nominatim 前方ジオコーディング ===
async function forwardGeocode(query, retries = 2) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=jp&limit=3&accept-language=ja`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'TsuriSpot/1.0 (dev@tsurispot.jp)' }
      });
      if (res.status === 429) {
        console.log('  ⏳ Rate limited, waiting 5s...');
        await sleep(5000);
        continue;
      }
      if (!res.ok) {
        console.error(`  HTTP ${res.status} for query: ${query}`);
        return null;
      }
      return await res.json();
    } catch (e) {
      console.error(`  Nominatim error: ${e.message}`);
      if (attempt < retries) await sleep(2000);
    }
  }
  return null;
}

// === 2点間の距離計算（km）===
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// === スポットデータ抽出 ===
function extractSpots(content) {
  const spots = [];
  // 各スポットオブジェクトをブロック単位で抽出
  const spotBlocks = content.split(/\n\s*\{/);

  for (const block of spotBlocks) {
    const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
    const slugMatch = block.match(/slug:\s*["']([^"']+)["']/);
    const latMatch = block.match(/latitude:\s*([\d.]+)/);
    const lngMatch = block.match(/longitude:\s*([\d.]+)/);
    const addressMatch = block.match(/address:\s*["']([^"']+)["']/);

    if (nameMatch && slugMatch && latMatch && lngMatch) {
      spots.push({
        name: nameMatch[1],
        slug: slugMatch[1],
        lat: parseFloat(latMatch[1]),
        lng: parseFloat(lngMatch[1]),
        address: addressMatch ? addressMatch[1] : '',
      });
    }
  }
  return spots;
}

// === スポット名から検索クエリを生成 ===
function buildSearchQueries(spot) {
  const queries = [];
  const name = spot.name;

  // アドレスから都道府県を抽出
  const prefMatch = spot.address.match(/(北海道|東京都|大阪府|京都府|.{2,3}県)/);
  const pref = prefMatch ? prefMatch[1] : '';

  // 1. フル名前 + 都道府県
  if (pref) {
    queries.push(`${pref} ${name}`);
  }

  // 2. スポット名そのまま
  queries.push(name);

  // 3. 名前から「市」「町」などの修飾を除いたコア名
  // 例: "天草市本渡港" → "本渡港"
  const coreMatch = name.match(/(?:.*?[市町村区郡])(.+)/);
  if (coreMatch && pref) {
    queries.push(`${pref} ${coreMatch[1]}`);
  }

  return queries;
}

// === 座標タイプの判定（港、漁港など検証しやすいもの）===
function isVerifiableSpot(name) {
  // 港、漁港、堤防、海岸、浜、磯、河口、ダム、湖 など具体的な地名を含むスポット
  return /港|漁港|堤防|波止|岸壁|海岸|浜|磯|河口|ダム|湖|池|川|橋|マリーナ|サーフ|突堤|埠頭|桟橋|テトラ|防波堤|船着/.test(name);
}

// === メイン処理 ===
async function processFile(file, doFix) {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const spots = extractSpots(content);

  if (spots.length === 0) {
    return { checked: 0, issues: 0, fixed: 0 };
  }

  // 検証可能なスポットのみフィルタ
  const verifiable = spots.filter(s => isVerifiableSpot(s.name));
  console.log(`\n📍 ${file}: ${verifiable.length}/${spots.length} spots to verify`);

  let issues = 0;
  let fixed = 0;
  let saveCounter = 0;
  const DISTANCE_THRESHOLD_KM = 1.0; // 1km以上ずれていたら問題

  for (let i = 0; i < verifiable.length; i++) {
    const spot = verifiable[i];
    const queries = buildSearchQueries(spot);

    let bestResult = null;
    let bestDistance = Infinity;
    let bestQuery = '';

    for (const query of queries) {
      await sleep(1100); // Rate limit

      const results = await forwardGeocode(query);
      if (!results || results.length === 0) continue;

      // 結果の中から最も近いものを選ぶ（ただし港や漁港タイプを優先）
      for (const r of results) {
        const rLat = parseFloat(r.lat);
        const rLon = parseFloat(r.lon);
        const dist = haversineDistance(spot.lat, spot.lng, rLat, rLon);

        // 結果のタイプチェック - 港湾施設を優先
        const isPort = r.type === 'harbour' || r.type === 'marina' ||
          r.class === 'waterway' || r.class === 'natural' ||
          (r.display_name && /港|漁港|堤防|海岸|浜/.test(r.display_name));

        if (dist < bestDistance || (isPort && dist < bestDistance + 2)) {
          bestDistance = dist;
          bestResult = r;
          bestQuery = query;
        }
      }

      // 良い結果が見つかったらこれ以上のクエリは不要
      if (bestDistance < 0.3) break;
    }

    if (!bestResult) {
      // 検索結果なし - スキップ
      continue;
    }

    const newLat = parseFloat(bestResult.lat);
    const newLng = parseFloat(bestResult.lon);

    if (bestDistance > DISTANCE_THRESHOLD_KM) {
      issues++;
      console.log(`  ⚠️  [${i + 1}/${verifiable.length}] ${spot.name} (${spot.slug})`);
      console.log(`      現在: ${spot.lat}, ${spot.lng}`);
      console.log(`      検索: ${newLat.toFixed(4)}, ${newLng.toFixed(4)} (${bestDistance.toFixed(1)}km離れ, query="${bestQuery}")`);
      console.log(`      結果: ${bestResult.display_name}`);

      if (doFix && bestDistance < 20) {
        // 20km以内なら自動修正（それ以上は完全に別の場所の可能性）
        const oldLatStr = `latitude: ${spot.lat}`;
        const oldLngStr = `longitude: ${spot.lng}`;
        const newLatStr = `latitude: ${newLat.toFixed(4)}`;
        const newLngStr = `longitude: ${newLng.toFixed(4)}`;

        // latitude の置換（同じ値が複数ある場合を考慮してスラグ近くの値のみ変更）
        const slugIndex = content.indexOf(`slug: "${spot.slug}"`);
        if (slugIndex === -1) {
          const slugIndex2 = content.indexOf(`slug: '${spot.slug}'`);
          if (slugIndex2 === -1) {
            console.log(`      ❌ slug not found in file, skipping`);
            continue;
          }
        }

        // スラグの位置から前後500文字の範囲で座標を探す
        const si = content.indexOf(spot.slug);
        const searchStart = Math.max(0, si - 200);
        const searchEnd = Math.min(content.length, si + 500);
        const block = content.substring(searchStart, searchEnd);

        const latIdx = block.indexOf(`latitude: ${spot.lat}`);
        const lngIdx = block.indexOf(`longitude: ${spot.lng}`);

        if (latIdx !== -1 && lngIdx !== -1) {
          // ブロック内の座標を置換
          const absLatIdx = searchStart + latIdx;
          const absLngIdx = searchStart + lngIdx;

          // longitude を先に置換（位置がずれないように後ろから）
          if (absLngIdx > absLatIdx) {
            content = content.substring(0, absLngIdx) +
              `longitude: ${newLng.toFixed(4)}` +
              content.substring(absLngIdx + `longitude: ${spot.lng}`.length);
            content = content.substring(0, absLatIdx) +
              `latitude: ${newLat.toFixed(4)}` +
              content.substring(absLatIdx + `latitude: ${spot.lat}`.length);
          } else {
            content = content.substring(0, absLatIdx) +
              `latitude: ${newLat.toFixed(4)}` +
              content.substring(absLatIdx + `latitude: ${spot.lat}`.length);
            // lngIdx を再計算（latの置換で位置がずれた可能性）
            const newBlock = content.substring(searchStart, searchStart + 700);
            const newLngIdx = newBlock.indexOf(`longitude: ${spot.lng}`);
            if (newLngIdx !== -1) {
              const newAbsLngIdx = searchStart + newLngIdx;
              content = content.substring(0, newAbsLngIdx) +
                `longitude: ${newLng.toFixed(4)}` +
                content.substring(newAbsLngIdx + `longitude: ${spot.lng}`.length);
            }
          }

          fixed++;
          saveCounter++;
          console.log(`      ✅ 修正: ${spot.lat},${spot.lng} → ${newLat.toFixed(4)},${newLng.toFixed(4)}`);
        } else {
          console.log(`      ❌ 座標がブロック内に見つからず、スキップ`);
        }

        // 5件ごとに中間保存
        if (saveCounter >= 5) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  💾 中間保存 (${fixed}件修正済み)`);
          saveCounter = 0;
        }
      }
    }
  }

  // 最終保存
  if (doFix && saveCounter > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 最終保存 (${fixed}件修正済み)`);
  }

  console.log(`  📊 ${file}: checked=${verifiable.length}, issues=${issues}, fixed=${fixed}`);
  return { checked: verifiable.length, issues, fixed };
}

// === エントリーポイント ===
async function main() {
  const args = process.argv.slice(2);
  const doFix = args.includes('--fix');
  const targetFile = args.find(a => !a.startsWith('--'));

  let files;
  if (targetFile) {
    files = [targetFile];
  } else {
    files = fs.readdirSync(dataDir)
      .filter(f => f.startsWith('spots-') && f.endsWith('.ts') && !f.includes('freshwater'))
      .sort();
  }

  console.log(`🔍 座標検証開始 (${doFix ? '修正モード' : '検証のみ'})`);
  console.log(`  対象ファイル: ${files.length}件\n`);

  let totalChecked = 0, totalIssues = 0, totalFixed = 0;

  for (const file of files) {
    const result = await processFile(file, doFix);
    totalChecked += result.checked;
    totalIssues += result.issues;
    totalFixed += result.fixed;
  }

  console.log('\n=== 全体サマリー ===');
  console.log(`検証: ${totalChecked}件`);
  console.log(`問題: ${totalIssues}件`);
  if (doFix) console.log(`修正: ${totalFixed}件`);
}

main().catch(console.error);
