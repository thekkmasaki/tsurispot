/**
 * APNs（Apple Push Notification service）プロバイダ送信。
 *
 * iOS ネイティブアプリ（Capacitor）の端末トークン宛にプッシュを送る。
 * Web ブラウザ向けの web-push（VAPID）とは別経路で、`src/lib/push.ts` の
 * `sendPush()` が endpoint プレフィックス `apns://` を見て本モジュールへ振り分ける。
 *
 * - HTTP/2 必須のため Node 標準の `node:http2` を使用（fetch/undici は HTTP/2 非対応）。
 * - 認証は p8 認証キーによる ES256 JWT（Provider Authentication Token）。
 *   署名は依存ゼロの `node:crypto`（`dsaEncoding: "ieee-p1363"` で JWS 形式を直接生成）。
 *
 * 必要な環境変数:
 *   APNS_KEY_ID     … 認証キー（.p8）の Key ID
 *   APNS_TEAM_ID    … Apple Developer の Team ID
 *   APNS_P8         … .p8 の中身（PEM そのまま / \n エスケープ / base64 のいずれか可）
 *   APNS_BUNDLE_ID  … アプリの Bundle ID（既定: com.tsurispot.app）
 *   APNS_PRODUCTION … "false" で sandbox。既定は production。
 */
import * as http2 from "node:http2";
import * as crypto from "node:crypto";

const KEY_ID = process.env.APNS_KEY_ID || "";
const TEAM_ID = process.env.APNS_TEAM_ID || "";
const P8 = process.env.APNS_P8 || "";
const BUNDLE_ID = process.env.APNS_BUNDLE_ID || "com.tsurispot.app";
const IS_PRODUCTION = process.env.APNS_PRODUCTION !== "false";

const APNS_HOST = IS_PRODUCTION
  ? "https://api.push.apple.com"
  : "https://api.sandbox.push.apple.com";

export function apnsConfigured(): boolean {
  return Boolean(KEY_ID && TEAM_ID && P8);
}

/** 環境変数で渡された .p8 を PEM 文字列に正規化する。 */
function decodeP8(raw: string): string {
  let s = raw.trim();
  // 環境変数で改行が \n エスケープされているケースを実改行に戻す
  if (s.includes("\\n")) s = s.replace(/\\n/g, "\n");
  if (s.includes("BEGIN PRIVATE KEY")) return s;
  // base64 で渡された PEM をデコード
  return Buffer.from(s, "base64").toString("utf8");
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

// Provider Token は最大1時間有効。再利用してリクエストごとの署名コストを避ける。
let cachedToken: { jwt: string; iat: number } | null = null;

function getProviderToken(): string {
  const now = Math.floor(Date.now() / 1000);
  // 余裕をもって約50分でローテーション
  if (cachedToken && now - cachedToken.iat < 3000) return cachedToken.jwt;

  const header = { alg: "ES256", kid: KEY_ID };
  const payload = { iss: TEAM_ID, iat: now };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(payload),
  )}`;
  const privateKey = crypto.createPrivateKey(decodeP8(P8));
  const signature = crypto.sign("sha256", Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: "ieee-p1363", // JWS が要求する raw(r||s) 形式で出力
  });
  const jwt = `${signingInput}.${base64url(signature)}`;
  cachedToken = { jwt, iat: now };
  return jwt;
}

export interface ApnsPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * APNs に1件送信。
 * status 410（Unregistered）/ 400（BadDeviceToken）は購読が無効なので、
 * 呼び出し側で削除する（push.ts 経由で test ルートが status を見て削除）。
 */
export async function sendApns(
  deviceToken: string,
  payload: ApnsPayload,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  if (!apnsConfigured()) return { ok: false, error: "APNs未設定" };

  let jwt: string;
  try {
    jwt = getProviderToken();
  } catch (e) {
    cachedToken = null;
    return { ok: false, error: `APNs JWT生成失敗: ${(e as Error).message}` };
  }

  const body = JSON.stringify({
    aps: {
      alert: { title: payload.title, body: payload.body },
      sound: "default",
    },
    ...(payload.url ? { url: payload.url } : {}),
  });

  return new Promise((resolve) => {
    let settled = false;
    const client = http2.connect(APNS_HOST);
    const done = (r: { ok: boolean; status?: number; error?: string }) => {
      if (settled) return;
      settled = true;
      try {
        client.close();
      } catch {
        /* noop */
      }
      resolve(r);
    };

    client.on("error", (err) => done({ ok: false, error: err.message }));

    const headers: Record<string, string> = {
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${jwt}`,
      "apns-topic": BUNDLE_ID,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-expiration": String(Math.floor(Date.now() / 1000) + 3600),
      "content-type": "application/json",
    };
    if (payload.tag) headers["apns-collapse-id"] = payload.tag;

    const req = client.request(headers);

    let status = 0;
    let respBody = "";
    req.on("response", (h) => {
      status = Number(h[":status"]) || 0;
    });
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      respBody += chunk;
    });
    req.on("end", () => {
      if (status === 200) {
        done({ ok: true, status });
        return;
      }
      let reason = respBody;
      try {
        reason = (JSON.parse(respBody) as { reason?: string }).reason || respBody;
      } catch {
        /* レスポンスがJSONでない場合は生テキスト */
      }
      done({ ok: false, status, error: reason });
    });
    req.on("error", (err) => done({ ok: false, error: err.message }));

    req.write(body);
    req.end();
  });
}
