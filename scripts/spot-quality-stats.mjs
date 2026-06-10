#!/usr/bin/env node
/**
 * スポット品質ティア統計（noindex帯 / 中間帯 / sitemap帯）
 *
 * src/lib/seo-quality.ts の判定（noindex/sitemap掲載の一元基準）を
 * 実行時の fishingSpots に適用し、各ティアの件数を集計する。
 * さらに sitemap帯 × 欠損画像（missing-spot-images.json 参照スポット）の
 * クロス集計も出力する。
 *
 * ── データ読み込み方式について ──
 * 他の scripts/*.mjs（validate-spot-images.mjs / dump-spots.mjs 等）は
 * spots-*.ts を正規表現でパースするが、品質ティアは
 * src/lib/data/spots.ts の deduplicateSpots() / enrichDescriptions()
 * 適用後の実行時データで決まる（desc<100字は generateSpotIntro で補完される）ため、
 * 生ファイルのパースでは統計が実態とズレる。
 * そこで本スクリプトは esbuild（node_modules に既存）で spots.ts と
 * seo-quality.ts をバンドルし、本番と同一の fishingSpots / 判定関数で集計する。
 *
 * 使い方: node scripts/spot-quality-stats.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const MISSING_JSON = path.join(ROOT, 'src/lib/data/missing-spot-images.json');

// ── 実行時データのバンドル & 読み込み ──────────────────
async function loadRuntimeData() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tsurispot-quality-'));
  const outfile = path.join(tmpDir, 'bundle.mjs');
  try {
    await build({
      stdin: {
        contents: `
          export { fishingSpots } from './src/lib/data/spots';
          export { isLowQualitySpot, isSitemapEligible } from './src/lib/seo-quality';
        `,
        resolveDir: ROOT,
        loader: 'ts',
      },
      bundle: true,
      format: 'esm',
      platform: 'node',
      tsconfig: path.join(ROOT, 'tsconfig.json'),
      outfile,
      logLevel: 'error',
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const { fishingSpots, isLowQualitySpot, isSitemapEligible } = await loadRuntimeData();

// ── ティア分類 ──────────────────────────────────────
const tiers = { noindex: [], middle: [], sitemap: [] };
for (const spot of fishingSpots) {
  if (isLowQualitySpot(spot)) tiers.noindex.push(spot);
  else if (isSitemapEligible(spot)) tiers.sitemap.push(spot);
  else tiers.middle.push(spot);
}

const total = fishingSpots.length;
const pct = (n) => ((n / total) * 100).toFixed(1).padStart(5) + '%';

console.log('=== スポット品質ティア統計 ===');
console.log(`総スポット数: ${total}`);
console.log(`  noindex帯 (desc<50 かつ 魚種<=1)   : ${String(tiers.noindex.length).padStart(5)}件 (${pct(tiers.noindex.length)})`);
console.log(`  中間帯   (index可・sitemap非掲載)  : ${String(tiers.middle.length).padStart(5)}件 (${pct(tiers.middle.length)})`);
console.log(`  sitemap帯 (desc>=100 かつ 魚種>=2) : ${String(tiers.sitemap.length).padStart(5)}件 (${pct(tiers.sitemap.length)})`);

// 整合性チェック（noindex帯とsitemap帯は論理的に排他）
const overlap = fishingSpots.filter((s) => isLowQualitySpot(s) && isSitemapEligible(s)).length;
console.log(`  整合性: 合計=${tiers.noindex.length + tiers.middle.length + tiers.sitemap.length} / noindex∩sitemap=${overlap}（0であること）`);

// ── sitemap帯 × 欠損画像クロス集計 ──────────────────
const missingSet = new Set(JSON.parse(fs.readFileSync(MISSING_JSON, 'utf8')));

/** スポットが欠損画像パスを1つ以上参照しているか */
function refersMissingImage(spot) {
  const urls = [spot.mainImageUrl, ...(spot.images || [])].filter(Boolean);
  return urls.some((u) => missingSet.has(u));
}

console.log('');
console.log('=== ティア × 欠損画像クロス集計 ===');
console.log(`欠損画像リスト: ${missingSet.size}件 (src/lib/data/missing-spot-images.json)`);
for (const [name, label] of [
  ['noindex', 'noindex帯'],
  ['middle', '中間帯  '],
  ['sitemap', 'sitemap帯'],
]) {
  const spots = tiers[name];
  const withMissing = spots.filter(refersMissingImage);
  console.log(`  ${label}: 欠損画像参照あり ${String(withMissing.length).padStart(4)}件 / なし ${String(spots.length - withMissing.length).padStart(4)}件`);
}

const sitemapMissing = tiers.sitemap.filter(refersMissingImage);
if (sitemapMissing.length) {
  console.log('');
  console.log(`--- sitemap帯かつ欠損画像参照のスポット例（先頭10件 / 全${sitemapMissing.length}件）---`);
  for (const s of sitemapMissing.slice(0, 10)) {
    console.log(`  ${s.slug} (${s.region.prefecture}) mainImageUrl=${s.mainImageUrl}`);
  }
}
