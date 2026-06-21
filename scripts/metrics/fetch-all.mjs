#!/usr/bin/env node
// GA4 と GSC を取得し、ISO週キーで memory/metrics/ に保存、latest.json を更新する。
// 片方が失敗しても取得できた方は保存する(フェイルソフト)。
// 実行: node scripts/metrics/fetch-all.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchGsc } from "./fetch-gsc.mjs";
import { fetchGa4 } from "./fetch-ga4.mjs";
import { isoWeekKey } from "./lib/dates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const METRICS_DIR = path.join(REPO_ROOT, "memory", "metrics");

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8"));
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function writeJson(p, obj) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

async function main() {
  const cfg = loadConfig();
  const week = isoWeekKey(new Date());
  const fetchedAt = new Date().toISOString();
  const errors = [];

  let gsc = null, ga4 = null;
  try { gsc = await fetchGsc(cfg); } catch (e) { errors.push(`GSC: ${e.message.split("\n")[0]}`); }
  try { ga4 = await fetchGa4(cfg); } catch (e) { errors.push(`GA4: ${e.message.split("\n")[0]}`); }

  if (gsc) writeJson(path.join(METRICS_DIR, "gsc", `${week}.json`), { week, fetchedAt, ...gsc });
  if (ga4) writeJson(path.join(METRICS_DIR, "ga4", `${week}.json`), { week, fetchedAt, ...ga4 });

  // 統合スナップショット: ページパスをキーに GSC + GA4 をマージ
  const merged = {};
  if (gsc) {
    for (const [p, v] of Object.entries(gsc.pages)) {
      merged[p] = {
        url: v.url, type: v.type,
        clicks: v.clicks, impressions: v.impressions, ctr: v.ctr, position: v.position,
        pageviews: 0, affiliateClicks: 0, engagementRate: 0,
      };
    }
  }
  if (ga4) {
    for (const [p, v] of Object.entries(ga4.pages)) {
      merged[p] = {
        ...(merged[p] || { url: cfg.site.baseUrl + p, type: null, clicks: 0, impressions: 0, ctr: 0, position: 0 }),
        pageviews: v.pageviews,
        affiliateClicks: v.affiliateClicks,
        engagementRate: v.engagementRate,
      };
    }
  }

  const latest = {
    week, fetchedAt,
    range: { gsc: gsc && { startDate: gsc.startDate, endDate: gsc.endDate }, ga4: ga4 && { startDate: ga4.startDate, endDate: ga4.endDate } },
    sources: { gsc: !!gsc, ga4: !!ga4 },
    errors,
    pageCount: Object.keys(merged).length,
    pages: merged,
    queries: gsc ? gsc.queries : [],
  };
  writeJson(path.join(METRICS_DIR, "latest.json"), latest);

  console.log(`保存完了: week=${week} / ページ ${latest.pageCount} / GSC=${!!gsc} GA4=${!!ga4}`);
  if (errors.length) {
    console.error("⚠ 一部取得失敗:", errors.join(" | "));
    // 両方失敗なら異常終了
    if (!gsc && !ga4) process.exit(1);
  }
}

main().catch((e) => { console.error("fetch-all 致命的エラー:", e.message); process.exit(1); });
