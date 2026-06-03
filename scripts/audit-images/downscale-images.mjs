// 全監査画像を480px JPEGに縮小（トークン節約）し、バッチのlocalPathを小画像へ差し替え（バッチID不変=冪等維持）
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, ".audit-cache");
const SMALL = path.join(OUT, "small");
const BATCH_DIR = path.join(OUT, "batches");
fs.mkdirSync(SMALL, { recursive: true });

const unique = JSON.parse(fs.readFileSync(path.join(OUT, "unique-images.json"), "utf8"));

const smallPathFor = (localPath) => {
  const base = path.basename(localPath).replace(/\.(jpg|jpeg|png|webp)$/i, "");
  return `.audit-cache/small/${base}.jpg`;
};

let done = 0, skipped = 0, failed = 0;
const failures = [];
const CONC = 6;
const queue = [...unique];

async function one(u) {
  const src = path.join(ROOT, u.localPath);
  const destRel = smallPathFor(u.localPath);
  const dest = path.join(ROOT, destRel);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 300) { skipped++; return; }
  try {
    await sharp(src).resize(480, 480, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 72 }).toFile(dest);
    done++;
  } catch (e) { failed++; failures.push({ localPath: u.localPath, err: String(e) }); }
}

async function run() {
  const workers = Array.from({ length: CONC }, async () => {
    while (queue.length) { await one(queue.shift()); if ((done + skipped + failed) % 200 === 0) console.log(`  進捗 done=${done} skip=${skipped} fail=${failed} 残=${queue.length}`); }
  });
  await Promise.all(workers);
  console.log(`=== 縮小完了: done=${done} skip=${skipped} fail=${failed} / ${unique.length} ===`);
  if (failures.length) fs.writeFileSync(path.join(OUT, "downscale-failures.json"), JSON.stringify(failures, null, 2));

  // バッチファイルのlocalPathを小画像へ差し替え（縮小成功したもののみ。失敗は元パス維持）
  const files = fs.readdirSync(BATCH_DIR).filter((f) => /^batch-\d+\.json$/.test(f));
  let updated = 0;
  for (const f of files) {
    const p = path.join(BATCH_DIR, f);
    const b = JSON.parse(fs.readFileSync(p, "utf8"));
    let changed = false;
    for (const it of b.items) {
      const sp = smallPathFor(it.localPath);
      if (fs.existsSync(path.join(ROOT, sp))) { if (it.localPath !== sp) { it.origPath = it.origPath || it.localPath; it.localPath = sp; changed = true; } }
    }
    if (changed) { fs.writeFileSync(p, JSON.stringify(b, null, 2)); updated++; }
  }
  console.log(`バッチlocalPath差し替え: ${updated}ファイル更新`);
}
run();
