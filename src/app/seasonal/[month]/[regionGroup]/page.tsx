import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { permanentRedirect } from "next/navigation";
import {
  Fish,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Flame,
  Thermometer,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { MonthlySportsSorter, type MonthlySpot } from "@/components/monthly-spots-sorter";
import { SeasonalAffiliateSection } from "@/components/seasonal-affiliate-section";
import { MONTHS, MONTH_CONDITIONS } from "@/lib/data/fishing-methods";
import { prefectures } from "@/lib/data/prefectures";
import { fishSpecies, getFishSeasons } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import type { RegionSlug } from "@/types";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";
import { InArticleAd } from "@/components/ads/ad-unit";
import { REGION_CLIMATE, getRegionGroup } from "@/lib/utils/spot-content-generator";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
} from "@/lib/seo/article-jsonld";

type PageProps = {
  params: Promise<{ month: string; regionGroup: string }>;
};

// 地域グループのスラッグマッピング
const REGION_GROUP_SLUGS: Record<string, string> = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kinki: "近畿",
  chugoku: "中国",
  shikoku: "四国",
  "kyushu-okinawa": "九州・沖縄",
};

const REGION_GROUP_SLUG_ENTRIES = Object.entries(REGION_GROUP_SLUGS);

function getRegionGroupBySlug(slug: string): string | undefined {
  return REGION_GROUP_SLUGS[slug];
}

function toRegionSlug(pageSlug: string): RegionSlug | undefined {
  const map: Record<string, RegionSlug> = {
    hokkaido: "hokkaido",
    tohoku: "tohoku",
    kanto: "kanto",
    chubu: "chubu",
    kinki: "kinki",
    chugoku: "chugoku",
    shikoku: "shikoku",
    "kyushu-okinawa": "kyushu",
  };
  return map[pageSlug];
}

// 季節のコツテキスト
function getSeasonalTips(season: string, regionName: string): string[] {
  const tips: string[] = [];

  switch (season) {
    case "冬":
      tips.push(
        "防寒対策を万全にしましょう。特に風が強い海沿いでは体感温度が下がります。",
        "日が短いため、早朝の準備は暗い中での作業になります。ヘッドライトの用意を。",
        "冬場は魚の活性が下がるため、エサ釣りでじっくり待つスタイルが有効です。"
      );
      if (regionName === "北海道" || regionName === "東北") {
        tips.push("路面凍結に注意。スタッドレスタイヤは必須です。");
      }
      break;
    case "春":
      tips.push(
        "水温の上昇に伴い、魚の活性が高まる季節です。",
        "花粉シーズンと重なるため、花粉症の方は対策を。",
        "産卵期の魚が多く、大型が狙えるチャンスです。"
      );
      break;
    case "夏":
      tips.push(
        "熱中症対策として、こまめな水分補給と日陰の確保が重要です。",
        "朝マヅメ・夕マヅメが最も釣果が期待できる時間帯です。",
        "夏休み期間はファミリーフィッシングで混雑するスポットが増えます。"
      );
      if (regionName === "九州・沖縄") {
        tips.push("台風シーズンに入ります。天気予報のチェックを怠らないようにしましょう。");
      }
      break;
    case "秋":
      tips.push(
        "多くの魚種が釣れるベストシーズンです。",
        "秋は魚が越冬に向けて餌を活発に追うため、ルアーへの反応も良くなります。",
        "日没が早まるため、帰りの時間に余裕を持ちましょう。"
      );
      break;
  }

  return tips;
}

// 12ヶ月 × 8地域 = 96ページ
// dynamicParams=false は Next.js 16 で NoFallbackError を多発させるため撤廃。未知 param は本体で /seasonal へ 301。

