// 一時スクリプト: 指定slugのスポットブロックを spots-*.ts から削除する
// 使い方: node scripts/dedup-batch1-remove.mjs <slug...>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "src", "lib", "data");

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("usage: node scripts/dedup-batch1-remove.mjs <slug...>");
  process.exit(1);
}

function findEnclosingBlock(content, idx) {
  let depth = 0;
  let start = -1;
  for (let i = idx; i >= 0; i--) {
    const c = content[i];
    if (c === "}") depth++;
    else if (c === "{") {
      if (depth === 0) { start = i; break; }
      depth--;
    }
  }
  if (start === -1) return null;
  depth = 0;
  for (let i = start; i < content.length; i++) {
    const c = content[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return { start, end: i + 1 };
    }
  }
  return null;
}

const files = fs.readdirSync(DATA_DIR).filter((f) => f.startsWith("spots-") && f.endsWith(".ts"));
const removed = [];
for (const file of files) {
  const fp = path.join(DATA_DIR, file);
  let content = fs.readFileSync(fp, "utf8");
  let changed = false;
  for (const slug of targets) {
    const m = content.match(new RegExp(`slug:\\s*["']${slug}["']`));
    if (!m) continue;
    const blk = findEnclosingBlock(content, m.index);
    if (!blk) {
      console.error(`block not found for ${slug} in ${file}`);
      process.exit(1);
    }
    const block = content.slice(blk.start, blk.end);
    if (!/id:\s*["']/.test(block)) {
      console.error(`sanity check failed: block for ${slug} has no id field`);
      process.exit(1);
    }
    // 削除範囲: 行頭の空白〜ブロック終端の`},`まで（後続の改行を含む）
    let start = blk.start;
    while (start > 0 && (content[start - 1] === " " || content[start - 1] === "\t")) start--;
    if (start > 0 && content[start - 1] === "\n") start--;
    let end = blk.end;
    if (content[end] === ",") end++;
    content = content.slice(0, start) + content.slice(end);
    changed = true;
    removed.push(`${slug} (${file})`);
  }
  if (changed) fs.writeFileSync(fp, content);
}
console.log("removed blocks:");
for (const r of removed) console.log("  -", r);
const missing = targets.filter((t) => !removed.some((r) => r.startsWith(t + " ")));
if (missing.length) {
  console.error("NOT FOUND:", missing.join(", "));
  process.exit(1);
}
