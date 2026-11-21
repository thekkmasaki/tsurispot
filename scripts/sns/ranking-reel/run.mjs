#!/usr/bin/env node
/**
 * SNSランキング投稿（1日2本: 朝 am / 夜 pm）: お題選定 → 画像 → リール動画 → Instagram/Threads 投稿 → 台帳 → Discord
 *
 *   node scripts/sns/ranking-reel/run.mjs [--dry-run] [--date YYYY-MM-DD] [--pref hyogo --fish tachiuo]
 *                                         [--platforms instagram,threads] [--out out/sns-ranking] [--slot am|pm]
 *   --dry-run: 投稿・台帳書き込みをせず、画像をDiscordにプレビュー送信するだけ
 *   --slot: 朝の枠(am)か夜の枠(pm、既定)か。投稿済み判定は日付×枠ごと（slot の無い古い台帳行は pm 扱い）
 *
 * 投稿前に、載せるスポットが釣り禁止・立入禁止でないかを Claude のウェブ検索で確認する（check-bans.mjs。ANTHROPIC_API_KEY 必須）。
 * 必要な環境変数: ANTHROPIC_API_KEY, INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN, THREADS_ACCESS_TOKEN（THREADS_USER_ID は任意。無ければトークンから取得）,
 *   AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY, UPSTASH_REDIS_REST_URL / _TOKEN, DISCORD_WEBHOOK_URL（任意）
 *   未設定のプラットフォームは自動でスキップする。
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readLedger, appendLedger, getToken, discord, uploadPublic, removePublic } from "./lib.mjs";
import { checkBans } from "./check-bans.mjs";
import { postInstagramReel, postThreadsImage, postXVideo, xConfigured } from "./platforms.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const dryRun = argv.includes("--dry-run");
const date = arg("date") ?? new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const slot = arg("slot") === "am" ? "am" : "pm";
const slotOf = (e) => e.slot ?? "pm";
const platforms = new Set((arg("platforms") ?? "instagram,threads,x").split(","));
const outDir = path.resolve(arg("out") ?? `out/sns-ranking/${date}-${slot}`);
fs.mkdirSync(outDir, { recursive: true });

// 1) 台帳から重複回避条件を作る: 同じ県×魚は60日空ける / 直近4本の魚種・直近2本の県は避ける
const ledger = await readLedger(90).catch((e) => { console.warn("台帳読込失敗（重複回避なしで続行）:", e.message); return []; });
const since = Date.parse(date) - 60 * 864e5;
const exclude = ledger.filter((e) => Date.parse(e.date) >= since).map((e) => `${e.pref}/${e.fish}`);
const recentFish = ledger.slice(0, 4).map((e) => e.fish);
const recentPref = ledger.slice(0, 2).map((e) => e.pref);
if (!dryRun && ledger.some((e) => e.date === date && slotOf(e) === slot && e.ok)) {
  console.log(`${date} ${slot} は投稿済みのためスキップ`);
  process.exit(0);
}
if (!dryRun) {
  const hasIg = platforms.has("instagram") && process.env.INSTAGRAM_USER_ID && (await getToken("instagram"));
  const hasTh = platforms.has("threads") && (await getToken("threads"));
  if (!hasIg && !hasTh) {
    console.log("投稿先の認証情報が未登録のためスキップ");
    await discord("⏭️ **SNSランキング投稿** 認証情報（INSTAGRAM_USER_ID / INSTAGRAM_ACCESS_TOKEN 等）が未登録のためスキップしました");
    process.exit(0);
  }
}

// 2) お題選定（サイトと同じデータ・同じ掲載基準）→ 投稿前の禁止チェック（check-bans.mjs）
//    禁止・一部禁止・疑いありのスポットは外して次点から補充し、もう一度チェックする（最大4回）。
//    チェックできなかった場合（API キー無し・API 失敗）は投稿しない。SNS は拡散されるので「確認できたものだけ載せる」。
const topicPath = path.join(outDir, "topic.json");
const blocked = [];
const dropped = []; // Discord に出す: 外したスポットと理由
let topic;
let fixedPref = arg("pref");
let fixedFish = arg("fish");
for (let round = 1; ; round++) {
  const selArgs = ["--yes", "tsx@4.23.15", path.join(here, "select-topic.ts"), "--date", date,
    "--exclude", exclude.join(","), "--recent-fish", recentFish.join(","), "--recent-pref", recentPref.join(","),
    "--block", blocked.join(",")];
  if (fixedPref) selArgs.push("--pref", fixedPref);
  if (fixedFish) selArgs.push("--fish", fixedFish);
  if (arg("month")) selArgs.push("--month", arg("month"));
  fs.writeFileSync(topicPath, execFileSync("npx", selArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }));
  topic = JSON.parse(fs.readFileSync(topicPath, "utf8"));
  // 補充の回はお題（県×魚）を変えない
  fixedPref = topic.pref.slug;
  fixedFish = topic.fish.slug;

  const check = await checkBans(topic);
  const ng = topic.spots.filter((s) => check.results[s.slug] && !check.results[s.slug].postable);
  for (const s of ng) {
    const r = check.results[s.slug];
    blocked.push(s.slug);
    dropped.push(`・${s.name}（${s.slug}）: ${r.verdict} — ${r.reason}${r.sources.length ? `\n  ${r.sources.join("\n  ")}` : ""}`);
  }
  console.log(`禁止チェック ${round}回目: ${topic.spots.length}件中 ${ng.length}件を除外${check.ok ? "" : `（${check.error}）`}`);
  if (!check.ok && dryRun) {
    console.warn(`dry-run のため禁止チェック未完了のまま続行: ${check.error}`);
    break;
  }
  if (!check.ok) {
    await discord(`🛑 **SNSランキング投稿** 投稿前の禁止チェックができなかったため投稿を中止しました\n${check.error}${dropped.length ? `\n\n除外したスポット:\n${dropped.join("\n")}` : ""}`);
    process.exit(1);
  }
  if (ng.length === 0) break;
  if (round >= 4) {
    await discord(`🛑 **SNSランキング投稿** 禁止の疑いがあるスポットが多く、4回補充しても揃わないため投稿を中止しました（${topic.pref.name}×${topic.fish.name}）\n${dropped.join("\n")}`);
    process.exit(1);
  }
}
if (topic.spots.length < 5) {
  await discord(`🛑 **SNSランキング投稿** 禁止チェック後の掲載が${topic.spots.length}件しかないため投稿を中止しました（${topic.pref.name}×${topic.fish.name}）\n${dropped.join("\n")}`);
  process.exit(1);
}
if (dropped.length) {
  // サイトの掲載も直す必要があるかもしれないので、毎回通知する（fishingBan の付与は人が一次情報を見て判断する）
  await discord(`⚠️ **SNSランキング投稿** 禁止の疑いでリールから外したスポット（サイトの掲載も要確認）\n${dropped.join("\n")}`.slice(0, 1900));
}
const label = `${topic.month.name}×${topic.pref.name}×${topic.fish.name}`;
console.log(`お題: ${label}（${topic.spots.length}件）`);

// 3) 画像・キャプション・動画
execFileSync("node", [path.join(here, "render.mjs"), topicPath, outDir], { stdio: "inherit" });
// BGM: SNS_BGM_DIR 内の mp3 を日替わりで選ぶ。ファイル名の「@秒数」をサビ等の開始位置として使う（例: track@32.5.mp3）
const bgm = pickBgm(process.env.SNS_BGM_DIR, `${date}-${slot}`);
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
const base = `sns/ranking/${date}-${slot}-${topic.pref.slug}-${topic.fish.slug}`;
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
if (platforms.has("threads") && thToken) {
  await attempt("threads", async () => postThreadsImage({ userId: await threadsUserId(thToken), token: thToken, imageUrl, text: thText }));
} else if (platforms.has("threads")) result.threads = { skipped: "認証情報なし" };
// X: 動画をそのまま投稿（本文に URL なし）。写真の出典は返信で出す
if (platforms.has("x") && xConfigured()) {
  await attempt("x", () => postXVideo({
    videoBuffer: fs.readFileSync(path.join(outDir, "reel.mp4")),
    text: fs.readFileSync(path.join(outDir, "caption-x.txt"), "utf8"),
    replyText: fs.readFileSync(path.join(outDir, "caption-x-credits.txt"), "utf8"),
  }));
} else if (platforms.has("x")) result.x = { skipped: "認証情報なし" };

await removePublic(`${base}.mp4`);
await removePublic(`${base}.png`);

// 5) 台帳・通知
const posted = Object.values(result).filter((r) => r.id);
const failed = Object.entries(result).filter(([, r]) => r.error);
await appendLedger({ date, slot, pref: topic.pref.slug, fish: topic.fish.slug, month: topic.month.num, ok: posted.length > 0,
  instagram: result.instagram?.permalink ?? result.instagram?.id ?? null, threads: result.threads?.permalink ?? result.threads?.id ?? null,
  x: result.x?.permalink ?? result.x?.id ?? null });
const fmt = (k) => { const r = result[k]; return !r ? "" : r.id ? `✅ ${k}: ${r.permalink ?? r.id}` : r.error ? `❌ ${k}: ${r.error}` : `⏭️ ${k}: ${r.skipped}`; };
await discord(`${failed.length ? "⚠️" : "📣"} **SNSランキング投稿** ${label}\n${["instagram", "threads", "x"].map(fmt).filter(Boolean).join("\n")}\n${topic.url}`);
if (posted.length === 0) process.exit(1);

/** Threads のユーザーID: Secret に無ければトークンの持ち主（/me）から取る */
async function threadsUserId(token) {
  if (process.env.THREADS_USER_ID) return process.env.THREADS_USER_ID;
  const res = await fetch(`https://graph.threads.net/v1.0/me?fields=id&access_token=${encodeURIComponent(token)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.id) throw new Error(`Threads のユーザーID取得に失敗: ${res.status} ${json.error?.message ?? ""}`);
  return json.id;
}

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
