"use client";

import { useState, useCallback } from "react";
import { Navigation } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABELS } from "@/types";
import { SpotCardCompact } from "@/components/spots/spot-card";

/** クライアントに渡すシリアライズ済みスポットデータ */
export interface SpotForFilter {
  slug: string;
  name: string;
  address: string;
  prefecture: string;
  spotType: "port" | "beach" | "rocky" | "river" | "pier" | "breakwater" | "surf" | "lake" | "pond";
  difficulty: "beginner" | "intermediate" | "advanced" | "all";
  rating: number;
  latitude: number;
  longitude: number;
  matchingFishCount: number;
  matchingFishNames: string[];
}

interface Props {
  spots: SpotForFilter[];
  methodName: string;
  monthName: string;
}

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function SpotListWithFilter({ spots, methodName, monthName }: Props) {
  const [selectedPref, setSelectedPref] = useState<string>("全国");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [locating, setLocating] = useState(false);

  // 利用可能な都道府県を抽出（スポット数順）
  const prefectures = Array.from(
    spots.reduce((map, s) => {
      map.set(s.prefecture, (map.get(s.prefecture) || 0) + 1);
      return map;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .map(([pref]) => pref);

  // フィルタリング
  const filtered =
    selectedPref === "全国"
      ? spots
      : spots.filter((s) => s.prefecture === selectedPref);

  // 現在地ソート。位置情報なしの既定順は評価順
  // （データ定義順のままだと特定地域が先頭に偏る）
  const sorted =
    sortByDistance && userLocation
      ? [...filtered].sort(
          (a, b) =>
            getDistanceKm(userLocation.lat, userLocation.lng, a.latitude, a.longitude) -
            getDistanceKm(userLocation.lat, userLocation.lng, b.latitude, b.longitude)
        )
      : [...filtered].sort((a, b) => b.rating - a.rating);

  const handleNearbySort = useCallback(() => {
    if (sortByDistance) {
      setSortByDistance(false);
      return;
    }
    if (userLocation) {
      setSortByDistance(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSortByDistance(true);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  }, [sortByDistance, userLocation]);

  return (
    <div>
      {/* フィルターバー */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={handleNearbySort}
          disabled={locating}
          className={`shrink-0 inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            sortByDistance
              ? "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/50 dark:text-green-200"
              : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
          }`}
        >
          <Navigation className="size-3" />
          {locating ? "取得中..." : sortByDistance ? "近い順" : "現在地から近い順"}
        </button>
        <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 shrink-0" />
        <button
          onClick={() => { setSelectedPref("全国"); }}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            selectedPref === "全国"
              ? "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
              : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
          }`}
        >
          全国
        </button>
        {prefectures.map((pref) => (
          <button
            key={pref}
            onClick={() => setSelectedPref(pref)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedPref === pref
                ? "bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
            }`}
          >
            {pref}
          </button>
        ))}
      </div>

      {/* スポットリスト */}
      {sorted.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <p>
              {selectedPref}の{monthName}の{methodName}に適したスポットはありません。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((spot, idx) => (
            <SpotCardCompact
              key={spot.slug}
              spot={{
                slug: spot.slug,
                name: spot.name,
                spotType: spot.spotType,
                region: { prefecture: spot.prefecture, areaName: "" },
                rating: spot.rating,
              }}
              rank={idx + 1}
              distance={
                sortByDistance && userLocation
                  ? getDistanceKm(userLocation.lat, userLocation.lng, spot.latitude, spot.longitude)
                  : null
              }
            >
              <p className="text-muted-foreground">
                {spot.matchingFishCount}魚種マッチ
                <span className="mx-1">|</span>
                {DIFFICULTY_LABELS[spot.difficulty]}
              </p>
              <p className="mt-0.5 line-clamp-1 text-muted-foreground">{spot.address}</p>
              {spot.matchingFishNames.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {spot.matchingFishNames.slice(0, 4).map((name) => (
                    <Badge key={name} variant="secondary" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                </div>
              )}
            </SpotCardCompact>
          ))}
        </div>
      )}
    </div>
  );
}
