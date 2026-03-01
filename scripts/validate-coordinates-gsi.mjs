/**
 * 座標検証・修正スクリプト（国土地理院API版）
 *
 * - 国土地理院の地名検索API（無料・高精度）を使用
 * - スポット名で検索し、現在の座標と比較
 * - 距離が閾値以上なら修正
 * - 5件ごとに中間保存
 *
 * 使い方:
 *   node scripts/validate-coordinates-gsi.mjs                       # 検証のみ
 *   node scripts/validate-coordinates-gsi.mjs --fix                 # 修正モード
 *   node scripts/validate-coordinates-gsi.mjs spots-extra.ts --fix  # 特定ファイル
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'lib', 'data');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// === 国土地理院 地名検索API ===
async function searchGSI(query, retries = 2) {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  HTTP ${res.status} for query: ${query}`);
        if (attempt < retries) await sleep(2000);
        continue;
      }
      const data = await res.json();
      return data;
    } catch (e) {
      console.error(`  GSI error: ${e.message}`);
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

// === スポット名からGSI検索クエリ候補を生成 ===
function buildSearchQueries(spot) {
  const name = spot.name;
  const queries = [];

  // 住所から都道府県を抽出
  const prefMatch = spot.address.match(/(北海道|東京都|大阪府|京都府|.{2,3}県)/);
  const pref = prefMatch ? prefMatch[1] : '';

  // 名前のクリーニング: 「〇〇市」「〇〇町」プレフィックスを除去
  const cleanedName = name
    .replace(/^[^\s]*?[市町村区郡]/, '')  // 先頭の市町村を除去
    .replace(/^の/, '');  // 「の」で始まる場合も除去

  // 1. スポット名から港・漁港・堤防などのコアワードを抽出
  const portMatch = name.match(/([\u3000-\u9fff]+(?:港|漁港|堤防|波止|海岸|浜|磯|マリーナ|埠頭|防波堤|突堤|桟橋|河口|ダム|湖|池|橋))/);
  if (portMatch) {
    queries.push(portMatch[1]);
  }

  // 2. クリーンされた名前（市名除去）
  if (cleanedName && cleanedName !== name) {
    queries.push(cleanedName);
  }

  // 3. フル名前
  queries.push(name);

  // 4. 都道府県 + コアワード
  if (pref && portMatch) {
    queries.push(`${pref}${portMatch[1]}`);
  }

  return [...new Set(queries)]; // 重複除去
}

// === 検証対象かどうか ===
function isVerifiableSpot(name) {
  return /港|漁港|堤防|波止|岸壁|海岸|浜|磯|河口|ダム|湖|池|川|橋|マリーナ|サーフ|突堤|埠頭|桟橋|テトラ|防波堤|船着|公園|海釣り/.test(name);
}

// === GSI結果から最適な候補を選ぶ ===
function pickBestResult(results, spot) {
  if (!results || results.length === 0) return null;

  const prefMatch = spot.address.match(/(北海道|東京都|大阪府|京都府|.{2,3}県)/);
  const pref = prefMatch ? prefMatch[1] : '';

  // 同じ都道府県の結果をフィルタ
  let candidates = results;
  if (pref) {
    const prefCandidates = results.filter(r => r.properties?.title?.includes(pref));
    if (prefCandidates.length > 0) candidates = prefCandidates;
  }

  // 「港」「漁港」をタイトルに含む結果を優先
  const portCandidates = candidates.filter(r =>
    /港|漁港|堤防|海岸|浜/.test(r.properties?.title || '')
  );
  if (portCandidates.length > 0) candidates = portCandidates;

  // 現在の座標に最も近いものを返す（ただし50km以内のみ）
  let best = null;
  let bestDist = Infinity;
  for (const r of candidates) {
    if (!r.geometry?.coordinates) continue;
    const [lon, lat] = r.geometry.coordinates;
    const dist = haversineDistance(spot.lat, spot.lng, lat, lon);
    if (dist < bestDist && dist < 50) {
      bestDist = dist;
      best = { lat, lon, title: r.properties?.title || '', distance: dist };
    }
  }

  // もし50km以内に結果がなくても、港名完全一致なら採用
  if (!best) {
    for (const r of results) {
      if (!r.geometry?.coordinates) continue;
      const title = r.properties?.title || '';
      // スポット名のコアワードがタイトルに含まれるか
      const portMatch = spot.name.match(/([\u3000-\u9fff]+(?:港|漁港))/);
      if (portMatch && title.includes(portMatch[1])) {
        const [lon, lat] = r.geometry.coordinates;
        const dist = haversineDistance(spot.lat, spot.lng, lat, lon);
        best = { lat, lon, title, distance: dist };
        break;
      }
    }
  }

  return best;
}

// === ファイル処理 ===
async function processFile(file, doFix) {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const spots = extractSpots(content);

  if (spots.length === 0) {
    return { checked: 0, issues: 0, fixed: 0 };
  }

  const verifiable = spots.filter(s => isVerifiableSpot(s.name));
  console.log(`\n📍 ${file}: ${verifiable.length}/${spots.length} spots to verify`);

  let issues = 0;
  let fixed = 0;
  let saveCounter = 0;
  const DISTANCE_THRESHOLD_KM = 0.8; // 800m以上ずれていたら問題

  for (let i = 0; i < verifiable.length; i++) {
    const spot = verifiable[i];
    const queries = buildSearchQueries(spot);

    let bestResult = null;

    for (const query of queries) {
      await sleep(300); // GSI APIはNominatimより寛容だが少し待つ

      const results = await searchGSI(query);
      const candidate = pickBestResult(results, spot);

      if (candidate) {
        if (!bestResult || candidate.distance < bestResult.distance) {
          bestResult = candidate;
        }
        // 十分近い結果が見つかったら終了
        if (candidate.distance < 0.3) break;
      }
    }

    if (!bestResult) continue;

    if (bestResult.distance > DISTANCE_THRESHOLD_KM) {
      issues++;
      console.log(`  ⚠️  [${i + 1}/${verifiable.length}] ${spot.name} (${spot.slug})`);
      console.log(`      現在: ${spot.lat}, ${spot.lng}`);
      console.log(`      GSI:  ${bestResult.lat.toFixed(4)}, ${bestResult.lon.toFixed(4)} (${bestResult.distance.toFixed(1)}km離れ)`);
      console.log(`      結果: ${bestResult.title}`);

      if (doFix) {
        const newLat = bestResult.lat;
        const newLng = bestResult.lon;

        // スラグの位置を基準にブロック内の座標を置換
        const slugStr1 = `slug: "${spot.slug}"`;
        const slugStr2 = `slug: '${spot.slug}'`;
        const si = content.indexOf(slugStr1) !== -1 ? content.indexOf(slugStr1) : content.indexOf(slugStr2);

        if (si === -1) {
          console.log(`      ❌ slug not found, skip`);
          continue;
        }

        const searchStart = Math.max(0, si - 300);
        const searchEnd = Math.min(content.length, si + 800);
        let block = content.substring(searchStart, searchEnd);

        const latStr = `latitude: ${spot.lat}`;
        const lngStr = `longitude: ${spot.lng}`;
        const latIdx = block.indexOf(latStr);
        const lngIdx = block.indexOf(lngStr);

        if (latIdx === -1 || lngIdx === -1) {
          console.log(`      ❌ 座標文字列が見つからず、skip`);
          continue;
        }

        // ブロック内で置換
        block = block.replace(latStr, `latitude: ${newLat.toFixed(4)}`);
        block = block.replace(lngStr, `longitude: ${newLng.toFixed(4)}`);

        content = content.substring(0, searchStart) + block + content.substring(searchEnd);

        fixed++;
        saveCounter++;
        console.log(`      ✅ 修正: ${spot.lat},${spot.lng} → ${newLat.toFixed(4)},${newLng.toFixed(4)}`);

        if (saveCounter >= 5) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`  💾 中間保存 (${fixed}件修正済み)`);
          saveCounter = 0;
        }
      }
    }
  }

  if (doFix && saveCounter > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 最終保存 (${fixed}件修正済み)`);
  }

  console.log(`  📊 ${file}: checked=${verifiable.length}, issues=${issues}, fixed=${fixed}`);
  return { checked: verifiable.length, issues, fixed };
}

// === メイン ===
async function main() {
  const args = process.argv.slice(2);
  const doFix = args.includes('--fix');
  const targetFile = args.find(a => !a.startsWith('--'));

  let files;
  if (targetFile) {
    files = [targetFile];
  } else {
    files = fs.readdirSync(dataDir)
      .filter(f => f.startsWith('spots-') && f.endsWith('.ts'))
      .sort();
  }

  console.log(`🔍 座標検証開始 [国土地理院API] (${doFix ? '修正モード' : '検証のみ'})`);
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
