"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Navigation,
  Loader2,
  MapPin,
  Car,
  Toilet,
  Fish,
} from "lucide-react";
import { SpotCardCompact } from "@/components/spots/spot-card";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "@/types";
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

/**
 * 正規コンパクトカード + スペック行（children）。
 * catchableFishNames は呼び出し側で先頭3件に切られているため、
 * 「釣れる魚N種」を出す写真付き SpotCard ではなく SpotCardCompact を使う。
 */
function SpotItem({
  spot,
  distanceKm,
}: {
  spot: SpotData;
  distanceKm?: number;
}) {
  const fishNames = Array.from(new Set(spot.catchableFishNames.filter(Boolean)));
  return (
    <SpotCardCompact
      className="h-full"
      distance={distanceKm}
      spot={{
        slug: spot.slug,
        name: spot.name,
        spotType: spot.spotType,
        region: { prefecture: spot.prefecture, areaName: spot.areaName },
        fishNames,
        rating: spot.rating,
      }}
    >
      <div className="flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-muted px-2.5 py-1.5">
        {spot.difficulty === "beginner" ? (
          <span className="font-bold text-primary">初心者OK</span>
        ) : (
          <span className="text-muted-foreground">{DIFFICULTY_LABELS[spot.difficulty]}</span>
        )}
        <span className="font-bold">{spot.isFree ? "無料" : "有料"}</span>
        {spot.hasParking && (
          <span className="inline-flex items-center gap-1">
            <Car className="size-3.5" aria-hidden="true" />
            駐車場あり
          </span>
        )}
        {spot.hasToilet && (
          <span className="inline-flex items-center gap-1">
            <Toilet className="size-3.5" aria-hidden="true" />
            トイレあり
          </span>
        )}
        {spot.hasRentalRod && (
          <span className="inline-flex items-center gap-1">
            <Fish className="size-3.5" aria-hidden="true" />
            レンタル竿あり
          </span>
        )}
      </div>
    </SpotCardCompact>
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
          <Link prefetch={false}
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
