import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(import.meta.dirname, "../..");
const flagged = JSON.parse(fs.readFileSync(path.join(ROOT, ".audit-cache/flagged.json"), "utf8"));

const byCat = {};
const byVerdict = { bad: 0, gray: 0 };
let lowConf = 0;
for (const f of flagged) {
  byVerdict[f.verdict] = (byVerdict[f.verdict] || 0) + 1;
  byCat[f.category] = (byCat[f.category] || 0) + 1;
  if ((f.confidence ?? 1) < 0.85) lowConf++;
}
console.log("flagged合計:", flagged.length, byVerdict);
console.log("カテゴリ別:");
for (const [c, n] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) console.log(`  ${c}: ${n}`);
console.log(`confidence<0.85: ${lowConf}`);

// 「救済可能性があり要検証」= gray、または bad で(救済可能カテゴリ or 低確信)
const RESCUABLE = new Set(["mismatch", "unrelated_building", "monument", "shrine_temple", "signboard", "other", "", "animal", "vehicle", "parking"]);
const needVerify = flagged.filter((f) => f.verdict === "gray" || (f.verdict === "bad" && (RESCUABLE.has(f.category) || (f.confidence ?? 1) < 0.85)));
const obviousBad = flagged.length - needVerify.length;
console.log(`\n要検証(gray+救済可能bad+低確信bad): ${needVerify.length} → 検証バッチ ${Math.ceil(needVerify.length / 8)}個`);
console.log(`明白bad(検証スキップ): ${obviousBad}`);
