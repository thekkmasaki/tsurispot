"use client";
/**
 * /me 用の魚図鑑サマリー（案①）。匿名の localStorage 記録を表示して /fishdex へ誘導する。
 */
import Link from "next/link";
import { Fish, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFishdex } from "@/hooks/use-fishdex";

export function FishdexSummaryCard({
  total,
  className,
}: {
  total: number;
  className?: string;
}) {
  const { count } = useFishdex();
  const rate = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <Link
          prefetch={false}
          href="/fishdex"
          className="flex items-center gap-2 text-sm font-medium text-ocean-mid"
        >
          <Fish className="h-4 w-4" />
          あなたの魚図鑑 {count}
          <span className="text-muted-foreground">/{total}種</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700"
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {count === 0
            ? "釣ったことのある魚を1タップで記録できます"
            : `全${total}種のうち ${count}種 釣りました (${rate}%)`}
        </p>
      </CardContent>
    </Card>
  );
}
