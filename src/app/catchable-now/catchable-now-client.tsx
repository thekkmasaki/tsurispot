"use client";

import { useState } from "react";
import Link from "next/link";
import { Fish, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FishCard } from "@/components/fish/fish-card";
import type { FishSpecies } from "@/types";

const SEASONAL_TIPS: Record<string, string> = {
  spring:
    "春は水温が上がり始め、魚の活性も上がる季節。堤防からのサビキ釣りで小型の回遊魚が狙えます。風の穏やかな日を選ぶと快適に釣りが楽しめます。",
  summer:
    "夏は魚種が最も豊富な季節。早朝や夕方の涼しい時間帯がおすすめ。熱中症対策として帽子・水分・日焼け止めを忘れずに。",
  autumn:
    "秋は魚が冬に備えて活発にエサを食べる季節。型の良い魚が釣れやすく、初心者でも大物のチャンスがあります。",
  winter:
    "冬は魚種は少ないですが、根魚（カサゴ・メバル）が好シーズン。防寒対策をしっかりして、穴釣りやメバリングを楽しみましょう。",
};

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function getSeasonLabel(month: number): string {
  const season = getSeason(month);
  const labels: Record<string, string> = {
    spring: "春",
    summer: "夏",
    autumn: "秋",
    winter: "冬",
  };
  return labels[season];
}

function getPrevMonth(month: number): number {
  return month === 1 ? 12 : month - 1;
}

function getNextMonth(month: number): number {
  return month === 12 ? 1 : month + 1;
}

interface CatchableNowClientProps {
  fishSpecies: FishSpecies[];
  initialMonth: number;
}

export function CatchableNowClient({ fishSpecies, initialMonth }: CatchableNowClientProps) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const nextMonth = getNextMonth(selectedMonth);
  const prevMonth = getPrevMonth(selectedMonth);
  const season = getSeason(selectedMonth);
  const tip = SEASONAL_TIPS[season];

  // Classify into 3 groups
  const peakFish = fishSpecies.filter((f) =>
    f.peakMonths.includes(selectedMonth)
  );
  const seasonFish = fishSpecies.filter(
    (f) =>
      f.seasonMonths.includes(selectedMonth) &&
      !f.peakMonths.includes(selectedMonth)
  );
  const upcomingFish = fishSpecies.filter(
    (f) =>
      f.seasonMonths.includes(nextMonth) &&
      !f.seasonMonths.includes(selectedMonth)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      {/* Page header */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-sky-100 sm:size-10">
            <Fish className="size-5 text-sky-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
              {selectedMonth}月に釣れる魚
            </h1>
            <p className="text-sm text-muted-foreground">
              {getSeasonLabel(selectedMonth)}の釣りターゲット
            </p>
          </div>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setSelectedMonth(prevMonth)}
          >
            <ChevronLeft className="size-4" />
            {prevMonth}月
          </Button>
          <Badge className="px-3 py-1 text-sm">{selectedMonth}月</Badge>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setSelectedMonth(nextMonth)}
          >
            {nextMonth}月
            <ChevronRight className="size-4" />
          </Button>
          {selectedMonth !== initialMonth && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 text-xs text-muted-foreground"
              onClick={() => setSelectedMonth(initialMonth)}
            >
              今月に戻る
            </Button>
          )}
        </div>
      </div>

      {/* Peak fish */}
      {peakFish.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="fire">
              🔥
            </span>
            <h2 className="text-lg font-bold">今が旬！</h2>
            <span className="text-sm text-muted-foreground">
              {peakFish.length}種
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {peakFish.map((fish) => (
              <FishCard key={fish.id} fish={fish} showPeakBadge />
            ))}
          </div>
        </section>
      )}

      {/* Still catchable */}
      {seasonFish.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="calendar">
              📅
            </span>
            <h2 className="text-lg font-bold">まだまだ釣れる</h2>
            <span className="text-sm text-muted-foreground">
              {seasonFish.length}種
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {seasonFish.map((fish) => (
              <FishCard key={fish.id} fish={fish} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming fish */}
      {upcomingFish.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="blossom">
              🌸
            </span>
            <h2 className="text-lg font-bold">来月から釣れ始める</h2>
            <span className="text-sm text-muted-foreground">
              {upcomingFish.length}種
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {upcomingFish.map((fish) => (
              <FishCard key={fish.id} fish={fish} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {peakFish.length === 0 &&
        seasonFish.length === 0 &&
        upcomingFish.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            該当する魚が見つかりませんでした。
          </p>
        )}

      {/* Seasonal TIPS */}
      <section className="mt-4">
        <Card className="gap-0 border-0 bg-gradient-to-br from-amber-50 to-orange-50 py-0 shadow-sm">
          <CardContent className="flex gap-4 p-5 sm:p-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <Lightbulb className="size-5 text-amber-600" />
            </div>
            <div>
              <h3 className="mb-1 font-semibold">
                {getSeasonLabel(selectedMonth)}の釣りTIPS
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tip}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Link to fish encyclopedia */}
      <div className="mt-8 text-center">
        <Link href="/fish">
          <Button variant="outline" className="gap-1">
            魚種図鑑を見る
            <ChevronRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
