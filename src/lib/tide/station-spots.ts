// 観測地点 → その地点が最寄りの釣りスポット一覧（/tides/[station] の内部リンク用）
//
// サーバー専用（fishingSpots 全件を走査するため）。初回呼び出しで全対象スポットを
// 1パスで逆引きMap化し、以後はモジュールキャッシュを返す。
import { fishingSpots } from "@/lib/data/spots";
import { getTideDisplayMode, getTideStationForSpot } from "./nearest-station";
import { TIDE_STATIONS } from "./stations";

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

export interface PrefectureStationLink {
  code: string;
  name: string;
  /** この県のスポットのうち、この地点が最寄りになる件数（並び順の根拠） */
  spotCount: number;
}

let _prefCache: Map<string, PrefectureStationLink[]> | null = null;

function buildPrefMap(): Map<string, PrefectureStationLink[]> {
  // 観測地点→スポット の逆引きMapを県で再集計する（fishingSpots の再走査はしない）
  const counts = new Map<string, Map<string, number>>();
  for (const [code, spots] of getMap()) {
    for (const s of spots) {
      if (!s.prefecture) continue;
      const byStation = counts.get(s.prefecture) ?? new Map<string, number>();
      byStation.set(code, (byStation.get(code) ?? 0) + 1);
      counts.set(s.prefecture, byStation);
    }
  }
  const nameByCode = new Map(TIDE_STATIONS.map((st) => [st.code, st.name]));
  const result = new Map<string, PrefectureStationLink[]>();
  for (const [pref, byStation] of counts) {
    const list: PrefectureStationLink[] = [];
    for (const [code, spotCount] of byStation) {
      const name = nameByCode.get(code);
      if (!name) continue;
      list.push({ code, name, spotCount });
    }
    list.sort((a, b) => b.spotCount - a.spotCount || a.code.localeCompare(b.code));
    result.set(pref, list);
  }
  return result;
}

/**
 * この都道府県の海釣りスポットが最寄りとする潮汐観測地点（スポット数の多い順・最大 limit 件）。
 * 内陸県や潮汐フル表示スポットが無い県は空配列（/prefecture/[slug] の潮見表セクションは非表示）。
 */
export function getStationsForPrefecture(prefecture: string, limit = 8): PrefectureStationLink[] {
  if (!_prefCache) _prefCache = buildPrefMap();
  return (_prefCache.get(prefecture) ?? []).slice(0, limit);
}
