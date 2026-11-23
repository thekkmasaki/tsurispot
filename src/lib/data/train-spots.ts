/**
 * 「電車で行ける釣り場」（/fishing-spots/by-train）の対象スポット。
 * accessInfo に「〇〇駅から徒歩N分（N ≤ 20）」と記載があり、掲載品質を満たし、釣り禁止情報が無いもの。
 */
import type { FishingSpot } from "@/types";
import { fishingSpots } from "./spots";
import { REGION_GROUPS, type RegionGroup } from "./regions-group";
import { isSitemapEligible } from "@/lib/seo-quality";
import { parseStationWalk, TRAIN_WALK_MAX_MINUTES, type StationWalk } from "./station-access";

export type TrainSpot = { spot: FishingSpot; walk: StationWalk };

/** 地域ページを作る下限件数（これ未満の地域はページを作らない） */
export const MIN_TRAIN_SPOTS_PER_REGION = 8;

let _all: TrainSpot[] | null = null;

/** 対象スポットすべて（徒歩分数の短い順） */
export function getAllTrainSpots(): TrainSpot[] {
  if (_all) return _all;
  const list: TrainSpot[] = [];
  for (const spot of fishingSpots) {
    if (!isSitemapEligible(spot) || spot.fishingBan) continue;
    const walk = parseStationWalk(spot.accessInfo);
    if (walk && walk.minutes <= TRAIN_WALK_MAX_MINUTES) list.push({ spot, walk });
  }
  list.sort((a, b) => a.walk.minutes - b.walk.minutes || b.spot.rating - a.spot.rating);
  _all = list;
  return list;
}

export function getTrainSpotsByRegion(region: RegionGroup): TrainSpot[] {
  return getAllTrainSpots().filter((t) => region.prefectures.includes(t.spot.region.prefecture));
}

/** ページを作る地域（件数の下限を満たすもの） */
export function getTrainRegions(): { region: RegionGroup; count: number }[] {
  return REGION_GROUPS.map((region) => ({ region, count: getTrainSpotsByRegion(region).length })).filter(
    (r) => r.count >= MIN_TRAIN_SPOTS_PER_REGION,
  );
}

/** 地域内を都道府県ごとにまとめる（REGION_GROUPS の県の並び順） */
export function groupTrainSpotsByPrefecture(region: RegionGroup): { prefecture: string; items: TrainSpot[] }[] {
  const spots = getTrainSpotsByRegion(region);
  return region.prefectures
    .map((prefecture) => ({ prefecture, items: spots.filter((t) => t.spot.region.prefecture === prefecture) }))
    .filter((g) => g.items.length > 0);
}
