import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Fish, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { monthlyGuides } from "@/lib/data/monthly-guides";
import { fishSpecies } from "@/lib/data/fish";

export const metadata: Metadata = {
  title: "月別釣りガイド｜1月〜12月の釣れる魚・おすすめスポット｜ツリスポ",
  description:
    "1月〜12月、月ごとに釣れる魚・おすすめ釣り場・釣りTipsをまとめたガイド。水温・気候・ベストな釣り方も解説。今月の釣り計画に今すぐ役立ててください。",
  openGraph: {
    title: "月別釣りガイド｜1月〜12月の釣れる魚・おすすめスポット｜ツリスポ",
    description:
      "月ごとに釣れる魚・おすすめ釣り場・釣りTipsをまとめたガイド。今月の釣り計画に役立てよう。",
    type: "website",
    url: "https://tsurispot.com/monthly",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/monthly",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "月別釣りガイド",
  description: "1月から12月まで、月ごとの釣り情報をまとめたガイド",
  url: "https://tsurispot.com/monthly",
  numberOfItems: 12,
  itemListElement: monthlyGuides.map((guide, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: guide.title,
    url: `https://tsurispot.com/monthly/${guide.slug}`,
  })),
};

export default function MonthlyPage() {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <div className="mb-3 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Calendar className="size-7" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            月別釣りガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            1月〜12月、月ごとの釣り情報・魚種・おすすめスポットをまとめました
          </p>
        </div>

        {/* 今月のハイライト */}
        {(() => {
          const todayGuide = monthlyGuides.find(
            (g) => g.month === currentMonth
          );
          if (!todayGuide) return null;
          const topFish = todayGuide.topFish
            .slice(0, 3)
            .map((slug) => fishSpecies.find((f) => f.slug === slug))
            .filter(Boolean);

          return (
            <div className="mb-8 overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <span className="text-lg">{todayGuide.emoji}</span>
                今月（{todayGuide.nameJa}）の釣り
                <Badge variant="default" className="ml-auto">
                  今月
                </Badge>
              </div>
              <h2 className="mt-1 text-xl font-bold">
                {todayGuide.title.split("｜")[1]}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {todayGuide.description}
              </p>
              {topFish.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {topFish.map(
                    (f) =>
                      f && (
                        <Badge key={f.slug} variant="secondary">
                          <Fish className="mr-1 size-3" />
                          {f.name}
                        </Badge>
                      )
                  )}
                </div>
              )}
              <div className="mt-4">
                <Link
                  href={`/monthly/${todayGuide.slug}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  {todayGuide.nameJa}の釣りガイドを見る
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          );
        })()}

        {/* 12ヶ月グリッド */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {monthlyGuides.map((guide) => {
            const isCurrentMonth = guide.month === currentMonth;
            const topFish = guide.topFish
              .slice(0, 4)
              .map((slug) => fishSpecies.find((f) => f.slug === slug))
              .filter(Boolean);

            return (
              <Link
                key={guide.slug}
                href={`/monthly/${guide.slug}`}
                className={`group block overflow-hidden rounded-xl border transition-all hover:shadow-lg ${
                  isCurrentMonth
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {/* カードヘッダー */}
                <div
                  className={`flex items-center gap-3 p-4 ${
                    isCurrentMonth
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40"
                  }`}
                >
                  <span className="text-2xl">{guide.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-lg font-bold ${
                          isCurrentMonth ? "text-primary-foreground" : ""
                        }`}
                      >
                        {guide.nameJa}
                      </h2>
                      {isCurrentMonth && (
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-[10px]"
                        >
                          今月
                        </Badge>
                      )}
                    </div>
                    <p
                      className={`text-xs ${
                        isCurrentMonth
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      水温 {guide.conditions.waterTemp}
                    </p>
                  </div>
                </div>

                {/* カードコンテンツ */}
                <div className="bg-white p-4 dark:bg-card">
                  <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                    {guide.title.split("｜")[1]}
                  </p>

                  {/* 魚種アイコン */}
                  {topFish.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {topFish.map(
                        (f) =>
                          f && (
                            <span
                              key={f.slug}
                              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                            >
                              <Fish className="size-3" />
                              {f.name}
                            </span>
                          )
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-center text-xs text-primary">
                    <span className="group-hover:underline">
                      詳しいガイドを見る
                    </span>
                    <ChevronRight className="ml-1 size-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* 季節の釣りへのリンク */}
        <div className="mt-10 rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-base font-bold">関連ガイド</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/seasonal"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">季節別釣りガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                春夏秋冬でまとめた釣り情報
              </p>
            </Link>
            <Link
              href="/catchable-now"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">今釣れる魚</p>
              <p className="mt-1 text-xs text-muted-foreground">
                今の時期に釣れる魚をチェック
              </p>
            </Link>
            <Link
              href="/fishing-calendar"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">釣りカレンダー</p>
              <p className="mt-1 text-xs text-muted-foreground">
                魚種別の釣りシーズン早見表
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
