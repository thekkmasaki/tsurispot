import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { RankingClient, type RankingSpot } from "./ranking-client";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "釣りスポット人気ランキング｜地域別おすすめ釣り場TOP10｜ツリスポ",
  description:
    "全国1,000箇所以上の釣りスポットを評価順にランキング。北海道から沖縄まで47都道府県の地域別TOP10を公開。初心者向け・ファミリー・夜釣りなど条件別に今すぐ比較。",
  openGraph: {
    title: "釣りスポット人気ランキング｜地域別おすすめ釣り場TOP10｜ツリスポ",
    description:
      "全国・地域別の釣りスポットを評価順にランキング。地域別TOP10で自分にぴったりの釣り場を見つけよう。",
    type: "website",
    url: "https://tsurispot.com/ranking",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/ranking",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "釣りスポット人気ランキング｜地域別おすすめ釣り場TOP10",
  url: "https://tsurispot.com/ranking",
  dateModified: "2026-02-28",
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
      name: "人気ランキング",
      item: "https://tsurispot.com/ranking",
    },
  ],
};

// ItemList JSON-LD for ranking page (top 10)
const itemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "釣りスポット人気ランキング",
  itemListElement: fishingSpots
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, 10)
    .map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://tsurispot.com/spots/${s.slug}`,
    })),
};

// サーバー側で軽量データに変換（RSCペイロードの30MB超過を防止）
const rankingSpots: RankingSpot[] = fishingSpots.map((s) => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  rating: s.rating,
  reviewCount: s.reviewCount,
  prefecture: s.region.prefecture,
  spotType: s.spotType,
  difficulty: s.difficulty,
  latitude: s.latitude,
  longitude: s.longitude,
  hasParking: s.hasParking,
  hasToilet: s.hasToilet,
  hasRentalRod: s.hasRentalRod,
  isFree: s.isFree,
  fishCount: s.catchableFish.length,
  topFish: s.catchableFish.slice(0, 3).map((cf) => ({ id: cf.fish.id, name: cf.fish.name })),
  bestTimes: s.bestTimes.map((t) => ({ label: t.label, rating: t.rating })),
}));

export default function RankingPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* ヘッダーグラデーション */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Trophy className="h-7 w-7 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">釣りスポット人気ランキング</h1>
              <p className="mt-0.5 text-sm text-white/80">地域別おすすめ釣り場TOP10</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/80">
            評価スコアをもとに全国の釣りスポットをランキング。カテゴリ別フィルターで自分にぴったりの釣り場が見つかります。
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
        <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "人気ランキング" }]} />
        <RankingClient spots={rankingSpots} />
      </div>
    </div>
  );
}
