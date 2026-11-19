#!/usr/bin/env node
// 本番 HTTP smoke（デプロイ後 ＋ 定期監視）。依存なし（Node 20 の fetch のみ）。
//
// なぜ必要か:
//   2026-11-14 21:31 UTC〜 UGC釣果投稿のあるスポット詳細が本番で 500 になっていた（#596 起因・#602 で修正）が、
//   既存の Playwright smoke（/spots 一覧・管理釣り場1件のみ）は成功のままで、偶然見つかった。
//   そこで「壊れやすいテンプレートの代表URL」を広く、かつ 2 通りの見方で確認する。
//
// 各URLを 2 回確認する:
//   1) ?smoke=<run_id> 付き … Cloudflare のキャッシュキーが変わるのでエッジを素通りしてオリジン（新版）を確認
//   2) クエリ無し         … 実ユーザー/Googlebot が見るエッジの状態を確認（5xx がキャッシュされて残っていないか）
//      /spots 等は s-maxage=7日でエッジに載るため、2) だけだと古いキャッシュを見て障害を見逃し、
//      1) だけだとエッジに焼き付いた 5xx を見逃す。
//
// Cloudflare 対策: ブラウザ相当の UA を使い、リクエスト間に間隔を空ける。429 は失敗扱いにせずリトライする。
//
// 使い方:
//   node scripts/smoke-http-check.mjs                         # https://tsurispot.com を確認
//   SMOKE_BASE_URL=https://tsurispot.com SMOKE_RUN_ID=123 node scripts/smoke-http-check.mjs
// 終了コード: 0=全項目OK / 1=失敗あり。GITHUB_STEP_SUMMARY があれば結果表を書き出す。
// 失敗内容は SMOKE_REPORT_FILE（既定: smoke-report.md）にも書き出す（Issue 本文に使う）。

import { appendFileSync, writeFileSync } from "node:fs";

const BASE = (process.env.SMOKE_BASE_URL || "https://tsurispot.com").replace(/\/$/, "");
const RUN_ID = process.env.SMOKE_RUN_ID || String(Date.now());
const REPORT_FILE = process.env.SMOKE_REPORT_FILE || "smoke-report.md";
const GAP_MS = Number(process.env.SMOKE_GAP_MS || 1500); // リクエスト間隔（429 回避）
const TIMEOUT_MS = 90_000; // ISR コールド生成（過去トップ53s）を待てる長さ
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// HTTP（429 は Retry-After / 指数バックオフでリトライ、5xx・タイムアウトは1回だけ再試行）
// ---------------------------------------------------------------------------
async function fetchOnce(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      redirect: "manual",
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ja,en;q=0.8",
      },
    });
    const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
    return {
      status: res.status,
      headers: res.headers,
      body,
      ms: Date.now() - started,
    };
  } finally {
    clearTimeout(timer);
  }
}

let lastRequestAt = 0;
async function politeFetch(url) {
  const wait = lastRequestAt + GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  let retried5xx = false;
  for (let attempt = 1; attempt <= 6; attempt++) {
    lastRequestAt = Date.now();
    let r;
    try {
      r = await fetchOnce(url);
    } catch (e) {
      if (!retried5xx) {
        retried5xx = true;
        console.log(`  … ${url} 通信エラー/タイムアウト（${e.name}）→ 15秒後に再試行`);
        await sleep(15_000);
        continue;
      }
      return { status: 0, headers: new Headers(), body: "", ms: TIMEOUT_MS, error: String(e?.name || e) };
    }
    if (r.status === 429) {
      const ra = Number(r.headers.get("retry-after"));
      const backoff = Number.isFinite(ra) && ra > 0 ? Math.min(ra, 120) * 1000 : 10_000 * 2 ** (attempt - 1);
      console.log(`  … ${url} 429（レート制限）→ ${Math.round(backoff / 1000)}秒後にリトライ`);
      await sleep(Math.min(backoff, 120_000));
      continue;
    }
    // 5xx は一過性（コールド生成中の 502/504 等）を1回だけ吸収する。恒常的な 500 は再試行でも残るので検知できる。
    if (r.status >= 500 && !retried5xx) {
      retried5xx = true;
      console.log(`  … ${url} ${r.status} → 15秒後に1回だけ再試行`);
      await sleep(15_000);
      continue;
    }
    return r;
  }
  return { status: 429, headers: new Headers(), body: "", ms: 0, error: "429 が解消しない" };
}

