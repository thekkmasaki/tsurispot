'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, X, MapPin } from 'lucide-react';
import type { MapSpot } from '@/types';

interface SpotSearchProps {
  spots: MapSpot[];
  onSelect: (spot: MapSpot) => void;
}

export function SpotSearch({ spots, onSelect }: SpotSearchProps) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(spots, {
        keys: [
          { name: 'name', weight: 3 },
          { name: 'region.areaName', weight: 2 },
          { name: 'region.prefecture', weight: 1 },
          { name: 'address', weight: 0.5 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 1,
      }),
    [spots]
  );

  const results = useMemo(() => {
    const trimmed = q.trim();
    if (trimmed.length < 1) return [];
    return fuse.search(trimmed, { limit: 8 }).map((r) => r.item);
  }, [q, fuse]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handlePick = (spot: MapSpot) => {
    onSelect(spot);
    setOpen(false);
    setQ(spot.name);
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-shadow focus-within:ring-2 focus-within:ring-primary/40">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="スポット名・地名で検索（例: 琵琶湖、鎌倉）"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          autoComplete="off"
          spellCheck={false}
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              setOpen(false);
            }}
            aria-label="クリア"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-[1000] mt-1 max-h-80 w-full overflow-y-auto rounded-lg border bg-popover shadow-lg"
        >
          {results.map((spot) => (
            <li key={spot.id}>
              <button
                type="button"
                onClick={() => handlePick(spot)}
                className="flex w-full items-start gap-2 border-b px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-muted"
              >
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                <span className="flex flex-col items-start gap-0.5">
                  <span className="font-medium">{spot.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {spot.region.prefecture} {spot.region.areaName}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && q.trim().length > 0 && results.length === 0 && (
        <div className="absolute z-[1000] mt-1 w-full rounded-lg border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-lg">
          該当するスポットが見つかりません
        </div>
      )}
    </div>
  );
}
