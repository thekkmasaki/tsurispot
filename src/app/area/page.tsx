import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { regions } from "@/lib/data/regions";
import { fishingSpots } from "@/lib/data/spots";
import { Breadcrumb } from "@/components/ui/breadcrumb";

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

// Group regions by prefecture
function getRegionsByPrefecture() {
  const grouped = new Map<
    string,
    { prefecture: string; regions: typeof regions }
  >();

  for (const region of regions) {
    const existing = grouped.get(region.prefecture);
    if (existing) {
      existing.regions.push(region);
    } else {
      grouped.set(region.prefecture, {
        prefecture: region.prefecture,
        regions: [region],
      });
    }
  }
  return Array.from(grouped.values());
}

function getSpotCountForRegion(regionId: string) {
  return fishingSpots.filter((s) => s.region.id === regionId).length;
}

function getTopFishForRegion(regionId: string): string[] {
  const fishMap = new Map<string, number>();
  for (const spot of fishingSpots) {
    if (spot.region.id !== regionId) continue;
    for (const cf of spot.catchableFish) {
      fishMap.set(cf.fish.name, (fishMap.get(cf.fish.name) || 0) + 1);
    }
  }
  return Array.from(fishMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

export default function AreaListPage() {
  const prefectureGroups = getRegionsByPrefecture();
  const totalSpots = fishingSpots.length;
  const totalRegions = regions.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "全国の釣りエリア一覧",
    description: "都道府県別の釣りエリア一覧",
    numberOfItems: totalRegions,
    itemListElement: regions.map((region, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${region.prefecture} ${region.areaName}`,
      url: `https://tsurispot.com/area/${region.slug}`,
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

      <div className="space-y-8 sm:space-y-10">
        {prefectureGroups.map((group) => (
          <section key={group.prefecture}>
            <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
              {group.prefecture}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.regions.map((region) => {
                const spotCount = getSpotCountForRegion(region.id);
                const topFish = getTopFishForRegion(region.id);

                return (
                  <Link key={region.id} href={`/area/${region.slug}`}>
                    <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                              <MapPin className="mr-1 inline size-4" />
                              {region.areaName}
                            </h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {region.prefecture}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            {spotCount}スポット
                          </Badge>
                        </div>
                        {topFish.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {topFish.map((name) => (
                              <Badge
                                key={name}
                                variant="outline"
                                className="text-xs"
                              >
                                {name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
