// unique-images.json を監査用の小バッチJSONに分割（各エージェントが自分のバッチだけ読む）
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(ROOT, ".audit-cache");
const BATCH_DIR = path.join(OUT_DIR, "batches");
fs.rmSync(BATCH_DIR, { recursive: true, force: true });
fs.mkdirSync(BATCH_DIR, { recursive: true });

const BATCH_SIZE = parseInt(process.argv[2] || "8", 10);
const unique = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "unique-images.json"), "utf8"));

// 存在チェック（A群でDL失敗したものは missing として記録）
const present = [];
const missing = [];
for (const u of unique) {
  const abs = path.join(ROOT, u.localPath);
  const ok = fs.existsSync(abs) && fs.statSync(abs).size > 500;
  if (ok) present.push(u); else missing.push({ imageKey: u.imageKey, group: u.group, url: u.url, localPath: u.localPath });
}

// バッチ化（軽量化: spotsはname/address/spotTypeのみ、先頭3件＋件数）
let batchId = 0;
const batchIndex = [];
for (let i = 0; i < present.length; i += BATCH_SIZE) {
  const slice = present.slice(i, i + BATCH_SIZE);
  const items = slice.map((u) => ({
    imageKey: u.imageKey,
    localPath: u.localPath,
    group: u.group,
    nameFlag: u.nameFlag,
    refCount: u.spots.length,
    spots: u.spots.slice(0, 3).map((s) => ({ name: s.name, address: s.address, spotType: s.spotType })),
  }));
  const id = String(batchId).padStart(3, "0");
  fs.writeFileSync(path.join(BATCH_DIR, `batch-${id}.json`), JSON.stringify({ batchId: id, items }, null, 2));
  batchIndex.push({ batchId: id, count: items.length });
  batchId++;
}

fs.writeFileSync(path.join(OUT_DIR, "batch-index.json"), JSON.stringify({ batchSize: BATCH_SIZE, totalBatches: batchId, totalImages: present.length, missing: missing.length, batches: batchIndex }, null, 2));
if (missing.length) fs.writeFileSync(path.join(OUT_DIR, "missing-images.json"), JSON.stringify(missing, null, 2));

console.log(`バッチ生成完了: ${batchId}バッチ / 対象${present.length}枚 (size=${BATCH_SIZE})`);
console.log(`A群=${present.filter(u=>u.group==='A').length} B群=${present.filter(u=>u.group==='B').length}`);
console.log(`missing(DL失敗等)=${missing.length}`);
