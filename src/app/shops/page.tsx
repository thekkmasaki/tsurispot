import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  ChevronRight,
  Mail,
  CheckCircle,
  Sparkles,
  Calendar,
  Fish,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { tackleShops } from "@/lib/data/shops";
import { ShopsFilterList } from "@/components/shops/shops-filter-list";
import { getMonthlyGuideByMonth, monthSlugs } from "@/lib/data/monthly-guides";
import { fishSpecies } from "@/lib/data/fish";
import {
  prefectures,
  getPrefecturesByRegionGroup,
  regionGroupOrder,
} from "@/lib/data/prefectures";

const filteredShops = tackleShops.filter((s) => s.slug !== "sample-premium" && s.slug !== "sample-basic");
const shopCount = filteredShops.length;

export const metadata: Metadata = {
  title: "釣具店・エサ店ガイド｜全国の釣具店を探す",
  description: `全国${shopCount}件以上の釣具店・釣りエサ店を掲載。都道府県・サービス（活きエサ・冷凍エサ・レンタルロッド等）で絞り込み検索。営業時間・アクセス・エサ在庫情報も確認できます。`,
  openGraph: {
    title: "釣具店・エサ店ガイド｜全国の釣具店を探す",
    description: `全国${shopCount}件以上の釣具店・釣りエサ店を紹介。都道府県やサービスで絞り込み検索。`,
    type: "website",
    url: "https://tsurispot.com/shops",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/shops",
  },
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
      name: "釣具店・エサ店ガイド",
      item: "https://tsurispot.com/shops",
    },
  ],
};

// ItemList schema: プレミアム店舗を優先、上位20件をリスト化
const itemListShops = [
  ...filteredShops.filter((s) => s.isPremium),
  ...filteredShops.filter((s) => !s.isPremium),
].slice(0, 20);

const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "全国の釣具店・エサ店一覧",
  description: `全国${shopCount}件以上の釣具店・釣りエサ店を掲載。`,
  url: "https://tsurispot.com/shops",
  numberOfItems: shopCount,
  itemListElement: itemListShops.map((shop, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: shop.name,
    url: `https://tsurispot.com/shops/${shop.slug}`,
  })),
};

// Server ComponentでデータをシリアライズしてClient Componentに渡す
const shopsData = filteredShops
  .map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    address: s.address,
    phone: s.phone,
    businessHours: s.businessHours,
    hasLiveBait: s.hasLiveBait,
    hasFrozenBait: s.hasFrozenBait,
    hasRentalRod: s.hasRentalRod,
    hasParking: s.hasParking,
    parkingDetail: s.parkingDetail,
    services: s.services,
    isPremium: s.isPremium,
    region: s.region,
    latitude: s.latitude,
    longitude: s.longitude,
    closedDays: s.closedDays,
    website: s.website,
    baitStock: s.baitStock,
    nearbySpotSlugs: s.nearbySpotSlugs,
    imageUrl: s.imageUrl,
    rating: s.rating,
  }));

// 今月の釣りガイドデータ
const currentMonth = new Date().getMonth() + 1;
const currentGuide = getMonthlyGuideByMonth(currentMonth);
const currentMonthSlug = monthSlugs[currentMonth - 1];
const currentTopFish = currentGuide
  ? currentGuide.topFish
      .slice(0, 3)
      .map((slug) => fishSpecies.find((f) => f.slug === slug))
      .filter(Boolean)
  : [];

