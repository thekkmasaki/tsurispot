#!/usr/bin/env node
/**
 * スポットのローカル画像参照の実体存在チェック（404 / NoFallback 抑止用）
 *
 * src/lib/data/spots-*.ts の mainImageUrl / images[] のうち、
 * ローカルパス（/images/spots/...）で実体が public/ に存在しないものを列挙し、
 * src/lib/data/missing-spot-images.json（欠損ファイル名の配列）を生成する。
 *
 * このJSONは resolveSpotImageSrc()（src/lib/data/spot-image.ts）が参照し、
 * 欠損画像は最初から描画しない（= 404 GET を出さずプレースホルダー表示）。
 *
 * 使い方: node scripts/validate-spot-images.mjs
 * （スポット画像を追加/差し替えたら再実行してJSONを更新する）
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'src/lib/data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUT = path.join(DATA_DIR, 'missing-spot-images.json');

const spotFiles = fs.readdirSync(DATA_DIR).filter((f) => /^spots.*\.ts$/.test(f));

const referencedLocal = new Set();
// mainImageUrl: "..." と images: ["...", ...] の両方からローカルパスを収集
const urlRe = /"(\/images\/spots\/[^"]+)"/g;
for (const file of spotFiles) {
  const src = fs.readFileSync(path.join(DATA_DIR, file), 'utf8');
  let m;
  while ((m = urlRe.exec(src)) !== null) referencedLocal.add(m[1]);
}

const missing = [];
for (const url of referencedLocal) {
  // placeholder 系は実在チェック対象外（意図的なプレースホルダー）
  if (url.includes('/placeholder')) continue;
  const abs = path.join(PUBLIC_DIR, url);
  if (!fs.existsSync(abs)) missing.push(url);
}
missing.sort();

fs.writeFileSync(OUT, JSON.stringify(missing, null, 2) + '\n');

console.log('=== スポット画像実体チェック ===');
console.log('参照ローカル画像（ユニーク）:', referencedLocal.size);
console.log('欠損（実体なし）:', missing.length);
if (missing.length) {
  console.log('--- 欠損一覧 ---');
  for (const u of missing) console.log('  ', u);
}
console.log('出力:', path.relative(ROOT, OUT));
