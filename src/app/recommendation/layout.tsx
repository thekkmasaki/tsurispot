import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "今週どこ行こうかな？ - 日付・エリア・レベルから最適な釣り場を提案",
  description:
    "行きたい日を選んで、潮回り・旬の魚・難易度から最適な釣りスポットを提案。5つの質問に答えるだけであなたにぴったりの釣り場が見つかります。",
  openGraph: {
    title: "今週どこ行こうかな？ - 日付・エリア・レベルから最適な釣り場を提案",
    description:
      "行きたい日を選んで、潮回り・旬の魚・難易度から最適な釣りスポットを提案。5つの質問に答えるだけで釣り場が見つかります。",
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
