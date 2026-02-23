import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Fish,
  ChevronLeft,
  Navigation,
  Calendar,
  Star,
  CheckCircle2,
  TrendingUp,
  Flame,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { regions } from "@/lib/data/regions";
import { fishingSpots } from "@/lib/data/spots";
import { SpotCard } from "@/components/spots/spot-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getPrefectureInfoBySlug, adjacentPrefectures, getPrefectureFAQs } from "@/lib/data/prefecture-info";
import { getFishSlugByName } from "@/lib/data";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getRegionsForPrefecture(prefectureName: string) {
  return regions.filter((r) => r.prefecture === prefectureName);
}

function getSpotsForPrefecture(prefectureName: string) {
  return fishingSpots.filter((s) => s.region.prefecture === prefectureName);
}

function getSpotsByRegion(prefectureName: string) {
  const prefRegions = getRegionsForPrefecture(prefectureName);
  const regionMap = new Map<
    string,
    { region: (typeof regions)[0]; spots: typeof fishingSpots }
  >();

  for (const r of prefRegions) {
    const regionSpots = fishingSpots.filter((s) => s.region.id === r.id);
    if (regionSpots.length > 0) {
      regionMap.set(r.id, { region: r, spots: regionSpots });
    }
  }

  // Region IDにマッチしないスポットを "その他" にまとめる
  const allPrefSpots = getSpotsForPrefecture(prefectureName);
  const regionedIds = new Set<string>();
  for (const [, { spots }] of regionMap) {
    for (const s of spots) regionedIds.add(s.id);
  }
  const ungroupedSpots = allPrefSpots.filter((s) => !regionedIds.has(s.id));

  return { regionMap, ungroupedSpots };
}

function getCatchableFishForPrefecture(prefectureName: string) {
  const fishMap = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  for (const spot of fishingSpots) {
    if (spot.region.prefecture !== prefectureName) continue;
    for (const cf of spot.catchableFish) {
      const existing = fishMap.get(cf.fish.id);
      if (existing) {
        existing.count++;
      } else {
        fishMap.set(cf.fish.id, {
          name: cf.fish.name,
          slug: cf.fish.slug,
          count: 1,
        });
      }
    }
  }
  return Array.from(fishMap.values()).sort((a, b) => b.count - a.count);
}

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

/**
 * スポットタイプ別の集計
 */
