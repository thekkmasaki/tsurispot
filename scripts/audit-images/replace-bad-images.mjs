// 確定bad(verdict=="bad")の mainImageUrl を "" に置換し、隣接 imageAttribution を除去 → プレースホルダー化
// 使い方: node replace-bad-images.mjs        (ドライラン: 件数のみ)
//         node replace-bad-images.mjs --apply (実書き換え)
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA = path.join(ROOT, "src/lib/data");
const OUT = path.join(ROOT, ".audit-cache");
const APPLY = process.argv.includes("--apply");

const all = JSON.parse(fs.readFileSync(path.join(OUT, "all-verdicts.json"), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(OUT, "inventory.json"), "utf8"));

const badKeys = new Set(all.filter((v) => v.verdict === "bad").map((v) => v.imageKey));

// file -> Set(bad mainImageUrl), および bad参照スポット一覧
const fileBadUrls = new Map();
const badSpots = [];
for (const e of inventory) {
  if (e.group !== "A" && e.group !== "B") continue;
  const key = `${e.group}:${e.mainImageUrl}`;
  if (!badKeys.has(key)) continue;
  if (!fileBadUrls.has(e.file)) fileBadUrls.set(e.file, new Set());
  fileBadUrls.get(e.file).add(e.mainImageUrl);
  const v = all.find((x) => x.imageKey === key) || {};
  badSpots.push({ slug: e.slug, name: e.name, prefecture: e.prefecture, areaName: e.areaName, spotType: e.spotType, file: e.file, imageKey: key, category: v.category || "", reason: v.reason || "" });
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let totalRepl = 0, totalFiles = 0;
const perFile = [];
for (const [file, urls] of fileBadUrls) {
  const p = path.join(DATA, file);
  let src = fs.readFileSync(p, "utf8");
  let fileRepl = 0;
  for (const url of urls) {
    // mainImageUrl: "URL" (, imageAttribution: "...")?  →  mainImageUrl: ""
    const re = new RegExp(`mainImageUrl:\\s*"${esc(url)}"(\\s*,\\s*imageAttribution:\\s*"[^"]*")?`, "g");
    src = src.replace(re, () => { fileRepl++; return 'mainImageUrl: ""'; });
  }
  perFile.push({ file, urls: urls.size, repl: fileRepl });
  totalRepl += fileRepl;
  totalFiles++;
  if (APPLY && fileRepl > 0) fs.writeFileSync(p, src);
}

// 期待参照数
const expectedRefs = inventory.filter((e) => (e.group === "A" || e.group === "B") && badKeys.has(`${e.group}:${e.mainImageUrl}`)).length;

fs.writeFileSync(path.join(OUT, "bad-spots.json"), JSON.stringify(badSpots, null, 2));

console.log(`=== ${APPLY ? "実書き換え" : "ドライラン"} ===`);
console.log(`bad画像(ユニーク): ${badKeys.size}`);
console.log(`bad参照スポット(期待置換数): ${expectedRefs}`);
console.log(`実際の置換数: ${totalRepl}`);
console.log(`対象ファイル数: ${totalFiles}`);
const diff = expectedRefs - totalRepl;
if (diff !== 0) {
  console.log(`⚠️ 差分 ${diff} 件（正規表現で捕捉できなかった箇所あり。要調査）`);
  // 置換漏れの多いファイルを表示
  perFile.filter((f) => f.repl < f.urls).slice(0, 10).forEach((f) => console.log(`   ${f.file}: urls=${f.urls} repl=${f.repl}`));
} else {
  console.log(`✓ 期待数と一致`);
}
