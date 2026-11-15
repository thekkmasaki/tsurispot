import type { FishingSpot } from "@/types";
import { fishingSpots } from "@/lib/data/spots";
import {
  getSpotRestrictionSummary,
  RESTRICTION_LEVEL_ORDER,
  type SpotRestrictionSummary,
} from "@/lib/spot-restrictions";

export interface RestrictedSpotEntry {
  spot: Pick<FishingSpot, "slug" | "name" | "region">;
  restriction: SpotRestrictionSummary;
}

/**
 * 都道府県内で「釣り禁止・制限」の情報が登録されているスポット一覧。
 * 釣り禁止(全面→一部) → 禁止区域あり → 釣法の禁止 の順、同順位は名前順。
 */
export function getPrefectureRestrictedSpots(prefName: string): RestrictedSpotEntry[] {
  const entries: RestrictedSpotEntry[] = [];
  for (const spot of fishingSpots) {
    if (spot.region.prefecture !== prefName) continue;
    const restriction = getSpotRestrictionSummary(spot);
    if (!restriction) continue;
    entries.push({ spot: { slug: spot.slug, name: spot.name, region: spot.region }, restriction });
  }
  return entries.sort(
    (a, b) =>
      RESTRICTION_LEVEL_ORDER[a.restriction.level] - RESTRICTION_LEVEL_ORDER[b.restriction.level] ||
      a.spot.name.localeCompare(b.spot.name, "ja"),
  );
}
