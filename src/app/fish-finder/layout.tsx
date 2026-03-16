import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "魚種診断 - あなたにぴったりの釣りターゲットを見つけよう",
  description:
    "釣り経験・好みの釣り方・行きたい場所などの質問に答えるだけで、あなたにぴったりの釣りターゲットを提案。おすすめの釣り方・時期・スポット情報もあわせて表示するので、初心者でも迷わず魚種を選べる無料の診断ツールです。",
  alternates: {
    canonical: "https://tsurispot.com/fish-finder",
  },
  openGraph: {
    title: "魚種診断 | ツリスポ",
    description:
      "釣り経験・好みの釣り方・場所を選ぶだけで、ぴったりの釣りターゲットを提案。おすすめの釣り方・時期・スポット情報も表示する無料診断ツール。",
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