export function generateStaticParams() {
  const params: { month: string; regionGroup: string }[] = [];
  for (const m of MONTHS) {
    for (const rSlug of Object.keys(REGION_GROUP_SLUGS)) {
      params.push({ month: m.slug, regionGroup: rSlug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { month: monthSlug, regionGroup: regionSlug } = await params;
  const monthDef = MONTHS.find((m) => m.slug === monthSlug);
  const regionName = getRegionGroupBySlug(regionSlug);
  if (!monthDef || !regionName) return { title: "ページが見つかりません" };

  // メタデータ用に今月釣れる魚を取得
  const metaRSlug = toRegionSlug(regionSlug);
  const metaRegionPrefs = prefectures.filter((p) => p.regionGroup === regionName);
  const metaRegionPrefNames = new Set(metaRegionPrefs.map((p) => p.name));
  const metaInSeasonFish = new Map<string, string>();
  for (const spot of fishingSpots) {
    if (!metaRegionPrefNames.has(spot.region.prefecture)) continue;
    for (const cf of spot.catchableFish) {
      if (getFishSeasons(cf.fish, metaRSlug).seasonMonths.includes(monthDef.num)) {
        metaInSeasonFish.set(cf.fish.id, cf.fish.name);
      }
    }
  }
  const metaFishNames = Array.from(metaInSeasonFish.values()).slice(0, 5).join("・");
  const metaSpotCount = fishingSpots.filter((s) => metaRegionPrefNames.has(s.region.prefecture)).length;

  const year = new Date().getFullYear();
  const title = `${monthDef.num}月の${regionName}の釣り｜釣れる魚・おすすめスポット【${year}年版】`;
  const description = `${monthDef.name}（${monthDef.season}）に${regionName}地方で釣れる魚と人気の釣り場を完全ガイド。${metaFishNames ? `${metaFishNames}など旬の魚` : "ベストシーズンの魚"}が狙えるおすすめスポット${metaSpotCount > 0 ? `${metaSpotCount}箇所` : ""}を紹介。初心者でも楽しめる穴場ポイントや釣り方・タックル情報も掲載。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/seasonal/${monthSlug}/${regionSlug}`,
      siteName: "ツリスポ",
      images: [
        {
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(title)}&emoji=%F0%9F%93%85`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `https://tsurispot.com/seasonal/${monthSlug}/${regionSlug}`,
    },
  };
}

export default async function SeasonalMonthRegionPage({ params }: PageProps) {
  const { month: monthSlug, regionGroup: regionSlug } = await params;
  const monthDef = MONTHS.find((m) => m.slug === monthSlug);
  const regionName = getRegionGroupBySlug(regionSlug);
  if (!monthDef || !regionName) permanentRedirect("/seasonal");

  const rSlug = toRegionSlug(regionSlug);

  // この地域に含まれる都道府県
  const regionPrefs = prefectures.filter((p) => p.regionGroup === regionName);
  const regionPrefNames = new Set(regionPrefs.map((p) => p.name));

  // この地域のスポット
  const regionSpots = fishingSpots.filter((s) =>
    regionPrefNames.has(s.region.prefecture)
  );

  // この月にこの地域で釣れる魚を集計
  const fishMap = new Map<
    string,
    {
      slug: string;
      name: string;
      isPeak: boolean;
      spotCount: number;
      methods: Set<string>;
    }
  >();

  for (const spot of regionSpots) {
    for (const cf of spot.catchableFish) {
      const seasons = getFishSeasons(cf.fish, rSlug);
      if (!seasons.seasonMonths.includes(monthDef.num)) continue;
      const existing = fishMap.get(cf.fish.slug);
      if (existing) {
        existing.spotCount++;
        if (cf.method) existing.methods.add(cf.method);
        if (seasons.peakMonths.includes(monthDef.num)) existing.isPeak = true;
      } else {
        fishMap.set(cf.fish.slug, {
          slug: cf.fish.slug,
          name: cf.fish.name,
          isPeak: seasons.peakMonths.includes(monthDef.num),
          spotCount: 1,
          methods: new Set(cf.method ? [cf.method] : []),
        });
      }
    }
  }

  // ピーク/シーズン中で分類
  const allFishList = Array.from(fishMap.values());
  const peakFish = allFishList
    .filter((f) => f.isPeak)
    .sort((a, b) => b.spotCount - a.spotCount);
  const seasonFish = allFishList
    .filter((f) => !f.isPeak)
    .sort((a, b) => b.spotCount - a.spotCount);

  // 各魚に対応するスポットTop3を取得
  function getSpotsForFish(fishSlug: string) {
    return regionSpots
      .filter((s) =>
        s.catchableFish.some(
          (cf) =>
            cf.fish.slug === fishSlug &&
            getFishSeasons(cf.fish, rSlug).seasonMonths.includes(monthDef!.num)
        )
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }

  // 各 peak fish について、この地域内でその魚が釣れるスポット数が最多の県を算出。
  // 県×魚ページ（/prefecture/{prefSlug}/fish/{fishSlug}）への送客リンク用。
  // getEligiblePrefFishCombos(1) と同じ「月を問わず catchableFish に含まれるか」で集計し、
  // 算出した県は必ず事前生成済み（count>=1）の県×魚ページに着地する。
  function getTopPrefForFish(fishSlug: string): { prefSlug: string; prefName: string } | null {
    const counts = new Map<string, number>();
    for (const spot of regionSpots) {
      if (!spot.catchableFish.some((cf) => cf.fish.slug === fishSlug)) continue;
      const pref = regionPrefs.find((p) => p.name === spot.region.prefecture);
      if (!pref) continue;
      counts.set(pref.slug, (counts.get(pref.slug) || 0) + 1);
    }
    let bestSlug: string | undefined;
    let bestCount = 0;
    for (const [slug, count] of counts) {
      if (count > bestCount) {
        bestCount = count;
        bestSlug = slug;
      }
    }
    if (!bestSlug) return null;
    const pref = regionPrefs.find((p) => p.slug === bestSlug);
    return pref ? { prefSlug: pref.slug, prefName: pref.nameShort } : null;
  }

  // おすすめスポットTOP6（旬の魚が多いスポット）
  // 旬の魚が釣れるスポット全件を先に確定し、件数(inSeasonSpotCount)をFAQ統計に使う。
  const inSeasonSpots = regionSpots
    .map((spot) => {
      const inSeasonCount = spot.catchableFish.filter((cf) =>
        getFishSeasons(cf.fish, rSlug).seasonMonths.includes(monthDef.num)
      ).length;
      const peakCount = spot.catchableFish.filter((cf) =>
        getFishSeasons(cf.fish, rSlug).peakMonths.includes(monthDef.num)
      ).length;
      return { spot, inSeasonCount, peakCount };
    })
    .filter((s) => s.inSeasonCount > 0)
    .sort((a, b) => b.peakCount - a.peakCount || b.inSeasonCount - a.inSeasonCount || b.spot.rating - a.spot.rating);
  const inSeasonSpotCount = inSeasonSpots.length;
  const topSpots = inSeasonSpots.slice(0, 6);

  // 前月/翌月
  const monthIdx = MONTHS.findIndex((m) => m.slug === monthSlug);
  const prevMonth = MONTHS[(monthIdx - 1 + 12) % 12];
  const nextMonth = MONTHS[(monthIdx + 1) % 12];

  // 季節のコツ
  const seasonalTips = getSeasonalTips(monthDef.season, regionName);

  // 水温・天候ナラティブ用データ
  // RegionGroup キー（hokkaido/.../kyushu）はページ slug とほぼ同一だが kyushu-okinawa→kyushu の差異がある。
  // 県名→RegionGroup を返す getRegionGroup() を使い、地域内の代表県から安全に解決する
  // （PREFECTURE_TO_REGION が権威マッピングのため slug 差異に依存しない）。
  const regionGroupKey = regionPrefs.length > 0 ? getRegionGroup(regionPrefs[0].name) : "kanto";
  const monthCondition = MONTH_CONDITIONS[monthDef.num];
  const regionClimate = REGION_CLIMATE[regionGroupKey];
  const peakFishForNarrative = peakFish.slice(0, 3).map((f) => f.name);

  // この地域の全釣り方を集約してアフィリエイト商品をマッチング
  const allMethods = new Set<string>();
  for (const f of allFishList) {
    for (const m of f.methods) {
      allMethods.add(m);
    }
  }
  const affiliateProducts = getRelevantAffiliateProducts(
    Array.from(allMethods),
    monthDef.num,
    6 // 最大6商品
  );

  // JSON-LD
  const pageUrl = `https://tsurispot.com/seasonal/${monthSlug}/${regionSlug}`;

  // datePublished は当該月基準（全96ページが「6月公開」を主張するバグの修正）。
  // 年は他テンプレ（buildArticleJsonLd 既定 2025-01-01）と整合する固定値 2025。
  const datePublished = `2025-${String(monthDef.num).padStart(2, "0")}-01`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "ホーム", url: "https://tsurispot.com" },
    { name: "今釣れる魚", url: "https://tsurispot.com/catchable-now" },
    { name: monthDef.name, url: pageUrl },
    { name: regionName },
  ]);

  const itemListJsonLd = buildItemListJsonLd({
    name: `${monthDef.name}に${regionName}で釣れる魚`,
    items: allFishList.slice(0, 30).map((f) => ({
      name: f.name,
      url: `https://tsurispot.com/fish/${f.slug}`,
    })),
    numberOfItems: allFishList.length,
  });

  const articleJsonLd = buildArticleJsonLd({
    headline: `${monthDef.name}の${regionName}釣り情報・釣れる魚とおすすめスポット`,
    description: `${monthDef.name}（${monthDef.season}）に${regionName}地方で釣れる魚${allFishList.length}種とおすすめ釣り場を完全ガイド。初心者向け穴場スポットも紹介。`,
    url: pageUrl,
    datePublished,
    dateModified: new Date().toISOString().split("T")[0],
  });

  // FAQ 動的生成
  const peakFishNames = peakFish.slice(0, 4).map((f) => f.name);
  const topFishNames = allFishList.slice(0, 5).map((f) => f.name);
  const topSpotNames = topSpots.slice(0, 3).map((s) => s.spot.name);

  const faqItems = [
    {
      question: `${monthDef.name}に${regionName}で釣れる魚は？`,
      answer: allFishList.length > 0
        ? `${monthDef.name}に${regionName}では${topFishNames.join("・")}など${allFishList.length}種が釣れます。${peakFish.length > 0 ? `うち最盛期は${peakFish.length}種で、特に${peakFishNames.join("・")}が狙い目です。` : ""}${monthCondition?.waterTemp ? `この時期の平均水温は${monthCondition.waterTemp}が目安です。` : ""}`
        : `${monthDef.name}の${regionName}で釣れる魚の情報は現在準備中です。`,
    },
    {
      question: `${monthDef.name}の${regionName}のおすすめ釣りスポットは？`,
      answer: topSpotNames.length > 0
        ? `${monthDef.name}の${regionName}で旬の魚が釣れるスポットは${inSeasonSpotCount}件あります。中でも${topSpotNames.join("・")}は旬の魚種が多くおすすめです。`
        : `${monthDef.name}の${regionName}のおすすめスポット情報は現在準備中です。`,
    },
    {
      question: `${monthDef.name}の${regionName}の釣り方のコツは？`,
      answer: seasonalTips.length > 0
        ? seasonalTips.slice(0, 2).join(" ")
        : `${monthDef.name}（${monthDef.season}）の釣りでは天候と水温の変化に注意し、魚の活性に合わせた釣り方を選びましょう。`,
    },
    {
      question: `${monthDef.name}の${regionName}で初心者におすすめの釣り方は？`,
      answer: `${monthDef.name}の${regionName}では、堤防や漁港での${monthDef.season === "冬" ? "穴釣りや探り釣り" : monthDef.season === "夏" ? "サビキ釣りやちょい投げ" : "サビキ釣りやウキ釣り"}がおすすめです。足場が安定した場所を選べば初心者でも安心して釣りを楽しめます。`,
    },
  ];

  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, articleJsonLd, faqJsonLd, itemListJsonLd]),
        }}
      />

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "今釣れる魚", href: "/catchable-now" },
          { label: monthDef.name },
          { label: regionName },
        ]}
      />

      {/* 戻るリンク */}
      <Link
        href="/catchable-now"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        今釣れる魚に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {monthDef.name}の{regionName}釣り情報・釣れる魚とおすすめスポット
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {monthDef.season}（{monthDef.name}）の{regionName}地方
          ｜ 釣れる魚{allFishList.length}種 ・ おすすめスポット{regionSpots.length}件
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {monthDef.name}に{regionName}地方で釣れる魚を{allFishList.length}種ご紹介。
          {peakFish.length > 0 && `特に${peakFish.slice(0, 4).map((f) => f.name).join("・")}は最盛期で、初心者にもおすすめです。`}
          {regionPrefs.length > 0 && `${regionPrefs.map((p) => p.nameShort).join("・")}エリアの穴場スポットも掲載。`}
          近くの釣り場を見つけて{monthDef.season}の釣りを楽しみましょう。
        </p>
      </div>

      {/* 前月/翌月ナビ */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <Link
          href={`/seasonal/${prevMonth.slug}/${regionSlug}`}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
          {prevMonth.name}
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {monthDef.name}（{monthDef.season}）
        </span>
        <Link
          href={`/seasonal/${nextMonth.slug}/${regionSlug}`}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          {nextMonth.name}
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* 今月の海の状況（水温・天候ナラティブ） */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
          <Thermometer className="size-5 text-cyan-600" />
          {monthDef.name}の{regionName}の海の状況・水温
        </h2>
        <Card className="gap-0 border-cyan-100 bg-cyan-50/40 py-0">
          <CardContent className="space-y-2 p-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {monthDef.name}（{monthDef.season}）の{regionName}は、海水温の目安が
              <span className="font-semibold text-foreground">{monthCondition.waterTemp}</span>
              前後。{monthCondition.feature}。
            </p>
            <p>
              {regionClimate}。
              {peakFishForNarrative.length > 0
                ? `この時期は${peakFishForNarrative.join("・")}など旬の魚の活性が高まり、水温と潮の動きを意識した釣りが釣果につながります。`
                : "水温と潮の動きを意識して、活性の高い時間帯を狙いましょう。"}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 最盛期の魚 */}
      {peakFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Flame className="size-5 text-orange-500" />
            {monthDef.name}の{regionName}で今が旬の魚・ベストシーズン
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {peakFish.map((f) => {
              const topSpots = getSpotsForFish(f.slug);
              return (
                <Card key={f.slug} className="gap-0 py-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/fish/${f.slug}`} className="group">
                        <h3 className="text-sm font-bold group-hover:text-primary sm:text-base">
                          {f.name}
                        </h3>
                      </Link>
                      <Badge className="shrink-0 bg-orange-500 text-xs hover:bg-orange-500">
                        最盛期
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {f.spotCount}スポットで釣れます
                    </p>
                    {f.methods.size > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Array.from(f.methods).slice(0, 3).map((m) => (
                          <Badge key={m} variant="outline" className="text-[10px]">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {topSpots.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {topSpots.map((spot) => (
                          <Link
                            key={spot.id}
                            href={`/spots/${spot.slug}`}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                          >
                            <MapPin className="size-3 shrink-0" />
                            {spot.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {(() => {
                      const topPref = getTopPrefForFish(f.slug);
                      return topPref ? (
                        <Link
                          href={`/prefecture/${topPref.prefSlug}/fish/${f.slug}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          {topPref.prefName}で{f.name}が釣れるスポット →
                        </Link>
                      ) : null;
                    })()}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* 広告: セクション間 */}
      <InArticleAd className="my-6" />

      {/* シーズン中の魚 */}
      {seasonFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5 text-blue-500" />
            {monthDef.name}に{regionName}で釣れるシーズン中の魚一覧
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {seasonFish.map((f) => {
              const fishData = fishSpecies.find((fs) => fs.slug === f.slug);
              return (
                <Link key={f.slug} href={`/fish/${f.slug}`}>
                  <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="size-8 shrink-0 overflow-hidden rounded-md bg-primary/10">
                          {fishData?.imageUrl ? (
                            <Image src={fishData.imageUrl} alt={f.name} width={32} height={32} className="size-full object-cover" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-primary">
                              <Fish className="size-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                            {f.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {f.spotCount}スポット
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* おすすめスポット（近い順ソート対応） */}
      {topSpots.length > 0 && (() => {
        const sortableSpots: MonthlySpot[] = topSpots.map(({ spot }) => ({
          slug: spot.slug,
          name: spot.name,
          rating: spot.rating,
          latitude: spot.latitude,
          longitude: spot.longitude,
          spotType: spot.spotType,
          difficulty: spot.difficulty,
          mainImageUrl: spot.mainImageUrl,
          region: { prefecture: spot.region.prefecture },
          catchableFishNames: spot.catchableFish
            .filter((cf) => getFishSeasons(cf.fish, rSlug).seasonMonths.includes(monthDef!.num))
            .map((cf) => cf.fish.name)
            .slice(0, 3),
        }));
        return (
          <section className="mb-8 sm:mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
              <MapPin className="size-5 text-primary" />
              {monthDef.name}の{regionName}おすすめ釣り場・穴場スポット
            </h2>
            <MonthlySportsSorter spots={sortableSpots} monthName={monthDef.name} />
          </section>
        );
      })()}

      {/* 季節のコツ */}
      {seasonalTips.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Thermometer className="size-5 text-amber-600" />
            {monthDef.name}（{monthDef.season}）の{regionName}釣りのコツ・初心者向けアドバイス
          </h2>
          <Card className="gap-0 py-0 border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 sm:p-5">
              <ul className="space-y-2">
                {seasonalTips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-amber-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* おすすめ装備（アフィリエイト） */}
      <SeasonalAffiliateSection
        products={affiliateProducts}
        seasonLabel={monthDef.name}
        regionName={regionName}
      />

      {/* よくある質問 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          よくある質問
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <Card key={idx} className="gap-0 py-0">
              <CardContent className="p-4">
                <h3 className="mb-2 text-sm font-bold">
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

      {/* 都道府県別リンク */}
      {regionPrefs.length > 1 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {regionName}の都道府県別釣り場
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {regionPrefs.map((p) => {
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

      {/* 他の地域 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-base font-bold sm:text-lg">
          {monthDef.name}の他の地域
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {REGION_GROUP_SLUG_ENTRIES
            .filter(([slug]) => slug !== regionSlug)
            .map(([slug, name]) => (
              <Link key={slug} href={`/seasonal/${monthSlug}/${slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary">
                      {name}
                    </h3>
                  </CardContent>
                </Card>
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
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
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
