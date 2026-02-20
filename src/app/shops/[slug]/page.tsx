import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tackleShops, getShopBySlug, getShopsForSpot } from "@/lib/data/shops";
import { getSpotBySlug } from "@/lib/data/spots";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Phone,
  Clock,
  Globe,
  Star,
  ArrowLeft,
  Store,
  Package,
  ChevronRight,
} from "lucide-react";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return tackleShops.map((shop) => ({ slug: shop.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) return { title: "店舗が見つかりません" };

  return {
    title: `${shop.name} - 釣具店情報`,
    description: `${shop.name}（${shop.address}）の営業時間・エサ在庫・取扱サービス情報。${shop.hasLiveBait ? "活きエサ取扱あり。" : ""}${shop.hasRentalRod ? "レンタル竿あり。" : ""}`,
    openGraph: {
      title: `${shop.name} - 釣具店情報 | ツリスポ`,
      description: shop.description,
      type: "website",
      url: `https://tsurispot.com/shops/${shop.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/shops/${shop.slug}`,
    },
  };
}

export default async function ShopDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) notFound();

  const nearbySpots = shop.nearbySpotSlugs
    .map((s) => getSpotBySlug(s))
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: shop.name,
    description: shop.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address,
      addressRegion: shop.region.prefecture,
      addressCountry: "JP",
    },
    telephone: shop.phone,
    ...(shop.website && { url: shop.website }),
    openingHours: shop.businessHours,
    geo: {
      "@type": "GeoCoordinates",
      latitude: shop.latitude,
      longitude: shop.longitude,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: shop.rating,
      bestRating: 5,
    },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/shops"
        className="mb-5 inline-flex min-h-[44px] items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        釣具店一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {shop.isPremium && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-500">
              プレミアム掲載
            </Badge>
          )}
          <Badge variant="secondary">
            <Store className="mr-1 size-3" />
            釣具店
          </Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {shop.name}
        </h1>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          <span>{shop.region.prefecture} {shop.region.areaName}</span>
          <div className="flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{shop.rating}</span>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {shop.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* メインコンテンツ */}
        <div className="space-y-6 md:col-span-2">
          {/* エサ在庫情報 */}
          {shop.baitStock && shop.baitStock.length > 0 && (
            <Card className="gap-0 py-0">
              <CardContent className="p-5">
                <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
                  <Package className="size-5 text-primary" />
                  エサ在庫情報
                </h2>
                <div className="space-y-2">
                  {shop.baitStock.map((bait) => (
                    <div
                      key={bait.name}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-3 rounded-full ${
                            bait.available ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                        />
                        <span className="text-sm font-medium">{bait.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {bait.price && (
                          <span className="text-sm text-muted-foreground">
                            {bait.price}
                          </span>
                        )}
                        <Badge
                          variant={bait.available ? "default" : "secondary"}
                          className={
                            bait.available
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : ""
                          }
                        >
                          {bait.available ? "在庫あり" : "在庫なし"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  ※ 在庫状況は変動します。最新情報はお電話でご確認ください。
                  {shop.baitStock[0]?.updatedAt && (
                    <span>（最終更新: {shop.baitStock[0].updatedAt}）</span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 取扱サービス */}
          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-bold">取扱サービス</h2>
              <div className="flex flex-wrap gap-2">
                {shop.hasLiveBait && (
                  <Badge variant="outline" className="px-3 py-1.5">
                    🪱 活きエサ取扱
                  </Badge>
                )}
                {shop.hasFrozenBait && (
                  <Badge variant="outline" className="px-3 py-1.5">
                    🧊 冷凍エサ取扱
                  </Badge>
                )}
                {shop.hasRentalRod && (
                  <Badge variant="outline" className="px-3 py-1.5">
                    🎣 レンタル竿あり
                  </Badge>
                )}
                {shop.services.map((service) => (
                  <Badge key={service} variant="secondary" className="px-3 py-1.5">
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 近くの釣りスポット */}
          {nearbySpots.length > 0 && (
            <section>
              <h2 className="mb-3 text-base font-bold">近くの釣りスポット</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {nearbySpots.map((spot) => spot && (
                  <Link key={spot.id} href={`/spots/${spot.slug}`}>
                    <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <h3 className="truncate font-semibold group-hover:text-primary">
                          {spot.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {spot.region.prefecture} {spot.region.areaName}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span>{spot.rating}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* サイドバー: 店舗基本情報 */}
        <div className="space-y-4">
          <Card className="gap-0 py-0">
            <CardContent className="p-5">
              <h2 className="mb-4 text-base font-bold">店舗情報</h2>
              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`tel:${shop.phone}`}
                    className="text-primary hover:underline"
                  >
                    {shop.phone}
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p>{shop.businessHours}</p>
                    <p className="text-muted-foreground">定休日: {shop.closedDays}</p>
                  </div>
                </div>
                {shop.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      公式サイト
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
