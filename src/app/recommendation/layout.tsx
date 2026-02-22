import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "今日どこに行こうかな？ - エリア・レベル・同行者から最適な釣り場を提案",
  description:
    "エリア・潮回り・旬の魚・難易度などの条件をもとに、今日最適な釣りスポットをスコアリング。4つの質問に答えるだけであなたに合った釣り場が見つかります。",
  openGraph: {
    title: "今日どこに行こうかな？ - エリア・レベル・同行者から最適な釣り場を提案",
    description:
      "4つの質問に答えるだけ！エリア・潮回り・旬の魚・難易度から、今日最適な釣りスポットをスコアリング。",
    type: "website",
    url: "https://tsurispot.com/recommendation",
    siteName: "ツリスポ",
  },
  alternates: { canonical: "https://tsurispot.com/recommendation" },
};

export default function RecommendationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
