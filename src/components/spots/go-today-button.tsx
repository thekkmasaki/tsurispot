"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTS_KEY = "go-today-counts";

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"] as const;

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayStr(): string {
  return formatDateStr(new Date());
}

/** Generate an array of dates from today through N days ahead */
function getDateRange(days: number): { date: Date; dateStr: string; label: string; subLabel: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);

    const dateStr = formatDateStr(d);
    const dayOfWeek = DAY_LABELS[d.getDay()];
    const month = d.getMonth() + 1;
    const day = d.getDate();

    let label: string;
    let subLabel: string;

    if (i === 0) {
      label = "今日";
      subLabel = `${month}/${day}(${dayOfWeek})`;
    } else if (i === 1) {
      label = "明日";
      subLabel = `${month}/${day}(${dayOfWeek})`;
    } else {
      label = `${month}/${day}`;
      subLabel = `(${dayOfWeek})`;
    }

    return { date: d, dateStr, label, subLabel };
  });
}

function getCounts(): Record<string, Record<string, number>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCounts(counts: Record<string, Record<string, number>>) {
  localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
}

function getUserKey(slug: string, date: string): string {
  return `go-today-${slug}-${date}`;
}

function isUserGoingOnDate(slug: string, dateStr: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getUserKey(slug, dateStr)) === "1";
}

function getCountForDate(slug: string, dateStr: string): number {
  const counts = getCounts();
  return counts[slug]?.[dateStr] ?? 0;
}

export function GoTodayButton({
  slug,
  spotName,
}: {
  slug: string;
  spotName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGoing, setIsGoing] = useState(false);
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const dateRange = useMemo(() => getDateRange(8), []);

  const selectedDate = dateRange[selectedIndex];

  // Sync going/count state when slug or selected date changes
  useEffect(() => {
    if (!selectedDate) return;
    setIsGoing(isUserGoingOnDate(slug, selectedDate.dateStr));
    setCount(getCountForDate(slug, selectedDate.dateStr));
  }, [slug, selectedIndex, selectedDate]);

  const toggle = useCallback(() => {
    if (!selectedDate) return;

    const { dateStr } = selectedDate;
    const userKey = getUserKey(slug, dateStr);
    const counts = getCounts();

    if (!counts[slug]) counts[slug] = {};
    const currentCount = counts[slug][dateStr] ?? 0;

    if (isGoing) {
      localStorage.removeItem(userKey);
      counts[slug][dateStr] = Math.max(0, currentCount - 1);
      saveCounts(counts);
      setIsGoing(false);
      setCount(counts[slug][dateStr]);
    } else {
      localStorage.setItem(userKey, "1");
      counts[slug][dateStr] = currentCount + 1;
      saveCounts(counts);
      setIsGoing(true);
      setCount(counts[slug][dateStr]);
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, [slug, isGoing, selectedDate]);

  // Determine button text based on selected date
  const buttonText = useMemo(() => {
    if (!selectedDate) return "今日ここいく！";
    if (isGoing) {
      if (selectedIndex === 0) return "今日いく！";
      if (selectedIndex === 1) return "明日いく！";
      return `${selectedDate.label}にいく！`;
    }
    if (selectedIndex === 0) return "今日ここいく！";
    if (selectedIndex === 1) return "明日ここいく！";
    return `${selectedDate.label}にいく！`;
  }, [isGoing, selectedIndex, selectedDate]);

  // Determine count text
  const countText = useMemo(() => {
    if (count <= 0 || !selectedDate) return null;
    if (selectedIndex === 0) return `${count}人が今日行く予定`;
    if (selectedIndex === 1) return `${count}人が明日行く予定`;
    return `${count}人が${selectedDate.label}に行く予定`;
  }, [count, selectedIndex, selectedDate]);

  // aria-label for the toggle button
  const ariaLabel = useMemo(() => {
    if (!selectedDate) return "";
    const dateLabel = selectedIndex === 0 ? "今日" : selectedIndex === 1 ? "明日" : selectedDate.label;
    return isGoing
      ? `${spotName}への${dateLabel}の予定を取り消す`
      : `${dateLabel}${spotName}に行く`;
  }, [isGoing, spotName, selectedIndex, selectedDate]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Date selector chips */}
      <div className="relative w-full">
        <div
          className="flex gap-1 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {dateRange.map((item, i) => (
            <button
              key={item.dateStr}
              onClick={() => setSelectedIndex(i)}
              aria-label={`${item.label} ${item.subLabel}を選択`}
              className={cn(
                "flex-shrink-0 flex flex-col items-center rounded-lg px-2 py-1 text-xs font-medium transition-all min-h-[40px] min-w-[44px] justify-center",
                i === selectedIndex
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100",
                i === 0 && i === selectedIndex && "ring-1 ring-blue-300",
                i !== selectedIndex && item.date.getDay() === 0 && "text-red-500",
                i !== selectedIndex && item.date.getDay() === 6 && "text-blue-500"
              )}
            >
              <span className="leading-tight">{item.label}</span>
              <span
                className={cn(
                  "leading-tight text-[10px]",
                  i === selectedIndex ? "text-blue-100" : "text-gray-400"
                )}
              >
                {item.subLabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Go button + count in one row */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={ariaLabel}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 min-h-[40px]",
            isGoing
              ? "bg-blue-500 text-white hover:bg-blue-600 shadow-md"
              : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          <Navigation
            className={cn(
              "size-4 transition-transform duration-300",
              isGoing && "fill-white",
              isAnimating && "scale-125"
            )}
          />
          <span>{buttonText}</span>
        </button>
        {countText && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{countText}</span>
        )}
      </div>
    </div>
  );
}
