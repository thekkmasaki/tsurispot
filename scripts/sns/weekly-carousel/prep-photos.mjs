#!/usr/bin/env node
/**
 * 週報カルーセル用の写真を整えて非公開バケットに置く（Mac で /weekly-report の最後に実行）
 *   node scripts/sns/weekly-carousel/prep-photos.mjs <受け箱フォルダ> <WEEKTAG> [--no-upload] [--out <dir>]
 *
 * - 受け箱の jpg/jpeg/png/heic をファイル名順に読む（1枚目が表紙）
 * - HEIC は macOS の sips で JPEG に変換
 * - 向きを補正し長辺2160pxに縮小、EXIF（GPS位置情報を含む）は全て削除
 * - s3://tsurispot-sns-assets/weekly-photos/<WEEKTAG>/01.jpg … に置く（同じ週の既存分は置き換え）
 * - 元ファイルは <受け箱>/投稿済み/<WEEKTAG>/ に移動
 */
import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";

const argv = process.argv.slice(2);
const [inbox, tag] = argv;
const noUpload = argv.includes("--no-upload");
const outArg = argv.indexOf("--out") >= 0 ? argv[argv.indexOf("--out") + 1] : null;
if (!inbox || !/^\d{4}-\d{2}-week\d$/.test(tag ?? "")) {
  console.error("usage: prep-photos.mjs <受け箱フォルダ> <WEEKTAG> [--no-upload] [--out <dir>]");
  process.exit(1);
}
const BUCKET = process.env.SNS_ASSETS_BUCKET || "tsurispot-sns-assets";
const PREFIX = `weekly-photos/${tag}/`;
const MAX = 4; // 表紙1 + 今週の一枚3

fs.mkdirSync(inbox, { recursive: true });
const srcs = fs.readdirSync(inbox)
  .filter((f) => /\.(jpe?g|png|heic|heif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }))
  .map((f) => path.join(inbox, f));
if (!srcs.length) { console.log(`写真なし（${inbox}）→ 写真なしの表紙で投稿されます`); process.exit(0); }
if (srcs.length > MAX) console.log(`写真は先頭${MAX}枚だけ使います（${srcs.length}枚あり）`);

const outDir = outArg ?? fs.mkdtempSync(path.join(os.tmpdir(), "weekly-photos-"));
fs.mkdirSync(outDir, { recursive: true });
const outs = [];
for (const [i, src] of srcs.slice(0, MAX).entries()) {
  let input = src;
  if (/\.hei[cf]$/i.test(src)) {
    input = path.join(outDir, `src-${i}.jpg`);
    execFileSync("sips", ["-s", "format", "jpeg", src, "--out", input], { stdio: "ignore" });
  }
  const out = path.join(outDir, `${String(i + 1).padStart(2, "0")}.jpg`);
  // rotate() で EXIF の向きを画素に焼き込み、withMetadata を付けないので EXIF/GPS は出力されない
  await sharp(input).rotate().resize(2160, 2160, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toFile(out);
  const meta = await sharp(out).metadata();
  if (meta.exif) throw new Error(`EXIFが残っています: ${out}`);
  outs.push(out);
  console.log(`${path.basename(src)} → ${path.basename(out)} (${meta.width}x${meta.height})`);
}

if (!noUpload) {
  const { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-northeast-1" });
  const old = (await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix: PREFIX }))).Contents ?? [];
  if (old.length) await s3.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: old.map((o) => ({ Key: o.Key })) } }));
  for (const f of outs) {
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: PREFIX + path.basename(f), Body: fs.readFileSync(f), ContentType: "image/jpeg" }));
  }
  console.log(`アップロード: s3://${BUCKET}/${PREFIX}（${outs.length}枚）`);
  const done = path.join(inbox, "投稿済み", tag);
  fs.mkdirSync(done, { recursive: true });
  for (const src of srcs.slice(0, MAX)) fs.renameSync(src, path.join(done, path.basename(src)));
  console.log(`元ファイルを移動: ${done}`);
}
