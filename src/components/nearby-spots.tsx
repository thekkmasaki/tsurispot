"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGeolocation } from "@/hooks/use-geolocation";
import { SPOT_TYPE_LABELS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Star, Loader2, Waves, TreePine } from "lucide-react";

type WaterFilter = "all" | "sea" | "freshwater";

interface NearbySpotData {
  id: string;
  slug: string;
  name: string;
  spotType: string;
  rating: number;
  latitude: number;
  longitude: number;
  region: { prefecture: string; areaName: string };
  distanceKm?: number;
  catchableFish: {
    fish: { id: string; name: string; slug: string };
    monthStart: number;
    monthEnd: number;
    peakSeason: boolean;
  }[];
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

export function NearbySpots() {
  const [waterFilter, setWaterFilter] = useState<WaterFilter>("all");
  const [spots, setSpots] = useState<NearbySpotData[]>([]);
  const [fetching, setFetching] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const { latitude, longitude, error, loading, permissionDenied, requestLocation } =
    useGeolocation();

  const fetchSpots = useCallback(
    async (lat: number | null, lng: number | null, filter: WaterFilter) => {
      setFetching(true);
      try {
        const params = new URLSearchParams({ limit: "6" });
        if (lat != null && lng != null) {
          params.set("lat", lat.toFixed(4));
          params.set("lng", lng.toFixed(4));
        }
        if (filter === "sea") params.set("filter", "sea");
        if (filter === "freshwater") params.set("filter", "freshwater");

        const res = await fetch(`/api/spots/nearby?${params.toString()}`);
        if (res.ok) {
          const data: NearbySpotData[] = await res.json();
          setSpots(data);
        }
      } catch {
        // ネットワークエラーは静かに失敗
      } finally {
        setFetching(false);
      }
    },
    [],
  );

  // 位置情報が取得されたらAPI呼び出し
  useEffect(() => {
    if (latitude && longitude) {
      setHasLocation(true);
      fetchSpots(latitude, longitude, waterFilter);
    }
  }, [latitude, longitude, waterFilter, fetchSpots]);

  // フィルタ変更時（位置情報ありの場合のみ再取得）
  const handleFilterChange = (newFilter: WaterFilter) => {
    setWaterFilter(newFilter);
    // useEffect で自動再取得される（latitude/longitude/waterFilter依存）
  };

  // 位置情報が取得できていない場合
  if (!hasLocation) {
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

  // APIからデータ取得中
  if (fetching && spots.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-48 animate-pulse rounded bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (spots.length === 0) return null;

  // 最も近いスポットのエリア名を見出しに活用
  const nearestArea = spots[0]?.region.areaName;
  const nearestPref = spots[0]?.region.prefecture;
  const headingText = nearestArea
    ? `${nearestPref}${nearestArea}周辺の釣り場`
    : "現在地周辺の釣り場";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-sky-100">
            <Navigation className="size-4 text-sky-600" />
          </div>
          <div>
            <h2 className="text-base font-bold sm:text-lg">{headingText}</h2>
            <p className="text-xs text-muted-foreground">
              現在地から近い順に表示
            </p>
          </div>
        </div>
        <div className="flex gap-1 rounded-lg border bg-muted/50 p-0.5">
          {([
            { value: "all" as const, label: "すべて", Icon: null },
            { value: "sea" as const, label: "海", Icon: Waves },
            { value: "freshwater" as const, label: "川", Icon: TreePine },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                waterFilter === opt.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.Icon && <opt.Icon className="size-3" />}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spots.map((spot) => {
          const spotTypeLabel = SPOT_TYPE_LABELS[spot.spotType as keyof typeof SPOT_TYPE_LABELS] || spot.spotType;
          const richLabel = `${spot.region.prefecture}${spot.region.areaName}の${spotTypeLabel}・${spot.name}の釣り場情報`;
          return (
            <Link
              key={spot.id}
              href={`/spots/${spot.slug}`}
              title={richLabel}
              aria-label={richLabel}
            >
              <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold group-hover:text-primary sm:text-base">
                      {spot.name}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({spotTypeLabel})
                      </span>
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
                      {spotTypeLabel}
                    </Badge>
                    {spot.distanceKm != null && (
                      <span className="flex items-center gap-1 text-xs font-medium text-sky-600">
                        <MapPin className="size-3" />
                        {formatDistance(spot.distanceKm)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
