import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Fish, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { fishSpecies, getPeakFish, getCatchableNow } from "@/lib/data/fish";

export const metadata: Metadata = {
  title: "月別釣りカレンダー - 何月に何が釣れる？ | ツリスポ",
  description:
    "月ごとに釣れる魚を一覧で紹介。1月から12月まで各月のおすすめターゲット魚種、旬の釣りものがひと目でわかる釣りカレンダー。釣行計画にお役立てください。",
  openGraph: {
    title: "月別釣りカレンダー - 何月に何が釣れる？",
    description:
      "月ごとに釣れる魚を一覧で紹介。1月~12月の釣りカレンダーで旬の魚がひと目でわかる。",
    type: "website",
    url: "https://tsurispot.com/fishing-calendar",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing-calendar",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "月別釣りカレンダー",
      item: "https://tsurispot.com/fishing-calendar",
    },
  ],
};

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

const SEASON_INFO: Record<string, { label: string; color: string; bgColor: string; description: string }> = {
  winter: {
    label: "冬",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    description: "根魚のシーズン。カサゴ・メバルを穴釣りやメバリングで狙おう。",
  },
  spring: {
    label: "春",
    color: "text-pink-700 dark:text-pink-300",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    description: "水温が上がり始め、魚の活性が高まる季節。乗っ込みのクロダイやアオリイカが狙い目。",
  },
  summer: {
    label: "夏",
    color: "text-orange-700 dark:text-orange-300",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    description: "魚種が最も豊富な季節。アジ・サバ・キスなど初心者でも楽しめるターゲットが多い。",
  },
  autumn: {
    label: "秋",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    description: "食欲の秋は魚も同じ。型の良い魚が釣れやすく、エギングやショアジギングが盛り上がる。",
  },
};

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function getMonthData(month: number) {
  const peakFish = getPeakFish(month);
  const catchable = getCatchableNow(month);

  // Sort: peak fish first, then by difficulty (beginner first)
  const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
  const top5Peak = peakFish
    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
    .slice(0, 5);

  // Also get non-peak catchable fish (up to 5)
  const peakSlugs = new Set(top5Peak.map((f) => f.slug));
  const otherCatchable = catchable
    .filter((f) => !peakSlugs.has(f.slug))
    .sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty])
    .slice(0, 5);

  return { peakFish: top5Peak, otherCatchable };
}

