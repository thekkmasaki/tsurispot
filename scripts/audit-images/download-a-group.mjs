// A群 Commons画像を throttled(≤3) DL。既存スキップで再開可能。
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT_DIR = path.join(ROOT, ".audit-cache");
const A_DIR = path.join(OUT_DIR, "a-group");
fs.mkdirSync(A_DIR, { recursive: true });

const unique = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "unique-images.json"), "utf8"));
const aGroup = unique.filter((u) => u.group === "A");

const UA = "TsuriSpotImageAudit/1.0 (https://tsurispot.com; dev@tsurispot.jp) image-quality-check";
const CONCURRENCY = 2;       // Wikimediaの429回避のため控えめ
const DELAY_MS = 700;        // リクエスト間ディレイ

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let done = 0, skipped = 0, failed = 0;
const failures = [];

async function fetchOne(u) {
  const dest = path.join(ROOT, u.localPath);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) { skipped++; return; }
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const res = await fetch(u.url, { headers: { "User-Agent": UA, "Accept": "image/*" } });
      if (res.status === 429) {
        const ra = parseInt(res.headers.get("retry-after") || "0", 10);
        const wait = ra > 0 ? ra * 1000 : Math.min(30000, 2000 * 2 ** (attempt - 1));
        if (attempt === 6) throw new Error("HTTP 429 (exhausted)");
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error("HTTP " + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 500) throw new Error("too small " + buf.length);
      fs.writeFileSync(dest, buf);
      done++;
      return;
    } catch (e) {
      if (attempt === 6) { failed++; failures.push({ url: u.url, err: String(e) }); }
      else await sleep(1000 * attempt);
    }
  }
}

async function run() {
  const queue = [...aGroup];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const u = queue.shift();
      await fetchOne(u);
      await sleep(DELAY_MS);
      if ((done + skipped + failed) % 50 === 0) console.log(`  進捗: DL=${done} skip=${skipped} fail=${failed} 残=${queue.length}`);
    }
  });
  await Promise.all(workers);
  console.log(`=== A群DL完了: DL=${done} skip=${skipped} fail=${failed} / 計${aGroup.length} ===`);
  if (failures.length) {
    fs.writeFileSync(path.join(OUT_DIR, "a-group-failures.json"), JSON.stringify(failures, null, 2));
    console.log("失敗URLを a-group-failures.json に記録:", failures.length);
  }
}
run();
