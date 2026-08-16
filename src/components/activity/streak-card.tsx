"use client";
/**
 * ハイブリッドストリークカード（案②）。匿名でもログインでも動く。
 * - 匿名: localStorage の訪問/アクション日から計算（Lv3=釣行はログイン機能）
 * - ログイン: /api/user/streak（訪問+アクション+釣行を統合）を取得し、
 *   まだサーバーに届いていない今日の分などはローカルと最大レベルでマージ
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Calendar, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarHeatmap } from "@/components/mypage/calendar-heatmap";
import { calculateStreak } from "@/lib/streak";
import {
  ACTIVITY_LEVEL_LABELS,
  buildActivityLevels,
  countByLevel,
  maxTripsInAnyMonth,
  todayJST,
} from "@/lib/activity";
import { useActivity, syncActivityToServer } from "@/hooks/use-activity";
import { StreakBadgeStrip } from "./streak-badge-strip";

interface StreakApiResponse {
  dailyCounts: Record<string, number>;
}

const LEGEND = [
  { level: 1, label: "見た", sub: "訪問", swatch: "bg-emerald-300" },
  { level: 2, label: "動いた", sub: "アクション", swatch: "bg-emerald-500" },
  { level: 3, label: "行った", sub: "釣行", swatch: "bg-emerald-700" },
] as const;

export function StreakCard({ className }: { className?: string }) {
  const { status } = useSession();
  const { visits, actions } = useActivity();
  const [serverLevels, setServerLevels] = useState<Record<
    string,
    number
  > | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setServerLevels(null);
      return;
    }
    let cancelled = false;
    // 今日の分をサーバーへ反映してから取得（VisitTracker の POST とのレース回避）
    syncActivityToServer()
      .then(() => fetch("/api/user/streak"))
      .then((r) => (r.ok ? r.json() : null))
      .then((data: StreakApiResponse | null) => {
        if (cancelled || !data || !data.dailyCounts) return;
        setServerLevels(data.dailyCounts);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

  // ローカル（今日の分を含む）とサーバーを最大レベルでマージ
  const levels = useMemo(() => {
    const local = buildActivityLevels(visits, actions, []);
    if (!serverLevels) return local;
    const merged: Record<string, number> = { ...serverLevels };
    for (const [d, lv] of Object.entries(local)) {
      if ((merged[d] || 0) < lv) merged[d] = lv;
    }
    return merged;
  }, [visits, actions, serverLevels]);

  const streak = useMemo(() => calculateStreak(Object.keys(levels)), [levels]);
  const counts = useMemo(() => countByLevel(levels), [levels]);
  const maxTrips = useMemo(() => maxTripsInAnyMonth(levels), [levels]);
  const todayLevel = levels[todayJST()] || 0;

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* ストリークバナー */}
        <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <Flame className="h-8 w-8 shrink-0 text-orange-500" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-orange-900">
              {streak.current > 0
                ? `${streak.current}日連続 ツリスポ習慣`
                : "今日からツリスポ習慣をはじめよう"}
            </div>
            <div className="text-xs text-orange-700">
              最長 {streak.longest}日 ・ 通算 {streak.totalDays}日 ・ 今日は「
              {ACTIVITY_LEVEL_LABELS[todayLevel] ?? "なし"}」
            </div>
          </div>
        </div>

        {/* 活動カレンダー */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <span className="font-medium">活動カレンダー</span>
            <span className="text-xs text-muted-foreground">
              直近半年・色が濃いほど深く関わった日
            </span>
          </div>
          <div className="overflow-x-auto pb-1">
            <CalendarHeatmap dailyCounts={levels} weeks={26} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {LEGEND.map((l) => (
              <span key={l.level} className="flex items-center gap-1.5">
                <span
                  className={cn("h-[10px] w-[10px] rounded-[2px]", l.swatch)}
                />
                {l.label}（{l.sub}）Lv.{l.level}
                <span className="font-medium text-foreground">
                  {counts[`lv${l.level}` as "lv1" | "lv2" | "lv3"]}
                </span>
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="h-[10px] w-[10px] rounded-[2px] bg-muted/60" />
              なし
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            見た＝ページを開いた／動いた＝「釣ったことある」を押した・お気に入りを追加した／行った＝釣行を記録した
          </p>
          {status !== "authenticated" && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              記録はこの端末に保存されています。釣行の記録（Lv.3）と機種変更時の引き継ぎには
              <Link
                prefetch={false}
                href="/login"
                className="mx-0.5 text-ocean-mid underline underline-offset-2"
              >
                無料のアカウント
              </Link>
              が使えます。
            </p>
          )}
        </div>

        {/* 連続日数バッジ */}
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium">連続日数バッジ</div>
          <StreakBadgeStrip
            longest={streak.longest}
            current={streak.current}
            maxTripsInMonth={maxTrips}
          />
        </div>
      </CardContent>
    </Card>
  );
}
