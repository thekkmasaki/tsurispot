#!/usr/bin/env node
// GSC検索パフォーマンスCSVから「順位6-12位×表示回数上位」の“あと一歩”ページを抽出し、
// ページタイプ別に伸びしろを集計する。
// 使い方: node scripts/gsc-triage.mjs <Pages.csv> [Queries.csv]
// CSVヘッダ(日本語): 上位のページ,クリック数,表示回数,CTR,掲載順位 / 上位のクエリ,...

import fs from "node:fs";

const pagesCsv = process.argv[2];
const queriesCsv = process.argv[3];
if (!pagesCsv) {
  console.error("usage: node scripts/gsc-triage.mjs <Pages.csv> [Queries.csv]");
  process.exit(1);
}

// 簡易CSVパーサ（GSCは値にカンマを含まない単純構造だが、念のためクォート対応）
function parseCsv(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.length);
  const rows = [];
  for (const line of lines) {
    const cells = [];
    let cur = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') q = false;
        else cur += c;
      } else {
        if (c === '"') q = true;
        else if (c === ",") { cells.push(cur); cur = ""; }
        else cur += c;
      }
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

const num = (s) => Number(String(s).replace(/[%,]/g, "")) || 0;

// URL→ページタイプ分類
function classify(url) {
  let p;
  try { p = new URL(url).pathname; } catch { p = url; }
  const seg = p.split("/").filter(Boolean);
  if (seg.length === 0) return { type: "top", key: "/" };
  const s0 = seg[0];
  if (s0 === "spots") return seg.length >= 2 ? { type: "spot-detail", key: p } : { type: "spots-list", key: "/spots" };
  if (s0 === "prefecture") {
    if (seg.length === 1) return { type: "pref", key: p };
    if (seg.length === 2) return { type: "pref-hub", key: p };
    if (seg[2] === "fish") return { type: "pref-fish", key: p };
    if (seg[2] === "fishing") return { type: "pref-method", key: p };
    if (/^\d/.test(seg[2]) || /(january|february|march|april|may|june|july|august|september|october|november|december)/.test(seg[2]))
      return { type: seg.length >= 4 ? "pref-month-fish" : "pref-month", key: p };
    return { type: "pref-other", key: p };
  }
  if (s0 === "fishing") return { type: "method-area", key: p };
  if (s0 === "monthly") return { type: "monthly", key: p };
  if (s0 === "seasonal") return { type: "seasonal", key: p };
  if (s0 === "fish") return { type: "fish", key: p };
  if (s0 === "area") return { type: "area", key: p };
  if (s0 === "methods") return { type: "methods", key: p };
  if (s0 === "guide") return { type: "guide", key: p };
  if (s0 === "blog") return { type: "blog", key: p };
  if (s0 === "ranking") return { type: "ranking", key: p };
  return { type: `other:${s0}`, key: p };
}

const pageRows = parseCsv(fs.readFileSync(pagesCsv, "utf8")).slice(1);
const pages = pageRows.map((r) => ({
  url: r[0], clicks: num(r[1]), impr: num(r[2]), ctr: num(r[3]), pos: num(r[4]),
  ...classify(r[0]),
}));

// “あと一歩”定義: 順位5.0〜12.0 かつ 表示回数>=300
const NEAR_LO = 5.0, NEAR_HI = 12.0, MIN_IMPR = 300;
const near = pages.filter((p) => p.pos >= NEAR_LO && p.pos <= NEAR_HI && p.impr >= MIN_IMPR);

// ページタイプ別集計（全体 / あと一歩）
const byType = {};
for (const p of pages) {
  const t = (byType[p.type] ||= { type: p.type, pages: 0, impr: 0, clicks: 0, near: 0, nearImpr: 0 });
  t.pages++; t.impr += p.impr; t.clicks += p.clicks;
}
for (const p of near) { byType[p.type].near++; byType[p.type].nearImpr += p.impr; }
const typeTable = Object.values(byType).sort((a, b) => b.nearImpr - a.nearImpr);

console.log("=== ページタイプ別 “あと一歩(順位5-12×表示≥300)” 伸びしろ ===");
console.log("type".padEnd(16), "near数".padStart(6), "near表示".padStart(10), "全体表示".padStart(10), "全体ページ".padStart(8));
for (const t of typeTable) {
  if (t.nearImpr === 0 && t.impr < 1000) continue;
  console.log(
    t.type.padEnd(16),
    String(t.near).padStart(6),
    String(t.nearImpr).padStart(10),
    String(t.impr).padStart(10),
    String(t.pages).padStart(8),
  );
}

console.log("\n=== あと一歩ページ Top30（near表示回数降順） ===");
near.sort((a, b) => b.impr - a.impr).slice(0, 30).forEach((p, i) => {
  console.log(
    String(i + 1).padStart(2),
    `pos${p.pos.toFixed(1)}`.padStart(7),
    `imp${p.impr}`.padStart(9),
    `clk${p.clicks}`.padStart(7),
    `ctr${p.ctr}%`.padStart(8),
    p.type.padEnd(14),
    p.url.replace("https://tsurispot.com", ""),
  );
});

console.log(`\n総ページ:${pages.length} / あと一歩:${near.length} / あと一歩総表示:${near.reduce((s, p) => s + p.impr, 0)}`);

// near-miss の spot-detail slug を worklist として書き出し（impr降順）
const nearSpots = near
  .filter((p) => p.type === "spot-detail")
  .sort((a, b) => b.impr - a.impr)
  .map((p) => p.url.replace(/.*\/spots\//, ""));
const worklistPath = "/tmp/nearmiss-spots.txt";
fs.writeFileSync(worklistPath, nearSpots.join("\n") + "\n");
console.log(`\nnear-miss spot-detail: ${nearSpots.length}件 → ${worklistPath} に出力`);
console.log("上位20:", nearSpots.slice(0, 20).join(", "));

if (queriesCsv && fs.existsSync(queriesCsv)) {
  const qRows = parseCsv(fs.readFileSync(queriesCsv, "utf8")).slice(1);
  const queries = qRows.map((r) => ({ q: r[0], clicks: num(r[1]), impr: num(r[2]), ctr: num(r[3]), pos: num(r[4]) }));
  const qNear = queries.filter((q) => q.pos >= NEAR_LO && q.pos <= NEAR_HI && q.impr >= MIN_IMPR);
  console.log(`\n=== あと一歩クエリ Top25（順位5-12×表示≥${MIN_IMPR}・表示降順） ===`);
  qNear.sort((a, b) => b.impr - a.impr).slice(0, 25).forEach((q, i) => {
    console.log(String(i + 1).padStart(2), `pos${q.pos.toFixed(1)}`.padStart(7), `imp${q.impr}`.padStart(9), `ctr${q.ctr}%`.padStart(8), q.q);
  });
}
