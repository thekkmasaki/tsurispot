/** SNSランキング投稿の共通ユーティリティ（Redis台帳・トークン・Discord・S3） */
import fs from "fs";

export const LEDGER_KEY = "sns:ranking:ledger";
export const TOKEN_KEYS = { instagram: "sns:token:instagram", threads: "sns:token:threads" };

// ── Upstash Redis (REST) ──
function redisCfg() {
  const url = (process.env.UPSTASH_REDIS_REST_URL ?? "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim();
  return url && token ? { url, token } : null;
}
export async function redis(cmd) {
  const cfg = redisCfg();
  if (!cfg) return null;
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
  });
  if (!res.ok) throw new Error(`Redis ${cmd[0]} 失敗: HTTP ${res.status}`);
  return (await res.json()).result;
}

/** 直近の投稿履歴（新しい順） */
export async function readLedger(n = 90) {
  const rows = (await redis(["LRANGE", LEDGER_KEY, "0", String(n - 1)])) ?? [];
  return rows.map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}
export async function appendLedger(entry) {
  await redis(["LPUSH", LEDGER_KEY, JSON.stringify(entry)]);
  await redis(["LTRIM", LEDGER_KEY, "0", "399"]);
}

/** トークン: Redis（自動更新済みの最新値）→ 環境変数（初期値）の順に採用 */
export async function getToken(platform) {
  try {
    const v = await redis(["GET", TOKEN_KEYS[platform]]);
    if (v) return v;
  } catch (e) { console.warn(`Redisからトークン取得失敗(${platform}): ${e.message}`); }
  return platform === "instagram" ? process.env.INSTAGRAM_ACCESS_TOKEN : process.env.THREADS_ACCESS_TOKEN;
}

// ── Discord ──
export async function discord(content, filePath) {
  const hook = process.env.DISCORD_WEBHOOK_URL;
  if (!hook) return;
  try {
    if (filePath && fs.existsSync(filePath)) {
      const fd = new FormData();
      fd.append("payload_json", JSON.stringify({ content }));
      fd.append("files[0]", new Blob([fs.readFileSync(filePath)], { type: "image/png" }), "post.png");
      await fetch(hook, { method: "POST", body: fd });
    } else {
      await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) });
    }
  } catch (e) { console.warn("Discord通知失敗:", e.message); }
}

// ── S3（公開読み取りの既存バケット。Instagram/Threads が URL から取得するため） ──
const BUCKET = process.env.SNS_MEDIA_BUCKET || "tsurispot-uploads";
const REGION = process.env.AWS_REGION || "ap-northeast-1";
let s3mod, s3client;
async function s3() {
  s3mod ??= await import("@aws-sdk/client-s3");
  s3client ??= new s3mod.S3Client({ region: REGION });
  return { client: s3client, m: s3mod };
}
export async function uploadPublic(localPath, key, contentType) {
  const { client, m } = await s3();
  await client.send(new m.PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: fs.readFileSync(localPath), ContentType: contentType, CacheControl: "public, max-age=86400",
  }));
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}
export async function removePublic(key) {
  try { const { client, m } = await s3(); await client.send(new m.DeleteObjectCommand({ Bucket: BUCKET, Key: key })); } catch (e) { console.warn("S3削除失敗:", key, e.message); }
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
