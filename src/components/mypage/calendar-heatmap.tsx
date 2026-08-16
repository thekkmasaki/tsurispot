"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CalendarHeatmapProps {
  dailyCounts: Record<string, number>; // YYYY-MM-DD → count
  weeks?: number; // デフォルト 26 週（半年）
  className?: string;
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function dateAddDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function colorFor(count: number): string {
  if (count <= 0) return "bg-muted/60";
  if (count === 1) return "bg-emerald-300";
  if (count === 2) return "bg-emerald-500";
  return "bg-emerald-700";
}

// 値の意味は件数→活動レベル(1=見た/2=動いた/3=行った)に変わった（案②）
function levelTitle(count: number): string {
  if (count <= 0) return "記録なし";
  return ["", "見た", "動いた", "行った"][Math.min(count, 3)];
}

export function CalendarHeatmap({
  dailyCounts,
  weeks = 26,
  className,
}: CalendarHeatmapProps) {
  // グリッドの起点がレンダ時の new Date() のため、静的プリレンダ（/me 等）に乗せると
  // ビルド日と閲覧日のズレで全セルの日付・色が不一致になる。マウント後にだけ描画する
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // 7行×10px + 6gap×2px ≒ 82px を確保して CLS を防ぐ
    return (
      <div className={cn("flex gap-2", className)} style={{ height: 82 }} aria-hidden />
    );
  }

  // 直近 weeks 週分のグリッドを生成。各列は1週、各行は曜日（日〜土）。
  const today = new Date();
  // JST 補正
  const todayJst = new Date(today.getTime() + 9 * 3600 * 1000);
  todayJst.setUTCHours(0, 0, 0, 0);

  // 開始日: 今日から (weeks * 7 - 今日の曜日) 日前 → 日曜開始
  const todayDow = todayJst.getUTCDay(); // 0 (Sun) - 6 (Sat)
  const totalDays = weeks * 7;
  const startDate = dateAddDays(todayJst, -(totalDays - 1 - (6 - todayDow)));

  const weeksArr: { date: Date; count: number; isFuture: boolean }[][] = [];
  for (let w = 0; w < weeks; w++) {
    const weekCol: { date: Date; count: number; isFuture: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = dateAddDays(startDate, w * 7 + d);
      const count = dailyCounts[ymd(date)] || 0;
      const isFuture = date.getTime() > todayJst.getTime();
      weekCol.push({ date, count, isFuture });
    }
    weeksArr.push(weekCol);
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {/* 曜日ラベル */}
      <div className="flex flex-col gap-[2px] pt-[2px]">
        {WEEKDAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "h-[10px] w-3 text-center text-[8px] leading-[10px] text-muted-foreground",
              i % 2 === 1 ? "" : "invisible",
            )}
          >
            {label}
          </div>
        ))}
      </div>
      {/* 週列 */}
      <div className="flex gap-[2px] overflow-x-auto">
        {weeksArr.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map(({ date, count, isFuture }, di) => (
              <div
                key={di}
                title={`${ymd(date)} ${levelTitle(count)}`}
                role={isFuture ? undefined : "img"}
                aria-label={isFuture ? undefined : `${ymd(date)} ${levelTitle(count)}`}
                aria-hidden={isFuture ? true : undefined}
                className={cn(
                  "h-[10px] w-[10px] rounded-[2px]",
                  isFuture ? "bg-transparent" : colorFor(count),
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
