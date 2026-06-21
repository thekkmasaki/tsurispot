#!/usr/bin/env node
// Google Search Console Search Analytics API から検索パフォーマンスを取得する。
// dimensions=["page"] と ["page","query"] の2回叩き、正規化して返す。
//
// 必要: SA鍵 + GSCで該当SAに「制限付き」権限付与。
// 単体実行: node scripts/metrics/fetch-gsc.mjs   (要約をstdout)
// import:   import { fetchGsc } from "./fetch-gsc.mjs"

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getAccessToken, googleApiFetch } from "./lib/google-auth.mjs";
import { classify, toPathKey } from "./lib/classify-url.mjs";
import { ymd, addDays } from "./lib/dates.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8"));
}

export async function fetchGsc(cfg = loadConfig()) {
  const { gscSiteUrl } = cfg.site;
  if (!gscSiteUrl) throw new Error("config.site.gscSiteUrl が未設定です");
  const { lookbackDays, gscLagDays } = cfg.metrics;

  const endDate = ymd(addDays(new Date(), -gscLagDays)); // GSCは約2日遅延
  const startDate = ymd(addDays(new Date(), -gscLagDays - lookbackDays));

  const token = await getAccessToken(SCOPE);
  const base = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscSiteUrl)}/searchAnalytics/query`;

  async function query(dimensions) {
    const rows = [];
    let startRow = 0;
    const ROW_LIMIT = 25000;
    // ページネーション(最大4ページ=10万行で打ち切り)
    for (let page = 0; page < 4; page++) {
      const json = await googleApiFetch(base, token, {
        method: "POST",
        body: { startDate, endDate, dimensions, rowLimit: ROW_LIMIT, startRow, type: "web" },
      });
      const batch = json.rows || [];
      rows.push(...batch);
      if (batch.length < ROW_LIMIT) break;
      startRow += ROW_LIMIT;
    }
    return rows;
  }

  // 1) ページ単位
  const pageRows = await query(["page"]);
  const pages = {};
  for (const r of pageRows) {
    const url = r.keys[0];
    const pathKey = toPathKey(url);
    pages[pathKey] = {
      url,
      ...classify(url),
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: +(100 * (r.ctr || 0)).toFixed(3), // %表記
      position: +(r.position || 0).toFixed(2),
    };
  }

  // 2) ページ×クエリ単位
  const pqRows = await query(["page", "query"]);
  const queries = pqRows.map((r) => ({
    page: toPathKey(r.keys[0]),
    query: r.keys[1],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: +(100 * (r.ctr || 0)).toFixed(3),
    position: +(r.position || 0).toFixed(2),
  }));

  return { source: "gsc", startDate, endDate, pages, queries };
}

// 単体実行
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("fetch-gsc.mjs")) {
  fetchGsc()
    .then((d) => {
      const n = Object.keys(d.pages).length;
      console.log(`GSC取得OK: 期間 ${d.startDate}〜${d.endDate} / ページ ${n} / クエリ ${d.queries.length}`);
      const top = Object.values(d.pages).sort((a, b) => b.impressions - a.impressions).slice(0, 10);
      for (const p of top) console.log(`  imp${p.impressions}\tpos${p.position}\tctr${p.ctr}%\t${p.type}\t${p.url}`);
    })
    .catch((e) => { console.error("GSC取得失敗:", e.message); process.exit(1); });
}
