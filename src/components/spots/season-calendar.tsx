import { cn } from "@/lib/utils";
import { CatchableFish } from "@/types";
import Link from "next/link";

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function isInSeason(monthStart: number, monthEnd: number, month: number) {
  if (monthStart <= monthEnd) {
    return month >= monthStart && month <= monthEnd;
  }
  // Wraps around year (e.g., 10 ~ 4)
  return month >= monthStart || month <= monthEnd;
}

export function SeasonCalendar({
  catchableFish,
}: {
  catchableFish: CatchableFish[];
}) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="space-y-1">
      {/* Month header */}
      <div className="flex items-end">
        <div className="w-[4.5rem] shrink-0 sm:w-20" />
        <div className="grid flex-1 grid-cols-12">
          {MONTHS.map((m) => (
            <div
              key={m}
              className={cn(
                "text-center text-[11px] tabular-nums sm:text-xs",
                m === currentMonth
                  ? "font-bold text-primary"
                  : "text-muted-foreground",
              )}
            >
              {m}
            </div>
          ))}
        </div>
      </div>

      {/* Fish rows */}
      <div className="space-y-0.5">
        {catchableFish.map((cf) => (
          <div key={cf.fish.id} className="flex items-center">
            <Link prefetch={false}
              href={`/fish/${cf.fish.slug}`}
              className="w-[4.5rem] shrink-0 truncate pr-1.5 text-xs font-medium text-foreground hover:text-primary hover:underline sm:w-20 sm:pr-2 sm:text-sm"
            >
              {cf.fish.name}
            </Link>
            <div className="grid flex-1 grid-cols-12 gap-px">
              {MONTHS.map((m) => {
                const inSeason = isInSeason(cf.monthStart, cf.monthEnd, m);
                const isPeak = inSeason && cf.peakSeason;
                const isCurrent = m === currentMonth;
                return (
                  <div
                    key={m}
                    className={cn(
                      "relative h-7 sm:h-8",
                      // 最初と最後のセルのみ角丸
                      m === 1 && "rounded-l-md",
                      m === 12 && "rounded-r-md",
                      // ブランドトークン3段階: ハイシーズン=ocean-mid / シーズン=ocean-mid/25 / オフ=muted
                      isPeak
                        ? "bg-ocean-mid"
                        : inSeason
                          ? "bg-ocean-mid/25"
                          : "bg-muted",
                    )}
                  >
                    {isCurrent && (
                      <div className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-sunset-gold" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Current month indicator */}
      <div className="flex items-center">
        <div className="w-[4.5rem] shrink-0 sm:w-20" />
        <p className="text-[10px] text-muted-foreground sm:text-xs">
          <span className="mr-0.5 inline-block h-[3px] w-3 rounded-full bg-sunset-gold align-middle" /> 今月
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground sm:text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-5 rounded-sm bg-ocean-mid" />
          <span>ハイシーズン</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-5 rounded-sm bg-ocean-mid/25" />
          <span>シーズン</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-5 rounded-sm bg-muted" />
          <span>オフ</span>
        </div>
      </div>
    </div>
  );
}
