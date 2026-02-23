import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  Thermometer,
  Cloud,
  Sun,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Package,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  monthlyGuides,
  getMonthlyGuide,
  monthSlugs,
} from "@/lib/data/monthly-guides";
import { fishSpecies } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";

interface Props {
  params: Promise<{ month: string }>;
}

export async function generateStaticParams() {
  return monthSlugs.map((slug) => ({ month: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const guide = getMonthlyGuide(month);
  if (!guide) return {};

  const title = `${guide.title}｜ツリスポ`;
  const description = guide.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://tsurispot.com/monthly/${month}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/monthly/${month}`,
    },
  };
}

export default async function MonthlyGuidePage({ params }: Props) {
  const { month } = await params;
  const guide = getMonthlyGuide(month);
  if (!guide) notFound();

  // その月に釣れる魚をfish.tsから取得
  const fishForMonth = fishSpecies
    .filter((f) => f.seasonMonths.includes(guide.month))
    .sort((a, b) => {
      // peakMonthsに含まれる魚を優先
      const aIsPeak = a.peakMonths.includes(guide.month) ? 1 : 0;
      const bIsPeak = b.peakMonths.includes(guide.month) ? 1 : 0;
      return bIsPeak - aIsPeak;
    })
    .slice(0, 8);

  // topFishのスラッグで魚を取得（データが指定した魚を優先表示）
  const guidedFish = guide.topFish
    .map((slug) => fishSpecies.find((f) => f.slug === slug))
    .filter(Boolean);

  const displayFish =
    guidedFish.length > 0 ? guidedFish : fishForMonth;

  // その月に釣れるスポット（catchableFishの月範囲でフィルタ）
  const spotsForMonth = fishingSpots
    .filter((spot) =>
      spot.catchableFish.some((cf) => {
        const start = cf.monthStart;
        const end = cf.monthEnd;
        if (start <= end) {
          return guide.month >= start && guide.month <= end;
        } else {
          // 年をまたぐ場合（例: 10〜3月）
          return guide.month >= start || guide.month <= end;
        }
      })
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  // 前月・翌月
  const currentIndex = monthSlugs.indexOf(month);
  const prevSlug =
    currentIndex > 0 ? monthSlugs[currentIndex - 1] : monthSlugs[11];
  const nextSlug =
    currentIndex < 11 ? monthSlugs[currentIndex + 1] : monthSlugs[0];
  const prevGuide = getMonthlyGuide(prevSlug);
  const nextGuide = getMonthlyGuide(nextSlug);

  const currentMonth = new Date().getMonth() + 1;
  const isCurrentMonth = currentMonth === guide.month;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      url: `https://tsurispot.com/monthly/${month}`,
      publisher: {
        "@type": "Organization",
        name: "ツリスポ",
        url: "https://tsurispot.com",
      },
    },
    {
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
          name: "月別釣りガイド",
          item: "https://tsurispot.com/monthly",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${guide.nameJa}に釣れる魚`,
          item: `https://tsurispot.com/monthly/${month}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "月別釣りガイド", href: "/monthly" },
          { label: `${guide.nameJa}の釣り` },
        ]} />

        {/* ヘッダー */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-3xl shadow-lg">
              {guide.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {guide.nameJa}に釣れる魚一覧
                </h1>
                {isCurrentMonth && (
                  <Badge variant="default" className="text-sm">
                    今月
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {guide.title.split("｜")[1]}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {guide.description}
          </p>
        </div>

        {/* 今月の条件カード */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Calendar className="size-5 text-primary" />
            {guide.nameJa}の釣り条件
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Thermometer className="size-4" />
                  水温の目安
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-primary">
                  {guide.conditions.waterTemp}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Cloud className="size-4" />
                  天候・気候
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{guide.conditions.weather}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sun className="size-4" />
                  日照時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{guide.conditions.daylight}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 今月釣れる魚 */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Fish className="size-5 text-primary" />
            {guide.nameJa}のおすすめ魚種
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {displayFish.map((fish) => {
              if (!fish) return null;
              const isPeak = fish.peakMonths.includes(guide.month);
              return (
                <Link
                  key={fish.slug}
                  href={`/fish/${fish.slug}`}
                  className="group flex items-start gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-card"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Fish className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold group-hover:text-primary">
                        {fish.name}
                      </span>
                      {isPeak && (
                        <Badge variant="default" className="text-[10px]">
                          最盛期
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {fish.difficulty === "beginner"
                          ? "初心者向け"
                          : fish.difficulty === "intermediate"
                          ? "中級者向け"
                          : "上級者向け"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {fish.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/catchable-now"
              className="text-sm text-primary hover:underline"
            >
              今釣れる魚をもっと見る →
            </Link>
          </div>
        </section>

        {/* おすすめスポット */}
        {spotsForMonth.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <MapPin className="size-5 text-primary" />
              {guide.nameJa}におすすめの釣りスポット
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {guide.nameJa}に旬の魚が釣れる人気スポットを厳選しました。評価の高いスポット上位{spotsForMonth.length}件を紹介します。
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {spotsForMonth.map((spot) => {
                // この月に釣れる魚名を取得
                const catchableFishNames = spot.catchableFish
                  .filter((cf) => {
                    const start = cf.monthStart;
                    const end = cf.monthEnd;
                    if (start <= end) {
                      return guide.month >= start && guide.month <= end;
                    } else {
                      return guide.month >= start || guide.month <= end;
                    }
                  })
                  .map((cf) => cf.fish.name)
                  .slice(0, 4);

                return (
                  <Link
                    key={spot.slug}
                    href={`/spots/${spot.slug}`}
                    className="group flex items-start gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-card"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold group-hover:text-primary">
                          {spot.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ★{spot.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {spot.region.prefecture} ·{" "}
                        {spot.difficulty === "beginner"
                          ? "初心者向け"
                          : spot.difficulty === "intermediate"
                          ? "中級者向け"
                          : "上級者向け"}
                      </p>
                      {catchableFishNames.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {catchableFishNames.map((name) => (
                            <Badge key={name} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/spots"
                className="text-sm text-primary hover:underline"
              >
                すべての釣りスポットを見る →
              </Link>
            </div>
          </section>
        )}

        {/* 今月の釣りTips */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Lightbulb className="size-5 text-amber-500" />
            {guide.nameJa}の釣りTips
          </h2>
          <Card>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {guide.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-muted-foreground">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* おすすめ装備 */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Package className="size-5 text-primary" />
            {guide.nameJa}のおすすめ装備
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {guide.gear.map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm leading-relaxed">{item}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 冬月の防寒アフィリエイト (11,12,1,2,3月) */}
          {[1, 2, 3, 11, 12].includes(guide.month) && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-blue-900">冬の釣りにおすすめの防寒アイテム</h3>
              <Card className="border-orange-200 bg-orange-50/50 py-0">
                <CardContent className="p-4">
                  <p className="mb-1 text-sm font-bold text-orange-900">電熱ベスト — 釣り中の寒さ対策に最強</p>
                  <p className="mb-3 text-xs text-orange-800 leading-relaxed">
                    USB給電で背中・腹部を温める電熱ベスト。風の強い堤防での釣りでも体の芯からポカポカ。
                    モバイルバッテリーで稼働するのでコンセント不要。防寒着の中に着るだけでOK。
                  </p>
                  <a
                    href="https://amzn.to/4tJlbIR"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]"
                  >
                    Amazonで電熱ベストを見る
                    <ExternalLink className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/50 py-0">
                <CardContent className="p-4">
                  <p className="mb-1 text-sm font-bold text-blue-900">モバイルバッテリー — 信頼できるメーカーを選ぼう</p>
                  <p className="mb-3 text-xs text-blue-800 leading-relaxed">
                    電熱ベストの給電だけでなく、<strong>釣り中にスマホの充電が切れると潮汐アプリや地図、緊急連絡が使えなくなり危険</strong>です。
                    安全のためにも信頼できるメーカーの大容量モバイルバッテリーを必ず持参しましょう。
                  </p>
                  <a
                    href="https://amzn.to/4s3kDvE"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]"
                  >
                    Amazonでモバイルバッテリーを見る
                    <ExternalLink className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* 前月・翌月ナビ */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {prevGuide && (
            <Link
              href={`/monthly/${prevSlug}`}
              className="flex items-center gap-2 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md dark:bg-card"
            >
              <ChevronLeft className="size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">前月</p>
                <p className="font-semibold">
                  {prevGuide.emoji} {prevGuide.nameJa}の釣り
                </p>
              </div>
            </Link>
          )}
          {nextGuide && (
            <Link
              href={`/monthly/${nextSlug}`}
              className="flex items-center justify-end gap-2 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md dark:bg-card"
            >
              <div className="min-w-0 text-right">
                <p className="text-xs text-muted-foreground">翌月</p>
                <p className="font-semibold">
                  {nextGuide.emoji} {nextGuide.nameJa}の釣り
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-primary" />
            </Link>
          )}
        </div>

        {/* 関連リンク */}
        <div className="rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-base font-bold">関連ページ</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
              href="/monthly"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">月別ガイド一覧</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全12ヶ月のガイドを見る
              </p>
            </Link>
            <Link
              href="/fish"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">魚種図鑑</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全魚種の詳細情報を見る
              </p>
            </Link>
            <Link
              href="/seasonal"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">季節別ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                春夏秋冬の釣りを解説
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
