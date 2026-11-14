/**
 * YouTube Data API v3 への動画アップロード（依存ライブラリなし。fetch だけ）
 *
 * 必要な環境変数: YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET / YOUTUBE_REFRESH_TOKEN
 *   リフレッシュトークンの取得: node scripts/sns/youtube-auth.mjs（GitHub Secrets に直接登録する）
 * 公開範囲: YOUTUBE_PRIVACY（既定 private）。
 *   API の利用審査（YouTube API Services Audit）が通るまでは、API で上げた動画は強制的に非公開になる。
 *   審査前は private で上げて YouTube Studio で「公開」に切り替える。審査後に repo variable を public にする。
 */
import fs from "fs";

export function youtubeConfigured() {
  const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN } = process.env;
  return Boolean(YOUTUBE_CLIENT_ID && YOUTUBE_CLIENT_SECRET && YOUTUBE_REFRESH_TOKEN);
}

async function accessToken() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) {
    // invalid_grant = リフレッシュトークン失効（OAuth 同意画面が「テスト」のままだと7日で切れる）
    throw new Error(`YouTube のアクセストークン取得に失敗: ${j.error ?? res.status} ${j.error_description ?? ""}`.trim());
  }
  return j.access_token;
}

/**
 * @param {{ file: string, title: string, description: string, tags?: string[], privacy?: string }} v
 * @returns {Promise<{ id: string, url: string, privacy: string }>}
 */
export async function uploadYouTubeVideo(v) {
  const token = await accessToken();
  const privacy = v.privacy ?? process.env.YOUTUBE_PRIVACY ?? "private";
  const size = fs.statSync(v.file).size;
  const meta = {
    snippet: {
      title: v.title.slice(0, 100),
      description: v.description.slice(0, 5000),
      tags: v.tags ?? [],
      categoryId: "17", // スポーツ
      defaultLanguage: "ja",
      defaultAudioLanguage: "ja",
    },
    status: { privacyStatus: privacy, selfDeclaredMadeForKids: false },
  };
  // 1) 再開可能アップロードのセッションを作る
  const init = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "video/mp4",
      "X-Upload-Content-Length": String(size),
    },
    body: JSON.stringify(meta),
  });
  const session = init.headers.get("location");
  if (!init.ok || !session) throw new Error(`YouTube アップロードの開始に失敗: ${init.status} ${await init.text().catch(() => "")}`);
  // 2) 本体（ショートは数MBなので1回で送る）
  const up = await fetch(session, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(size) },
    body: fs.readFileSync(v.file),
  });
  const j = await up.json().catch(() => ({}));
  if (!up.ok || !j.id) throw new Error(`YouTube アップロードに失敗: ${up.status} ${JSON.stringify(j.error ?? j).slice(0, 300)}`);
  return { id: j.id, url: `https://youtube.com/shorts/${j.id}`, privacy: j.status?.privacyStatus ?? privacy };
}
