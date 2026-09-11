import type { Metadata } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { getSpotsForArea, getAllAreaGroups } from "@/lib/data/area-groups";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { AreaListFilter } from "@/components/area/area-list-filter";
import { InArticleAd, NativeAdBreak } from "@/components/ads/ad-unit";

export const metadata: Metadata = {
  title: "全国の釣りエリア一覧 - 都道府県別に釣りスポットを探す",
  description:
    "全国の釣りエリアを都道府県別に一覧表示。北海道から沖縄まで、各地域の釣りスポット数や特徴がひと目でわかります。あなたの近くの釣り場を探しましょう。",
  openGraph: {
    title: "全国の釣りエリア一覧 - 都道府県別に釣りスポットを探す",
    description:
      "全国の釣りエリアを都道府県別に一覧表示。各地域の釣りスポット数や特徴がひと目でわかります。",
    type: "website",
    url: "https://tsurispot.com/area",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/area",
  },
};

function buildPrefectureGroups() {
  const grouped = new Map<
    string,
    { prefecture: string; regions: { id: string; slug: string; areaName: string; prefecture: string; spotCount: number; topFish: string[] }[] }
  >();

  // 市区町村単位・代表slugのみを列挙（エリアページの canonical 集約先と一致させ、
  // 内部リンクを代表URLへ集中させる。分割された薄いエリアの重複列挙も解消）。
  for (const g of getAllAreaGroups()) {
    const spots = getSpotsForArea(g.slug);
    const fishMap = new Map<string, number>();
    for (const spot of spots) {
      for (const cf of spot.catchableFish) {
        fishMap.set(cf.fish.name, (fishMap.get(cf.fish.name) || 0) + 1);
      }
    }
    const topFish = Array.from(fishMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const item = {
      id: g.slug,
      slug: g.slug,
      areaName: g.municipalityName,
      prefecture: g.prefecture,
      spotCount: g.count,
      topFish,
    };

    const existing = grouped.get(g.prefecture);
    if (existing) {
      existing.regions.push(item);
    } else {
      grouped.set(g.prefecture, {
        prefecture: g.prefecture,
        regions: [item],
      });
    }
  }

  return Array.from(grouped.values()).map((g) => ({
    ...g,
    totalSpots: g.regions.reduce((sum, r) => sum + r.spotCount, 0),
  }));
}

export default function AreaListPage() {
  const groups = buildPrefectureGroups();
  const totalSpots = fishingSpots.length;
  const totalRegions = getAllAreaGroups().length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "全国の釣りエリア一覧",
    description: "都道府県別の釣りエリア一覧",
    numberOfItems: totalRegions,
    itemListElement: getAllAreaGroups().map((g, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${g.prefecture} ${g.municipalityName}`,
      url: `https://tsurispot.com/area/${g.slug}`,
    })),
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
        name: "釣りエリア一覧",
        item: "https://tsurispot.com/area",
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "エリア" },
        ]}
      />
      <div className="mb-5 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          全国の釣りエリア一覧
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
          {totalRegions}エリア・{totalSpots}スポットの釣り場情報を都道府県別に掲載
        </p>
      </div>

      <AreaListFilter groups={groups} />

      <NativeAdBreak className="my-6" />

      <InArticleAd className="my-8" />
    </div>
  );
}
