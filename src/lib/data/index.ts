import { FishSpecies, SpotSummary } from "@/types";
import { fishSpecies } from "./fish";
import { fishingSpots } from "./spots";

// 魚種データにスポット情報を自動付与
export function getFishSpeciesWithSpots(): FishSpecies[] {
  return fishSpecies.map((fish) => ({
    ...fish,
    spots: fishingSpots
      .filter((spot) =>
        spot.catchableFish.some((cf) => cf.fish.slug === fish.slug)
      )
      .map((spot): SpotSummary => {
        const cf = spot.catchableFish.find((cf) => cf.fish.slug === fish.slug)!;
        return {
          id: spot.id,
          name: spot.name,
          slug: spot.slug,
          region: spot.region,
          rating: spot.rating,
          catchRating: cf.peakSeason ? "excellent" : "good",
          latitude: spot.latitude,
          longitude: spot.longitude,
        };
      }),
  }));
}

/**
 * 共起する魚種を取得（同じスポットで釣れる魚を集計し、頻度順に返す）
 * @param fishSlug 対象の魚種slug
 * @param limit 最大取得数（デフォルト8）
 */
export function getCoOccurringFish(
  fishSlug: string,
  limit: number = 8
): { slug: string; name: string; count: number }[] {
  // この魚が釣れるスポットを取得
  const relevantSpots = fishingSpots.filter((spot) =>
    spot.catchableFish.some((cf) => cf.fish.slug === fishSlug)
  );

  // 同じスポットに出現する他の魚種を集計
  const coOccurrenceMap = new Map<string, { slug: string; name: string; count: number }>();
  for (const spot of relevantSpots) {
    for (const cf of spot.catchableFish) {
      if (cf.fish.slug === fishSlug) continue;
      const existing = coOccurrenceMap.get(cf.fish.slug);
      if (existing) {
        existing.count++;
      } else {
        coOccurrenceMap.set(cf.fish.slug, {
          slug: cf.fish.slug,
          name: cf.fish.name,
          count: 1,
        });
      }
    }
  }

  return Array.from(coOccurrenceMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * 魚種名からslugを取得（都道府県ページの季節魚種リンク用）
 */
export function getFishSlugByName(name: string): string | null {
  const fish = fishSpecies.find((f) => f.name === name);
  return fish ? fish.slug : null;
}

// 全データのエクスポート
export { fishSpecies } from "./fish";
export { fishingSpots } from "./spots";
export { regions } from "./regions";
export { getFishBySlug, getCatchableNow, getPeakFish } from "./fish";
export { getSpotBySlug, getNearbySpots } from "./spots";
export { tackleShops, getShopBySlug, getNearbyShops, getShopsForSpot } from "./shops";
export { prefectureInfoList, getPrefectureInfoBySlug } from "./prefecture-info";
