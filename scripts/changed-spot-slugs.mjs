#!/usr/bin/env node
/**
 * 2つのコミット間でデータが変わったスポットの slug を出す（デプロイ時の Cloudflare purge 用）。
 *
 *   node scripts/changed-spot-slugs.mjs <base> [head=HEAD]
 *
 * スポット詳細（/spots/:slug）はエッジで7日キャッシュし、デプロイの自動 purge からも外している
 * （全件 purge は 2026-06-23 の同期冷生成 → 502 障害の原因）。そのため、データを直しても個別ページだけ
 * 最大1週間古いまま残り、一覧（県×魚など）と食い違っていた（2026-11-26 千葉イナダTOP9の監査で発覚）。
 * 変わったスポットだけを purge するために、差分の行から slug を拾う:
 *  - src/lib/data/spots*.ts: 変更・削除された行の「直前の slug 行」（新旧どちらのファイルでも探す）
 *  - src/lib/data/spot-*.ts / *.json の上書き・統合表など: 変更行に含まれる "slug" 形式の文字列
 *  - public/images/spots/: 変更された画像のファイル名（= slug のことが多い）
 * 誤って余分に拾っても purge されるだけなので害は小さい。取りこぼしは SWR/TTL で数日以内に解消する。
 */
import { execFileSync } from "child_process";

const [base, head = "HEAD"] = process.argv.slice(2);
if (!base) { console.error("使い方: changed-spot-slugs.mjs <base> [head]"); process.exit(1); }
const git = (...a) => execFileSync("git", a, { encoding: "utf8", maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] });

const slugRe = /slug:\s*"([a-z0-9-]+)"/;
const out = new Set();
const files = git("diff", "--name-only", base, head, "--", "src/lib/data", "public/images/spots").split("\n").filter(Boolean);

function slugAtLines(rev, file, lines) {
  let text;
  try { text = git("show", `${rev}:${file}`); } catch { return; }
  const L = text.split("\n");
  // 各行の直前の slug（オブジェクトの先頭付近に slug がある前提）
  let cur = null; const at = new Array(L.length);
  for (let i = 0; i < L.length; i++) { const m = L[i].match(slugRe); if (m) cur = m[1]; at[i] = cur; }
  for (const n of lines) {
    const i = n - 1;
    // 1行に1オブジェクトの書き方（slug が同じ行）にも対応
    const m = L[i]?.match(slugRe);
    const s = m ? m[1] : at[i];
    if (s) out.add(s);
  }
}

for (const file of files) {
  if (file.startsWith("public/images/spots/")) {
    const m = file.match(/([a-z0-9-]+)\.(webp|jpe?g|png)$/);
    if (m) out.add(m[1]);
    continue;
  }
  const diff = git("diff", "-U0", base, head, "--", file);
  if (/\/spots[^/]*\.ts$/.test(file)) {
    const oldLines = [], newLines = [];
    for (const h of diff.matchAll(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gm)) {
      const [os, oc = "1", ns, nc = "1"] = h.slice(1);
      for (let k = 0; k < Number(oc); k++) oldLines.push(Number(os) + k);
      for (let k = 0; k < Number(nc); k++) newLines.push(Number(ns) + k);
    }
    slugAtLines(base, file, oldLines);
    slugAtLines(head, file, newLines);
  } else {
    // 上書き表・統合表など: 変更行に出てくる slug らしき文字列を拾う
    for (const line of diff.split("\n")) {
      if (!/^[+-][^+-]/.test(line)) continue;
      for (const m of line.matchAll(/"([a-z0-9]+(?:-[a-z0-9]+)+)"/g)) out.add(m[1]);
    }
  }
}
// 実在するスポットの slug だけに絞る（統合表の変更行から拾った文字列には魚種や地域の slug も混ざる）
const known = new Set();
for (const rev of [base, head]) {
  let list = "";
  try { list = git("grep", "-hoE", 'slug: "[a-z0-9-]+"', rev, "--", "src/lib/data/spots*.ts"); } catch { /* 該当なし */ }
  for (const m of list.matchAll(/slug: "([a-z0-9-]+)"/g)) known.add(m[1]);
}
console.log([...out].filter((s) => known.has(s)).sort().join("\n"));
