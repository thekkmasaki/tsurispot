/** Instagram リール / Threads 画像投稿 */
import { sleep } from "./lib.mjs";

// Instagram Login API のトークン(IGAA...)は graph.instagram.com、Facebook Login 経由は graph.facebook.com
const igHost = (token) => (token.startsWith("IG") ? "https://graph.instagram.com/v21.0" : "https://graph.facebook.com/v21.0");

async function call(url, params, method = "POST") {
  const body = new URLSearchParams(params);
  const res = await fetch(method === "GET" ? `${url}?${body}` : url, method === "GET" ? {} : { method, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  return json;
}

export async function postInstagramReel({ userId, token, videoUrl, caption }) {
  const host = igHost(token);
  const { id: creationId } = await call(`${host}/${userId}/media`, {
    media_type: "REELS", video_url: videoUrl, caption, share_to_feed: "true", thumb_offset: "3000", access_token: token,
  });
  // 動画の取り込み完了を待つ（最大6分）
  for (let i = 0; i < 36; i++) {
    await sleep(10_000);
    const { status_code, status } = await call(`${host}/${creationId}`, { fields: "status_code,status", access_token: token }, "GET");
    if (status_code === "FINISHED") break;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`動画処理失敗: ${status ?? status_code}`);
    if (i === 35) throw new Error("動画処理がタイムアウト");
  }
  const { id: mediaId } = await call(`${host}/${userId}/media_publish`, { creation_id: creationId, access_token: token });
  const { permalink } = await call(`${host}/${mediaId}`, { fields: "permalink", access_token: token }, "GET").catch(() => ({}));
  return { id: mediaId, permalink };
}

/** 画像カルーセル（2〜10枚・JPEGのみ）。子コンテナ → 親コンテナ → 公開 */
export async function postInstagramCarousel({ userId, token, imageUrls, caption }) {
  if (imageUrls.length < 2 || imageUrls.length > 10) throw new Error(`カルーセルは2〜10枚（${imageUrls.length}枚）`);
  const host = igHost(token);
  const children = [];
  for (const image_url of imageUrls) {
    const { id } = await call(`${host}/${userId}/media`, { image_url, is_carousel_item: "true", access_token: token });
    children.push(id);
  }
  const { id: creationId } = await call(`${host}/${userId}/media`, {
    media_type: "CAROUSEL", children: children.join(","), caption, access_token: token,
  });
  for (let i = 0; i < 30; i++) {
    const { status_code, status } = await call(`${host}/${creationId}`, { fields: "status_code,status", access_token: token }, "GET");
    if (status_code === "FINISHED") break;
    if (status_code === "ERROR" || status_code === "EXPIRED") throw new Error(`カルーセル処理失敗: ${status ?? status_code}`);
    if (i === 29) throw new Error("カルーセル処理がタイムアウト");
    await sleep(5_000);
  }
  const { id: mediaId } = await call(`${host}/${userId}/media_publish`, { creation_id: creationId, access_token: token });
  const { permalink } = await call(`${host}/${mediaId}`, { fields: "permalink", access_token: token }, "GET").catch(() => ({}));
  return { id: mediaId, permalink };
}

export async function postThreadsImage({ userId, token, imageUrl, text }) {
  const host = "https://graph.threads.net/v1.0";
  const { id: creationId } = await call(`${host}/${userId}/threads`, { media_type: "IMAGE", image_url: imageUrl, text, access_token: token });
  await sleep(30_000); // 公式推奨: 公開前に約30秒待つ
  const { id } = await call(`${host}/${userId}/threads_publish`, { creation_id: creationId, access_token: token });
  const { permalink } = await call(`${host}/${id}`, { fields: "permalink", access_token: token }, "GET").catch(() => ({}));
  return { id, permalink };
}

// ── X ──
/** X の重み付き文字数（全角2・半角1。上限280） */
export const xLen = (s) => [...s].reduce((a, c) => a + (c.codePointAt(0) <= 0x10ff ? 1 : 2), 0);

/** 行単位で 280 以内に分ける（1行が長すぎる場合は切り詰める） */
export function splitForX(text) {
  const out = [];
  let cur = "";
  for (let line of text.split("\n")) {
    while (xLen(line) > 270) line = [...line].slice(0, -1).join("");
    const next = cur ? `${cur}\n${line}` : line;
    if (xLen(next) > 280) { out.push(cur); cur = line; } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}

/**
 * 動画付きで X に投稿する（URL を含めない＝API 料金の安い区分）。replyText があれば投稿への返信で続ける（写真の出典など）
 * 必要: X_API_KEY / X_API_KEY_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET（週報の X 投稿と同じ）
 */
export async function postXVideo({ videoBuffer, text, replyText }) {
  const { X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } = process.env;
  const { TwitterApi } = await import("twitter-api-v2");
  const client = new TwitterApi({ appKey: X_API_KEY, appSecret: X_API_KEY_SECRET, accessToken: X_ACCESS_TOKEN, accessSecret: X_ACCESS_TOKEN_SECRET });
  const mediaId = await client.v2.uploadMedia(videoBuffer, { media_type: "video/mp4", media_category: "tweet_video" });
  const res = await client.v2.tweet({ text, media: { media_ids: [mediaId] } });
  const id = res.data.id;
  let parent = id;
  for (const part of replyText ? splitForX(replyText) : []) {
    try { parent = (await client.v2.reply(part, parent)).data.id; }
    catch (e) { console.warn("X の返信（写真の出典）に失敗:", e.message); break; }
  }
  return { id, permalink: `https://x.com/i/status/${id}` };
}

export const xConfigured = () =>
  ["X_API_KEY", "X_API_KEY_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_TOKEN_SECRET"].every((k) => process.env[k]);
