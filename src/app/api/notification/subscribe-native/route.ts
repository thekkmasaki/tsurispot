import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  savePushSubscription,
  removePushSubscription,
  type StoredPushSubscription,
} from "@/lib/auth-redis";
import { APNS_ENDPOINT_PREFIX } from "@/lib/push";

// node:http2 / node:crypto を使う APNs 送信基盤と同じ Node ランタイムで動かす
export const runtime = "nodejs";

/**
 * iOS ネイティブアプリ（Capacitor）の APNs 端末トークンを保存する。
 * Web の web-push と同じ Redis ストアに endpoint="apns://<token>" の形で相乗りさせ、
 * 送信時に push.ts が endpoint プレフィックスで経路を振り分ける。
 */
export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json(
      { error: "端末トークンが不正です" },
      { status: 400 },
    );
  }
  const sub: StoredPushSubscription = {
    endpoint: `${APNS_ENDPOINT_PREFIX}${token}`,
    // 既存 StoredPushSubscription 型に合わせるためのプレースホルダ（APNs では未使用）
    keys: { p256dh: "", auth: "" },
  };
  await savePushSubscription(userId, sub);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) {
    return NextResponse.json({ error: "端末トークンが必要です" }, { status: 400 });
  }
  await removePushSubscription(userId, `${APNS_ENDPOINT_PREFIX}${token}`);
  return NextResponse.json({ ok: true });
}
