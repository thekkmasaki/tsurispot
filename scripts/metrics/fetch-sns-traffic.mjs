#!/usr/bin/env node
// GA4 Data API から SNS 流入(source/medium/campaign)を集計する。
// makeUrl の utm_source=twitter|line|instagram / utm_medium=social / utm_campaign=<投稿種別>
// を分解し、「どのSNS・どの投稿がサイト流入を生んだか」を可視化する（投稿→流入ループを閉じる）。
//
// 必要: SA鍵 + GA4プロパティに閲覧者追加 + config.site.ga4PropertyId。
// 単体実行: node scripts/metrics/fetch-sns-traffic.mjs
// import:   import { fetchSnsTraffic } from "./fetch-sns-traffic.mjs"

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAccessToken, googleApiFetch } from "./lib/google-auth.mjs";
import { ymd, addDays } from "./lib/dates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8"));
}

// SNS 判定: medium=social、または source が主要SNSの名称/ドメイン。
// ※ "t.co" を部分一致にすると chatgpt.com / copilot.com が誤検出されるため、
//   名称は完全一致・ドメインは末尾一致で厳密に判定する。
const SNS_SOURCE_NAMES = new Set([
  "twitter", "x", "instagram", "ig", "line", "facebook", "fb",
]);
const SNS_DOMAIN_RE = /(^|\.)(t\.co|x\.com|twitter\.com|instagram\.com|facebook\.com|line\.me|linktr\.ee)$/;
export function isSns(source, medium) {
  const m = (medium || "").toLowerCase();
  if (m === "social" || m === "social-network" || m === "sns") return true;
  const s = (source || "").toLowerCase().trim();
  if (SNS_SOURCE_NAMES.has(s)) return true;
  return SNS_DOMAIN_RE.test(s);
}

export async function fetchSnsTraffic(cfg = loadConfig()) {
  const propertyId = cfg.site.ga4PropertyId;
  if (!propertyId) throw new Error("config.site.ga4PropertyId(数値プロパティID) が未設定です");
  const lookbackDays = cfg.metrics?.lookbackDays || 28;
  const endDate = ymd(addDays(new Date(), -1));
  const startDate = ymd(addDays(new Date(), -lookbackDays));

  const token = await getAccessToken(SCOPE);
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  // source / medium / campaign 別のセッション・ユーザー・エンゲージ率
  const report = await googleApiFetch(url, token, {
    method: "POST",
    body: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
        { name: "sessionCampaignName" },
      ],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "engagementRate" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 2000,
    },
  });

  const rows = [];
  for (const row of report.rows || []) {
    const source = row.dimensionValues[0].value;
    const medium = row.dimensionValues[1].value;
    const campaign = row.dimensionValues[2].value;
    const sessions = Number(row.metricValues[0].value) || 0;
    const users = Number(row.metricValues[1].value) || 0;
    const engagementRate = +(Number(row.metricValues[2].value) || 0).toFixed(4);
    rows.push({ source, medium, campaign, sessions, users, engagementRate, sns: isSns(source, medium) });
  }

  const snsRows = rows.filter((r) => r.sns);
  const totalSessions = rows.reduce((s, r) => s + r.sessions, 0);
  const snsSessions = snsRows.reduce((s, r) => s + r.sessions, 0);

  // SNS 別（source）集計
  const bySource = {};
  for (const r of snsRows) {
    bySource[r.source] = (bySource[r.source] || 0) + r.sessions;
  }
  // キャンペーン別（投稿種別）集計 — (not set) は除く
  const byCampaign = {};
  for (const r of snsRows) {
    if (!r.campaign || r.campaign === "(not set)") continue;
    byCampaign[r.campaign] = (byCampaign[r.campaign] || 0) + r.sessions;
  }

  return {
    source: "ga4-sns",
    startDate,
    endDate,
    totalSessions,
    snsSessions,
    snsShare: totalSessions ? +(snsSessions / totalSessions).toFixed(4) : 0,
    bySource,
    byCampaign,
    snsRows,
  };
}

// 単体実行
if (process.argv[1]?.endsWith("fetch-sns-traffic.mjs")) {
  fetchSnsTraffic()
    .then((d) => {
      console.log(`SNS流入 期間 ${d.startDate}〜${d.endDate}`);
      console.log(`全セッション ${d.totalSessions} / SNS ${d.snsSessions}（${(d.snsShare * 100).toFixed(1)}%）`);
      const src = Object.entries(d.bySource).sort((a, b) => b[1] - a[1]);
      console.log("▼ SNS別:");
      if (src.length === 0) console.log("  （SNS流入なし）");
      for (const [s, n] of src) console.log(`  ${n}\t${s}`);
      const camp = Object.entries(d.byCampaign).sort((a, b) => b[1] - a[1]);
      console.log("▼ キャンペーン(投稿種別)別:");
      if (camp.length === 0) console.log("  （utm_campaign付き流入なし）");
      for (const [c, n] of camp) console.log(`  ${n}\t${c}`);
    })
    .catch((e) => { console.error("SNS流入取得失敗:", e.message); process.exit(1); });
}
