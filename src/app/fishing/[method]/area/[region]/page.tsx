import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import {
  Fish,
  MapPin,
  ChevronRight,
  Star,
  Navigation,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FISHING_METHODS,
  getMethodBySlug,
  MONTHS,
  generateHowToJsonLd,
  type FishingMethodDef,
} from "@/lib/data/fishing-methods";
import {
  REGION_GROUPS,
  getRegionGroupBySlug,
  type RegionGroup,
} from "@/lib/data/regions-group";
import { fishingSpots } from "@/lib/data/spots";
import { getFishBySlug } from "@/lib/data/fish";
import { getPrefectureByName } from "@/lib/data/prefectures";
import {
  generateContextMethodBrief,
  getRegionGroup,
  REGION_CLIMATE,
  METHOD_CONTEXT,
} from "@/lib/utils/spot-content-generator";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";
import { SeasonalAffiliateSection } from "@/components/seasonal-affiliate-section";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo/article-jsonld";
import { DIFFICULTY_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

interface Props {
  params: Promise<{ method: string; region: string }>;
}

// dynamicParams=false は Next.js 16 で NoFallbackError を多発させるため撤廃。未知 param は下記で親へ 301。

export async function generateStaticParams() {
  const params: { method: string; region: string }[] = [];
  for (const method of FISHING_METHODS) {
    for (const region of REGION_GROUPS) {
      params.push({ method: method.slug, region: region.slug });
    }
  }
  return params;
}

interface SpotSummary {
  slug: string;
  name: string;
  address: string;
  rating: number;
  difficulty: FishingSpot["difficulty"];
  prefecture: string;
  matchingFishCount: number;
  matchingFishNames: string[];
  /** マッチ魚の slug（上位4件、魚×釣法クロスリンク用） */
  matchingFishSlugs: { name: string; slug: string }[];
  /** 元スポット参照（攻略文生成用） */
  spotRef: FishingSpot;
}

function getSpotsForMethodAndRegion(
  method: FishingMethodDef,
  regionGroup: RegionGroup
): { spots: SpotSummary[]; totalCount: number; beginnerCount: number } {
  const prefs = new Set(regionGroup.prefectures);
  const filtered: SpotSummary[] = [];
  for (const spot of fishingSpots) {
    if (!prefs.has(spot.region.prefecture)) continue;
    const matchingFish = spot.catchableFish.filter((cf) =>
      method.methods.includes(cf.method)
    );
    if (matchingFish.length === 0) continue;
    filtered.push({
      slug: spot.slug,
      name: spot.name,
      address: spot.address,
      rating: spot.rating,
      difficulty: spot.difficulty,
      prefecture: spot.region.prefecture,
      matchingFishCount: matchingFish.length,
      matchingFishNames: matchingFish.slice(0, 4).map((cf) => cf.fish.name),
      matchingFishSlugs: matchingFish
        .slice(0, 4)
        .map((cf) => ({ name: cf.fish.name, slug: cf.fish.slug })),
      spotRef: spot,
    });
  }
  filtered.sort((a, b) => {
    if (b.matchingFishCount !== a.matchingFishCount)
      return b.matchingFishCount - a.matchingFishCount;
    return b.rating - a.rating;
  });
  // 初心者向け件数は全件（slice前）で集計し、FAQ統計の正確性を担保する。
  const beginnerCount = filtered.filter((s) => s.difficulty === "beginner").length;
  return { spots: filtered.slice(0, 50), totalCount: filtered.length, beginnerCount };
}

/**
 * 魚 slug がこの釣法の魚×釣法ページとして実在するか
 * （fish/[slug]/method/[method] の generateStaticParams と同条件）
 */
function fishHasMethodPage(fishSlug: string, method: FishingMethodDef): boolean {
  const fish = getFishBySlug(fishSlug);
  if (!fish || !fish.fishingMethods || fish.fishingMethods.length === 0)
    return false;
  return fish.fishingMethods.some((fm) =>
    method.methods.includes(fm.methodName)
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { method: methodSlug, region: regionSlug } = await params;
  const method = getMethodBySlug(methodSlug);
  const region = getRegionGroupBySlug(regionSlug);
  if (!method || !region) return {};

  const title = `${region.name}の${method.name}おすすめスポットと攻略法【2026年版】`;
  const description = `${region.name}地方で${method.name}ができるおすすめ釣りスポットを厳選紹介。初心者向けの穴場から上級者向けポイントまで、釣れる魚・アクセス・攻略法を掲載。${region.name}で${method.name}を楽しむならツリスポ。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://tsurispot.com/fishing/${method.slug}/area/${region.slug}`,
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
      canonical: `https://tsurispot.com/fishing/${method.slug}/area/${region.slug}`,
    },
  };
}

