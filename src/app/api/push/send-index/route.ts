import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { getSpotBySlug } from "@/lib/data/spots";
import { fetchSpotForecast } from "@/lib/weather/open-meteo";
import { calcFishingIndex } from "@/lib/weather/fishing-index";
import {
  clusterByDistance,
  pickHomeClusterIndex,
} from "@/lib/geo/activity-cluster";

/**
 * 毎朝の釣行指数 Push 送信（案③）。GitHub Actions (push-morning-index.yml) から毎朝叩かれる。
 * 認可: ADMIN_RECONCILE_TOKEN（push/send と同じ）。
 *
 * 通知の約束: 「80点以上の日だけ」。頻度は指数の閾値で自然に絞られる（通知疲れ対策）。
 * 距離ロジック: 各購読者のお気に入りをクラスタ化し、ホームクラスタ内の最高点だけで判定。
 * 遠征先（離れたクラスタ）の高得点では鳴らさない。
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const KEY = "push:index_subs";
const THRESHOLD = 80;

interface StoredSub {
  sub: { endpoint: string; keys: { p256dh: string; auth: string } };
  favorites?: string[];
  recentSlugs?: string[];
  location?: { lat: number; lng: number } | null;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.ADMIN_RECONCILE_TOKEN;
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const all = (await redis.hgetall(KEY)) as Record<string, unknown> | null;
  const entries = Object.entries(all ?? {});
  if (entries.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, removed: 0 });
  }

  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
  } catch (e) {
    console.error("[push/send-index] web-push module not installed", e);
    return NextResponse.json({ error: "web-push not installed" }, { status: 500 });
  }
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  }
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:dev@tsurispot.jp",
    vapidPublic,
    vapidPrivate,
  );

  // スポット単位でスコアを先に計算して Map 化（購読ループでは参照のみ。maxDuration 対策）
  const allSlugs = new Set<string>();
  const subs: StoredSub[] = [];
  for (const [, rawValue] of entries) {
    try {
      const parsed =
        typeof rawValue === "string"
          ? (JSON.parse(rawValue) as StoredSub)
          : (rawValue as StoredSub);
      if (!parsed?.sub?.endpoint) continue;
      subs.push(parsed);
      for (const s of parsed.favorites ?? []) allSlugs.add(s);
    } catch {
      continue;
    }
  }

  interface SpotScore {
    slug: string;
    name: string;
    lat: number;
    lng: number;
    score: number | null;
    bestDetail: string | null;
  }
  const scoreBySlug = new Map<string, SpotScore>();
  await Promise.all(
    Array.from(allSlugs).map(async (slug) => {
      const spot = getSpotBySlug(slug);
      if (!spot) return;
      const forecast = await fetchSpotForecast(spot.latitude, spot.longitude);
      const today = forecast?.days[0];
      if (!today) {
        scoreBySlug.set(slug, {
          slug,
          name: spot.name,
          lat: spot.latitude,
          lng: spot.longitude,
          score: null,
          bestDetail: null,
        });
        return;
      }
      const r = calcFishingIndex(today.date, spot.longitude, today);
      const best = r.best
        ? `${String(r.best.startHour).padStart(2, "0")}:00-${String(r.best.endHour).padStart(2, "0")}:00`
        : null;
      scoreBySlug.set(slug, {
        slug,
        name: spot.name,
        lat: spot.latitude,
        lng: spot.longitude,
        score: r.score,
        bestDetail: best,
      });
    }),
  );

  let sent = 0;
  let skipped = 0;
  let removed = 0;
  const removePromises: Promise<unknown>[] = [];

  for (const stored of subs) {
    const favSpots = (stored.favorites ?? [])
      .map((s) => scoreBySlug.get(s))
      .filter((s): s is SpotScore => Boolean(s));
    if (favSpots.length === 0) {
      skipped++;
      continue;
    }

    // ホームクラスタ内の最高点だけで判定（遠征先の高得点で鳴らさない）
    const clusters = clusterByDistance(
      favSpots.map((s) => ({ slug: s.slug, lat: s.lat, lng: s.lng })),
    );
    const homeIdx = pickHomeClusterIndex(clusters, {
      location: stored.location ?? null,
      recentSlugs: stored.recentSlugs ?? [],
    });
    const homeSlugs = new Set(clusters[homeIdx]?.spotSlugs ?? []);
    const homeTop = favSpots
      .filter((s) => homeSlugs.has(s.slug) && s.score !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];

    if (!homeTop || (homeTop.score ?? 0) < THRESHOLD) {
      skipped++;
      continue;
    }

    const bodyText = homeTop.bestDetail
      ? `${homeTop.name} ${homeTop.score}点。${homeTop.bestDetail} が勝負です`
      : `${homeTop.name} ${homeTop.score}点。絶好の釣り日和です`;
    try {
      await webpush.sendNotification(
        stored.sub,
        JSON.stringify({
          title: `今日の釣行指数 ${homeTop.score}点`,
          body: bodyText,
          url: `/spots/${homeTop.slug}`,
          tag: "morning-index",
        }),
      );
      sent++;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        removePromises.push(redis.hdel(KEY, stored.sub.endpoint));
        removed++;
      } else {
        console.warn("[push/send-index] failed", stored.sub.endpoint, status);
      }
    }
  }

  await Promise.all(removePromises);
  return NextResponse.json({
    ok: true,
    sent,
    skipped,
    removed,
    total: subs.length,
    spots: allSlugs.size,
  });
}
