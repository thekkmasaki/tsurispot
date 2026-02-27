"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { SPOT_TYPE_LABELS } from "@/types";
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
          <Link
            key={spot.slug}
            href={`/spots/${spot.slug}`}
            className="w-44 shrink-0 rounded-xl border bg-card p-3 transition-shadow hover:shadow-md"
          >
            <h3 className="truncate text-sm font-semibold">{spot.name}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{spot.prefecture} {spot.areaName}</span>
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              {SPOT_TYPE_LABELS[spot.spotType]}
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}
