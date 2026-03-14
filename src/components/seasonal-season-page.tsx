import Link from "next/link";
import {
  Fish,
  Calendar,
  ChevronRight,
  Thermometer,
  Cloud,
  Sun,
  BookOpen,
  Compass,
  MapPin,
  Lightbulb,
  Store,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import type { SeasonInfo } from "@/lib/data/seasonal-data";
import { seasons } from "@/lib/data/seasonal-data";
import { monthlyGuides } from "@/lib/data/monthly-guides";
import { fishSpecies } from "@/lib/data/fish";

interface SeasonPageProps {
  season: SeasonInfo;
}

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function SeasonalSeasonPage({ season }: SeasonPageProps) {
  const currentSeason = getCurrentSeason();
  const isCurrent = season.slug === currentSeason;

  // 該当月のガイドデータを取得
  const monthGuides = season.months
    .map((m) => monthlyGuides.find((g) => g.month === m))
    .filter(Boolean);

  // 3ヶ月分のtopFishを集約・重複排除
  const allTopFishSlugs = Array.from(
    new Set(monthGuides.flatMap((g) => g?.topFish ?? []))
  );
  const topFishData = allTopFishSlugs
    .map((slug) => fishSpecies.find((f) => f.slug === slug))
    .filter(Boolean);

  // JSON-LD
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
        name: "季節別釣りガイド",
        item: "https://tsurispot.com/seasonal",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${season.nameJa}の釣りガイド`,
        item: `https://tsurispot.com/seasonal/${season.slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${season.nameJa}の釣りガイド｜${season.nameJa}に釣れる魚・おすすめ釣り方【2026年版】`,
    description: season.description,
    url: `https://tsurispot.com/seasonal/${season.slug}`,
    datePublished: "2026-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    author: {
      "@type": "Person",
      name: "正木 家康",
      jobTitle: "編集長",
      url: "https://tsurispot.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
      logo: {
        "@type": "ImageObject",
        url: "https://tsurispot.com/logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://tsurispot.com/seasonal/${season.slug}`,
    },
  };

  const monthLabels = season.months.map((m) => `${m}月`).join("・");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "季節別釣りガイド", href: "/seasonal" },
            { label: `${season.nameJa}の釣り` },
          ]}
        />

        {/* ヘッダーカード */}
        <div
          className={`mb-8 overflow-hidden rounded-2xl border-2 ${season.colorTheme.border} ${season.colorTheme.bg} p-6 sm:p-8`}
        >
          <div className="text-center">
            <span className="mb-2 inline-block text-4xl sm:text-5xl">
              {season.emoji}
            </span>
            <div className="mb-2 flex items-center justify-center gap-2">
              <h1
                className={`text-2xl font-bold tracking-tight sm:text-4xl ${season.colorTheme.text}`}
              >
                {season.nameJa}の釣りガイド
              </h1>
              {isCurrent && (
                <Badge variant="default">今のシーズン</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {monthLabels}（{season.nameJa}）
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {season.description}
            </p>
          </div>
        </div>

        {/* 月別ガイドカード */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Calendar className="size-5 text-primary" />
            {season.nameJa}の月別ガイド
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {monthGuides.map((guide) => {
              if (!guide) return null;
              const topFish = guide.topFish
                .slice(0, 4)
                .map((slug) => fishSpecies.find((f) => f.slug === slug))
                .filter(Boolean);

              return (
                <Link
                  key={guide.slug}
                  href={`/monthly/${guide.slug}`}
                  className="group block overflow-hidden rounded-xl border transition-all hover:shadow-lg hover:border-primary/30"
                >
                  <div className="flex items-center gap-3 bg-muted/40 p-4">
                    <span className="text-2xl">{guide.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold">{guide.nameJa}</h3>
                      <p className="text-xs text-muted-foreground">
                        水温 {guide.conditions.waterTemp}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white p-4 dark:bg-card">
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Cloud className="size-3" />
                      {guide.conditions.weather}
                    </div>
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
                        {guide.nameJa}のガイドを見る
                      </span>
                      <ChevronRight className="ml-1 size-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 季節のおすすめ魚種 */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Fish className="size-5 text-primary" />
            {season.nameJa}に釣れるおすすめ魚種
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topFishData.map((fish) => {
              if (!fish) return null;
              const diffLabel =
                fish.difficulty === "beginner"
                  ? "初心者向け"
                  : fish.difficulty === "intermediate"
                    ? "中級者向け"
                    : "上級者向け";
              const diffColor =
                fish.difficulty === "beginner"
                  ? "bg-green-100 text-green-700"
                  : fish.difficulty === "intermediate"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700";

              return (
                <Link
                  key={fish.slug}
                  href={`/fish/${fish.slug}`}
                  className="group flex items-center gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-card"
                >
                  <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-primary/10">
                    {fish.imageUrl ? (
                      <img
                        src={fish.imageUrl}
                        alt={fish.name}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-primary">
                        <Fish className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold group-hover:text-primary">
                        {fish.name}
                      </span>
                      <Badge className={`text-[10px] ${diffColor}`}>
                        {diffLabel}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {fish.description.slice(0, 35)}...
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* 季節の釣りポイント解説 */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Lightbulb className="size-5 text-primary" />
            {season.nameJa}の釣りポイント解説
          </h2>
          <div className="rounded-xl border bg-muted/30 p-5 sm:p-6">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {season.fishingHighlights}
            </p>
          </div>

          {/* 各月のコンディション */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {monthGuides.map((guide) => {
              if (!guide) return null;
              return (
                <div
                  key={guide.slug}
                  className="rounded-lg border bg-white p-4 dark:bg-card"
                >
                  <h3 className="mb-2 flex items-center gap-2 font-semibold">
                    <span>{guide.emoji}</span>
                    {guide.nameJa}
                  </h3>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="size-3 shrink-0" />
                      <span>水温: {guide.conditions.waterTemp}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Cloud className="size-3 shrink-0" />
                      <span>{guide.conditions.weather}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sun className="size-3 shrink-0" />
                      <span>{guide.conditions.daylight}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 関連コンテンツ */}
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <BookOpen className="size-5 text-primary" />
            関連コンテンツ
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/monthly"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <Calendar className="mx-auto mb-2 size-6 text-primary" />
              <p className="font-semibold">月別釣りカレンダー</p>
              <p className="mt-1 text-xs text-muted-foreground">
                1月〜12月の釣り情報一覧
              </p>
            </Link>
            <Link
              href="/catchable-now"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <Target className="mx-auto mb-2 size-6 text-primary" />
              <p className="font-semibold">今釣れる魚</p>
              <p className="mt-1 text-xs text-muted-foreground">
                今の時期に釣れる魚をチェック
              </p>
            </Link>
            <Link
              href="/fishing-calendar"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <Compass className="mx-auto mb-2 size-6 text-primary" />
              <p className="font-semibold">釣りカレンダー</p>
              <p className="mt-1 text-xs text-muted-foreground">
                魚種別の釣りシーズン早見表
              </p>
            </Link>
            <Link
              href="/spots"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <MapPin className="mx-auto mb-2 size-6 text-primary" />
              <p className="font-semibold">全国釣りスポット</p>
              <p className="mt-1 text-xs text-muted-foreground">
                2,000+の釣り場を検索
              </p>
            </Link>
            <Link
              href="/guide"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <BookOpen className="mx-auto mb-2 size-6 text-primary" />
              <p className="font-semibold">釣り方ガイド一覧</p>
              <p className="mt-1 text-xs text-muted-foreground">
                初心者から上級者向けまで
              </p>
            </Link>
            <Link
              href="/shops"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <Store className="mx-auto mb-2 size-6 text-primary" />
              <p className="font-semibold">釣具店ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全国の釣具店を探せる
              </p>
            </Link>
          </div>
        </section>

        {/* 他の季節ナビ */}
        <section>
          <h2 className="mb-4 text-lg font-bold sm:text-xl">
            他の季節を見る
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {seasons.map((s) => {
              const isActive = s.slug === season.slug;
              return (
                <Link
                  key={s.slug}
                  href={`/seasonal/${s.slug}`}
                  className={`group flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all ${
                    isActive
                      ? `${s.colorTheme.border} ${s.colorTheme.bg} ring-2 ring-primary/30`
                      : "border-border hover:border-primary/30 hover:shadow-md"
                  }`}
                >
                  <span className="mb-1 text-2xl">{s.emoji}</span>
                  <span
                    className={`font-bold ${isActive ? s.colorTheme.text : "group-hover:text-primary"}`}
                  >
                    {s.nameJa}の釣り
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {s.months.map((m) => `${m}月`).join("・")}
                  </span>
                  {isActive && (
                    <Badge variant="default" className="mt-1.5 text-[10px]">
                      表示中
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
