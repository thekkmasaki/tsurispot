import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  ChevronRight,
  Mail,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { tackleShops } from "@/lib/data/shops";
import { ShopsFilterList } from "@/components/shops/shops-filter-list";

export const metadata: Metadata = {
  title: "釣具店・エサ店ガイド｜全国の釣具店を探す",
  description: `全国${tackleShops.length}件以上の釣具店・釣りエサ店を紹介。都道府県やサービスで絞り込み検索。個人経営の地元密着店から大手チェーンまで。活きエサ・冷凍エサの取り扱い情報も。`,
  openGraph: {
    title: "釣具店・エサ店ガイド｜全国の釣具店を探す",
    description: `全国${tackleShops.length}件以上の釣具店・釣りエサ店を紹介。都道府県やサービスで絞り込み検索。`,
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

// Server ComponentでデータをシリアライズしてClient Componentに渡す
const shopsData = tackleShops
  .filter((s) => s.slug !== "sample-premium" && s.slug !== "sample-basic")
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

export default function ShopsListPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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
          全国{tackleShops.length}件以上の釣具店・エサ店を掲載。釣り場の近くで装備を揃えよう。
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
    </div>
  );
}
