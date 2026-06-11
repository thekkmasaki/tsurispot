// 一時スクリプト: 指定slugのスポットブロックを行番号つきでダンプする
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "src", "lib", "data");

const targets = process.argv.slice(2);

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
for (const file of files) {
  const content = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  for (const slug of targets) {
    const re = new RegExp(`slug:\\s*["']${slug}["']`);
    const m = content.match(re);
    if (!m) continue;
    const blk = findEnclosingBlock(content, m.index);
    if (!blk) continue;
    const startLine = content.slice(0, blk.start).split("\n").length;
    const endLine = content.slice(0, blk.end).split("\n").length;
    console.log(`\n########## ${slug} — ${file} L${startLine}-L${endLine} ##########`);
    console.log(content.slice(blk.start, blk.end));
  }
}
