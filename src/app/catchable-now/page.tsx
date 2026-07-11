import { Metadata } from "next";
import { getFishSpeciesWithSpots } from "@/lib/data";
import { CatchableNowClient } from "./catchable-now-client";
import { InArticleAd } from "@/components/ads/ad-unit";

// 現在の月を取得してタイトルに含める
const currentMonth = new Date().getMonth() + 1;

export const metadata: Metadata = {
  title: `今釣れる魚一覧【${currentMonth}月最新】- 旬の魚と釣り方ガイド`,
  description:
    `今${currentMonth}月に釣れる魚を「旬の魚」「シーズン中の魚」「来月から狙える魚」に分類して一覧で紹介。堤防・磯・サーフで今狙えるおすすめターゲットと釣り方・難易度がひと目でわかります。初心者でも釣りやすい旬の魚を見つけて釣りに出かけましょう。`,
  openGraph: {
    title: `今釣れる魚一覧【${currentMonth}月最新】- 旬の魚と釣り方ガイド`,
    description:
      `${currentMonth}月に釣れる魚を旬・シーズン・来月から狙える魚に分類して紹介。堤防・磯で狙えるおすすめターゲットと釣り方がわかります。`,
    type: "website",
    url: "https://tsurispot.com/catchable-now",
    siteName: "ツリスポ",
    images: [
      {
        url: `https://tsurispot.com/api/og?title=${encodeURIComponent(`今釣れる魚一覧【${currentMonth}月】`)}&emoji=%F0%9F%90%9F`,
        width: 1200,
        height: 630,
      },
    ],
  },
  alternates: {
    canonical: "https://tsurispot.com/catchable-now",
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
      name: "今釣れる魚",
      item: "https://tsurispot.com/catchable-now",
    },
  ],
};

export default function CatchableNowPage() {
  const currentMonth = new Date().getMonth() + 1;
  const fishSpecies = getFishSpeciesWithSpots();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <InArticleAd className="my-8" />
      <CatchableNowClient
        fishSpecies={fishSpecies}
        initialMonth={currentMonth}
      />
    </>
  );
}
