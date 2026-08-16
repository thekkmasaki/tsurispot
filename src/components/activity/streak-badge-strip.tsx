"use client";
/**
 * 連続日数バッジ7種の横並び表示（案②）。
 * StreakCard と mypage の両方から使う。
 */
import { cn } from "@/lib/utils";
import { evalStreakBadges } from "@/lib/streak-badges";

interface StreakBadgeStripProps {
  longest: number;
  current: number;
  maxTripsInMonth: number;
  className?: string;
}

export function StreakBadgeStrip({
  longest,
  current,
  maxTripsInMonth,
  className,
}: StreakBadgeStripProps) {
  const badges = evalStreakBadges(longest, current, maxTripsInMonth);
  return (
    <div className={cn("overflow-x-auto pb-1", className)}>
      <div className="flex w-max gap-2">
        {badges.map((b) => (
          <div
            key={b.code}
            title={
              b.days > 0
                ? `${b.days}日連続で獲得`
                : "同じ月に釣行記録4回で獲得"
            }
            className={cn(
              "flex w-[72px] shrink-0 flex-col items-center gap-1 rounded-lg border p-2",
              b.earned
                ? "border-amber-300 bg-amber-50"
                : "border-border bg-muted/40 opacity-70",
            )}
          >
            <span
              className={cn("text-xl leading-none", !b.earned && "grayscale")}
              aria-hidden
            >
              {b.emoji}
            </span>
            <span className="text-center text-[10px] leading-tight text-foreground">
              {b.label}
            </span>
            {!b.earned && (
              <span className="h-1 w-full overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-emerald-400"
                  style={{ width: `${b.progress}%` }}
                />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
