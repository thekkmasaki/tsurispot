import type { Metadata } from "next";
import Link from "next/link";
import { fishingSpots } from "@/lib/data/spots";
import { getCatchableNow } from "@/lib/data/fish";
import { areaGuides } from "@/lib/data/area-guides";
import { seasonalGuides } from "@/lib/data/seasonal-guides";
import { prefectures } from "@/lib/data/prefectures";
import { getLatestBlogPosts, BLOG_CATEGORIES } from "@/lib/data/blog";
import { SPOT_TYPE_LABELS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Star,
  Fish,
  ArrowRight,
  Waves,
  BookOpen,
  ChevronRight,
  Store,
  Skull,
  TriangleAlert,
  Calendar,
  Compass,
  Tag,
  Target,
} from "lucide-react";
import dynamic from "next/dynamic";
import { SpotImage, FishImage } from "@/components/ui/spot-image";
import { HomeSearchBar } from "@/components/home-search-bar";
import { CatchableNowCarousel } from "@/components/catchable-now-carousel";


// Below-the-fold client components loaded lazily
const NearbySpots = dynamic(() => import("@/components/nearby-spots").then((m) => m.NearbySpots));
const LocationRecommendations = dynamic(() => import("@/components/location-recommendations").then((m) => m.LocationRecommendations));
const OnlineUsersBadge = dynamic(() => import("@/components/online-users-badge").then((m) => m.OnlineUsersBadge));
const LocationPromptBanner = dynamic(() => import("@/components/location-prompt-banner").then((m) => m.LocationPromptBanner));
const SeasonalRecommend = dynamic(() => import("@/components/affiliate/seasonal-recommend").then((m) => m.SeasonalRecommend));

export const metadata: Metadata = {
  title: "ツリスポ - 近くの釣り場が見つかる｜全国の海釣り・川釣りスポット検索",
  description:
    "近くの釣り場を地図で簡単検索。全国1000箇所以上の釣りスポットから、堤防・漁港・磯の海釣り、渓流・湖の淡水釣りまで、近くのおすすめ釣り場が見つかります。今の時期に釣れる魚、初心者向けの穴場情報も満載。",
  openGraph: {
    title: "ツリスポ - 近くの釣り場が見つかる釣りスポット検索サイト",
    description:
      "近くの釣り場を地図で簡単検索。全国の釣りスポットから今釣れる魚やおすすめの仕掛け情報まで網羅。",
    type: "website",
    url: "https://tsurispot.com",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com",
  },
};

// NearbySpots / LocationRecommendations 用の軽量スポットデータ
// フルデータ(33MB+)ではなく必要フィールドだけ渡してRSCペイロードを削減
const lightSpots = fishingSpots.map((s) => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  spotType: s.spotType,
  rating: s.rating,
  latitude: s.latitude,
  longitude: s.longitude,
  region: { prefecture: s.region.prefecture, areaName: s.region.areaName },
  catchableFish: s.catchableFish.map((cf) => ({
    fish: { id: cf.fish.id, name: cf.fish.name, slug: cf.fish.slug },
    monthStart: cf.monthStart,
    monthEnd: cf.monthEnd,
    peakSeason: cf.peakSeason,
  })),
}));

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ツリスポ",
  url: "https://tsurispot.com",
  description:
    "近くの釣り場を地図で簡単検索。全国1000箇所以上の釣りスポットから今釣れる魚やおすすめの仕掛け情報まで網羅した釣り情報サイト。",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://tsurispot.com/spots?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ツリスポ",
  url: "https://tsurispot.com",
  logo: "https://tsurispot.com/logo.svg",
  sameAs: ["https://www.instagram.com/tsurispotjapan/"],
  description:
    "釣りスポット総合情報サイト。全国の釣り場を地図で検索でき、今釣れる魚やおすすめの仕掛け情報を提供しています。",
};

