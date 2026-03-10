import { NextRequest, NextResponse } from "next/server";
import { fishingSpots } from "@/lib/data/spots";

/** Haversine distance in km */
function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** 軽量化したスポットデータに変換 */
function toLightSpot(s: (typeof fishingSpots)[number], distanceKm?: number) {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    spotType: s.spotType,
    rating: s.rating,
    latitude: s.latitude,
    longitude: s.longitude,
    region: { prefecture: s.region.prefecture, areaName: s.region.areaName },
    catchableFish: s.catchableFish.slice(0, 6).map((cf) => ({
      fish: { id: cf.fish.id, name: cf.fish.name, slug: cf.fish.slug },
      monthStart: cf.monthStart,
      monthEnd: cf.monthEnd,
      peakSeason: cf.peakSeason,
    })),
    ...(distanceKm != null ? { distanceKm } : {}),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const limitStr = searchParams.get("limit");
  const filter = searchParams.get("filter"); // "sea" | "freshwater" | null

  const limit = Math.min(Math.max(parseInt(limitStr || "20", 10) || 20, 1), 50);

  // フィルタ適用
  let spots = fishingSpots;
  if (filter === "sea") {
    spots = spots.filter((s) => s.spotType !== "river");
  } else if (filter === "freshwater") {
    spots = spots.filter((s) => s.spotType === "river");
  }

  // lat/lng が指定された場合は距離順
  if (latStr && lngStr) {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Invalid lat/lng parameters" },
        { status: 400 },
      );
    }

    const sorted = spots
      .map((s) => ({ spot: s, dist: getDistanceKm(lat, lng, s.latitude, s.longitude) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit);

    const data = sorted.map((item) => toLightSpot(item.spot, item.dist));

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  // lat/lngなし → rating上位
  const sorted = spots
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  const data = sorted.map((s) => toLightSpot(s));

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
