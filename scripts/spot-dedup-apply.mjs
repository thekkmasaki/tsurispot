#!/usr/bin/env node
/**
 * 重複統合 第2弾の適用（2026-11）
 *
 * scripts/output/dedup-wave2-plan.json の merge[from..to) を
 *   1. src/lib/data/spot-merge-map.ts の末尾に追記（敗者→勝者）
 *   2. coord 指定のあるグループは、勝者のデータファイル上の緯度経度を検証済み座標へ書き換え
 * する。既存の統合表と衝突（敗者が既に勝者側にいる等）するグループはスキップして報告する。
 *
 * 使い方: node scripts/spot-dedup-apply.mjs <from> <to> <見出しラベル>
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const [from, to, label] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4] || ""];
const plan = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/output/dedup-wave2-plan.json"), "utf8"));
const MAP = path.join(ROOT, "src/lib/data/spot-merge-map.ts");
const DATA = path.join(ROOT, "src/lib/data");

let mapSrc = fs.readFileSync(MAP, "utf8");
const existing = new Map([...mapSrc.matchAll(/^ {2}"([^"]+)": "([^"]+)"/gm)].map((m) => [m[1], m[2]]));
const existingWinners = new Set(existing.values());

const dataFiles = fs.readdirSync(DATA).filter((f) => f.startsWith("spots-") && f.endsWith(".ts"));
function findDef(slug) {
  const hits = [];
  for (const f of dataFiles) {
    const src = fs.readFileSync(path.join(DATA, f), "utf8");
    let i = src.indexOf(`slug: "${slug}"`);
    while (i >= 0) {
      hits.push({ f, i });
      i = src.indexOf(`slug: "${slug}"`, i + 1);
    }
  }
  return hits;
}

const lines = [];
const skipped = [];
const coordDone = [];
const coordSkipped = [];
for (const g of plan.merge.slice(from, to)) {
  // 既存統合表の勝者が今回の敗者になる場合は、既存エントリの統合先を今回の勝者へ付け替える（チェーン防止）
  for (const l of g.losers) {
    if (!existingWinners.has(l.slug)) continue;
    mapSrc = mapSrc.replace(new RegExp(`(^ {2}"[^"]+": )"${l.slug}"`, "gm"), `$1"${g.winner}"`);
    for (const [k, v] of existing) if (v === l.slug) existing.set(k, g.winner);
    existingWinners.delete(l.slug);
    existingWinners.add(g.winner);
  }
  const bad = [g.winner, ...g.losers.map((l) => l.slug)].filter((s) => existing.has(s));
  if (bad.length) {
    skipped.push(`${g.winner}: 既存統合表と衝突 ${bad.join(",")}`);
    continue;
  }
  for (const l of g.losers) {
    lines.push(`  "${l.slug}": "${g.winner}", // ${l.name} → ${g.winnerName}：同一市区町村の同名施設（${g.maxKm}km離れて登録）`);
  }
  if (g.coord) {
    const defs = findDef(g.winner);
    if (defs.length !== 1) {
      coordSkipped.push(`${g.winner}: 定義が${defs.length}件`);
      continue;
    }
    const file = path.join(DATA, defs[0].f);
    const src = fs.readFileSync(file, "utf8");
    const next = src.indexOf("slug:", defs[0].i + 5);
    const end = next < 0 ? src.length : next;
    const block = src.slice(defs[0].i, end);
    const re = /latitude:\s*(-?[\d.]+),\s*longitude:\s*(-?[\d.]+)/;
    if (!re.test(block)) {
      coordSkipped.push(`${g.winner}: 緯度経度の書式が想定外`);
      continue;
    }
    const replaced = block.replace(re, `latitude: ${g.coord.lat}, longitude: ${g.coord.lng}`);
    fs.writeFileSync(file, src.slice(0, defs[0].i) + replaced + src.slice(end));
    coordDone.push(`${g.winner}: ${g.coord.old.join(",")} → ${g.coord.lat},${g.coord.lng}（${g.coord.from} の座標・${g.coord.why}）`);
  }
}

const header = `  // ---- 第2弾 ${label}: 同一市区町村・同名施設で500m超離れて重複登録（座標誤り由来）----`;
mapSrc = mapSrc.replace(/\n};\s*$/, `\n${header}\n${lines.join("\n")}\n};\n`);
fs.writeFileSync(MAP, mapSrc);
const out = { label, losers: lines.length, skipped, coordDone, coordSkipped };
fs.writeFileSync(path.join(ROOT, `scripts/output/dedup-wave2-apply-${from}-${to}.json`), JSON.stringify(out, null, 2));
console.log(JSON.stringify({ ...out, coordDone: coordDone.length }, null, 1));
