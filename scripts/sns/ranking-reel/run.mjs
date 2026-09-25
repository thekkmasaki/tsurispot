#!/usr/bin/env node
/**
 * SNSランキング投稿（1日1本）: お題選定 → 画像 → リール動画 → Instagram/Threads 投稿 → 台帳 → Discord
 *
 *   node scripts/sns/ranking-reel/run.mjs [--dry-run] [--date YYYY-MM-DD] [--pref hyogo --fish tachiuo]
 *                                         [--platforms instagram,threads] [--out out/sns-ranking]
 *   --dry-run: 投稿・台帳書き込みをせず、画像をDiscordにプレビュー送信するだけ
 *
 * 必要な環境変数: INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN, THREADS_USER_ID / THREADS_ACCESS_TOKEN,
 *   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, UPSTASH_REDIS_REST_URL / _TOKEN, DISCORD_WEBHOOK_URL（任意）
 *   未設定のプラットフォームは自動でスキップする。
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readLedger, appendLedger, getToken, discord, uploadPublic, removePublic } from "./lib.mjs";
import { postInstagramReel, postThreadsImage } from "./platforms.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const dryRun = argv.includes("--dry-run");
const date = arg("date") ?? new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const platforms = new Set((arg("platforms") ?? "instagram,threads").split(","));
const outDir = path.resolve(arg("out") ?? `out/sns-ranking/${date}`);
fs.mkdirSync(outDir, { recursive: true });

// 1) 台帳から重複回避条件を作る: 同じ県×魚は60日空ける / 直近4本の魚種・直近2本の県は避ける
const ledger = await readLedger(90).catch((e) => { console.warn("台帳読込失敗（重複回避なしで続行）:", e.message); return []; });
const since = Date.parse(date) - 60 * 864e5;
const exclude = ledger.filter((e) => Date.parse(e.date) >= since).map((e) => `${e.pref}/${e.fish}`);
const recentFish = ledger.slice(0, 4).map((e) => e.fish);
const recentPref = ledger.slice(0, 2).map((e) => e.pref);
if (!dryRun && ledger.some((e) => e.date === date && e.ok)) {
  console.log(`${date} は投稿済みのためスキップ`);
  process.exit(0);
}
if (!dryRun) {
  const hasIg = platforms.has("instagram") && process.env.INSTAGRAM_USER_ID && (await getToken("instagram"));
  const hasTh = platforms.has("threads") && process.env.THREADS_USER_ID && (await getToken("threads"));
  if (!hasIg && !hasTh) {
    console.log("投稿先の認証情報が未登録のためスキップ");
    await discord("⏭️ **SNSランキング投稿** 認証情報（INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN 等）が未登録のためスキップしました");
    process.exit(0);
  }
}

// 2) お題選定（サイトと同じデータ・同じ掲載基準）
const selArgs = ["--yes", "tsx@4.23.15", path.join(here, "select-topic.ts"), "--date", date,
  "--exclude", exclude.join(","), "--recent-fish", recentFish.join(","), "--recent-pref", recentPref.join(",")];
for (const k of ["pref", "fish", "month"]) if (arg(k)) selArgs.push(`--${k}`, arg(k));
const topicPath = path.join(outDir, "topic.json");
fs.writeFileSync(topicPath, execFileSync("npx", selArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }));
const topic = JSON.parse(fs.readFileSync(topicPath, "utf8"));
const label = `${topic.month.name}×${topic.pref.name}×${topic.fish.name}`;
console.log(`お題: ${label}（${topic.spots.length}件）`);

// 3) 画像・キャプション・動画
execFileSync("node", [path.join(here, "render.mjs"), topicPath, outDir], { stdio: "inherit" });
// BGM: SNS_BGM_DIR 内の mp3 を日替わりで選ぶ。ファイル名の「@秒数」をサビ等の開始位置として使う（例: track@32.5.mp3）
const bgm = pickBgm(process.env.SNS_BGM_DIR, date);
if (bgm) console.log(`BGM: ${path.basename(bgm.file)}（${bgm.offset}秒から）`);
execFileSync("bash", [path.join(here, "make-video.sh"), path.join(outDir, "post.png"), path.join(outDir, "reel.mp4"), bgm?.file ?? "", String(bgm?.offset ?? 0)], { stdio: "inherit" });
const igCaption = fs.readFileSync(path.join(outDir, "caption-instagram.txt"), "utf8");
const thText = fs.readFileSync(path.join(outDir, "caption-threads.txt"), "utf8");

if (dryRun) {
  await discord(`🧪 **SNSランキング（dry-run）** ${label}\n${topic.url}\n\`\`\`\n${igCaption.slice(0, 1500)}\n\`\`\``, path.join(outDir, "post.png"));
  console.log("dry-run 完了:", outDir);
  process.exit(0);
}

// 4) 公開URLを用意して投稿
const base = `sns/ranking/${date}-${topic.pref.slug}-${topic.fish.slug}`;
const videoUrl = await uploadPublic(path.join(outDir, "reel.mp4"), `${base}.mp4`, "video/mp4");
const imageUrl = await uploadPublic(path.join(outDir, "post.png"), `${base}.png`, "image/png");
const result = {};

async function attempt(name, fn) {
  if (!platforms.has(name)) return;
  try { result[name] = await fn(); console.log(`✅ ${name}:`, result[name].permalink ?? result[name].id); }
  catch (e) { result[name] = { error: e.message }; console.error(`❌ ${name}:`, e.message); }
}
const igToken = await getToken("instagram");
if (process.env.INSTAGRAM_USER_ID && igToken) {
  await attempt("instagram", () => postInstagramReel({ userId: process.env.INSTAGRAM_USER_ID, token: igToken, videoUrl, caption: igCaption }));
} else if (platforms.has("instagram")) result.instagram = { skipped: "認証情報なし" };
const thToken = await getToken("threads");
if (process.env.THREADS_USER_ID && thToken) {
  await attempt("threads", () => postThreadsImage({ userId: process.env.THREADS_USER_ID, token: thToken, imageUrl, text: thText }));
} else if (platforms.has("threads")) result.threads = { skipped: "認証情報なし" };

await removePublic(`${base}.mp4`);
await removePublic(`${base}.png`);

// 5) 台帳・通知
const posted = Object.values(result).filter((r) => r.id);
const failed = Object.entries(result).filter(([, r]) => r.error);
await appendLedger({ date, pref: topic.pref.slug, fish: topic.fish.slug, month: topic.month.num, ok: posted.length > 0,
  instagram: result.instagram?.permalink ?? result.instagram?.id ?? null, threads: result.threads?.permalink ?? result.threads?.id ?? null });
const fmt = (k) => { const r = result[k]; return !r ? "" : r.id ? `✅ ${k}: ${r.permalink ?? r.id}` : r.error ? `❌ ${k}: ${r.error}` : `⏭️ ${k}: ${r.skipped}`; };
await discord(`${failed.length ? "⚠️" : "📣"} **SNSランキング投稿** ${label}\n${["instagram", "threads"].map(fmt).filter(Boolean).join("\n")}\n${topic.url}`);
if (posted.length === 0) process.exit(1);

function pickBgm(dir, seed) {
  if (!dir || !fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => /\.(mp3|m4a|wav)$/i.test(f)).sort();
  if (files.length === 0) return null;
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const f = files[h % files.length];
  const m = f.match(/@(\d+(?:\.\d+)?)\.[a-z0-9]+$/i);
  return { file: path.join(dir, f), offset: m ? Number(m[1]) : 0 };
}
