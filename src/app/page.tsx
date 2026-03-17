import type { Metadata } from "next";
import Link from "next/link";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { getLatestBlogPostsAsync, BLOG_CATEGORIES } from "@/lib/data/blog";
import { prefectures } from "@/lib/data/prefectures";
import { monthlyGuides } from "@/lib/data/monthly-guides";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Fish,
  ArrowRight,
  Waves,
  BookOpen,
  ChevronRight,
  Calendar,
  Compass,
  Tag,
  Target,
  Navigation,
  Star,
  Trophy,
} from "lucide-react";
import dynamic from "next/dynamic";
import { HomeSearchBar } from "@/components/home-search-bar";
import { HomeSeasonalFish } from "@/components/home-seasonal-fish";
import { HomePopularSpots } from "@/components/home-popular-spots";
import { SectionErrorBoundary } from "@/components/ui/section-error-boundary";


// Below-the-fold client components loaded lazily
const NearbySpots = dynamic(() => import("@/components/nearby-spots").then((m) => m.NearbySpots), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
    </div>
  ),
});
const LocationPromptBanner = dynamic(() => import("@/components/location-prompt-banner").then((m) => m.LocationPromptBanner), {
  loading: () => <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />,
});
const SeasonalRecommend = dynamic(() => import("@/components/affiliate/seasonal-recommend").then((m) => m.SeasonalRecommend), {
  loading: () => <div className="h-32 w-full animate-pulse rounded-xl bg-muted" />,
});
const OnlineUsersBadge = dynamic(() => import("@/components/online-users-badge").then((m) => m.OnlineUsersBadge), {
  loading: () => <div className="inline-flex h-7 w-28 animate-pulse rounded-full bg-white/10" />,
});

const spotCount = fishingSpots.length.toLocaleString();
const fishCount = fishSpecies.length;

// ブログ記事はmicroCMSから動的取得するため、ISRで定期更新
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ツリスポ - 近くの釣り場が見つかる釣りスポット検索",
  description: `全国${spotCount}箇所以上の釣りスポットと${fishCount}種以上の魚種図鑑を無料で検索。堤防・漁港・磯の海釣りから渓流・湖の川釣りまで網羅。今釣れる魚・混雑予想・初心者向け穴場・潮汐情報が一目でわかる。`,
  openGraph: {
    title: "ツリスポ - 近くの釣り場が見つかる釣りスポット検索",
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

// lightSpots は廃止: NearbySpots が /api/spots/nearby からAPI取得するため不要

// WebSite + Organization は layout.tsx に統一（重複排除）

const homeSpeakableJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "ツリスポ - 近くの釣り場・釣りスポット検索",
  url: "https://tsurispot.com",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".hero-description"],
  },
};

const homeDatasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "ツリスポ - 日本の釣りスポット・魚種総合データベース",
  description: `日本全国${fishingSpots.length}箇所以上の釣りスポットと${fishSpecies.length}種以上の魚種情報を収録した総合釣り情報データベース。位置情報・釣れる魚・設備・混雑予想・おすすめタックルなどを網羅。`,
  url: "https://tsurispot.com",
  license: "https://tsurispot.com/terms",
  creator: {
    "@type": "Organization",
    name: "ツリスポ編集部",
    url: "https://tsurispot.com",
  },
  distribution: [
    {
      "@type": "DataDownload",
      encodingFormat: "text/html",
      contentUrl: "https://tsurispot.com/spots",
      name: "釣りスポット一覧",
    },
    {
      "@type": "DataDownload",
      encodingFormat: "text/html",
      contentUrl: "https://tsurispot.com/fish",
      name: "魚種図鑑",
    },
  ],
  spatialCoverage: {
    "@type": "Place",
    name: "Japan",
    geo: {
      "@type": "GeoShape",
      box: "24.0 122.9 45.6 145.8",
    },
  },
  variableMeasured: [
    "釣り場名・位置情報（緯度・経度）",
    "スポットタイプ（堤防・漁港・磯・河川等）",
    "釣れる魚種・旬の時期",
    "難易度・設備情報",
    "混雑予想・おすすめタックル",
  ],
  measurementTechnique: "現地調査・公開情報の集約・専門家による監修",
  keywords: ["釣りスポット", "釣り場", "魚種図鑑", "フィッシング", "日本", "釣り情報"],
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
        text: `ツリスポでは、GPSを使って現在地から近い釣り場を自動で表示します。トップページの「近くの釣り場」ボタンを押すか、地図ページから周辺の釣りスポットを検索できます。全国${spotCount}箇所以上の釣り場から最寄りのスポットが見つかります。`,
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

