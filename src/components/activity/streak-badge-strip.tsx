"use client";
/**
 * 連続日数バッジ7種の横並び表示（案②）。
 * StreakCard と mypage の両方から使う。
 * 新しく獲得したバッジは localStorage の既読と比較して検知し、
 * その場でアニメ + トーストで祝う（獲得の瞬間を無言で流さない）。
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { evalStreakBadges } from "@/lib/streak-badges";

const SEEN_KEY = "tsurispot-streak-badges-seen";

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
  const [justEarned, setJustEarned] = useState<Set<string>>(new Set());

  const earnedCodes = badges
    .filter((b) => b.earned)
    .map((b) => b.code)
    .join(",");

  useEffect(() => {
    if (!earnedCodes) return;
    const earned = earnedCodes.split(",");
    let seen: string[] = [];
    try {
      const raw = localStorage.getItem(SEEN_KEY);
      seen = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(seen)) seen = [];
    } catch {
      seen = [];
    }
    const fresh = earned.filter((c) => !seen.includes(c));
    if (fresh.length > 0) {
      setJustEarned(new Set(fresh));
      const names = badges
        .filter((b) => fresh.includes(b.code))
        .map((b) => `${b.emoji}${b.label}`);
      const label =
        names.length > 2
          ? `${names.slice(0, 2).join("、")} ほか${names.length - 2}件`
          : names.join("、");
      toast.success(`バッジ獲得！ ${label}`);
    }
    try {
      localStorage.setItem(
        SEEN_KEY,
        JSON.stringify(Array.from(new Set([...seen, ...earned]))),
      );
    } catch {
      // noop
    }
    // earnedCodes が変わった時だけ祝う（badges 配列自体は毎レンダ新規）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earnedCodes]);

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
              justEarned.has(b.code) &&
                "animate-badge-earn ring-2 ring-amber-400",
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
