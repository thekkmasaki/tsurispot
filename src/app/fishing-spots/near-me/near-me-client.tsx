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
import { DIFFICULTY_LABELS, SPOT_TYPE_LABELS } from "@/types";
import type { FishingSpot, ListSpot } from "@/types";

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

const PAGE_SIZE = 30;
const DISTANCE_OPTIONS = [5, 10, 20, 50, 100] as const;
const FEATURE_FILTERS = [
  { key: "beginner", label: "初心者OK", test: (s: SpotData) => s.difficulty === "beginner" || s.difficulty === "all" },
  { key: "free", label: "無料", test: (s: SpotData) => s.isFree },
  { key: "parking", label: "駐車場あり", test: (s: SpotData) => s.hasParking },
  { key: "toilet", label: "トイレあり", test: (s: SpotData) => s.hasToilet },
  { key: "rental", label: "レンタル竿あり", test: (s: SpotData) => s.hasRentalRod },
] as const;
type FeatureKey = (typeof FEATURE_FILTERS)[number]["key"];

const selectClass =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export function NearMeClient({
  spots,
  fishOptions,
}: {
  spots: SpotData[];
  /** 魚種セレクトの選択肢（掲載スポット数の多い順） */
  fishOptions: string[];
}) {
  const [loading, setLoading] = useState(false);
  const [spotType, setSpotType] = useState("");
  const [fish, setFish] = useState("");
  const [maxKm, setMaxKm] = useState<number | null>(null);
  const [features, setFeatures] = useState<FeatureKey[]>([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  // 魚種の絞り込みは全魚種が必要（SSR の spots は先頭3魚種のみ）→ 選択時に一覧APIから1回だけ取得
  const [fullFish, setFullFish] = useState<Map<string, string[]> | null>(null);
  const [fishLoading, setFishLoading] = useState(false);

  const loadFullFish = useCallback(() => {
    if (fullFish || fishLoading) return;
    setFishLoading(true);
    fetch("/api/spots/list")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list: ListSpot[]) => {
        setFullFish(new Map(list.map((s) => [s.id, s.fishNames])));
      })
      .catch(() => {
        /* 取得失敗時は先頭3魚種で絞り込む */
      })
      .finally(() => setFishLoading(false));
  }, [fullFish, fishLoading]);

  const changeFish = (value: string) => {
    setFish(value);
    setLimit(PAGE_SIZE);
    if (value) loadFullFish();
  };

  const toggleFeature = (key: FeatureKey) => {
    setFeatures((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setLimit(PAGE_SIZE);
  };

  const resetFilters = () => {
    setSpotType("");
    setFish("");
    setMaxKm(null);
    setFeatures([]);
    setLimit(PAGE_SIZE);
  };

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

  const filteredSpots = useMemo(() => {
    const featureTests = FEATURE_FILTERS.filter((f) => features.includes(f.key));
    return spots.filter((s) => {
      if (spotType && s.spotType !== spotType) return false;
      if (fish) {
        const names = fullFish?.get(s.id) ?? s.catchableFishNames;
        if (!names.includes(fish)) return false;
      }
      return featureTests.every((f) => f.test(s));
    });
  }, [spots, spotType, fish, fullFish, features]);

  const activeFilterCount =
    (spotType ? 1 : 0) + (fish ? 1 : 0) + (maxKm && userLocation ? 1 : 0) + features.length;

  const displaySpots = useMemo(() => {
    if (userLocation) {
      const withDistance = filteredSpots
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
      return maxKm ? withDistance.filter((s) => s.distanceKm <= maxKm) : withDistance;
    }
    // No location: show by rating
    return [...filteredSpots]
      .sort((a, b) => b.rating - a.rating)
      .map((s) => ({ ...s, distanceKm: undefined as number | undefined }));
  }, [filteredSpots, userLocation, maxKm]);

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

      {/* Filters */}
      <div className="mb-5 rounded-xl border p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">種類</span>
            <select value={spotType} onChange={(e) => {
                setSpotType(e.target.value);
                setLimit(PAGE_SIZE);
              }} className={selectClass}>
              <option value="">すべて</option>
              {Object.entries(SPOT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">釣りたい魚</span>
            <select value={fish} onChange={(e) => changeFish(e.target.value)} className={selectClass}>
              <option value="">すべて</option>
              {fishOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-2 block sm:col-span-1">
            <span className="mb-1 block text-xs font-bold text-muted-foreground">
              距離{!userLocation && "（現在地の取得後に使えます）"}
            </span>
            <select
              value={maxKm ?? ""}
              onChange={(e) => {
                setMaxKm(e.target.value ? Number(e.target.value) : null);
                setLimit(PAGE_SIZE);
              }}
              disabled={!userLocation}
              className={cn(selectClass, !userLocation && "opacity-50")}
            >
              <option value="">指定なし</option>
              {DISTANCE_OPTIONS.map((km) => (
                <option key={km} value={km}>
                  {km}km以内
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {FEATURE_FILTERS.map((f) => {
            const on = features.includes(f.key);
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={on}
                onClick={() => toggleFeature(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  on ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                {f.label}
              </button>
            );
          })}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="px-2 py-1.5 text-xs text-muted-foreground underline underline-offset-2"
            >
              条件をクリア
            </button>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {fishLoading ? (
          "魚種データを読み込み中..."
        ) : (
          <>
            {userLocation ? "近い順" : "人気順"}・
            <span className="font-bold text-foreground">{displaySpots.length.toLocaleString()}件</span>
            {activeFilterCount > 0 && "（絞り込み中）"}
          </>
        )}
      </p>

      {displaySpots.length === 0 && !fishLoading && (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          条件に合う釣り場が見つかりませんでした。条件を減らしてみてください。
        </p>
      )}

      {/* Spot grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displaySpots.slice(0, limit).map((spot) => (
          <SpotItem
            key={spot.id}
            spot={spot}
            distanceKm={spot.distanceKm}
          />
        ))}
      </div>

      {displaySpots.length > limit && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setLimit((n) => n + PAGE_SIZE)}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            もっと見る（残り{(displaySpots.length - limit).toLocaleString()}件）
          </button>
        </div>
      )}

      {displaySpots.length > PAGE_SIZE && (
        <div className="mt-4 text-center">
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