export default async function Home() {
  // 評価順にトップ30件を軽量データ化してクライアントへ（200→30に削減でHTMLサイズ大幅縮小）
  const popularSpotsData = fishingSpots
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 30)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      spotType: s.spotType,
      rating: s.rating,
      latitude: s.latitude,
      longitude: s.longitude,
      prefecture: s.region.prefecture,
      areaName: s.region.areaName,
      difficulty: s.difficulty,
      mainImageUrl: s.mainImageUrl,
      fishNames: s.catchableFish.slice(0, 6).map((cf) => cf.fish.name),
    }));
  const latestPosts = await getLatestBlogPostsAsync(3);

  // Stats for hero section
  const totalSpots = fishingSpots.length;
  const totalFishSpecies = fishSpecies.length;
  const totalPrefectures = new Set(fishingSpots.map((s) => s.region.prefecture)).size;


  const popularSpotsItemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "人気の釣りスポット",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: 6,
    itemListElement: popularSpotsData.slice(0, 6).map((spot, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://tsurispot.com/spots/${spot.slug}`,
      name: spot.name,
    })),
  };

  const homeJsonLdArray = [
    homeFaqJsonLd,
    popularSpotsItemListJsonLd,
    homeSpeakableJsonLd,
    homeDatasetJsonLd,
  ];

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLdArray) }}
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
              aria-hidden="true"
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
              <Waves className="size-4" aria-hidden="true" />
              <span>海釣り・川釣り 総合情報サイト</span>
            </div>

            <h1 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-white text-balance sm:mb-4 sm:text-4xl lg:text-5xl">
              今週末、
              <br className="sm:hidden" />
              釣りに行こう。
            </h1>

            <p className="mb-4 max-w-lg text-sm text-blue-100 sm:mb-5 sm:text-lg">
              道具がなくても、経験がなくても大丈夫。
              <br className="hidden sm:inline" />
              近くの釣り場で、最高の1匹に出会おう。
            </p>

            {/* スポット数統計 */}
            <div className="mb-5 flex items-center justify-center gap-4 text-xs text-blue-200/90 sm:mb-7 sm:gap-6 sm:text-sm">
              <Link href="/spots" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <MapPin className="size-3.5 sm:size-4" />
                <span>全国<strong className="font-bold text-white">{totalSpots.toLocaleString()}</strong>スポット</span>
              </Link>
              <div className="h-3 w-px bg-white/30" />
              <Link href="/fish" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <Fish className="size-3.5 sm:size-4" />
                <span><strong className="font-bold text-white">{totalFishSpecies}</strong>魚種</span>
              </Link>
              <div className="h-3 w-px bg-white/30" />
              <Link href="/prefecture" className="flex items-center gap-1.5 transition-colors hover:text-white">
                <Compass className="size-3.5 sm:size-4" />
                <span><strong className="font-bold text-white">{totalPrefectures}</strong>都道府県</span>
              </Link>
            </div>

            {/* 検索バー */}
            <HomeSearchBar />

            {/* メインCTA */}
            <div className="mb-4 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/map" className="w-full sm:w-auto">
                <Button size="lg" className="w-full gap-2 bg-amber-500 px-8 py-6 text-base font-bold text-white shadow-lg transition-[background-color,box-shadow,transform] hover:bg-amber-400 hover:shadow-xl hover:scale-[1.02] sm:w-auto sm:text-lg min-h-[52px]">
                  <MapPin className="size-5" />
                  近くの釣り場を探す
                </Button>
              </Link>
              <div className="flex gap-3">
                <Link href="/for-beginners">
                  <Button variant="outline" size="lg" className="gap-1.5 border-white/40 bg-white/10 text-white backdrop-blur-sm transition-[background-color,transform] hover:bg-white/20 hover:scale-[1.02] min-h-[48px]">
                    <BookOpen className="size-4" />
                    初心者ガイド
                  </Button>
                </Link>
                <Link href="/catchable-now">
                  <Button variant="outline" size="lg" className="gap-1.5 border-white/40 bg-white/10 text-white backdrop-blur-sm transition-[background-color,transform] hover:bg-white/20 hover:scale-[1.02] min-h-[48px]">
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
            aria-hidden="true"
          >
            <path
              d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>


      {/* 名言セクション + コンパクト統計 */}
      <section className="bg-slate-50/80 py-6 sm:py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <blockquote className="space-y-3">
            <div className="space-y-1 text-xs leading-relaxed text-slate-400 sm:text-sm sm:leading-loose">
              <p>一時間、幸せになりたかったら酒を飲みなさい。</p>
              <p>三日間、幸せになりたかったら結婚しなさい。</p>
              <p>八日間、幸せになりたかったら豚を殺して食べなさい。</p>
            </div>
            <p className="text-sm font-semibold tracking-wide text-slate-700 sm:text-base">
              永遠に、幸せになりたかったら釣りを覚えなさい。
            </p>
            <footer className="text-[10px] text-slate-400 sm:text-xs">
              ― 開高健『オーパ！』より
            </footer>
          </blockquote>
          <div className="mt-5 flex items-center justify-center gap-4 text-xs text-muted-foreground sm:gap-8 sm:text-sm">
            <Link href="/spots" className="transition-colors hover:text-primary">
              <span className="block text-lg font-bold text-primary sm:text-2xl">{totalSpots.toLocaleString()}+</span>
              釣りスポット
            </Link>
            <div className="h-8 w-px bg-border" />
            <Link href="/fish" className="transition-colors hover:text-primary">
              <span className="block text-lg font-bold text-primary sm:text-2xl">{totalFishSpecies}+</span>
              魚種図鑑
            </Link>
            <div className="h-8 w-px bg-border" />
            <Link href="/prefecture" className="transition-colors hover:text-primary">
              <span className="block text-lg font-bold text-primary sm:text-2xl">{totalPrefectures}</span>
              都道府県
            </Link>
          </div>
        </div>
      </section>

      {/* クイックアクション */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          <Link href="/map">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-sky-50 p-3 transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-sky-100 sm:size-12">
                <MapPin className="size-5 text-sky-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                地図で探す
              </span>
            </div>
          </Link>
          <Link href="/catchable-now">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-orange-50 p-3 transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-orange-100 sm:size-12">
                <Fish className="size-5 text-orange-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                今釣れる魚
              </span>
            </div>
          </Link>
          <Link href="/fish-finder">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-purple-50 p-3 transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 sm:size-12">
                <Target className="size-5 text-purple-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                釣り場診断
              </span>
            </div>
          </Link>
          <Link href="/for-beginners">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-emerald-50 p-3 transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 sm:size-12">
                <BookOpen className="size-5 text-emerald-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                はじめての方
              </span>
            </div>
          </Link>
          <Link href="/fishing-calendar">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-blue-50 p-3 transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 sm:size-12">
                <Calendar className="size-5 text-blue-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                月別カレンダー
              </span>
            </div>
          </Link>
          <Link href="/fishing-spots/near-me">
            <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-amber-50 p-3 transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 sm:gap-2 sm:p-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 sm:size-12">
                <Navigation className="size-5 text-amber-600 sm:size-6" />
              </div>
              <span className="text-center text-[11px] font-medium leading-tight sm:text-xs">
                近くの釣り場
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 人気の釣り方ガイド */}
      <section className="bg-muted/50 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
                釣り方ガイド
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                初心者から上級者まで、釣り方を完全解説
              </p>
            </div>
            <Link
              href="/guide"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
            >
              すべて見る
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/guide/sabiki", title: "サビキ釣り", desc: "堤防で手軽にアジ・サバ・イワシ", badge: "初心者向け", badgeClass: "bg-green-100 text-green-800" },
              { href: "/guide/choinage", title: "ちょい投げ", desc: "キスやハゼを狙う投げ釣り入門", badge: "初心者向け", badgeClass: "bg-green-100 text-green-800" },
              { href: "/guide/eging", title: "エギング", desc: "アオリイカを狙うルアー釣り", badge: "中級", badgeClass: "bg-blue-100 text-blue-800" },
              { href: "/guide/jigging", title: "ショアジギング", desc: "メタルジグで青物を狙う", badge: "中〜上級", badgeClass: "bg-orange-100 text-orange-800" },
              { href: "/guide/float-fishing", title: "ウキ釣り", desc: "メジナやクロダイをウキで狙う", badge: "初〜中級", badgeClass: "bg-blue-100 text-blue-800" },
              { href: "/guide/anazuri", title: "穴釣り", desc: "テトラの隙間でカサゴ・メバル", badge: "初心者向け", badgeClass: "bg-green-100 text-green-800" },
              { href: "/guide/lure", title: "ルアー釣り", desc: "シーバスやヒラメをルアーで", badge: "中級", badgeClass: "bg-blue-100 text-blue-800" },
              { href: "/guide/night-fishing", title: "ナイトフィッシング", desc: "夜の堤防でメバル・アジを狙う", badge: "初〜中級", badgeClass: "bg-blue-100 text-blue-800" },
            ].map((guide) => (
              <Link key={guide.href} href={guide.href}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold group-hover:text-primary">{guide.title}</h3>
                      <Badge className={`text-[10px] ${guide.badgeClass}`}>{guide.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{guide.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              { href: "/guide/knots", label: "結び方" },
              { href: "/guide/line", label: "ライン" },
              { href: "/guide/rigs", label: "仕掛け" },
              { href: "/guide/sinker", label: "オモリ" },
              { href: "/guide/tide", label: "潮汐" },
              { href: "/guide/casting", label: "キャスティング" },
              { href: "/guide/budget", label: "予算別" },
              { href: "/guide/family", label: "ファミリー" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <Badge variant="outline" className="cursor-pointer px-2.5 py-1 text-xs transition-colors hover:bg-primary hover:text-white">
                  {item.label}
                </Badge>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex justify-center sm:hidden">
            <Link href="/guide">
              <Button variant="outline" className="min-h-[44px] gap-1">
                すべてのガイドを見る
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 季節の釣りガイド */}
      {(() => {
        const currentMonth = new Date().getMonth() + 1;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const currentGuide = monthlyGuides.find((g) => g.month === currentMonth);
        const nextGuide = monthlyGuides.find((g) => g.month === nextMonth);
        const seasonSlug = currentMonth >= 3 && currentMonth <= 5 ? "spring" : currentMonth >= 6 && currentMonth <= 8 ? "summer" : currentMonth >= 9 && currentMonth <= 11 ? "autumn" : "winter";
        const seasonLabel = seasonSlug === "spring" ? "春" : seasonSlug === "summer" ? "夏" : seasonSlug === "autumn" ? "秋" : "冬";
        return (
          <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
                季節の釣りガイド
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                今の時期にぴったりの釣り情報をチェック
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {currentGuide && (
                <Link href={`/monthly/${currentGuide.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md border-primary/30 bg-primary/5">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge className="bg-primary text-white text-[10px]">今月</Badge>
                        <span className="text-lg">{currentGuide.emoji}</span>
                      </div>
                      <h3 className="mb-1 font-semibold group-hover:text-primary">{currentGuide.nameJa}の釣りガイド</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{currentGuide.description.slice(0, 80)}...</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {currentGuide.topFish.slice(0, 3).map((f) => {
                          const fish = fishSpecies.find((fs) => fs.slug === f);
                          return fish ? (
                            <Badge key={f} variant="outline" className="text-[10px]">{fish.name}</Badge>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
              {nextGuide && (
                <Link href={`/monthly/${nextGuide.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">来月</Badge>
                        <span className="text-lg">{nextGuide.emoji}</span>
                      </div>
                      <h3 className="mb-1 font-semibold group-hover:text-primary">{nextGuide.nameJa}の釣りガイド</h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{nextGuide.description.slice(0, 80)}...</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {nextGuide.topFish.slice(0, 3).map((f) => {
                          const fish = fishSpecies.find((fs) => fs.slug === f);
                          return fish ? (
                            <Badge key={f} variant="outline" className="text-[10px]">{fish.name}</Badge>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
              <Link href={`/seasonal/${seasonSlug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Calendar className="size-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary">{seasonLabel}の釣り総合ガイド</h3>
                      <p className="text-xs text-muted-foreground">{seasonLabel}シーズンのおすすめスポット・魚種・釣り方</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/fishing-calendar">
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Calendar className="size-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary">年間釣りカレンダー</h3>
                      <p className="text-xs text-muted-foreground">月ごとの釣れる魚・おすすめの釣り方を一覧で</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </section>
        );
      })()}

      {/* 近くの釣りスポット */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <NearbySpots />
      </section>

      {/* 人気の釣りスポット（位置情報対応） */}
      <HomePopularSpots spots={popularSpotsData} />

      {/* 今釣れる魚セクション */}
      <SectionErrorBoundary>
        <HomeSeasonalFish />
      </SectionErrorBoundary>

      {/* 今月おすすめの釣り場 */}
      {(() => {
        const currentMonth = new Date().getMonth() + 1;
        const SPOT_TYPE_LABELS: Record<string, string> = {
          port: "漁港", beach: "砂浜", rocky: "磯", river: "河川", pier: "桟橋", breakwater: "堤防",
        };
        const DIFFICULTY_LABELS: Record<string, string> = {
          beginner: "初心者向け", intermediate: "中級者向け", advanced: "上級者向け",
        };
        const DIFFICULTY_COLORS: Record<string, string> = {
          beginner: "bg-green-100 text-green-800", intermediate: "bg-blue-100 text-blue-800", advanced: "bg-orange-100 text-orange-800",
        };
        const seasonalSpots = fishingSpots
          .filter((spot) =>
            spot.catchableFish.some((cf) => {
              if (cf.monthStart <= cf.monthEnd) {
                return cf.monthStart <= currentMonth && cf.monthEnd >= currentMonth;
              }
              return currentMonth >= cf.monthStart || currentMonth <= cf.monthEnd;
            })
          )
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 6);

        return seasonalSpots.length > 0 ? (
          <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
            <div className="mb-6 flex items-end justify-between sm:mb-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
                  今月おすすめの釣り場
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentMonth}月に釣れる魚がいるスポットをピックアップ
                </p>
              </div>
              <Link
                href="/catchable-now"
                className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
              >
                もっと見る
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seasonalSpots.map((spot) => {
                const catchableNow = spot.catchableFish
                  .filter((cf) => {
                    if (cf.monthStart <= cf.monthEnd) {
                      return cf.monthStart <= currentMonth && cf.monthEnd >= currentMonth;
                    }
                    return currentMonth >= cf.monthStart || currentMonth <= cf.monthEnd;
                  })
                  .slice(0, 3);
                return (
                  <Link key={spot.id} href={`/spots/${spot.slug}`}>
                    <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold group-hover:text-primary">{spot.name}</h3>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="size-3 shrink-0" />
                              {spot.region.prefecture} {spot.region.areaName}
                            </p>
                          </div>
                          <Badge className={`shrink-0 text-[10px] ${DIFFICULTY_COLORS[spot.difficulty] || ""}`}>
                            {DIFFICULTY_LABELS[spot.difficulty] || spot.difficulty}
                          </Badge>
                        </div>
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {SPOT_TYPE_LABELS[spot.spotType] || spot.spotType}
                          </Badge>
                          <div className="flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="size-3 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{spot.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] text-muted-foreground">今月釣れる:</span>
                          {catchableNow.map((cf) => (
                            <Badge key={cf.fish.slug} variant="secondary" className="text-[10px]">
                              {cf.fish.name}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 flex justify-center sm:hidden">
              <Link href="/catchable-now">
                <Button variant="outline" className="min-h-[44px] gap-1">
                  もっと見る
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </section>
        ) : null;
      })()}

      {/* 人気スポットTOP10 */}
      {(() => {
        const SPOT_TYPE_LABELS_TOP: Record<string, string> = {
          port: "漁港", beach: "砂浜", rocky: "磯", river: "河川", pier: "桟橋", breakwater: "堤防",
        };
        const top10 = fishingSpots
          .slice()
          .sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount))
          .slice(0, 10);
        return (
          <section className="bg-muted/50 py-8 sm:py-12">
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
              <div className="mb-6 flex items-end justify-between sm:mb-8">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
                    人気スポット TOP10
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    評価とレビュー数で選ぶ注目の釣り場
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
              <div className="space-y-1.5">
                {top10.map((spot, index) => (
                  <Link key={spot.id} href={`/spots/${spot.slug}`} className="block">
                    <div className="flex items-center gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${index < 3 ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">{spot.name}</p>
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {SPOT_TYPE_LABELS_TOP[spot.spotType] || spot.spotType}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{spot.region.prefecture} {spot.region.areaName}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-xs">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{spot.rating.toFixed(1)}</span>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 flex justify-center sm:hidden">
                <Link href="/spots">
                  <Button variant="outline" className="min-h-[44px] gap-1">
                    すべてのスポットを見る
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* 人気のエリア */}
      <section className="bg-muted/50 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between sm:mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
                人気のエリアで釣り場を探す
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                都道府県別の釣りスポット・釣れる魚情報
              </p>
            </div>
            <Link
              href="/prefecture"
              className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex"
            >
              すべての都道府県
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {(() => {
              // 人気の都道府県（スポット数順）
              const prefSpotCounts = prefectures
                .map((pref) => ({
                  ...pref,
                  spotCount: fishingSpots.filter((s) => s.region.prefecture === pref.name).length,
                }))
                .filter((p) => p.spotCount > 0)
                .sort((a, b) => b.spotCount - a.spotCount)
                .slice(0, 12);
              return prefSpotCounts.map((pref) => (
                <Link key={pref.slug} href={`/prefecture/${pref.slug}`} title={`${pref.name}の釣りスポット${pref.spotCount}件`}>
                  <div className="flex items-center justify-between gap-2 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{pref.nameShort}</p>
                      <p className="text-xs text-muted-foreground">{pref.spotCount}スポット</p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </Link>
              ));
            })()}
          </div>
          <div className="mt-6 flex justify-center sm:hidden">
            <Link href="/prefecture">
              <Button variant="outline" className="min-h-[44px] gap-1">
                すべての都道府県を見る
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 最新コラム */}
      {latestPosts.length > 0 && (
        <section className="bg-muted/50 py-8 sm:py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-6 flex items-end justify-between sm:mb-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-pretty sm:text-3xl">
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


      {/* スマホ向け位置情報バナー */}
      <LocationPromptBanner />
    </div>
  );
}
