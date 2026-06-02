'use client';

import Link from 'next/link';
import { Star, Navigation, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SpotImage } from '@/components/ui/spot-image';
import { DIFFICULTY_LABELS, SPOT_TYPE_LABELS } from '@/types';
import type { MapSpot } from '@/types';

interface SpotMapListProps {
  spots: MapSpot[];
  onSelect: (spot: MapSpot) => void;
  emptyMessage?: string;
  limit?: number;
}

export function SpotMapList({
  spots,
  onSelect,
  emptyMessage = '条件に合うスポットがありません',
  limit = 100,
}: SpotMapListProps) {
  if (spots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const displayed = spots.slice(0, limit);
  const remaining = spots.length - displayed.length;

  return (
    <div className="space-y-2 p-1">
      {displayed.map((spot) => (
        <div
          key={spot.id}
          className="group overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md"
        >
          <button
            type="button"
            onClick={() => onSelect(spot)}
            className="flex w-full gap-3 p-2 text-left"
          >
            <div className="size-20 shrink-0 overflow-hidden rounded-md">
              <SpotImage
                src={
                  spot.mainImageUrl?.startsWith('http') ||
                  spot.mainImageUrl?.startsWith('/images/spots/wikimedia/')
                    ? spot.mainImageUrl
                    : undefined
                }
                alt={spot.name}
                spotType={spot.spotType}
                height="h-20"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight group-hover:text-primary">
                  {spot.name}
                </h3>
                <Navigation className="mt-0.5 size-3.5 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3" />
                {spot.region.prefecture} {spot.region.areaName}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {SPOT_TYPE_LABELS[spot.spotType]}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  {DIFFICULTY_LABELS[spot.difficulty]}
                </Badge>
                {spot.isFree && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px]">
                    無料
                  </Badge>
                )}
                <span className="ml-auto flex items-center gap-0.5 text-xs">
                  <Star className="size-3 fill-yellow-400 text-yellow-400" />
                  {spot.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </button>
          <div className="border-t bg-muted/30 px-2 py-1.5">
            <Link
              href={`/spots/${spot.slug}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              詳細を見る →
            </Link>
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <p className="px-2 py-3 text-center text-xs text-muted-foreground">
          他に {remaining} 件のスポットがあります。フィルタで絞り込んでください。
        </p>
      )}
    </div>
  );
}
