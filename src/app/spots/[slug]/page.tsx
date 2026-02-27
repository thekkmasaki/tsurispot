import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Car,
  ChevronLeft,
  Fish,
  Compass,
  Wrench,
  Play,
  ExternalLink,
  Toilet,
  Store,
  ShoppingBag,
  MessageSquare,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fishingSpots, getSpotBySlug, getNearbySpots, getSpotsByPrefecture, getSpotsByFish, type NearbySpot } from "@/lib/data/spots";
import { getShopsForSpot } from "@/lib/data/shops";
import { getPrefectureByName } from "@/lib/data/prefectures";
import { SeasonCalendar } from "@/components/spots/season-calendar";
import { TackleCard } from "@/components/spots/tackle-card";
import { TideMazumeInfo } from "@/components/spots/tide-mazume-info";
import { FavoriteButton } from "@/components/spots/favorite-button";
import { GoTodayButton } from "@/components/spots/go-today-button";
import { GearGuideList } from "@/components/spots/gear-guide";
import { SafetyWarning } from "@/components/spots/safety-warning";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import {
  SPOT_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from "@/types";
import { SpotImage } from "@/components/ui/spot-image";
import { SpotBouzuCard } from "@/components/spots/spot-bouzu-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ShareButtons } from "@/components/ui/share-buttons";
import { InArticleAd } from "@/components/ads/ad-unit";
import { FishLikeButton } from "@/components/spots/fish-like-button";
import { FishingReportSummary } from "@/components/spots/fishing-report-summary";
import { SpotAffiliateRecommend } from "@/components/spots/spot-affiliate-recommend";
import { SpotDetailTabs } from "@/components/spots/spot-detail-tabs";
import { ParkingPeakCard } from "@/components/spots/parking-peak-info";
import { FamilyInfoCard } from "@/components/spots/family-info";
import { PackingChecklist } from "@/components/spots/packing-checklist";
import { getCatchReportsBySpot } from "@/lib/data/catch-reports";
import { CatchReportList } from "@/components/spots/catch-report-list";
import { CatchReportForm } from "@/components/spots/catch-report-form";
import { SpotRulesCard } from "@/components/spots/spot-rules";
import { LineBanner } from "@/components/line-banner";
import { SpotPhotoGallery } from "@/components/spots/spot-photo-gallery";
import { areaGuides } from "@/lib/data/area-guides";
import { explainTime, explainMethod } from "@/lib/fishing-term-helper";
import { seasonalGuides } from "@/lib/data/seasonal-guides";

import { RecentlyViewedTracker } from "@/components/spots/recently-viewed-tracker";
import { RecentlyViewedSpots } from "@/components/spots/recently-viewed";

// Below-the-fold client components loaded lazily
const StreetViewSection = dynamic(() => import("@/components/spots/street-view-section").then((m) => m.StreetViewSection));
const SpotWeatherTide = dynamic(() => import("@/components/spots/spot-weather-tide").then((m) => m.SpotWeatherTide));
const CrowdPredictionCard = dynamic(() => import("@/components/spots/crowd-prediction").then((m) => m.CrowdPredictionCard));
const NearbyGpsSearch = dynamic(() => import("@/components/spots/nearby-gps-search").then((m) => m.NearbyGpsSearch));

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = getSpotBySlug(slug);
  if (!spot) return { title: "スポットが見つかりません" };

  const fishNames = spot.catchableFish.map((cf) => cf.fish.name).join("・");
  const topFishNames = spot.catchableFish.slice(0, 2).map((cf) => cf.fish.name).join("・");
  const topMethodLabel = spot.catchableFish[0]?.method ?? "";
  const baseTitleText = `${spot.name}の釣り情報・釣果・アクセス`;
  const fullTitle = topMethodLabel && topFishNames
    ? `${baseTitleText}【${topMethodLabel}で${topFishNames}】`
    : baseTitleText;
  const title = fullTitle.length <= 60 ? fullTitle : baseTitleText;
  const description = `${spot.name}（${spot.address}）は${spot.region.prefecture}${spot.region.areaName}にある${SPOT_TYPE_LABELS[spot.spotType]}の釣り場。${fishNames}が狙えるおすすめスポットです。${spot.hasParking ? '駐車場あり。' : ''}${spot.hasToilet ? 'トイレあり。' : ''}${spot.isFree ? '無料で釣りOK。' : ''}アクセス・釣れる魚・仕掛け情報を初心者向けに完全ガイド。`;
  const ogDescription = `${spot.name}（${spot.region.prefecture}${spot.region.areaName}）で${fishNames}が狙えます。${spot.description}`;
  return {
    title,
    description: description.slice(0, 160),
    keywords: [spot.name, spot.region.prefecture, spot.region.areaName, "釣り場", "釣りスポット", ...spot.catchableFish.slice(0, 5).map((cf) => cf.fish.name)],
    openGraph: {
      title: `${spot.name}の釣り情報・釣果・アクセス | ツリスポ`,
      description: ogDescription.slice(0, 120),
      type: "article",
      url: `https://tsurispot.com/spots/${spot.slug}`,
      siteName: "ツリスポ",
    },
    twitter: {
      card: "summary_large_image",
      title: `${spot.name}の釣り情報 | ツリスポ`,
      description: ogDescription.slice(0, 120),
    },
    alternates: {
      canonical: `https://tsurispot.com/spots/${spot.slug}`,
    },
  };
}

