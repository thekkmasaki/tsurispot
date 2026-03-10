"use client";

import { useState } from "react";
import Link from "next/link";
import { Fish, ChevronLeft, ChevronRight, Lightbulb, Calendar } from "lucide-react";
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

const MONTH_SLUGS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
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
              今釣れる魚一覧【{selectedMonth}月】
            </h1>
            <p className="text-sm text-muted-foreground">
              {getSeasonLabel(selectedMonth)}の旬の魚と釣り方ガイド
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
            <h2 className="text-lg font-bold">{selectedMonth}月に最盛期の旬の魚</h2>
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
            <h2 className="text-lg font-bold">{selectedMonth}月にまだ釣れるシーズン中の魚</h2>
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
            <h2 className="text-lg font-bold">{getNextMonth(selectedMonth)}月から釣れ始める注目の魚</h2>
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

      {/* Monthly guide navigation */}
      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Calendar className="size-5 text-primary" />
          月別の釣りガイド・釣れる魚を見る
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {MONTH_NAMES.map((name, i) => {
            const monthNum = i + 1;
            const slug = MONTH_SLUGS[i];
            const isSelected = monthNum === selectedMonth;
            return (
              <Link
                key={slug}
                href={`/monthly/${slug}`}
                className={`rounded-lg border p-2 text-center text-sm font-medium transition-shadow hover:shadow-md ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "bg-white hover:border-primary/30 dark:bg-card"
                }`}
              >
                {name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Related links */}
      <div className="mt-8 rounded-xl border bg-muted/30 p-6">
        <h2 className="mb-4 text-base font-bold">関連ページ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/fish"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
          >
            <p className="font-semibold">魚種図鑑</p>
            <p className="mt-1 text-xs text-muted-foreground">
              全魚種の詳しい情報を見る
            </p>
          </Link>
          <Link
            href="/monthly"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
          >
            <p className="font-semibold">月別釣りガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              全12ヶ月の釣り情報
            </p>
          </Link>
          <Link
            href="/spots"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
          >
            <p className="font-semibold">釣りスポット検索</p>
            <p className="mt-1 text-xs text-muted-foreground">
              全国の人気釣り場を探す
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
