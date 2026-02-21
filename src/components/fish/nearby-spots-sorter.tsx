"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { MapPin, Navigation, Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATCH_RATING_LABELS } from "@/types";
import type { SpotSummary } from "@/types";

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

interface NearbySpotsSorterProps {
  spots: SpotSummary[];
  fishName: string;
}

export function NearbySpotsSorter({ spots, fishName }: NearbySpotsSorterProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const INITIAL_COUNT = 5;

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報に対応していません");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("位置情報の使用が許可されていません。ブラウザの設定を確認してください。");
        } else {
          setError("位置情報を取得できませんでした");
        }
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  // 距離でソート
  const sortedSpots = userLocation
    ? [...spots]
        .map((spot) => ({
          ...spot,
          distance: haversineDistance(
            userLocation.lat,
            userLocation.lng,
            spot.latitude,
            spot.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    : spots.map((spot) => ({ ...spot, distance: null as number | null }));

  const visibleSpots = sortedSpots.slice(0, INITIAL_COUNT);
  const hiddenSpots = sortedSpots.slice(INITIAL_COUNT);

  const SpotItem = ({
    spot,
  }: {
    spot: (typeof sortedSpots)[number];
  }) => (
    <Link href={`/spots/${spot.slug}`}>
      <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold group-hover:text-primary sm:text-base">
              {spot.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {spot.region.prefecture} {spot.region.areaName}
              {spot.distance !== null && (
                <span className="ml-2 inline-flex items-center gap-0.5 text-primary font-medium">
                  <Navigation className="size-3" />
                  {formatDistance(spot.distance)}
                </span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Badge
              variant="outline"
              className={`hidden text-xs sm:inline-flex ${
                spot.catchRating === "excellent"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : spot.catchRating === "good"
                    ? "border-sky-200 bg-sky-50 text-sky-700"
                    : ""
              }`}
            >
              {CATCH_RATING_LABELS[spot.catchRating]}{" "}
              {spot.catchRating === "excellent"
                ? "よく釣れる"
                : spot.catchRating === "good"
                  ? "釣れる"
                  : "まずまず"}
            </Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{spot.rating}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
        <MapPin className="size-5 text-primary" />
        釣れるスポット
        <span className="text-sm font-normal text-muted-foreground">
          ({spots.length}件)
        </span>
      </h2>

      {/* 現在地ボタン */}
      {!userLocation && (
        <div className="mb-3 sm:mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            disabled={loading}
            className="gap-1.5 text-sm"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Navigation className="size-4" />
            )}
            {loading ? "取得中..." : "現在地から近い順に表示"}
          </Button>
          {error && (
            <p className="mt-1.5 text-xs text-red-600">{error}</p>
          )}
        </div>
      )}

      {userLocation && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm sm:mb-4">
          <Navigation className="size-4 text-primary" />
          <span className="text-muted-foreground">
            現在地から近い順に表示しています
          </span>
          <button
            onClick={() => setUserLocation(null)}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            解除
          </button>
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        {visibleSpots.map((spot) => (
          <SpotItem key={spot.id} spot={spot} />
        ))}
      </div>
      {hiddenSpots.length > 0 && (
        <details className="group/details mt-2 sm:mt-3">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <span className="group-open/details:hidden">
              他 {hiddenSpots.length} 件のスポットを表示
            </span>
            <span className="hidden group-open/details:inline">閉じる</span>
          </summary>
          <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
            {hiddenSpots.map((spot) => (
              <SpotItem key={spot.id} spot={spot} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
