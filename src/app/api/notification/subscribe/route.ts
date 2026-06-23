import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  savePushSubscription,
  removePushSubscription,
  getPushSubscriptions,
  type StoredPushSubscription,
} from "@/lib/user-store";
import { getVapidPublicKey } from "@/lib/push";

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
  const body = (await request.json().catch(() => ({}))) as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (
    !body.endpoint ||
    typeof body.endpoint !== "string" ||
    !body.keys?.p256dh ||
    !body.keys?.auth
  ) {
    return NextResponse.json({ error: "購読データが不正です" }, { status: 400 });
  }
  const sub: StoredPushSubscription = {
    endpoint: body.endpoint,
    keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
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
  const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
  if (!body.endpoint) {
    return NextResponse.json({ error: "endpointが必要です" }, { status: 400 });
  }
  await removePushSubscription(userId, body.endpoint);
  return NextResponse.json({ ok: true });
}
