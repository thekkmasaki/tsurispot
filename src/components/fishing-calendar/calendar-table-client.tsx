"use client";

import Link from "next/link";
import { MapPin, Navigation } from "lucide-react";
import type { RegionSlug, RegionalSeasonData } from "@/types";
import { REGION_SLUG_TO_NAME, ALL_REGION_SLUGS } from "@/lib/data/fish-regional-seasons";
import { useAutoRegion } from "@/hooks/use-auto-region";

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
  const { selectedRegion, setSelectedRegion, detecting, detectRegion, regionLabel } = useAutoRegion();

  return (
    <div className="mb-10">
      {/* 地域セレクター */}
      <div className="mb-4 rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="size-5 text-sky-600" />
          <h3 className="text-sm font-bold text-sky-900">地域別にシーズンを表示</h3>
          <button
            type="button"
            onClick={detectRegion}
            disabled={detecting}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-sky-700 disabled:opacity-50"
          >
            <Navigation className={`size-3.5 ${detecting ? "animate-spin" : ""}`} />
            {detecting ? "取得中..." : "現在地から自動設定"}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedRegion(null)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
              selectedRegion === null
                ? "bg-sky-600 text-white shadow-md ring-2 ring-sky-300"
                : "bg-white text-gray-600 shadow-sm hover:bg-sky-100 hover:text-sky-700"
            }`}
          >
            全国
          </button>
          {ALL_REGION_SLUGS.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setSelectedRegion(slug)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all ${
                selectedRegion === slug
                  ? "bg-sky-600 text-white shadow-md ring-2 ring-sky-300"
                  : "bg-white text-gray-600 shadow-sm hover:bg-sky-100 hover:text-sky-700"
              }`}
            >
              {REGION_SLUG_TO_NAME[slug]}
            </button>
          ))}
        </div>
        {selectedRegion && (
          <p className="mt-2 text-xs text-sky-700">
            {regionLabel}地方のシーズンデータを表示中（地域データがない魚は全国データで表示）
          </p>
        )}
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
