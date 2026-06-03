// classify-*.json を集約し、完全性を検証して flagged(bad/gray) の検証用バッチを生成
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, ".audit-cache");
const RES = path.join(OUT, "results");
const FB = path.join(OUT, "flagged-batches");

const unique = JSON.parse(fs.readFileSync(path.join(OUT, "unique-images.json"), "utf8"));
const allKeys = new Set(unique.map((u) => u.imageKey));

const files = fs.readdirSync(RES).filter((f) => /^classify-\d+\.json$/.test(f));
const byKey = new Map();
let parseErr = 0;
for (const f of files) {
  let arr;
  try { arr = JSON.parse(fs.readFileSync(path.join(RES, f), "utf8")); } catch { parseErr++; continue; }
  if (!Array.isArray(arr)) continue;
  for (const r of arr) {
    if (!r || !r.imageKey) continue;
    let v = String(r.verdict || "").toLowerCase();
    if (!["ok", "bad", "gray"].includes(v)) v = "gray"; // 不正値はgray(要検証)
    byKey.set(r.imageKey, { imageKey: r.imageKey, localPath: r.localPath, spotLabel: r.spotLabel, verdict: v, category: r.category || "", confidence: r.confidence ?? null, reason: r.reason || "" });
  }
}

const covered = new Set(byKey.keys());
const missing = [...allKeys].filter((k) => !covered.has(k));
const extra = [...covered].filter((k) => !allKeys.has(k));

const all = [...byKey.values()];
const n = (v) => all.filter((x) => x.verdict === v).length;
console.log("=== classify集約 ===");
console.log(`結果ファイル: ${files.length} (parseErr=${parseErr})`);
console.log(`判定済み: ${all.length} / 全${allKeys.size}`);
console.log(`未判定(missing): ${missing.length}`);
console.log(`想定外key(extra): ${extra.length}`);
console.log(`verdict内訳: ok=${n("ok")} bad=${n("bad")} gray=${n("gray")}`);

fs.writeFileSync(path.join(OUT, "all-verdicts.json"), JSON.stringify(all, null, 2));
if (missing.length) {
  // localPath を unique から補完して missing をバッチ化（再分類用）
  const um = new Map(unique.map((u) => [u.imageKey, u]));
  const missItems = missing.map((k) => { const u = um.get(k); return { imageKey: k, localPath: u.localPath, group: u.group, nameFlag: u.nameFlag, refCount: u.spots.length, spots: u.spots.slice(0, 3).map((s) => ({ name: s.name, address: s.address, spotType: s.spotType })) }; });
  fs.writeFileSync(path.join(OUT, "missing-classify.json"), JSON.stringify(missItems, null, 2));
}

// flagged(bad/gray) を検証用バッチに分割
const flagged = all.filter((x) => x.verdict === "bad" || x.verdict === "gray");
fs.rmSync(FB, { recursive: true, force: true });
fs.mkdirSync(FB, { recursive: true });
const FVSIZE = 8;
let bid = 0;
for (let i = 0; i < flagged.length; i += FVSIZE) {
  const slice = flagged.slice(i, i + FVSIZE);
  const id = String(bid).padStart(3, "0");
  fs.writeFileSync(path.join(FB, `fbatch-${id}.json`), JSON.stringify({ fbatchId: id, items: slice }, null, 2));
  bid++;
}
fs.writeFileSync(path.join(OUT, "flagged.json"), JSON.stringify(flagged, null, 2));
fs.writeFileSync(path.join(OUT, "flagged-index.json"), JSON.stringify({ total: flagged.length, fbatchSize: FVSIZE, totalFbatches: bid }, null, 2));
console.log(`flagged(bad+gray): ${flagged.length} → 検証バッチ ${bid}個`);
