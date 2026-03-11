import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "魚種診断 - あなたにぴったりの釣りターゲットを見つけよう",
  description:
    "質問に答えるだけで、あなたの経験や好みに合った釣りターゲットを提案。初心者でも迷わず魚種を選べる診断ツール。",
  alternates: {
    canonical: "https://tsurispot.com/fish-finder",
  },
  openGraph: {
    title: "魚種診断 | ツリスポ",
    description:
      "質問に答えるだけで、あなたにぴったりの釣りターゲットを提案します。",
    url: "https://tsurispot.com/fish-finder",
    siteName: "ツリスポ",
  },
};

export default function FishFinderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
