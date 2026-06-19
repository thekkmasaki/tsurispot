import webpush, { type PushSubscription as WebPushSubscription } from "web-push";
import { sendApns } from "./apns";

/** APNs（iOS ネイティブ）購読を識別する endpoint プレフィックス */
export const APNS_ENDPOINT_PREFIX = "apns://";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:dev@tsurispot.jp";

let configured = false;
function ensureVapid() {
  if (configured) return true;
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Web Push を1件送信。失敗時は { ok: false, status } を返す。
 * status === 410 (Gone) は購読が無効なので呼び出し側で削除推奨。
 */
export async function sendPush(
  subscription: WebPushSubscription,
  payload: PushPayload,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  // iOS ネイティブ（Capacitor）端末は APNs 経路へ振り分ける。
  // endpoint は "apns://<deviceToken>" 形式で保存されている。
  if (subscription.endpoint?.startsWith(APNS_ENDPOINT_PREFIX)) {
    const token = subscription.endpoint.slice(APNS_ENDPOINT_PREFIX.length);
    return sendApns(token, payload);
  }
  if (!ensureVapid()) {
    return { ok: false, error: "VAPID未設定" };
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (err) {
    const e = err as { statusCode?: number; message?: string };
    return { ok: false, status: e.statusCode, error: e.message };
  }
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC;
}
