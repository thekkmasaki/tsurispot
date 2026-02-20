import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "今日のおすすめ釣りスポット - 条件から最適な釣り場を提案",
  description:
    "潮回り・旬の魚・難易度などの条件をもとに、今日最適な釣りスポットをスコアリング。あなたに合った釣り場が見つかります。",
  openGraph: {
    title: "今日のおすすめ釣りスポット - 条件から最適な釣り場を提案",
    description:
      "潮回り・旬の魚・難易度から、今日最適な釣りスポットをスコアリング。",
    type: "website",
    url: "https://tsurispot.jp/recommendation",
    siteName: "ツリスポ",
  },
  alternates: { canonical: "https://tsurispot.jp/recommendation" },
};

export default function RecommendationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
