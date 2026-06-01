import type { Metadata } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import {
  RecommendationClient,
  type RecoSpot,
  type RecoPeakFish,
} from "./recommendation-client";

// ISR: 1時間ごとに再検証 (Cloudflare cache 効率と App Runner 負荷低減のため)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "おすすめ釣りスポット診断｜あなたにぴったりの釣り場を提案",
  description:
    "釣りの目的・経験レベル・狙う魚・時期から、あなたに最適な釣りスポットをパーソナライズして提案。潮汐・季節・スキルに基づくスコアリングで、今日行くべき釣り場が一発でわかる。",
  alternates: { canonical: "https://tsurispot.com/recommendation" },
  openGraph: {
    title: "おすすめ釣りスポット診断｜ツリスポ",
    description:
      "釣りの目的・経験・狙う魚から、最適な釣り場をパーソナライズ提案。",
    type: "website",
    url: "https://tsurispot.com/recommendation",
    siteName: "ツリスポ",
  },
};

// クライアントへは必要フィールドだけの軽量オブジェクトに絞って渡す（RSCペイロード/ハイドレーション削減）。
// 特に cf.fish の完全 FishSpecies を {slug,name} に削減するのが効く。
const recoSpots: RecoSpot[] = fishingSpots.map((s) => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  spotType: s.spotType,
  difficulty: s.difficulty,
  rating: s.rating,
  latitude: s.latitude,
  longitude: s.longitude,
  hasToilet: s.hasToilet,
  hasParking: s.hasParking,
  hasConvenienceStore: s.hasConvenienceStore,
  region: { prefecture: s.region.prefecture, areaName: s.region.areaName },
  catchableFish: s.catchableFish.map((cf) => ({
    fish: { slug: cf.fish.slug, name: cf.fish.name },
    method: cf.method,
    monthStart: cf.monthStart,
    monthEnd: cf.monthEnd,
    peakSeason: cf.peakSeason,
  })),
}));

const recoFishSpecies: RecoPeakFish[] = fishSpecies.map((f) => ({ peakMonths: f.peakMonths }));

export default function RecommendationPage() {
  return <RecommendationClient fishingSpots={recoSpots} fishSpecies={recoFishSpecies} />;
}
