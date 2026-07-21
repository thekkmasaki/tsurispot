import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Fish,
  Calendar,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Thermometer,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  Star,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { RelatedPseoLinks } from "@/components/seo/related-pseo-links";
import { SEASONAL_REGIONS } from "@/lib/data/seasonal-regions";
import { toListSpot } from "@/lib/data/list-spot";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishSpecies } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import { MONTHS, getMonthBySlug, isMonthInRange } from "@/lib/data/fishing-methods";
import { MATRIX_MIN_SPOTS } from "@/lib/data";
import { SPOT_TYPE_LABELS } from "@/types";
import { InArticleAd } from "@/components/ads/ad-unit";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";
import { ShareButtons } from "@/components/ui/share-buttons";
import {
  REGIONAL_WATER_TEMP,
  REGIONAL_SEASON_OVERVIEW,
  MONTHLY_TIPS,
  MONTHLY_CAUTIONS,
  type RegionGroup,
} from "@/lib/data/prefecture-month-enrichment";
import { buildPrefMonthDescription } from "@/lib/seo/meta-description";

type PageProps = {
  params: Promise<{ slug: string; month: string }>;
};

// 一時的に force-dynamic (build時 SSG で空HTML 焼き付き問題対策)
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * この県・この月の「釣れる魚」「おすすめスポット」を集計。
 * force-dynamic のため generateMetadata と本体の二重集計を react cache() で 1 回にまとめる。
 */
const getMonthAggregates = cache((prefName: string, monthNum: number) => {
  const prefSpots = fishingSpots.filter((s) => s.region.prefecture === prefName);

  const fishCountMap = new Map<
    string,
    {
      slug: string;
      name: string;
      count: number;
      isPeak: boolean;
      uniqueSpotCount: number;
    }
  >();
  for (const spot of prefSpots) {
    // マトリクスの配信判定はユニークスポット数ベース。同一スポットの
    // 複数エントリ（釣法・期間違い）を 1 スポットに正規化して別カウントする
    const seenInSpot = new Set<string>();
    for (const cf of spot.catchableFish) {
      if (isMonthInRange(monthNum, cf.monthStart, cf.monthEnd)) {
        const existing = fishCountMap.get(cf.fish.slug);
        if (existing) {
          existing.count++;
          if (cf.peakSeason) existing.isPeak = true;
        } else {
          fishCountMap.set(cf.fish.slug, {
            slug: cf.fish.slug,
            name: cf.fish.name,
            count: 1,
            isPeak: cf.peakSeason,
            uniqueSpotCount: 0,
          });
        }
        seenInSpot.add(cf.fish.slug);
      }
    }
    for (const fSlug of seenInSpot) {
      const entry = fishCountMap.get(fSlug);
      if (entry) entry.uniqueSpotCount++;
    }
  }
  const catchableFishList = Array.from(fishCountMap.values()).sort((a, b) => {
    if (a.isPeak !== b.isPeak) return a.isPeak ? -1 : 1;
    return b.count - a.count;
  });

  const spotsWithMatchCount = prefSpots
    .map((spot) => ({
      spot,
      matchCount: spot.catchableFish.filter((cf) =>
        isMonthInRange(monthNum, cf.monthStart, cf.monthEnd)
      ).length,
    }))
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return b.spot.rating - a.spot.rating;
    });

  return { catchableFishList, spotsWithMatchCount };
});