export default async function MethodRegionPage({ params }: Props) {
  const { method: methodSlug, region: regionSlug } = await params;
  const method = getMethodBySlug(methodSlug);
  const region = getRegionGroupBySlug(regionSlug);
  if (!method) permanentRedirect("/fishing");
  if (!region) permanentRedirect(`/fishing/${methodSlug}`);

  const { spots, totalCount, beginnerCount } = getSpotsForMethodAndRegion(method, region);
  const beginnerPct = totalCount > 0 ? Math.round((beginnerCount / totalCount) * 100) : 0;
  const prefCounts = new Map<string, number>();
  for (const spot of spots) {
    prefCounts.set(spot.prefecture, (prefCounts.get(spot.prefecture) ?? 0) + 1);
  }

  const pageUrl = `https://tsurispot.com/fishing/${method.slug}/area/${region.slug}`;
  const title = `${region.name}の${method.name}おすすめスポットと攻略法`;
  const description = `${region.name}地方で${method.name}ができるおすすめ釣りスポットを厳選紹介。初心者向けの穴場から上級者向けポイントまで掲載。`;

  // 上位県（地域固有トークン。重複回避のため攻略文・FAQに織り込む）
  const topPrefs = Array.from(prefCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([p, c]) => ({ pref: p, count: c }));
  const topPrefLabel =
    topPrefs.length > 0
      ? topPrefs
          .slice(0, 3)
          .map((p) => `${p.pref}（${p.count}件）`)
          .join("、")
      : "";
  const topFishNames = [
    ...new Set(spots.flatMap((s) => s.matchingFishNames)),
  ].slice(0, 6);

  // ── 攻略法プローズ（地域×釣法の固有文章を合成） ──
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthDef =
    MONTHS.find((m) => m.num === currentMonth) ?? MONTHS[0];
  const regionGroupKey = getRegionGroup(region.prefectures[0]);
  const climate = REGION_CLIMATE[regionGroupKey];
  const topSpot = spots.length > 0 ? spots[0].spotRef : null;
  // METHOD_CONTEXT のキーは method.name とほぼ一致するが、一部だけ別名（ルアー→ルアー釣り）
  const METHOD_CONTEXT_ALIAS: Record<string, string> = {
    ルアー: "ルアー釣り",
    ショアジギング: "ショアジギング",
  };
  const ctxKey = METHOD_CONTEXT_ALIAS[method.name] ?? method.name;
  const methodCtxMap = METHOD_CONTEXT[ctxKey];
  const ctxByType =
    methodCtxMap && topSpot ? methodCtxMap[topSpot.spotType] : undefined;
  const methodBrief =
    topSpot != null
      ? generateContextMethodBrief(ctxKey, topSpot)
      : "";

  // 攻略法の段落（2-3段落）。地域固有トークン（件数・上位県・魚種）で重複回避。
  const strategyParagraphs: string[] = [];
  if (totalCount > 0) {
    strategyParagraphs.push(
      `${region.name}地方は${climate}です。ツリスポでは${region.prefectures.join("・")}の中から、${method.name}が楽しめるスポットを${totalCount}件掲載しています。${topPrefLabel ? `特に${topPrefLabel}にポイントが集中しており、` : ""}${method.description}`
    );
    if (topSpot) {
      const topSpotType =
        topSpot.spotType === "rocky"
          ? "磯場"
          : topSpot.spotType === "breakwater"
            ? "沖堤防"
            : topSpot.spotType === "port"
              ? "漁港"
              : topSpot.spotType === "pier"
                ? "桟橋"
                : topSpot.spotType === "beach" || topSpot.spotType === "surf"
                  ? "砂浜・サーフ"
                  : "釣り場";
      strategyParagraphs.push(
        `${region.name}で${method.name}を狙うなら、${topSpotType}のような潮通しと地形がポイントになります。代表的なスポットの${spots[0].name}を例にとると、${methodBrief}。${ctxByType ? `${ctxByType}。` : ""}まずは足場とポイントの特徴を押さえてから竿を出すのが釣果への近道です。`
      );
    }
    strategyParagraphs.push(
      `季節の流れとしては、現在の${currentMonthDef.name}（${currentMonthDef.season}）を含め、${topFishNames.length > 0 ? `${topFishNames.join("・")}などが${region.name}の${method.name}の主なターゲットになります。` : "時期ごとに狙える魚が入れ替わります。"}下記の手順を参考に仕掛けとタックルを準備し、各スポットの詳細ページで釣れる魚・難易度・アクセスを確認してから出かけましょう。`
    );
  } else {
    strategyParagraphs.push(
      `${region.name}地方は${climate}です。現在、${method.name}ができるスポットデータは準備中で、随時追加しています。${method.description}`
    );
  }

  // ── HowTo JSON-LD（全9釣法対応。null ならスキップ） ──
  const howToJsonLd = generateHowToJsonLd(method, currentMonthDef, []);

  // ── 釣法連動アフィリエイト（季節ページと同じコンポーネントで表示） ──
  const affiliateProducts = getRelevantAffiliateProducts(
    method.methods,
    currentMonth,
    3
  );

  // ── クロスリンク（Phase 4） ──
  // 代表魚×釣法ページ（実在する combo のみ）
  const fishMethodLinks: { name: string; slug: string }[] = [];
  {
    const seen = new Set<string>();
    for (const s of spots) {
      for (const f of s.matchingFishSlugs) {
        if (seen.has(f.slug)) continue;
        if (fishHasMethodPage(f.slug, method)) {
          seen.add(f.slug);
          fishMethodLinks.push(f);
        }
      }
      if (fishMethodLinks.length >= 4) break;
    }
  }
  // 地域内主要県 × 代表魚 の都道府県×魚ページ
  const prefFishLinks: { prefName: string; prefSlug: string; fishName: string; fishSlug: string }[] = [];
  {
    const topFishForPref =
      spots.length > 0 && spots[0].matchingFishSlugs.length > 0
        ? spots[0].matchingFishSlugs[0]
        : null;
    if (topFishForPref) {
      for (const tp of topPrefs.slice(0, 2)) {
        const prefDef = getPrefectureByName(tp.pref);
        if (prefDef) {
          prefFishLinks.push({
            prefName: tp.pref,
            prefSlug: prefDef.slug,
            fishName: topFishForPref.name,
            fishSlug: topFishForPref.slug,
          });
        }
      }
    }
  }

  // FAQ データ（5-6問に拡充）
  const faqItems: { question: string; answer: string }[] = [
    {
      question: `${region.name}で${method.name}ができるスポットは何件ありますか？`,
      answer: totalCount > 0
        ? `${region.name}地方（${region.prefectures.length}県）で${method.name}ができるスポットは${totalCount}件掲載しています。${beginnerCount > 0 ? `うち初心者向けが${beginnerCount}件（${beginnerPct}%）。` : ""}${topPrefLabel ? `${topPrefLabel}などに分布しています。` : ""}`
        : `現在、${region.name}地方の${method.name}スポットは準備中です。随時追加しています。`,
    },
    {
      question: `${region.name}で${method.name}をするのに初心者でも大丈夫ですか？`,
      answer: totalCount > 0 && beginnerCount > 0
        ? `はい。${region.name}には初心者向けの${method.name}スポットが${beginnerCount}件（全${totalCount}件中${beginnerPct}%）あります。${method.description}各スポットページで難易度を確認できるので、「初心者向け」表記のスポットから始めるのがおすすめです。`
        : `はい、${region.name}には初心者でも楽しめる${method.name}スポットがあります。${method.description}各スポットページで難易度を確認し、足場が安定したポイントから始めましょう。`,
    },
    {
      question: `${region.name}の${method.name}で釣れる魚は何ですか？`,
      answer: totalCount > 0
        ? `${region.name}の${method.name}では、${topFishNames.join("・")}などが釣れます。スポットや時期によって釣れる魚種は異なりますので、各スポットの詳細ページをご確認ください。`
        : `${region.name}の${method.name}スポット情報は現在準備中です。詳しくは各スポットページをご確認ください。`,
    },
    {
      question: `${region.name}で${method.name}のコツは何ですか？`,
      answer:
        (ctxByType
          ? `${ctxByType}。`
          : methodBrief
            ? `${methodBrief}。`
            : `${method.description}`) +
        `${region.name}は${climate}ため、季節と潮の動きに合わせてポイントを選ぶことが釣果アップのポイントです。`,
    },
    {
      question: `${method.name}に必要なタックル・仕掛けは？`,
      answer: howToJsonLd
        ? `${method.name}では${howToJsonLd.tool.map((t) => t.name).slice(0, 3).join("・")}などのタックルと、${howToJsonLd.supply.map((s) => s.name).slice(0, 3).join("・")}といった仕掛け・消耗品を用意します。詳しい手順はページ内の「${region.name}での${method.name}攻略」を参考にしてください。`
        : `${method.name}に必要なタックルは狙う魚やポイントによって異なります。各スポットの詳細ページや釣り方ガイドをご確認ください。`,
    },
    {
      question: `${currentMonthDef.name}でも${region.name}で${method.name}は楽しめますか？`,
      answer: totalCount > 0
        ? `はい。${currentMonthDef.name}（${currentMonthDef.season}）も${region.name}の${method.name}は楽しめます。${topFishNames.length > 0 ? `この時期は${topFishNames.slice(0, 3).join("・")}などが狙えます。` : ""}季節ごとの釣れる魚は各スポットの詳細ページでご確認いただけます。`
        : `${region.name}の${method.name}スポット情報は現在準備中です。`,
    },
  ];

  // JSON-LD（共通ビルダーに統一）
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "ホーム", url: "https://tsurispot.com" },
    { name: "釣り方一覧", url: "https://tsurispot.com/fishing" },
    { name: method.name, url: `https://tsurispot.com/fishing/${method.slug}` },
    { name: `${region.name}の${method.name}` },
  ]);

  const articleJsonLd = buildArticleJsonLd({
    headline: title,
    description,
    url: pageUrl,
    // 釣り方×地域ページの恒久公開日（安定値）。dateModified はビルダー側で当日を動的付与。
    datePublished: "2025-03-01",
    imageUrl: `https://tsurispot.com/api/og?title=${encodeURIComponent(title)}&emoji=%F0%9F%8E%A3`,
  });

  const faqJsonLd = buildFaqJsonLd(faqItems);

  const itemListJsonLd =
    totalCount > 0
      ? buildItemListJsonLd({
          name: `${region.name}の${method.name}スポット`,
          items: spots.slice(0, 20).map((spot) => ({
            name: spot.name,
            url: `https://tsurispot.com/spots/${spot.slug}`,
          })),
          numberOfItems: totalCount,
        })
      : null;

  const jsonLdArray = [
    breadcrumbJsonLd,
    articleJsonLd,
    faqJsonLd,
    ...(howToJsonLd ? [howToJsonLd] : []),
    ...(itemListJsonLd ? [itemListJsonLd] : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdArray),
        }}
      />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣り方一覧", href: "/fishing" },
            { label: method.name, href: `/fishing/${method.slug}` },
            { label: `${region.name}の${method.name}` },
          ]}
        />

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            {region.name}の{method.name}おすすめスポットと攻略法
            <span className="block text-base sm:text-lg font-normal text-gray-600 mt-1">
              初心者向けの穴場から人気ポイントまで{totalCount}件
            </span>
          </h1>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="size-4 text-blue-500" />
                <span className="text-sm font-medium">
                  対象エリア: {region.prefectures.join("・")}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {region.name}地方で{method.name}ができるおすすめスポットを厳選してまとめました。
                {spots.length > 0
                  ? `${totalCount}件のスポットで${method.name}を楽しめます。初心者が入りやすいポイントから上級者向けの実績ポイントまで掲載しています。`
                  : `現在、${method.name}ができるスポットデータは準備中です。`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 攻略法プローズ + 手順（HowTo） */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="size-5 text-blue-600" />
            {region.name}での{method.name}攻略
          </h2>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {strategyParagraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {howToJsonLd && (
                <div className="mt-5 border-t pt-4">
                  <h3 className="font-bold text-sm sm:text-base mb-3">
                    {method.name}の基本の手順
                  </h3>
                  <ol className="space-y-3">
                    {howToJsonLd.step.map((step) => (
                      <li key={step.position} className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold text-xs shrink-0 mt-0.5">
                          {step.position}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{step.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                            {step.text}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {(howToJsonLd.tool.length > 0 ||
                    howToJsonLd.supply.length > 0) && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {howToJsonLd.tool.map((t) => (
                        <Badge
                          key={`tool-${t.name}`}
                          variant="outline"
                          className="text-xs"
                        >
                          {t.name}
                        </Badge>
                      ))}
                      {howToJsonLd.supply.map((s) => (
                        <Badge
                          key={`supply-${s.name}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {s.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* 釣法連動アフィリエイト */}
        {affiliateProducts.length > 0 && (
          <SeasonalAffiliateSection
            products={affiliateProducts}
            seasonLabel={`${region.name}の${method.name}`}
            regionName=""
          />
        )}

        {/* 都道府県別内訳 */}
        {prefCounts.size > 1 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">都道府県別スポット数</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(prefCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([pref, count]) => (
                  <Badge key={pref} variant="secondary" className="text-sm">
                    {pref}: {count}件
                  </Badge>
                ))}
            </div>
          </section>
        )}

        {/* スポット一覧 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="size-5" />
            {region.name}の{method.name}おすすめスポット一覧
          </h2>

          {spots.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>
                  {region.name}で{method.name}ができるスポットは現在準備中です。
                </p>
                <p className="mt-2">
                  <Link
                    href={`/fishing/${method.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    他の地域を確認する
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {spots.map((spot, idx) => (
                <Link key={spot.slug} href={`/spots/${spot.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm sm:text-base">
                              {spot.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">
                                {spot.rating.toFixed(1)}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {DIFFICULTY_LABELS[spot.difficulty]}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            <MapPin className="size-3 inline mr-1" />
                            {spot.address}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {spot.matchingFishNames.map((fishName) => (
                              <Badge
                                key={fishName}
                                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              >
                                <Fish className="size-3 mr-0.5" />
                                {fishName}
                              </Badge>
                            ))}
                            {spot.matchingFishCount > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{spot.matchingFishCount - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-gray-400 shrink-0 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {totalCount > 50 && (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center text-sm text-gray-500">
                    全{totalCount}件中、上位50件を表示しています。
                    すべてのスポットは
                    <Link href="/spots" className="text-blue-600 hover:underline mx-1">
                      スポット一覧
                    </Link>
                    から検索できます。
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>

        {/* 関連リンク（魚×釣法 / 県×魚） */}
        {(fishMethodLinks.length > 0 || prefFishLinks.length > 0) && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">
              {region.name}の{method.name}に関連するページ
            </h2>
            {fishMethodLinks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  狙える魚 × {method.name}の詳しい釣り方
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {fishMethodLinks.map((f) => (
                    <Link
                      key={f.slug}
                      href={`/fish/${f.slug}/method/${method.slug}`}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 flex items-center gap-2">
                          <Fish className="size-4 text-blue-600 shrink-0" />
                          <span className="text-sm font-medium">
                            {f.name}の{method.name}
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {prefFishLinks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  都道府県別で{region.name}の人気ターゲットを探す
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {prefFishLinks.map((p) => (
                    <Link
                      key={`${p.prefSlug}-${p.fishSlug}`}
                      href={`/prefecture/${p.prefSlug}/fish/${p.fishSlug}`}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-3 flex items-center gap-2">
                          <MapPin className="size-4 text-blue-600 shrink-0" />
                          <span className="text-sm font-medium">
                            {p.prefName}の{p.fishName}釣り場
                          </span>
                          <ChevronRight className="size-4 ml-auto text-gray-400" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 他の地域 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {method.name}ができる他の地域のおすすめスポット
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGION_GROUPS.filter((r) => r.slug !== region.slug).map((r) => (
              <Link
                key={r.slug}
                href={`/fishing/${method.slug}/area/${r.slug}`}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 text-center">
                    <span className="text-sm font-medium">{r.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 他の釣り方 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {region.name}で楽しめるその他の釣り方
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FISHING_METHODS.filter((m) => m.slug !== method.slug).map((m) => (
              <Link key={m.slug} href={`/fishing/${m.slug}/area/${region.slug}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-sm font-medium">
                      {region.name}の{m.name}
                    </span>
                    <ChevronRight className="size-4 ml-auto text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* よくある質問 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="size-5" />
            {region.name}の{method.name}に関するよくある質問
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm sm:text-base mb-2">
                    Q. {item.question}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    A. {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
