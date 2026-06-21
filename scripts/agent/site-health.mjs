#!/usr/bin/env node
// サイト全体KPIのサーキットブレーカー。個別ページの最適化がサイト合計を静かに
// 毀損する『じわ損』(カニバリ・品質低下)を検知し、悪化していたら新規改善を止める。
//
// 直近スナップショット(latest.json)と前週GSCファイルを比較し、サイト全体の
// 総クリック/総impression/平均掲載順位/総affiliateClick の前週比を見る。
//
// CLI:
//   node scripts/agent/site-health.mjs           # 0=健全 / 10=リグレッション(改善を止めるべき)
//   node scripts/agent/site-health.mjs --json

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const METRICS = path.join(REPO_ROOT, "memory", "metrics");

function loadConfig() { return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8")); }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } }

function aggregate(pagesObj) {
  let clicks = 0, impressions = 0, posWeighted = 0, posDenom = 0, affiliate = 0;
  for (const m of Object.values(pagesObj || {})) {
    clicks += m.clicks || 0;
    impressions += m.impressions || 0;
    affiliate += m.affiliateClicks || 0;
    if (m.position) { posWeighted += (m.position) * (m.impressions || 1); posDenom += (m.impressions || 1); }
  }
  return { clicks, impressions, affiliate, avgPosition: posDenom ? +(posWeighted / posDenom).toFixed(2) : 0 };
}

function loadPrevGsc(currentWeek) {
  const dir = path.join(METRICS, "gsc");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json") && !f.includes(currentWeek)).sort();
  if (!files.length) return null;
  return readJsonSafe(path.join(dir, files[files.length - 1]));
}

const cfg = loadConfig();
const stopPct = cfg.siteHealth?.regressionStopPct ?? 8;
const latest = readJsonSafe(path.join(METRICS, "latest.json"));

if (!latest) {
  console.error("latest.json なし → 健全性判定不能(改善は控える)");
  if (process.argv.includes("--json")) console.log(JSON.stringify({ status: "no-data", tripped: true }));
  process.exit(10);
}

const cur = aggregate(latest.pages);
const prevFile = loadPrevGsc(latest.week);
const prev = prevFile ? aggregate(prevFile.pages) : null;

const result = { week: latest.week, current: cur, previous: prev, deltas: null, tripped: false, reasons: [] };

if (prev) {
  const pct = (now, before) => (before > 0 ? +(100 * (now - before) / before).toFixed(1) : 0);
  const d = {
    clicksPct: pct(cur.clicks, prev.clicks),
    impressionsPct: pct(cur.impressions, prev.impressions),
    affiliatePct: pct(cur.affiliate, prev.affiliate),
    // 掲載順位は小さいほど良い → 上昇(悪化)を正の悪化%に
    positionWorsenPct: prev.avgPosition > 0 ? +(100 * (cur.avgPosition - prev.avgPosition) / prev.avgPosition).toFixed(1) : 0,
  };
  result.deltas = d;
  if (d.clicksPct <= -stopPct) result.reasons.push(`総クリック ${d.clicksPct}%`);
  if (d.impressionsPct <= -stopPct) result.reasons.push(`総impression ${d.impressionsPct}%`);
  if (d.affiliatePct <= -stopPct) result.reasons.push(`総affiliateClick ${d.affiliatePct}%`);
  if (d.positionWorsenPct >= stopPct) result.reasons.push(`平均掲載順位 +${d.positionWorsenPct}%悪化`);
  result.tripped = result.reasons.length > 0;
} else {
  result.reasons.push("前週データなし(初回)→比較不能");
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`サイト健全性 [${latest.week}] tripped=${result.tripped}`);
  if (result.deltas) console.log(`  前週比: clicks ${result.deltas.clicksPct}% / impr ${result.deltas.impressionsPct}% / aff ${result.deltas.affiliatePct}% / 順位悪化 ${result.deltas.positionWorsenPct}%`);
  if (result.reasons.length) console.log(`  理由: ${result.reasons.join(" / ")}`);
}
// 初回(前週なし)は閾値超過ではないので止めない(tripped=false)。明確な悪化のみ 10。
process.exit(result.tripped ? 10 : 0);
