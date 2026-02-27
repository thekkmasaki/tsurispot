"use client";

import { useState, useEffect, useCallback } from "react";
import { Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTS_KEY = "go-today-counts";

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

function isUserGoing(slug: string): boolean {
  if (typeof window === "undefined") return false;
  const date = getTodayStr();
  return localStorage.getItem(getUserKey(slug, date)) === "1";
}

function getCount(slug: string): number {
  const counts = getCounts();
  const date = getTodayStr();
  return counts[slug]?.[date] ?? 0;
}

export function GoTodayButton({
  slug,
  spotName,
}: {
  slug: string;
  spotName: string;
}) {
  const [isGoing, setIsGoing] = useState(false);
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsGoing(isUserGoing(slug));
    setCount(getCount(slug));
  }, [slug]);

  const toggle = useCallback(() => {
    const date = getTodayStr();
    const userKey = getUserKey(slug, date);
    const counts = getCounts();

    if (!counts[slug]) counts[slug] = {};
    const currentCount = counts[slug][date] ?? 0;

    if (isGoing) {
      // 取り消し
      localStorage.removeItem(userKey);
      counts[slug][date] = Math.max(0, currentCount - 1);
      saveCounts(counts);
      setIsGoing(false);
      setCount(counts[slug][date]);
    } else {
      // 登録
      localStorage.setItem(userKey, "1");
      counts[slug][date] = currentCount + 1;
      saveCounts(counts);
      setIsGoing(true);
      setCount(counts[slug][date]);
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  }, [slug, isGoing]);

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={toggle}
        aria-label={
          isGoing
            ? `${spotName}への予定を取り消す`
            : `今日${spotName}に行く`
        }
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 min-h-[44px]",
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
        <span>{isGoing ? "今日いく！" : "今日ここいく！"}</span>
      </button>
      {count > 0 && (
        <span className="text-xs text-muted-foreground">
          {count}人が今日行く予定
        </span>
      )}
    </div>
  );
}
