"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SpotCard } from "@/components/spots/spot-card";
import type { FishingSpot } from "@/types";

interface RegionInfo {
  id: string;
  slug: string;
  areaName: string;
}

interface RegionGroup {
  region: RegionInfo;
  spots: FishingSpot[];
}

interface SpotSearchFilterProps {
  prefName: string;
  prefRegions: RegionInfo[];
  regionGroups: RegionGroup[];
  ungroupedSpots: FishingSpot[];
  totalSpots: number;
}

export function SpotSearchFilter({
  prefName,
  prefRegions,
  regionGroups,
  ungroupedSpots,
  totalSpots,
}: SpotSearchFilterProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredRegions = useMemo(() => {
    if (!normalizedQuery) return prefRegions;
    return prefRegions.filter((r) =>
      r.areaName.toLowerCase().includes(normalizedQuery)
    );
  }, [prefRegions, normalizedQuery]);

  const filteredRegionGroups = useMemo(() => {
    if (!normalizedQuery) return regionGroups;
    return regionGroups
      .map(({ region, spots }) => {
        const areaMatch = region.areaName.toLowerCase().includes(normalizedQuery);
        if (areaMatch) return { region, spots };
        const filtered = spots.filter(
          (s) =>
            s.name.toLowerCase().includes(normalizedQuery) ||
            s.catchableFish.some((cf) =>
              cf.fish.name.toLowerCase().includes(normalizedQuery)
            ) ||
            (s.address && s.address.toLowerCase().includes(normalizedQuery))
        );
        if (filtered.length === 0) return null;
        return { region, spots: filtered };
      })
      .filter(Boolean) as RegionGroup[];
  }, [regionGroups, normalizedQuery]);

  const filteredUngrouped = useMemo(() => {
    if (!normalizedQuery) return ungroupedSpots;
    return ungroupedSpots.filter(
      (s) =>
        s.name.toLowerCase().includes(normalizedQuery) ||
        s.catchableFish.some((cf) =>
          cf.fish.name.toLowerCase().includes(normalizedQuery)
        ) ||
        (s.address && s.address.toLowerCase().includes(normalizedQuery))
    );
  }, [ungroupedSpots, normalizedQuery]);

  const filteredSpotCount = useMemo(() => {
    const groupCount = filteredRegionGroups.reduce(
      (sum, g) => sum + g.spots.length,
      0
    );
    return groupCount + filteredUngrouped.length;
  }, [filteredRegionGroups, filteredUngrouped]);

  // エリアカードに表示するスポット数（フィルタ時）
  const regionSpotCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const g of filteredRegionGroups) {
      counts.set(g.region.id, g.spots.length);
    }
    return counts;
  }, [filteredRegionGroups]);

  return (
    <>
      {/* Search input */}
      <div className="mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${prefName}のスポット・エリア・魚名で検索...`}
            className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {normalizedQuery && (
          <p className="mt-2 text-xs text-muted-foreground">
            「{query}」の検索結果: エリア {filteredRegions.length}件、スポット {filteredSpotCount}件
          </p>
        )}
      </div>

      {/* Area list */}
      {filteredRegions.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5" />
            {prefName}のエリア一覧
            {normalizedQuery && (
              <span className="text-sm font-normal text-muted-foreground">
                （{filteredRegions.length}/{prefRegions.length}件）
              </span>
            )}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRegions.map((r) => {
              const count = regionSpotCounts.get(r.id) ??
                regionGroups.find((g) => g.region.id === r.id)?.spots.length ?? 0;
              return (
                <Link key={r.id} href={`/area/${r.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        <MapPin className="mr-1 inline size-4" />
                        {r.areaName}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count}件のスポット
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Spots grouped by area */}
      {filteredRegionGroups.length > 0 || filteredUngrouped.length > 0 ? (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            エリア別 釣りスポット一覧
            {normalizedQuery ? (
              <span>（{filteredSpotCount}/{totalSpots}件）</span>
            ) : (
              <span>（全{totalSpots}件）</span>
            )}
          </h2>

          {filteredRegionGroups.map(({ region: r, spots: areaSpots }) => (
            <div key={r.id} className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-primary pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4 text-primary" />
                {r.areaName}エリア（{areaSpots.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areaSpots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          ))}

          {filteredUngrouped.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-muted-foreground pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4" />
                その他のエリア（{filteredUngrouped.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUngrouped.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : normalizedQuery ? (
        <section className="mb-8 sm:mb-10">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              「{query}」に一致するスポットが見つかりませんでした。
            </p>
          </div>
        </section>
      ) : null}
    </>
  );
}
