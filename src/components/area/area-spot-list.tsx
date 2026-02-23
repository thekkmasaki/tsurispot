"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Fish, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpotCard } from "@/components/spots/spot-card";
import { cn } from "@/lib/utils";
import type { FishingSpot } from "@/types";

interface FishInfo {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface AreaSpotListProps {
  spots: FishingSpot[];
  catchableFish: FishInfo[];
  areaName: string;
}

export function AreaSpotList({ spots, catchableFish, areaName }: AreaSpotListProps) {
  const [selectedFishIds, setSelectedFishIds] = useState<Set<string>>(new Set());

  const toggleFish = (fishId: string) => {
    setSelectedFishIds((prev) => {
      const next = new Set(prev);
      if (next.has(fishId)) {
        next.delete(fishId);
      } else {
        next.add(fishId);
      }
      return next;
    });
  };

  const clearFilter = () => {
    setSelectedFishIds(new Set());
  };

  const filteredSpots = useMemo(() => {
    if (selectedFishIds.size === 0) return spots;
    return spots.filter((spot) =>
      spot.catchableFish.some((cf) => selectedFishIds.has(cf.fish.id))
    );
  }, [spots, selectedFishIds]);

  const isFiltering = selectedFishIds.size > 0;

  return (
    <>
      {/* Fish filter section */}
      {catchableFish.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Filter className="size-5" />
            釣りたい魚で絞り込む
          </h2>
          <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
            魚種をタップすると、その魚が釣れるスポットだけを表示します（複数選択可）
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {/* Reset button */}
            <button
              onClick={clearFilter}
              className={cn(
                "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 min-h-[36px] sm:text-sm",
                !isFiltering
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              すべて
              <span className="ml-1 text-xs opacity-70">
                ({spots.length})
              </span>
            </button>

            {/* Fish badges */}
            {catchableFish.map((f) => {
              const isSelected = selectedFishIds.has(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => toggleFish(f.id)}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 min-h-[36px] sm:text-sm",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground scale-[1.02] shadow-sm"
                      : "border-border text-foreground hover:bg-primary/10 hover:border-primary/50"
                  )}
                >
                  {f.name}
                  <span
                    className={cn(
                      "ml-1 text-xs",
                      isSelected ? "opacity-80" : "text-muted-foreground"
                    )}
                  >
                    ({f.count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active filter indicator */}
          {isFiltering && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
              <Fish className="size-4 shrink-0 text-primary" />
              <span className="text-xs text-muted-foreground sm:text-sm">
                {Array.from(selectedFishIds)
                  .map((id) => catchableFish.find((f) => f.id === id)?.name)
                  .filter(Boolean)
                  .join("・")}
                で絞り込み中 -
                <span className="font-medium text-foreground">
                  {" "}{filteredSpots.length}件
                </span>
                のスポット
              </span>
              <button
                onClick={clearFilter}
                className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="絞り込みを解除"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Fish detail links (when not filtering, show as supplementary links) */}
          {!isFiltering && (
            <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
              {catchableFish.slice(0, 8).map((f) => (
                <Link
                  key={f.slug}
                  href={`/fish/${f.slug}`}
                  className="text-xs text-primary hover:underline sm:text-sm"
                  title={`${f.name}の釣り情報・釣り方を見る`}
                >
                  {f.name}の釣り方 &rarr;
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Spots list */}
      <section>
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          釣りスポット一覧
          {isFiltering ? (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              （{filteredSpots.length}/{spots.length}件）
            </span>
          ) : (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              （{spots.length}件）
            </span>
          )}
        </h2>
        {filteredSpots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSpots.map((spot) => (
              <div
                key={spot.id}
                className="animate-in fade-in-0 duration-300"
              >
                <SpotCard spot={spot} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-muted-foreground/30 py-12 text-center">
            <Fish className="mx-auto mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground sm:text-base">
              選択した魚種が釣れるスポットが見つかりませんでした
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilter}
              className="mt-4 min-h-[44px] gap-1.5"
            >
              <X className="size-4" />
              絞り込みを解除
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
