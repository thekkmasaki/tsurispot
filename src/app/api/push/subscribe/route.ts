import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isAllowedPushEndpoint, parsePushSubscription } from "@/lib/push-endpoint";

/**
 * Web Push subscription を保存 / 削除する API (Phase 4)
 *
 * 保存先: Upstash Redis の SET 「push:subscriptions」
 * - SADD でユニーク管理
 * - 各エントリは JSON serialize された PushSubscription
 *
 * 送信は /api/push/send (admin only) から SMEMBERS で全件取得して push する
 * 匿名で登録できるため、endpoint は既知の Push サービス宛のみ許可し、IP 単位でレート制限する。
 */

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    if (!(await checkRateLimit(getClientIp(req), "PUSH_SUB", 10, 600, { failClosed: true }))) {
      return NextResponse.json({ error: "too many requests" }, { status: 429 });
    }

    const sub = parsePushSubscription(await req.json().catch(() => null));
    if (!sub) {
      return NextResponse.json({ error: "invalid subscription" }, { status: 400 });
    }

    await redis.sadd("push:subscriptions", JSON.stringify(sub));

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[push/subscribe] error", e);
    return NextResponse.json({ error: "subscribe failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // SMEMBERS 全件走査になるため、濫用による Redis 負荷を防ぐ
    if (!(await checkRateLimit(getClientIp(req), "PUSH_UNSUB", 30, 600, { failClosed: true }))) {
      return NextResponse.json({ error: "too many requests" }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as { endpoint?: unknown };
    const endpoint = body?.endpoint;
    if (typeof endpoint !== "string" || endpoint.length === 0 || endpoint.length > 1000) {
      return NextResponse.json({ error: "endpoint required" }, { status: 400 });
    }
    // 許可外の endpoint は保存され得ないので走査せず成功扱い
    if (!isAllowedPushEndpoint(endpoint)) {
      return NextResponse.json({ ok: true });
    }

    const members = (await redis.smembers("push:subscriptions")) as string[] | null;
    if (members) {
      for (const m of members) {
        try {
          const parsed = JSON.parse(m) as { endpoint?: string };
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
