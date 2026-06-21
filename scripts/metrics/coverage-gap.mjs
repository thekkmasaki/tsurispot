#!/usr/bin/env node
// 被覆ギャップ解析。「サイトに載せたい良質ページ(sitemap)」のうち、検索で表示が
// 付いていない/極端に低い"不可視ページ"を抽出する。striking-distance(既存需要の刈り取り)
// では見えない、表示0〜低のページを可視化し、内部リンク救出・本文網羅性強化の対象にする。
//
// 重要原則(ユーザーの教訓): 薄いページ量産は逆効果(5,528クロール済み未登録)。
//   → 増やさない。強化 or 統合/noindex。sitemapは既に薄いマトリクスを除外済みなので、
//     sitemap内で不可視＝「良質なのにランクしていない」＝強化価値が高い。
//
// 実行: node scripts/metrics/coverage-gap.mjs
// 出力: memory/metrics/coverage-gap.json + サマリ

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classify, toPathKey, guessSourcePaths } from "./lib/classify-url.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const METRICS = path.join(REPO_ROOT, "memory", "metrics");

const LOW_IMPR = 50; // これ未満の表示回数は「ほぼ不可視」
// 単一レコードで個別編集できる型のみ救出対象。テンプレ/マトリクス(pref-*, method-area 等)は対象外
// (個別救出に不向き＆薄ページ量産の温床)。
const RECORD_BACKED = new Set(["spot-detail", "fish", "blog", "other:shops"]);

function loadConfig() { return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8")); }
function readJsonSafe(p) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } }

// priorities.json の excludeUrls(消化済み/TTL)を集合化。救出ワークリストから除外する。
function loadExcludeSet() {
  const today = new Date().toISOString().slice(0, 10);
  const pri = readJsonSafe(path.join(REPO_ROOT, "memory", "agent", "priorities.json")) || {};
  const set = new Set();
  for (const e of (pri.excludeUrls || [])) {
    if (typeof e === "string") set.add(e);
    else if (e && (e.path || e.url) && (!e.until || e.until >= today)) set.add(e.path || e.url);
  }
  return set;
}

async function fetchSitemapPaths(baseUrl) {
  const res = await fetch(`${baseUrl.replace(/\/$/, "")}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap取得失敗 (${res.status})`);
  const xml = await res.text();
  // <loc>...</loc> のみ抽出（<image:loc> は別タグなので拾わない）
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  // パスキーに正規化（GSC/GA4と同じ toPathKey で突合可能にする）
  const set = new Map(); // pathKey -> originalUrl
  for (const url of locs) set.set(toPathKey(url), url);
  return set;
}

