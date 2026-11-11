"use client";

import { Children, useState, type ReactNode } from "react";
import Link from "next/link";
import { Waves, Fish, Mountain, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { WATER_TYPES, WATER_TYPE_LABELS, type WaterType } from "@/lib/water-type";

const ICONS = { all: LayoutGrid, sea: Waves, river: Fish, lake: Mountain } as const;

/**
 * 一覧の「すべて／海／川／湖・池」切り替え。
 * カードはすべてサーバーで HTML に出しておき、ここでは表示・非表示だけを切り替える（SEO の本文・リンクは変わらない）。
 */
export function WaterTypeFilter({
  items,
  totals,
  limit,
  moreHref,
  moreLabel,
  children,
}: {
  /** children と同じ順番の、各カードの種類と「全体の上位に入るか」 */
  items: { water: WaterType; inAll: boolean }[];
  /** 種類ごとの総件数（上限で切る前） */
  totals: Record<WaterType, number>;
  limit: number;
  moreHref: string;
  moreLabel: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState<WaterType | "all">("all");
  const cards = Children.toArray(children);
  const total = totals.sea + totals.river + totals.lake;
  const tabs = WATER_TYPES.filter((w) => totals[w] > 0);
  // 1種類しかない県・条件では切り替えを出さない
  const showTabs = tabs.length > 1;

  const activeTotal = active === "all" ? total : totals[active];
  const rest = activeTotal - Math.min(activeTotal, limit);

  return (
    <div>
      {showTabs && (
        <div role="group" aria-label="釣り場の種類で絞り込む" className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-muted p-1">
          {(["all", ...tabs] as const).map((key) => {
            const Icon = ICONS[key];
            const on = active === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(key)}
                className={cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-bold transition-colors",
                  on ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-1 text-sm">
                  <Icon className="size-4" aria-hidden="true" />
                  {key === "all" ? "すべて" : WATER_TYPE_LABELS[key]}
                </span>
                <span className="tabular-nums font-normal">{key === "all" ? total : totals[key]}件</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card, i) => {
          const it = items[i];
          const visible = active === "all" ? it?.inAll : it?.water === active;
          return (
            <div key={i} className={visible ? "contents" : "hidden"}>
              {card}
            </div>
          );
        })}
      </div>

      {rest > 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          残りの{rest}件は
          <Link prefetch={false} href={moreHref} className="mx-1 text-primary hover:underline">
            {moreLabel}
          </Link>
          で探せます。
        </p>
      )}
    </div>
  );
}