export function generateStaticParams() {
  // 現在月のみ全都道府県SSG。他月は初回アクセス時にISR生成。
  const currentMonth = MONTHS[new Date().getMonth()];
  return prefectures.map((pref) => ({ slug: pref.slug, month: currentMonth.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, month: monthSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const month = getMonthBySlug(monthSlug);
  if (!pref || !month) return { title: "ページが見つかりません" };

  const year = new Date().getFullYear();
  const title = `${pref.name}の${month.name}の釣り｜釣れる魚・おすすめスポット【${year}年】`;

  // 実データ（釣れる魚数・上位魚種・スポット数・実績スポット名・水温）を織り込んだ description。
  // 集計は cache() で本体と共有。
  const { catchableFishList, spotsWithMatchCount } = getMonthAggregates(
    pref.name,
    month.num
  );
  const description = buildPrefMonthDescription({
    prefName: pref.name,
    monthName: month.name,
    fishCount: catchableFishList.length,
    topFishNames: catchableFishList.slice(0, 3).map((f) => f.name),
    spotCount: spotsWithMatchCount.length,
    topSpotNames: spotsWithMatchCount.slice(0, 2).map((x) => x.spot.name),
    waterTemp: getWaterTemp(pref.regionGroup, month.num),
    season: month.season,
  });

  const pageUrl = `https://tsurispot.com/prefecture/${slug}/${monthSlug}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      siteName: "ツリスポ",
      images: [
        {
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(title)}&emoji=%F0%9F%93%8D`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

function getWaterTemp(regionGroup: string, monthNum: number): string {
  return REGIONAL_WATER_TEMP[regionGroup as RegionGroup]?.[monthNum] ?? "—";
}

function getSeasonOverview(regionGroup: string, monthNum: number): string {
  return REGIONAL_SEASON_OVERVIEW[regionGroup as RegionGroup]?.[monthNum] ?? "";
}

export default async function PrefectureMonthPage({ params }: PageProps) {
  const { slug, month: monthSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const month = getMonthBySlug(monthSlug);
  if (!pref || !month) notFound();

  // この都道府県のスポットを取得
  const prefSpots = fishingSpots.filter(
    (s) => s.region.prefecture === pref.name
  );

  // 釣れる魚・おすすめスポットの集計は generateMetadata と cache() で共有
  const { catchableFishList, spotsWithMatchCount } = getMonthAggregates(
    pref.name,
    month.num
  );

  const peakFishList = catchableFishList.filter((f) => f.isPeak);

  const topSpots = spotsWithMatchCount.slice(0, 10);

  // 釣り方別の集計
  const methodMap = new Map<string, number>();
  for (const spot of prefSpots) {
    for (const cf of spot.catchableFish) {
      if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
        methodMap.set(cf.method, (methodMap.get(cf.method) || 0) + 1);
      }
    }
  }
  const methodBreakdown = Array.from(methodMap.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // おすすめアフィリエイト商品（釣り方×月×都道府県でマッチング）
  const topMethods = methodBreakdown.map((m) => m.method);
  const recommendedProducts = getRelevantAffiliateProducts(
    topMethods,
    month.num,
    6,
    false,
    pref.name
  );

  // 前月・翌月
  const prevMonth = MONTHS[(month.num - 2 + 12) % 12];
  const nextMonth = MONTHS[month.num % 12];

  // 他の月一覧（現在の月を除く）
  const otherMonths = MONTHS.filter((m) => m.slug !== month.slug);

  const pageUrl = `https://tsurispot.com/prefecture/${pref.slug}/${month.slug}`;
  const headline = `${pref.name}の${month.name}の釣り - 釣れる魚・おすすめスポット`;
  const pageDescription = `${pref.name}で${month.name}に釣れる魚${catchableFishList.length}種とおすすめスポット${topSpots.length}選を紹介。${month.season}シーズンの完全ガイド。`;

  // FAQ
  const faqItems = [
    {
      question: `${pref.name}で${month.name}に釣れる魚は何ですか？`,
      answer:
        catchableFishList.length > 0
          ? `${pref.name}では${month.name}に${catchableFishList
              .slice(0, 8)
              .map((f) => f.name)
              .join("・")}など${catchableFishList.length}種の魚が狙えます。${
              peakFishList.length > 0
                ? `特に${peakFishList
                    .slice(0, 5)
                    .map((f) => f.name)
                    .join("・")}は最盛期で、好釣果が期待できます。`
                : ""
            }`
          : `${pref.name}では${month.name}に釣れる魚のデータは現在準備中です。`,
    },
    {
      question: `${pref.name}で${month.name}におすすめの釣りスポットは？`,
      answer:
        topSpots.length > 0
          ? `${month.name}の${pref.name}では${topSpots
              .slice(0, 3)
              .map(({ spot }) => spot.name)
              .join("・")}などがおすすめです。${
              topSpots.length >= 5
                ? `他にも${topSpots.length}件以上のスポットで釣りが楽しめます。`
                : ""
            }`
          : `${month.name}の${pref.name}のスポット情報は現在準備中です。`,
    },
    {
      question: `${pref.name}の${month.name}の水温と釣り方のコツは？`,
      answer: `${month.name}の${pref.name}（${pref.regionGroup}地方）の水温目安は${getWaterTemp(pref.regionGroup, month.num)}です。${getSeasonOverview(pref.regionGroup, month.num)}${
        methodBreakdown.length > 0
          ? `${pref.name}では${methodBreakdown
              .slice(0, 3)
              .map((m) => m.method)
              .join("・")}が特に人気の釣り方です。`
          : ""
      }`,
    },
    {
      question: `${pref.name}の${month.name}の釣行で気をつけるべきポイントは？`,
      answer: MONTHLY_CAUTIONS[month.num] ?? "",
    },
    {
      question: `${pref.name}の${month.name}に釣果を伸ばすコツは？`,
      answer: MONTHLY_TIPS[month.num] ?? "",
    },
  ];

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
        name: "都道府県一覧",
        item: "https://tsurispot.com/prefecture",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: pref.name,
        item: `https://tsurispot.com/prefecture/${pref.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${month.name}の釣り情報`,
        item: pageUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: pageDescription,
    datePublished: "2025-01-01",
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
      "@id": pageUrl,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const jsonLdArray = [breadcrumbJsonLd, articleJsonLd, faqJsonLd];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArray) }}
      />

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "都道府県一覧", href: "/prefecture" },
          { label: pref.name, href: `/prefecture/${pref.slug}` },
          { label: `${month.name}の釣り情報` },
        ]}
      />

      {/* 戻るリンク */}
      <Link prefetch={false}
        href={`/prefecture/${pref.slug}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {pref.name}の釣り場一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の{month.name}の釣り
          {/* SEO-1: H1 にキーワード補足 (狙える魚数・スポット数を明示) */}
          <span className="ml-2 text-sm font-medium text-muted-foreground sm:text-base">
            — 釣れる魚{catchableFishList.length}種 / 釣り場{topSpots.length}件
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {catchableFishList.length}種の魚が狙える・おすすめスポット
          {topSpots.length}件
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pref.name}で{month.name}（{month.season}）に釣れる魚と
          おすすめ釣りスポットを紹介します。
          {catchableFishList.length > 0 &&
            `${month.name}の${pref.name}では${
              peakFishList.length > 0
                ? `${peakFishList
                    .slice(0, 3)
                    .map((f) => f.name)
                    .join("・")}が旬を迎え、`
                : ""
            }全${catchableFishList.length}種の魚を${spotsWithMatchCount.length}件のスポットで狙えます。`}
          {getSeasonOverview(pref.regionGroup, month.num)}
        </p>
        <div className="mt-4">
          <ShareButtons
            url={`https://tsurispot.com/prefecture/${slug}/${monthSlug}`}
            title={`${pref.name}の${month.name}の釣り情報｜ツリスポ`}
          />
        </div>
      </div>

      {/* 前月/翌月ナビ */}
      <div className="mb-6 flex items-center justify-between">
        <Link prefetch={false}
          href={`/prefecture/${pref.slug}/${prevMonth.slug}`}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
          {prevMonth.name}
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {month.name}（{month.season}）
        </span>
        <Link prefetch={false}
          href={`/prefecture/${pref.slug}/${nextMonth.slug}`}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          {nextMonth.name}
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* 水温・シーズン概要 */}
      <section className="mb-6 sm:mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 水温 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Thermometer className="size-4 text-primary" />
                水温目安
              </h2>
              <p className="text-lg font-bold text-primary">
                {getWaterTemp(pref.regionGroup, month.num)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {month.season}シーズン
              </p>
            </CardContent>
          </Card>

          {/* 釣れる魚数 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Fish className="size-4 text-primary" />
                釣れる魚
              </h2>
              <p className="text-lg font-bold text-primary">
                {catchableFishList.length}種
              </p>
              {peakFishList.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  うち{peakFishList.length}種が最盛期
                </p>
              )}
            </CardContent>
          </Card>

          {/* おすすめスポット数 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <MapPin className="size-4 text-primary" />
                おすすめスポット
              </h2>
              <p className="text-lg font-bold text-primary">
                {spotsWithMatchCount.length}件
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pref.name}内の対象スポット
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 釣れる魚一覧 */}
      {catchableFishList.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5 text-primary" />
            {pref.name}で{month.name}に釣れる魚（{catchableFishList.length}種）
          </h2>

          {/* 旬の魚 */}
          {peakFishList.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-semibold">
                <Badge className="bg-orange-500 text-xs hover:bg-orange-500">
                  旬
                </Badge>
                <span className="ml-2">最盛期の魚</span>
              </h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {peakFishList.map((f) => (
                  <Link prefetch={false} key={f.slug} href={f.count >= 2 ? `/prefecture/${pref.slug}/${month.slug}/${f.slug}` : `/fish/${f.slug}`}>
                    <Badge
                      variant="outline"
                      className="cursor-pointer border-orange-300 bg-orange-50 px-2.5 py-1.5 text-xs transition-colors hover:bg-orange-100 sm:text-sm"
                    >
                      {f.name}
                      <span className="ml-1 text-muted-foreground">
                        ({f.count}件)
                      </span>
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 全魚一覧 */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {catchableFishList
              .filter((f) => !f.isPeak)
              .map((f) => (
                <Link prefetch={false} key={f.slug} href={f.count >= 2 ? `/prefecture/${pref.slug}/${month.slug}/${f.slug}` : `/fish/${f.slug}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                  >
                    {f.name}
                    <span className="ml-1 text-muted-foreground">
                      ({f.count}件)
                    </span>
                  </Badge>
                </Link>
              ))}
          </div>
        </section>
      )}

      <InArticleAd />

      {/* 釣り方別集計 */}
      {methodBreakdown.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            {month.name}に人気の釣り方
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {methodBreakdown.map(({ method, count }) => (
              <Badge key={method} variant="outline" className="text-xs sm:text-sm">
                {method}
                <span className="ml-1 text-muted-foreground">({count})</span>
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* 地域別シーズン概要 + 釣行のコツ + 注意点 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 text-base font-bold sm:text-lg">
          {pref.name}（{pref.regionGroup}地方）の{month.name}の釣りシーズン解説
        </h2>
        <div className="space-y-4">
          {/* 地域別シーズン概要 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-bold sm:text-base">
                {pref.regionGroup}地方の{month.name}の海況
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {getSeasonOverview(pref.regionGroup, month.num)}
              </p>
            </CardContent>
          </Card>

          {/* 月別の釣行のコツ */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-bold sm:text-base">
                {month.name}に釣果を伸ばすコツ（時間帯・タックル）
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {MONTHLY_TIPS[month.num] ?? ""}
              </p>
            </CardContent>
          </Card>

          {/* 月別の注意点 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-bold sm:text-base">
                {month.name}の釣行で気をつけるポイント
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {MONTHLY_CAUTIONS[month.num] ?? ""}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* おすすめ装備 */}
      {recommendedProducts.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <ShoppingBag className="size-5 text-primary" />
            {pref.name}の{month.name}の釣りにおすすめの装備
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {month.name}の{pref.name}で
            {methodBreakdown.slice(0, 3).map((m) => m.method).join("・")}
            などを楽しむのにおすすめのアイテムをピックアップしました。
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedProducts.map((product) => (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="nofollow noopener sponsored"
                className="group relative flex flex-col rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {product.isRecommended && (
                  <span className="absolute -top-2 right-3 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Star className="size-2.5 fill-current" />
                    編集長おすすめ
                  </span>
                )}
                <div className="mb-1">
                  <span className="text-sm font-bold group-hover:text-primary">
                    {product.name}
                  </span>
                </div>
                {product.priceRange && (
                  <div className="flex items-center gap-1">
                    <Tag className="size-3 text-red-500" />
                    <span className="text-sm font-bold text-red-600">{product.priceRange}</span>
                  </div>
                )}
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <span className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#FF9900] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#E88B00]">
                  Amazonで詳細を見る
                  <ExternalLink className="size-3" />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* おすすめスポットTOP10 */}
      {topSpots.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5 text-primary" />
            {pref.name}の{month.name}のおすすめスポット（TOP
            {topSpots.length}）
          </h2>

          {/* テーブル */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">
                    スポット名
                  </th>
                  <th className="hidden px-3 py-2 text-left font-medium sm:table-cell">
                    タイプ
                  </th>
                  <th className="px-3 py-2 text-left font-medium">
                    釣れる魚数
                  </th>
                  <th className="hidden px-3 py-2 text-left font-medium md:table-cell">
                    評価
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSpots.map(({ spot, matchCount }) => (
                  <tr key={spot.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Link prefetch={false}
                        href={`/spots/${spot.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {spot.name}
                      </Link>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {SPOT_TYPE_LABELS[spot.spotType]}
                      </p>
                    </td>
                    <td className="hidden px-3 py-2 sm:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {SPOT_TYPE_LABELS[spot.spotType]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium">{matchCount}種</span>
                    </td>
                    <td className="hidden px-3 py-2 md:table-cell">
                      <span className="text-yellow-600">
                        {"★".repeat(Math.round(spot.rating))}
                      </span>
                      <span className="ml-1 text-muted-foreground">
                        {spot.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SpotCardグリッド */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topSpots.map(({ spot }) => (
              <SpotCard key={spot.id} spot={toListSpot(spot)} />
            ))}
          </div>

          {/* 全スポット表示リンク */}
          {spotsWithMatchCount.length > 10 && (
            <div className="mt-6 text-center">
              <Link prefetch={false}
                href={`/prefecture/${pref.slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MapPin className="size-4" />
                {pref.name}の全{spotsWithMatchCount.length}
                スポットを見る
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </section>
      )}

      <InArticleAd />

      {/* 都道府県×魚リンク（この月に釣れる魚への内部リンク） */}
      {catchableFishList.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.name}×魚種の詳細ページ
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {catchableFishList.slice(0, 20).map((f) => (
              <Link prefetch={false}
                key={f.slug}
                href={`/prefecture/${pref.slug}/fish/${f.slug}`}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {pref.name}×{f.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 月×魚マトリクスへの内部リンク（この県×この月の魚種別詳細ガイド）。
          リンク先はユニークスポット数 >= MATRIX_MIN_SPOTS の配信確定ページのみ
          （エントリ数カウントだと 301 先にリンクする事故が起きるため必ず uniqueSpotCount で判定） */}
      <RelatedPseoLinks
        title={`${month.name}の${pref.name}で釣れる魚（魚種別ガイド）`}
        links={catchableFishList
          .filter((f) => f.uniqueSpotCount >= MATRIX_MIN_SPOTS)
          .slice(0, 20)
          .map((f) => ({
            href: `/prefecture/${pref.slug}/${monthSlug}/${f.slug}`,
            label: `${month.name}の${f.name}`,
            sublabel: `${pref.name}のスポット${f.uniqueSpotCount}件${f.isPeak ? "・今が旬" : ""}`,
          }))}
      />

      {/* 月×地域（全国の同月ガイド）への内部リンク */}
      <RelatedPseoLinks
        title={`${month.name}の全国の釣り（地域別）`}
        links={SEASONAL_REGIONS.map((r) => ({
          href: `/seasonal/${monthSlug}/${r.slug}`,
          label: `${month.name}の${r.name}`,
          sublabel: "釣れる魚・スポット",
        }))}
      />

      {/* よくある質問 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          {pref.name}の{month.name}の釣りに関するよくある質問
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <Card key={idx} className="gap-0 py-0">
              <CardContent className="p-4">
                <h3 className="mb-2 text-sm font-bold sm:text-base">
                  Q. {item.question}
                </h3>
                <p className="text-sm text-muted-foreground">
                  A. {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <InArticleAd />

      {/* 他の月への内部リンク */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-base font-bold sm:text-lg">
          {pref.name}の他の月の釣り情報
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {otherMonths.map((m) => (
            <Link prefetch={false}
              key={m.slug}
              href={`/prefecture/${pref.slug}/${m.slug}`}
              className="rounded-lg border px-3 py-2 text-center text-sm transition-colors hover:bg-muted"
            >
              {m.name}
              <span className="ml-1 text-xs text-muted-foreground">
                ({m.season})
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 次のアクションCTA */}
      <section className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 sm:mb-10">
        <h2 className="mb-4 text-center text-base font-bold sm:text-lg">
          {pref.name}で{month.name}の釣りを楽しもう
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link prefetch={false}
            href={`/prefecture/${pref.slug}`}
            className="flex items-center gap-3 rounded-lg bg-background p-4 shadow-sm transition-all hover:shadow-md"
          >
            <MapPin className="size-8 text-primary" />
            <div>
              <div className="text-sm font-bold">{pref.name}の全釣りスポット</div>
              <div className="text-xs text-muted-foreground">{prefSpots.length}件のスポットを探す</div>
            </div>
          </Link>
          <Link prefetch={false}
            href="/catchable-now"
            className="flex items-center gap-3 rounded-lg bg-background p-4 shadow-sm transition-all hover:shadow-md"
          >
            <Fish className="size-8 text-primary" />
            <div>
              <div className="text-sm font-bold">今釣れる魚をチェック</div>
              <div className="text-xs text-muted-foreground">全国の旬の魚情報</div>
            </div>
          </Link>
          <Link prefetch={false}
            href={`/monthly/${month.slug}`}
            className="flex items-center gap-3 rounded-lg bg-background p-4 shadow-sm transition-all hover:shadow-md"
          >
            <Calendar className="size-8 text-primary" />
            <div>
              <div className="text-sm font-bold">{month.name}の全国釣りガイド</div>
              <div className="text-xs text-muted-foreground">他の地域も見る</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 関連リンク */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          関連リンク
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link prefetch={false}
            href={`/prefecture/${pref.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の釣り場
          </Link>
          <Link prefetch={false}
            href={`/monthly/${month.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {month.name}の釣りガイド
          </Link>
          <Link prefetch={false}
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link prefetch={false}
            href="/fish"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            魚種から探す
          </Link>
          <Link prefetch={false}
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
          <Link prefetch={false}
            href={`/prefecture/${pref.slug}/${nextMonth.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の{nextMonth.name}の釣り
          </Link>
        </div>
      </section>
    </div>
  );
}
