"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Navigation, Star, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATCH_RATING_LABELS } from "@/types";
import { useGeolocation } from "@/hooks/use-geolocation";

/** クライアントに渡す軽量スポットデータ（region.id/slugを省略） */
export interface SpotLight {
  id: string;
  name: string;
  slug: string;
  prefecture: string;
  areaName: string;
  rating: number;
  catchRating: "excellent" | "good" | "fair";
  latitude: number;
  longitude: number;
}

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
  spots: SpotLight[];
  fishName: string;
  totalCount: number;
}

export function NearbySpotsSorter({ spots, fishName, totalCount }: NearbySpotsSorterProps) {
  // 独自 geolocation 実装をやめ、共通フックへ統一（2026-08 UX監査）:
  // - localStorage 保存済み位置（1時間以内）と permission granted 済みなら自動で近い順になる
  // - 未許可時の既定順はサーバー側で評価順ソート済み（fish/[slug]/page.tsx 参照）
  const { latitude, longitude, error, loading, requestLocation } = useGeolocation();
  // 「解除」で距離ソートをやめて評価順に戻すためのローカルスイッチ
  const [distanceSortOff, setDistanceSortOff] = useState(false);
  const userLocation =
    !distanceSortOff && latitude !== null && longitude !== null
      ? { lat: latitude, lng: longitude }
      : null;

  const INITIAL_COUNT = 5;

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
  }) => {
    const richLabel = `${spot.prefecture}${spot.areaName}の${spot.name}で${fishName}を釣る`;
    return (
    <Link prefetch={false}
      href={`/spots/${spot.slug}`}
      title={richLabel}
      aria-label={richLabel}
    >
      <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold group-hover:text-primary sm:text-base">
              {spot.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {spot.prefecture} {spot.areaName}
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
  };

  return (
    <section className="mb-6 sm:mb-8">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
        <MapPin className="size-5 text-primary" />
        {fishName}が釣れるスポット一覧
        <span className="text-sm font-normal text-muted-foreground">
          ({totalCount}件)
        </span>
      </h2>

      {/* 並び順の状態表示 + 現在地ボタン。
          旧文言「現在地から近い順に表示」は押下用ボタンなのに現在の並び順の説明に
          読めてしまい、未許可時に全国順のまま「近い順」と誤解される問題があった */}
      {!userLocation && (
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              <Star className="size-3" />
              評価順で表示中
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDistanceSortOff(false);
                requestLocation();
              }}
              disabled={loading}
              className="gap-1.5 text-sm"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Navigation className="size-4" />
              )}
              {loading ? "取得中..." : "現在地から近い順に並べ替え"}
            </Button>
          </div>
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
            onClick={() => setDistanceSortOff(true)}
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
      {totalCount > spots.length && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          ※ 全{totalCount}件中、評価上位{spots.length}件を表示しています。
          都道府県別リンクから地域ごとのスポットを確認できます。
        </p>
      )}
    </section>
  );
}
