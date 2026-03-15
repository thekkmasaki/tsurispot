"use client";

import { useState } from "react";
import type { RegionSlug, RegionalSeasonData } from "@/types";
import { REGION_SLUG_TO_NAME, ALL_REGION_SLUGS } from "@/lib/data/fish-regional-seasons";

interface MonthCalendarProps {
  seasonMonths: number[];
  peakMonths: number[];
  regionalData?: Partial<Record<RegionSlug, RegionalSeasonData>>;
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export function MonthCalendar({ seasonMonths, peakMonths, regionalData }: MonthCalendarProps) {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedRegion, setSelectedRegion] = useState<RegionSlug | null>(null);

  // 選択地域に応じたデータを取得
  const activeSeasonMonths = selectedRegion && regionalData?.[selectedRegion]
    ? regionalData[selectedRegion]!.seasonMonths
    : seasonMonths;
  const activePeakMonths = selectedRegion && regionalData?.[selectedRegion]
    ? regionalData[selectedRegion]!.peakMonths
    : peakMonths;

  // regionalDataに存在する地域のみ表示
  const availableRegions = regionalData
    ? ALL_REGION_SLUGS.filter((slug) => regionalData[slug])
    : [];

  return (
    <div>
      {/* 地域タブ（regionalDataがある場合のみ表示） */}
      {availableRegions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedRegion(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedRegion === null
                ? "bg-sky-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全国
          </button>
          {availableRegions.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => setSelectedRegion(slug)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedRegion === slug
                  ? "bg-sky-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {REGION_SLUG_TO_NAME[slug]}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        {MONTH_LABELS.map((label, index) => {
          const month = index + 1;
          const isPeak = activePeakMonths.includes(month);
          const isSeason = activeSeasonMonths.includes(month);
          const isCurrent = month === currentMonth;

          return (
            <div
              key={month}
              className={`flex items-center gap-3 rounded-md px-3 py-1.5 ${
                isCurrent ? "bg-sky-50" : ""
              }`}
            >
              <span className="w-10 shrink-0 text-sm font-medium text-muted-foreground">
                {label}
              </span>

              <div className="flex-1">
                <div
                  className={`h-4 rounded-sm transition-all ${
                    isPeak
                      ? "w-full bg-sky-600"
                      : isSeason
                        ? "w-3/4 bg-sky-300"
                        : "w-1/4 bg-gray-100"
                  }`}
                />
              </div>

              <div className="flex w-20 shrink-0 items-center gap-1">
                {isPeak && (
                  <span className="text-xs font-semibold text-sky-700">
                    最盛期
                  </span>
                )}
                {isCurrent && (
                  <span className="text-xs font-medium text-sky-600">
                    &larr; 今月
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-5 rounded-sm bg-gray-100" />
          <span>少ない</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-5 rounded-sm bg-sky-300" />
          <span>まずまず</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-5 rounded-sm bg-sky-600" />
          <span>よく釣れる</span>
        </div>
      </div>
    </div>
  );
}
