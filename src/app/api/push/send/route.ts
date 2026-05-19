import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

/**
 * Web Push 通知を全 subscriber に送信する admin API (Phase 4)
 *
 * 認可: ADMIN_RECONCILE_TOKEN を Authorization header に必須 (既設定済み env var を流用)
 * 用途:
 * - 「今週の釣果」週次通知
 * - 「新着スポット」通知
 *
 * VAPID 秘密鍵 (VAPID_PRIVATE_KEY) は既設定済み。
 * VAPID 公開鍵 (NEXT_PUBLIC_VAPID_PUBLIC_KEY) も既設定済み。
 *
 * 注意: web-push は npm 依存追加が必要。 deploy.yml で `npm ci` が走るので
 * package.json に `"web-push": "^3.6.7"` を追加すれば自動的に install される。
 */

export const runtime = "nodejs";
export const maxDuration = 30;

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}

export async function POST(req: NextRequest) {
  // 認可: ADMIN_RECONCILE_TOKEN
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.ADMIN_RECONCILE_TOKEN;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: PushPayload;
  try {
    payload = (await req.json()) as PushPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (!payload.title || !payload.body) {
    return NextResponse.json({ error: "title and body required" }, { status: 400 });
  }

  const members = (await redis.smembers("push:subscriptions")) as string[] | null;
  if (!members || members.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, removed: 0 });
  }

  // web-push を dynamic import (build時 evaluation 回避、 dependency 未 install でも build success)
  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
  } catch (e) {
    console.error("[push/send] web-push module not installed. Run: npm i web-push", e);
    return NextResponse.json({ error: "web-push not installed" }, { status: 500 });
  }

  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT ?? "mailto:dev@tsurispot.jp";
  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/",
    tag: payload.tag ?? "default",
  });

  let sent = 0;
  let removed = 0;
  const removePromises: Promise<unknown>[] = [];

  for (const raw of members) {
    let sub: PushSubscriptionJSON;
    try {
      sub = JSON.parse(raw) as PushSubscriptionJSON;
    } catch {
      continue;
    }
    if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) continue;

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
        },
        body
      );
      sent++;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        // gone / expired → SREM で清掃
        removePromises.push(redis.srem("push:subscriptions", raw));
        removed++;
      } else {
        console.warn("[push/send] failed for endpoint", sub.endpoint, status, e);
      }
    }
  }

  await Promise.all(removePromises);

  return NextResponse.json({ ok: true, sent, removed, total: members.length });
}
