"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useGeolocation } from "@/hooks/use-geolocation";
import type { FishingSpot } from "@/types";

type LightSpot = Pick<FishingSpot, "latitude" | "longitude"> & {
  region: Pick<FishingSpot["region"], "prefecture">;
  catchableFish: {
    fish: { id: string; name: string; slug: string };
    monthStart: number;
    monthEnd: number;
    peakSeason?: boolean;
  }[];
};
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Compass,
  Fish,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import type { Prefecture } from "@/lib/data/prefectures";
import type { AreaGuide } from "@/lib/data/area-guides";

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

interface LocationRecommendationsProps {
  allSpots: LightSpot[];
  prefectures: Prefecture[];
  areaGuides: AreaGuide[];
}

export function LocationRecommendations({
  allSpots,
  prefectures,
  areaGuides,
}: LocationRecommendationsProps) {
  const { latitude, longitude } = useGeolocation();

  const recommendations = useMemo(() => {
    if (!latitude || !longitude) return null;

    // 近くのスポットから都道府県を推定
    const nearbySpots = allSpots
      .map((spot) => ({
        ...spot,
        distanceKm: getDistanceKm(latitude, longitude, spot.latitude, spot.longitude),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 20);

    // 最も多い都道府県を検出
    const prefCount = new Map<string, number>();
    for (const spot of nearbySpots) {
      const pref = spot.region.prefecture;
      prefCount.set(pref, (prefCount.get(pref) || 0) + 1);
    }
    const userPrefecture = [...prefCount.entries()].sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    if (!userPrefecture) return null;

    // 都道府県ページ情報
    const prefData = prefectures.find((p) => p.name === userPrefecture);

    // 該当エリアガイド
    const matchingGuides = areaGuides.filter((g) =>
      g.prefectures.includes(userPrefecture)
    );

    // 近くのスポットで今月釣れる魚（重複排除、最大8件）
    const currentMonth = new Date().getMonth() + 1;
    const fishMap = new Map<string, { name: string; slug: string; isPeak: boolean }>();
    for (const spot of nearbySpots.slice(0, 10)) {
      for (const cf of spot.catchableFish) {
        if (fishMap.has(cf.fish.id)) continue;
        const ms = cf.monthStart;
        const me = cf.monthEnd;
        const inSeason =
          ms <= me
            ? currentMonth >= ms && currentMonth <= me
            : currentMonth >= ms || currentMonth <= me;
        if (inSeason) {
          fishMap.set(cf.fish.id, {
            name: cf.fish.name,
            slug: cf.fish.slug,
            isPeak: cf.peakSeason || false,
          });
        }
        if (fishMap.size >= 8) break;
      }
      if (fishMap.size >= 8) break;
    }
    const seasonalFish = [...fishMap.values()];

    return { userPrefecture, prefData, matchingGuides, seasonalFish };
  }, [latitude, longitude, allSpots, prefectures, areaGuides]);

  if (!recommendations) return null;

  const { userPrefecture, prefData, matchingGuides, seasonalFish } = recommendations;

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-full bg-amber-100">
          <MapPin className="size-4 text-amber-600" />
        </div>
        <div>
          <h2 className="text-base font-bold sm:text-lg">
            {userPrefecture}のおすすめ記事
          </h2>
          <p className="text-xs text-muted-foreground">
            あなたの近くの釣り情報
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* 都道府県ページ */}
        {prefData && (
          <Link href={`/prefecture/${prefData.slug}`}>
            <Card className="group h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-100">
                    <MapPin className="size-4 text-sky-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                      {userPrefecture}の釣り場一覧
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {allSpots.filter((s) => s.region.prefecture === userPrefecture).length}件のスポット
                    </p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {userPrefecture}の釣りスポットを一覧で確認。エリア別・タイプ別に検索できます。
                </p>
                <div className="flex items-center justify-end text-xs font-medium text-primary">
                  詳しく見る
                  <ChevronRight className="size-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* エリアガイド */}
        {matchingGuides.slice(0, 2).map((guide) => (
          <Link key={guide.slug} href={`/area-guide/${guide.slug}`}>
            <Card className="group h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                    <Compass className="size-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                      {guide.name}釣り場ガイド
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      ベスト: {guide.bestSeason}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {guide.mainFish.slice(0, 3).map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-end text-xs font-medium text-primary">
                  ガイドを読む
                  <ChevronRight className="size-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 近くで今釣れる魚 */}
      {seasonalFish.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <Fish className="size-4 text-orange-500" />
            <h3 className="text-sm font-semibold">この近くで今釣れる魚</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {seasonalFish.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}`}>
                <Badge
                  variant="outline"
                  className={`cursor-pointer text-xs transition-colors hover:bg-primary/5 ${
                    f.isPeak
                      ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                      : ""
                  }`}
                >
                  {f.name}
                  {f.isPeak && " (旬)"}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 今日どこに行こうかなリンク */}
      <Link href="/recommendation" className="mt-4 block">
        <Card className="group border-dashed transition-shadow hover:shadow-md">
          <CardContent className="flex items-center gap-3 p-3 sm:p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100">
              <BookOpen className="size-5 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold group-hover:text-primary">
                今日どこに行こうかな？
              </h3>
              <p className="text-xs text-muted-foreground">
                条件を選んで、あなたにぴったりの釣り場を診断
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
