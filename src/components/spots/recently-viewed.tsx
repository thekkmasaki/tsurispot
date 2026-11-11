"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { SpotCardCompact } from "@/components/spots/spot-card";
import type { FishingSpot } from "@/types";

const STORAGE_KEY = "tsurispot-recently-viewed";
const MAX_ITEMS = 8;

export interface RecentSpot {
  slug: string;
  name: string;
  prefecture: string;
  areaName: string;
  spotType: FishingSpot["spotType"];
}

export function saveRecentSpot(spot: RecentSpot) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let items: RecentSpot[] = stored ? JSON.parse(stored) : [];
    // Remove duplicate
    items = items.filter((s) => s.slug !== spot.slug);
    // Add to front
    items.unshift(spot);
    // Limit
    if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage unavailable
  }
}

export function RecentlyViewedSpots() {
  const [spots, setSpots] = useState<RecentSpot[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const items: RecentSpot[] = JSON.parse(stored);
        // Exclude current page
        const currentSlug = window.location.pathname.split("/spots/")[1];
        setSpots(items.filter((s) => s.slug !== currentSlug));
      }
    } catch {
      // ignore
    }
  }, []);

  if (spots.length === 0) return null;

  return (
    <section className="mt-8 sm:mt-12">
      <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
        <Clock className="size-5" />
        最近見たスポット
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide sm:-mx-0 sm:px-0">
        {spots.map((spot) => (
          <SpotCardCompact
            key={spot.slug}
            className="w-44 shrink-0"
            spot={{
              slug: spot.slug,
              name: spot.name,
              spotType: spot.spotType,
              region: { prefecture: spot.prefecture, areaName: spot.areaName },
            }}
          />
        ))}
      </div>
    </section>
  );
}
