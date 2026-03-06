import type { Metadata } from "next";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishSpecies } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import { MONTHS, getMonthBySlug, isMonthInRange } from "@/lib/data/fishing-methods";
import { SPOT_TYPE_LABELS } from "@/types";

type PageProps = {
  params: Promise<{ slug: string; month: string }>;
};

// 47都道府県 × 12月 = 564ページ
export function generateStaticParams() {
  const combos: { slug: string; month: string }[] = [];
  for (const pref of prefectures) {
    for (const m of MONTHS) {
      combos.push({ slug: pref.slug, month: m.slug });
    }
  }
  return combos;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, month: monthSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const month = getMonthBySlug(monthSlug);
  if (!pref || !month) return { title: "ページが見つかりません" };

  const title = `${pref.name}の${month.name}の釣り情報【2026年】釣れる魚・おすすめスポット`;
  const description = `${pref.name}で${month.name}に釣れる魚とおすすめ釣りスポットを紹介。${month.season}シーズンの釣り方・水温・狙い目の魚種を完全ガイド。${pref.name}で${month.name}に釣りに行くならツリスポ。`;

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
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

// 水温目安（地域別・月別）
const WATER_TEMP: Record<number, string> = {
  1: "8〜12℃",
  2: "7〜10℃",
  3: "10〜14℃",
  4: "13〜17℃",
  5: "16〜20℃",
  6: "19〜23℃",
  7: "22〜27℃",
  8: "25〜29℃",
  9: "23〜27℃",
  10: "19〜23℃",
  11: "15〜19℃",
  12: "11〜15℃",
};

const SEASON_OVERVIEW: Record<number, string> = {
  1: "厳寒期で魚の活性は低め。根魚や底物狙いがメインとなる時期です。防寒対策を万全にして、日中の暖かい時間帯を狙いましょう。",
  2: "年間最低水温期。メバルやカサゴなど冬に強い魚がターゲットです。数は少なくても型の良い魚が狙えます。",
  3: "水温が徐々に上昇し、春の魚が動き出す時期。メバルやチヌの活性が高まり始めます。",
  4: "乗っ込みシーズン開始。チヌやメバルの活性が高まり、回遊魚も徐々に接岸してきます。",
  5: "多くの魚が活発に動き出す好シーズン。回遊魚も接岸し始め、釣りものが豊富になります。",
  6: "梅雨時期で濁りが入りやすいですが、魚の活性は高い時期。アジやイワシの回遊が期待できます。",
  7: "夏本番。回遊魚の回遊が活発化し、数釣りが楽しめます。朝夕のマズメ時が狙い目です。",
  8: "水温ピーク。朝夕のマズメ時を狙うのが効果的。暑さ対策・水分補給を忘れずに。",
  9: "秋の荒食いシーズン開始。多くの魚種が好調で、サイズアップも期待できます。",
  10: "秋の釣りシーズン最盛期。大型の回遊魚も狙え、年間でも屈指の好シーズンです。",
  11: "越冬前の荒食いで釣果が上がりやすい時期。秋のラストスパートを楽しみましょう。",
  12: "水温低下で魚の活性が下がり始めます。根魚シーズンに突入し、カサゴやメバルが狙い目です。",
};

export default async function PrefectureMonthPage({ params }: PageProps) {
  const { slug, month: monthSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const month = getMonthBySlug(monthSlug);
  if (!pref || !month) notFound();

  // この都道府県のスポットを取得
  const prefSpots = fishingSpots.filter(
    (s) => s.region.prefecture === pref.name
  );

  // この月に釣れる魚を集計（catchableFishのmonthStart〜monthEndで判定）
  const fishCountMap = new Map<
    string,
    { slug: string; name: string; count: number; isPeak: boolean }
  >();

  for (const spot of prefSpots) {
    for (const cf of spot.catchableFish) {
      if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
        const existing = fishCountMap.get(cf.fish.slug);
        const isPeak = cf.peakSeason;
        if (existing) {
          existing.count++;
          if (isPeak) existing.isPeak = true;
        } else {
          fishCountMap.set(cf.fish.slug, {
            slug: cf.fish.slug,
            name: cf.fish.name,
            count: 1,
            isPeak,
          });
        }
      }
    }
  }

  const catchableFishList = Array.from(fishCountMap.values()).sort((a, b) => {
    // 旬の魚を先に、その後スポット数順
    if (a.isPeak !== b.isPeak) return a.isPeak ? -1 : 1;
    return b.count - a.count;
  });

  const peakFishList = catchableFishList.filter((f) => f.isPeak);

  // おすすめスポットTOP10（マッチする魚の数でソート）
  const spotsWithMatchCount = prefSpots
    .map((spot) => {
      const matchCount = spot.catchableFish.filter((cf) =>
        isMonthInRange(month.num, cf.monthStart, cf.monthEnd)
      ).length;
      return { spot, matchCount };
    })
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return b.spot.rating - a.spot.rating;
    });

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
      answer: `${month.name}の水温目安は${WATER_TEMP[month.num]}です。${SEASON_OVERVIEW[month.num]}${
        methodBreakdown.length > 0
          ? `${pref.name}では${methodBreakdown
              .slice(0, 3)
              .map((m) => m.method)
              .join("・")}が特に人気の釣り方です。`
          : ""
      }`,
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
          {pref.name}の{month.name}の釣り情報
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {catchableFishList.length}種の魚が狙える・おすすめスポット
          {topSpots.length}件
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pref.name}で{month.name}（{month.season}）に釣れる魚と
          おすすめ釣りスポットを紹介します。
          {SEASON_OVERVIEW[month.num]}
        </p>
      </div>

      {/* 前月/翌月ナビ */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/prefecture/${pref.slug}/${prevMonth.slug}`}
          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
          {prevMonth.name}
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {month.name}（{month.season}）
        </span>
        <Link
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
                {WATER_TEMP[month.num]}
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
                  <Link key={f.slug} href={`/fish/${f.slug}`}>
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
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>

          {/* 全スポット表示リンク */}
          {spotsWithMatchCount.length > 10 && (
            <div className="mt-4 text-center">
              <Link
                href={`/prefecture/${pref.slug}`}
                className="text-sm text-primary hover:underline"
              >
                {pref.name}の全{spotsWithMatchCount.length}
                スポットを見る
              </Link>
            </div>
          )}
        </section>
      )}

      {/* 都道府県×魚リンク（この月に釣れる魚への内部リンク） */}
      {catchableFishList.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.name}×魚種の詳細ページ
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {catchableFishList.slice(0, 20).map((f) => (
              <Link
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

      {/* 他の月への内部リンク */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-base font-bold sm:text-lg">
          {pref.name}の他の月の釣り情報
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {otherMonths.map((m) => (
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
            href={`/monthly/${month.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {month.name}の釣りガイド
          </Link>
          <Link
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link
            href="/fish"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            魚種から探す
          </Link>
          <Link
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
        </div>
      </section>
    </div>
  );
}
