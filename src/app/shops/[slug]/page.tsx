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
  CheckCircle,
  XCircle,
  Store,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { tackleShops, getShopBySlug } from "@/lib/data/shops";
import { getSpotBySlug } from "@/lib/data/spots";
import { Breadcrumb } from "@/components/ui/breadcrumb";

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
    title: `${shop.name} - 釣具店情報 | ツリスポ`,
    description: `${shop.name}（${shop.address}）の営業時間・エサ在庫・サービス情報。${shop.description}`,
    openGraph: {
      title: `${shop.name} - 釣具店情報`,
      description: shop.description,
      url: `https://tsurispot.com/shops/${slug}`,
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
          },
        }
      : {}),
  };

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
        "name": "釣具店",
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣具店", href: "/shops" },
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
              <Badge variant={shop.hasLiveBait ? "default" : "outline"}>
                {shop.hasLiveBait ? "活きエサあり" : "活きエサなし"}
              </Badge>
              <Badge variant={shop.hasFrozenBait ? "default" : "outline"}>
                {shop.hasFrozenBait ? "冷凍エサあり" : "冷凍エサなし"}
              </Badge>
              <Badge variant={shop.hasRentalRod ? "default" : "outline"}>
                {shop.hasRentalRod ? "レンタルロッドあり" : "レンタルなし"}
              </Badge>
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

        {/* Bait Stock Card */}
        {shop.baitStock && shop.baitStock.length > 0 && (
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
    </div>
  );
}