export function generateStaticParams() {
  return fishingSpots.map((spot) => ({ slug: spot.slug }));
}

export default async function SpotDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const spot = getSpotBySlug(slug);
  if (!spot) notFound();

  // 今月釣れる魚を算出（Event schema用）
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const currentMonthFish = spot.catchableFish.filter((cf) => {
    if (cf.monthStart <= cf.monthEnd) {
      return currentMonth >= cf.monthStart && currentMonth <= cf.monthEnd;
    }
    // 年をまたぐ場合（例: 11月〜3月）
    return currentMonth >= cf.monthStart || currentMonth <= cf.monthEnd;
  });

  const currentYear = new Date().getFullYear();
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const eventStartDate = `${currentYear}-${String(currentMonth).padStart(2, "0")}-01`;
  const eventEndYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const eventEndDate = `${eventEndYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: spot.name,
    description: spot.description,
    url: `https://tsurispot.com/spots/${spot.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: spot.region.areaName,
      addressRegion: spot.region.prefecture,
      addressCountry: "JP",
      streetAddress: spot.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: spot.latitude,
      longitude: spot.longitude,
    },
    isAccessibleForFree: spot.isFree,
    publicAccess: true,
    ...(spot.mainImageUrl?.startsWith("http") ? { image: spot.mainImageUrl } : {}),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: spot.rating.toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount: spot.reviewCount > 0 ? spot.reviewCount : 1,
    },
    amenityFeature: [
      ...(spot.hasParking ? [{ "@type": "LocationFeatureSpecification", name: "駐車場", value: true }] : []),
      ...(spot.hasToilet ? [{ "@type": "LocationFeatureSpecification", name: "トイレ", value: true }] : []),
      ...(spot.hasRentalRod ? [{ "@type": "LocationFeatureSpecification", name: "レンタル竿", value: true }] : []),
      ...(spot.hasFishingShop ? [{ "@type": "LocationFeatureSpecification", name: "釣具店", value: true }] : []),
    ],
    touristType: spot.difficulty === "beginner" ? "初心者" : spot.difficulty === "intermediate" ? "中級者" : "上級者",
    ...(currentMonthFish.length > 0
      ? {
          event: {
            "@type": "Event",
            name: `${spot.name}｜${monthNames[currentMonth]}の釣りシーズン`,
            description: `${monthNames[currentMonth]}に${spot.name}で狙える魚: ${currentMonthFish.map((cf) => cf.fish.name).join("、")}`,
            startDate: eventStartDate,
            endDate: eventEndDate,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: spot.name,
              address: spot.address,
              geo: {
                "@type": "GeoCoordinates",
                latitude: spot.latitude,
                longitude: spot.longitude,
              },
            },
            organizer: {
              "@type": "Organization",
              name: "ツリスポ",
              url: "https://tsurispot.com",
            },
            ...(spot.isFree
              ? {
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "JPY",
                    availability: "https://schema.org/InStock",
                  },
                }
              : {}),
          },
        }
      : {}),
  };

  const prefForBreadcrumb = getPrefectureByName(spot.region.prefecture);
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
        name: "釣りスポット一覧",
        item: "https://tsurispot.com/spots",
      },
      ...(prefForBreadcrumb ? [{
        "@type": "ListItem",
        position: 3,
        name: spot.region.prefecture,
        item: `https://tsurispot.com/prefecture/${prefForBreadcrumb.slug}`,
      }] : []),
      {
        "@type": "ListItem",
        position: prefForBreadcrumb ? 4 : 3,
        name: spot.region.areaName,
        item: `https://tsurispot.com/area/${spot.region.slug}`,
      },
      {
        "@type": "ListItem",
        position: prefForBreadcrumb ? 5 : 4,
        name: spot.name,
        item: `https://tsurispot.com/spots/${spot.slug}`,
      },
    ],
  };

  const fishNames = spot.catchableFish.map((cf) => cf.fish.name).join("、");
  const difficultyAnswer =
    spot.difficulty === "beginner"
      ? `${spot.name}は初心者向けの釣り場です。足場が安定しており、安心して釣りを楽しめます。`
      : spot.difficulty === "intermediate"
        ? `${spot.name}は中級者向けの釣り場です。基本的な釣りの経験がある方におすすめです。`
        : `${spot.name}は上級者向けの釣り場です。十分な経験と装備が必要です。`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${spot.name}で何が釣れますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${spot.name}では${fishNames}などが釣れます。`,
        },
      },
      ...(spot.feeDetail || spot.isFree
        ? [
            {
              "@type": "Question",
              name: `${spot.name}の料金はいくらですか？`,
              acceptedAnswer: {
                "@type": "Answer",
                text: spot.isFree
                  ? `${spot.name}は無料で釣りを楽しめます。`
                  : `${spot.name}の利用料金は${spot.feeDetail}です。`,
              },
            },
          ]
        : []),
      {
        "@type": "Question",
        name: `${spot.name}に駐車場はありますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: spot.hasParking
            ? `はい、${spot.name}には駐車場があります。${spot.parkingDetail || ""}`
            : `${spot.name}には専用駐車場はありません。周辺のコインパーキング等をご利用ください。`,
        },
      },
      {
        "@type": "Question",
        name: `${spot.name}にトイレはありますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: spot.hasToilet
            ? `はい、${spot.name}にはトイレがあります。`
            : `${spot.name}には専用トイレはありません。近隣のコンビニや公共施設のトイレをご利用ください。`,
        },
      },
      {
        "@type": "Question",
        name: `${spot.name}の難易度は？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: difficultyAnswer,
        },
      },
      {
        "@type": "Question",
        name: `${spot.name}へのアクセスは？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${spot.name}の所在地は${spot.address}です。${spot.accessInfo}`,
        },
      },
      {
        "@type": "Question",
        name: `${spot.name}は初心者でも釣れますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: spot.difficulty === "beginner"
            ? `はい、${spot.name}は初心者の方でも釣果が期待できる釣り場です。${spot.hasRentalRod ? "レンタル竿もあるので手ぶらでも楽しめます。" : ""}${spot.catchableFish.filter(cf => cf.catchDifficulty === "easy").length > 0 ? `${spot.catchableFish.filter(cf => cf.catchDifficulty === "easy").map(cf => cf.fish.name).slice(0, 3).join("、")}は比較的簡単に釣れます。` : ""}`
            : spot.difficulty === "intermediate"
              ? `${spot.name}は中級者向けの釣り場ですが、釣り方や時間帯を選べば初心者でも釣果を得られる可能性があります。${spot.catchableFish.filter(cf => cf.catchDifficulty === "easy").length > 0 ? `${spot.catchableFish.filter(cf => cf.catchDifficulty === "easy").map(cf => cf.fish.name).slice(0, 2).join("、")}は比較的狙いやすい魚です。` : ""}`
              : `${spot.name}は上級者向けの釣り場です。初心者の方は経験者と一緒に訪れることをおすすめします。`,
        },
      },
      ...(spot.catchableFish.length > 0
        ? [{
            "@type": "Question" as const,
            name: `${spot.name}のおすすめ時期はいつですか？`,
            acceptedAnswer: {
              "@type": "Answer" as const,
              text: (() => {
                const peakFish = spot.catchableFish.filter(cf => cf.peakSeason);
                if (peakFish.length > 0) {
                  return `${spot.name}では${peakFish.slice(0, 3).map(cf => cf.fish.name).join("、")}が旬を迎える時期が特におすすめです。年間を通じて${spot.catchableFish.length}種類の魚が狙えます。`;
                }
                return `${spot.name}では年間を通じて${spot.catchableFish.length}種類の魚が狙えます。`;
              })(),
            },
          }]
        : []),
      {
        "@type": "Question",
        name: `${spot.name}は混雑しますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${spot.name}は${spot.isFree ? "無料の釣り場のため週末や祝日は混み合うことがあります" : "有料施設のため比較的快適に釣りを楽しめます"}。${spot.difficulty === "beginner" ? "初心者向けの人気スポットなのでハイシーズンは早めの場所取りがおすすめです。" : ""}朝マヅメの時間帯は釣り人が多くなる傾向があります。`,
        },
      },
      {
        "@type": "Question",
        name: `${spot.name}の近くにコンビニや釣具店はありますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: (() => {
            const parts: string[] = [];
            if (spot.hasConvenienceStore) {
              parts.push(`${spot.name}の近くにはコンビニがあります`);
            } else {
              parts.push(`${spot.name}の近くにはコンビニがないため、飲み物や食べ物は事前に用意しておくことをおすすめします`);
            }
            if (spot.hasFishingShop) {
              parts.push("近くに釣具店もあるので、エサや仕掛けの補充も可能です");
            } else {
              parts.push("釣具店は近くにないため、タックルやエサは事前に準備しておきましょう");
            }
            return parts.join("。") + "。";
          })(),
        },
      },
    ],
  };

  // 夜釣り可能かどうかの判定（catchableFishのrecommendedTimeに「夜」を含む場合）
  const isNightFishing =
    spot.catchableFish.some((cf) => cf.recommendedTime.includes("夜"));

  // Get nearby spots for internal linking (exclude self, top 5 by Haversine distance)
  const nearbySpots: NearbySpot[] = getNearbySpots(spot.latitude, spot.longitude, 6).filter(
    (s) => s.id !== spot.id
  ).slice(0, 5);

  // Lightweight nearby spots data for GPS search (client component)
  const gpsNearbyData = getNearbySpots(spot.latitude, spot.longitude, 20)
    .filter((s) => s.id !== spot.id)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      spotType: s.spotType,
      latitude: s.latitude,
      longitude: s.longitude,
      prefecture: s.region.prefecture,
    }));

  // Get nearby tackle shops
  const nearbyShops = getShopsForSpot(spot.slug);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {/* 最近見たスポット記録 */}
      <RecentlyViewedTracker spot={{ slug: spot.slug, name: spot.name, prefecture: spot.region.prefecture, areaName: spot.region.areaName, spotType: spot.spotType }} />

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣りスポット", href: "/spots" },
          ...((() => {
            const pref = getPrefectureByName(spot.region.prefecture);
            return pref ? [{ label: spot.region.prefecture, href: `/prefecture/${pref.slug}` }] : [];
          })()),
          { label: spot.region.areaName, href: `/area/${spot.region.slug}` },
          { label: spot.name },
        ]}
      />

      {/* Back link */}
      <Link
        href="/spots"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        スポット一覧に戻る
      </Link>

      {/* Header section - モバイルファースト設計 */}
      <div className="mb-5 sm:mb-6">
        {/* スポット名 + お気に入り（最上段） */}
        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 text-xl font-bold leading-tight sm:text-2xl md:text-3xl">{spot.name}</h1>
          <FavoriteButton spotSlug={spot.slug} />
        </div>

        {/* 評価 + エリア情報 */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-foreground">
              {spot.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="size-4" />
            {(() => {
              const pref = getPrefectureByName(spot.region.prefecture);
              return (
                <>
                  {pref ? (
                    <Link href={`/prefecture/${pref.slug}`} className="hover:text-foreground hover:underline">
                      {spot.region.prefecture}
                    </Link>
                  ) : (
                    <span>{spot.region.prefecture}</span>
                  )}
                  {" "}
                  <Link href={`/area/${spot.region.slug}`} className="hover:text-foreground hover:underline">
                    {spot.region.areaName}
                  </Link>
                </>
              );
            })()}
          </div>
        </div>

        {/* バッジ（3段目） */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {spot.difficulty === "beginner" && (
            <Badge className="bg-green-600 hover:bg-green-600 text-xs">
              初心者OK
            </Badge>
          )}
          {spot.hasRentalRod && (
            <Badge className="bg-purple-600 hover:bg-purple-600 text-xs">
              手ぶらOK
            </Badge>
          )}
          {spot.isFree && (
            <Badge className="bg-orange-500 hover:bg-orange-500 text-xs">無料</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {SPOT_TYPE_LABELS[spot.spotType]}
          </Badge>
        </div>

        {/* 説明文 */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {spot.description}
          {spot.name}は{spot.region.prefecture}{spot.region.areaName}に位置する
          {spot.difficulty === "beginner" ? "初心者にもおすすめ" : spot.difficulty === "intermediate" ? "中級者向け" : "上級者向け"}
          の釣りスポットです。
          {spot.catchableFish.length > 0 ? `${spot.catchableFish.slice(0, 3).map(f => f.fish.name).join("、")}などが狙えます。` : ""}
          {spot.isFree ? "無料で釣りができます。" : spot.feeDetail ? `利用料金: ${spot.feeDetail}` : ""}
        </p>

        {/* 「今日行く」ボタン（ヘッダーから分離、独立セクション） */}
        <div className="mt-4 rounded-xl border bg-muted/30 p-3 sm:p-4">
          <GoTodayButton slug={spot.slug} spotName={spot.name} />
        </div>

        {/* シェアボタン */}
        <div className="mt-3">
          <ShareButtons
            url={`https://tsurispot.com/spots/${spot.slug}`}
            title={`${spot.name}の釣り情報｜ツリスポ`}
          />
        </div>
      </div>

      {/* Photo area - 実際の写真がある場合のみ表示 */}
      {(spot.mainImageUrl?.startsWith("http") || spot.mainImageUrl?.startsWith("/images/spots/wikimedia/")) && (
        <div className="mb-6 sm:mb-8">
          <div className="overflow-hidden rounded-xl">
            <SpotImage
              src={spot.mainImageUrl}
              alt={spot.name}
              spotType={spot.spotType}
              height="h-48 sm:h-56 md:h-72"
              priority
            />
          </div>
          {spot.imageAttribution && (
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {spot.imageAttribution}
            </p>
          )}
        </div>
      )}

      {/* スポット写真ギャラリー */}
      {spot.spotPhotos && spot.spotPhotos.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <SpotPhotoGallery photos={spot.spotPhotos} spotName={spot.name} />
        </section>
      )}

      {/* 安全警告 */}
      {(spot.safetyLevel === "caution" || spot.safetyLevel === "danger") && (
        <div className="mb-4"><SafetyWarning level={spot.safetyLevel} notes={spot.safetyNotes} isKuchikomi={spot.isKuchikomiSpot} /></div>
      )}
      {spot.isKuchikomiSpot && spot.safetyLevel === "safe" && (
        <div className="mb-4"><SafetyWarning level="safe" notes={spot.safetyNotes} isKuchikomi={true} /></div>
      )}

      {/* タブレイアウト */}
      <SpotDetailTabs
        overviewTab={<>
          <section>
            <h2 className="mb-4 text-lg font-bold">基本情報</h2>
            <Card className="py-4"><CardContent className="px-4">
              <dl className="space-y-3 text-sm">
                {spot.feeDetail && (<div className="flex gap-4"><dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">料金</dt><dd>{spot.feeDetail}</dd></div>)}
                {spot.isFree && (<div className="flex gap-4"><dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">料金</dt><dd className="font-medium text-orange-600">無料</dd></div>)}
                <div className="flex gap-4"><dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">難易度</dt><dd>{DIFFICULTY_LABELS[spot.difficulty]}</dd></div>
                <div className="flex gap-4"><dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">タイプ</dt><dd>{SPOT_TYPE_LABELS[spot.spotType]}</dd></div>
                {spot.rentalDetail && (<div className="flex gap-4"><dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">レンタル</dt><dd>{spot.rentalDetail}</dd></div>)}
              </dl>
            </CardContent></Card>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">設備</h2>
            <div className="flex flex-wrap gap-2">
              {spot.hasParking && <Badge variant="outline" className="text-xs"><Car className="size-3.5 mr-1" />駐車場{spot.parkingDetail ? `（${spot.parkingDetail}）` : ""}</Badge>}
              {spot.hasToilet && <Badge variant="outline" className="text-xs"><Toilet className="size-3.5 mr-1" />トイレ</Badge>}
              {spot.hasFishingShop && <Badge variant="outline" className="text-xs"><Store className="size-3.5 mr-1" />釣具店</Badge>}
              {spot.hasRentalRod && <Badge variant="outline" className="text-xs"><Wrench className="size-3.5 mr-1" />レンタル竿</Badge>}
              {spot.hasConvenienceStore && <Badge variant="outline" className="text-xs"><ShoppingBag className="size-3.5 mr-1" />コンビニ近く</Badge>}
            </div>
          </section>
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><Shield className="size-5" />釣りルール・禁止事項</h2>
            <SpotRulesCard rules={spot.rules} spotType={spot.spotType} spotName={spot.name} />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">混雑予想</h2>
            <CrowdPredictionCard rating={spot.rating} isFree={spot.isFree} difficulty={spot.difficulty} prefecture={spot.region.prefecture} hasParking={spot.hasParking} reviewCount={spot.reviewCount} />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">ファミリー向け情報</h2>
            <FamilyInfoCard familyInfo={spot.familyInfo} spotType={spot.spotType} hasToilet={spot.hasToilet} hasParking={spot.hasParking} difficulty={spot.difficulty} />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">天気・潮汐情報</h2>
            <SpotWeatherTide lat={spot.latitude} lng={spot.longitude} spotName={spot.name} />
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold">ボウズ確率</h2>
            <SpotBouzuCard spotType={spot.spotType} difficulty={spot.difficulty} rating={spot.rating} reviewCount={spot.reviewCount} prefecture={spot.region.prefecture} areaName={spot.region.areaName} isFree={spot.isFree} hasRentalRod={spot.hasRentalRod} catchableFishCount={spot.catchableFish.length} catchableFishDetails={spot.catchableFish.map((cf) => ({ fishSlug: cf.fish.slug, fishName: cf.fish.name, method: cf.method, catchDifficulty: cf.catchDifficulty, monthStart: cf.monthStart, monthEnd: cf.monthEnd, peakSeason: cf.peakSeason }))} />
          </section>
          {spot.youtubeLinks && spot.youtubeLinks.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Play className="size-5" />参考動画</h2>
              <p className="mb-4 text-sm text-muted-foreground">このスポットでの釣りの様子がわかるYouTube動画です。</p>
              <YouTubeVideoList links={spot.youtubeLinks} />
            </section>
          )}
        </>}
        fishTab={<>
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><Fish className="size-5" />{spot.name}で釣れる魚の季節カレンダー</h2>
            {spot.catchableFish.length > 0 ? (
              <Card className="py-3 sm:py-4"><CardContent className="px-3 sm:px-4 overflow-x-auto scrollbar-hide"><div className="min-w-[480px]"><SeasonCalendar catchableFish={spot.catchableFish} /></div></CardContent></Card>
            ) : (<p className="text-sm text-muted-foreground">釣れる魚の情報はまだ登録されていません。</p>)}
          </section>
          {spot.catchableFish.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">魚種別の釣り方</h2>
              <div className="space-y-2">
                {spot.catchableFish.map((cf) => {
                  const methodExplanation = explainMethod(cf.method);
                  return (
                    <div key={cf.fish.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link href={`/fish/${cf.fish.slug}`} className="font-medium truncate hover:text-primary hover:underline">{cf.fish.name}</Link>
                          <Badge variant="secondary" className="text-xs shrink-0">{cf.method}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">{explainTime(cf.recommendedTime)}</p>
                      </div>
                      {methodExplanation && (<p className="mt-1.5 text-xs text-muted-foreground"><span className="mr-1">💡</span>{cf.method}とは… {methodExplanation}</p>)}
                      <div className="mt-2"><FishLikeButton spotSlug={slug} fishSlug={cf.fish.slug} /></div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
          {(spot.mazumeInfo || spot.tideAdvice) && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Compass className="size-5" />マヅメ・潮汐ガイド</h2>
              <TideMazumeInfo tideAdvice={spot.tideAdvice} mazumeInfo={spot.mazumeInfo} />
            </section>
          )}
          {spot.catchableFish.length > 0 && (
            <section><FishingReportSummary spotSlug={slug} fishList={spot.catchableFish.map((cf) => ({ slug: cf.fish.slug, name: cf.fish.name }))} /></section>
          )}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><MessageSquare className="size-5" />みんなの釣果報告</h2>
            <CatchReportList reports={getCatchReportsBySpot(slug)} />
            <CatchReportForm spotSlug={slug} spotName={spot.name} />
          </section>
        </>}
        gearTab={<>
          {spot.tackleRecommendations.filter((t) => t.amazonUrl !== "#" && t.rakutenUrl !== "#").length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">{spot.name}で使える仕掛け・タックル</h2>
              <div className="space-y-4">{spot.tackleRecommendations.filter((t) => t.amazonUrl !== "#" && t.rakutenUrl !== "#").map((tackle) => (<TackleCard key={tackle.id} tackle={tackle} />))}</div>
              <p className="mt-3 text-xs text-muted-foreground">※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。</p>
            </section>
          )}
          {spot.gearGuides && spot.gearGuides.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Wrench className="size-5" />初心者向け装備ガイド</h2>
              <p className="mb-4 text-sm text-muted-foreground">このスポットでの釣りに必要な道具をわかりやすくまとめました。</p>
              <GearGuideList guides={spot.gearGuides} />
            </section>
          )}
          {spot.catchableFish.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Wrench className="size-5" />{spot.gearGuides && spot.gearGuides.length > 0 ? "おすすめ装備" : "この釣り場でおすすめの装備"}</h2>
              <p className="mb-2 text-sm text-muted-foreground">このスポットの釣り方に合った装備をピックアップしました。</p>
              <SpotAffiliateRecommend methods={spot.catchableFish.map((cf) => cf.method)} isNightFishing={isNightFishing} />
            </section>
          )}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><ShoppingBag className="size-5" />持ち物チェックリスト</h2>
            <PackingChecklist spotType={spot.spotType} hasConvenienceStore={spot.hasConvenienceStore} hasToilet={spot.hasToilet} hasFishingShop={spot.hasFishingShop} hasRentalRod={spot.hasRentalRod} difficulty={spot.difficulty} safetyLevel={spot.safetyLevel} isNightFishing={isNightFishing} />
          </section>
        </>}
        accessTab={<>
          <section>
            <h2 className="mb-4 text-lg font-bold">アクセス情報</h2>
            <Card className="py-4">
              <CardHeader className="px-4 pb-0 pt-0"><CardTitle className="text-base"><MapPin className="mr-1 inline size-4" />所在地</CardTitle></CardHeader>
              <CardContent className="space-y-4 px-4">
                <div>
                  <p className="text-sm">{spot.address}</p>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline min-h-[36px]"><ExternalLink className="size-3.5" />Google Mapsでルートを見る</a>
                </div>
                <Separator />
                <div>
                  <h4 className="mb-1 text-sm font-medium"><Car className="mr-1 inline size-4" />アクセス方法</h4>
                  <p className="text-sm text-muted-foreground">{spot.accessInfo}</p>
                </div>
                <Separator />
                <ParkingPeakCard parkingPeakInfo={spot.parkingPeakInfo} hasParking={spot.hasParking} parkingDetail={spot.parkingDetail} />
              </CardContent>
            </Card>
          </section>
          <section>
            <h2 className="mb-4 text-lg font-bold">現地の様子（ストリートビュー）</h2>
            <StreetViewSection latitude={spot.latitude} longitude={spot.longitude} spotName={spot.name} address={spot.address} />
          </section>
          {nearbyShops.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">近くの釣具店</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {nearbyShops.map((shop) => (
                  <Link key={shop.id} href={`/shops/${shop.slug}`}>
                    <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md"><CardContent className="p-4">
                      <h3 className="truncate font-semibold group-hover:text-primary">{shop.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{shop.businessHours}（定休: {shop.closedDays}）</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {shop.hasLiveBait && <Badge variant="outline" className="text-[10px] px-1.5 py-0">活きエサ</Badge>}
                        {shop.hasFrozenBait && <Badge variant="outline" className="text-[10px] px-1.5 py-0">冷凍エサ</Badge>}
                        {shop.hasRentalRod && <Badge variant="outline" className="text-[10px] px-1.5 py-0">レンタル竿</Badge>}
                      </div>
                    </CardContent></Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>}
      />

      {/* 広告 */}
      <InArticleAd className="mt-6" />

      {/* この近くの釣り場 */}
      {nearbySpots.length > 0 && (
        <section id="nearby-spots" className="mt-8 sm:mt-12">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <MapPin className="size-5" />
            {spot.name}周辺の釣りスポット
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {nearbySpots.map((nearSpot) => (
              <Link key={nearSpot.id} href={`/spots/${nearSpot.slug}`} className="shrink-0">
                <div className="min-w-[200px] rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
                  <p className="text-sm text-gray-500 mb-1">
                    約{nearSpot.distanceKm < 10
                      ? nearSpot.distanceKm.toFixed(1)
                      : Math.round(nearSpot.distanceKm).toString()}km
                  </p>
                  <p className="font-medium text-blue-600 hover:underline leading-snug">
                    {nearSpot.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {SPOT_TYPE_LABELS[nearSpot.spotType]}
                  </p>
                  {nearSpot.catchableFish.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {nearSpot.catchableFish.slice(0, 3).map((cf) => cf.fish.name).join("・")}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <NearbyGpsSearch spots={gpsNearbyData} currentSpotSlug={slug} />
        </section>
      )}

      {/* 同じ都道府県の釣りスポット */}
      {(() => {
        const samePrefSpots = getSpotsByPrefecture(spot.region.prefecture, spot.slug, 6);
        if (samePrefSpots.length === 0) return null;
        const pref = getPrefectureByName(spot.region.prefecture);
        return (
          <section className="mt-8 sm:mt-12">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <MapPin className="size-5" />
              {spot.region.prefecture}の他の釣りスポット
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {samePrefSpots.map((ps) => (
                <Link key={ps.id} href={`/spots/${ps.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="font-semibold group-hover:text-primary truncate">{ps.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ps.region.areaName} / {SPOT_TYPE_LABELS[ps.spotType]}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        <span>{ps.rating.toFixed(1)}</span>
                      </div>
                      {ps.catchableFish.length > 0 && (
                        <p className="mt-2 text-xs text-muted-foreground truncate">
                          {ps.catchableFish.slice(0, 3).map((cf) => cf.fish.name).join("・")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {pref && (
              <div className="mt-3 text-right">
                <Link href={`/prefecture/${pref.slug}`} className="text-sm text-primary hover:underline">
                  {spot.region.prefecture}の釣りスポットをすべて見る →
                </Link>
              </div>
            )}
          </section>
        );
      })()}

      {/* 同じ魚が釣れる他のスポット */}
      {(() => {
        const fishSlugs = spot.catchableFish.map((cf) => cf.fish.slug);
        const sameFishSpots = getSpotsByFish(fishSlugs, spot.slug, 5);
        if (sameFishSpots.length === 0) return null;
        return (
          <section className="mt-8 sm:mt-12">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <Fish className="size-5" />
              同じ魚が釣れるスポット
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sameFishSpots.map((ps) => {
                const commonFish = ps.catchableFish
                  .filter((cf) => fishSlugs.includes(cf.fish.slug))
                  .slice(0, 3);
                return (
                  <Link key={ps.id} href={`/spots/${ps.slug}`}>
                    <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <h3 className="font-semibold group-hover:text-primary truncate">{ps.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {ps.region.prefecture} {ps.region.areaName}
                        </p>
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          <span>{ps.rating.toFixed(1)}</span>
                        </div>
                        {commonFish.length > 0 && (
                          <p className="mt-2 text-xs text-muted-foreground truncate">
                            共通: {commonFish.map((cf) => cf.fish.name).join("・")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* この釣り場で釣れる魚（内部リンク強化） */}
      {spot.catchableFish.length > 0 && (
        <section className="mt-6 sm:mt-8">
          <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">{spot.name}で狙える魚種と釣り方</h2>
          <div className="flex flex-wrap gap-2">
            {spot.catchableFish.map((cf) => (
              <Link key={cf.fish.id} href={`/fish/${cf.fish.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground min-h-[40px] flex items-center"
                >
                  {cf.fish.name}の釣り情報
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* このエリアの釣りガイド */}
      {(() => {
        const matchedAreaGuides = areaGuides.filter((g) =>
          g.prefectures.includes(spot.region.prefecture)
        );
        if (matchedAreaGuides.length === 0) return null;
        return (
          <section className="mt-8 sm:mt-12">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <Compass className="size-5" />
              {spot.region.prefecture}の釣りエリアガイド
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {matchedAreaGuides.slice(0, 4).map((guide) => (
                <Link key={guide.slug} href={`/area-guide/${guide.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="font-semibold group-hover:text-primary">
                        {guide.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {guide.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {guide.mainFish.slice(0, 3).map((f) => (
                          <Badge key={f} variant="secondary" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* この釣り場に関連する季節特集 */}
      {(() => {
        const fishSlugs = spot.catchableFish.map((cf) => cf.fish.slug);
        const matchedSeasonalGuides = seasonalGuides.filter((g) =>
          g.targetFish.some((tf) => fishSlugs.includes(tf))
        );
        if (matchedSeasonalGuides.length === 0) return null;
        return (
          <section className="mt-8 sm:mt-12">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <Fish className="size-5" />
              関連する釣り方ガイド
            </h2>
            <div className="flex flex-wrap gap-2">
              {matchedSeasonalGuides.slice(0, 6).map((guide) => (
                <Link key={guide.slug} href={`/seasonal/${guide.slug}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground min-h-[40px] flex items-center"
                  >
                    {guide.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* 最近見たスポット */}
      <RecentlyViewedSpots />

      {/* LINE登録バナー */}
      <section className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </section>
    </div>
  );
}
