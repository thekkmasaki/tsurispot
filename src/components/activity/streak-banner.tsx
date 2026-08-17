"use client";
/**
 * ストリークバナー（ワクワク版）。mypage と StreakCard の共通部品。
 * - 大きな数字のカウントアップ + 炎のゆらぎ
 * - 「次のバッジまであと◯日」のマイルストーン進捗（先が見えると続けたくなる）
 */
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ACTIVITY_LEVEL_LABELS } from "@/lib/activity";
import { STREAK_BADGES } from "@/lib/streak-badges";

interface StreakBannerProps {
  current: number;
  longest: number;
  totalDays: number;
  /** 0-3。渡すと「今日は◯◯」を出す */
  todayLevel?: number;
  className?: string;
}

export function StreakBanner({
  current,
  longest,
  totalDays,
  todayLevel,
  className,
}: StreakBannerProps) {
  // 次のマイルストーン（日数バッジのうち current を超える最小のもの）
  const next = STREAK_BADGES.filter((b) => b.days > 0).find(
    (b) => b.days > current,
  );
  const nearBest = longest > current && longest - current <= 3;

  return (
    <div
      className={cn(
        "rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Flame
          className={cn(
            "h-9 w-9 shrink-0 text-orange-500",
            current > 0 && "animate-flame",
          )}
        />
        <div className="min-w-0 flex-1">
          {current > 0 ? (
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <AnimatedNumber
                value={current}
                className="text-3xl font-bold leading-none text-orange-600"
              />
              <span className="text-sm font-medium text-orange-900">
                日連続 ツリスポ習慣
              </span>
            </div>
          ) : (
            <div className="text-sm font-medium text-orange-900">
              今日からリスタート。開くだけで1日目が付きます
            </div>
          )}
          <div className="mt-0.5 text-xs text-orange-700">
            最長 {longest}日 ・ 通算 {totalDays}日
            {typeof todayLevel === "number" && (
              <>
                {" "}
                ・ 今日は「{ACTIVITY_LEVEL_LABELS[todayLevel] ?? "なし"}」
              </>
            )}
          </div>
        </div>
      </div>

      {/* 次の楽しみ: 自己ベスト間近 > 次のバッジ */}
      {nearBest ? (
        <div className="mt-2.5 text-xs font-medium text-orange-800">
          🏆 あと{longest - current + 1}日で自己ベスト更新（{longest}日）
        </div>
      ) : next ? (
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-xs text-orange-800">
            <span>
              {next.emoji} 「{next.label}」まであと
              <b className="mx-0.5 tabular-nums">{next.days - current}</b>日
            </span>
            <span className="tabular-nums text-orange-600/80">
              {current}/{next.days}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-orange-200/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.round((current / next.days) * 100))}%`,
              }}
            />
          </div>
        </div>
      ) : (
        current >= 365 && (
          <div className="mt-2.5 text-xs font-medium text-orange-800">
            🌟 全バッジ制覇。レジェンド継続中
          </div>
        )
      )}
    </div>
  );
}
