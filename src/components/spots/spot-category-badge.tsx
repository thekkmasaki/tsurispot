import { cn } from "@/lib/utils";
import { SPOT_CATEGORY_LABELS, type SpotCategoryKey } from "@/lib/spot-category";

// 淡色の面＋濃い文字（AA を満たす組み合わせ）。分類ごとに色相を分ける。
const STYLES: Record<SpotCategoryKey, string> = {
  sea: "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/60 dark:text-sky-100 dark:border-sky-800",
  river: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-100 dark:border-emerald-800",
  lake: "bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-100 dark:border-teal-800",
  tsuribori: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-100 dark:border-orange-800",
  managed: "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-950/60 dark:text-violet-100 dark:border-violet-800",
};

export function SpotCategoryBadge({
  category,
  detail,
  className,
}: {
  category: SpotCategoryKey;
  detail?: string | null;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-1.5 py-px text-[11px] font-bold leading-4",
        STYLES[category],
        className,
      )}
    >
      {SPOT_CATEGORY_LABELS[category]}
      {detail && <span className="ml-1 font-medium">（{detail}）</span>}
    </span>
  );
}
