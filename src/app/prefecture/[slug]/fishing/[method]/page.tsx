import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Fish,
  Calendar,
  HelpCircle,
  ChevronLeft,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { toListSpot } from "@/lib/data/list-spot";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";
import {
  FISHING_METHODS,
  getMethodBySlug,
  MONTHS,
  isMonthInRange,
} from "@/lib/data/fishing-methods";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { InArticleAd } from "@/components/ads/ad-unit";

type PageProps = {
  params: Promise<{ slug: string; method: string }>;
};

// 都道府県×釣り方の有効組み合わせを事前計算（3スポット以上）
function getValidCombos() {
  const combos: { slug: string; method: string }[] = [];
  for (const pref of prefectures) {
    for (const fm of FISHING_METHODS) {
      const count = fishingSpots.filter(
        (s) =>
          s.region.prefecture === pref.name &&
          s.catchableFish.some((cf) => fm.methods.includes(cf.method))
      ).length;
      if (count >= 3) {
        combos.push({ slug: pref.slug, method: fm.slug });
      }
    }
  }
  return combos;
}

const validCombos = getValidCombos();
const validComboSet = new Set(validCombos.map((c) => `${c.slug}|${c.method}`));

export const dynamicParams = false;

export function generateStaticParams() {
  return validCombos;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, method: methodSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const method = getMethodBySlug(methodSlug);
  if (!pref || !method) return { title: "ページが見つかりません" };

  const title = `${pref.name}の${method.name}おすすめスポット・釣れる魚【2026年】`;
  const description = `${pref.name}で${method.name}ができるおすすめ釣りスポットを紹介。${method.name}で狙える魚種・ベストシーズン・攻略法を完全ガイド。${pref.name}で${method.name}を楽しむならツリスポ。`;

  const pageUrl = `https://tsurispot.com/prefecture/${slug}/fishing/${methodSlug}`;
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
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(title)}&emoji=%F0%9F%8E%A3`,
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

export default async function PrefectureFishingMethodPage({
  params,
}: PageProps) {
  const { slug, method: methodSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const method = getMethodBySlug(methodSlug);
  if (
    !pref ||
    !method ||
    !validComboSet.has(`${slug}|${methodSlug}`)
  )
    notFound();

  // この都道府県 × この釣り方のスポットを取得
  const matchingSpots = fishingSpots
    .filter(
      (s) =>
        s.region.prefecture === pref.name &&
        s.catchableFish.some((cf) => method.methods.includes(cf.method))
    )
    .map((spot) => {
      const matchingFish = spot.catchableFish.filter((cf) =>
        method.methods.includes(cf.method)
      );
      return {
        spot,
        matchingFishCount: matchingFish.length,
        matchingFishNames: matchingFish.map((cf) => cf.fish.name),
      };
    })
    .sort((a, b) => {
      if (b.matchingFishCount !== a.matchingFishCount)
        return b.matchingFishCount - a.matchingFishCount;
      return b.spot.rating - a.spot.rating;
    });

  const topSpots = matchingSpots.slice(0, 15);

  // この釣り方で釣れる魚の集計（都道府県内）
  const fishCountMap = new Map<
    string,
    { slug: string; name: string; count: number }
  >();
  for (const { spot } of matchingSpots) {
    for (const cf of spot.catchableFish) {
      if (!method.methods.includes(cf.method)) continue;
      const existing = fishCountMap.get(cf.fish.slug);
      if (existing) {
        existing.count++;
      } else {
        fishCountMap.set(cf.fish.slug, {
          slug: cf.fish.slug,
          name: cf.fish.name,
          count: 1,
        });
      }
    }
  }
  const catchableFishList = Array.from(fishCountMap.values()).sort(
    (a, b) => b.count - a.count
  );

  // 月別の釣れるスポット数を集計（ベストシーズン判定用）
  const monthlyCount: { month: (typeof MONTHS)[number]; count: number }[] =
    MONTHS.map((m) => {
      let count = 0;
      for (const { spot } of matchingSpots) {
        for (const cf of spot.catchableFish) {
          if (
            method.methods.includes(cf.method) &&
            isMonthInRange(m.num, cf.monthStart, cf.monthEnd)
          ) {
            count++;
            break;
          }
        }
      }
      return { month: m, count };
    });

  const bestMonths = [...monthlyCount]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 難易度分布
  const difficultyMap = new Map<string, number>();
  for (const { spot } of matchingSpots) {
    const d = spot.difficulty || "intermediate";
    difficultyMap.set(d, (difficultyMap.get(d) || 0) + 1);
  }

  // 他の釣り方リンク（この都道府県で有効なもの）
  const otherMethods = FISHING_METHODS.filter(
    (fm) =>
      fm.slug !== method.slug &&
      validComboSet.has(`${pref.slug}|${fm.slug}`)
  );

  const pageUrl = `https://tsurispot.com/prefecture/${pref.slug}/fishing/${method.slug}`;
  const headline = `${pref.name}の${method.name} - おすすめスポット・釣れる魚ガイド`;
  const pageDescription = `${pref.name}で${method.name}ができるスポット${matchingSpots.length}件と、狙える魚${catchableFishList.length}種を紹介。`;

  // FAQ
  const faqItems = [
    {
      question: `${pref.name}で${method.name}ができるスポットはどこですか？`,
      answer:
        topSpots.length > 0
          ? `${pref.name}では${topSpots
              .slice(0, 3)
              .map(({ spot }) => spot.name)
              .join("・")}など${matchingSpots.length}件のスポットで${method.name}が楽しめます。${
              topSpots[0].matchingFishCount > 0
                ? `${topSpots[0].spot.name}では${topSpots[0].matchingFishNames.slice(0, 3).join("・")}などが狙えます。`
                : ""
            }`
          : `${pref.name}の${method.name}スポット情報は現在準備中です。`,
    },
    {
      question: `${pref.name}の${method.name}で何が釣れますか？`,
      answer:
        catchableFishList.length > 0
          ? `${pref.name}の${method.name}では${catchableFishList
              .slice(0, 6)
              .map((f) => f.name)
              .join("・")}など${catchableFishList.length}種の魚が狙えます。`
          : `${pref.name}の${method.name}で釣れる魚の情報は現在準備中です。`,
    },
    {
      question: `${pref.name}で${method.name}のベストシーズンはいつですか？`,
      answer:
        bestMonths.length > 0
          ? `${pref.name}の${method.name}は${bestMonths
              .map(({ month }) => month.name)
              .join("・")}が特におすすめです。この時期は対象魚が多く、好釣果が期待できます。`
          : `${pref.name}の${method.name}のシーズン情報は現在準備中です。`,
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
        name: `${method.name}`,
        item: pageUrl,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: pageDescription,
    datePublished: "2026-04-24",
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
          { label: method.name },
        ]}
      />

      {/* 戻るリンク */}
      <Link
        href={`/prefecture/${pref.slug}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {pref.name}の釣り場一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の{method.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          おすすめスポット{matchingSpots.length}件・狙える魚
          {catchableFishList.length}種
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pref.name}で{method.name}ができるおすすめスポットを紹介します。
          {method.description}
        </p>
      </div>

      {/* サマリーカード */}
      <section className="mb-6 sm:mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <MapPin className="size-4 text-primary" />
                対応スポット
              </h2>
              <p className="text-lg font-bold text-primary">
                {matchingSpots.length}件
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pref.name}内の{method.name}スポット
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Fish className="size-4 text-primary" />
                狙える魚
              </h2>
              <p className="text-lg font-bold text-primary">
                {catchableFishList.length}種
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {method.name}で釣れる魚種
              </p>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Calendar className="size-4 text-primary" />
                ベストシーズン
              </h2>
              <p className="text-lg font-bold text-primary">
                {bestMonths.map(({ month }) => month.name).join("・")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                対象魚が多い時期
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
            {pref.name}の{method.name}で釣れる魚（{catchableFishList.length}種）
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {catchableFishList.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}`}>
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

      {/* 月別シーズンカレンダー */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <Calendar className="size-5 text-primary" />
          {pref.name}の{method.name}シーズンカレンダー
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {monthlyCount.map(({ month, count }) => {
            const intensity =
              count === 0
                ? "bg-muted text-muted-foreground"
                : count >= bestMonths[0].count * 0.8
                  ? "bg-primary text-primary-foreground"
                  : count >= bestMonths[0].count * 0.5
                    ? "bg-primary/60 text-white"
                    : "bg-primary/20";
            return (
              <Link
                key={month.slug}
                href={`/prefecture/${pref.slug}/${month.slug}`}
                className={`rounded-lg px-3 py-2 text-center text-sm transition-opacity hover:opacity-80 ${intensity}`}
              >
                {month.name}
                <span className="ml-1 text-xs">({count}件)</span>
              </Link>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ※ 数字はこの釣り方で対象魚が釣れるスポット数
        </p>
      </section>

      {/* おすすめスポットTOP */}
      {topSpots.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5 text-primary" />
            {pref.name}の{method.name}おすすめスポット（TOP
            {topSpots.length}）
          </h2>

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
                    対象魚
                  </th>
                  <th className="hidden px-3 py-2 text-left font-medium md:table-cell">
                    評価
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSpots.map(({ spot, matchingFishCount, matchingFishNames }) => (
                  <tr key={spot.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Link
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
                      <span className="font-medium">
                        {matchingFishCount}種
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {matchingFishNames.slice(0, 3).join("・")}
                      </p>
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topSpots.slice(0, 6).map(({ spot }) => (
              <SpotCard key={spot.id} spot={toListSpot(spot)} />
            ))}
          </div>

          {matchingSpots.length > 15 && (
            <div className="mt-4 text-center">
              <Link
                href={`/prefecture/${pref.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {pref.name}の全{matchingSpots.length}
                スポットを見る
              </Link>
            </div>
          )}
        </section>
      )}

      <InArticleAd />

      {/* よくある質問 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          {pref.name}の{method.name}に関するよくある質問
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

      {/* 他の釣り方リンク */}
      {otherMethods.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.name}の他の釣り方
          </h2>
          <div className="flex flex-wrap gap-2">
            {otherMethods.map((fm) => (
              <Link
                key={fm.slug}
                href={`/prefecture/${pref.slug}/fishing/${fm.slug}`}
                className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                {fm.icon} {fm.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 月別ページリンク */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-base font-bold sm:text-lg">
          {pref.name}の月別釣り情報
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {MONTHS.map((m) => (
            <Link
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

      {/* 関連リンク */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          関連リンク
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/prefecture/${pref.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の釣り場
          </Link>
          <Link
            href={`/fishing/${method.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {method.name}ガイド
          </Link>
          <Link
            href={method.guide}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {method.name}の始め方
          </Link>
          <Link
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link
            href="/fishing"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            釣り方から探す
          </Link>
        </div>
      </section>
    </div>
  );
}
