#!/usr/bin/env node
/**
 * 釣果週報カルーセル（週1本）: 週報記事 → スライド画像 → Instagram カルーセル + X（画像4枚）投稿 → 台帳 → Discord
 *
 *   node scripts/sns/weekly-carousel/run.mjs [--week 2026-11-week2] [--dry-run] [--force] [--out out/sns-weekly]
 *   --week:       省略時は microCMS の最新週
 *   --dry-run:    投稿・台帳書き込みをせず、Discord に画像プレビューを送るだけ
 *   --force:      「週報が出揃ったか」の判定を飛ばす
 *
 * 写真は週報に載っている魚の実写だけ（photos.mjs）。週報と関係のない写真は使わない。
 * /weekly-report の最後に workflow_dispatch（--force）で即投稿される。毎日の cron は取りこぼし時の保険。
 * 認証情報が無いのに投稿すべき週がある場合は「失敗」で終わる（黙ってスキップしない）。
 * 投稿済みは媒体ごとに管理する（片方が失敗しても、もう片方は投稿し、失敗した方だけ次回やり直す）。
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { redis, getToken, discord, uploadPublic, removePublic } from "../ranking-reel/lib.mjs";
import { postInstagramCarousel } from "../ranking-reel/platforms.mjs";
import { parseWeekTag, latestWeekTag, fetchWeekArticles, parseArticle, topRows, weekPeriod } from "./data.mjs";
import { loadFishIndex, createPhotoResolver } from "./photos.mjs";
import { youtubeConfigured, uploadYouTubeVideo } from "../youtube.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");
const POSTED_KEY = "sns:weekly:posted"; // Redis SET（Instagram 投稿済み WEEKTAG）
const X_POSTED_KEY = "sns:weekly:x:posted"; // Redis SET（X 投稿済み WEEKTAG）
const X_IMAGES = 4; // X は1投稿に画像4枚まで（表紙＋エリア上位3枚）
const YT_POSTED_KEY = "sns:weekly:yt:posted"; // Redis SET（YouTube ショート投稿済み WEEKTAG）
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

const isPosted = async (key) => !dryRun && Number(await redis(["SISMEMBER", key, tag]).catch(() => 0)) === 1;
// YouTube は認証情報を登録してから有効（未登録の間は毎回 Discord に「未設定」と出す。黙ってスキップしない）
const todo = {
  instagram: !(await isPosted(POSTED_KEY)),
  x: !(await isPosted(X_POSTED_KEY)),
  youtube: youtubeConfigured() && !(await isPosted(YT_POSTED_KEY)),
};
if (!todo.instagram && !todo.x && !todo.youtube) {
  console.log(`${tag} は投稿済み`);
  process.exit(0);
}

// 2) 週報を読む・出揃い判定
const articles = await fetchWeekArticles(tag);
// 表示は実際に扱っている期間（例: 11/2〜11/8）。WEEKTAG の「第N週」は週報を作った週なので使わない
week.period = weekPeriod(articles);
console.log(`期間: ${week.period ?? "（不明。WEEKTAG の表記を使う）"}`);
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

// 3) 出力先と魚の写真（週報に載っている魚の実写だけ。見つからない魚は写真なし）
const outDir = path.resolve(arg("out") ?? `out/sns-weekly/${tag}`);
fs.mkdirSync(outDir, { recursive: true });
const credits = new Set();
try {
  const photoDir = path.join(outDir, "photos");
  fs.mkdirSync(photoDir, { recursive: true });
  let s3;
  const fetchOwner = async (key) => {
    const f = path.join(photoDir, path.basename(key));
    if (fs.existsSync(f)) return f;
    const m = await import("@aws-sdk/client-s3");
    s3 ??= new m.S3Client({ region: process.env.AWS_REGION || "ap-northeast-1" });
    const obj = await s3.send(new m.GetObjectCommand({ Bucket: process.env.SNS_ASSETS_BUCKET || "tsurispot-sns-assets", Key: key }));
    fs.writeFileSync(f, await obj.Body.transformToByteArray());
    return f;
  };
  const resolve = createPhotoResolver(loadFishIndex(), fetchOwner, week.month * 5 + week.weekN);
  for (const a of areas) for (const r of a.rows) {
    r.photo = await resolve(r.fish);
    if (r.photo?.credit) credits.add(r.photo.credit);
  }
  const n = areas.flatMap((a) => a.rows).filter((r) => r.photo).length;
  console.log(`魚の写真: ${n}/${areas.flatMap((a) => a.rows).length}件`);
} catch (e) { console.warn("魚の写真の解決に失敗（写真なしで続行）:", e.message); }

// 4) 描画
const dataPath = path.join(outDir, "week.json");
fs.writeFileSync(dataPath, JSON.stringify({ week, areas, credits: [...credits] }, null, 2));
const out = execFileSync("node", [path.join(here, "render.mjs"), dataPath, outDir], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
const slides = JSON.parse(out.trim().split("\n").at(-1));
const caption = fs.readFileSync(path.join(outDir, "caption-instagram.txt"), "utf8");
const label = `${week.period ?? week.label}（${areas.length}エリア・${slides.length}枚）`;
const xText = fs.readFileSync(path.join(outDir, "caption-x.txt"), "utf8");
const xSlides = slides.slice(0, X_IMAGES);

// YouTube ショート「今週末 釣れてる釣り場TOP5」（作れなくても Instagram / X は止めない）
let short = null;
try {
  const o = execFileSync("node", [path.join(here, "shorts.mjs"), dataPath, outDir], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  const s = JSON.parse(o.trim().split("\n").at(-1));
  short = { file: s.video, ...JSON.parse(fs.readFileSync(s.meta, "utf8")) };
  console.log(`ショート: ${short.title}`);
} catch (e) {
  console.warn("ショート動画を作れませんでした:", e.status === 2 ? "ランキングに足る釣果なし" : e.message);
}

if (dryRun) {
  await discord(`🧪 **釣果週報カルーセル（dry-run）** ${label}\n\`\`\`\n${caption.slice(0, 1500)}\n\`\`\``, slides[0]);
  await discord("（2枚目）", slides[1]);
  await discord(`🧪 **X（dry-run）** 画像${xSlides.length}枚\n\`\`\`\n${xText}\n\`\`\``);
  if (short) await discord(`🧪 **YouTube ショート（dry-run）** ${short.title}`, short.file);
  console.log("dry-run 完了");
  process.exit(0);
}

// 5) 投稿（媒体ごとに独立。片方の失敗でもう片方を止めない）
async function postInstagram() {
  const userId = process.env.INSTAGRAM_USER_ID;
  const token = await getToken("instagram");
  if (!userId || !token) throw new Error("INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN が未登録です");
  const stamp = Date.now();
  const keys = slides.map((f) => `sns/weekly/${tag}-${stamp}/${path.basename(f)}`);
  try {
    const imageUrls = [];
    for (const [i, f] of slides.entries()) imageUrls.push(await uploadPublic(f, keys[i], "image/jpeg"));
    const res = await postInstagramCarousel({ userId, token, imageUrls, caption });
    await redis(["SADD", POSTED_KEY, tag]);
    await redis(["LPUSH", LOG_KEY, JSON.stringify({ platform: "instagram", week: tag, at: new Date().toISOString(), id: res.id, permalink: res.permalink, areas: areas.length })]);
    return res.permalink ?? res.id;
  } finally {
    for (const k of keys) await removePublic(k);
  }
}

async function postX() {
  const { X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } = process.env;
  if (!X_API_KEY || !X_API_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) throw new Error("X_API_KEY などの X 認証情報が未登録です");
  const { TwitterApi } = await import("twitter-api-v2");
  const client = new TwitterApi({ appKey: X_API_KEY, appSecret: X_API_KEY_SECRET, accessToken: X_ACCESS_TOKEN, accessSecret: X_ACCESS_TOKEN_SECRET });
  try {
    const mediaIds = [];
    for (const f of xSlides) mediaIds.push(await client.v2.uploadMedia(fs.readFileSync(f), { media_type: "image/jpeg", media_category: "tweet_image" }));
    const res = await client.v2.tweet({ text: xText, media: { media_ids: mediaIds } });
    const url = `https://x.com/i/status/${res.data.id}`;
    await redis(["SADD", X_POSTED_KEY, tag]);
    await redis(["LPUSH", LOG_KEY, JSON.stringify({ platform: "x", week: tag, at: new Date().toISOString(), id: res.data.id, permalink: url, areas: areas.length })]);
    return url;
  } catch (e) {
    // 402 = API クレジット切れ（X Developer Portal でチャージが必要）
    if (e.code === 402 || /credits/i.test(e.message)) throw new Error(`X API のクレジット切れです（X Developer Portal でチャージしてください）: ${e.message}`);
    throw e;
  }
}

async function postYouTube() {
  if (!short) throw new Error("ショート動画を作れませんでした（ログを確認）");
  const res = await uploadYouTubeVideo({ file: short.file, title: short.title, description: short.description, tags: short.tags });
  await redis(["SADD", YT_POSTED_KEY, tag]);
  await redis(["LPUSH", LOG_KEY, JSON.stringify({ platform: "youtube", week: tag, at: new Date().toISOString(), id: res.id, permalink: res.url, privacy: res.privacy, areas: areas.length })]);
  // API 審査前は非公開でしか上がらない → YouTube Studio で公開に切り替える
  return res.privacy === "public" ? res.url : `${res.url}（${res.privacy}。YouTube Studio で「公開」に切り替えてください）`;
}

if (!youtubeConfigured()) await discord("⏭️ **釣果週報（YouTube）** 認証情報が未登録のためショートは未投稿（scripts/sns/youtube-auth.mjs で登録）", short?.file);

const errors = [];
for (const [name, label2, fn] of [["instagram", "Instagram", postInstagram], ["x", "X", postX], ["youtube", "YouTube", postYouTube]]) {
  if (!todo[name]) { console.log(`${label2}: ${name === "youtube" && !youtubeConfigured() ? "未設定" : "投稿済み"}`); continue; }
  try {
    const url = await fn();
    console.log(`${label2} 投稿完了:`, url);
    await discord(`📣 **釣果週報（${label2}）** ${label}\n✅ ${url}`);
  } catch (e) {
    console.error(`${label2} 投稿失敗:`, e.message);
    errors.push(`${label2}: ${e.message}`);
  }
}
if (errors.length) await fail(`${week.period ?? week.label} の投稿に失敗\n${errors.join("\n")}`);