function getSpotTypeBreakdown(prefectureName: string) {
  const spots = getSpotsForPrefecture(prefectureName);
  const typeMap = new Map<string, number>();
  for (const spot of spots) {
    const label = SPOT_TYPE_LABELS[spot.spotType];
    typeMap.set(label, (typeMap.get(label) || 0) + 1);
  }
  return Array.from(typeMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 難易度別の集計
 */
function getDifficultyBreakdown(prefectureName: string) {
  const spots = getSpotsForPrefecture(prefectureName);
  const diffMap = new Map<string, number>();
  for (const spot of spots) {
    const label = DIFFICULTY_LABELS[spot.difficulty];
    diffMap.set(label, (diffMap.get(label) || 0) + 1);
  }
  return Array.from(diffMap.entries())
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 今月旬の魚が多く釣れるスポットTOP5を算出
 */
function getTopSeasionalSpots(prefectureName: string, currentMonth: number) {
  const prefSpots = getSpotsForPrefecture(prefectureName);

  const scored = prefSpots.map((spot) => {
    // このスポットのcatchableFishの中で、今月がseasonMonthsに含まれる魚の数をカウント
    const inSeasonFish = spot.catchableFish.filter((cf) =>
      cf.fish.seasonMonths.includes(currentMonth)
    );
    return {
      spot,
      score: inSeasonFish.length,
      seasonalFishNames: inSeasonFish.map((cf) => cf.fish.name),
    };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.spot.rating - a.spot.rating)
    .slice(0, 5);
}

/**
 * 今月この県で釣れる魚を収集（重複排除）
 */
function getInSeasonFishForPrefecture(
  prefectureName: string,
  currentMonth: number
) {
  const fishMap = new Map<
    string,
    { name: string; slug: string; isPeak: boolean; spotCount: number }
  >();

  for (const spot of fishingSpots) {
    if (spot.region.prefecture !== prefectureName) continue;
    for (const cf of spot.catchableFish) {
      if (!cf.fish.seasonMonths.includes(currentMonth)) continue;
      const existing = fishMap.get(cf.fish.id);
      if (existing) {
        existing.spotCount++;
        if (cf.fish.peakMonths.includes(currentMonth)) {
          existing.isPeak = true;
        }
      } else {
        fishMap.set(cf.fish.id, {
          name: cf.fish.name,
          slug: cf.fish.slug,
          isPeak: cf.fish.peakMonths.includes(currentMonth),
          spotCount: 1,
        });
      }
    }
  }

  return Array.from(fishMap.values()).sort((a, b) => {
    // 旬（ピーク）の魚を先に、次にスポット数順
    if (a.isPeak !== b.isPeak) return a.isPeak ? -1 : 1;
    return b.spotCount - a.spotCount;
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pref = getPrefectureBySlug(slug);
  if (!pref) return { title: "都道府県が見つかりません" };

  const spots = getSpotsForPrefecture(pref.name);
  const fishList = getCatchableFishForPrefecture(pref.name);
  const topFishNames = fishList
    .slice(0, 5)
    .map((f) => f.name)
    .join("・");

  // スポットタイプ別の集計
  const spotTypes = new Set(spots.map((s) => SPOT_TYPE_LABELS[s.spotType]));
  const spotTypeText = Array.from(spotTypes).slice(0, 4).join("・");

  const title = `${pref.name}の釣り場・釣りスポット一覧｜近くのおすすめ釣り場【2026年最新】`;
  const description = `${pref.name}の釣りスポット${spots.length > 0 ? `${spots.length}箇所` : ""}を完全網羅。${pref.name}近くの${spotTypeText || "堤防・漁港・磯"}など初心者にもおすすめの穴場釣り場をエリア別に紹介。${topFishNames}が狙えます。駐車場・トイレ・アクセス情報も掲載。`;

  return {
    title,
    description,
    openGraph: {
      title: `${pref.name}の釣りスポット${spots.length > 0 ? `${spots.length}選` : ""}｜おすすめ釣り場ガイド`,
      description: `${pref.name}で人気の釣りスポットをエリア別に紹介。${topFishNames}が釣れるおすすめの釣り場情報。`,
      type: "website",
      url: `https://tsurispot.com/prefecture/${pref.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/prefecture/${pref.slug}`,
    },
  };
}

export function generateStaticParams() {
  return prefectures.map((pref) => ({ slug: pref.slug }));
}

const seasonLabels = {
  spring: "春（3〜5月）",
  summer: "夏（6〜8月）",
  autumn: "秋（9〜11月）",
  winter: "冬（12〜2月）",
} as const;

const seasonColors = {
  spring: "bg-pink-50 border-pink-200 text-pink-800",
  summer: "bg-sky-50 border-sky-200 text-sky-800",
  autumn: "bg-orange-50 border-orange-200 text-orange-800",
  winter: "bg-blue-50 border-blue-200 text-blue-800",
} as const;

export default async function PrefecturePage({ params }: PageProps) {
  const { slug } = await params;
  const pref = getPrefectureBySlug(slug);
  if (!pref) notFound();

  const spots = getSpotsForPrefecture(pref.name);
  const prefRegions = getRegionsForPrefecture(pref.name);
  const catchableFish = getCatchableFishForPrefecture(pref.name);
  const prefInfo = getPrefectureInfoBySlug(slug);

  const { regionMap, ungroupedSpots } = getSpotsByRegion(pref.name);

  const beginnerSpots = spots.filter((s) => s.difficulty === "beginner");
  const freeSpots = spots.filter((s) => s.isFree);

  const spotCountText = spots.length > 0 ? `${spots.length}選` : "";

  // 今月のデータ算出（SSGビルド時に確定）
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = MONTH_NAMES[currentMonth - 1];
  const topSeasonalSpots = getTopSeasionalSpots(pref.name, currentMonth);
  const inSeasonFish = getInSeasonFishForPrefecture(pref.name, currentMonth);

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
    ],
  };

  // Calculate average geo coordinates for the prefecture
  const spotsWithCoords = spots.filter((s) => s.latitude && s.longitude);
  const prefAvgLat = spotsWithCoords.length > 0
    ? spotsWithCoords.reduce((sum, s) => sum + s.latitude, 0) / spotsWithCoords.length
    : null;
  const prefAvgLng = spotsWithCoords.length > 0
    ? spotsWithCoords.reduce((sum, s) => sum + s.longitude, 0) / spotsWithCoords.length
    : null;

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${pref.name}の釣り場`,
    description: prefInfo?.description || `${pref.name}で人気の釣り場・穴場スポットを紹介。近くのおすすめ釣りスポットが見つかります。`,
    url: `https://tsurispot.com/prefecture/${pref.slug}`,
    address: {
      "@type": "PostalAddress",
      addressRegion: pref.name,
      addressCountry: "JP",
    },
    ...(prefAvgLat && prefAvgLng ? {
      geo: {
        "@type": "GeoCoordinates",
        latitude: prefAvgLat,
        longitude: prefAvgLng,
      },
    } : {}),
    containsPlace: spots.slice(0, 20).map((spot) => ({
      "@type": "TouristAttraction",
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
      ...(spot.latitude && spot.longitude ? {
        geo: {
          "@type": "GeoCoordinates",
          latitude: spot.latitude,
          longitude: spot.longitude,
        },
      } : {}),
    })),
  };

  // ItemList 構造化データ（スポット一覧）
  const itemListJsonLd = spots.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${pref.name}の釣り場${spotCountText}`,
    numberOfItems: spots.length,
    itemListElement: spots.slice(0, 30).map((spot, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
  } : null;

  // 近隣県のリンク取得（地方を超えた実際の隣接関係）
  const adjacentSlugs = adjacentPrefectures[slug] || [];
  const adjacentPrefs = adjacentSlugs
    .map((s) => getPrefectureBySlug(s))
    .filter((p): p is NonNullable<typeof p> => !!p);

  // 同地方の県（隣接県と別に表示）
  const sameRegionPrefs = prefectures.filter(
    (p) => p.regionGroup === pref.regionGroup && p.slug !== pref.slug && !adjacentSlugs.includes(p.slug)
  );

  // スポットタイプ別・難易度別の集計
  const spotTypeBreakdown = getSpotTypeBreakdown(pref.name);
  const difficultyBreakdown = getDifficultyBreakdown(pref.name);

  // FAQ生成
  const faqs = prefInfo
    ? getPrefectureFAQs(slug, pref.name, spots.length, prefInfo.popularFish, prefInfo.bestSeason)
    : [];

  // FAQ構造化データ
  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "都道府県", href: "/prefecture" },
          { label: pref.name },
        ]}
      />

      {/* Back link */}
      <Link
        href="/prefecture"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        都道府県一覧に戻る
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の釣りスポット一覧｜おすすめ釣り場ガイド
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {spots.length > 0
            ? `${spots.length}件の釣りスポットをエリア別に紹介`
            : `${pref.name}の釣りスポット情報`}
          {beginnerSpots.length > 0 &&
            `｜初心者向け${beginnerSpots.length}件`}
          {freeSpots.length > 0 && `｜無料${freeSpots.length}件`}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pref.name}には{spots.length}件の釣りスポットが登録されています。
          {beginnerSpots.length > 0 ? `初心者向けスポットは${beginnerSpots.length}件あります。` : ""}
          {freeSpots.length > 0 ? `無料で釣りができるスポットは${freeSpots.length}件です。` : ""}
          {catchableFish.length > 0 ? `${pref.name}で人気の魚種は${catchableFish.slice(0, 4).map(f => f.name).join("、")}です。` : ""}
          {spotTypeBreakdown.length > 0 ? `釣り場のタイプは${spotTypeBreakdown.slice(0, 3).map(t => t.type).join("・")}が中心です。` : ""}
        </p>
      </div>

      {/* Prefecture overview */}
      {prefInfo && (
        <section className="mb-8 sm:mb-10">
          <Card className="gap-0 py-0 border-primary/20 bg-primary/5">
            <CardContent className="p-4 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
                <MapPin className="size-5 text-primary" />
                {pref.name}の釣りの特徴
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {prefInfo.description}
              </p>
              <div className="space-y-2">
                {prefInfo.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm sm:text-base"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 今月のおすすめスポットTOP5 */}
      {topSeasonalSpots.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <TrendingUp className="size-5 text-orange-500" />
            {currentMonthName}のおすすめスポットTOP5（{pref.name}）
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {currentMonthName}に旬の魚が多く釣れるスポットをランキング形式でご紹介します。
          </p>
          <div className="grid gap-3 sm:gap-4">
            {topSeasonalSpots.map((item, index) => (
              <Link key={item.spot.id} href={`/spots/${item.spot.slug}`}>
                <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Rank badge */}
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white sm:size-10 sm:text-base ${
                          index === 0
                            ? "bg-yellow-500"
                            : index === 1
                              ? "bg-gray-400"
                              : index === 2
                                ? "bg-amber-700"
                                : "bg-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                          {item.spot.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.spot.region.areaName}
                          <span className="mx-1">|</span>
                          {SPOT_TYPE_LABELS[item.spot.spotType]}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.seasonalFishNames.slice(0, 6).map((name) => (
                            <Badge
                              key={name}
                              variant="secondary"
                              className="text-xs"
                            >
                              <Flame className="mr-0.5 size-3 text-orange-500" />
                              {name}
                            </Badge>
                          ))}
                          {item.seasonalFishNames.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.seasonalFishNames.length - 6}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="size-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {item.spot.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          旬の魚{item.score}種
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 今月この県で釣れる魚 */}
      {inSeasonFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5 text-blue-500" />
            {currentMonthName}に{pref.name}で釣れる魚
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {currentMonthName}がシーズンの魚種を一覧で表示しています。
            {inSeasonFish.filter((f) => f.isPeak).length > 0 &&
              `特に${inSeasonFish
                .filter((f) => f.isPeak)
                .slice(0, 3)
                .map((f) => f.name)
                .join("・")}は最盛期です。`}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {inSeasonFish.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}`}>
                <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Fish className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                          {f.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {f.spotCount}スポット
                        </p>
                      </div>
                    </div>
                    {f.isPeak && (
                      <Badge className="mt-1.5 bg-orange-500 text-xs hover:bg-orange-500">
                        <Flame className="mr-0.5 size-3" />
                        最盛期
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Seasonal fish guide */}
      {prefInfo?.seasonalFish && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Calendar className="size-5" />
            {pref.name}の季節ごとのおすすめ魚種
          </h2>
          {prefInfo.bestSeason && (
            <p className="mb-4 text-sm text-muted-foreground">
              {prefInfo.bestSeason}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              Object.entries(prefInfo.seasonalFish) as [
                keyof typeof seasonLabels,
                string[],
              ][]
            ).map(([season, fishes]) => (
              <Card
                key={season}
                className={`gap-0 py-0 border ${seasonColors[season]}`}
              >
                <CardContent className="p-3 sm:p-4">
                  <h3 className="mb-2 text-sm font-bold">
                    {seasonLabels[season]}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {fishes.map((f) => {
                      const fishSlug = getFishSlugByName(f);
                      return fishSlug ? (
                        <Link key={f} href={`/fish/${fishSlug}`} title={`${f}の釣り情報を見る`}>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                          >
                            {f}
                          </Badge>
                        </Link>
                      ) : (
                        <Badge
                          key={f}
                          variant="secondary"
                          className="text-xs"
                        >
                          {f}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Catchable fish in this prefecture */}
      {catchableFish.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5" />
            {pref.name}で釣れる魚種一覧
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {catchableFish.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {f.name}
                  <span className="ml-1 text-muted-foreground">
                    ({f.count})
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Area links within this prefecture */}
      {prefRegions.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Navigation className="size-5" />
            {pref.name}のエリア一覧
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prefRegions.map((r) => {
              const count = fishingSpots.filter(
                (s) => s.region.id === r.id
              ).length;
              return (
                <Link key={r.id} href={`/area/${r.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        <MapPin className="mr-1 inline size-4" />
                        {r.areaName}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count}件のスポット
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Spots grouped by area */}
      {regionMap.size > 0 ? (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            エリア別 釣りスポット一覧（全{spots.length}件）
          </h2>

          {Array.from(regionMap.values()).map(({ region: r, spots: areaSpots }) => (
            <div key={r.id} className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-primary pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4 text-primary" />
                {r.areaName}エリア（{areaSpots.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areaSpots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          ))}

          {/* Region外のスポット */}
          {ungroupedSpots.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-muted-foreground pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4" />
                その他のエリア（{ungroupedSpots.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ungroupedSpots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : spots.length > 0 ? (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            釣りスポット一覧（{spots.length}件）
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-8 sm:mb-10">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {pref.name}の釣りスポット情報は現在準備中です。
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              近日中に追加予定ですので、しばらくお待ちください。
            </p>
            <Link
              href="/spots"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              全国の釣りスポットを見る
            </Link>
          </div>
        </section>
      )}

      {/* Popular fish details (for SEO rich content) */}
      {prefInfo && prefInfo.popularFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Star className="size-5" />
            {pref.name}の代表的な釣りターゲット
          </h2>
          <div className="flex flex-wrap gap-2">
            {prefInfo.popularFish.map((fishName) => {
              const fishSlug = getFishSlugByName(fishName);
              return fishSlug ? (
                <Link key={fishName} href={`/fish/${fishSlug}`} title={`${fishName}の釣り情報・釣り方を見る`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {fishName}
                  </Badge>
                </Link>
              ) : (
                <Badge
                  key={fishName}
                  variant="outline"
                  className="px-3 py-1.5 text-sm"
                >
                  {fishName}
                </Badge>
              );
            })}
          </div>
        </section>
      )}

      {/* スポットタイプ別・難易度別の概要 */}
      {spots.length > 0 && (spotTypeBreakdown.length > 0 || difficultyBreakdown.length > 0) && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            {pref.name}の釣り場タイプ別ガイド
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {spotTypeBreakdown.length > 0 && (
              <Card className="gap-0 py-0">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="mb-3 text-sm font-bold sm:text-base">釣り場のタイプ</h3>
                  <div className="space-y-2">
                    {spotTypeBreakdown.map(({ type, count }) => {
                      const percentage = Math.round((count / spots.length) * 100);
                      return (
                        <div key={type}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>{type}</span>
                            <span className="text-muted-foreground">{count}件（{percentage}%）</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
            {difficultyBreakdown.length > 0 && (
              <Card className="gap-0 py-0">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="mb-3 text-sm font-bold sm:text-base">難易度レベル</h3>
                  <div className="space-y-2">
                    {difficultyBreakdown.map(({ level, count }) => {
                      const percentage = Math.round((count / spots.length) * 100);
                      return (
                        <div key={level}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>{level}</span>
                            <span className="text-muted-foreground">{count}件（{percentage}%）</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            {pref.name}の釣りに関するよくある質問
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
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
      )}

      {/* Adjacent prefectures (地理的に隣接する県) */}
      {adjacentPrefs.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.name}から近い都道府県の釣り場
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {pref.name}に隣接する都道府県の釣りスポットも探せます。遠征や旅行の際の参考にどうぞ。
          </p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {adjacentPrefs.map((p) => {
              const count = fishingSpots.filter(
                (s) => s.region.prefecture === p.name
              ).length;
              const adjInfo = getPrefectureInfoBySlug(p.slug);
              return (
                <Link key={p.slug} href={`/prefecture/${p.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count}件のスポット
                      </p>
                      {adjInfo && adjInfo.popularFish.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {adjInfo.popularFish.slice(0, 2).map((f) => (
                            <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Same region prefectures (同地方の他の県、隣接県と重複しないもの) */}
      {sameRegionPrefs.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.regionGroup}の他の都道府県
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {sameRegionPrefs.map((p) => {
              const count = fishingSpots.filter(
                (s) => s.region.prefecture === p.name
              ).length;
              return (
                <Link key={p.slug} href={`/prefecture/${p.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count}件のスポット
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* QR Code section for tackle shops */}
      {spots.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <Card className="gap-0 py-0 border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50">
            <CardContent className="p-5 sm:p-8">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
                🏪 釣具店の方へ
              </h2>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
                このQRコードを店頭に設置すると、お客様がスマホで地元の釣り場をすぐに検索できます。
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                {/* QR Code image */}
                <div className="shrink-0">
                  <a
                    href={`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(`https://tsurispot.com/prefecture/${slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="QRコードを新しいタブで開く（右クリックで保存できます）"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(`https://tsurispot.com/prefecture/${slug}`)}`}
                      alt={`${pref.name}の釣りスポット QRコード`}
                      width={200}
                      height={200}
                      className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
                    />
                  </a>
                </div>
                <div className="text-center sm:text-left space-y-3">
                  <div>
                    <p className="text-base font-bold sm:text-lg">
                      {pref.name}の釣りスポット
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {spots.length}件掲載中
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a
                      href={`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(`https://tsurispot.com/prefecture/${slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      QRコードをダウンロード
                    </a>
                    <Link
                      href="/partner"
                      className="inline-flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      詳しくはパートナーページへ
                      <ChevronLeft className="size-3 rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Internal links */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          関連リンク
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/spots"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            全国の釣りスポット
          </Link>
          <Link
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
          <Link
            href="/map"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            地図から探す
          </Link>
          <Link
            href="/fish"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            魚種から探す
          </Link>
          <Link
            href="/ranking"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            釣り場ランキング
          </Link>
        </div>
      </section>
    </div>
  );
}
