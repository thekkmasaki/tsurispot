import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, ChevronRight, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BadgeSnippet } from "@/components/shops/badge-snippet";

export const metadata: Metadata = {
  title: "掲載店バッジのご案内｜釣具店オーナー向け",
  description:
    "ツリスポに掲載中の釣具店・エサ店向けに「ツリスポ掲載店」バッジを無料配布しています。貴店のホームページやブログに貼るだけで、全国7,000ヶ所以上の釣り場情報と連携した掲載店であることをお客様にアピールできます。バッジ画像と貼り付け用HTMLをこのページで発行できます。",
  alternates: {
    canonical: "https://tsurispot.com/shops/badge",
  },
  openGraph: {
    title: "掲載店バッジのご案内｜釣具店オーナー向け",
    description:
      "ツリスポ掲載店向けの無料バッジ。貴店のホームページに貼ってお客様にアピールできます。",
    type: "website",
    url: "https://tsurispot.com/shops/badge",
    siteName: "ツリスポ",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
    { "@type": "ListItem", position: 2, name: "釣具店・エサ店ガイド", item: "https://tsurispot.com/shops" },
    { "@type": "ListItem", position: 3, name: "掲載店バッジ", item: "https://tsurispot.com/shops/badge" },
  ],
};

export default function ShopBadgePage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣具店・エサ店ガイド", href: "/shops" },
            { label: "掲載店バッジ" },
          ]}
        />

        <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Award className="size-7 text-primary" aria-hidden="true" />
          「ツリスポ掲載店」バッジのご案内
        </h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          ツリスポに掲載中の釣具店・エサ店の皆さまへ、掲載店バッジを<strong>無料</strong>で配布しています。
          貴店のホームページやブログに貼っていただくと、全国の釣り場情報サイトに掲載中のお店であることをお客様にアピールできます。
        </p>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">バッジのプレビュー</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center rounded-md border bg-muted/40 p-6">
              <Image
                src="/badge/tsurispot-badge.svg"
                alt="釣り情報サイト ツリスポ掲載店"
                width={220}
                height={64}
                unoptimized
              />
            </div>
            <p className="text-sm text-muted-foreground">
              画像はツリスポのサーバーから配信されるため、ダウンロード不要でそのまま使えます。
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">貼り付け用HTMLの発行</CardTitle>
          </CardHeader>
          <CardContent>
            <BadgeSnippet />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">ご利用にあたって</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
              <li>バッジの掲示は<strong>任意</strong>です。掲載条件・プラン内容には一切影響しません。</li>
              <li>ツリスポに掲載中の店舗さまであれば、無料掲載・有料プランを問わずご利用いただけます。</li>
              <li>バッジのデザイン改変（色変更・文言変更）はご遠慮ください。サイズ変更は可能です。</li>
              <li>掲載をやめた場合は、バッジの掲示も取り下げをお願いします。</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
          <Link
            prefetch={false}
            href="/partner"
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            掲載のお申し込み・プランの詳細はこちら
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Link>
          <span className="hidden text-muted-foreground sm:inline">|</span>
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-primary" aria-hidden="true" />
            <a
              href="mailto:fishingspotjapan@gmail.com"
              className="text-primary hover:underline"
            >
              fishingspotjapan@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