// ---------------------------------------------------------------------------
// チェック対象
// ---------------------------------------------------------------------------
const HTML = "html"; // <title> と JSON-LD を必須にする
const has = (re, label) => ({ re, label });

/** @typedef {{path:string, label:string, expect?:number, location?:string, kind?:string, must?:{re:RegExp,label:string}[], minLocs?:number}} Target */

/** @type {Target[]} */
const STATIC_TARGETS = [
  { path: "/", label: "トップ", kind: HTML },
  { path: "/spots", label: "スポット一覧", kind: HTML },
  // 通常スポット（UGC 投稿の有無に依存しない代表）
  { path: "/spots/mera-gyokou-shizuoka", label: "スポット詳細（通常・統合先）", kind: HTML },
  { path: "/spots/fishing-park-hirano", label: "スポット詳細（管理釣り場）", kind: HTML },
  { path: "/fish/aji", label: "魚種詳細 /fish/aji", kind: HTML },
  { path: "/monthly", label: "月別ガイド ハブ", kind: HTML },
  { path: "/prefecture/kanagawa/december", label: "県×月 /prefecture/[県]/[月]", kind: HTML },
  { path: "/fishing-rules/kanagawa", label: "釣りルール /fishing-rules/[県]", kind: HTML },
  { path: "/tides/tokyo", label: "潮見表 /tides/[観測所]", kind: HTML },
  { path: "/chouka", label: "釣果ハブ /chouka", kind: HTML, must: [has(/最近釣果があった釣り場/, "「最近釣果があった釣り場」")] },
  { path: "/sitemap.xml", label: "sitemap.xml", must: [has(/<urlset/, "<urlset>")], minLocs: 1000 },
  { path: "/image-sitemap.xml", label: "image-sitemap.xml", must: [has(/<image:image>/, "<image:image>")], minLocs: 50 },
  { path: "/llms.txt", label: "llms.txt", must: [has(/^# ツリスポ/, "先頭行 # ツリスポ")] },
  // 重複統合で 308 になる URL（統合リダイレクトの回帰検知）
  {
    path: "/spots/mera-port",
    label: "統合リダイレクト /spots/mera-port",
    expect: 308,
    location: "/spots/mera-gyokou-shizuoka",
  },
  // 無効URLは 404 であること（ソフト404＝「見つかりません」を200で返す回帰の検知）
  { path: "/spots/smoke-invalid-slug", label: "無効スポット（404期待）", expect: 404 },
  { path: "/prefecture/kanagawa/smoke-invalid", label: "無効な県×月（404期待）", expect: 404 },
];

// UGC 投稿のあるスポット（動的取得に失敗したときの予備）。
// 定期見直し: 投稿が古くなったり統合で slug が変わったら差し替える（最終確認 2026-11-19）。
const UGC_FALLBACK = ["daikoku-fishing-facility", "hiraiso-fishing-park"];
// #600「最新釣果」表示スポットの予備（/chouka から取れないとき）
const LATEST_CATCH_FALLBACK = "daikoku-fishing-facility";

/** 公開 API から UGC 釣果投稿のあるスポットを動的に選ぶ。ログインユーザー（tsuriId 付き）の投稿を優先する
 *  （#596→#602 の 500 は「ログインユーザーの投稿があるスポット」でのみ発生した）。 */
async function discoverUgcSpots(notes) {
  const r = await politeFetch(`${BASE}/api/catch-reports/recent?limit=20&smoke=${RUN_ID}`);
  if (r.status !== 200) {
    notes.push(`UGC スポットの動的取得に失敗（/api/catch-reports/recent → ${r.status}）。予備リストを使用`);
    return UGC_FALLBACK;
  }
  let reports = [];
  try {
    reports = JSON.parse(r.body).reports || [];
  } catch {
    notes.push("UGC スポットの動的取得: JSON を解釈できず。予備リストを使用");
    return UGC_FALLBACK;
  }
  // サンプル（ハードコード）は id が ugc- で始まらないので除外
  const live = reports.filter((x) => x && typeof x.spotSlug === "string" && String(x.id).startsWith("ugc-"));
  const withUser = [...new Set(live.filter((x) => x.tsuriId).map((x) => x.spotSlug))];
  const anon = [...new Set(live.filter((x) => !x.tsuriId).map((x) => x.spotSlug))];
  const picked = [...withUser.slice(0, 3), ...anon.filter((s) => !withUser.includes(s)).slice(0, 1)];
  if (picked.length === 0) {
    notes.push("UGC スポットの動的取得: 実投稿が0件。予備リストを使用");
    return UGC_FALLBACK;
  }
  return picked;
}

/** /chouka の「最近釣果があった釣り場」先頭のスポット（#600 の最新釣果表示が出るはずの1件） */
function discoverLatestCatchSpot(choukaHtml) {
  const idx = choukaHtml.indexOf("最近釣果があった釣り場");
  if (idx < 0) return null;
  const m = choukaHtml.slice(idx).match(/href="\/spots\/([a-z0-9-]+)"/);
  return m ? m[1] : null;
}

// ---------------------------------------------------------------------------
// 検証
// ---------------------------------------------------------------------------
function validate(target, r, variant) {
  const problems = [];
  const expect = target.expect ?? 200;
  const cf = r.headers.get("cf-cache-status") || "-";
  if (r.status !== expect) {
    let msg = `ステータス ${r.status || "(応答なし)"}（期待 ${expect}）`;
    if (r.error) msg += ` ${r.error}`;
    if (r.status >= 500 && variant === "edge" && cf === "HIT") {
      msg += " ← 5xx がエッジにキャッシュされています。cf-purge.yml で該当パスを purge してください";
    }
    if (r.status === 403 && r.headers.get("cf-mitigated")) {
      msg += "（Cloudflare のチャレンジ。監視ランナーが bot 判定された可能性）";
    }
    problems.push(msg);
    return problems;
  }
  if (expect === 404) return problems; // 404 期待（ソフト404回帰の検知）はステータスだけ見る
  if (target.location) {
    const loc = r.headers.get("location") || "";
    const locPath = loc.replace(/^https?:\/\/[^/]+/, "").split("?")[0];
    if (locPath !== target.location) problems.push(`Location が ${loc || "(なし)"}（期待 ${target.location}）`);
    return problems;
  }
  const body = r.body || "";
  if (target.kind === HTML) {
    const title = body.match(/<title[^>]*>([^<]*)<\/title>/);
    if (!title || !title[1].trim()) problems.push("<title> が無い/空");
    // ソフト404検知: 「見つかりません」ページを 200 で返している（/prefecture/kanagawa/12 で実際に発生）
    if (title && /見つかりません|Not Found/i.test(title[1])) problems.push(`ソフト404（<title>「${title[1].trim().slice(0, 40)}」を status 200 で返却）`);
    // 監視対象は全てインデックスされるべきページ。noindex はキャッシュ残存・誤設定・ソフト404の兆候
    if (!target.allowNoindex && /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(body)) {
      problems.push("meta robots が noindex（インデックス対象ページのはず）");
    }
    if (!body.includes("application/ld+json")) problems.push("JSON-LD（application/ld+json）が無い");
    if (/Application error: a (server|client)-side exception/.test(body)) problems.push("Next.js のエラー画面");
  }
  for (const m of target.must || []) {
    if (!m.re.test(body)) problems.push(`必須要素 ${m.label} が無い`);
  }
  if (target.minLocs) {
    const n = (body.match(/<loc>/g) || []).length;
    if (n < target.minLocs) problems.push(`<loc> が ${n} 件（最低 ${target.minLocs} 件）`);
  }
  return problems;
}

async function check(target, rows, failures) {
  for (const variant of ["origin", "edge"]) {
    const url = variant === "origin" ? `${BASE}${target.path}${target.path.includes("?") ? "&" : "?"}smoke=${RUN_ID}` : `${BASE}${target.path}`;
    const r = await politeFetch(url);
    const problems = validate(target, r, variant);
    const cf = r.headers.get("cf-cache-status") || "-";
    const age = r.headers.get("age") || "-";
    const ok = problems.length === 0;
    const vlabel = variant === "origin" ? "バスタ付" : "クエリ無";
    console.log(`${ok ? "OK  " : "FAIL"} [${vlabel}] ${r.status} ${target.path} (${r.ms}ms cf=${cf} age=${age})${ok ? "" : " — " + problems.join(" / ")}`);
    rows.push(`| ${ok ? "✅" : "❌"} | ${target.label} | \`${target.path}\` | ${vlabel} | ${r.status} | ${cf} | ${r.ms} | ${problems.join("<br>")} |`);
    if (!ok) failures.push(`- **${target.label}** \`${target.path}\`（${vlabel}）: ${problems.join(" / ")} [cf-cache-status=${cf}, age=${age}]`);
    if (variant === "origin") target._originBody = r.body;
  }
}

async function main() {
  console.log(`本番 HTTP smoke: ${BASE}（run=${RUN_ID}）`);
  const rows = [];
  const failures = [];
  const notes = [];

  const targets = [...STATIC_TARGETS];

  // UGC 投稿のあるスポット（動的）
  const ugc = await discoverUgcSpots(notes);
  for (const slug of ugc) {
    targets.push({ path: `/spots/${slug}`, label: "スポット詳細（UGC釣果投稿あり）", kind: HTML });
  }

  for (const t of targets) await check(t, rows, failures);

  // #600 最新釣果: /chouka の先頭スポットに「最新釣果」が出ていること
  const chouka = targets.find((t) => t.path === "/chouka");
  let latest = discoverLatestCatchSpot(chouka?._originBody || "");
  if (!latest) {
    notes.push(`最新釣果スポットを /chouka から取得できず。予備 ${LATEST_CATCH_FALLBACK} を使用`);
    latest = LATEST_CATCH_FALLBACK;
  }
  await check(
    { path: `/spots/${latest}`, label: "スポット詳細（#600 最新釣果）", kind: HTML, must: [has(/最新釣果/, "「最新釣果」")] },
    rows,
    failures,
  );

  const header = `| | 対象 | パス | 種別 | status | cf-cache | ms | 問題 |\n|---|---|---|---|---|---|---|---|`;
  const summary = [
    `## 本番 HTTP smoke（${failures.length === 0 ? "全項目OK" : `失敗 ${failures.length} 件`}）`,
    "",
    `対象: ${BASE} / run: ${RUN_ID} / UGCスポット: ${ugc.join(", ")} / 最新釣果スポット: ${latest}`,
    ...(notes.length ? ["", ...notes.map((n) => `> ${n}`)] : []),
    "",
    header,
    ...rows,
    "",
  ].join("\n");
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);

  writeFileSync(
    REPORT_FILE,
    failures.length === 0
      ? "全項目OK\n"
      : [`本番 HTTP smoke で ${failures.length} 件の失敗（${BASE}）`, "", ...failures, "", ...notes.map((n) => `> ${n}`), ""].join("\n"),
  );

  for (const n of notes) console.log(`note: ${n}`);
  if (failures.length > 0) {
    console.log(`\n失敗 ${failures.length} 件:\n${failures.join("\n")}`);
    process.exit(1);
  }
  console.log("\n全項目OK");
}

main().catch((e) => {
  console.error(e);
  writeFileSync(REPORT_FILE, `smoke スクリプト自体が異常終了: ${e?.stack || e}\n`);
  process.exit(1);
});
