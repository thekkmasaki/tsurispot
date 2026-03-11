import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Store,
  Sparkles,
  Mail,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { tackleShops, getShopBySlug } from "@/lib/data/shops";
import { getSpotBySlug } from "@/lib/data/spots";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { LiveBaitStock } from "@/components/shops/live-bait-stock";
import { ShopInfoLive } from "@/components/shops/shop-info-live";
import { ShopPhotoGallery } from "@/components/shops/shop-photo-gallery";
import { ShopListingForm } from "@/components/shops/shop-listing-form";
import { PaidPlanInquiry } from "@/components/shops/paid-plan-inquiry";

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

  const isSample = slug === "sample-premium" || slug === "sample-basic" || slug === "sample-free";

  return {
    title: `${shop.name} - 釣具店情報`,
    description: `${shop.name}（${shop.address}）の営業時間・エサ在庫・サービス情報。${shop.description}`,
    ...(isSample ? { robots: { index: false, follow: false } } : {}),
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

  const isSample = slug === "sample-premium" || slug === "sample-basic" || slug === "sample-free";
  const planLevel = shop.planLevel || "free";
  const isBasic = planLevel === "basic";
  const isPro = planLevel === "pro";
  const isPaid = isBasic || isPro;

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

  const shouldOutputJsonLd = !isSample;

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
        {/* プランバッジ */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {isPro && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
              プロ掲載店
            </Badge>
          )}
          {isBasic && (
            <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
              公式掲載店
            </Badge>
          )}
          {isSample && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {slug === "sample-free" ? "無料プラン" : isPro ? "プロプラン ¥2,980/月" : "ベーシックプラン ¥500/月"} サンプル
            </Badge>
          )}
        </div>
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

      {/* ベーシック: 店主メッセージの代わりにアップグレード案内 */}
      {isBasic && isSample && (
        <Card className="mb-6 border-dashed border-muted-foreground/30 bg-muted/20">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              💬 <strong>プロプラン</strong>にアップグレードすると、ここに店主からのメッセージを掲載できます。
              <Link href="/shops/sample-premium" className="ml-1 text-primary hover:underline">プロプランのサンプルを見る →</Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* 写真ギャラリー（ベーシック以上） */}
      {isPaid && (
        <ShopPhotoGallery
          shopSlug={shop.slug}
          isPro={isPro}
          isBasic={isBasic}
          staticPhotos={shop.photos}
        />
      )}

      {/* プロ限定: クーポン */}
      {isPro && shop.coupon && (
        <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-600" />
              クーポン
              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300">プロ限定</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border-2 border-dashed border-amber-300 bg-white dark:bg-background p-4 text-center">
              <p className="text-lg font-bold text-amber-700">{shop.coupon.title}</p>
              <p className="mt-1 text-sm">{shop.coupon.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">有効期限: {shop.coupon.validUntil}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ベーシック: クーポン枠の案内 */}
      {isBasic && isSample && (
        <Card className="mb-6 border-dashed border-muted-foreground/30 bg-muted/20">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground text-center">
              🏷️ <strong>プロプラン</strong>にアップグレードすると、クーポンを配信できます。
              <Link href="/shops/sample-premium" className="ml-1 text-primary hover:underline">プロプランのサンプルを見る →</Link>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本情報 + サービス（Redisオーバーライド対応） */}
        <ShopInfoLive
          shopSlug={shop.slug}
          address={shop.address}
          phone={shop.phone}
          businessHours={shop.businessHours}
          closedDays={shop.closedDays}
          website={shop.website}
          parkingDetail={shop.parkingDetail}
          hasParking={shop.hasParking}
          services={shop.services}
          isPro={isPro}
          ownerMessage={shop.ownerMessage}
        />

        {/* Bait Stock Card — プロはリアルタイム、それ以外は静的 */}
        {isPro && shop.baitStock && shop.baitStock.length > 0 ? (
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

      {/* サンプル: プラン比較表 */}
      {isSample && (
        <div className="mt-8">
          <Card className={isPro ? "border-amber-200 bg-gradient-to-br from-amber-50/30 to-transparent" : isBasic ? "border-blue-200 bg-gradient-to-br from-blue-50/30 to-transparent" : "border-gray-200 bg-gradient-to-br from-gray-50/30 to-transparent"}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${isPro ? "text-amber-500" : isBasic ? "text-blue-500" : "text-gray-500"}`} />
                {isPro ? "このページはプロプランのサンプルです" : isBasic ? "このページはベーシックプランのサンプルです" : "このページは無料プランのサンプルです"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 機能比較表 */}
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 pl-4 pr-4 font-bold">機能</th>
                      <th className="text-center py-3 px-3 bg-green-50 dark:bg-green-950/20">
                        <span className="font-bold text-green-700">無料</span><br />
                        <span className="text-xs font-bold text-green-600">¥0</span>
                      </th>
                      <th className={`text-center py-3 px-3 ${isBasic ? "bg-blue-100 dark:bg-blue-950/30" : "bg-blue-50 dark:bg-blue-950/20"}`}>
                        <span className="font-bold text-blue-700">ベーシック</span><br />
                        <span className="text-xs font-normal">¥500/月</span><br />
                        <span className="text-[9px] text-muted-foreground">2年目〜¥980</span><br />
                        <span className="text-[10px] font-bold text-red-600">3ヶ月無料</span>
                      </th>
                      <th className={`text-center py-3 px-3 ${isPro ? "bg-amber-100 dark:bg-amber-950/30" : "bg-amber-50 dark:bg-amber-950/20"}`}>
                        <span className="font-bold text-amber-700">プロ</span><br />
                        <span className="text-xs font-normal">¥1,980/月</span><br />
                        <span className="text-[9px] text-muted-foreground">2年目〜¥2,980</span><br />
                        <span className="text-[10px] font-bold text-red-600">3ヶ月無料</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { feature: "基本情報の掲載", free: true, basic: true, pro: true },
                      { feature: "近くの釣りスポットと連携", free: true, basic: true, pro: true, highlight: true, note: "2,100+スポットの詳細ページからお店を直接案内" },
                      { feature: "Google検索への配信", free: true, basic: true, pro: true },
                      { feature: "エサ在庫更新", free: "1日10回", basic: "1日10回", pro: "1日50回" },
                      { feature: "公式バッジ表示", free: false, basic: true, pro: true },
                      { feature: "検索結果の優先表示", free: false, basic: true, pro: true },
                      { feature: "店舗写真の掲載", free: false, basic: "3枚まで", pro: "20枚まで" },
                      { feature: "アクセス解析", free: false, basic: false, pro: "詳細" },
                      { feature: "店主からのメッセージ", free: false, basic: false, pro: true },
                      { feature: "クーポン配信", free: false, basic: false, pro: true },
                      { feature: "スポットページでの商品PR", free: false, basic: false, pro: true },
                      { feature: "Googleビジネスプロフィール初期設定サポート", free: false, basic: false, pro: true },
                    ].map((row, i) => (
                      <tr key={row.feature} className={`border-b last:border-0 ${row.highlight ? "bg-primary/5 dark:bg-primary/10" : i % 2 === 0 ? "bg-muted/20" : ""}`}>
                        <td className={`py-2.5 pl-4 pr-4 ${row.highlight ? "font-bold text-primary" : "font-medium"}`}>
                          {row.feature}
                          {row.note && <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">{row.note}</span>}
                        </td>
                        <td className="text-center py-2.5 px-3">{renderCell(row.free)}</td>
                        <td className={`text-center py-2.5 px-3 ${isBasic ? "bg-blue-50/70 dark:bg-blue-950/10" : ""}`}>{renderCell(row.basic)}</td>
                        <td className={`text-center py-2.5 px-3 ${isPro ? "bg-amber-50/70 dark:bg-amber-950/10" : ""}`}>{renderCell(row.pro)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* サンプル間のリンク */}
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                {!isPro && (
                  <Link
                    href="/shops/sample-premium"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
                  >
                    プロプランのサンプルを見る
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
                {!isBasic && (
                  <Link
                    href="/shops/sample-basic"
                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-300 px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    ベーシックプランのサンプルを見る
                  </Link>
                )}
                {(isBasic || isPro) && (
                  <Link
                    href="/shops/sample-free"
                    className="inline-flex items-center justify-center gap-1 rounded-lg border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                  >
                    無料プランのサンプルを見る
                  </Link>
                )}
                <Link
                  href="/shops/update?shop=sample-premium&token=demo"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  店舗管理のデモを試す
                </Link>
              </div>

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
            </CardContent>
          </Card>
        </div>
      )}

      {/* 無料プランサンプル: 掲載申し込みフォーム */}
      {isSample && slug === "sample-free" && (
        <div className="mt-8 space-y-4">
          <ShopListingForm />
          <div className="text-center">
            <Link
              href="/shops/update?shop=sample-free&token=demo"
              className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              エサ在庫管理のデモを試す
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ベーシックプランサンプル: 問い合わせフォーム */}
      {isSample && slug === "sample-basic" && (
        <div className="mt-8">
          <PaidPlanInquiry plan="basic" />
        </div>
      )}

      {/* プロプランサンプル: 問い合わせフォーム */}
      {isSample && slug === "sample-premium" && (
        <div className="mt-8">
          <PaidPlanInquiry plan="pro" />
        </div>
      )}

      {/* オーナー向けCTA（サンプル以外の全店舗ページに表示） */}
      {!isSample && (
        <div className="mt-8 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-5 dark:border-blue-800 dark:bg-blue-950/20">
          <div className="flex items-start gap-3">
            <Store className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-bold text-blue-800 dark:text-blue-300">
                このお店のオーナー様ですか？
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                ツリスポに<strong>無料で</strong>店舗情報を掲載・管理できます。エサの在庫状況をリアルタイム公開すれば、お客様からの「エサある？」の電話対応を減らせます。
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={`mailto:fishingspotjapan@gmail.com?subject=店舗管理について&body=店舗名：${encodeURIComponent(shop.name)}%0A%0Aツリスポでの店舗情報の管理を希望します。`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  無料で店舗を管理する
                </a>
                <Link
                  href="/partner"
                  className="inline-flex items-center gap-1 rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors dark:text-blue-400 dark:hover:bg-blue-950/30"
                >
                  詳しく見る
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 無料掲載CTA（サンプル以外の全店舗ページに表示） */}
      {!isSample && (
        <div className="mt-8 space-y-4">
          <ShopListingForm />

          {/* プラン比較 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">プラン比較</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col rounded-lg border bg-background p-3">
                  <p className="text-sm font-bold text-green-700">無料プラン</p>
                  <p className="text-lg font-bold">¥0<span className="text-xs font-bold text-green-600 ml-1">永久無料</span></p>
                  <ul className="mt-2 flex-1 space-y-1">
                    {["基本情報の掲載", "近くの釣りスポットと連携", "Google検索への配信", "エサ在庫更新（1日10回）"].map((t) => (
                      <li key={t} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle className="mt-0.5 size-3 shrink-0 text-green-500" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/shops/sample-free" className="mt-3 flex items-center justify-center gap-1 rounded-md border border-green-300 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 transition-colors hover:bg-green-100 dark:bg-green-950/30 dark:border-green-800">
                    <ChevronRight className="size-3" />
                    デモページを見る
                  </Link>
                </div>
                <div className="flex flex-col rounded-lg border border-blue-200 bg-blue-50/50 p-3 dark:bg-blue-950/20">
                  <p className="text-sm font-bold text-blue-600">ベーシック</p>
                  <p className="text-lg font-bold">¥500<span className="text-xs font-normal text-muted-foreground">/月</span></p>
                  <p className="text-[10px] text-muted-foreground">初年度特別価格（2年目〜¥980/月）</p>
                  <p className="text-xs font-bold text-red-600">今なら3ヶ月無料！</p>
                  <ul className="mt-2 flex-1 space-y-1">
                    {["無料プランの全機能", "検索結果での優先表示", "写真3枚まで掲載", "公式バッジ表示"].map((t) => (
                      <li key={t} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle className="mt-0.5 size-3 shrink-0 text-blue-500" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/shops/sample-basic" className="mt-3 flex items-center justify-center gap-1 rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800">
                    <ChevronRight className="size-3" />
                    デモページを見る
                  </Link>
                </div>
                <div className="flex flex-col rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:bg-amber-950/20">
                  <p className="text-sm font-bold text-amber-600">プロ</p>
                  <p className="text-lg font-bold">¥1,980<span className="text-xs font-normal text-muted-foreground">/月</span></p>
                  <p className="text-[10px] text-muted-foreground">初年度特別価格（2年目〜¥2,980/月）</p>
                  <p className="text-xs font-bold text-red-600">今なら3ヶ月無料！</p>
                  <ul className="mt-2 flex-1 space-y-1">
                    {["ベーシックの全機能", "写真20枚・店主メッセージ", "詳細アクセス解析", "クーポン配信機能", "Googleビジネスプロフィール設定サポート"].map((t) => (
                      <li key={t} className="flex items-start gap-1.5 text-xs">
                        <CheckCircle className="mt-0.5 size-3 shrink-0 text-amber-500" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/shops/sample-premium" className="mt-3 flex items-center justify-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800">
                    <ChevronRight className="size-3" />
                    デモページを見る
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link
              href="/shops/update?shop=sample-premium&token=demo"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              エサ在庫管理のデモを試す
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** 比較表のセル描画 */
function renderCell(value: boolean | string) {
  if (value === true) return <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />;
  if (value === false) return <span className="text-muted-foreground">—</span>;
  return <span>{value}</span>;
}
