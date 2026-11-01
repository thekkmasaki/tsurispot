import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  savePushSubscription,
  removePushSubscription,
  getPushSubscriptions,
  type StoredPushSubscription,
} from "@/lib/user-store";
import { getVapidPublicKey } from "@/lib/push";
import { checkRateLimit } from "@/lib/rate-limit";
import { parsePushSubscription } from "@/lib/push-endpoint";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const subs = await getPushSubscriptions(userId);
  return NextResponse.json({
    subscribed: subs.length > 0,
    count: subs.length,
    publicKey: getVapidPublicKey(),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  if (!(await checkRateLimit(userId, "NOTIF_SUB", 20, 600))) {
    return NextResponse.json({ error: "リクエストが多すぎます" }, { status: 429 });
  }
  const parsed = parsePushSubscription(await request.json().catch(() => null));
  if (!parsed) {
    return NextResponse.json({ error: "購読データが不正です" }, { status: 400 });
  }
  const sub: StoredPushSubscription = parsed;
  await savePushSubscription(userId, sub);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.tsuriId;
  if (!userId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
  if (!body.endpoint) {
    return NextResponse.json({ error: "endpointが必要です" }, { status: 400 });
  }
  await removePushSubscription(userId, body.endpoint);
  return NextResponse.json({ ok: true });
}
