import { cn } from "@/lib/utils";
import { BestTime as BestTimeType, BEST_TIME_LABELS } from "@/types";

const ratingStyles = {
  best: {
    text: BEST_TIME_LABELS.best,
    className: "bg-green-50 text-green-700 border-green-200",
    dotClass: "bg-green-500",
  },
  good: {
    text: BEST_TIME_LABELS.good,
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
  },
  fair: {
    text: BEST_TIME_LABELS.fair,
    className: "bg-gray-50 text-gray-600 border-gray-200",
    dotClass: "bg-gray-400",
  },
};

export function BestTime({ bestTimes }: { bestTimes: BestTimeType[] }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      {bestTimes.map((bt) => {
        const style = ratingStyles[bt.rating];
        return (
          <div
            key={bt.label}
            className={cn(
              "flex items-center justify-between rounded-lg border p-3",
              style.className
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className={cn("size-2.5 shrink-0 rounded-full", style.dotClass)} />
              <div className="min-w-0">
                <div className="text-sm font-medium sm:text-base">{bt.label}</div>
                <div className="text-xs opacity-75 sm:text-sm">{bt.timeRange}</div>
              </div>
            </div>
            <div className="shrink-0 text-xs font-semibold sm:text-sm">{style.text}</div>
          </div>
        );
      })}
    </div>
  );
}
