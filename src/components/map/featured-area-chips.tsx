"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MAP_PREFECTURE_CHANGED_EVENT,
  MAP_SELECT_PREFECTURE_EVENT,
  type MapPrefectureChangedDetail,
  type MapSelectPrefectureDetail,
} from "./map-events";

export interface FeaturedAreaItem {
  slug: string;
  name: string;
  nameShort: string;
  count: number;
}

export function FeaturedAreaChips({ items }: { items: FeaturedAreaItem[] }) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const onChanged = (e: Event) => {
      const detail = (e as CustomEvent<MapPrefectureChangedDetail>).detail;
      setSelected(detail?.prefectures ?? []);
    };
    window.addEventListener(MAP_PREFECTURE_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(MAP_PREFECTURE_CHANGED_EVENT, onChanged);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {items.map((item) => {
        const active = selected.length === 1 && selected[0] === item.name;
        return (
          <Link
            prefetch={false}
            key={item.slug}
            href={`/prefecture/${item.slug}`}
            aria-current={active ? "true" : undefined}
            onClick={(e) => {
              // 修飾キー付き（新しいタブで開く等）はリンクとして扱う
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              const ev = new CustomEvent<MapSelectPrefectureDetail>(MAP_SELECT_PREFECTURE_EVENT, {
                detail: { prefecture: item.name },
                cancelable: true,
              });
              // 地図が受け取ると preventDefault するので dispatchEvent は false を返す。
              // 地図がまだ読み込まれていなければ、そのまま県ページへ進む。
              const handledByMap = !window.dispatchEvent(ev);
              if (handledByMap) e.preventDefault();
            }}
            className={`group rounded-lg border p-2 text-center transition-shadow hover:shadow-md sm:p-3 ${
              active ? "border-primary bg-primary/10" : "bg-card"
            }`}
          >
            <div
              className={`text-xs font-semibold group-hover:text-primary sm:text-sm ${
                active ? "text-primary" : ""
              }`}
            >
              {item.nameShort}
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{item.count}件</div>
          </Link>
        );
      })}
    </div>
  );
}
