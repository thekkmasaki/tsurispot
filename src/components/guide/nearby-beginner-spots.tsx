"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { Navigation, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpotCardCompact } from "@/components/spots/spot-card";
import type { FishingSpot } from "@/types";

interface BeginnerSpotData {
  slug: string;
  name: string;
  spotType: FishingSpot["spotType"];
  prefecture: string;
  areaName: string;
  latitude: number;
  longitude: number;
  rating: number;
}

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

export function NearbyBeginnerSpots({
  spots,
}: {
  spots: BeginnerSpotData[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    (BeginnerSpotData & { distanceKm: number })[] | null
  >(null);

  const handleSearch = useCallback(() => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報に対応していません");
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const sorted = spots
          .map((s) => ({
            ...s,
            distanceKm: getDistanceKm(
              latitude,
              longitude,
              s.latitude,
              s.longitude
            ),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 6);
        setResults(sorted);
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "位置情報の使用が許可されていません"
            : "位置情報を取得できませんでした"
        );
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [spots]);

  if (results) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Navigation className="size-4 text-emerald-600" />
          <h3 className="font-medium text-foreground">
            あなたの近くの初心者向け釣り場
          </h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {results.map((spot) => (
            <SpotCardCompact
              key={spot.slug}
              distance={spot.distanceKm}
              spot={{
                slug: spot.slug,
                name: spot.name,
                spotType: spot.spotType,
                region: { prefecture: spot.prefecture, areaName: spot.areaName },
                rating: spot.rating,
              }}
            />
          ))}
        </div>
        <div className="mt-3 text-center">
          <Button asChild variant="outline" size="sm">
            <Link prefetch={false} href="/spots">
              すべてのスポットを見る
              <MapPin className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
      <p className="text-center text-sm text-muted-foreground">
        位置情報を使って、あなたの近くにある初心者向け釣り場を探せます
      </p>
      <Button
        onClick={handleSearch}
        disabled={loading}
        size="sm"
        className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            取得中...
          </>
        ) : (
          <>
            <Navigation className="size-4" />
            近くの釣り場を探す
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
