import { fishingSpots } from "@/lib/data/spots";
import { calcRankScore } from "@/lib/ranking-score";
import type { RankingSpot } from "@/app/ranking/ranking-client";

/**
 * ランキング用の全スポットデータ（スコアはサーバーで事前計算）。
 * /ranking ページ（初期表示のTOP10）と /api/ranking/spots（絞り込み・現在地用の全件）で共用する。
 */
export function buildRankingSpots(): RankingSpot[] {
  return fishingSpots.map((s) => {
    const fishCount = s.catchableFish.length;
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      rating: s.rating,
      reviewCount: s.reviewCount,
      prefecture: s.region.prefecture,
      spotType: s.spotType,
      difficulty: s.difficulty,
      latitude: s.latitude,
      longitude: s.longitude,
      hasParking: s.hasParking,
      hasToilet: s.hasToilet,
      hasRentalRod: s.hasRentalRod,
      isFree: s.isFree,
      fishCount,
      score: calcRankScore({
        rating: s.rating,
        reviewCount: s.reviewCount,
        fishCount,
        hasParking: s.hasParking,
        hasToilet: s.hasToilet,
        hasRentalRod: s.hasRentalRod,
        isFree: s.isFree,
        difficulty: s.difficulty,
      }),
      topFish: s.catchableFish.slice(0, 3).map((cf) => ({ id: cf.fish.id, name: cf.fish.name })),
      bestTimes: s.bestTimes.map((t) => ({ label: t.label, rating: t.rating })),
    };
  });
}