export default function FishingCalendarPage() {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "月別釣りカレンダー" }]} />
        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100">
              <Calendar className="size-5 text-sky-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
              月別釣りカレンダー
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            何月に何が釣れる？ 月ごとのおすすめターゲットがひと目でわかります。
          </p>
        </div>

        {/* 月ナビゲーション */}
        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          {MONTH_NAMES.map((name, index) => {
            const month = index + 1;
            const isCurrentMonth = month === currentMonth;
            return (
              <a
                key={month}
                href={`#month-${month}`}
                className={`inline-flex min-w-[3rem] items-center justify-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-primary/5 ${
                  isCurrentMonth
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {name}
              </a>
            );
          })}
        </nav>

        {/* 年間シーズン概要テーブル */}
        <div className="mb-10 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="whitespace-nowrap px-3 py-2 text-left font-medium">魚種</th>
                {MONTH_NAMES.map((name) => (
                  <th key={name} className="whitespace-nowrap px-1.5 py-2 text-center font-medium">
                    {name.replace("月", "")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {fishSpecies
                .filter((f) => !f.isPoisonous && f.category !== "freshwater")
                .slice(0, 15)
                .map((fish) => (
                  <tr key={fish.slug} className="hover:bg-muted/30">
                    <td className="whitespace-nowrap px-3 py-1.5">
                      <Link
                        href={`/fish/${fish.slug}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {fish.name}
                      </Link>
                    </td>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const isPeak = fish.peakMonths.includes(month);
                      const isSeason = fish.seasonMonths.includes(month);
                      return (
                        <td key={month} className="px-1.5 py-1.5 text-center">
                          {isPeak ? (
                            <span className="inline-block size-3 rounded-full bg-primary" title="旬" />
                          ) : isSeason ? (
                            <span className="inline-block size-3 rounded-full bg-primary/30" title="シーズン" />
                          ) : (
                            <span className="inline-block size-3 rounded-full bg-muted" title="-" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex items-center gap-4 border-t bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full bg-primary" />
              旬（ベストシーズン）
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full bg-primary/30" />
              シーズン
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-full bg-muted border" />
              オフシーズン
            </div>
          </div>
        </div>

        {/* 月別詳細 */}
        <div className="space-y-8">
          {MONTH_NAMES.map((name, index) => {
            const month = index + 1;
            const season = getSeason(month);
            const seasonInfo = SEASON_INFO[season];
            const { peakFish, otherCatchable } = getMonthData(month);
            const isCurrentMonth = month === currentMonth;

            return (
              <section key={month} id={`month-${month}`} className="scroll-mt-20">
                <Card className={`overflow-hidden gap-0 py-0 ${isCurrentMonth ? "ring-2 ring-primary" : ""}`}>
                  <div className={`flex items-center justify-between px-4 py-3 sm:px-6 ${seasonInfo.bgColor}`}>
                    <div className="flex items-center gap-3">
                      <h2 className={`text-lg font-bold sm:text-xl ${seasonInfo.color}`}>
                        {name}の釣りもの
                      </h2>
                      <Badge className={`text-xs ${seasonInfo.bgColor} ${seasonInfo.color} border-current/20`}>
                        {seasonInfo.label}
                      </Badge>
                      {isCurrentMonth && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          今月
                        </Badge>
                      )}
                    </div>
                    <Link
                      href={`/catchable-now?month=${month}`}
                      className="text-sm font-medium text-primary hover:underline hidden sm:inline-flex items-center gap-1"
                    >
                      詳しく見る
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>

                  <CardContent className="p-4 sm:p-6">
                    <p className="mb-4 text-sm text-muted-foreground">
                      {seasonInfo.description}
                    </p>

                    {/* 旬の魚 */}
                    {peakFish.length > 0 && (
                      <div className="mb-4">
                        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                          <Fish className="size-4 text-primary" />
                          旬のターゲット
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {peakFish.map((fish) => (
                            <Link
                              key={fish.slug}
                              href={`/fish/${fish.slug}`}
                              className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary dark:bg-card"
                            >
                              {fish.name}
                              <span className="text-xs text-primary">&#9733;</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* その他釣れる魚 */}
                    {otherCatchable.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
                          その他シーズンの魚
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {otherCatchable.map((fish) => (
                            <Link
                              key={fish.slug}
                              href={`/fish/${fish.slug}`}
                              className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                              {fish.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 sm:hidden">
                      <Link
                        href={`/catchable-now?month=${month}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        {name}に釣れる魚を詳しく見る
                        <ChevronRight className="size-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>
            );
          })}
        </div>

        {/* 関連ページ */}
        <div className="mt-12 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">関連ページ</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/catchable-now"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">今釣れる魚</p>
              <p className="mt-1 text-xs text-muted-foreground">
                今月の旬のターゲット一覧
              </p>
            </Link>
            <Link
              href="/fish"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">魚種図鑑</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣れる魚の旬・食べ方を紹介
              </p>
            </Link>
            <Link
              href="/seasonal"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">季節別釣りガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                春夏秋冬のおすすめ釣り
              </p>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center sm:mt-14">
          <p className="mb-4 text-base font-medium sm:text-lg">
            釣りたい魚が決まったらスポットを探そう！
          </p>
          <Button asChild size="lg" className="min-h-[48px] gap-1.5 rounded-full px-8">
            <Link href="/spots">
              スポットを探す
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}
