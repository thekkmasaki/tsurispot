import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Fish,
  ChevronLeft,
  Calendar,
  Star,
  Flame,
  Anchor,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies, getFishBySlug } from "@/lib/data/fish";
import { SpotCard } from "@/components/spots/spot-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { DIFFICULTY_LABELS, SPOT_TYPE_LABELS } from "@/types";

type PageProps = {
  params: Promise<{ slug: string; fishSlug: string }>;
};

/** この都道府県でこの魚が釣れるスポットを取得 */
function getSpotsForPrefectureAndFish(prefName: string, fishSlug: string) {
  return fishingSpots.filter(
    (s) =>
      s.region.prefecture === prefName &&
      s.catchableFish.some((cf) => cf.fish.slug === fishSlug)
  );
}

/** 全都道府県×魚種の組み合わせを生成（5スポット以上） */
function getPrefFishCombinations() {
  const combos: { prefSlug: string; fishSlug: string; count: number }[] = [];
  const countMap = new Map<string, number>();

  for (const spot of fishingSpots) {
    const pref = prefectures.find((p) => p.name === spot.region.prefecture);
    if (!pref) continue;
    for (const cf of spot.catchableFish) {
      const key = `${pref.slug}|${cf.fish.slug}`;
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }
  }

  for (const [key, count] of countMap) {
    if (count >= 3) {
      const [prefSlug, fishSlug] = key.split("|");
      combos.push({ prefSlug, fishSlug, count });
    }
  }

  return combos;
}

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, fishSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const fish = getFishBySlug(fishSlug);
  if (!pref || !fish) return { title: "ページが見つかりません" };

  const spots = getSpotsForPrefectureAndFish(pref.name, fishSlug);
  const seasonText =
    fish.peakMonths.length > 0
      ? `ベストシーズンは${fish.peakMonths.map((m) => MONTH_NAMES[m - 1]).join("・")}。`
      : "";
  const methodText =
    fish.fishingMethods && fish.fishingMethods.length > 0
      ? `おすすめの釣り方は${fish.fishingMethods
          .slice(0, 3)
          .map((m) => m.methodName)
          .join("・")}。`
      : "";

  const title = `${pref.name}の${fish.name}釣りスポット${spots.length}選｜時期・釣り方・おすすめポイント【2026年】`;
  const description = `${pref.name}で${fish.name}が釣れる釣りスポットを${spots.length}箇所厳選して紹介。${seasonText}${methodText}アクセス・駐車場情報から初心者向けの釣り方まで完全ガイド。`;

  return {
    title,
    description,
    openGraph: {
      title: `${pref.name}の${fish.name}釣りスポット${spots.length}選【2026年最新】`,
      description: `${pref.name}で${fish.name}が釣れるおすすめ釣り場を紹介。${seasonText}`,
      type: "website",
      url: `https://tsurispot.com/prefecture/${pref.slug}/fish/${fish.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/prefecture/${pref.slug}/fish/${fish.slug}`,
    },
  };
}

export function generateStaticParams() {
  const combos = getPrefFishCombinations();
  return combos.map((c) => ({ slug: c.prefSlug, fishSlug: c.fishSlug }));
}

