import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

/**
 * Web Push subscription を保存 / 削除する API (Phase 4)
 *
 * 保存先: Upstash Redis の SET 「push:subscriptions」
 * - SADD でユニーク管理
 * - 各エントリは JSON serialize された PushSubscription
 *
 * 送信は /api/push/send (admin only) から SMEMBERS で全件取得して push する
 */

export const runtime = "nodejs";

interface PushSubscriptionJSON {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
  expirationTime?: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const sub = (await req.json()) as PushSubscriptionJSON;
    if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
      return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
    }

    // endpoint をキーにして重複排除 (SET<string>)
    await redis.sadd("push:subscriptions", JSON.stringify(sub));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[push/subscribe] error", e);
    return NextResponse.json({ error: "subscribe failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = (await req.json()) as { endpoint?: string };
    if (!endpoint) {
      return NextResponse.json({ error: "endpoint required" }, { status: 400 });
    }

    // SMEMBERS で全件取得 → endpoint 一致するものを SREM
    const members = (await redis.smembers("push:subscriptions")) as string[] | null;
    if (members) {
      for (const m of members) {
        try {
          const parsed = JSON.parse(m) as PushSubscriptionJSON;
          if (parsed.endpoint === endpoint) {
            await redis.srem("push:subscriptions", m);
          }
        } catch {
          // malformed entry は次回掃除する想定で skip
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[push/subscribe DELETE] error", e);
    return NextResponse.json({ error: "unsubscribe failed" }, { status: 500 });
  }
}
