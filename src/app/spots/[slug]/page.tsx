import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Star,
  MapPin,
  Car,
  Clock,
  ChevronLeft,
  Fish,
  Compass,
  Wrench,
  Play,
  ExternalLink,
  Toilet,
  Store,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fishingSpots, getSpotBySlug, getNearbySpots } from "@/lib/data/spots";
import { getShopsForSpot } from "@/lib/data/shops";
import { SeasonCalendar } from "@/components/spots/season-calendar";
import { BestTime } from "@/components/spots/best-time";
import { TackleCard } from "@/components/spots/tackle-card";
import { TideMazumeInfo } from "@/components/spots/tide-mazume-info";
import { GearGuideList } from "@/components/spots/gear-guide";
import { SafetyWarning } from "@/components/spots/safety-warning";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import {
  SPOT_TYPE_LABELS,
  DIFFICULTY_LABELS,
} from "@/types";
import { SpotImage } from "@/components/ui/spot-image";
import { CrowdPredictionCard } from "@/components/spots/crowd-prediction";

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
  return {
    title: `${spot.name}の釣り場情報 - ${spot.region.prefecture}${spot.region.areaName}の釣りスポット`,
    description: `${spot.name}（${spot.region.prefecture}${spot.region.areaName}）の釣り場情報。${fishNames}が狙えます。料金・駐車場・アクセス方法、ベストな時間帯やおすすめタックルまで初心者に必要な情報を掲載。`,
    openGraph: {
      title: `${spot.name}の釣り場情報`,
      description: `${spot.name}（${spot.region.prefecture}${spot.region.areaName}）で${fishNames}が狙えます。${spot.description}`,
      type: "article",
      url: `https://tsurispot.com/spots/${spot.slug}`,
      siteName: "ツリスポ",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: spot.name,
    description: spot.description,
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: spot.rating,
      reviewCount: spot.reviewCount,
      bestRating: 5,
    },
    isAccessibleForFree: spot.isFree,
    publicAccess: true,
  };

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
      {
        "@type": "ListItem",
        position: 3,
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
        name: `${spot.name}は初心者でも楽しめますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: difficultyAnswer,
        },
      },
    ],
  };

  // Get nearby spots for internal linking
  const nearbySpots = getNearbySpots(spot.latitude, spot.longitude, 6).filter(
    (s) => s.id !== spot.id
  ).slice(0, 5);

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
      {/* Back link */}
      <Link
        href="/spots"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        スポット一覧に戻る
      </Link>

      {/* Header section */}
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">{spot.name}</h1>
          {spot.difficulty === "beginner" && (
            <Badge className="bg-green-600 hover:bg-green-600">
              初心者OK
            </Badge>
          )}
          {spot.isFree && (
            <Badge className="bg-orange-500 hover:bg-orange-500">無料</Badge>
          )}
          <Badge variant="outline">
            {SPOT_TYPE_LABELS[spot.spotType]}
          </Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-foreground">
              {spot.rating.toFixed(1)}
            </span>
            <span>({spot.reviewCount}件)</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="size-4" />
            <span>
              {spot.region.prefecture} {spot.region.areaName}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {spot.description}
        </p>
      </div>

      {/* Photo area */}
      <div className="mb-6 overflow-hidden rounded-xl sm:mb-8">
        <SpotImage
          src={spot.mainImageUrl}
          alt={spot.name}
          spotType={spot.spotType}
          height="h-48 sm:h-56 md:h-72"
          latitude={spot.latitude}
          longitude={spot.longitude}
        />
      </div>

      {/* 安全警告（危険・注意の場合はヘッダー直下に目立つように表示） */}
      {(spot.safetyLevel === "caution" || spot.safetyLevel === "danger") && (
        <div className="mb-8">
          <SafetyWarning
            level={spot.safetyLevel}
            notes={spot.safetyNotes}
            isKuchikomi={spot.isKuchikomiSpot}
          />
        </div>
      )}

      {/* 口コミスポット（安全な場合は小さく表示） */}
      {spot.isKuchikomiSpot && spot.safetyLevel === "safe" && (
        <div className="mb-8">
          <SafetyWarning
            level="safe"
            notes={spot.safetyNotes}
            isKuchikomi={true}
          />
        </div>
      )}

      {/* Two column layout */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: Main content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Catchable fish - Season calendar */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold sm:mb-4">
              <Fish className="size-5" />
              今釣れる魚 - シーズンカレンダー
            </h2>
            {spot.catchableFish.length > 0 ? (
              <Card className="py-3 sm:py-4">
                <CardContent className="px-3 sm:px-4 overflow-x-auto scrollbar-hide">
                  <div className="min-w-[480px]">
                    <SeasonCalendar catchableFish={spot.catchableFish} />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">
                釣れる魚の情報はまだ登録されていません。
              </p>
            )}

            {/* Fish details list */}
            {spot.catchableFish.length > 0 && (
              <div className="mt-3 space-y-2 sm:mt-4">
                {spot.catchableFish.map((cf) => (
                  <div
                    key={cf.fish.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="font-medium shrink-0">{cf.fish.name}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {cf.method}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 sm:text-sm">
                      <span>{cf.recommendedTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Best time */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Clock className="size-5" />
              ベストタイム
            </h2>
            <BestTime bestTimes={spot.bestTimes} />
          </section>

          {/* マヅメ・潮汐情報 */}
          {(spot.mazumeInfo || spot.tideAdvice) && (
            <>
              <Separator />
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Compass className="size-5" />
                  マヅメ・潮汐ガイド
                </h2>
                <TideMazumeInfo
                  tideAdvice={spot.tideAdvice}
                  mazumeInfo={spot.mazumeInfo}
                />
              </section>
            </>
          )}

          {/* 初心者向け装備ガイド */}
          {spot.gearGuides && spot.gearGuides.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Wrench className="size-5" />
                  初心者向け装備ガイド
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  このスポットでの釣りに必要な道具をわかりやすくまとめました。
                </p>
                <GearGuideList guides={spot.gearGuides} />
              </section>
            </>
          )}

          {/* YouTube 参考動画 */}
          {spot.youtubeLinks && spot.youtubeLinks.length > 0 && (
            <>
              <Separator />
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <Play className="size-5" />
                  参考動画
                </h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  このスポットでの釣りの様子がわかるYouTube動画です。
                </p>
                <YouTubeVideoList links={spot.youtubeLinks} />
              </section>
            </>
          )}

          <Separator />

          {/* Basic info */}
          <section>
            <h2 className="mb-4 text-lg font-bold">基本情報</h2>
            <Card className="py-4">
              <CardContent className="px-4">
                <dl className="space-y-3 text-sm">
                  {spot.feeDetail && (
                    <div className="flex gap-4">
                      <dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">
                        料金
                      </dt>
                      <dd>{spot.feeDetail}</dd>
                    </div>
                  )}
                  {spot.isFree && (
                    <div className="flex gap-4">
                      <dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">
                        料金
                      </dt>
                      <dd className="font-medium text-orange-600">無料</dd>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">
                      難易度
                    </dt>
                    <dd>{DIFFICULTY_LABELS[spot.difficulty]}</dd>
                  </div>
                  <div className="flex gap-4">
                    <dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">
                      タイプ
                    </dt>
                    <dd>{SPOT_TYPE_LABELS[spot.spotType]}</dd>
                  </div>
                  {spot.rentalDetail && (
                    <div className="flex gap-4">
                      <dt className="w-20 shrink-0 font-medium text-muted-foreground sm:w-24">
                        レンタル
                      </dt>
                      <dd>{spot.rentalDetail}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-6 sm:space-y-8">
          {/* Recommended tackle */}
          {spot.tackleRecommendations.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold">おすすめタックル</h2>
              <div className="space-y-4">
                {spot.tackleRecommendations.map((tackle) => (
                  <TackleCard key={tackle.id} tackle={tackle} />
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。
              </p>
            </section>
          )}

          {/* Access info */}
          <section>
            <h2 className="mb-4 text-lg font-bold">アクセス情報</h2>
            <Card className="py-4">
              <CardHeader className="px-4 pb-0 pt-0">
                <CardTitle className="text-base">
                  <MapPin className="mr-1 inline size-4" />
                  所在地
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <div>
                  <p className="text-sm">{spot.address}</p>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline min-h-[36px]"
                  >
                    <ExternalLink className="size-3.5" />
                    Google Mapsでルートを見る
                  </a>
                </div>

                <Separator />

                <div>
                  <h4 className="mb-1 text-sm font-medium">
                    <Car className="mr-1 inline size-4" />
                    アクセス方法
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {spot.accessInfo}
                  </p>
                </div>

                <Separator />

                {/* Facilities */}
                <div>
                  <h4 className="mb-2 text-sm font-medium">設備</h4>
                  <div className="flex flex-wrap gap-2">
                    {spot.hasParking && (
                      <Badge variant="outline" className="text-xs">
                        <Car className="size-3.5 mr-1" />
                        駐車場{spot.parkingDetail ? `（${spot.parkingDetail}）` : ""}
                      </Badge>
                    )}
                    {spot.hasToilet && (
                      <Badge variant="outline" className="text-xs">
                        <Toilet className="size-3.5 mr-1" />
                        トイレ
                      </Badge>
                    )}
                    {spot.hasFishingShop && (
                      <Badge variant="outline" className="text-xs">
                        <Store className="size-3.5 mr-1" />
                        釣具店
                      </Badge>
                    )}
                    {spot.hasRentalRod && (
                      <Badge variant="outline" className="text-xs">
                        <Wrench className="size-3.5 mr-1" />
                        レンタル竿
                      </Badge>
                    )}
                    {spot.hasConvenienceStore && (
                      <Badge variant="outline" className="text-xs">
                        <ShoppingBag className="size-3.5 mr-1" />
                        コンビニ近く
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      {/* 混雑予想 */}
      <section className="mt-8 sm:mt-12">
        <CrowdPredictionCard
          rating={spot.rating}
          isFree={spot.isFree}
          difficulty={spot.difficulty}
          prefecture={spot.region.prefecture}
          hasParking={spot.hasParking}
          reviewCount={spot.reviewCount}
        />
      </section>

      {/* 近くの釣具店 */}
      {nearbyShops.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">近くの釣具店</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyShops.map((shop) => (
              <Link key={shop.id} href={`/shops/${shop.slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <h3 className="truncate font-semibold group-hover:text-primary">
                      {shop.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {shop.businessHours}（定休: {shop.closedDays}）
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {shop.hasLiveBait && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">活きエサ</Badge>
                      )}
                      {shop.hasFrozenBait && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">冷凍エサ</Badge>
                      )}
                      {shop.hasRentalRod && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">レンタル竿</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 近くの釣りスポット（内部リンク強化） */}
      {nearbySpots.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">近くの釣りスポット</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearbySpots.map((nearSpot) => (
              <Link key={nearSpot.id} href={`/spots/${nearSpot.slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <h3 className="truncate font-semibold group-hover:text-primary">
                      {nearSpot.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {nearSpot.region.prefecture} {nearSpot.region.areaName}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {SPOT_TYPE_LABELS[nearSpot.spotType]}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span>{nearSpot.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* この釣り場で釣れる魚（内部リンク強化） */}
      {spot.catchableFish.length > 0 && (
        <section className="mt-6 sm:mt-8">
          <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">この釣り場で狙える魚の詳細</h2>
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
    </div>
  );
}