const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "近くの釣り場を探すにはどうすればいいですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ツリスポでは、GPSを使って現在地から近い釣り場を自動で表示します。トップページの「近くの釣り場」ボタンを押すか、地図ページから周辺の釣りスポットを検索できます。全国1000箇所以上の釣り場から最寄りのスポットが見つかります。",
      },
    },
    {
      "@type": "Question",
      name: "釣り初心者におすすめの釣り場はどこですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者には堤防や漁港での釣りがおすすめです。足場が安定しており、サビキ釣りでアジやイワシが手軽に狙えます。ツリスポでは難易度「初心者向け」のスポットを絞り込み検索できます。駐車場やトイレの有無も確認できるので、ファミリーフィッシングにも最適です。",
      },
    },
    {
      "@type": "Question",
      name: "今の時期に釣れる魚は何ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ツリスポの「今釣れる魚」ページで、現在の月に釣れる魚種を一覧で確認できます。季節ごとに旬の魚が変わるため、シーズンカレンダーを参考にして狙いたい魚を選びましょう。各魚種のページでは釣り方や仕掛けの情報も掲載しています。",
      },
    },
    {
      "@type": "Question",
      name: "堤防釣りに必要な道具は何ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "堤防釣りの基本セットは、竿（ロッド）、リール、仕掛け（サビキセットが初心者向け）、エサ（アミエビ等）、バケツ、クーラーボックスです。ツリスポの「釣りの始め方」ガイドや「持ち物チェックリスト」で必要な道具を詳しく確認できます。",
      },
    },
    {
      "@type": "Question",
      name: "海釣りと川釣りの違いは何ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "海釣りは堤防・漁港・磯・砂浜などで行い、アジ・サバ・メバル・クロダイなど多彩な魚が狙えます。川釣りは渓流・河川・湖で行い、アユ・ヤマメ・ブラックバスなどが対象です。川釣りは遊漁券が必要な場合があります。ツリスポでは海・川それぞれのスポットを検索できます。",
      },
    },
  ],
};

