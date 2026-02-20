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
        };
      }),
  }));
}

// 全データのエクスポート
export { fishSpecies } from "./fish";
export { fishingSpots } from "./spots";
export { regions } from "./regions";
export { getFishBySlug, getCatchableNow, getPeakFish } from "./fish";
export { getSpotBySlug, getNearbySpots } from "./spots";
export { tackleShops, getShopBySlug, getNearbyShops, getShopsForSpot } from "./shops";
