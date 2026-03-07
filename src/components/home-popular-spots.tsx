"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGeolocation } from "@/hooks/use-geolocation";
import { SPOT_TYPE_LABELS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotImage } from "@/components/ui/spot-image";
import { Star, ArrowRight, MapPin } from "lucide-react";

interface PopularSpotData {
  id: string;
  slug: string;
  name: string;
  spotType: string;
  rating: number;
  latitude: number;
  longitude: number;
  prefecture: string;
  areaName: string;
  difficulty: string;
  mainImageUrl?: string;
  fishNames: string[];
}

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

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

interface HomePopularSpotsProps {
  spots: PopularSpotData[];
}

export function HomePopularSpots({ spots }: HomePopularSpotsProps) {
  const { latitude, longitude } = useGeolocation();

  const { displaySpots, isNearby, nearLabel } = useMemo(() => {
    if (latitude && longitude) {
      // 位置情報あり: 150km以内のスポットを評価順で表示
      const withDistance = spots
        .map((s) => ({
          ...s,
          distanceKm: getDistanceKm(latitude, longitude, s.latitude, s.longitude),
        }))
        .filter((s) => s.distanceKm <= 150)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);

      if (withDistance.length >= 3) {
        const nearestPref = withDistance[0].prefecture;
        return {
          displaySpots: withDistance,
          isNearby: true,
          nearLabel: `${nearestPref}周辺`,
        };
      }

      // 150km以内に3件未満 → 距離順で最寄り6件
      const byDistance = spots
        .map((s) => ({
          ...s,
          distanceKm: getDistanceKm(latitude, longitude, s.latitude, s.longitude),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 6);

      return {
        displaySpots: byDistance,
        isNearby: true,
        nearLabel: byDistance[0]?.prefecture ? `${byDistance[0].prefecture}周辺` : "",
      };
    }

    // 位置情報なし: 評価順
    return {
      displaySpots: spots.slice(0, 6).map((s) => ({ ...s, distanceKm: undefined as number | undefined })),
      isNearby: false,
      nearLabel: "",
    };
  }, [spots, latitude, longitude]);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-end justify-between sm:mb-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
            {isNearby ? "近くの人気スポット" : "人気の釣りスポット"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isNearby
              ? `${nearLabel}の評価が高い釣り場`
              : "みんなに選ばれている釣り場"}
          </p>
        </div>
        <Link
          href="/spots"
          className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
        >
          すべて見る
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displaySpots.map((spot) => (
          <Link key={spot.id} href={`/spots/${spot.slug}`}>
            <Card className="group h-full gap-0 overflow-hidden border py-0 transition-shadow hover:shadow-md">
              <SpotImage
                src={
                  spot.mainImageUrl?.startsWith("http") ||
                  spot.mainImageUrl?.startsWith("/images/spots/wikimedia/")
                    ? spot.mainImageUrl
                    : undefined
                }
                alt={spot.name}
                spotType={spot.spotType}
                height="h-36 sm:h-40"
              />

              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold group-hover:text-primary">
                      {spot.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {spot.prefecture} {spot.areaName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{spot.rating}</span>
                  </div>
                </div>

                {/* 釣れる魚バッジ */}
                <div className="flex flex-wrap gap-1.5">
                  {spot.fishNames.slice(0, 3).map((name) => (
                    <Badge key={name} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                  {spot.fishNames.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{spot.fishNames.length - 3}
                    </Badge>
                  )}
                </div>

                {/* スポットタイプ & 距離 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {SPOT_TYPE_LABELS[spot.spotType as keyof typeof SPOT_TYPE_LABELS] || spot.spotType}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${spot.spotType === "river" ? "border-emerald-200 text-emerald-700" : "border-sky-200 text-sky-700"}`}
                    >
                      {spot.spotType === "river" ? "川釣り" : "海釣り"}
                    </Badge>
                    {spot.difficulty === "beginner" && (
                      <Badge className="bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100">
                        初心者OK
                      </Badge>
                    )}
                  </div>
                  {isNearby && spot.distanceKm != null && (
                    <span className="flex items-center gap-1 text-xs font-medium text-sky-600">
                      <MapPin className="size-3" />
                      {formatDistance(spot.distanceKm)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex justify-center sm:hidden">
        <Link href="/spots">
          <Button variant="outline" className="min-h-[44px] gap-1">
            すべてのスポットを見る
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