async function main() {
  const cfg = loadConfig();
  const latest = readJsonSafe(path.join(METRICS, "latest.json"));
  if (!latest) { console.error("latest.json なし → 先に fetch-all.mjs を実行"); process.exit(1); }

  const inventory = await fetchSitemapPaths(cfg.site.baseUrl);
  const pages = latest.pages || {};
  const exclude = loadExcludeSet();

  const buckets = {
    invisible: [],     // 表示0（GSCに出てこない）
    lowVisible: [],    // 表示>0だが <LOW_IMPR、または順位>20
    visible: 0,        // 健全に表示されている
  };
  const byType = {}; // type -> { inventory, invisible, lowVisible }

  for (const [pkey, url] of inventory) {
    const { type } = classify(url);
    const t = (byType[type] ||= { inventory: 0, invisible: 0, lowVisible: 0 });
    t.inventory++;

    const m = pages[pkey];
    const impr = m?.impressions || 0;
    const pos = m?.position || 0;
    const pv = m?.pageviews || 0;

    if (impr === 0) {
      buckets.invisible.push({ path: pkey, type, ga4Pageviews: pv });
      t.invisible++;
    } else if (impr < LOW_IMPR || pos > 20) {
      buckets.lowVisible.push({ path: pkey, type, impressions: impr, position: pos, clicks: m?.clicks || 0 });
      t.lowVisible++;
    } else {
      buckets.visible++;
    }
  }

  // 強化価値の高いページタイプを優先（実コンテンツ＞情報ハブ）。内部リンク救出・本文強化の対象。
  const PRIORITY_TYPES = ["spot-detail", "fish", "pref-fish", "pref-month-fish", "blog", "method-area"];
  const prio = (it) => {
    const i = PRIORITY_TYPES.indexOf(it.type);
    return i === -1 ? 99 : i;
  };
  buckets.invisible.sort((a, b) => prio(a) - prio(b) || (b.ga4Pageviews - a.ga4Pageviews));
  buckets.lowVisible.sort((a, b) => prio(a) - prio(b) || (b.impressions - a.impressions));

  // 編集対象ファイルの手がかりを上位に付与
  const enrich = (it) => ({ ...it, sourcePaths: guessSourcePaths(cfg.site.baseUrl + it.path) });

  const out = {
    generatedAt: new Date().toISOString(),
    basedOnWeek: latest.week,
    inventoryTotal: inventory.size,
    counts: {
      visible: buckets.visible,
      searchInvisible: buckets.invisible.length,
      lowVisible: buckets.lowVisible.length,
    },
    invisiblePct: +(100 * buckets.invisible.length / inventory.size).toFixed(1),
    byType: Object.entries(byType)
      .map(([type, v]) => ({ type, ...v }))
      .sort((a, b) => b.invisible - a.invisible),
    // 強化対象ワークリスト（record-backed＝個別編集可能な型のみ・消化済み除外）。
    // テンプレ/マトリクスは byType の集計には残すが、ワークリスト＝エージェントの着手対象からは外す。
    invisibleWorklist: buckets.invisible.filter((it) => RECORD_BACKED.has(it.type) && !exclude.has(it.path)).slice(0, 300).map(enrich),
    lowVisibleWorklist: buckets.lowVisible.filter((it) => RECORD_BACKED.has(it.type) && !exclude.has(it.path)).slice(0, 100).map(enrich),
    note: "対策はテキストのみの安全レーン: ①孤立ページへの内部リンク追加(集客ページ→不可視ページ) ②本文の網羅性強化。薄いページの量産はしない。価値の低い重複は統合/noindexを検討。",
  };

  const outPath = path.join(METRICS, "coverage-gap.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

  console.log(`被覆ギャップ解析 [${latest.week}]`);
  console.log(`  sitemap掲載ページ総数: ${out.inventoryTotal}`);
  console.log(`  ✅ 健全に表示: ${out.counts.visible}`);
  console.log(`  ⚠ 低表示(<${LOW_IMPR} or 順位>20): ${out.counts.lowVisible}`);
  console.log(`  🚫 検索で不可視(表示0): ${out.counts.searchInvisible}  (在庫の ${out.invisiblePct}%)`);
  console.log("\n=== 不可視ページが多いタイプ Top10 ===");
  for (const t of out.byType.slice(0, 10)) {
    if (t.invisible === 0) continue;
    console.log(`  ${t.type.padEnd(16)} 不可視 ${String(t.invisible).padStart(5)} / 在庫 ${String(t.inventory).padStart(5)} (低表示 ${t.lowVisible})`);
  }
  console.log("\n=== 強化対象（不可視・優先タイプ）上位15 ===");
  for (const [i, it] of out.invisibleWorklist.slice(0, 15).entries()) {
    console.log(`  ${String(i + 1).padStart(2)}. ${it.type.padEnd(14)} ${it.path}${it.ga4Pageviews ? ` (GA4 pv${it.ga4Pageviews})` : ""}`);
  }
  console.log(`\n→ ${path.relative(REPO_ROOT, outPath)}`);
}

main().catch((e) => { console.error("coverage-gap 失敗:", e.message); process.exit(1); });
