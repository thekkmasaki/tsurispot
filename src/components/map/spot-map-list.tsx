'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Star, Navigation, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SpotImage } from '@/components/ui/spot-image';
import { resolveSpotImageSrc } from '@/lib/data/spot-image-resolver';
import { DIFFICULTY_LABELS, SPOT_TYPE_LABELS } from '@/types';
import type { MapSpot } from '@/types';

interface SpotMapListProps {
  spots: MapSpot[];
  onSelect: (spot: MapSpot) => void;
  emptyMessage?: string;
}

const ITEMS_PER_PAGE = 20;

export function SpotMapList({
  spots,
  onSelect,
  emptyMessage = '条件に合うスポットがありません',
}: SpotMapListProps) {
  const [page, setPage] = useState(1);
  // フィルタ変更で spots が変わったら1ページ目へ戻す（effect を使わずレンダー中に調整する React 推奨パターン）。
  const [prevSpots, setPrevSpots] = useState(spots);
  if (spots !== prevSpots) {
    setPrevSpots(spots);
    setPage(1);
  }
  const listTopRef = useRef<HTMLDivElement>(null);
  // ページ送り時はリスト先頭へスクロール（render 中 setState とは分離し、クリックハンドラ内で実行）。
  const goToPage = (p: number) => {
    setPage(p);
    listTopRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  if (spots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-8 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const totalPages = Math.ceil(spots.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const displayed = spots.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div ref={listTopRef} className="space-y-2 p-1">
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
                src={resolveSpotImageSrc(spot.mainImageUrl)}
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
                  <Badge variant="free" className="text-[10px]">
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
            <Link prefetch={false}
              href={`/spots/${spot.slug}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              詳細を見る →
            </Link>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-center gap-3 px-2 py-3"
          aria-label="スポット一覧のページ送り"
        >
          <button
            type="button"
            onClick={() => goToPage(Math.max(1, safePage - 1))}
            disabled={safePage <= 1}
            className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
            前へ
          </button>
          <span className="text-xs tabular-nums text-muted-foreground">
            <span aria-live="polite">
              {safePage} / {totalPages} ページ
            </span>
            <span className="ml-1">（全{spots.length.toLocaleString()}件）</span>
          </span>
          <button
            type="button"
            onClick={() => goToPage(Math.min(totalPages, safePage + 1))}
            disabled={safePage >= totalPages}
            className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
          >
            次へ
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
