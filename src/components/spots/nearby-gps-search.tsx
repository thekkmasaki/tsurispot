"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { Navigation, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPOT_TYPE_LABELS, type FishingSpot } from "@/types";

interface NearbySpotData {
  slug: string;
  name: string;
  spotType: FishingSpot["spotType"];
  latitude: number;
  longitude: number;
  prefecture: string;
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

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

export function NearbyGpsSearch({
  spots,
  currentSpotSlug,
}: {
  spots: NearbySpotData[];
  currentSpotSlug: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    (NearbySpotData & { distanceKm: number })[] | null
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
          .filter((s) => s.slug !== currentSpotSlug)
          .map((s) => ({
            ...s,
            distanceKm: getDistanceKm(latitude, longitude, s.latitude, s.longitude),
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 5);
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
  }, [spots, currentSpotSlug]);

  if (results) {
    return (
      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2">
          <Navigation className="size-4 text-sky-600" />
          <p className="text-sm font-medium text-sky-800">
            現在地から近い釣り場
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {results.map((s) => (
            <Link key={s.slug} href={`/spots/${s.slug}`} className="shrink-0">
              <div className="min-w-[200px] rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
                <p className="text-sm font-medium text-sky-600 mb-1">
                  <MapPin className="mr-1 inline size-3" />
                  {formatDistance(s.distanceKm)}
                </p>
                <p className="font-medium text-blue-600 hover:underline leading-snug">
                  {s.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {s.prefecture} · {SPOT_TYPE_LABELS[s.spotType]}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <Button
        onClick={handleSearch}
        disabled={loading}
        variant="outline"
        size="sm"
        className="gap-2 border-sky-300 text-sky-700 hover:bg-sky-50"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            取得中...
          </>
        ) : (
          <>
            <Navigation className="size-4" />
            現在地から近くの釣り場を探す
          </>
        )}
      </Button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
