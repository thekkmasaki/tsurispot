#!/usr/bin/env node
/**
 * 重複統合の勝者（残す slug）選定（2026-11）
 *
 * 入力: scripts/output/dedup-decisions-<n>.json の merge グループ（人手判定済み）
 *       scripts/output/spot-dedup-candidates.json（spot-dedup-candidates.mjs の出力）
 * 基準（上から優先）:
 *   1. 出典付き魚種数（spots.ts spotWins と同じ第一基準）
 *   2. src 内の参照数（ブログ・ランキング・ルール/ティップス・特集等からの内部リンク/データ参照）
 *   3. 魚種数
 *   4. 名称が短い（=地域接頭辞のない一般的な名称）
 * 出力: 統合表（敗者 slug → 勝者 slug）を標準出力に TS 形式で書く。
 *
 * 使い方: node scripts/spot-dedup-pick.mjs scripts/output/dedup-decisions-1.json
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const decisions = JSON.parse(fs.readFileSync(path.resolve(ROOT, process.argv[2]), "utf8"));
const cand = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/output/spot-dedup-candidates.json"), "utf8"));
const meta = new Map();
for (const g of cand.groups) for (const m of g.members) meta.set(m.slug, m);

// src 全体のテキスト（スポット定義ファイル自体の slug 定義行は参照に数えない）
const texts = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "__tests__" || e.name === "node_modules") continue;
      walk(p);
    } else if (/\.(ts|tsx|json|md|mdx)$/.test(e.name)) {
      texts.push(fs.readFileSync(p, "utf8"));
    }
  }
}
walk(path.join(ROOT, "src"));
const all = texts.join("\n");
function refs(slug) {
  const re = new RegExp(`["'/]${slug.replace(/[-]/g, "\\-")}["'/?#\`]`, "g");
  const n = (all.match(re) || []).length;
  const defs = (all.match(new RegExp(`slug:\\s*"${slug}"`, "g")) || []).length;
  return Math.max(0, n - defs);
}

const lines = [];
const report = [];
for (const [slugs, reason] of decisions.merge) {
  const ranked = slugs
    .map((s) => {
      const m = meta.get(s);
      if (!m) throw new Error(`候補に無い slug: ${s}`);
      return { ...m, refs: refs(s) };
    })
    .sort(
      (a, b) =>
        b.sourced - a.sourced || b.refs - a.refs || b.fish - a.fish || a.name.length - b.name.length,
    );
  const [w, ...losers] = ranked;
  for (const l of losers) {
    lines.push(`  "${l.slug}": "${w.slug}", // ${l.name} → ${w.name}：${reason}`);
  }
  const conflicts = [];
  for (const l of losers) {
    if (l.hasToilet !== w.hasToilet) conflicts.push(`トイレ(${w.slug}=${w.hasToilet}/${l.slug}=${l.hasToilet})`);
    if (l.hasParking !== w.hasParking) conflicts.push(`駐車場(${w.slug}=${w.hasParking}/${l.slug}=${l.hasParking})`);
  }
  report.push({
    winner: `${w.slug}（${w.name} s${w.sourced}/r${w.refs}/f${w.fish}）`,
    losers: losers.map((l) => `${l.slug}（${l.name} s${l.sourced}/r${l.refs}/f${l.fish}）`),
    reason,
    conflicts,
  });
}
fs.writeFileSync(path.join(ROOT, "scripts/output/dedup-pick-report.json"), JSON.stringify(report, null, 2));
console.log(lines.join("\n"));
console.error(`groups=${decisions.merge.length} losers=${lines.length}`);
