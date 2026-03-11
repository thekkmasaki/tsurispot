import { NextResponse } from "next/server";
import { fishingSpots } from "@/lib/data/spots";
import type { RankingSpot } from "@/app/ranking/ranking-client";

export async function GET() {
  const rankingSpots: RankingSpot[] = fishingSpots.map((s) => ({
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
    fishCount: s.catchableFish.length,
    topFish: s.catchableFish.slice(0, 3).map((cf) => ({ id: cf.fish.id, name: cf.fish.name })),
    bestTimes: s.bestTimes.map((t) => ({ label: t.label, rating: t.rating })),
  }));

  return NextResponse.json(rankingSpots, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
