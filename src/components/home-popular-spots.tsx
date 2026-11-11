"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { ListSpot } from "@/types";
import { Button } from "@/components/ui/button";
import { SpotCard } from "@/components/spots/spot-card";
import { ArrowRight } from "lucide-react";

/** サーバー側で toListSpot（lib/data/list-spot.ts）した軽量データを受け取る */
type PopularSpotData = ListSpot;

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
        const nearestPref = withDistance[0].region.prefecture;
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
        nearLabel: byDistance[0]?.region.prefecture ? `${byDistance[0].region.prefecture}周辺` : "",
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
        <Link prefetch={false}
          href="/spots"
          className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
        >
          すべて見る
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displaySpots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            distance={isNearby ? spot.distanceKm ?? null : null}
          >
            <span className="text-muted-foreground">
              {spot.spotType === "pond" ? "管理釣り場" : ["river", "lake"].includes(spot.spotType) ? "川釣り" : "海釣り"}
            </span>
          </SpotCard>
        ))}
      </div>

      <div className="mt-6 flex justify-center sm:hidden">
        <Link prefetch={false} href="/spots">
          <Button variant="outline" className="min-h-[44px] gap-1">
            すべてのスポットを見る
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
