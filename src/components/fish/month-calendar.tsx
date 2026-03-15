"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation } from "lucide-react";
import type { RegionSlug, RegionalSeasonData } from "@/types";
import { REGION_SLUG_TO_NAME, ALL_REGION_SLUGS } from "@/lib/data/fish-regional-seasons";
import { getRegionFromCoords } from "@/lib/geo-to-region";

interface MonthCalendarProps {
  seasonMonths: number[];
  peakMonths: number[];
  regionalData?: Partial<Record<RegionSlug, RegionalSeasonData>>;
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const STORAGE_KEY = "tsurispot-region";

export function MonthCalendar({ seasonMonths, peakMonths, regionalData }: MonthCalendarProps) {
  const currentMonth = new Date().getMonth() + 1;
  const [selectedRegion, setSelectedRegion] = useState<RegionSlug | null>(null);
  const [detecting, setDetecting] = useState(false);

  // localStorage から復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== "null") {
        setSelectedRegion(saved as RegionSlug);
      }
    } catch {}
  }, []);

  function handleSelect(region: RegionSlug | null) {
    setSelectedRegion(region);
    try { localStorage.setItem(STORAGE_KEY, region ?? "null"); } catch {}
  }

  function handleDetect() {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const region = getRegionFromCoords(pos.coords.latitude, pos.coords.longitude);
        setDetecting(false);
        if (region) handleSelect(region);
      },
      () => setDetecting(false),
      { timeout: 8000, maximumAge: 300000 }
    );
  }

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
        <div className="mb-4 rounded-lg border border-sky-200 bg-sky-50/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 text-sky-600" />
              <span className="text-xs font-bold text-sky-800">地域別シーズン</span>
            </div>
            <button
              type="button"
              onClick={handleDetect}
              disabled={detecting}
              className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-[11px] font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
            >
              <Navigation className={`size-3 ${detecting ? "animate-spin" : ""}`} />
              {detecting ? "取得中" : "現在地"}
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                selectedRegion === null
                  ? "bg-sky-600 text-white shadow ring-1 ring-sky-300"
                  : "bg-white text-gray-600 shadow-sm hover:bg-sky-100"
              }`}
            >
              全国
            </button>
            {availableRegions.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => handleSelect(slug)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                  selectedRegion === slug
                    ? "bg-sky-600 text-white shadow ring-1 ring-sky-300"
                    : "bg-white text-gray-600 shadow-sm hover:bg-sky-100"
                }`}
              >
                {REGION_SLUG_TO_NAME[slug]}
              </button>
            ))}
          </div>
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
