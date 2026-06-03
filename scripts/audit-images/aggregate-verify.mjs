// classify(all-verdicts) + verify(verify-*.json) を統合し、確定bad → 影響スポット一覧(bad-spots.json) を生成
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, ".audit-cache");
const RES = path.join(OUT, "results");

const all = JSON.parse(fs.readFileSync(path.join(OUT, "all-verdicts.json"), "utf8"));
const inventory = JSON.parse(fs.readFileSync(path.join(OUT, "inventory.json"), "utf8"));
const flagged = JSON.parse(fs.readFileSync(path.join(OUT, "flagged.json"), "utf8"));

// verify結果を集約
const verifyByKey = new Map();
let vErr = 0;
for (const f of fs.readdirSync(RES).filter((f) => /^verify-\d+\.json$/.test(f))) {
  let arr;
  try { arr = JSON.parse(fs.readFileSync(path.join(RES, f), "utf8")); } catch { vErr++; continue; }
  if (!Array.isArray(arr)) continue;
  for (const r of arr) {
    if (!r || !r.imageKey) continue;
    const fv = String(r.finalVerdict || "").toLowerCase();
    verifyByKey.set(r.imageKey, { finalVerdict: ["ok", "bad"].includes(fv) ? fv : "bad", reason: r.reason || "" });
  }
}

// 最終判定: flagged各itemについて
//  - verify結果あり → finalVerdict採用
//  - verify結果なし → 元bad=bad維持、元gray=review(安全側でbad扱いにはしない)
const confirmedBadKeys = new Set();
const reviewKeys = new Set();
for (const it of flagged) {
  const v = verifyByKey.get(it.imageKey);
  if (v) { if (v.finalVerdict === "bad") confirmedBadKeys.add(it.imageKey); }
  else { if (it.verdict === "bad") confirmedBadKeys.add(it.imageKey); else reviewKeys.add(it.imageKey); }
}

// 確定bad imageKey → 影響スポット参照(inventory全件)
const badSpots = [];
for (const e of inventory) {
  if (e.group !== "A" && e.group !== "B") continue;
  const key = `${e.group}:${e.mainImageUrl}`;
  if (!confirmedBadKeys.has(key)) continue;
  const v = all.find((x) => x.imageKey === key) || {};
  badSpots.push({ slug: e.slug, name: e.name, address: e.address, prefecture: e.prefecture, areaName: e.areaName, spotType: e.spotType, file: e.file, line: e.line, imageKey: key, group: e.group, mainImageUrl: e.mainImageUrl, category: v.category || "", reason: (verifyByKey.get(key)?.reason) || v.reason || "" });
}

fs.writeFileSync(path.join(OUT, "bad-spots.json"), JSON.stringify(badSpots, null, 2));
fs.writeFileSync(path.join(OUT, "review-keys.json"), JSON.stringify([...reviewKeys], null, 2));

// カテゴリ別内訳
const byCat = {};
for (const k of confirmedBadKeys) { const v = all.find((x) => x.imageKey === k); const c = v?.category || "?"; byCat[c] = (byCat[c] || 0) + 1; }

console.log("=== verify統合 ===");
console.log(`verifyファイルerr=${vErr}`);
console.log(`flagged=${flagged.length} (verify済み=${verifyByKey.size})`);
console.log(`確定bad画像(ユニーク)=${confirmedBadKeys.size}, 救済/review=${reviewKeys.size}`);
console.log(`確定bad影響スポット参照=${badSpots.length}`);
console.log(`bad画像カテゴリ内訳:`, byCat);
console.log(`A群bad=${[...confirmedBadKeys].filter((k) => k.startsWith("A:")).length} B群bad=${[...confirmedBadKeys].filter((k) => k.startsWith("B:")).length}`);
