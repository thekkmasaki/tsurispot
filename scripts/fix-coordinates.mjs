/**
 * 座標修正スクリプト（国土地理院API - 高精度版）
 *
 * 戦略:
 * 1. スポット名から「港名」「地名+施設名」を抽出
 * 2. 国土地理院APIで検索
 * 3. 結果のタイトルがスポット名と高いマッチ度を持つ場合のみ修正
 * 4. 5件ごとに中間保存
 *
 * 使い方:
 *   node scripts/fix-coordinates.mjs                       # 全ファイル（検証のみ）
 *   node scripts/fix-coordinates.mjs --fix                 # 全ファイル修正
 *   node scripts/fix-coordinates.mjs spots-extra.ts --fix  # 特定ファイル修正
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'src', 'lib', 'data');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// === 国土地理院 API ===
async function searchGSI(query) {
  const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

// === 距離計算 ===
function haversine(lat1, lon1, lat2, lon2) {
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

// === スポット名から検索キーワード抽出 ===
function extractLandmarkName(spotName) {
  // パターン: "〇〇市△△港" → "△△港"
  // パターン: "〇〇・△△港" → "△△港"
  // パターン: "△△漁港" → "△△漁港"
  // パターン: "△△海岸" → "△△海岸"

  // 先に「・」区切りの後ろを取る
  const parts = spotName.split(/[・]/);
  let core = parts[parts.length - 1];

  // 市区町村プレフィックスを除去
  core = core.replace(/^.*?[市区町村郡]/, '');
  if (core.length < 2) core = spotName.replace(/^.*?[市区町村郡]/, '');
  if (core.length < 2) core = spotName;

  return core;
}

// === GSI結果の品質スコア ===
function scoreResult(result, spot) {
  const title = result.properties?.title || '';
  if (!result.geometry?.coordinates) return { score: 0 };

  const [lon, lat] = result.geometry.coordinates;
  const dist = haversine(spot.lat, spot.lng, lat, lon);

  let score = 0;
  const landmark = extractLandmarkName(spot.name);

  // タイトルに港名が含まれるか
  if (title.includes(landmark)) score += 50;

  // タイトルにスポット名のコアワードが含まれるか
  const keywords = spot.name.match(/[\u3000-\u9fff]{2,}/g) || [];
  for (const kw of keywords) {
    if (title.includes(kw)) score += 10;
  }

  // 港・漁港がタイトルに含まれる
  if (/港|漁港/.test(title) && /港|漁港/.test(spot.name)) score += 20;
  if (/堤防|波止|防波堤/.test(title) && /堤防|波止|防波堤/.test(spot.name)) score += 20;
  if (/海岸|浜/.test(title) && /海岸|浜/.test(spot.name)) score += 20;

  // 都道府県一致
  const prefMatch = spot.address.match(/(北海道|東京都|大阪府|京都府|.{2,3}県)/);
  if (prefMatch && title.includes(prefMatch[1])) score += 5;

  // 距離ペナルティ（50km以上は大幅減点）
  if (dist > 50) score -= 100;
  else if (dist > 20) score -= 30;
  else if (dist > 10) score -= 10;

  return { score, lat, lon, title, dist };
}

// === ファイル処理 ===
async function processFile(file, doFix) {
  const filePath = path.join(dataDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const spots = extractSpots(content);

  if (spots.length === 0) return { checked: 0, issues: 0, fixed: 0 };

  // 検証対象: 港、漁港、堤防、海岸など名前に施設名を含むスポット
  const targets = spots.filter(s => /港|漁港|堤防|波止|海岸|浜|磯|埠頭|公園|マリーナ/.test(s.name));
  console.log(`\n📍 ${file}: ${targets.length}/${spots.length} spots to check`);

  let issues = 0, fixed = 0, saveCounter = 0;

  for (let i = 0; i < targets.length; i++) {
    const spot = targets[i];
    const landmark = extractLandmarkName(spot.name);

    // 複数クエリで検索
    const queries = [
      landmark,
      spot.name,
    ];

    // 都道府県がわかればプレフィックスに
    const prefMatch = spot.address.match(/(北海道|東京都|大阪府|京都府|.{2,3}県)/);
    if (prefMatch) {
      queries.unshift(`${prefMatch[1]}${landmark}`);
    }

    let bestScore = 0;
    let bestCandidate = null;

    for (const q of [...new Set(queries)]) {
      await sleep(250);
      const results = await searchGSI(q);
      if (!results || !Array.isArray(results)) continue;

      for (const r of results) {
        const scored = scoreResult(r, spot);
        if (scored.score > bestScore) {
          bestScore = scored.score;
          bestCandidate = scored;
        }
      }

      // 高スコアの結果があれば残りのクエリはスキップ
      if (bestScore >= 60) break;
    }

    if (!bestCandidate || bestScore < 30) continue;

    // 800m以上ずれていて、スコアが十分高い場合のみ報告/修正
    if (bestCandidate.dist > 0.8 && bestScore >= 30) {
      issues++;
      const flag = bestScore >= 50 ? '🔴' : '🟡';
      console.log(`  ${flag} [${i + 1}/${targets.length}] ${spot.name} (score=${bestScore})`);
      console.log(`      現在: ${spot.lat}, ${spot.lng}`);
      console.log(`      正解: ${bestCandidate.lat.toFixed(4)}, ${bestCandidate.lon.toFixed(4)} (${bestCandidate.dist.toFixed(1)}km離れ)`);
      console.log(`      GSI:  ${bestCandidate.title}`);

      // スコア50以上（高確率で正しい結果）のみ自動修正
      if (doFix && bestScore >= 50 && bestCandidate.dist < 30) {
        const newLat = bestCandidate.lat;
        const newLng = bestCandidate.lon;

        const slugStr1 = `slug: "${spot.slug}"`;
        const slugStr2 = `slug: '${spot.slug}'`;
        const si = content.indexOf(slugStr1) !== -1 ? content.indexOf(slugStr1) : content.indexOf(slugStr2);

        if (si === -1) {
          console.log(`      ❌ slug not found`);
          continue;
        }

        const searchStart = Math.max(0, si - 300);
        const searchEnd = Math.min(content.length, si + 800);
        let block = content.substring(searchStart, searchEnd);

        const latStr = `latitude: ${spot.lat}`;
        const lngStr = `longitude: ${spot.lng}`;

        if (block.includes(latStr) && block.includes(lngStr)) {
          block = block.replace(latStr, `latitude: ${newLat.toFixed(4)}`);
          block = block.replace(lngStr, `longitude: ${newLng.toFixed(4)}`);
          content = content.substring(0, searchStart) + block + content.substring(searchEnd);

          fixed++;
          saveCounter++;
          console.log(`      ✅ 修正完了`);

          if (saveCounter >= 5) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  💾 中間保存 (${fixed}件修正済み)`);
            saveCounter = 0;
          }
        } else {
          console.log(`      ❌ 座標文字列が見つからず`);
        }
      }
    }
  }

  if (doFix && saveCounter > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  💾 最終保存 (${fixed}件修正済み)`);
  }

  console.log(`  📊 ${file}: checked=${targets.length}, issues=${issues}, fixed=${fixed}`);
  return { checked: targets.length, issues, fixed };
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

  console.log(`🔍 座標修正 [国土地理院API] (${doFix ? '修正モード' : '検証のみ'})`);
  console.log(`  対象: ${files.length}ファイル\n`);

  let totalChecked = 0, totalIssues = 0, totalFixed = 0;

  for (const file of files) {
    const result = await processFile(file, doFix);
    totalChecked += result.checked;
    totalIssues += result.issues;
    totalFixed += result.fixed;
  }

  console.log('\n=== サマリー ===');
  console.log(`検証: ${totalChecked}件`);
  console.log(`問題: ${totalIssues}件 (🔴=高確率, 🟡=要確認)`);
  if (doFix) console.log(`修正: ${totalFixed}件`);
}

main().catch(console.error);
