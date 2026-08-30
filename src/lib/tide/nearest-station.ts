// スポット → 最寄り潮汐観測地点の解決（クライアント安全: データ参照のみ）
import { TIDE_STATIONS, type TideStation } from "./stations";
import { ESTUARY_FULL_TIDE_SLUGS, STATION_OVERRIDES } from "./station-overrides";

export interface ResolvedTideStation {
  code: string;
  name: string;
  distanceKm: number;
}

/** 潮汐（満干時刻）の表示モード */
export type TideDisplayMode = "full" | "phase-only" | "none";

interface SpotForTide {
  slug: string;
  name?: string;
  latitude: number;
  longitude: number;
  spotType: string;
  region?: { prefecture?: string };
}

// 内陸県: 琵琶湖等の湖岸スポットが port/pier/breakwater 型で登録されているケースがあり、
// spotType だけでは淡水と判定できないため県で足切りする（海の潮汐は無関係）。
const LANDLOCKED_PREFECTURES = new Set([
  "埼玉県",
  "群馬県",
  "栃木県",
  "山梨県",
  "長野県",
  "岐阜県",
  "滋賀県",
  "奈良県",
]);

const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

const estuarySet = new Set(ESTUARY_FULL_TIDE_SLUGS);

// river スポットのうち、名称が河口部を明示するものは潮汐の影響を直接受けるためフル表示
const ESTUARY_NAME_RE = /(河口|導流堤|汽水)/;

/**
 * スポットの潮汐表示モードを返す。
 * - lake / pond・内陸県: none（海の潮汐は無関係）
 * - river: phase-only（潮回りのみ）。河口（名称判定 or 昇格リスト）は full
 * - それ以外（海のスポット）: full
 */
export function getTideDisplayMode(
  spot: Pick<SpotForTide, "slug" | "spotType" | "region"> & { name?: string },
): TideDisplayMode {
  if (STATION_OVERRIDES[spot.slug] === null) return "none";
  if (spot.spotType === "lake" || spot.spotType === "pond") return "none";
  if (LANDLOCKED_PREFECTURES.has(spot.region?.prefecture ?? "")) return "none";
  if (spot.spotType === "river") {
    return estuarySet.has(spot.slug) || ESTUARY_NAME_RE.test(spot.name ?? "")
      ? "full"
      : "phase-only";
  }
  return "full";
}

/**
 * スポットの最寄り潮汐観測地点を返す。表示モードが none のスポットは null。
 * 239地点の全走査（O(239)）で、SSG/ISR・APIのサーバー側で呼ばれる想定。
 */
export function getTideStationForSpot(spot: SpotForTide): ResolvedTideStation | null {
  if (getTideDisplayMode(spot) === "none") return null;

  const overrideCode = STATION_OVERRIDES[spot.slug];
  if (typeof overrideCode === "string") {
    const st = TIDE_STATIONS.find((s) => s.code === overrideCode);
    if (st) {
      return {
        code: st.code,
        name: st.name,
        distanceKm: Math.round(haversineKm(spot.latitude, spot.longitude, st.lat, st.lng) * 10) / 10,
      };
    }
  }

  let best: TideStation | null = null;
  let bestDist = Infinity;
  for (const st of TIDE_STATIONS) {
    const d = haversineKm(spot.latitude, spot.longitude, st.lat, st.lng);
    if (d < bestDist) {
      bestDist = d;
      best = st;
    }
  }
  if (!best) return null;
  return { code: best.code, name: best.name, distanceKm: Math.round(bestDist * 10) / 10 };
}
