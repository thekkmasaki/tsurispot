"use client";

import { useMemo, useState, useEffect } from "react";
import { Users, Clock, Sun, CloudRain, Wind } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  calculateCrowdScore,
  getDailyPredictions,
  type CrowdLevel,
} from "@/lib/crowd-prediction";

interface CrowdPredictionProps {
  rating: number;
  isFree: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  prefecture?: string;
  hasParking?: boolean;
  reviewCount?: number;
}

const LEVEL_COLORS: Record<CrowdLevel, string> = {
  empty: "bg-green-500",
  low: "bg-emerald-400",
  moderate: "bg-yellow-400",
  busy: "bg-orange-400",
  very_busy: "bg-red-500",
};

const LEVEL_BG: Record<CrowdLevel, string> = {
  empty: "bg-green-50 text-green-700",
  low: "bg-emerald-50 text-emerald-700",
  moderate: "bg-yellow-50 text-yellow-700",
  busy: "bg-orange-50 text-orange-700",
  very_busy: "bg-red-50 text-red-700",
};

export function CrowdPredictionCard({
  rating,
  isFree,
  difficulty,
  prefecture,
  hasParking,
  reviewCount,
}: CrowdPredictionProps) {
  // Hydration対策: new Date()はクライアント側でのみ取得する
  const [timeInfo, setTimeInfo] = useState<{
    hour: number;
    dayOfWeek: number;
    month: number;
  } | null>(null);

  useEffect(() => {
    const now = new Date();
    setTimeInfo({
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      month: now.getMonth() + 1,
    });
  }, []);

  const baseParams = useMemo(
    () =>
      timeInfo
        ? {
            month: timeInfo.month,
            isHoliday: false,
            weatherCode: "clear" as const,
            spotPopularity: rating,
            isFree,
            difficulty,
            prefecture,
            hasParking,
            reviewCount,
          }
        : null,
    [timeInfo, rating, isFree, difficulty, prefecture, hasParking, reviewCount]
  );

  const currentPrediction = useMemo(
    () =>
      baseParams && timeInfo
        ? calculateCrowdScore({
            ...baseParams,
            dayOfWeek: timeInfo.dayOfWeek,
            hour: timeInfo.hour,
          })
        : null,
    [baseParams, timeInfo]
  );

  const hourlyPredictions = useMemo(
    () =>
      baseParams && timeInfo
        ? getDailyPredictions({
            ...baseParams,
            dayOfWeek: timeInfo.dayOfWeek,
          })
        : null,
    [baseParams, timeInfo]
  );

  // 表示する時間帯 (5:00〜21:00)
  const displayHours = hourlyPredictions?.filter(
    (h) => h.hour >= 5 && h.hour <= 21
  );

  // マウント前はスケルトン表示（SSRとクライアント初回レンダリングが一致）
  if (!timeInfo || !currentPrediction || !displayHours) {
    return (
      <Card className="gap-0 py-0">
        <CardContent className="p-4 sm:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">
            <Users className="size-4 text-primary" />
            混雑予想
          </h3>
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-24 rounded-lg bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="flex items-end gap-[2px]">
              {Array.from({ length: 17 }, (_, i) => (
                <div
                  key={i}
                  className="h-6 flex-1 rounded-sm bg-muted"
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-4 sm:p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">
          <Users className="size-4 text-primary" />
          混雑予想
        </h3>

        {/* 現在の混雑予想 */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className={`rounded-lg px-3 py-1.5 text-sm font-bold ${LEVEL_BG[currentPrediction.level]}`}
          >
            {currentPrediction.label}
          </div>
          <span className="text-xs text-muted-foreground">
            現在 ({timeInfo.hour}:00)
          </span>
        </div>

        {/* 影響している要因 */}
        {currentPrediction.factors.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {currentPrediction.factors.map((factor) => (
              <span
                key={factor}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {factor}
              </span>
            ))}
          </div>
        )}

        {/* 時間帯別バーチャート */}
        <div className="space-y-1">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            <Clock className="mr-1 inline size-3" />
            時間帯別の混雑予想（今日）
          </p>
          <div className="flex items-end gap-[2px]">
            {displayHours.map(({ hour, prediction }) => (
              <div key={hour} className="flex flex-1 flex-col items-center gap-0.5">
                <div
                  className={`w-full rounded-sm ${LEVEL_COLORS[prediction.level]} transition-all`}
                  style={{ height: `${Math.max(4, prediction.score * 0.4)}px` }}
                  title={`${hour}:00 - ${prediction.label} (スコア: ${prediction.score})`}
                />
                {hour % 3 === 0 && (
                  <span className="text-[9px] text-muted-foreground">
                    {hour}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 凡例 */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm bg-green-500" />
            空き
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm bg-yellow-400" />
            普通
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm bg-orange-400" />
            やや混雑
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-sm bg-red-500" />
            混雑
          </span>
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground">
          ※ 天気・曜日・時間帯・シーズンから推定した予測値です。実際の混雑状況とは異なる場合があります。
        </p>
      </CardContent>
    </Card>
  );
}
