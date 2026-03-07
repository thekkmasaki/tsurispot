"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Search, X, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RegionItem {
  id: string;
  slug: string;
  areaName: string;
  prefecture: string;
  spotCount: number;
  topFish: string[];
}

interface PrefectureGroup {
  prefecture: string;
  regions: RegionItem[];
  totalSpots: number;
}

interface AreaListFilterProps {
  groups: PrefectureGroup[];
}

export function AreaListFilter({ groups }: AreaListFilterProps) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedQuery) return groups;
    return groups
      .map((g) => {
        const filtered = g.regions.filter(
          (r) =>
            r.areaName.toLowerCase().includes(normalizedQuery) ||
            r.prefecture.toLowerCase().includes(normalizedQuery) ||
            r.topFish.some((f) => f.toLowerCase().includes(normalizedQuery))
        );
        if (filtered.length === 0) return null;
        return {
          ...g,
          regions: filtered,
          totalSpots: filtered.reduce((sum, r) => sum + r.spotCount, 0),
        };
      })
      .filter(Boolean) as PrefectureGroup[];
  }, [groups, normalizedQuery]);

  const togglePrefecture = (pref: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pref)) next.delete(pref);
      else next.add(pref);
      return next;
    });
  };

  const expandAll = () => {
    setExpanded(new Set(filteredGroups.map((g) => g.prefecture)));
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  // 検索中は全展開
  const isSearching = normalizedQuery.length > 0;

  return (
    <>
      <div className="mb-5 sm:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="エリア名・都道府県名・魚名で検索..."
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
        <div className="mt-2 flex items-center justify-between">
          {normalizedQuery ? (
            <p className="text-xs text-muted-foreground">
              「{query}」: {filteredGroups.length}都道府県・
              {filteredGroups.reduce((s, g) => s + g.regions.length, 0)}エリア
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              都道府県をクリックしてエリアを表示
            </p>
          )}
          {!isSearching && (
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-xs text-primary hover:underline"
              >
                すべて開く
              </button>
              <button
                onClick={collapseAll}
                className="text-xs text-muted-foreground hover:underline"
              >
                すべて閉じる
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            「{query}」に一致するエリアが見つかりませんでした。
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGroups.map((group) => {
            const isOpen = isSearching || expanded.has(group.prefecture);
            return (
              <div key={group.prefecture} className="rounded-lg border">
                <button
                  onClick={() => togglePrefecture(group.prefecture)}
                  className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50 sm:p-4"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold sm:text-base">
                      {group.prefecture}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {group.regions.length}エリア
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {group.totalSpots}スポット
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {group.regions.map((region) => (
                        <Link key={region.id} href={`/area/${region.slug}`}>
                          <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold group-hover:text-primary">
                                    <MapPin className="mr-1 inline size-3.5" />
                                    {region.areaName}
                                  </h3>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 text-[10px]"
                                >
                                  {region.spotCount}件
                                </Badge>
                              </div>
                              {region.topFish.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1">
                                  {region.topFish.map((name) => (
                                    <Badge
                                      key={name}
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0"
                                    >
                                      {name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
