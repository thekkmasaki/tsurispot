import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Store,
  Sparkles,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { tackleShops, getShopBySlug } from "@/lib/data/shops";
import { getSpotBySlug } from "@/lib/data/spots";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LiveBaitStock } from "@/components/shops/live-bait-stock";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return tackleShops.map((shop) => ({ slug: shop.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const shop = getShopBySlug(slug);
  if (!shop) return { title: "釣具店が見つかりません" };

  return {
    title: `${shop.name} - 釣具店情報`,
    description: `${shop.name}（${shop.address}）の営業時間・エサ在庫・サービス情報。${shop.description}`,
    ...(slug === "sample-premium" ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: `https://tsurispot.com/shops/${slug}`,
    },
    openGraph: {
      title: `${shop.name} - 釣具店情報`,
      description: shop.description,
      url: `https://tsurispot.com/shops/${slug}`,
      siteName: "ツリスポ",
    },
  };
}

export default async function ShopDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const shop = getShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  // LocalBusiness JSON-LD
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": shop.name,
    "description": shop.description,
    "url": `https://tsurispot.com/shops/${slug}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": shop.address,
      "addressLocality": shop.region.areaName,
      "addressRegion": shop.region.prefecture,
      "addressCountry": "JP",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": shop.latitude,
      "longitude": shop.longitude,
    },
    ...(shop.phone ? { "telephone": shop.phone } : {}),
    ...(shop.website ? { "sameAs": shop.website } : {}),
    "image": shop.imageUrl
      ? `https://tsurispot.com${shop.imageUrl}`
      : "https://tsurispot.com/logo.svg",
    "openingHours": shop.businessHours,
    ...(shop.rating
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": shop.rating,
            "bestRating": 5,
            "worstRating": 1,
            "reviewCount": 1,
          },
        }
      : {}),
  };

  // サンプル店舗はJSON-LDを出力しない（偽データの構造化データ防止）
  const shouldOutputJsonLd = slug !== "sample-premium";

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "ホーム",
        "item": "https://tsurispot.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "釣具店・エサ店ガイド",
        "item": "https://tsurispot.com/shops",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": shop.name,
        "item": `https://tsurispot.com/shops/${slug}`,
      },
    ],
  };

  // Resolve nearby spots
  const nearbySpots = shop.nearbySpotSlugs
    .map((s) => getSpotBySlug(s))
    .filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {shouldOutputJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣具店・エサ店ガイド", href: "/shops" },
          { label: shop.name },
        ]}
      />

      {/* Back link */}
      <Link
        href="/shops"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        釣具店一覧に戻る
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-2">
          <Store className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{shop.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{shop.address}</span>
            </div>
          </div>
        </div>
        {shop.isPremium && (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
            プレミアム掲載店
          </Badge>
        )}
        {shop.rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-semibold">{shop.rating}</span>
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-base leading-relaxed mb-6">{shop.description}</p>

      {/* プレミアム: 店主からのメッセージ */}
      {shop.isPremium && shop.ownerMessage && (
        <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg">💬</span>
              店主からのメッセージ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{shop.ownerMessage}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">{shop.address}</span>
            </div>
            {shop.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{shop.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="text-sm">
                <div>営業時間: {shop.businessHours}</div>
                <div className="text-muted-foreground">
                  定休日: {shop.closedDays}
                </div>
              </div>
            </div>
            {shop.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <a
                  href={shop.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  公式サイト
                </a>
              </div>
            )}
            <Separator />
            <div className="flex flex-wrap gap-2">
              {shop.hasLiveBait && <Badge variant="default" className="bg-green-600">活きエサあり</Badge>}
              {shop.hasFrozenBait && <Badge variant="default" className="bg-blue-600">冷凍エサあり</Badge>}
              {shop.hasRentalRod && <Badge variant="default">レンタルロッドあり</Badge>}
              {shop.hasParking && <Badge variant="outline">駐車場あり</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Services Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">サービス</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {shop.services.map((service) => (
                <li key={service} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {service}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Bait Stock Card — プレミアムはリアルタイム、それ以外は静的 */}
        {shop.isPremium && shop.baitStock && shop.baitStock.length > 0 ? (
          <LiveBaitStock shopSlug={shop.slug} fallbackStock={shop.baitStock} />
        ) : (
          shop.baitStock && shop.baitStock.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">エサ在庫状況</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shop.baitStock.map((bait) => (
                    <div
                      key={bait.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {bait.available ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span>{bait.name}</span>
                      </div>
                      <div className="text-right text-muted-foreground">
                        {bait.price && <span>{bait.price}</span>}
                        {bait.updatedAt && (
                          <span className="ml-2 text-xs">
                            ({bait.updatedAt}更新)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Nearby Spots Card */}
        {nearbySpots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">近くの釣りスポット</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {nearbySpots.map(
                  (spot) =>
                    spot && (
                      <li key={spot.slug}>
                        <Link
                          href={`/spots/${spot.slug}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {spot.name}（{spot.region.prefecture}）
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Google Map Embed */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">アクセス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps?q=${shop.latitude},${shop.longitude}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`${shop.name}の地図`}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 掲載案内CTA（プレミアム店には非表示） */}
      {!shop.isPremium && <div className="mt-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              このページの情報を充実させませんか？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-relaxed">
              店舗オーナーの方へ ― ツリスポでは無料で店舗基本情報を掲載しています。有料プランなら集客に役立つ機能をご利用いただけます。
            </p>

            {/* 3段階プラン */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* 無料プラン */}
              <div className="rounded-lg border bg-background p-3">
                <p className="text-sm font-bold text-green-700">無料プラン</p>
                <p className="text-lg font-bold">¥0</p>
                <ul className="mt-2 space-y-1">
                  {["基本情報の掲載", "近くの釣りスポットと連携", "Google検索への配信", "エサ在庫更新（1日10回）"].map((t) => (
                    <li key={t} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle className="mt-0.5 size-3 shrink-0 text-green-500" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* ベーシックプラン */}
              <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                <p className="text-sm font-bold text-blue-600">ベーシック</p>
                <p className="text-lg font-bold">¥500<span className="text-xs font-normal text-muted-foreground">/月</span></p>
                <ul className="mt-2 space-y-1">
                  {["無料プランの全機能", "検索結果での優先表示", "写真3枚まで掲載", "簡易アクセス解析", "公式バッジ表示"].map((t) => (
                    <li key={t} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle className="mt-0.5 size-3 shrink-0 text-blue-500" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* プロプラン */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                <p className="text-sm font-bold text-amber-600">プロ</p>
                <p className="text-lg font-bold">¥2,980<span className="text-xs font-normal text-muted-foreground">/月</span></p>
                <ul className="mt-2 space-y-1">
                  {["ベーシックの全機能", "写真無制限・店主メッセージ", "詳細アクセス解析", "クーポン配信機能", "スポットページでの商品PR"].map((t) => (
                    <li key={t} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle className="mt-0.5 size-3 shrink-0 text-amber-500" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <Link
                href="/shops/update?shop=sample-premium&token=demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
              >
                エサ在庫管理のデモを試す
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shops/sample-premium"
                className="inline-flex items-center justify-center gap-1 text-sm text-primary hover:underline"
              >
                プレミアムページのサンプルを見る
                <ChevronRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-sm pt-1">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">お問い合わせ:</span>
                <a
                  href="mailto:fishingspotjapan@gmail.com"
                  className="text-primary hover:underline"
                >
                  fishingspotjapan@gmail.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>}
    </div>
  );
}
