"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Navigation,
  Loader2,
  MapPin,
  Star,
  Car,
  Toilet,
  Fish,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

interface SpotData {
  id: string;
  name: string;
  slug: string;
  spotType: FishingSpot["spotType"];
  difficulty: FishingSpot["difficulty"];
  rating: number;
  latitude: number;
  longitude: number;
  prefecture: string;
  areaName: string;
  catchableFishNames: string[];
  hasParking: boolean;
  hasToilet: boolean;
  isFree: boolean;
  hasRentalRod: boolean;
  mainImageUrl: string;
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

function SpotItem({
  spot,
  distanceKm,
}: {
  spot: SpotData;
  distanceKm?: number;
}) {
  return (
    <Link href={`/spots/${spot.slug}`}>
      <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        <CardContent className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
          <div>
            <h3 className="text-sm font-semibold leading-tight group-hover:text-primary sm:text-base">
              {spot.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {spot.prefecture} {spot.areaName}
              {distanceKm != null && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                  <Navigation className="size-3" />
                  約{formatDistance(distanceKm)}
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-1">
            {spot.catchableFishNames.map((name) => (
              <Badge key={name} variant="secondary" className="text-xs">
                {name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{spot.rating.toFixed(1)}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {SPOT_TYPE_LABELS[spot.spotType]}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {spot.difficulty === "beginner" && (
              <Badge className="bg-green-600 text-xs hover:bg-green-600">
                初心者OK
              </Badge>
            )}
            {spot.isFree && (
              <Badge className="bg-orange-500 text-xs hover:bg-orange-500">
                無料
              </Badge>
            )}
            {spot.hasParking && (
              <span className="text-muted-foreground" title="駐車場あり">
                <Car className="size-4" />
              </span>
            )}
            {spot.hasToilet && (
              <span className="text-muted-foreground" title="トイレあり">
                <Toilet className="size-4" />
              </span>
            )}
            {spot.hasRentalRod && (
              <span className="text-muted-foreground" title="レンタル竿あり">
                <Fish className="size-4" />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function NearMeClient({ spots }: { spots: SpotData[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("お使いのブラウザは位置情報に対応していません");
      return;
    }
    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "位置情報の使用が許可されていません。ブラウザの設定から位置情報を許可してください。"
            : "位置情報を取得できませんでした。しばらくしてからお試しください。"
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const displaySpots = useMemo(() => {
    if (userLocation) {
      return spots
        .map((s) => ({
          ...s,
          distanceKm: getDistanceKm(
            userLocation[0],
            userLocation[1],
            s.latitude,
            s.longitude
          ),
        }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }
    // No location: show by rating
    return [...spots]
      .sort((a, b) => b.rating - a.rating)
      .map((s) => ({ ...s, distanceKm: undefined as number | undefined }));
  }, [spots, userLocation]);

  return (
    <div>
      {/* Locate button */}
      <div className="mb-6">
        <button
          onClick={handleLocate}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all w-full sm:w-auto",
            userLocation
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          )}
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Navigation className="size-4" />
          )}
          {loading
            ? "位置情報を取得中..."
            : userLocation
            ? "現在地から近い順に表示中"
            : "現在地から釣り場を探す"}
        </button>
        {userLocation && (
          <p className="mt-2 text-xs text-emerald-600">
            <MapPin className="mr-1 inline size-3" />
            位置情報を取得しました。近い順に釣りスポットを表示しています。
          </p>
        )}
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        {!userLocation && !loading && !error && (
          <p className="mt-2 text-xs text-muted-foreground">
            位置情報が未取得の場合は、人気順で表示しています。
          </p>
        )}
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground">
        {userLocation ? "近い順" : "人気順"}に{displaySpots.length}
        件の釣りスポットを表示
      </p>

      {/* Spot grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displaySpots.slice(0, 30).map((spot) => (
          <SpotItem
            key={spot.id}
            spot={spot}
            distanceKm={spot.distanceKm}
          />
        ))}
      </div>

      {displaySpots.length > 30 && (
        <div className="mt-6 text-center">
          <Link
            href="/spots"
            className="inline-flex items-center gap-1 rounded-full border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            すべての釣りスポットを見る
          </Link>
        </div>
      )}
    </div>
  );
}
