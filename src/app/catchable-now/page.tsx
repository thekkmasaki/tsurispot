import { Metadata } from "next";
import { Suspense } from "react";
import { getFishSpeciesWithSpots } from "@/lib/data";
import { CatchableNowClient } from "./catchable-now-client";
import { InArticleAd } from "@/components/ads/ad-unit";

// 「今の月」がビルド時刻で焼き付かないよう日次ISR + リクエスト時算出
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const currentMonth = new Date().getMonth() + 1;

  return {
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
}

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
      {/* useSearchParams を使う Client Component は Suspense 境界が必須 */}
      <Suspense>
        <CatchableNowClient
          fishSpecies={fishSpecies}
          initialMonth={currentMonth}
        />
      </Suspense>
    </>
  );
}
