#!/usr/bin/env node
// テンプレ改善レーン用の分析。GSC指標を「ページタイプ別」に集計し、テンプレ生成系
// (pSEO: 都道府県×月×魚種, 月×地域, 釣り方×地域 等)の中で伸びしろが大きい型を出す。
//
// 個別ページ(record-backed)は per-page レーンが担当。こちらは「テンプレ1編集で
// 同型の全N百ページが改善する」最高レバレッジを狙うための型別集計。
//
// 実行: node scripts/metrics/template-opportunities.mjs
// 出力: memory/metrics/template-opportunities.json + サマリ

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classify, expectedCtr } from "./lib/classify-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const METRICS = path.join(REPO_ROOT, "memory", "metrics");

// テンプレ生成系(pSEO)＝1編集で同型の全ページが変わる型。これらがテンプレ改善レーンの対象。
// record-backed(spot-detail/fish/blog/other:shops)は per-page レーン担当なので除外。
const TEMPLATE_TYPES = new Set([
  "pref-month-fish", "pref-month", "pref-fish", "pref-method", "method-area",
  "seasonal", "monthly", "spot-type", "area", "pref-hub",
]);

// 型→テンプレ(generateMetadataを持つ)ファイルの手がかり。エージェントが該当page.tsxを特定する起点。
const TEMPLATE_FILE_HINT = {
  "pref-month-fish": "src/app/prefecture/[slug]/[month]/[fishSlug]/page.tsx",
  "pref-month": "src/app/prefecture/[slug]/[month]/page.tsx",
  "pref-fish": "src/app/prefecture/[slug]/fish/[fishSlug]/page.tsx",
  "pref-method": "src/app/prefecture/[slug]/fishing/[methodSlug]/page.tsx",
  "method-area": "src/app/fishing/[method]/ 配下の page.tsx (area/[region] や [month])",
  seasonal: "src/app/seasonal/[month]/[regionGroup]/page.tsx または seasonal/[month]/page.tsx",
  monthly: "src/app/monthly/[slug]/page.tsx",
  "spot-type": "src/app/spot-type/[type]/[pref]/page.tsx または spot-type/[type]/page.tsx",
  area: "src/app/area/[slug]/page.tsx",
  "pref-hub": "src/app/prefecture/[slug]/page.tsx",
};

function loadConfig() { return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8")); }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } }

function main() {
  const cfg = loadConfig();
  const latest = readJsonSafe(path.join(METRICS, "latest.json"));
  if (!latest) { console.error("latest.json なし → 先に fetch-all.mjs を実行"); process.exit(1); }

  const agg = {}; // type -> { pages, impressions, clicks, posWeighted, posDenom }
  for (const [, m] of Object.entries(latest.pages)) {
    const type = m.type || classify(m.url || "").type;
    if (!TEMPLATE_TYPES.has(type)) continue;
    const a = (agg[type] ||= { type, pages: 0, impressions: 0, clicks: 0, posWeighted: 0, posDenom: 0 });
    a.pages++;
    a.impressions += m.impressions || 0;
    a.clicks += m.clicks || 0;
    if (m.position && m.impressions) { a.posWeighted += m.position * m.impressions; a.posDenom += m.impressions; }
  }

  const rows = Object.values(agg).map((a) => {
    const avgPosition = a.posDenom ? +(a.posWeighted / a.posDenom).toFixed(2) : 0;
    const ctr = a.impressions ? +(100 * a.clicks / a.impressions).toFixed(3) : 0;
    const ctrGap = avgPosition ? Math.max(0, +(expectedCtr(avgPosition) - ctr).toFixed(2)) : 0;
    // 機会スコア = 総表示 × CTRギャップ。テンプレ改善1発で効く規模を表す。
    const opportunity = Math.round(a.impressions * Math.max(ctrGap, 0.1));
    return {
      type: a.type, pages: a.pages, impressions: a.impressions, clicks: a.clicks,
      ctr, avgPosition, ctrGap, opportunity,
      templateFile: TEMPLATE_FILE_HINT[a.type] || `src/app/ 配下(${a.type})`,
    };
  }).sort((x, y) => y.opportunity - x.opportunity);

  const out = { generatedAt: new Date().toISOString(), basedOnWeek: latest.week, items: rows };
  const outPath = path.join(METRICS, "template-opportunities.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

  console.log(`テンプレ改善 機会分析 [${latest.week}]`);
  console.log("type".padEnd(16), "ページ".padStart(6), "総表示".padStart(8), "CTR".padStart(7), "平均順位".padStart(8), "CTRギャップ".padStart(10), "機会".padStart(9));
  for (const r of rows) {
    console.log(
      r.type.padEnd(16), String(r.pages).padStart(6), String(r.impressions).padStart(8),
      `${r.ctr}%`.padStart(7), String(r.avgPosition).padStart(8), `${r.ctrGap}pt`.padStart(10), String(r.opportunity).padStart(9),
    );
  }
  console.log(`\n→ ${path.relative(REPO_ROOT, outPath)}`);
  if (rows[0]) console.log(`\n最優先テンプレ: ${rows[0].type}（${rows[0].pages}ページ・機会${rows[0].opportunity}）→ ${rows[0].templateFile}`);
}

main();
