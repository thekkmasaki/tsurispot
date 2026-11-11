"use client";

import { useState, useCallback } from "react";
import { Navigation, Loader2 } from "lucide-react";
import type { ListSpot } from "@/types";
import { Button } from "@/components/ui/button";
import { SpotCard } from "@/components/spots/spot-card";

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

/**
 * サーバー側で toListSpot（lib/data/list-spot.ts）した ListSpot に、
 * その月に釣れる魚名（釣れる度ゲート済み）を足したもの。
 */
export type MonthlySpot = ListSpot & {
  catchableFishNames: string[];
};

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
    } catch (e) {
      console.warn("[monthly-spots-sorter] localStorage読み込みに失敗（プライベートモード?）", e);
    }

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
        } catch (e) {
          console.warn("[monthly-spots-sorter] localStorage書き込みに失敗（プライベートモード?）", e);
        }
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
    : [...spots]
        // 位置情報なしの既定順は評価順（データ定義順のままだと特定地域が先頭に偏る）
        .sort((a, b) => b.rating - a.rating)
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
            {loading ? "取得中..." : "現在地から近い順に並べ替え"}
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
        {sortedSpots.map(({ catchableFishNames, distance, ...spot }) => (
          <SpotCard key={spot.slug} spot={spot} distance={distance}>
            {catchableFishNames.length > 0 && (
              <p className="text-muted-foreground">
                {monthName}に釣れる:{" "}
                <span className="font-bold text-foreground">{catchableFishNames.join("・")}</span>
              </p>
            )}
          </SpotCard>
        ))}
      </div>
    </>
  );
}
