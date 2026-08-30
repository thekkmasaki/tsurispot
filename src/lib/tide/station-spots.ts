// 観測地点 → その地点が最寄りの釣りスポット一覧（/tides/[station] の内部リンク用）
//
// サーバー専用（fishingSpots 全件を走査するため）。初回呼び出しで全対象スポットを
// 1パスで逆引きMap化し、以後はモジュールキャッシュを返す。
import { fishingSpots } from "@/lib/data/spots";
import { getTideDisplayMode, getTideStationForSpot } from "./nearest-station";

export interface StationSpotLink {
  slug: string;
  name: string;
  prefecture: string;
  spotType: string;
  distanceKm: number;
}

let _cache: Map<string, StationSpotLink[]> | null = null;

function buildMap(): Map<string, StationSpotLink[]> {
  const map = new Map<string, StationSpotLink[]>();
  for (const spot of fishingSpots) {
    // 満干時刻をフル表示するスポットのみ（潮見表ページからの導線として自然な対象）
    if (getTideDisplayMode(spot) !== "full") continue;
    const st = getTideStationForSpot(spot);
    if (!st) continue;
    const list = map.get(st.code) ?? [];
    list.push({
      slug: spot.slug,
      name: spot.name,
      prefecture: spot.region?.prefecture ?? "",
      spotType: spot.spotType,
      distanceKm: st.distanceKm,
    });
    map.set(st.code, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.distanceKm - b.distanceKm);
  }
  return map;
}

function getMap(): Map<string, StationSpotLink[]> {
  if (!_cache) _cache = buildMap();
  return _cache;
}

/** この観測地点が最寄りになる釣りスポット（近い順・最大 limit 件） */
export function getSpotsForStation(code: string, limit = 12): StationSpotLink[] {
  return (getMap().get(code) ?? []).slice(0, limit);
}

/** この観測地点が最寄りになる釣りスポットの総数 */
export function getStationSpotCount(code: string): number {
  return getMap().get(code)?.length ?? 0;
}
