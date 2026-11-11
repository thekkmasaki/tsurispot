"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Loader2, ArrowRight, Waves, TreePine, Navigation } from "lucide-react";
import type { ListSpot } from "@/types";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { SpotCardCompact } from "@/components/spots/spot-card";
import { cn } from "@/lib/utils";

interface Top10Spot {
  id: string;
  slug: string;
  name: string;
  spotType: ListSpot["spotType"];
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  prefecture: string;
  areaName: string;
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

const SEA_TYPES = new Set(["port", "beach", "rocky", "pier", "breakwater"]);

export function HomeTop10Client({ spots }: { spots: Top10Spot[] }) {
  const [waterFilter, setWaterFilter] = useState<"all" | "sea" | "river">("all");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  const filteredSpots = useMemo(() => {
    if (waterFilter === "all") return spots;
    if (waterFilter === "sea") return spots.filter((s) => SEA_TYPES.has(s.spotType));
    return spots.filter((s) => s.spotType === "river");
  }, [spots, waterFilter]);

  const displaySpots = useMemo(() => {
    if (userLocation) {
      // 位置情報あり: 人気スポットを近い順に並べる
      return filteredSpots
        .map((s) => ({
          ...s,
          dist: getDistanceKm(userLocation[0], userLocation[1], s.latitude, s.longitude),
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 10);
    }
    // 位置情報なし: 人気順フォールバック
    return filteredSpots
      .slice()
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, 10)
      .map((s) => ({ ...s, dist: undefined as number | undefined }));
  }, [filteredSpots, userLocation]);

  const hasLocation = !!userLocation;

  return (
    <section className="bg-muted/50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <SectionHeading
            title={hasLocation ? "近くの人気スポット TOP10" : "人気スポット TOP10"}
            subtitle={
              hasLocation
                ? "評価の高い釣り場を現在地から近い順に表示"
                : "評価とレビュー数で選ぶ注目の釣り場"
            }
          />
          <Link prefetch={false}
            href="/spots"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            すべて見る
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* 現在地 + 海/川フィルター */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (!navigator.geolocation) return;
              setLocating(true);
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                  setLocating(false);
                },
                () => setLocating(false),
                { enableHighAccuracy: true, timeout: 10000 },
              );
            }}
            disabled={locating}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              hasLocation
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700",
            )}
          >
            {locating ? (
              <Loader2 className="mr-1 inline size-3.5 animate-spin" />
            ) : (
              <Navigation className="mr-1 inline size-3.5" />
            )}
            {hasLocation ? "現在地取得済み" : "現在地を取得"}
          </button>

          <span className="mx-1 h-5 w-px bg-border" />

          <button
            onClick={() => setWaterFilter(waterFilter === "sea" ? "all" : "sea")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              waterFilter === "sea"
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-sky-50 hover:text-sky-700",
            )}
          >
            <Waves className="mr-1 inline size-3.5" />
            海
          </button>
          <button
            onClick={() => setWaterFilter(waterFilter === "river" ? "all" : "river")}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              waterFilter === "river"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700",
            )}
          >
            <TreePine className="mr-1 inline size-3.5" />
            川
          </button>
        </div>

        <div className="space-y-1.5">
          {displaySpots.map((spot, index) => (
            <SpotCardCompact
              key={spot.id}
              rank={index + 1}
              distance={spot.dist ?? null}
              spot={{
                slug: spot.slug,
                name: spot.name,
                spotType: spot.spotType,
                region: { prefecture: spot.prefecture, areaName: spot.areaName },
                rating: spot.rating,
              }}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-center sm:hidden">
          <Link prefetch={false} href="/spots">
            <Button variant="outline" className="min-h-[44px] gap-1">
              すべてのスポットを見る
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
