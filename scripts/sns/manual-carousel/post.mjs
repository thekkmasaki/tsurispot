#!/usr/bin/env node
/**
 * 単発カルーセル: 作成済みの画像とキャプションを Instagram にそのまま投稿する。
 *   node scripts/sns/manual-carousel/post.mjs <投稿名> [--dry-run] [--force]
 *
 * 投稿の中身は posts/<投稿名>/ に置く:
 *   slide-01.jpg … slide-NN.jpg（2〜10枚・JPEG・ファイル名の順に並ぶ）
 *   caption-instagram.txt（2,200字まで）
 * 週報（weekly-carousel）と違い画像は生成しない。置いたものをそのまま出す。
 * 二重投稿を防ぐため、投稿済みの名前は Redis に記録する（--force で無視）。
 */
import path from "path";
import { fileURLToPath } from "url";
import { redis, getToken, discord, uploadPublic, removePublic } from "../ranking-reel/lib.mjs";
import { postInstagramCarousel } from "../ranking-reel/platforms.mjs";
import { loadPost } from "./load.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const name = argv.find((a) => !a.startsWith("--"));
const dryRun = argv.includes("--dry-run");
const force = argv.includes("--force");
const POSTED_KEY = "sns:manual:posted"; // Redis SET（投稿済みの投稿名）
const LOG_KEY = "sns:manual:ledger"; // Redis LIST（投稿記録）

const fail = async (msg) => {
  console.error(msg);
  await discord(`❌ **単発カルーセル** ${msg}`);
  process.exit(1);
};

if (!name) await fail("投稿名を指定してください（scripts/sns/manual-carousel/posts/ のフォルダ名）");

let post;
try {
  post = loadPost(path.join(here, "posts"), name);
} catch (e) {
  await fail(e.message);
}
const { slides, caption } = post;
console.log(`投稿名: ${name} / 画像${slides.length}枚 / キャプション${[...caption].length}字`);

if (dryRun) {
  await discord(`🧪 **単発カルーセル（dry-run）** ${name}・画像${slides.length}枚\n\`\`\`\n${caption.slice(0, 1700)}\n\`\`\``, slides[0]);
  for (const f of slides.slice(1)) await discord(`🧪 ${name} ${path.basename(f)}`, f);
  console.log("dry-run 完了（投稿していません）");
  process.exit(0);
}

if (!force && Number(await redis(["SISMEMBER", POSTED_KEY, name]).catch(() => 0)) === 1) {
  console.log(`「${name}」は投稿済みです（もう一度出すなら --force）`);
  await discord(`⏭ **単発カルーセル** 「${name}」は投稿済みのため何もしていません`);
  process.exit(0);
}

const userId = process.env.INSTAGRAM_USER_ID;
const token = await getToken("instagram");
// 認証が無いときは失敗にする（緑のまま何も投稿されない状態を作らない）
if (!userId || !token) await fail("INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN が未登録です");

const stamp = Date.now();
const keys = slides.map((f) => `sns/manual/${name}-${stamp}/${path.basename(f)}`);
try {
  const imageUrls = [];
  for (const [i, f] of slides.entries()) imageUrls.push(await uploadPublic(f, keys[i], "image/jpeg"));
  const res = await postInstagramCarousel({ userId, token, imageUrls, caption });
  await redis(["SADD", POSTED_KEY, name]);
  await redis(["LPUSH", LOG_KEY, JSON.stringify({ platform: "instagram", name, at: new Date().toISOString(), id: res.id, permalink: res.permalink, slides: slides.length })]);
  const link = res.permalink ?? res.id;
  console.log(`投稿しました: ${link}`);
  await discord(`✅ **単発カルーセル** 「${name}」を Instagram に投稿しました\n${link}`);
} catch (e) {
  await fail(`「${name}」の投稿に失敗: ${e.message}`);
} finally {
  for (const k of keys) await removePublic(k);
}
