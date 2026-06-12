#!/usr/bin/env node
/**
 * apply-coord-fixes.mjs — fix-inland-coords.mjs が生成した修正候補を spots-*.ts に適用する
 *
 * 安全策:
 * - slug の次の `slug: "` 行までを同一スポットのブロックとみなし、その範囲内の
 *   latitude/longitude のみ書き換える
 * - 書き換え前に現在値が提案JSONの oldLat/oldLng と一致（小数誤差0.0005以内）することを検証。
 *   一致しない場合はスキップして報告（他PRで既に修正/削除されたケースを壊さない）
 * - 1スポットにつき latitude/longitude 各1箇所のみ。0件や2件以上ならスキップして報告
 *
 * 使い方:
 *   node scripts/apply-coord-fixes.mjs            # ドライラン（変更内容を表示のみ）
 *   node scripts/apply-coord-fixes.mjs --apply    # 実際にファイルを書き換える
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PROPOSED = path.join(ROOT, 'scripts/output/coord-fixes-proposed.json');
const DATA_DIR = path.join(ROOT, 'src/lib/data');
const APPLY = process.argv.includes('--apply');

const { fixes } = JSON.parse(fs.readFileSync(PROPOSED, 'utf8'));

const dataFiles = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.startsWith('spots') && f.endsWith('.ts'))
  .map((f) => path.join(DATA_DIR, f));

// slug → { file, content } の索引（ファイルは遅延読み込みでキャッシュ）
const fileCache = new Map();
function readFileCached(fp) {
  if (!fileCache.has(fp)) fileCache.set(fp, fs.readFileSync(fp, 'utf8'));
  return fileCache.get(fp);
}

/**
 * slug の全出現箇所（複数ファイル・同一ファイル内複数も）を列挙する。
 * 同一slugが複数ファイルに重複定義されているケースがあるため
 * （実行時は spots.ts のマージで片方が勝つ）、呼び出し側で
 * 「提案時の座標と一致する出現」を選んで書き換える。
 */
function findSpotOccurrences(slug) {
  const needle = `slug: "${slug}"`;
  const occurrences = [];
  for (const fp of dataFiles) {
    const content = readFileCached(fp);
    let idx = content.indexOf(needle);
    while (idx !== -1) {
      occurrences.push({ fp, slugIdx: idx });
      idx = content.indexOf(needle, idx + 1);
    }
  }
  return occurrences;
}

const close = (a, b) => Math.abs(a - b) <= 0.0005;

const applied = [];
const skipped = [];

const slugDuplicates = [];

for (const fix of fixes) {
  const occurrences = findSpotOccurrences(fix.slug);
  if (occurrences.length === 0) {
    skipped.push({ slug: fix.slug, reason: 'slug-not-found（重複統合等で削除済みの可能性）' });
    continue;
  }
  if (occurrences.length > 1) {
    slugDuplicates.push({ slug: fix.slug, files: occurrences.map((o) => path.basename(o.fp)) });
  }

  // 各出現のブロックを評価し、提案時の座標と一致するものを採用
  let target = null;
  const seen = [];
  for (const { fp, slugIdx } of occurrences) {
    const content = fileCache.get(fp);
    const nextSlugIdx = content.indexOf('slug: "', slugIdx + 1);
    const blockEnd = nextSlugIdx === -1 ? content.length : nextSlugIdx;
    const block = content.slice(slugIdx, blockEnd);
    const latMatches = [...block.matchAll(/latitude:\s*(-?\d+(?:\.\d+)?)/g)];
    const lngMatches = [...block.matchAll(/longitude:\s*(-?\d+(?:\.\d+)?)/g)];
    if (latMatches.length !== 1 || lngMatches.length !== 1) continue;
    const curLat = parseFloat(latMatches[0][1]);
    const curLng = parseFloat(lngMatches[0][1]);
    seen.push(`${path.basename(fp)}:(${curLat},${curLng})`);
    if (close(curLat, fix.oldLat) && close(curLng, fix.oldLng)) {
      target = { fp, slugIdx, blockEnd, block, latToken: latMatches[0][0], lngToken: lngMatches[0][0] };
      break;
    }
  }
  if (!target) {
    skipped.push({ slug: fix.slug, reason: `現在値が提案時と不一致 [${seen.join(' / ')}] ≠ (${fix.oldLat},${fix.oldLng})` });
    continue;
  }

  const newLat = Number(fix.newLat.toFixed(6));
  const newLng = Number(fix.newLng.toFixed(6));
  const content = fileCache.get(target.fp);
  const newBlock = target.block
    .replace(target.latToken, `latitude: ${newLat}`)
    .replace(target.lngToken, `longitude: ${newLng}`);
  fileCache.set(target.fp, content.slice(0, target.slugIdx) + newBlock + content.slice(target.blockEnd));
  applied.push({ slug: fix.slug, name: fix.name, file: path.basename(target.fp), newLat, newLng, movedKm: fix.movedKm, source: fix.source, confidence: fix.confidence });
}

if (APPLY) {
  const touched = new Set(applied.map((a) => a.file));
  for (const fp of dataFiles) {
    if (touched.has(path.basename(fp))) fs.writeFileSync(fp, fileCache.get(fp));
  }
}

console.log(`=== 座標修正の適用${APPLY ? '' : '（ドライラン）'} ===`);
console.log(`提案: ${fixes.length}件 / 適用${APPLY ? '' : '可能'}: ${applied.length}件 / スキップ: ${skipped.length}件 / slug重複定義検出: ${slugDuplicates.length}件`);
for (const s of skipped) console.log(`  skip ${s.slug}: ${s.reason}`);
const summaryPath = path.join(ROOT, 'scripts/output/coord-fixes-applied.json');
fs.writeFileSync(summaryPath, JSON.stringify({ appliedAt: new Date().toISOString(), apply: APPLY, applied, skipped, slugDuplicates }, null, 2));
console.log(`サマリ: ${path.relative(ROOT, summaryPath)}`);
