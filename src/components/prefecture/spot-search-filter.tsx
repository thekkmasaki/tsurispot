"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SpotCard } from "@/components/spots/spot-card";
import type { ListSpot } from "@/types";
import { normalizeForSearch } from "@/lib/search/normalize";
import { fishNameMatches } from "@/lib/search/fish-terms";

interface RegionInfo {
  id: string;
  /** /area/[slug] の代表 slug。エリアページを持たない市区町村は null（リンクを出さない） */
  slug: string | null;
  areaName: string;
}

interface RegionGroup {
  region: RegionInfo;
  spots: ListSpot[];
}

interface SpotSearchFilterProps {
  prefName: string;
  regionGroups: RegionGroup[];
  ungroupedSpots: ListSpot[];
  totalSpots: number;
  /** 全件を1ページで載せている一覧（/prefecture/[slug]/all）。「もっと見る」の横に出す */
  allHref?: string;
}

/** 初期表示と「もっと見る」1回あたりの件数 */
const PAGE_SIZE = 30;

export function SpotSearchFilter({
  prefName,
  regionGroups,
  ungroupedSpots,
  totalSpots,
  allHref,
}: SpotSearchFilterProps) {
  const [query, setQuery] = useState("");
  // 並び順: エリア別（既定）／評価の高い順（エリアをまたいだ1本の一覧）
  const [sort, setSort] = useState<"area" | "rating">("area");
  // 全件（多い県は200件超）を最初から描画しない。検索中は絞り込み結果を全件出す。
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const normalizedQuery = query.trim().toLowerCase();
  // 魚名は正式名なら完全一致（「アジ」でシマアジを拾わない）・別名（チヌ等）にも対応
  const fishQuery = normalizeForSearch(query.trim());

  const filteredRegionGroups = useMemo(() => {
    if (!normalizedQuery) return regionGroups;
    return regionGroups
      .map(({ region, spots }) => {
        const areaMatch = region.areaName.toLowerCase().includes(normalizedQuery);
        if (areaMatch) return { region, spots };
        const filtered = spots.filter(
          (s) =>
            s.name.toLowerCase().includes(normalizedQuery) ||
            s.fishNames.some((n) => fishNameMatches(fishQuery, n)) ||
            (s.address && s.address.toLowerCase().includes(normalizedQuery))
        );
        if (filtered.length === 0) return null;
        return { region, spots: filtered };
      })
      .filter(Boolean) as RegionGroup[];
  }, [regionGroups, normalizedQuery, fishQuery]);

  const filteredUngrouped = useMemo(() => {
    if (!normalizedQuery) return ungroupedSpots;
    return ungroupedSpots.filter(
      (s) =>
        s.name.toLowerCase().includes(normalizedQuery) ||
        s.fishNames.some((n) => fishNameMatches(fishQuery, n)) ||
        (s.address && s.address.toLowerCase().includes(normalizedQuery))
    );
  }, [ungroupedSpots, normalizedQuery, fishQuery]);

  const filteredSpotCount = useMemo(() => {
    const groupCount = filteredRegionGroups.reduce(
      (sum, g) => sum + g.spots.length,
      0
    );
    return groupCount + filteredUngrouped.length;
  }, [filteredRegionGroups, filteredUngrouped]);

  // エリア一覧カード: スポットが1件以上あり、エリアページを持つ市区町村だけ（0件エリアは出さない）
  const areaLinks = useMemo(
    () => regionGroups.filter((g) => g.region.slug !== null).length,
    [regionGroups],
  );
  const filteredAreaLinks = useMemo(
    () => filteredRegionGroups.filter((g) => g.region.slug !== null),
    [filteredRegionGroups],
  );

  const limit = normalizedQuery ? Infinity : visibleCount;
  const hiddenCount = Math.max(0, filteredSpotCount - limit);

  // エリア別表示: 上のエリアから順に limit 件まで
  const visibleGroups = useMemo(() => {
    let remaining = limit;
    const out: RegionGroup[] = [];
    for (const g of filteredRegionGroups) {
      if (remaining <= 0) break;
      out.push(remaining >= g.spots.length ? g : { region: g.region, spots: g.spots.slice(0, remaining) });
      remaining -= g.spots.length;
    }
    return { groups: out, ungrouped: remaining > 0 ? filteredUngrouped.slice(0, remaining) : [] };
  }, [filteredRegionGroups, filteredUngrouped, limit]);

  // 評価順表示: エリアをまたいで評価の高い順（同点は名前順で安定させる）
  const ratingSorted = useMemo(
    () =>
      [...filteredRegionGroups.flatMap((g) => g.spots), ...filteredUngrouped]
        .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, "ja"))
        .slice(0, limit),
    [filteredRegionGroups, filteredUngrouped, limit],
  );

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
            「{query}」の検索結果: エリア {filteredAreaLinks.length}件、スポット {filteredSpotCount}件
          </p>
        )}
      </div>

      {/* Area list */}
      {filteredAreaLinks.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5" />
            {prefName}のエリア一覧
            {normalizedQuery && (
              <span className="text-sm font-normal text-muted-foreground">
                （{filteredAreaLinks.length}/{areaLinks}件）
              </span>
            )}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAreaLinks.map(({ region: r, spots }) => (
              <Link prefetch={false} key={r.id} href={`/area/${r.slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                      <MapPin className="mr-1 inline size-4" />
                      {r.areaName}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {spots.length}件のスポット
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Spots grouped by area */}
      {filteredRegionGroups.length > 0 || filteredUngrouped.length > 0 ? (
        <section className="mb-8 sm:mb-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold sm:text-lg">
              {sort === "area" ? "エリア別 釣りスポット一覧" : "釣りスポット一覧（評価の高い順）"}
              {normalizedQuery ? (
                <span>（{filteredSpotCount}/{totalSpots}件）</span>
              ) : (
                <span>（全{totalSpots}件）</span>
              )}
            </h2>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              並び順
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as "area" | "rating");
                  setVisibleCount(PAGE_SIZE);
                }}
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
              >
                <option value="area">エリア別</option>
                <option value="rating">評価の高い順</option>
              </select>
            </label>
          </div>

          {sort === "rating" && (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ratingSorted.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </div>
          )}

          {sort === "area" && visibleGroups.groups.map(({ region: r, spots: areaSpots }) => (
            <div key={r.id} className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-primary pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4 text-primary" />
                {r.areaName}（{filteredRegionGroups.find((g) => g.region.id === r.id)?.spots.length ?? areaSpots.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areaSpots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          ))}

          {sort === "area" && visibleGroups.ungrouped.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-muted-foreground pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4" />
                その他のエリア（{filteredUngrouped.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGroups.ungrouped.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}

          {hiddenCount > 0 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-muted"
              >
                もっと見る（残り{hiddenCount}件）
              </button>
              {allHref && (
                <p className="mt-3 text-sm">
                  <Link prefetch={false} href={allHref} className="text-primary underline-offset-2 hover:underline">
                    {prefName}の全{totalSpots}件を一覧で見る
                  </Link>
                </p>
              )}
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
