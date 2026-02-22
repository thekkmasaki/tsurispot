"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Calendar } from "lucide-react";

interface FishLikeButtonProps {
  spotSlug: string;
  fishSlug: string;
}

function getStorageKey(spotSlug: string, fishSlug: string) {
  return `fish_like:${spotSlug}:${fishSlug}`;
}

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDates(spotSlug: string, fishSlug: string): string[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(getStorageKey(spotSlug, fishSlug));
  if (!raw) return [];
  // 旧形式（単一タイムスタンプ）からの移行対応
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // 旧形式: 単一タイムスタンプ文字列 → 日付に変換
    const ts = Number(raw);
    if (!isNaN(ts)) {
      const d = new Date(ts);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return [dateStr];
    }
  }
  return [];
}

function saveDates(spotSlug: string, fishSlug: string, dates: string[]) {
  localStorage.setItem(getStorageKey(spotSlug, fishSlug), JSON.stringify(dates));
}

function isLikedToday(dates: string[]): boolean {
  return dates.includes(getTodayStr());
}

/** 直近N日間のうち何日釣れたか */
function recentActivity(dates: string[], days: number): number {
  const now = new Date();
  let count = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (dates.includes(key)) count++;
  }
  return count;
}

export function FishLikeButton({ spotSlug, fishSlug }: FishLikeButtonProps) {
  const [dates, setDates] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setDates(getDates(spotSlug, fishSlug));
  }, [spotSlug, fishSlug]);

  const todayDone = isLikedToday(dates);
  const totalCount = dates.length;
  const recent7 = recentActivity(dates, 7);

  function handleClick() {
    if (todayDone || animating) return;
    setAnimating(true);
    const today = getTodayStr();
    const newDates = [...dates, today];
    saveDates(spotSlug, fishSlug, newDates);
    setDates(newDates);
    setTimeout(() => setAnimating(false), 600);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={todayDone}
        aria-label={todayDone ? "今日は報告済み" : "この魚ここで釣れた！"}
        title={todayDone ? "今日は報告済み（毎日1回報告できます）" : "この魚ここで釣れた！（1日1回）"}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 min-h-[44px] ${
          todayDone
            ? "bg-blue-100 text-blue-600 cursor-default"
            : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
        } ${animating ? "scale-125" : ""}`}
      >
        <ThumbsUp
          className={`size-3.5 transition-transform duration-300 ${
            animating ? "scale-150" : ""
          } ${todayDone ? "fill-blue-500" : ""}`}
        />
        <span>
          {todayDone ? "今日釣れた！" : "ここで釣れた"}
        </span>
      </button>
      {totalCount > 0 && (
        <span
          className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
          title={`累計${totalCount}回報告 / 直近7日: ${recent7}回`}
        >
          <Calendar className="size-3" />
          {totalCount}回
        </span>
      )}
    </div>
  );
}
