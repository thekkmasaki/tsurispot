import type { Metadata } from "next";
import Link from "next/link";
import {
  Anchor,
  Award,
  ExternalLink,
  Building2,
  Waves,
  Ship,
  ChevronRight,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PortMannerSection } from "@/components/spots/port-manner-section";
import {
  umigyoDistricts,
  getModelDistricts,
  getUmigyoPrefectures,
} from "@/lib/data/umigyo";
import { UmigyoListClient } from "./umigyo-list-client";

export const metadata: Metadata = {
  title: "海業（うみぎょう）推進 | 釣りで地域を元気に - ツリスポ",
  description:
    "水産庁が推進する「海業」全86地区の情報を掲載。モデル地区12地区のハイライトや、漁港での釣りマナー、自治体向け掲載案内など、海業と釣り観光の最新情報をお届けします。",
  openGraph: {
    title: "海業（うみぎょう）推進 | 釣りで地域を元気に - ツリスポ",
    description:
      "水産庁選定の海業推進全86地区を網羅。釣り観光を通じた漁港活性化の最前線を紹介します。",
    type: "website",
    url: "https://tsurispot.com/umigyo",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/umigyo",
  },
};

const modelDistricts = getModelDistricts();
const allPrefectures = getUmigyoPrefectures();

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "海業（うみぎょう）推進 | 釣りで地域を元気に - ツリスポ",
  description:
    "水産庁が推進する「海業」全86地区の情報を掲載。モデル地区12地区のハイライトや漁港での釣りマナー、自治体向け掲載案内。",
  url: "https://tsurispot.com/umigyo",
  dateModified: "2026-02-28",
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
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
      name: "海業推進",
      item: "https://tsurispot.com/umigyo",
    },
  ],
};

const STATS = [
  { value: "86", label: "推進地区" },
  { value: "12", label: "モデル地区" },
  { value: "27", label: "都道府県" },
  { value: "54+32", label: "令和6年+7年" },
];

export default function UmigyoPage() {
  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 left-0 right-0 h-32">
            <svg
              viewBox="0 0 1440 120"
              fill="none"
              className="absolute bottom-0 w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,120 L0,120 Z"
                fill="white"
                fillOpacity="0.3"
              />
            </svg>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
              <Ship className="size-4" />
              <span>水産庁推進事業</span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              海業 × 釣りで
              <br className="sm:hidden" />
              日本の漁港を元気に
            </h1>
            <p className="max-w-lg text-base text-blue-100 sm:text-lg">
              水産庁が選定した全86地区の海業推進情報と、
              <br className="hidden sm:block" />
              釣り観光を通じた地域活性化の取り組みを紹介します
            </p>

            {/* 統計 */}
            <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-sm"
                >
                  <p className="text-xl font-bold text-white sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-200">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* 水産庁リンク */}
            <a
              href="https://www.jfa.maff.go.jp/j/keikaku/230718.html"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-sm text-white/90 transition-colors hover:bg-white/25 backdrop-blur-sm"
            >
              水産庁「海業の推進について」
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            fill="none"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* パンくず + コンテンツ */}
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <Breadcrumb
          items={[{ label: "ホーム", href: "/" }, { label: "海業推進" }]}
        />
      </div>

      {/* 「海業とは」セクション */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-2">
            <Waves className="size-5 text-blue-600" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              海業（うみぎょう）とは
            </h2>
          </div>

          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-5 sm:p-6">
              <div className="flex gap-3">
                <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    水産庁による定義
                  </p>
                  <blockquote className="mt-2 border-l-4 border-blue-300 pl-4 text-sm leading-relaxed text-gray-700">
                    海業とは、海や漁村の地域資源の価値や魅力を活用する事業であって、
                    国内外からの多様な人材が漁村の地域社会に関わることで、
                    漁村における所得機会の増大及び雇用機会の確保を図る取組のことです。
                  </blockquote>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    水産庁は令和6年度に54地区、令和7年度に32地区を「海業推進地区」として選定。
                    このうち12地区を「海業振興モデル地区」に指定し、先進的な取組を全国に横展開しています。
                    釣り観光は海業の重要な柱の一つであり、ツリスポは漁港での釣りを通じた地域活性化を応援しています。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* モデル地区12地区ハイライト */}
      <section className="bg-gradient-to-b from-amber-50/50 to-amber-50/20 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <div className="mb-3 inline-flex items-center gap-2">
              <Award className="size-5 text-amber-600" />
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                海業振興モデル地区
              </h2>
            </div>
            <p className="text-sm text-gray-600">
              全国12地区が選定。先進的な海業の取組で地域の模範となっています
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modelDistricts.map((d) => (
              <Card
                key={d.id}
                className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/50 transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      <Award className="mr-1 size-3" />
                      モデル地区
                    </Badge>
                    <span className="text-xs text-amber-700">{d.prefecture}</span>
                  </div>
                  <h3 className="mb-1 text-lg font-bold text-gray-900">
                    {d.portName}
                  </h3>
                  <p className="mb-1 text-xs text-gray-500">{d.city}</p>
                  <p className="mb-3 text-sm leading-relaxed text-gray-600">
                    {d.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.activities.map((a) => (
                      <span
                        key={a}
                        className="rounded-full bg-amber-100/70 px-2.5 py-0.5 text-xs font-medium text-amber-800"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 全86地区一覧 */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <Anchor className="size-5 text-blue-600" />
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              全86地区一覧
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            令和6年度54地区 + 令和7年度32地区の全海業推進地区
          </p>
        </div>

        <UmigyoListClient
          districts={umigyoDistricts}
          prefectures={allPrefectures}
        />
      </section>

      {/* 漁港マナーセクション */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
        <PortMannerSection />
      </section>

      {/* 自治体向けCTA */}
      <section className="bg-gradient-to-b from-blue-50/50 to-blue-50/20 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 shadow-sm">
            <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-12 sm:py-14">
              <div className="flex size-14 items-center justify-center rounded-full bg-blue-100">
                <Building2 className="size-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  自治体・漁協の皆さまへ
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm text-gray-600 sm:text-base">
                  ツリスポは海業推進地区の情報発信を無料でサポートしています。
                  <br className="hidden sm:block" />
                  掲載やプロモーションについてお気軽にご相談ください。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/umigyo/for-municipalities">
                  <Button size="lg" className="min-h-[44px] gap-1.5 px-6">
                    掲載について詳しく
                    <ChevronRight className="size-4" />
                  </Button>
                </Link>
                <a href="mailto:info@tsurispot.com?subject=海業推進地区の掲載について">
                  <Button
                    variant="outline"
                    size="lg"
                    className="min-h-[44px] gap-1.5 px-6"
                  >
                    お問い合わせ
                    <ChevronRight className="size-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 水産庁外部リンク */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <h2 className="mb-4 text-xl font-bold tracking-tight sm:text-2xl">
            参考リンク
          </h2>
          <div className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="https://www.jfa.maff.go.jp/j/keikaku/230718.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="w-full gap-1.5 sm:w-auto"
              >
                水産庁「海業の推進について」
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
            <a
              href="https://www.jfa.maff.go.jp/j/gyoko_gyozyo/umigyo/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                className="w-full gap-1.5 sm:w-auto"
              >
                水産庁「海業振興の取組」
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            ※ 本ページの情報は水産庁の公開資料に基づいています。最新情報は水産庁公式サイトをご確認ください。
          </p>
        </div>
      </section>
    </div>
  );
}