export default async function PrefectureFishPage({ params }: PageProps) {
  const { slug, fishSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const fish = getFishBySlug(fishSlug);
  if (!pref || !fish) notFound();

  const spots = getSpotsForPrefectureAndFish(pref.name, fishSlug);
  if (spots.length === 0) notFound();

  const currentMonth = new Date().getMonth() + 1;
  const isInSeason = fish.seasonMonths.includes(currentMonth);
  const isPeak = fish.peakMonths.includes(currentMonth);

  // スポットのcatchableFishから、この魚の詳細情報を取得
  const spotsWithFishInfo = spots.map((spot) => {
    const cf = spot.catchableFish.find((c) => c.fish.slug === fishSlug)!;
    return { spot, catchInfo: cf };
  });

  // 評価順でソート
  const sortedSpots = [...spotsWithFishInfo].sort(
    (a, b) => b.spot.rating - a.spot.rating
  );

  // 釣り方の集計
  const methodCounts = new Map<string, number>();
  for (const { catchInfo } of spotsWithFishInfo) {
    if (catchInfo.method) {
      methodCounts.set(
        catchInfo.method,
        (methodCounts.get(catchInfo.method) || 0) + 1
      );
    }
  }
  const topMethods = Array.from(methodCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // スポットタイプの集計
  const typeCounts = new Map<string, number>();
  for (const { spot } of spotsWithFishInfo) {
    const label = SPOT_TYPE_LABELS[spot.spotType];
    typeCounts.set(label, (typeCounts.get(label) || 0) + 1);
  }
  const topTypes = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1]);

  // 難易度の集計
  const difficultyCounts = new Map<string, number>();
  for (const { catchInfo } of spotsWithFishInfo) {
    const label =
      catchInfo.catchDifficulty === "easy"
        ? "簡単"
        : catchInfo.catchDifficulty === "medium"
          ? "普通"
          : "難しい";
    difficultyCounts.set(label, (difficultyCounts.get(label) || 0) + 1);
  }

  // 初心者向けスポット
  const beginnerSpots = spotsWithFishInfo.filter(
    (s) =>
      s.spot.difficulty === "beginner" ||
      s.catchInfo.catchDifficulty === "easy"
  );

  // 同じ都道府県で釣れる他の魚（上位10件）
  const otherFishMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const spot of fishingSpots) {
    if (spot.region.prefecture !== pref.name) continue;
    for (const cf of spot.catchableFish) {
      if (cf.fish.slug === fishSlug) continue;
      const existing = otherFishMap.get(cf.fish.slug);
      if (existing) {
        existing.count++;
      } else {
        otherFishMap.set(cf.fish.slug, {
          name: cf.fish.name,
          slug: cf.fish.slug,
          count: 1,
        });
      }
    }
  }
  const otherFish = Array.from(otherFishMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // 他の都道府県でこの魚が釣れる（上位10件）
  const otherPrefMap = new Map<string, { name: string; slug: string; count: number }>();
  for (const spot of fishingSpots) {
    if (spot.region.prefecture === pref.name) continue;
    if (!spot.catchableFish.some((cf) => cf.fish.slug === fishSlug)) continue;
    const spotPref = prefectures.find((p) => p.name === spot.region.prefecture);
    if (!spotPref) continue;
    const existing = otherPrefMap.get(spotPref.slug);
    if (existing) {
      existing.count++;
    } else {
      otherPrefMap.set(spotPref.slug, {
        name: spotPref.name,
        slug: spotPref.slug,
        count: 1,
      });
    }
  }
  const otherPrefs = Array.from(otherPrefMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 季節カレンダー
  const seasonCalendar = MONTH_NAMES.map((name, i) => {
    const month = i + 1;
    const inSeason = fish.seasonMonths.includes(month);
    const peak = fish.peakMonths.includes(month);
    return { name, month, inSeason, peak };
  });

  // FAQ
  const faqItems = [
    {
      question: `${pref.name}で${fish.name}はいつ釣れますか？`,
      answer: fish.seasonMonths.length > 0
        ? `${pref.name}で${fish.name}が釣れるシーズンは${fish.seasonMonths.map((m) => MONTH_NAMES[m - 1]).join("・")}です。${fish.peakMonths.length > 0 ? `特に${fish.peakMonths.map((m) => MONTH_NAMES[m - 1]).join("・")}がベストシーズンです。` : ""}`
        : `${pref.name}での${fish.name}の釣期は各スポットで異なります。詳しくは各スポットページをご確認ください。`,
    },
    {
      question: `${pref.name}で${fish.name}が釣れるスポットは何箇所ありますか？`,
      answer: `${pref.name}には${fish.name}が釣れるスポットが${spots.length}箇所あります。${topTypes.length > 0 ? `釣り場のタイプは${topTypes.map((t) => `${t[0]}（${t[1]}件）`).join("、")}です。` : ""}`,
    },
    {
      question: `${pref.name}で${fish.name}を釣るおすすめの方法は？`,
      answer: topMethods.length > 0
        ? `${pref.name}で${fish.name}を釣る際のおすすめ釣法は${topMethods.map((m) => m[0]).join("、")}です。${beginnerSpots.length > 0 ? `初心者の方には${beginnerSpots.slice(0, 2).map((s) => s.spot.name).join("・")}がおすすめです。` : ""}`
        : `${fish.name}の釣り方は各スポットページで詳しく紹介しています。`,
    },
    {
      question: `${pref.name}で初心者でも${fish.name}は釣れますか？`,
      answer: beginnerSpots.length > 0
        ? `はい、${pref.name}には初心者でも${fish.name}が釣りやすいスポットが${beginnerSpots.length}箇所あります。${beginnerSpots.slice(0, 3).map((s) => s.spot.name).join("・")}は特にアクセスが良く、設備も整っているのでおすすめです。`
        : `${fish.name}は${DIFFICULTY_LABELS[fish.difficulty]}の魚です。初心者の方はまず基本的な釣り方をガイドページで確認してからチャレンジしましょう。`,
    },
  ];

  // 構造化データ
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
        name: "都道府県から探す",
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
        name: `${fish.name}釣りスポット`,
        item: `https://tsurispot.com/prefecture/${pref.slug}/fish/${fish.slug}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${pref.name}の${fish.name}釣りスポット${spots.length}選`,
    description: `${pref.name}で${fish.name}が釣れるおすすめ釣りスポットを紹介。`,
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
      "@id": `https://tsurispot.com/prefecture/${pref.slug}/fish/${fish.slug}`,
    },
    datePublished: "2026-03-05",
    dateModified: new Date().toISOString().split("T")[0],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${pref.name}の${fish.name}釣りスポット`,
    numberOfItems: spots.length,
    itemListElement: sortedSpots.slice(0, 30).map(({ spot }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
  };

  const jsonLdArray = [breadcrumbJsonLd, faqJsonLd, articleJsonLd, itemListJsonLd];

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
          { label: "都道府県", href: "/prefecture" },
          { label: pref.name, href: `/prefecture/${pref.slug}` },
          { label: `${fish.name}釣りスポット` },
        ]}
      />

      {/* Back link */}
      <Link
        href={`/prefecture/${pref.slug}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {pref.name}の釣りスポット一覧に戻る
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の{fish.name}が釣れるスポット一覧
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {spots.length}件の釣りスポットで{fish.name}が狙えます
          {isPeak && `｜今月は最盛期`}
          {isInSeason && !isPeak && `｜今月はシーズン中`}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pref.name}で{fish.name}（{fish.nameKana}）が釣れるスポットを{spots.length}箇所掲載しています。
          {fish.seasonMonths.length > 0 &&
            `シーズンは${fish.seasonMonths.map((m) => MONTH_NAMES[m - 1]).join("・")}。`}
          {fish.peakMonths.length > 0 &&
            `特に${fish.peakMonths.map((m) => MONTH_NAMES[m - 1]).join("・")}がベストシーズンです。`}
          {topMethods.length > 0 &&
            `主な釣り方は${topMethods.slice(0, 3).map((m) => m[0]).join("・")}です。`}
        </p>
      </div>

      {/* 今月のステータス */}
      {isInSeason && (
        <div
          className={`mb-6 rounded-lg border p-4 ${
            isPeak
              ? "border-orange-200 bg-orange-50"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {isPeak ? (
              <Flame className="size-5 text-orange-500" />
            ) : (
              <Calendar className="size-5 text-blue-500" />
            )}
            <span className="font-bold">
              {isPeak
                ? `${MONTH_NAMES[currentMonth - 1]}は${fish.name}の最盛期！`
                : `${MONTH_NAMES[currentMonth - 1]}は${fish.name}のシーズン中`}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPeak
              ? `今が${pref.name}で${fish.name}を釣る最高のタイミングです。`
              : `${pref.name}で${fish.name}を狙えるシーズンです。`}
          </p>
        </div>
      )}

      {/* 魚の基本情報 */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <Fish className="size-5 text-primary" />
          {fish.name}の基本情報
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">難易度</p>
                <p className="mt-1 font-medium">{DIFFICULTY_LABELS[fish.difficulty]}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">サイズ</p>
                <p className="mt-1 font-medium">{fish.sizeCm}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">カテゴリ</p>
                <p className="mt-1 font-medium">
                  {fish.category === "sea"
                    ? "海水魚"
                    : fish.category === "freshwater"
                      ? "淡水魚"
                      : "汽水魚"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">味の評価</p>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < fish.tasteRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* シーズンカレンダー */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                シーズンカレンダー
              </p>
              <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
                {seasonCalendar.map((m) => (
                  <div
                    key={m.month}
                    className={`rounded px-1.5 py-1 text-center text-xs ${
                      m.peak
                        ? "bg-orange-500 font-bold text-white"
                        : m.inSeason
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {m.name}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="inline-block size-3 rounded bg-orange-500" /> 最盛期
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block size-3 rounded bg-blue-100" /> シーズン
                </span>
              </div>
            </div>

            {/* 釣り方 */}
            {fish.fishingMethods && fish.fishingMethods.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  おすすめの釣り方
                </p>
                <div className="flex flex-wrap gap-2">
                  {fish.fishingMethods.map((m) => (
                    <Badge key={m.methodName} variant="secondary">
                      <Anchor className="mr-1 size-3" />
                      {m.methodName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Link
                href={`/fish/${fish.slug}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {fish.name}の詳細情報を見る
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 統計情報 */}
      <section className="mb-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{spots.length}</p>
              <p className="text-xs text-muted-foreground">釣りスポット</p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {beginnerSpots.length}
              </p>
              <p className="text-xs text-muted-foreground">初心者OK</p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {topMethods.length > 0 ? topMethods[0][0] : "-"}
              </p>
              <p className="text-xs text-muted-foreground">人気の釣り方</p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {topTypes.length > 0 ? topTypes[0][0] : "-"}
              </p>
              <p className="text-xs text-muted-foreground">多い釣り場タイプ</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* スポット一覧 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 text-base font-bold sm:text-lg">
          {pref.name}で{fish.name}が釣れるスポット（全{spots.length}件）
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSpots.map(({ spot, catchInfo }) => (
            <div key={spot.id} className="relative">
              <SpotCard spot={spot} />
              {/* 釣り方と難易度のオーバーレイ */}
              <div className="mt-1 flex flex-wrap gap-1">
                {catchInfo.method && (
                  <Badge variant="outline" className="text-xs">
                    <Anchor className="mr-0.5 size-3" />
                    {catchInfo.method}
                  </Badge>
                )}
                {catchInfo.recommendedTime && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="mr-0.5 size-3" />
                    {catchInfo.recommendedTime}
                  </Badge>
                )}
                {catchInfo.peakSeason && (
                  <Badge className="bg-orange-500 text-xs hover:bg-orange-500">
                    <Flame className="mr-0.5 size-3" />
                    旬
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* この県で釣れる他の魚 */}
      {otherFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5" />
            {pref.name}で釣れる他の魚種
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {otherFish.map((f) => (
              <Link key={f.slug} href={`/prefecture/${pref.slug}/fish/${f.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {f.name}
                  <span className="ml-1 text-muted-foreground">({f.count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 他の都道府県でこの魚が釣れる */}
      {otherPrefs.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5" />
            他の都道府県の{fish.name}釣りスポット
          </h2>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {otherPrefs.map((p) => (
              <Link key={p.slug} href={`/prefecture/${p.slug}/fish/${fishSlug}`}>
                <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3">
                    <h3 className="text-sm font-semibold group-hover:text-primary">
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {p.count}スポット
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 text-base font-bold sm:text-lg">
          {pref.name}の{fish.name}釣りに関するよくある質問
        </h2>
        <div className="space-y-3">
          {faqItems.map((faq, i) => (
            <Card key={i} className="gap-0 py-0">
              <CardContent className="p-4 sm:p-5">
                <h3 className="mb-2 text-sm font-bold sm:text-base">
                  Q. {faq.question}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
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
            {pref.name}の釣りスポット
          </Link>
          <Link
            href={`/fish/${fish.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {fish.name}の釣り情報
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
          <Link
            href="/for-beginners"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            初心者ガイド
          </Link>
        </div>
      </section>
    </div>
  );
}
