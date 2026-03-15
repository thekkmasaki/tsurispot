"use client";

import { useState } from "react";
import Link from "next/link";
import type { RegionSlug, RegionalSeasonData } from "@/types";
import { REGION_SLUG_TO_NAME, ALL_REGION_SLUGS } from "@/lib/data/fish-regional-seasons";

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

interface FishItem {
  slug: string;
  name: string;
  seasonMonths: number[];
  peakMonths: number[];
}

interface CalendarTableClientProps {
  fishList: FishItem[];
  regionalData: Record<string, Partial<Record<RegionSlug, RegionalSeasonData>>>;
}

function getSeasonForFish(
  fish: FishItem,
  region: RegionSlug | null,
  regionalData: Record<string, Partial<Record<RegionSlug, RegionalSeasonData>>>
): { seasonMonths: number[]; peakMonths: number[] } {
  if (region) {
    const override = regionalData[fish.slug]?.[region];
    if (override) return override;
  }
  return { seasonMonths: fish.seasonMonths, peakMonths: fish.peakMonths };
}

export function CalendarTableClient({ fishList, regionalData }: CalendarTableClientProps) {
  const [selectedRegion, setSelectedRegion] = useState<RegionSlug | null>(null);

  return (
    <div className="mb-10">
      {/* 地域セレクター */}
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="region-select" className="text-sm font-medium text-muted-foreground">
          地域で絞り込み:
        </label>
        <select
          id="region-select"
          value={selectedRegion ?? ""}
          onChange={(e) => setSelectedRegion(e.target.value === "" ? null : (e.target.value as RegionSlug))}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">全国（デフォルト）</option>
          {ALL_REGION_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {REGION_SLUG_TO_NAME[slug]}
            </option>
          ))}
        </select>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="whitespace-nowrap px-3 py-2 text-left font-medium">魚種</th>
              {MONTH_NAMES.map((name) => (
                <th key={name} className="whitespace-nowrap px-1.5 py-2 text-center font-medium">
                  {name.replace("月", "")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {fishList.map((fish) => {
              const { seasonMonths, peakMonths } = getSeasonForFish(fish, selectedRegion, regionalData);
              return (
                <tr key={fish.slug} className="hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-1.5">
                    <Link
                      href={`/fish/${fish.slug}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {fish.name}
                    </Link>
                  </td>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const isPeak = peakMonths.includes(month);
                    const isSeason = seasonMonths.includes(month);
                    return (
                      <td key={month} className="px-1.5 py-1.5 text-center">
                        {isPeak ? (
                          <span className="inline-block size-3 rounded-full bg-primary" title="旬" />
                        ) : isSeason ? (
                          <span className="inline-block size-3 rounded-full bg-primary/30" title="シーズン" />
                        ) : (
                          <span className="inline-block size-3 rounded-full bg-muted" title="-" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center gap-4 border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-primary" />
            旬（ベストシーズン）
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-primary/30" />
            シーズン
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-muted border" />
            オフシーズン
          </div>
        </div>
      </div>
    </div>
  );
}
