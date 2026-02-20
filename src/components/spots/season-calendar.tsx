import { cn } from "@/lib/utils";
import { CatchableFish } from "@/types";

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
  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  return (
    <div className="space-y-3">
      {/* Month header */}
      <div className="flex items-end gap-0">
        <div className="w-16 shrink-0 sm:w-20" />
        <div className="grid flex-1 grid-cols-12">
          {MONTHS.map((m) => (
            <div
              key={m}
              className={cn(
                "text-center text-[10px] sm:text-xs",
                m === currentMonth
                  ? "font-bold text-primary"
                  : "text-muted-foreground"
              )}
            >
              {m}月
            </div>
          ))}
        </div>
      </div>

      {/* Fish rows */}
      {catchableFish.map((cf) => (
        <div key={cf.fish.id} className="flex items-center gap-0">
          <div className="w-16 shrink-0 truncate pr-1.5 text-xs font-medium sm:w-20 sm:pr-2 sm:text-sm">
            {cf.fish.name}
          </div>
          <div className="grid flex-1 grid-cols-12 gap-0.5">
            {MONTHS.map((m) => {
              const inSeason = isInSeason(cf.monthStart, cf.monthEnd, m);
              const isCurrent = m === currentMonth;
              return (
                <div
                  key={m}
                  className={cn(
                    "h-6 rounded-sm sm:h-7",
                    inSeason
                      ? cf.peakSeason
                        ? "bg-primary"
                        : "bg-primary/30"
                      : "bg-muted",
                    isCurrent && "ring-2 ring-primary ring-offset-1"
                  )}
                />
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:gap-4">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-primary" />
          <span>ハイシーズン</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-primary/30" />
          <span>シーズン</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded-sm bg-muted" />
          <span>オフシーズン</span>
        </div>
      </div>
    </div>
  );
}
