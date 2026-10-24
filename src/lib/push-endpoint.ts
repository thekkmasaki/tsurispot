const EXACT_HOSTS = new Set([
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "web.push.apple.com",
]);
const HOST_SUFFIXES = [
  ".push.services.mozilla.com",
  ".notify.windows.com",
  ".push.apple.com",
];

const MAX_ENDPOINT_LENGTH = 1000;
const BASE64URL = /^[A-Za-z0-9_-]+={0,2}$/;

/** 既知の Web Push サービス(https・標準ポート・認証情報なし)宛のみ許可する。SSRF/内部アクセス対策。 */
export function isAllowedPushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== "string" || endpoint.length === 0 || endpoint.length > MAX_ENDPOINT_LENGTH) {
    return false;
  }
  let u: URL;
  try {
    u = new URL(endpoint);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  if (u.username || u.password) return false;
  if (u.port && u.port !== "443") return false;
  const host = u.hostname.toLowerCase();
  if (EXACT_HOSTS.has(host)) return true;
  return HOST_SUFFIXES.some((s) => host.endsWith(s) && host.length > s.length);
}

export interface ValidPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/** endpoint の許可リスト検証 + 鍵の形式/長さ検証。余分なフィールドは落として正規化する。 */
export function parsePushSubscription(input: unknown): ValidPushSubscription | null {
  if (!input || typeof input !== "object") return null;
  const { endpoint, keys } = input as {
    endpoint?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
  if (!isAllowedPushEndpoint(endpoint)) return null;
  const p256dh = keys?.p256dh;
  const auth = keys?.auth;
  if (typeof p256dh !== "string" || p256dh.length < 60 || p256dh.length > 120 || !BASE64URL.test(p256dh)) {
    return null;
  }
  if (typeof auth !== "string" || auth.length < 16 || auth.length > 48 || !BASE64URL.test(auth)) {
    return null;
  }
  return { endpoint, keys: { p256dh, auth } };
}
