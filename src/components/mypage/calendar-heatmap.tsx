"use client";

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

export function CalendarHeatmap({
  dailyCounts,
  weeks = 26,
  className,
}: CalendarHeatmapProps) {
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
                title={`${ymd(date)} (${count}件)`}
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
