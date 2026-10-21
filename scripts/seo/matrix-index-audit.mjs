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
 *                                              [--gsc tmp/gsc-matrix-12w.json]
 *
 * --gsc: GSC のマトリクスページ実測（{range, rows:[{pref,month,fish,clicks,impressions,position}]}）を
 *        突き合わせ、現ルールで noindex になる組合せが失う clicks/impressions と魚種別 Top20、
 *        および候補ルール（淡水 popularity 上限 / seasonalFish 通年 / topFish ±1 月）ごとの
 *        index 件数と損失を一覧化する（ルール調整の根拠出し）。
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
            explainPrefMonthFishDemandWith,
            isDemandPrefMonthFish,
            MATRIX_DEMAND_RULE,
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

// ── 8. GSC 実測との突き合わせ（--gsc） ────────────────────────────
const gscIdx = process.argv.indexOf("--gsc");
if (gscIdx >= 0) {
  const gscPath = path.resolve(ROOT, process.argv[gscIdx + 1]);
  const gsc = JSON.parse(fs.readFileSync(gscPath, "utf8"));
  const gscByKey = new Map();
  for (const r of gsc.rows) {
    const k = `${r.pref}/${r.month}/${r.fish}`;
    const cur = gscByKey.get(k) || { clicks: 0, impressions: 0 };
    cur.clicks += r.clicks;
    cur.impressions += r.impressions;
    gscByKey.set(k, cur);
  }
  const totalClicks = gsc.rows.reduce((a, r) => a + r.clicks, 0);
  const totalImpr = gsc.rows.reduce((a, r) => a + r.impressions, 0);
  const eligibleKeySet = new Set(eligible.map(key));
  const gscOutsideEligible = [...gscByKey.keys()].filter((k) => !eligibleKeySet.has(k));
  console.log(`\n=== GSC 実測 ${gsc.range}: ${gsc.rows.length} 行 / clicks ${totalClicks} / impr ${totalImpr} ===`);
  console.log(
    `配信セット外の GSC 行（301 済み等）: ${gscOutsideEligible.length} 行 / clicks ${gscOutsideEligible.reduce((a, k) => a + gscByKey.get(k).clicks, 0)}`
  );

  /** ルールで noindex になる配信組合せの損失を集計 */
  const evaluate = (rule) => {
    let indexCount = 0;
    let lostClicks = 0;
    let lostImpr = 0;
    const lostByFish = new Map();
    for (const c of eligible) {
      const demand = rt.explainPrefMonthFishDemandWith(rule, c.prefSlug, c.monthSlug, c.fishSlug).length > 0;
      if (demand) {
        indexCount++;
        continue;
      }
      const g = gscByKey.get(key(c));
      if (!g) continue;
      lostClicks += g.clicks;
      lostImpr += g.impressions;
      const f = lostByFish.get(c.fishSlug) || { pages: 0, clicks: 0, impressions: 0 };
      f.pages++;
      f.clicks += g.clicks;
      f.impressions += g.impressions;
      lostByFish.set(c.fishSlug, f);
    }
    return { indexCount, lostClicks, lostImpr, lostByFish };
  };

  const current = evaluate(rt.MATRIX_DEMAND_RULE);
  console.log("\n--- 現ルール", JSON.stringify(rt.MATRIX_DEMAND_RULE));
  console.log(
    `index ${current.indexCount} / noindex ${eligible.length - current.indexCount} → 失う clicks ${current.lostClicks} (${pct(current.lostClicks, totalClicks)}) / impr ${current.lostImpr} (${pct(current.lostImpr, totalImpr)})`
  );
  console.log("失う clicks 魚種別 Top20:");
  const lostRows = [...current.lostByFish.entries()]
    .map(([slug, v]) => ({
      slug,
      name: fishBySlug.get(slug)?.name,
      category: fishBySlug.get(slug)?.category,
      popularity: fishBySlug.get(slug)?.popularity ?? null,
      ...v,
    }))
    .sort((a, b) => b.clicks - a.clicks);
  for (const r of lostRows.slice(0, 20)) {
    console.log(
      r.slug.padEnd(14),
      String(r.name).padEnd(8),
      String(r.category).padEnd(11),
      `pop${String(r.popularity).padStart(2)}`,
      `pages=${String(r.pages).padStart(3)}`,
      `clicks=${String(r.clicks).padStart(4)}`,
      `impr=${String(r.impressions).padStart(5)}`
    );
  }
  report.gsc = {
    range: gsc.range,
    totalClicks,
    totalImpr,
    current: { ...current, lostByFish: lostRows },
  };

  // 候補ルールのグリッド試算
  // 候補ルールのグリッド試算（海水上限 × 淡水上限 × seasonalFish 通年 × topFish ±1 月）
  console.log("\n--- 候補ルール試算（損失 clicks ≤ 2% を満たす最小 index 件数を探す。表示は損失 ≤ 3% の行のみ） ---");
  console.log("seaPopMax fwPopMax seasonAllYear topFish± | index  noindex | lostClicks(%)   lostImpr(%)");
  const candidates = [];
  for (const seaPopularityMax of [30, 35, 40, 45, 50, 60, 999]) {
    for (const topFishAdjacentMonths of [0, 1]) {
      for (const seasonalFishAllYear of [false, true]) {
        for (const freshwaterPopularityMax of [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 20, 26]) {
          const rule = { seaPopularityMax, freshwaterPopularityMax, seasonalFishAllYear, topFishAdjacentMonths };
          const r = evaluate(rule);
          candidates.push({ rule, indexCount: r.indexCount, lostClicks: r.lostClicks, lostImpr: r.lostImpr });
          if (r.lostClicks > totalClicks * 0.03) continue;
          console.log(
            String(seaPopularityMax).padStart(9),
            String(freshwaterPopularityMax).padStart(8),
            String(seasonalFishAllYear).padStart(13),
            String(topFishAdjacentMonths).padStart(8),
            "|",
            String(r.indexCount).padStart(5),
            String(eligible.length - r.indexCount).padStart(8),
            "|",
            `${String(r.lostClicks).padStart(5)} (${pct(r.lostClicks, totalClicks).padStart(5)})`,
            `${String(r.lostImpr).padStart(7)} (${pct(r.lostImpr, totalImpr).padStart(5)})`
          );
        }
      }
    }
  }
  const ok = candidates
    .filter((c) => c.lostClicks <= totalClicks * 0.02)
    .sort((a, b) => a.indexCount - b.indexCount || a.lostClicks - b.lostClicks);
  console.log("\n損失 ≤2% を満たす候補（index 件数の少ない順 Top8）:");
  for (const c of ok.slice(0, 8)) {
    console.log(`  ${JSON.stringify(c.rule)} → index ${c.indexCount} / lost clicks ${c.lostClicks} (${pct(c.lostClicks, totalClicks)}) / impr ${c.lostImpr}`);
  }
  report.gsc.candidates = candidates;
}

const jsonIdx = process.argv.indexOf("--json");
if (jsonIdx >= 0) {
  const out = path.resolve(ROOT, process.argv[jsonIdx + 1] || "scripts/output/matrix-index-audit.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`\nJSON 出力: ${out}`);
}
