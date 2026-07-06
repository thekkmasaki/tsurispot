#!/usr/bin/env node
// GA4 Data API (runReport) からページ別の PV / ユーザー / エンゲージメント、
// および affiliate_click イベント数(収益の代理指標)を取得する。
//
// 必要: SA鍵 + GA4プロパティのアクセス管理でSAを「閲覧者」追加 + config.site.ga4PropertyId(数値)。
// 単体実行: node scripts/metrics/fetch-ga4.mjs
// import:   import { fetchGa4 } from "./fetch-ga4.mjs"

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAccessToken, googleApiFetch } from "./lib/google-auth.mjs";
import { toPathKey } from "./lib/classify-url.mjs";
import { ymd, addDays } from "./lib/dates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8"));
}

export async function fetchGa4(cfg = loadConfig()) {
  const propertyId = cfg.site.ga4PropertyId;
  if (!propertyId) throw new Error("config.site.ga4PropertyId(数値プロパティID) が未設定です");
  const { lookbackDays } = cfg.metrics;
  const endDate = ymd(addDays(new Date(), -1));
  const startDate = ymd(addDays(new Date(), -lookbackDays));

  const token = await getAccessToken(SCOPE);
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  // 1) ページ別 PV/ユーザー/エンゲージメント
  const mainReport = await googleApiFetch(url, token, {
    method: "POST",
    body: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "pagePath" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "activeUsers" },
        { name: "engagementRate" },
        { name: "userEngagementDuration" },
      ],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 100000,
    },
  });

  const pages = {};
  for (const row of mainReport.rows || []) {
    const p = toPathKey(row.dimensionValues[0].value);
    const m = row.metricValues;
    const pageviews = Number(m[0].value) || 0;
    const activeUsers = Number(m[1].value) || 0;
    // 1ユーザーあたりPVが異常に高いページはJS実行型ボットの連打が疑われる（非破壊フラグ）。
    // 生PV/ユーザーは改変せず、下流の集計側で重み付け・除外の判断材料にする。
    const pvPerUser = +(pageviews / Math.max(activeUsers, 1)).toFixed(1);
    pages[p] = {
      pageviews,
      activeUsers,
      engagementRate: +(Number(m[2].value) || 0).toFixed(4),
      engagementDuration: Math.round(Number(m[3].value) || 0),
      affiliateClicks: 0,
      pvPerUser,
      ...(pvPerUser > 30 && pageviews > 500 ? { suspicious: true } : {}),
    };
  }

  // 2) affiliate_click イベント数(ページ別) — 収益の代理指標
  try {
    const affReport = await googleApiFetch(url, token, {
      method: "POST",
      body: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "affiliate_click" } },
        },
        limit: 100000,
      },
    });
    for (const row of affReport.rows || []) {
      const p = toPathKey(row.dimensionValues[0].value);
      const clicks = Number(row.metricValues[0].value) || 0;
      if (!pages[p]) pages[p] = { pageviews: 0, activeUsers: 0, engagementRate: 0, engagementDuration: 0, affiliateClicks: 0, pvPerUser: 0 };
      pages[p].affiliateClicks = clicks;
    }
  } catch (e) {
    // affiliate_click がカスタムイベント未登録だと失敗しうる。本流は止めず警告のみ。
    console.error("⚠ affiliate_click 取得スキップ:", e.message.split("\n")[0]);
  }

  return { source: "ga4", startDate, endDate, pages };
}

// 単体実行
if (process.argv[1]?.endsWith("fetch-ga4.mjs")) {
  fetchGa4()
    .then((d) => {
      const n = Object.keys(d.pages).length;
      const totalAff = Object.values(d.pages).reduce((s, p) => s + p.affiliateClicks, 0);
      console.log(`GA4取得OK: 期間 ${d.startDate}〜${d.endDate} / ページ ${n} / affiliate_click合計 ${totalAff}`);
      const top = Object.entries(d.pages).sort((a, b) => b[1].pageviews - a[1].pageviews).slice(0, 10);
      for (const [p, m] of top) console.log(`  pv${m.pageviews}\taff${m.affiliateClicks}\teng${(m.engagementRate * 100).toFixed(0)}%\t${p}`);
    })
    .catch((e) => { console.error("GA4取得失敗:", e.message); process.exit(1); });
}
