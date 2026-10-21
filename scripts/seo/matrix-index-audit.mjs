#!/usr/bin/env node
/**
 * マトリクス（県×月×魚種）の需要ベース index 最適化 監査スクリプト
 *
 * 本番と同一の実行時データ（esbuild で src/lib/data をバンドル）で、
 *   - 現行 index 数（= 配信される count>=MATRIX_MIN_SPOTS 全件）→ 新ルール（isDemandPrefMonthFish）での index 数
 *   - 魚種別の維持率（配信件数 上位20魚種）
 *   - 救済件数（ウナギ夏 / prefecture-info の別名解決のみで残る組合せ）
 *   - noindex 化される組合せのカテゴリ別・魚種別内訳
 *   - monthlyGuides.topFish の slug 実在チェック
 *   - スポット詳細の 3 ティア（noindex帯 / 中間帯 / sitemap帯）の実行時件数
 * を集計して標準出力する。
 *
 * 使い方: node scripts/seo/matrix-index-audit.mjs [--json scripts/output/matrix-index-audit.json]
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const ROOT = path.resolve(import.meta.dirname, "../..");

async function loadRuntimeData() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tsurispot-matrix-audit-"));
  const outfile = path.join(tmpDir, "bundle.mjs");
  try {
    await build({
      stdin: {
        contents: `
          export { fishingSpots } from './src/lib/data/spots';
          export { fishSpecies } from './src/lib/data/fish';
          export { prefectures } from './src/lib/data/prefectures';
          export { monthlyGuides } from './src/lib/data/monthly-guides';
          export {
            getEligiblePrefMonthFishCombos,
            getHighValuePrefMonthFishCombos,
            getIndexablePrefMonthFishCombos,
            explainPrefMonthFishDemand,
            isDemandPrefMonthFish,
          } from './src/lib/data';
          export { isLowQualitySpot, isSitemapEligible } from './src/lib/seo-quality';
        `,
        resolveDir: ROOT,
        loader: "ts",
      },
      bundle: true,
      format: "esm",
      platform: "node",
      tsconfig: path.join(ROOT, "tsconfig.json"),
      outfile,
      logLevel: "error",
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const rt = await loadRuntimeData();
const fishBySlug = new Map(rt.fishSpecies.map((f) => [f.slug, f]));
const eligible = rt.getEligiblePrefMonthFishCombos();
const ssg = rt.getHighValuePrefMonthFishCombos();
const indexable = rt.getIndexablePrefMonthFishCombos();
const key = (c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`;
const indexableKeys = new Set(indexable.map(key));
const pct = (a, b) => (b === 0 ? "-" : `${((a / b) * 100).toFixed(1)}%`);

const report = {};

// ── 1. Before / After ───────────────────────────────────────────
report.summary = {
  spots: rt.fishingSpots.length,
  fish: rt.fishSpecies.length,
  ssg: ssg.length,
  indexBefore: eligible.length,
  indexAfter: indexable.length,
  noindexAdded: eligible.length - indexable.length,
};
console.log("=== マトリクス index 数 Before/After ===");
console.log(`配信ページ(count>=2) = 現行 index: ${eligible.length}`);
console.log(`新ルール index:                     ${indexable.length}  (noindex,follow 化: ${eligible.length - indexable.length})`);
console.log(`SSG(事前生成・不変):                 ${ssg.length}`);
const ssgMissing = ssg.filter((c) => !indexableKeys.has(key(c)));
console.log(`SSG ⊂ index: ${ssgMissing.length === 0 ? "OK" : "NG " + ssgMissing.length + "件漏れ"}`);

// ── 2. 理由別内訳（重複あり / 単独理由） ──────────────────────────
const reasonCount = {};
const soleReasonCount = {};
for (const c of indexable) {
  const rs = rt.explainPrefMonthFishDemand(c.prefSlug, c.monthSlug, c.fishSlug);
  for (const r of rs) reasonCount[r] = (reasonCount[r] || 0) + 1;
  if (rs.length === 1) soleReasonCount[rs[0]] = (soleReasonCount[rs[0]] || 0) + 1;
}
report.reasons = { any: reasonCount, sole: soleReasonCount };
console.log("\n=== index 理由（重複カウント / その理由だけで残る件数） ===");
for (const r of ["ssg", "monthly-top-fish", "sea-popular", "pref-info", "pref-info-alias", "unagi-summer"]) {
  console.log(`${r.padEnd(18)} any=${String(reasonCount[r] || 0).padStart(5)}  sole=${String(soleReasonCount[r] || 0).padStart(5)}`);
}

// ── 3. 救済件数 ──────────────────────────────────────────────────
const unagiSummer = indexable.filter((c) => c.fishSlug === "unagi" && ["june", "july", "august"].includes(c.monthSlug));
const unagiAll = eligible.filter((c) => c.fishSlug === "unagi");
const aliasOnly = indexable.filter((c) => {
  const rs = rt.explainPrefMonthFishDemand(c.prefSlug, c.monthSlug, c.fishSlug);
  return rs.includes("pref-info-alias") && !rs.some((r) => r !== "pref-info-alias");
});
const aliasOnlyByFish = {};
for (const c of aliasOnly) aliasOnlyByFish[c.fishSlug] = (aliasOnlyByFish[c.fishSlug] || 0) + 1;
report.rescue = {
  unagiSummer: unagiSummer.length,
  unagiEligibleAll: unagiAll.length,
  prefInfoAliasOnly: aliasOnly.length,
  prefInfoAliasOnlyByFish: aliasOnlyByFish,
};
console.log("\n=== 救済件数 ===");
console.log(`ウナギ夏(6-8月) index: ${unagiSummer.length} 件（ウナギ配信ページ全体 ${unagiAll.length} 件）`);
console.log(`prefecture-info 別名/総称解決だけで残る: ${aliasOnly.length} 件`, aliasOnlyByFish);

// ── 4. 魚種別維持率（配信件数 上位20） ────────────────────────────
const perFish = new Map();
for (const c of eligible) {
  const s = perFish.get(c.fishSlug) || { before: 0, after: 0 };
  s.before++;
  if (indexableKeys.has(key(c))) s.after++;
  perFish.set(c.fishSlug, s);
}
const perFishRows = [...perFish.entries()]
  .map(([slug, s]) => ({
    slug,
    name: fishBySlug.get(slug)?.name,
    category: fishBySlug.get(slug)?.category,
    popularity: fishBySlug.get(slug)?.popularity ?? null,
    ...s,
    keep: s.before ? s.after / s.before : 0,
  }))
  .sort((a, b) => b.before - a.before);
report.perFish = perFishRows;
console.log("\n=== 魚種別維持率（配信件数 上位20） ===");
console.log("slug".padEnd(14), "name".padEnd(10), "cat".padEnd(11), "pop", "before", "after", "keep");
for (const r of perFishRows.slice(0, 20)) {
  console.log(
    r.slug.padEnd(14),
    String(r.name).padEnd(10),
    String(r.category).padEnd(11),
    String(r.popularity).padStart(3),
    String(r.before).padStart(6),
    String(r.after).padStart(5),
    pct(r.after, r.before).padStart(7)
  );
}
const keyFish = ["aji", "tachiuo", "aoriika", "kisu", "madako", "suzuki", "kurodai"];
console.log(
  "\n主要魚種の維持率:",
  keyFish
    .map((s) => {
      const r = perFish.get(s);
      return `${s}=${r ? pct(r.after, r.before) : "n/a"}`;
    })
    .join(" ")
);

// ── 5. noindex 化の内訳 ──────────────────────────────────────────
const dropped = eligible.filter((c) => !indexableKeys.has(key(c)));
const droppedByCat = {};
const droppedByFish = {};
for (const c of dropped) {
  const f = fishBySlug.get(c.fishSlug);
  const cat = f?.category ?? "unknown";
  droppedByCat[cat] = (droppedByCat[cat] || 0) + 1;
  droppedByFish[c.fishSlug] = (droppedByFish[c.fishSlug] || 0) + 1;
}
report.dropped = {
  byCategory: droppedByCat,
  byFishTop: Object.entries(droppedByFish)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30),
};
console.log("\n=== noindex,follow 化される組合せ ===");
console.log("カテゴリ別:", droppedByCat);
console.log(
  "魚種別 上位15:",
  report.dropped.byFishTop
    .slice(0, 15)
    .map(([s, n]) => `${s}(pop${fishBySlug.get(s)?.popularity ?? "-"})=${n}`)
    .join(" ")
);

// ── 6. topFish 実在チェック ───────────────────────────────────────
const badTopFish = [];
for (const g of rt.monthlyGuides) for (const s of g.topFish) if (!fishBySlug.has(s)) badTopFish.push(`${g.slug}:${s}`);
report.badTopFish = badTopFish;
console.log("\n=== monthlyGuides.topFish 無効slug ===", badTopFish.length === 0 ? "なし" : badTopFish);

// ── 7. スポット 3 ティア（enrichDescriptions 後の実行時値） ─────────
let noindexTier = 0;
let midTier = 0;
let sitemapTier = 0;
let midFishOnly = 0;
let midDescOnly = 0;
let midBoth = 0;
for (const s of rt.fishingSpots) {
  if (rt.isLowQualitySpot(s)) noindexTier++;
  else if (rt.isSitemapEligible(s)) sitemapTier++;
  else {
    midTier++;
    const fishLow = s.catchableFish.length < 2;
    const descLow = (s.description || "").length < 100;
    if (fishLow && descLow) midBoth++;
    else if (fishLow) midFishOnly++;
    else if (descLow) midDescOnly++;
  }
}
report.spotTiers = {
  noindex: noindexTier,
  middle: midTier,
  sitemap: sitemapTier,
  middleCauses: { fishLt2Only: midFishOnly, descLt100Only: midDescOnly, both: midBoth },
};
console.log("\n=== スポット詳細 3ティア（実行時値） ===");
console.log(
  `noindex帯=${noindexTier} 中間帯=${midTier} sitemap帯=${sitemapTier} / 中間帯の原因: 魚種<2のみ=${midFishOnly} description<100のみ=${midDescOnly} 両方=${midBoth}`
);

const jsonIdx = process.argv.indexOf("--json");
if (jsonIdx >= 0) {
  const out = path.resolve(ROOT, process.argv[jsonIdx + 1] || "scripts/output/matrix-index-audit.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nJSON 出力: ${out}`);
}
