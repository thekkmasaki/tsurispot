"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Star, ChevronRight, Navigation, Loader2, ArrowRight, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Top10Spot {
  id: string;
  slug: string;
  name: string;
  spotType: string;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  prefecture: string;
  areaName: string;
}

const SPOT_TYPE_LABELS: Record<string, string> = {
  port: "漁港",
  beach: "砂浜",
  rocky: "磯",
  river: "河川",
  pier: "桟橋",
  breakwater: "堤防",
};

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

export function HomeTop10Client({ spots }: { spots: Top10Spot[] }) {
  const [sortMode, setSortMode] = useState<"popular" | "near">("popular");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const handleNearSort = useCallback(() => {
    if (sortMode === "near") {
      setSortMode("popular");
      return;
    }
    if (userLocation) {
      setSortMode("near");
      return;
    }
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setSortMode("near");
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [sortMode, userLocation]);

  const displaySpots = useMemo(() => {
    if (sortMode === "near" && userLocation) {
      return spots
        .map((s) => ({
          ...s,
          dist: getDistanceKm(userLocation[0], userLocation[1], s.latitude, s.longitude),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 10);
    }
    return spots
      .slice()
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, 10)
      .map((s) => ({ ...s, dist: undefined as number | undefined }));
  }, [spots, sortMode, userLocation]);

  return (
    <section className="bg-muted/50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
              {sortMode === "near" ? "近くの釣りスポット" : "人気スポット TOP10"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {sortMode === "near"
                ? "現在地から近い順に表示"
                : "評価とレビュー数で選ぶ注目の釣り場"}
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

        {/* ソート切替 */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSortMode("popular")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              sortMode === "popular"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Star className="mr-1 inline size-3.5" />
            人気順
          </button>
          <button
            onClick={handleNearSort}
            disabled={locating}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              sortMode === "near"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700",
            )}
          >
            {locating ? (
              <Loader2 className="mr-1 inline size-3.5 animate-spin" />
            ) : (
              <Navigation className="mr-1 inline size-3.5" />
            )}
            近い順
          </button>
        </div>

        <div className="space-y-1.5">
          {displaySpots.map((spot, index) => (
            <Link key={spot.id} href={`/spots/${spot.slug}`} className="block">
              <div className="flex items-center gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${
                    sortMode === "popular" && index < 3
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{spot.name}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {SPOT_TYPE_LABELS[spot.spotType] || spot.spotType}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {spot.prefecture} {spot.areaName}
                  </p>
                </div>
                {sortMode === "near" && spot.dist != null ? (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-600">
                    <MapPin className="size-3" />
                    {formatDistance(spot.dist)}
                  </span>
                ) : (
                  <div className="flex shrink-0 items-center gap-1 text-xs">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{spot.rating.toFixed(1)}</span>
                  </div>
                )}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
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
      </div>
    </section>
  );
}
