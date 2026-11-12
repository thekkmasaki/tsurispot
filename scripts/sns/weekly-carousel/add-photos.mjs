#!/usr/bin/env node
/**
 * 写真プールに写真を追加する（Mac で実行。/weekly-report の最後に受け箱フォルダを渡して呼ばれる）
 *   node scripts/sns/weekly-carousel/add-photos.mjs <ファイル or フォルダ>... [--no-upload] [--out <dir>] [--keep]
 *
 * - jpg/jpeg/png/heic を読む（HEIC は macOS の sips で JPEG に変換）
 * - 向きを補正し長辺2160pxに縮小、EXIF（GPS位置情報を含む）は全て削除
 * - s3://tsurispot-sns-assets/photo-pool/<元ファイルのハッシュ>.jpg に置く（同じ写真は二重登録しない）
 * - フォルダで渡した場合、元ファイルは <フォルダ>/追加済み/ に移動（--keep で移動しない）
 * 投稿時は run.mjs がプールから「最近使っていない順」に選ぶ。
 */
import { execFileSync } from "child_process";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";

const argv = process.argv.slice(2);
const flag = (k) => argv.includes(`--${k}`);
const outIdx = argv.indexOf("--out");
const outDir = outIdx >= 0 ? argv[outIdx + 1] : fs.mkdtempSync(path.join(os.tmpdir(), "photo-pool-"));
const inputs = argv.filter((a, i) => !a.startsWith("--") && !(outIdx >= 0 && i === outIdx + 1));
if (!inputs.length) { console.error("usage: add-photos.mjs <ファイル or フォルダ>... [--no-upload] [--out <dir>] [--keep]"); process.exit(1); }

const POOL_BUCKET = process.env.SNS_ASSETS_BUCKET || "tsurispot-sns-assets";
const POOL_PREFIX = "photo-pool/";
const IMG = /\.(jpe?g|png|heic|heif)$/i;

const sources = [];
const fromDirs = [];
for (const p of inputs) {
  if (!fs.existsSync(p)) { console.warn("見つからない:", p); continue; }
  if (fs.statSync(p).isDirectory()) {
    const files = fs.readdirSync(p).filter((f) => IMG.test(f)).map((f) => path.join(p, f));
    sources.push(...files);
    fromDirs.push(...files.map((f) => ({ file: f, dir: p })));
  } else if (IMG.test(p)) sources.push(p);
}
if (!sources.length) { console.log("追加する写真なし"); process.exit(0); }

fs.mkdirSync(outDir, { recursive: true });
const done = [];
for (const src of sources) {
  const hash = crypto.createHash("sha1").update(fs.readFileSync(src)).digest("hex").slice(0, 16);
  let input = src;
  if (/\.hei[cf]$/i.test(src)) {
    input = path.join(outDir, `${hash}-src.jpg`);
    execFileSync("sips", ["-s", "format", "jpeg", src, "--out", input], { stdio: "ignore" });
  }
  const out = path.join(outDir, `${hash}.jpg`);
  // rotate() で向きを画素に焼き込む。withMetadata を付けないので EXIF/GPS は出力されない
  await sharp(input).rotate().resize(2160, 2160, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88, mozjpeg: true }).toFile(out);
  const meta = await sharp(out).metadata();
  if (meta.exif) throw new Error(`EXIFが残っています: ${out}`);
  done.push({ src, out, key: POOL_PREFIX + path.basename(out) });
  console.log(`${path.basename(src)} → ${path.basename(out)} (${meta.width}x${meta.height})`);
}

if (flag("no-upload")) process.exit(0);
const { S3Client, PutObjectCommand, ListObjectsV2Command } = await import("@aws-sdk/client-s3");
const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-northeast-1" });
const existing = new Set(((await s3.send(new ListObjectsV2Command({ Bucket: POOL_BUCKET, Prefix: POOL_PREFIX }))).Contents ?? []).map((o) => o.Key));
let added = 0;
for (const d of done) {
  if (existing.has(d.key)) { console.log(`登録済み: ${path.basename(d.src)}`); continue; }
  await s3.send(new PutObjectCommand({ Bucket: POOL_BUCKET, Key: d.key, Body: fs.readFileSync(d.out), ContentType: "image/jpeg" }));
  added++;
}
console.log(`写真プールに${added}枚追加（合計 ${existing.size + added}枚）: s3://${POOL_BUCKET}/${POOL_PREFIX}`);
if (!flag("keep")) {
  for (const { file, dir } of fromDirs) {
    const dest = path.join(dir, "追加済み");
    fs.mkdirSync(dest, { recursive: true });
    fs.renameSync(file, path.join(dest, path.basename(file)));
  }
  if (fromDirs.length) console.log(`元ファイルを「追加済み」フォルダへ移動（${fromDirs.length}枚）`);
}
