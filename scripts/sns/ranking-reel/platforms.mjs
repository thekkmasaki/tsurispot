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
