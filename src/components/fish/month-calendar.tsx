interface MonthCalendarProps {
  seasonMonths: number[];
  peakMonths: number[];
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export function MonthCalendar({ seasonMonths, peakMonths }: MonthCalendarProps) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div>
      <div className="space-y-1">
        {MONTH_LABELS.map((label, index) => {
          const month = index + 1;
          const isPeak = peakMonths.includes(month);
          const isSeason = seasonMonths.includes(month);
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
