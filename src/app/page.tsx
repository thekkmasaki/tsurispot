import type { Metadata } from "next";
import Link from "next/link";
import { fishingSpots } from "@/lib/data/spots";
import { getCatchableNow, fishSpecies } from "@/lib/data/fish";
import { areaGuides } from "@/lib/data/area-guides";
import { prefectures } from "@/lib/data/prefectures";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Star,
  Fish,
  ArrowRight,
  Waves,
  BookOpen,
  ChevronRight,
  Store,
  Mail,
  Skull,
  TriangleAlert,
  Calendar,
  TreePine,
  Anchor,
  Compass,
} from "lucide-react";
import { NearbySpots } from "@/components/nearby-spots";
import { LocationRecommendations } from "@/components/location-recommendations";
import { OnlineUsersBadge } from "@/components/online-users-badge";
import { SpotImage, FishImage } from "@/components/ui/spot-image";
import { HomeSearchBar } from "@/components/home-search-bar";

export const metadata: Metadata = {
  title: "ツリスポ - 海釣り・川釣りスポット総合情報サイト｜全国の釣り場を地図で検索",
  description:
    "海釣りも川釣りも！全国の釣りスポットを地図で簡単検索。堤防・漁港・磯の海釣りから、渓流・湖・管理釣り場の淡水釣りまで。今の時期に釣れる魚、おすすめの仕掛け情報を網羅した釣りスポット総合情報サイト。",
  openGraph: {
    title: "ツリスポ - 釣りスポット総合情報サイト",
    description:
      "全国の釣りスポットを地図で簡単検索。今釣れる魚やベスト時間帯、おすすめの仕掛け情報まで網羅した釣り情報サイト。",
    type: "website",
    url: "https://tsurispot.com",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com",
  },
};

const SPOT_TYPE_FILTERS = [
  { label: "堤防", type: "breakwater" },
  { label: "磯", type: "rocky" },
  { label: "漁港", type: "port" },
  { label: "川", type: "river" },
] as const;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ツリスポ",
  url: "https://tsurispot.com",
  description:
    "全国の釣りスポットを地図で簡単検索。今釣れる魚やベスト時間帯、おすすめの仕掛け情報まで網羅した釣り情報サイト。",
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
  sameAs: [],
  description:
    "釣りスポット総合情報サイト。全国の釣り場を地図で検索でき、今釣れる魚やおすすめの仕掛け情報を提供しています。",
};

export default function Home() {
  const currentMonth = new Date().getMonth() + 1;
  const catchableNow = getCatchableNow(currentMonth);
  const popularSpots = fishingSpots.slice(0, 6);

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
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-[#0C4A6E] to-indigo-800">
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
              地図で見つける、
              <br className="sm:hidden" />
              あなたの釣りスポット
            </h1>

            <p className="mb-6 max-w-lg text-sm text-blue-100 sm:mb-8 sm:text-lg">
              今の時期に何が釣れるか、一目でわかる。
              <br className="hidden sm:inline" />
              初心者でも安心の釣り場ガイド付き。
            </p>

            {/* 検索バー */}
            <HomeSearchBar />

            {/* フィルタータグ - 海釣り・川釣り両方 */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-sky-500/30 px-2.5 py-0.5 text-xs text-sky-100 backdrop-blur-sm">
                <Anchor className="size-3" />
                海釣り
              </span>
              {SPOT_TYPE_FILTERS.filter(f => f.type !== "river").map((filter) => (
                <Link key={filter.type} href={`/spots?type=${filter.type}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer border-white/40 bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-white/20 min-h-[36px] flex items-center"
                  >
                    {filter.label}
                  </Badge>
                </Link>
              ))}
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/30 px-2.5 py-0.5 text-xs text-emerald-100 backdrop-blur-sm">
                <TreePine className="size-3" />
                川・湖釣り
              </span>
              <Link href="/spots?type=river">
                <Badge
                  variant="outline"
                  className="cursor-pointer border-emerald-300/50 bg-emerald-500/15 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-emerald-500/25 min-h-[36px] flex items-center"
                >
                  河川・渓流
                </Badge>
              </Link>
              <Link href="/map">
                <Badge
                  variant="outline"
                  className="cursor-pointer border-amber-300/60 bg-amber-500/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-colors hover:bg-amber-500/30 min-h-[36px] flex items-center gap-1"
                >
                  <MapPin className="size-3.5" />
                  地図で探す
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

      {/* 近くの釣りスポット */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 sm:pt-12">
        <NearbySpots allSpots={fishingSpots} />
      </section>

      {/* 現在地ベースのおすすめ記事 */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 sm:pt-10">
        <LocationRecommendations
          allSpots={fishingSpots}
          prefectures={prefectures}
          areaGuides={areaGuides}
        />
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
                  src={spot.mainImageUrl?.startsWith("http") ? spot.mainImageUrl : undefined}
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
            <Button variant="outline" className="gap-1">
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
              <Button variant="outline" className="gap-1">
                すべての魚を見る
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 月別釣りカレンダーCTA */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/fishing-calendar">
          <Card className="group overflow-hidden border-0 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 px-5 py-5 sm:gap-6 sm:px-8 sm:py-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:size-14">
                <Calendar className="size-6 text-blue-600 sm:size-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold tracking-tight sm:text-xl">
                  月別釣りカレンダー
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                  1月〜12月、何月に何が釣れる？旬の魚がひと目でわかる
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 sm:size-6" />
            </CardContent>
          </Card>
        </Link>
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
              <Button variant="outline" className="gap-1">
                すべてのエリアを見る
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 初心者向けCTAセクション */}
      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 shadow-sm">
          <CardContent className="flex flex-col items-center gap-5 px-5 py-8 text-center sm:gap-6 sm:px-12 sm:py-14">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100">
              <BookOpen className="size-7 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                釣りを始めてみたい方へ
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
                道具の選び方から釣り場でのマナーまで、初心者に必要な情報をまとめました。まずはここからスタートしましょう。
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/guide">
                <Button size="lg" className="min-h-[44px] gap-1.5 bg-[#D97706] px-6 hover:bg-[#B45309]">
                  初心者ガイドを読む
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
              <Link href="/fish">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-h-[44px] gap-1.5 px-6"
                >
                  今釣れる魚を見る
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 事業者向けCTA */}
      <section className="border-t bg-gradient-to-b from-slate-50 to-slate-100 py-10 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Store className="size-4" />
            事業者様向け
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            釣具店・釣り関連事業者の皆様へ
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
            ツリスポでは、釣具店やレンタルボート店、遊漁船など釣り関連事業者様との提携を募集しています。
            地図上への店舗掲載やスポットページでのPR枠など、集客につながるプランをご用意しています。
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/partner">
              <Button size="lg" className="min-h-[44px] gap-2 px-6">
                <Store className="size-4" />
                掲載・提携のご案内
              </Button>
            </Link>
            <Link href="/partner#contact">
              <Button variant="outline" size="lg" className="min-h-[44px] gap-2 px-6">
                <Mail className="size-4" />
                お問い合わせ
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            釣りメディア・YouTuber様のコラボレーションも歓迎です
          </p>
        </div>
      </section>
    </div>
  );
}
