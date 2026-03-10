import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Store,
  ChevronRight,
  Mail,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { tackleShops } from "@/lib/data/shops";

export const metadata: Metadata = {
  title: "釣具店・エサ店ガイド",
  description:
    "全国の釣具店・釣りエサ店を紹介。個人経営の地元密着店からチヌ釣り専門店、中古釣具店まで。エサの在庫状況もリアルタイムで確認できます。",
  openGraph: {
    title: "釣具店・エサ店ガイド",
    description:
      "全国の釣具店・釣りエサ店を紹介。個人経営の地元密着店から専門店まで。",
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

export default function ShopsListPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* パンくずリスト */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣具店・エサ店ガイド" },
        ]}
      />

      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Store className="w-8 h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">
            釣具店・エサ店ガイド
          </h1>
        </div>
        <p className="text-muted-foreground text-base mt-2">
          釣り場の近くで装備を揃えよう。全国の個人経営店・専門店を紹介しています。
        </p>
      </div>

      {/* 店舗一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12">
        {tackleShops.map((shop) => (
          <Link
            key={shop.id}
            href={`/shops/${shop.slug}`}
            className="group block"
          >
            <Card className="h-full transition-shadow hover:shadow-md group-hover:border-primary/30">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors leading-snug">
                    {shop.name}
                  </CardTitle>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {shop.region.areaName}エリア
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 住所 */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{shop.address}</span>
                </div>

                {/* 電話番号 */}
                {shop.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span>{shop.phone}</span>
                  </div>
                )}

                {/* 営業時間 */}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{shop.businessHours}</span>
                </div>

                {/* エサ取扱バッジ */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {shop.hasLiveBait && (
                    <Badge
                      variant="default"
                      className="text-xs bg-green-600 hover:bg-green-700"
                    >
                      活きエサ
                    </Badge>
                  )}
                  {shop.hasFrozenBait && (
                    <Badge
                      variant="default"
                      className="text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      冷凍エサ
                    </Badge>
                  )}
                  {shop.hasRentalRod && (
                    <Badge variant="outline" className="text-xs">
                      レンタルロッド
                    </Badge>
                  )}
                  {shop.services.some((s) => s.includes("中古")) && (
                    <Badge variant="outline" className="text-xs">
                      中古取扱
                    </Badge>
                  )}
                  {shop.services.some((s) => s.includes("専門")) && (
                    <Badge variant="outline" className="text-xs">
                      専門店
                    </Badge>
                  )}
                </div>

                {/* 説明文（2行まで） */}
                <p className="text-sm text-muted-foreground line-clamp-2 pt-1">
                  {shop.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 掲載案内セクション */}
      <div className="mb-8">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              釣具店オーナーの皆さまへ ― ツリスポに無料掲載しませんか？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-base leading-relaxed">
              ツリスポは全国の釣り人が利用する釣りスポット情報サイトです。
              <br />
              貴店の情報を掲載して、地元の釣り人にアピールしませんか？
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 無料プラン */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-700 dark:text-green-400">
                    無料プラン
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        店舗基本情報の掲載（店名・住所・営業時間・電話番号）
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>近くの釣りスポットとの連携表示</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>エサ在庫の掲載・更新（1日10回まで）</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>QRコード付き紹介カードの無料送付</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* プレミアムプラン */}
              <Card className="border-amber-300/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-amber-600 dark:text-amber-400">
                    プレミアムプラン{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      月額1,980円（税込）
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    年間契約なら19,800円（2ヶ月分おトク）
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>無料プランの全機能</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>
                        専用ページの作り込み（写真・店主メッセージ）
                      </span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>エサ在庫更新無制限・LINE連携リアルタイム更新</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span>検索結果での優先表示</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* デモ・サンプル */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/shops/update?shop=sample-premium&token=demo"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
              >
                エサ在庫管理のデモを試す
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shops/sample-premium"
                className="inline-flex items-center justify-center gap-1 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                プレミアムページのサンプルを見る
              </Link>
            </div>

            {/* お問い合わせ */}
            <div className="flex items-center gap-2 text-sm pt-2">
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
    </div>
  );
}
