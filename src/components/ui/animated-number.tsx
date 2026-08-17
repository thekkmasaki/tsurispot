"use client";
/**
 * カウントアップ表示の数字。統計カード・ストリーク・図鑑進捗・指数スコアで共用。
 */
import { useCountUp } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";

export function AnimatedNumber({
  value,
  durationMs,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const shown = useCountUp(value, durationMs);
  return <span className={cn("tabular-nums", className)}>{shown}</span>;
}
