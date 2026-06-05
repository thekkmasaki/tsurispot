#!/usr/bin/env node
// GSCの「インデックス未登録」ドリルダウンCSV（表.csv: URL,前回のクロール）を
// パスパターンで分類し、原因別の件数を出す。
// 使い方: node scripts/gsc-index-triage.mjs <表.csv> [<表2.csv> ...]

import fs from "node:fs";

function parseUrls(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  const out = [];
  for (const line of lines.slice(1)) {
    // URL,日付 形式。URLにカンマは通常含まれない
    const url = line.split(",")[0];
    if (url && url.startsWith("http")) out.push(url);
  }
  return out;
}

function classify(url) {
  let p;
  try { p = new URL(url).pathname; } catch { return "invalid"; }
  if (p.startsWith("/api/og/spot/")) return "api-og-spot";
  if (p.startsWith("/api/og")) return "api-og-query";
  if (p.startsWith("/api/")) return "api-other";
  const seg = p.split("/").filter(Boolean);
  const s0 = seg[0] || "(root)";
  if (s0 === "spots") return seg.length >= 2 ? "spots-detail" : "spots-list";
  if (s0 === "prefecture") {
    if (seg.includes("fish")) return "pref-fish";
    if (seg.length >= 3) return "pref-deep(month等)";
    return "pref-hub";
  }
  if (s0 === "fish") return "fish";
  if (s0 === "fishing") return "fishing-method";
  if (s0 === "area") return "area";
  if (s0 === "monthly") return "monthly";
  if (s0 === "seasonal") return "seasonal";
  if (s0 === "spot-type") return "spot-type";
  if (s0 === "guide") return "guide";
  if (s0 === "blog") return "blog";
  if (s0 === "methods") return "methods";
  if (s0 === "users") return "users";
  return `other:/${s0}`;
}

for (const csv of process.argv.slice(2)) {
  const urls = parseUrls(fs.readFileSync(csv, "utf8"));
  const counts = {};
  const sample = {};
  for (const u of urls) {
    const c = classify(u);
    counts[c] = (counts[c] || 0) + 1;
    if (!sample[c]) sample[c] = u;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  console.log(`\n=== ${csv} : ${urls.length} URL ===`);
  for (const [c, n] of sorted) {
    console.log(String(n).padStart(5), c.padEnd(20), sample[c]);
  }
}
