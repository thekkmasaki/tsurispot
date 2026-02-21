import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { RankingClient } from "./ranking-client";

export const metadata: Metadata = {
  title: "釣りスポット人気ランキング｜地域別おすすめ釣り場TOP10｜ツリスポ",
  description:
    "全国・地域別の釣りスポットを評価・口コミ順にランキング。北海道から沖縄まで地域別TOP10。初心者向け・ファミリー向け・夜釣りなど条件別に絞り込めます。",
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

export default function RankingPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ヘッダーグラデーション */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 px-4 py-10 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center gap-1 text-sm text-white/70">
            <a href="/" className="hover:text-white transition-colors">ホーム</a>
            <span className="text-white/50">/</span>
            <span className="text-white/90">人気ランキング</span>
          </div>
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
        <RankingClient spots={fishingSpots} />
      </div>
    </div>
  );
}
