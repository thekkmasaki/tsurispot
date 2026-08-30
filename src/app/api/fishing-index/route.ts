import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSpotBySlug } from "@/lib/data/spots";
import { fetchSpotForecast, type SpotForecast } from "@/lib/weather/open-meteo";
import {
  calcFishingIndex,
  type FishingIndexResult,
} from "@/lib/weather/fishing-index";
import { getTideDisplayMode, getTideStationForSpot } from "@/lib/tide/nearest-station";
import { getTideInfoForDate } from "@/lib/tide/tide-info";
import {
  clusterByDistance,
  pickHomeClusterIndex,
} from "@/lib/geo/activity-cluster";

/**
 * 今日の釣行指数API（案③）。認証不要 — 匿名の localStorage お気に入りが入力になる。
 * body: { slugs: string[], recentSlugs?: string[], location?: {lat,lng} }
 *
 * 距離ロジック: スコアには手を入れず、お気に入りを行動圏クラスタ（60km目安）に分け、
 * ホームクラスタ（現在地最近傍 or 件数+閲覧履歴）を isHome で返す。
 * 「今日の1位」と Push 判定はホームクラスタ内のみで行う（遠征先の高得点で誤誘導しない）。
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SLUGS = 20;
const MAX_RECENT = 8;

interface RequestBody {
  slugs?: unknown;
  recentSlugs?: unknown;
  location?: { lat?: unknown; lng?: unknown } | null;
}

interface SpotIndexPayload {
  slug: string;
  name: string;
  prefecture: string;
  /** 7日分のスコア（天気取得失敗時は null） */
  scores: (number | null)[];
  dates: string[];
  today: FishingIndexResult | null;
  weatherOk: boolean;
}

function sanitizeSlugs(input: unknown, cap: number): string[] {
  if (!Array.isArray(input)) return [];
  return Array.from(
    new Set(input.filter((s): s is string => typeof s === "string" && s.length < 200)),
  ).slice(0, cap);
}

export async function POST(request: Request) {
  // 認証不要APIかつ外部API(Open-Meteo)への増幅があるため、IPレート制限をかける
  // （通常利用はクライアントの30分sessionStorageキャッシュで1回/30分）
  if (!(await checkRateLimit(getClientIp(request), "FISHING_INDEX", 30, 600))) {
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

  const slugs = sanitizeSlugs(body.slugs, MAX_SLUGS);
  const recentSlugs = sanitizeSlugs(body.recentSlugs, MAX_RECENT);
  const location =
    body.location &&
    typeof body.location.lat === "number" &&
    typeof body.location.lng === "number" &&
    Math.abs(body.location.lat) <= 90 &&
    Math.abs(body.location.lng) <= 180
      ? { lat: body.location.lat, lng: body.location.lng }
      : null;

  const spots = slugs
    .map((slug) => getSpotBySlug(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  if (spots.length === 0) {
    return NextResponse.json({ spots: [], clusters: [], dates: [] });
  }

  // 座標は2桁丸めで正規化してあるので、近接スポットは同一URL → Next fetch キャッシュ共有
  const coordKey = (lat: number, lng: number) =>
    `${lat.toFixed(2)},${lng.toFixed(2)}`;
  const uniqueCoords = new Map<string, { lat: number; lng: number }>();
  for (const s of spots) {
    uniqueCoords.set(coordKey(s.latitude, s.longitude), {
      lat: s.latitude,
      lng: s.longitude,
    });
  }
  const forecastByCoord = new Map<string, SpotForecast | null>();
  await Promise.all(
    Array.from(uniqueCoords.entries()).map(async ([key, c]) => {
      forecastByCoord.set(key, await fetchSpotForecast(c.lat, c.lng));
    }),
  );

  const payload: SpotIndexPayload[] = spots.map((spot) => {
    const forecast = forecastByCoord.get(
      coordKey(spot.latitude, spot.longitude),
    );
    if (!forecast || forecast.days.length === 0) {
      return {
        slug: spot.slug,
        name: spot.name,
        prefecture: spot.region.prefecture,
        scores: [],
        dates: [],
        today: null,
        weatherOk: false,
      };
    }
    // 満干時刻は最寄り観測地点の気象庁データから。
    // フル表示スポット以外（湖・池・非河口の河川）には海の満干時刻を流さない（潮回りのみ）
    const tideCode =
      getTideDisplayMode(spot) === "full"
        ? (getTideStationForSpot(spot)?.code ?? null)
        : null;
    const results = forecast.days.map((d) =>
      calcFishingIndex(getTideInfoForDate(tideCode, d.date), d),
    );
    return {
      slug: spot.slug,
      name: spot.name,
      prefecture: spot.region.prefecture,
      scores: results.map((r) => r.score),
      dates: forecast.days.map((d) => d.date),
      today: results[0] ?? null,
      weatherOk: true,
    };
  });

  // 行動圏クラスタ
  const clusters = clusterByDistance(
    spots.map((s) => ({ slug: s.slug, lat: s.latitude, lng: s.longitude })),
  );
  const homeIndex = pickHomeClusterIndex(clusters, { location, recentSlugs });
  const prefectureBySlug = new Map(payload.map((p) => [p.slug, p.prefecture]));
  const clusterPayload = clusters.map((c, i) => {
    // クラスタの表示名 = 最多の都道府県
    const counts = new Map<string, number>();
    for (const slug of c.spotSlugs) {
      const pref = prefectureBySlug.get(slug) ?? "";
      counts.set(pref, (counts.get(pref) || 0) + 1);
    }
    const label =
      Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return { spotSlugs: c.spotSlugs, label, isHome: i === homeIndex };
  });

  const dates = payload.find((p) => p.weatherOk)?.dates ?? [];

  return NextResponse.json({
    dates,
    spots: payload,
    clusters: clusterPayload,
  });
}
