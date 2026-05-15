import type { Metadata } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { RecommendationClient } from "./recommendation-client";

export const dynamic = "force-static";
export const revalidate = 86400;

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

export default function RecommendationPage() {
  return <RecommendationClient fishingSpots={fishingSpots} fishSpecies={fishSpecies} />;
}