export default function Home() {
  const currentMonth = new Date().getMonth() + 1;
  const catchableNow = getCatchableNow(currentMonth);
  const popularSpots = fishingSpots.slice(0, 6);
  const latestPosts = getLatestBlogPosts(3);

  // Carousel data: fish catchable now with spot counts
  const carouselFish = catchableNow.slice(0, 12).map((fish) => ({
    id: fish.id,
    name: fish.name,
    slug: fish.slug,
    imageUrl: fish.imageUrl,
    category: fish.category,
    difficulty: fish.difficulty,
    isPeak: fish.peakMonths.includes(currentMonth),
    spotCount: fishingSpots.filter((s) =>
      s.catchableFish.some((cf) => cf.fish.id === fish.id)
    ).length,
  }));

  const popularSpotsItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "人気の釣りスポット",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: popularSpots.length,
    itemListElement: popularSpots.map((spot, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://tsurispot.com/spots/${spot.slug}`,
      name: spot.name,
    })),
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(popularSpotsItemListJsonLd) }}
      />
      {/* ヒーローセクション */}
      <section className="relative overflow-x-hidden bg-gradient-to-br from-sky-600 via-[#0C4A6E] to-indigo-800">
        {/* 装飾的な波パターン */}
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
              <path
                d="M0,80 C360,20 720,100 1080,40 C1260,20 1380,50 1440,80 L1440,120 L0,120 Z"
                fill="white"
                fillOpacity="0.2"
              />
            </svg>
          </div>
        </div>

        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-10 sm:px-6 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
          {/* 接続人数 */}
          <div className="absolute right-4 top-4 sm:right-6 sm:top-20 lg:top-24">
            <OnlineUsersBadge />
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm sm:mb-4">
              <Waves className="size-4" />
              <span>海釣り・川釣り 総合情報サイト</span>
            </div>

            <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-white sm:mb-4 sm:text-4xl lg:text-5xl">
              今週末、
              <br className="sm:hidden" />
              釣りに行こう。
            </h1>

            <p className="mb-6 max-w-lg text-sm text-blue-100 sm:mb-8 sm:text-lg">
              道具がなくても、経験がなくても大丈夫。
              <br className="hidden sm:inline" />
              近くの釣り場で、最高の1匹に出会おう。
            </p>

            {/* 検索バー */}
            <HomeSearchBar />

            {/* メインCTA */}
            <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/map" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 bg-amber-500 px-8 py-6 text-base font-bold text-white shadow-lg transition-all hover:bg-amber-400 hover:shadow-xl hover:scale-[1.02] sm:w-auto sm:text-lg min-h-[52px]">
                  <MapPin className="size-5" />
                  近くの釣り場を探す
                </Button>
              </Link>
              <div className="flex gap-3">
                <Link href="/for-beginners">
                  <Button variant="outline" size="lg" className="gap-1.5 border-white/40 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-[1.02] min-h-[48px]">
                    <BookOpen className="size-4" />
                    初心者ガイド
                  </Button>
                </Link>
                <Link href="/catchable-now">
                  <Button variant="outline" size="lg" className="gap-1.5 border-white/40 bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-[1.02] min-h-[48px]">
                    <Fish className="size-4" />
                    今釣れる魚
                  </Button>
                </Link>
              </div>
            </div>

            {/* フィルタータグ */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/spots?type=breakwater">
                <Badge variant="outline" className="cursor-pointer border-white/40 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 min-h-[40px]">
                  堤防
                </Badge>
              </Link>
              <Link href="/spots?type=port">
                <Badge variant="outline" className="cursor-pointer border-white/40 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 min-h-[40px]">
                  漁港
                </Badge>
              </Link>
              <Link href="/spots?type=rocky">
                <Badge variant="outline" className="cursor-pointer border-white/40 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 min-h-[40px]">
                  磯
                </Badge>
              </Link>
              <Link href="/spots?type=river">
                <Badge variant="outline" className="cursor-pointer border-emerald-300/50 bg-emerald-500/15 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-emerald-500/25 min-h-[40px]">
                  川・湖
                </Badge>
              </Link>
              <Link href="/spots">
                <Badge variant="outline" className="cursor-pointer border-white/40 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 min-h-[40px]">
                  すべて
                </Badge>
              </Link>
            </div>
          </div>
        </div>

        {/* セクション下部の波形 */}
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

      {/* 今釣れている魚カルーセル */}
      <CatchableNowCarousel fish={carouselFish} />

      {/* 初心者スタートバナー */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-10 sm:px-6 sm:pt-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white sm:p-8">
          <div className="relative z-10">
            <div className="mb-1 text-sm font-medium text-emerald-100">はじめての方へ</div>
            <h2 className="mb-2 text-xl font-bold sm:text-2xl">釣りを始めてみませんか？</h2>
            <p className="mb-4 max-w-md text-sm text-emerald-50 sm:text-base">
              道具は5,000円から。近くの堤防で、誰でも魚が釣れます。
              ツリスポが最初の1匹までサポートします。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/guide/beginner" className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50 min-h-[44px]">
                初心者ガイドを見る
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/guide/budget" className="inline-flex items-center gap-2 rounded-lg border-2 border-white/50 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 min-h-[44px]">
                5,000円で始める方法
              </Link>
            </div>
          </div>
          {/* 背景の釣りアイコン */}
          <div className="absolute -right-4 -top-4 text-8xl opacity-10 sm:text-9xl">🎣</div>
        </div>
      </section>

      {/* クイックアクション */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          <Link href="/map">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-sky-50 p-3 transition-all hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-sky-100 sm:size-12">
                <MapPin className="size-5 text-sky-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                地図で探す
              </span>
            </div>
          </Link>
          <Link href="/catchable-now">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-orange-50 p-3 transition-all hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 sm:size-12">
                <Fish className="size-5 text-orange-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                今釣れる魚
              </span>
            </div>
          </Link>
          <Link href="/fish-finder">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-purple-50 p-3 transition-all hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 sm:size-12">
                <Target className="size-5 text-purple-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                釣り場診断
              </span>
            </div>
          </Link>
          <Link href="/for-beginners">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-emerald-50 p-3 transition-all hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 sm:size-12">
                <BookOpen className="size-5 text-emerald-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                はじめての方
              </span>
            </div>
          </Link>
          <Link href="/fishing-calendar">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-blue-50 p-3 transition-all hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 sm:size-12">
                <Calendar className="size-5 text-blue-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                月別カレンダー
              </span>
            </div>
          </Link>
          <Link href="/recommendation">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-amber-50 p-3 transition-all hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 sm:size-12">
                <Compass className="size-5 text-amber-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                おすすめ診断
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3ステップで釣りを始める */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <h2 className="mb-6 text-center text-lg font-bold sm:text-xl">
          たった3ステップで釣りデビュー
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-blue-100 text-2xl">1</div>
            <h3 className="mb-1 font-bold">釣り場を探す</h3>
            <p className="text-sm text-muted-foreground">
              近くの堤防や漁港を検索。初心者OKの釣り場がすぐ見つかります。
            </p>
            <Link href="/spots" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              釣り場を探す <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-5 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">2</div>
            <h3 className="mb-1 font-bold">道具を準備する</h3>
            <p className="text-sm text-muted-foreground">
              入門セットは5,000円から。何を買えばいいか完全ガイドで解説。
            </p>
            <Link href="/guide/budget" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              道具ガイド <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="rounded-xl border bg-card p-5 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-orange-100 text-2xl">3</div>
            <h3 className="mb-1 font-bold">釣ってみる！</h3>
            <p className="text-sm text-muted-foreground">
              サビキ釣りなら初めてでも高確率で釣れます。動画付きガイドで安心。
            </p>
            <Link href="/guide/sabiki" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              サビキガイド <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 名言セクション */}
      <section className="border-t bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <blockquote className="space-y-4">
            <div className="space-y-2 text-sm leading-relaxed text-slate-600 sm:text-base sm:leading-loose">
              <p>一時間、幸せになりたかったら酒を飲みなさい。</p>
              <p>三日間、幸せになりたかったら結婚しなさい。</p>
              <p>八日間、幸せになりたかったら豚を殺して食べなさい。</p>
              <p className="font-medium text-slate-800">永遠に、幸せになりたかったら釣りを覚えなさい。</p>
            </div>
            <footer className="text-xs text-slate-400 sm:text-sm">
              ― 開高健『オーパ！』より
            </footer>
          </blockquote>
        </div>
      </section>

      {/* 近くの釣りスポット */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
        <NearbySpots allSpots={lightSpots} />
      </section>

      {/* 現在地ベースのおすすめ記事 */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10">
        <LocationRecommendations
          allSpots={lightSpots}
          prefectures={prefectures}
          areaGuides={areaGuides}
        />
      </section>

      {/* 目的別に釣り場を探す（SEOリンクセクション） */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <h2 className="mb-4 text-lg font-bold tracking-tight sm:text-2xl">
          目的別に釣り場を探す
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/fishing-spots/breakwater-beginner" className="group">
            <div className="rounded-xl border bg-blue-50/50 p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="text-2xl mb-2">🎣</div>
              <h3 className="text-sm font-semibold group-hover:text-primary">堤防釣り初心者向け</h3>
              <p className="mt-1 text-xs text-muted-foreground">安全で釣りやすい堤防スポット</p>
            </div>
          </Link>
          <Link href="/fishing-spots/best-saltwater" className="group">
            <div className="rounded-xl border bg-cyan-50/50 p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="text-2xl mb-2">🌊</div>
              <h3 className="text-sm font-semibold group-hover:text-primary">海釣りおすすめ</h3>
              <p className="mt-1 text-xs text-muted-foreground">人気の海釣りスポット一覧</p>
            </div>
          </Link>
          <Link href="/fishing-spots/river-beginner" className="group">
            <div className="rounded-xl border bg-emerald-50/50 p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="text-2xl mb-2">🏞️</div>
              <h3 className="text-sm font-semibold group-hover:text-primary">川釣り初心者向け</h3>
              <p className="mt-1 text-xs text-muted-foreground">のんびり川釣りを楽しめる</p>
            </div>
          </Link>
          <Link href="/fishing-spots/near-me" className="group">
            <div className="rounded-xl border bg-amber-50/50 p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="text-2xl mb-2">📍</div>
              <h3 className="text-sm font-semibold group-hover:text-primary">近くの釣り場</h3>
              <p className="mt-1 text-xs text-muted-foreground">現在地から一番近い釣り場</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 人気の釣りスポットセクション */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
              人気の釣りスポット
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              みんなに選ばれている釣り場
            </p>
          </div>
          <Link
            href="/spots"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            すべて見る
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popularSpots.map((spot) => (
            <Link key={spot.id} href={`/spots/${spot.slug}`}>
              <Card className="group h-full gap-0 overflow-hidden border py-0 transition-shadow hover:shadow-md">
                {/* カード上部の画像 */}
                <SpotImage
                  src={(spot.mainImageUrl?.startsWith("http") || spot.mainImageUrl?.startsWith("/images/spots/wikimedia/")) ? spot.mainImageUrl : undefined}
                  alt={spot.name}
                  spotType={spot.spotType}
                  height="h-36 sm:h-40"
                />

                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold group-hover:text-primary">
                        {spot.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {spot.region.prefecture} {spot.region.areaName}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-sm">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      <span className="font-medium">{spot.rating}</span>
                    </div>
                  </div>

                  {/* 釣れる魚バッジ */}
                  <div className="flex flex-wrap gap-1.5">
                    {spot.catchableFish.slice(0, 3).map((cf) => (
                      <Badge
                        key={cf.fish.id}
                        variant="outline"
                        className="text-xs"
                      >
                        {cf.fish.name}
                      </Badge>
                    ))}
                    {spot.catchableFish.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{spot.catchableFish.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* スポットタイプ & 海/川 */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {SPOT_TYPE_LABELS[spot.spotType]}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${spot.spotType === "river" ? "border-emerald-200 text-emerald-700" : "border-sky-200 text-sky-700"}`}>
                      {spot.spotType === "river" ? "川釣り" : "海釣り"}
                    </Badge>
                    {spot.difficulty === "beginner" && (
                      <Badge className="bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100">
                        初心者OK
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* モバイル用「すべて見る」リンク */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/spots">
            <Button variant="outline" className="min-h-[44px] gap-1">
              すべてのスポットを見る
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 今釣れる魚セクション */}
      <section className="bg-muted/50 py-8 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
                今の時期に釣れる魚
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentMonth}月に狙える魚たち
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                今の時期ならこの魚が狙えます。初心者でも釣れるチャンス！
              </p>
            </div>
            <Link
              href="/fish"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
            >
              もっと見る
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* モバイル: 横スクロール / PC: グリッド */}
          <div className="relative">
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {catchableNow.map((fish) => {
                const isPeak = fish.peakMonths.includes(currentMonth);
                return (
                  <Link
                    key={fish.id}
                    href={`/fish/${fish.slug}`}
                    className="w-52 shrink-0 sm:w-auto"
                  >
                    <Card className={`group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md ${fish.isPoisonous ? "ring-2 ring-red-200" : ""}`}>
                      {/* カード上部の画像 */}
                      <div className="relative">
                        <FishImage
                          src={fish.imageUrl}
                          alt={fish.name}
                          category={fish.category}
                        />
                        {fish.isPoisonous && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white shadow">
                            {fish.dangerLevel === "high" ? <Skull className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
                            毒
                          </div>
                        )}
                      </div>

                      <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                        <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                          {fish.name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="outline" className={`text-xs ${fish.category === "freshwater" ? "border-emerald-200 text-emerald-700" : fish.category === "brackish" ? "border-teal-200 text-teal-700" : "border-sky-200 text-sky-700"}`}>
                            {fish.category === "freshwater" ? "淡水" : fish.category === "brackish" ? "汽水" : "海水"}
                          </Badge>
                          {isPeak ? (
                            <Badge className="bg-orange-100 text-xs text-orange-700 hover:bg-orange-100">
                              旬!
                            </Badge>
                          ) : (
                            <Badge className="bg-sky-100 text-xs text-sky-700 hover:bg-sky-100">
                              釣れる
                            </Badge>
                          )}
                          {fish.isPoisonous && (
                            <Badge className="bg-red-100 text-xs text-red-700 hover:bg-red-100">
                              {fish.poisonType || "毒あり"}
                            </Badge>
                          )}
                        </div>

                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {fish.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {/* Scroll indicator - mobile only */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-muted/50 to-transparent sm:hidden" />
          </div>

          {/* モバイル用「もっと見る」リンク */}
          <div className="mt-6 flex justify-center sm:hidden">
            <Link href="/fish">
              <Button variant="outline" className="min-h-[44px] gap-1">
                すべての魚を見る
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* エリア別釣り場ガイド */}
      <section className="bg-muted/50 py-8 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
                エリア別釣り場ガイド
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                全国{areaGuides.length}エリアの釣り場を完全攻略
              </p>
            </div>
            <Link
              href="/area-guide"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
            >
              すべて見る
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {areaGuides.slice(0, 6).map((guide) => (
              <Link key={guide.slug} href={`/area-guide/${guide.slug}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <Compass className="size-4 text-primary" />
                      </div>
                      <h3 className="font-semibold group-hover:text-primary">
                        {guide.name}
                      </h3>
                    </div>
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {guide.description}
                    </p>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {guide.mainFish.slice(0, 3).map((f) => (
                        <Badge key={f} variant="secondary" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>ベストシーズン: {guide.bestSeason}</span>
                      <ChevronRight className="size-3.5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* モバイル用「すべて見る」リンク */}
          <div className="mt-6 flex justify-center sm:hidden">
            <Link href="/area-guide">
              <Button variant="outline" className="min-h-[44px] gap-1">
                すべてのエリアを見る
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 季節の釣り特集 */}
      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
              季節の釣り特集
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              今の時期におすすめの釣り方ガイド
            </p>
          </div>
          <Link
            href="/seasonal"
            className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
          >
            すべて見る
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seasonalGuides
            .filter((g) => g.months.includes(currentMonth))
            .slice(0, 6)
            .map((guide) => (
              <Link key={guide.slug} href={`/seasonal/${guide.slug}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100">
                        <Calendar className="size-4 text-orange-600" />
                      </div>
                      <h3 className="font-semibold group-hover:text-primary">
                        {guide.title}
                      </h3>
                    </div>
                    <p className="mb-3 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                      {guide.description}
                    </p>
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {guide.method}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {guide.season}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end">
                      <ChevronRight className="size-3.5 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/seasonal">
            <Button variant="outline" className="min-h-[44px] gap-1">
              すべての特集を見る
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 最新コラム */}
      {latestPosts.length > 0 && (
        <section className="bg-muted/50 py-8 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-6 flex items-end justify-between sm:mb-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-3xl">
                  最新コラム
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  釣りに役立つ情報をお届け
                </p>
              </div>
              <Link
                href="/blog"
                className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
              >
                すべて見る
                <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {BLOG_CATEGORIES[post.category]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.publishedAt}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold leading-snug group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {post.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                          >
                            <Tag className="size-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        続きを読む
                        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* モバイル用「すべて見る」リンク */}
            <div className="mt-6 flex justify-center sm:hidden">
              <Link href="/blog">
                <Button variant="outline" className="min-h-[44px] gap-1">
                  すべてのコラムを見る
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 今月のおすすめアイテム */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <SeasonalRecommend maxItems={4} />
      </section>

      {/* 事業者向け */}
      <section className="border-t py-6 sm:py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Store className="size-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              釣具店・事業者の方へ — QRコード設置は<span className="font-medium text-foreground">完全無料</span>
            </p>
          </div>
          <Link href="/partner">
            <Button variant="outline" size="sm" className="shrink-0 gap-1">
              詳しく見る
              <ChevronRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* スマホ向け位置情報バナー */}
      <LocationPromptBanner />
    </div>
  );
}