export default function ShopsListPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣具店・エサ店ガイド" },
        ]}
      />

      {/* ヘッダー */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Store className="size-8 text-primary" />
          <h1 className="text-2xl font-bold sm:text-3xl">
            釣具店・エサ店ガイド
          </h1>
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          全国{shopCount}件以上の釣具店・エサ店を掲載。釣り場の近くで装備を揃えよう。
        </p>
      </div>

      {/* フィルタ付き店舗一覧 */}
      <div className="mb-12">
        <ShopsFilterList shops={shopsData} />
      </div>

      {/* 掲載案内セクション */}
      <div className="mb-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="size-6 text-primary" />
              釣具店オーナーの皆さまへ ― ツリスポに掲載しませんか？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base leading-relaxed">
              ツリスポは全国{tackleShops.length}店舗以上が掲載中の釣り情報サイトです。
              <strong>初期費用0円・月額0円</strong>で貴店の情報を掲載して、地元の釣り人にアピールしませんか？
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* 無料掲載 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-700 dark:text-green-400">
                    無料掲載
                  </CardTitle>
                  <p className="text-2xl font-bold">¥0</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "店舗基本情報の掲載",
                      "近くの釣りスポットとの連携表示",
                      "Google検索への構造化データ配信",
                      "エサ在庫の掲載（1日10回まで）",
                    ].map((text) => (
                      <li key={text} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-green-500" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* ベーシックプラン */}
              <Card className="border-blue-300/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-600 dark:text-blue-400">
                    ベーシック
                  </CardTitle>
                  <p className="text-2xl font-bold">
                    ¥500<span className="text-sm font-normal text-muted-foreground">/月</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "無料掲載の全機能",
                      "検索結果での優先表示",
                      "写真3枚まで掲載",
                      "公式バッジ表示",
                    ].map((text) => (
                      <li key={text} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* プロプラン */}
              <Card className="border-amber-300/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-600 dark:text-amber-400">
                    プロ
                  </CardTitle>
                  <p className="text-2xl font-bold">
                    ¥2,980<span className="text-sm font-normal text-muted-foreground">/月</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      "ベーシックの全機能",
                      "写真20枚・店主メッセージ",
                      "クーポン配信機能",
                      "スポットページでの商品PR",
                    ].map((text) => (
                      <li key={text} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* デモ・サンプル */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
              <Link
                href="/shops/sample-basic"
                className="inline-flex items-center justify-center gap-1 rounded-lg border border-blue-300 px-5 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
              >
                ベーシックプランのサンプルを見る
              </Link>
              <Link
                href="/shops/sample-premium"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600"
              >
                プロプランのサンプルを見る
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href="/shops/update?shop=sample-premium&token=demo"
                className="inline-flex items-center justify-center gap-1 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                店舗管理のデモを試す
              </Link>
            </div>

            {/* 詳細・お問い合わせ */}
            <div className="flex flex-col gap-2 pt-2 text-sm sm:flex-row sm:items-center">
              <Link
                href="/partner"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                掲載の詳細・お申し込みはこちら
                <ChevronRight className="size-3.5" />
              </Link>
              <span className="hidden sm:inline text-muted-foreground">|</span>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-primary" />
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
      </div>

      {/* 都道府県別に釣具店を探す */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="size-6 text-primary" />
              都道府県別に釣具店を探す
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {regionGroupOrder.map((regionName) => {
              const regionPrefs = prefectures.filter(
                (p) => p.regionGroup === regionName
              );
              return (
                <div key={regionName}>
                  <h3 className="mb-2 text-sm font-bold text-muted-foreground">
                    {regionName}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {regionPrefs.map((pref) => {
                      const shopCountForPref = filteredShops.filter(
                        (s) => s.region.prefecture === pref.name
                      ).length;
                      return (
                        <Link
                          key={pref.slug}
                          href={`/shops/area/${pref.slug}`}
                          className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted hover:border-primary/30"
                        >
                          {pref.nameShort}
                          {shopCountForPref > 0 && (
                            <span className="ml-1 opacity-60">
                              {shopCountForPref}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 今月の釣り情報 */}
      {currentGuide && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-5 text-emerald-600" />
                {currentMonth}月の釣りガイド
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {currentTopFish.map((fish) => fish && (
                  <Badge key={fish.slug} variant="secondary" className="flex items-center gap-1 text-xs">
                    <Fish className="size-3" />
                    {fish.name}
                  </Badge>
                ))}
              </div>
              <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
                {currentGuide.description}
              </p>
              <Link
                href={`/monthly/${currentMonthSlug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {currentMonth}月の釣りガイドを見る
                <ChevronRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-5 text-blue-600" />
                月別釣りカレンダー
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-sm text-muted-foreground">
                1月〜12月の月ごとに釣れる魚・おすすめ釣り方・装備をまとめた完全ガイドです。
              </p>
              <Link
                href="/monthly"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline dark:text-blue-400"
              >
                月別釣りカレンダーを見る
                <ChevronRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
