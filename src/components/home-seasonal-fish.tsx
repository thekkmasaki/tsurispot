"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Skull, TriangleAlert, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FishImage } from "@/components/ui/spot-image";

interface SeasonalFish {
  id: string;
  name: string;
  slug: string;
  category: "sea" | "freshwater" | "brackish";
  difficulty: "beginner" | "intermediate" | "advanced";
  description: string;
  imageUrl: string;
  peakMonths: number[];
  seasonMonths: number[];
  isPoisonous: boolean;
  poisonType?: string;
  dangerLevel?: "low" | "medium" | "high";
}

const FILTERS = [
  { key: "all", label: "すべて" },
  { key: "sea", label: "海水魚" },
  { key: "freshwater", label: "淡水魚" },
  { key: "peak", label: "旬の魚" },
  { key: "beginner", label: "初心者向け" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

const INITIAL_COUNT = 8;

export function HomeSeasonalFish() {
  const [fish, setFish] = useState<SeasonalFish[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/fish/seasonal")
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data: { currentMonth: number; fish: SeasonalFish[] }) => {
        setFish(data.fish);
        setCurrentMonth(data.currentMonth);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "sea":
        return fish.filter((f) => f.category === "sea");
      case "freshwater":
        return fish.filter((f) => f.category === "freshwater" || f.category === "brackish");
      case "peak":
        return fish.filter((f) => f.peakMonths.includes(currentMonth));
      case "beginner":
        return fish.filter((f) => f.difficulty === "beginner");
      default:
        return fish;
    }
  }, [fish, filter, currentMonth]);

  // スケルトンUI
  if (loading) {
    return (
      <section className="bg-muted/50 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-4 sm:mb-6">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
          <div className="mb-4 flex gap-1.5 sm:mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border bg-background">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="space-y-2 p-3 sm:p-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
                    <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-8 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-muted/50 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <h2 className="text-xl font-bold tracking-tight sm:text-3xl">今月釣れる魚</h2>
          <p className="mt-2 text-sm text-muted-foreground">データの読み込みに失敗しました</p>
          <Link href="/fish" className="mt-4 inline-block">
            <Button variant="outline" className="min-h-[44px] gap-1">
              魚種図鑑を見る
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-muted/50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between sm:mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
              {currentMonth}月に釣れる魚
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filtered.length}種類
            </p>
          </div>
          <Link
            href="/fish"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            もっと見る
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:mb-6 sm:flex-wrap sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setExpanded(false); }}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                filter === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:bg-muted border"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Fish cards */}
        <div className="relative">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {(expanded ? filtered : filtered.slice(0, INITIAL_COUNT)).map((f) => {
              const isPeak = f.peakMonths.includes(currentMonth);
              return (
                <Link
                  key={f.id}
                  href={`/fish/${f.slug}`}
                  className="w-52 shrink-0 sm:w-auto"
                >
                  <Card className={`group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md ${f.isPoisonous ? "ring-2 ring-red-200" : ""}`}>
                    <div className="relative">
                      <FishImage
                        src={f.imageUrl}
                        alt={f.name}
                        category={f.category}
                      />
                      {f.isPoisonous && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white shadow">
                          {f.dangerLevel === "high" ? <Skull className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
                          毒
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        {f.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={`text-xs ${f.category === "freshwater" ? "border-emerald-200 text-emerald-700" : f.category === "brackish" ? "border-teal-200 text-teal-700" : "border-sky-200 text-sky-700"}`}>
                          {f.category === "freshwater" ? "淡水" : f.category === "brackish" ? "汽水" : "海水"}
                        </Badge>
                        {isPeak ? (
                          <Badge className="bg-orange-100 text-xs text-orange-700 hover:bg-orange-100">
                            旬!
                          </Badge>
                        ) : (
                          <Badge className="bg-sky-100 text-xs text-sky-700 hover:bg-sky-100">
                            釣れる
                          </Badge>
                        )}
                        {f.isPoisonous && (
                          <Badge className="bg-red-100 text-xs text-red-700 hover:bg-red-100">
                            {f.poisonType || "毒あり"}
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {f.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-muted/50 to-transparent sm:hidden" />
        </div>

        {/* もっと見る / 折りたたむ */}
        {filtered.length > INITIAL_COUNT && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              className="min-h-[44px] gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "折りたたむ" : `残り${filtered.length - INITIAL_COUNT}種類を見る`}
              <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </Button>
          </div>
        )}

        <div className="mt-4 flex justify-center sm:hidden">
          <Link href="/fish">
            <Button variant="outline" className="min-h-[44px] gap-1">
              すべての魚を見る
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
