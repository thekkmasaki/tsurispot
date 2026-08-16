import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * 毎朝の釣行指数 Push の購読（案③）。認証不要（匿名 OK）。
 * 既存の push:subscriptions (SET) は週報の一斉配信専用でメタデータを持てないため、
 * お気に入り連動の個別配信用に HSET push:index_subs (field=endpoint) を新設する。
 *
 * body: { subscription: PushSubscriptionJSON, favorites: string[], recentSlugs?: string[], location?: {lat,lng} }
 * 通知条件はサーバー固定: ホームクラスタ内の最高指数が 80 点以上の朝だけ。
 */

const KEY = "push:index_subs";
const MAX_FAVORITES = 20;

interface SubscriptionJSON {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

interface RequestBody {
  subscription?: SubscriptionJSON;
  favorites?: unknown;
  recentSlugs?: unknown;
  location?: { lat?: unknown; lng?: unknown } | null;
}

function sanitizeSlugs(input: unknown, cap: number): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(
      input.filter((s): s is string => typeof s === "string" && s.length < 200),
    ),
  ).slice(0, cap);
}

export async function POST(request: Request) {
  // 偽subscriptionの大量登録によるHSET肥大・送信コスト増を防ぐ
  if (!(await checkRateLimit(getClientIp(request), "PUSH_IDX_SUB", 10, 600))) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらくしてからお試しください。" },
      { status: 429 },
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }

  const sub = body.subscription;
  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ error: "subscription が不正です" }, { status: 400 });
  }
  const favorites = sanitizeSlugs(body.favorites, MAX_FAVORITES);
  if (favorites.length === 0) {
    return NextResponse.json(
      { error: "お気に入りが1件以上必要です" },
      { status: 400 },
    );
  }
  const recentSlugs = sanitizeSlugs(body.recentSlugs, 8);
  const location =
    body.location &&
    typeof body.location.lat === "number" &&
    typeof body.location.lng === "number"
      ? { lat: body.location.lat, lng: body.location.lng }
      : null;

  await redis.hset(KEY, {
    [sub.endpoint]: JSON.stringify({
      sub: { endpoint: sub.endpoint, keys: sub.keys },
      favorites,
      recentSlugs,
      location,
      updatedAt: Date.now(),
    }),
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "不正なリクエスト" }, { status: 400 });
  }
  if (!body.endpoint) {
    return NextResponse.json({ error: "endpoint が必要です" }, { status: 400 });
  }
  await redis.hdel(KEY, body.endpoint);
  return NextResponse.json({ ok: true });
}
