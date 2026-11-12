#!/usr/bin/env node
/**
 * 釣果週報カルーセル（週1本）: 週報記事 → スライド画像 → Instagram カルーセル投稿 → 台帳 → Discord
 *
 *   node scripts/sns/weekly-carousel/run.mjs [--week 2026-11-week2] [--dry-run] [--force]
 *                                            [--photos-dir <dir>] [--out out/sns-weekly]
 *   --week:       省略時は microCMS の最新週
 *   --dry-run:    投稿・台帳書き込みをせず、Discord に画像プレビューを送るだけ
 *   --force:      「週報が出揃ったか」の判定を飛ばす
 *   --photos-dir: 写真をローカルのフォルダから選ぶ（省略時は写真プール s3://tsurispot-sns-assets/photo-pool/）
 *
 * 写真はプールから毎週4枚（表紙1+写真スライド3）を「最近使っていない順」に選んで使い回す。
 * /weekly-report の最後に workflow_dispatch（--force）で即投稿される。毎日の cron は取りこぼし時の保険。
 * 認証情報が無いのに投稿すべき週がある場合は「失敗」で終わる（黙ってスキップしない）。
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { redis, getToken, discord, uploadPublic, removePublic } from "../ranking-reel/lib.mjs";
import { postInstagramCarousel } from "../ranking-reel/platforms.mjs";
import { parseWeekTag, latestWeekTag, fetchWeekArticles, parseArticle, topRows } from "./data.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");
const POSTED_KEY = "sns:weekly:posted"; // Redis SET（投稿済み WEEKTAG）
const LOG_KEY = "sns:weekly:ledger"; // Redis LIST（投稿記録）
const READY_MIN = 8; // この数のエリアが揃えば投稿（揃わなくても最初の記事から24時間で投稿）

const fail = async (msg) => {
  console.error(msg);
  await discord(`❌ **釣果週報カルーセル** ${msg}`);
  process.exit(1);
};

// 1) 対象週
const tag = arg("week") ?? (await latestWeekTag());
if (!tag) await fail("週報が見つかりません");
const week = parseWeekTag(tag);
console.log(`対象週: ${tag}（${week.label} ${week.range}）`);

if (!dryRun && (await redis(["SISMEMBER", POSTED_KEY, tag]).catch(() => 0))) {
  console.log(`${tag} は投稿済み`);
  process.exit(0);
}

// 2) 週報を読む・出揃い判定
const articles = await fetchWeekArticles(tag);
const firstAt = Math.min(...articles.map((a) => Date.parse(a.publishedAt ?? 0) || Infinity));
const ageH = (Date.now() - firstAt) / 3600e3;
if (!force && articles.length < READY_MIN && !(ageH >= 24)) {
  console.log(`週報がまだ出揃っていない（${articles.length}エリア・最初の公開から${Math.floor(ageH)}時間）→ 次回に持ち越し`);
  process.exit(0);
}
const areas = articles.map(parseArticle)
  .map((a) => ({ ...a, rows: topRows(a.rows.filter((r) => r.heat > 0).length ? a.rows.filter((r) => r.heat > 0) : a.rows) }))
  .filter((a) => a.rows.length)
  .sort((a, b) => Math.max(...b.rows.map((r) => r.heat)) - Math.max(...a.rows.map((r) => r.heat)));
if (!areas.length) await fail(`${tag} の週報から釣果表を読み取れませんでした（記事${articles.length}件）`);
console.log(`エリア: ${areas.map((a) => a.area).join(" / ")}`);

// 3) 写真: プールから「最近使っていない順」に4枚（表紙は縦長を優先）。取れなければ写真なしの表紙で続行
const outDir = path.resolve(arg("out") ?? `out/sns-weekly/${tag}`);
fs.mkdirSync(outDir, { recursive: true });
const PHOTO_USED_KEY = "sns:weekly:photo-used"; // Redis HASH（写真ID → 最後に使った日時）
const PHOTOS_PER_POST = 4;
let photos = [];
let photoIds = [];
try {
  const photosDir = arg("photos-dir");
  let candidates; // [{ id, fetch: () => ローカルパス }]
  if (photosDir) {
    candidates = fs.readdirSync(photosDir).filter((f) => /\.jpe?g$/i.test(f)).map((f) => ({ id: f, fetch: async () => path.resolve(photosDir, f) }));
  } else {
    const { S3Client, ListObjectsV2Command, GetObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-northeast-1" });
    const Bucket = process.env.SNS_ASSETS_BUCKET || "tsurispot-sns-assets";
    const list = (await s3.send(new ListObjectsV2Command({ Bucket, Prefix: "photo-pool/" }))).Contents ?? [];
    const dir = path.join(outDir, "photos");
    fs.mkdirSync(dir, { recursive: true });
    candidates = list.filter((o) => /\.jpe?g$/i.test(o.Key)).map((o) => ({
      id: path.basename(o.Key),
      fetch: async () => {
        const f = path.join(dir, path.basename(o.Key));
        fs.writeFileSync(f, await (await s3.send(new GetObjectCommand({ Bucket, Key: o.Key }))).Body.transformToByteArray());
        return f;
      },
    }));
  }
  const flat = (await redis(["HGETALL", PHOTO_USED_KEY]).catch(() => null)) ?? [];
  const used = Object.fromEntries(flat.flatMap((v, i, a) => (i % 2 ? [] : [[v, Date.parse(a[i + 1]) || 0]])));
  // 未使用 → 古い順。同順位はランダム
  const order = candidates.map((c) => ({ ...c, at: used[c.id] ?? 0, r: Math.random() })).sort((a, b) => a.at - b.at || a.r - b.r);
  const { default: sharp } = await import("sharp");
  const picked = [];
  for (const c of order.slice(0, PHOTOS_PER_POST + 2)) {
    const file = await c.fetch();
    const m = await sharp(file).metadata();
    picked.push({ id: c.id, file, portrait: m.height >= m.width });
  }
  const coverIdx = Math.max(0, picked.findIndex((p) => p.portrait));
  const chosen = [picked[coverIdx], ...picked.filter((_, i) => i !== coverIdx)].filter(Boolean).slice(0, PHOTOS_PER_POST);
  photos = chosen.map((p) => p.file);
  photoIds = chosen.map((p) => p.id);
  console.log(`写真: プール${candidates.length}枚から ${photoIds.join(", ") || "なし"}`);
} catch (e) { console.warn("写真の取得に失敗（写真なしで続行）:", e.message); }

// 4) 描画
const dataPath = path.join(outDir, "week.json");
fs.writeFileSync(dataPath, JSON.stringify({ week, areas, photos }, null, 2));
const out = execFileSync("node", [path.join(here, "render.mjs"), dataPath, outDir], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const slides = JSON.parse(out.trim().split("\n").at(-1));
const caption = fs.readFileSync(path.join(outDir, "caption-instagram.txt"), "utf8");
const label = `${week.label}（${areas.length}エリア・${slides.length}枚・写真${photos.length}枚）`;

if (dryRun) {
  await discord(`🧪 **釣果週報カルーセル（dry-run）** ${label}\n\`\`\`\n${caption.slice(0, 1500)}\n\`\`\``, slides[0]);
  await discord("（2枚目）", slides[1]);
  console.log("dry-run 完了");
  process.exit(0);
}

// 5) 投稿
const userId = process.env.INSTAGRAM_USER_ID;
const token = await getToken("instagram");
if (!userId || !token) await fail(`${week.label} が投稿待ちですが、INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN が未登録です`);

const stamp = Date.now();
const keys = slides.map((f) => `sns/weekly/${tag}-${stamp}/${path.basename(f)}`);
try {
  const imageUrls = [];
  for (const [i, f] of slides.entries()) imageUrls.push(await uploadPublic(f, keys[i], "image/jpeg"));
  const res = await postInstagramCarousel({ userId, token, imageUrls, caption });
  await redis(["SADD", POSTED_KEY, tag]);
  const now = new Date().toISOString();
  if (photoIds.length) await redis(["HSET", PHOTO_USED_KEY, ...photoIds.flatMap((id) => [id, now])]);
  await redis(["LPUSH", LOG_KEY, JSON.stringify({ week: tag, at: new Date().toISOString(), id: res.id, permalink: res.permalink, areas: areas.length, photos: photos.length })]);
  console.log("投稿完了:", res.permalink ?? res.id);
  await discord(`📣 **釣果週報カルーセル** ${label}\n✅ ${res.permalink ?? res.id}`);
} catch (e) {
  await fail(`${week.label} の投稿に失敗: ${e.message}`);
} finally {
  for (const k of keys) await removePublic(k);
}
