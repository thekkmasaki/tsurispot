"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Navigation, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpotImage } from "@/components/ui/spot-image";

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

export interface MonthlySpot {
  slug: string;
  name: string;
  rating: number;
  latitude: number;
  longitude: number;
  spotType: string;
  difficulty: string;
  mainImageUrl?: string;
  region: { prefecture: string };
  catchableFishNames: string[];
}

interface MonthlySportsSorterProps {
  spots: MonthlySpot[];
  monthName: string;
}

export function MonthlySportsSorter({ spots, monthName }: MonthlySportsSorterProps) {
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報に対応していません");
      return;
    }
    setLoading(true);
    setError(null);

    // localStorageキャッシュを確認
    try {
      const saved = localStorage.getItem("tsurispot_user_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.latitude && parsed.longitude && Date.now() - parsed.timestamp < 3600000) {
          setUserLocation({ lat: parsed.latitude, lng: parsed.longitude });
          setLoading(false);
          return;
        }
      }
    } catch {}

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLoading(false);
        try {
          localStorage.setItem(
            "tsurispot_user_location",
            JSON.stringify({ latitude: loc.lat, longitude: loc.lng, timestamp: Date.now() })
          );
        } catch {}
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setError("位置情報の使用が許可されていません");
        } else {
          setError("位置情報を取得できませんでした");
        }
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  const sortedSpots = userLocation
    ? (() => {
        const withDist = [...spots]
          .map((spot) => ({
            ...spot,
            distance: haversineDistance(
              userLocation.lat,
              userLocation.lng,
              spot.latitude,
              spot.longitude
            ),
          }))
          .sort((a, b) => a.distance - b.distance);
        // 150km以内のスポットを優先表示。3件未満なら近い順に10件
        const nearby = withDist.filter((s) => s.distance <= 150);
        return (nearby.length >= 3 ? nearby : withDist).slice(0, 10);
      })()
    : spots
        .slice(0, 10)
        .map((spot) => ({ ...spot, distance: null as number | null }));

  return (
    <>
      {/* 近い順ボタン */}
      {!userLocation && (
        <div className="mb-4">
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
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-sm">
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

      {/* スポットグリッド */}
      <div className="grid gap-3 sm:grid-cols-2">
        {sortedSpots.map((spot) => {
          const spotImageSrc =
            spot.mainImageUrl &&
            (spot.mainImageUrl.startsWith("http") ||
              spot.mainImageUrl.startsWith("/images/spots/"))
              ? spot.mainImageUrl
              : undefined;

          return (
            <Link
              key={spot.slug}
              href={`/spots/${spot.slug}`}
              className="group overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md dark:bg-card"
            >
              <SpotImage
                src={spotImageSrc}
                alt={spot.name}
                spotType={spot.spotType}
                height="h-32"
              />
              <div className="p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold group-hover:text-primary">
                    {spot.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ★{spot.rating.toFixed(1)}
                  </span>
                  {spot.distance !== null && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                      <Navigation className="size-3" />
                      {formatDistance(spot.distance)}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {spot.region.prefecture} ·{" "}
                  {spot.difficulty === "beginner"
                    ? "初心者向け"
                    : spot.difficulty === "intermediate"
                    ? "中級者向け"
                    : "上級者向け"}
                </p>
                {spot.catchableFishNames.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {spot.catchableFishNames.map((name) => (
                      <Badge
                        key={name}
                        variant="secondary"
                        className="px-1.5 py-0 text-[10px]"
                      >
                        {name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
