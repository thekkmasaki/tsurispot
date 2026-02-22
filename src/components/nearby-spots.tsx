"use client";

import { useState } from "react";
import Link from "next/link";
import { useGeolocation } from "@/hooks/use-geolocation";
import { FishingSpot, SPOT_TYPE_LABELS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Star, Loader2 } from "lucide-react";

type WaterFilter = "all" | "sea" | "freshwater";

function getDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
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

export function NearbySpots({ allSpots }: { allSpots: FishingSpot[] }) {
  const [waterFilter, setWaterFilter] = useState<WaterFilter>("all");
  const { latitude, longitude, error, loading, permissionDenied, requestLocation } =
    useGeolocation();

  // 位置情報が取得できていない場合
  if (!latitude || !longitude) {
    // 許可拒否された場合は何も出さない
    if (permissionDenied) return null;

    return (
      <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/50 p-5 text-center sm:p-6">
        <Navigation className="mx-auto mb-2 size-8 text-sky-400" />
        <p className="mb-1 text-sm font-semibold text-sky-800">
          近くの釣りスポットを探す
        </p>
        <p className="mb-4 text-xs text-sky-600">
          位置情報を使って、あなたの近くの釣りスポットを表示します
        </p>
        <Button
          onClick={requestLocation}
          disabled={loading}
          variant="outline"
          className="min-h-[44px] gap-2 border-sky-300 bg-white text-sky-700 hover:bg-sky-50"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              取得中...
            </>
          ) : (
            <>
              <MapPin className="size-4" />
              現在地を取得する
            </>
          )}
        </Button>
        {error && !permissionDenied && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  // フィルタリング + 近くのスポットを計算
  const filtered = waterFilter === "all"
    ? allSpots
    : waterFilter === "sea"
      ? allSpots.filter((s) => s.spotType !== "river")
      : allSpots.filter((s) => s.spotType === "river");

  const spotsWithDistance = filtered
    .map((spot) => ({
      ...spot,
      distanceKm: getDistanceKm(latitude, longitude, spot.latitude, spot.longitude),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6);

  if (spotsWithDistance.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-sky-100">
            <Navigation className="size-4 text-sky-600" />
          </div>
          <div>
            <h2 className="text-base font-bold sm:text-lg">近くの釣りスポット</h2>
            <p className="text-xs text-muted-foreground">
              現在地から近い順に表示
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg border bg-muted/50 p-0.5">
          {([
            { value: "all" as const, label: "すべて" },
            { value: "sea" as const, label: "🌊 海" },
            { value: "freshwater" as const, label: "🏞️ 川" },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWaterFilter(opt.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                waterFilter === opt.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spotsWithDistance.map((spot) => (
          <Link key={spot.id} href={`/spots/${spot.slug}`}>
            <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold group-hover:text-primary sm:text-base">
                    {spot.name}
                  </h3>
                  <div className="flex shrink-0 items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{spot.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {spot.region.prefecture} {spot.region.areaName}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {SPOT_TYPE_LABELS[spot.spotType]}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs font-medium text-sky-600">
                    <MapPin className="size-3" />
                    {formatDistance(spot.distanceKm)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
