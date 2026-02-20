import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "潮見表・潮汐情報 - 今日の潮の動きがわかる",
  description:
    "釣りに重要な潮汐情報を無料で確認。大潮・中潮・小潮・長潮・若潮の潮回りと、時間ごとの潮位変化グラフを表示。満潮・干潮の時間がひと目でわかります。",
  openGraph: {
    title: "潮見表・潮汐情報 - 今日の潮の動きがわかる",
    description:
      "釣りに重要な潮汐情報。潮回りと潮位グラフで最適な釣り時間がわかる。",
    type: "website",
    url: "https://tsurispot.com/tides",
    siteName: "ツリスポ",
  },
  alternates: { canonical: "https://tsurispot.com/tides" },
};

export default function TidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
