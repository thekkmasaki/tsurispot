import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  MapPin,
  ChevronRight,
  Star,
  Navigation,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FISHING_METHODS,
  getMethodBySlug,
  type FishingMethodDef,
} from "@/lib/data/fishing-methods";
import {
  REGION_GROUPS,
  getRegionGroupBySlug,
  type RegionGroup,
} from "@/lib/data/regions-group";
import { fishingSpots } from "@/lib/data/spots";
import { DIFFICULTY_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

interface Props {
  params: Promise<{ method: string; region: string }>;
}

export async function generateStaticParams() {
  const params: { method: string; region: string }[] = [];
  for (const method of FISHING_METHODS) {
    for (const region of REGION_GROUPS) {
      params.push({ method: method.slug, region: region.slug });
    }
  }
  return params;
}

function getSpotsForMethodAndRegion(
  method: FishingMethodDef,
  regionGroup: RegionGroup
): (FishingSpot & { matchingFishCount: number; matchingFishNames: string[] })[] {
  const prefs = regionGroup.prefectures;
  return fishingSpots
    .filter(
      (spot) =>
        prefs.includes(spot.region.prefecture) &&
        spot.catchableFish.some((cf) => method.methods.includes(cf.method))
    )
    .map((spot) => {
      const matchingFish = spot.catchableFish.filter((cf) =>
        method.methods.includes(cf.method)
      );
      return {
        ...spot,
        matchingFishCount: matchingFish.length,
        matchingFishNames: matchingFish.slice(0, 4).map((cf) => cf.fish.name),
      };
    })
    .sort((a, b) => {
      if (b.matchingFishCount !== a.matchingFishCount)
        return b.matchingFishCount - a.matchingFishCount;
      return b.rating - a.rating;
    });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { method: methodSlug, region: regionSlug } = await params;
  const method = getMethodBySlug(methodSlug);
  const region = getRegionGroupBySlug(regionSlug);
  if (!method || !region) return {};

  const title = `${region.name}の${method.name}スポット一覧｜おすすめ釣り場ガイド`;
  const description = `${region.name}地方で${method.name}ができる釣りスポットを一覧で紹介。各スポットの基本情報、釣れる魚、アクセス情報を掲載。${region.name}で${method.name}を楽しむならツリスポ。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://tsurispot.com/fishing/${method.slug}/area/${region.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/fishing/${method.slug}/area/${region.slug}`,
    },
  };
}

export default async function MethodRegionPage({ params }: Props) {
  const { method: methodSlug, region: regionSlug } = await params;
  const method = getMethodBySlug(methodSlug);
  const region = getRegionGroupBySlug(regionSlug);
  if (!method || !region) notFound();

  const spots = getSpotsForMethodAndRegion(method, region);
  const prefCounts = new Map<string, number>();
  for (const spot of spots) {
    const pref = spot.region.prefecture;
    prefCounts.set(pref, (prefCounts.get(pref) ?? 0) + 1);
  }

  // JSON-LD
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
        name: "釣り方×月別ガイド",
        item: "https://tsurispot.com/fishing",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${method.name}`,
        item: `https://tsurispot.com/fishing/${method.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${region.name}`,
        item: `https://tsurispot.com/fishing/${method.slug}/area/${region.slug}`,
      },
    ],
  };

  const itemListJsonLd = spots.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${region.name}の${method.name}スポット`,
    numberOfItems: spots.length,
    itemListElement: spots.slice(0, 20).map((spot, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
  } : null;

  const jsonLdArray = [breadcrumbJsonLd, ...(itemListJsonLd ? [itemListJsonLd] : [])];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdArray),
        }}
      />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣り方×月別ガイド", href: "/fishing" },
            { label: method.name, href: `/fishing/${method.slug}` },
            { label: region.name },
          ]}
        />

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            {region.name}の{method.name}スポット一覧
            <span className="block text-base sm:text-lg font-normal text-gray-600 mt-1">
              {spots.length}件のスポットが見つかりました
            </span>
          </h1>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="size-4 text-blue-500" />
                <span className="text-sm font-medium">
                  対象エリア: {region.prefectures.join("・")}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {region.name}地方で{method.name}ができるスポットをまとめました。
                {spots.length > 0
                  ? `${spots.length}件のスポットで${method.name}を楽しめます。`
                  : `現在、${method.name}ができるスポットデータは準備中です。`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 都道府県別内訳 */}
        {prefCounts.size > 1 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">都道府県別スポット数</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(prefCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([pref, count]) => (
                  <Badge key={pref} variant="secondary" className="text-sm">
                    {pref}: {count}件
                  </Badge>
                ))}
            </div>
          </section>
        )}

        {/* スポット一覧 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="size-5" />
            スポット一覧
          </h2>

          {spots.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>
                  {region.name}で{method.name}ができるスポットは現在準備中です。
                </p>
                <p className="mt-2">
                  <Link
                    href={`/fishing/${method.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    他の地域を確認する
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {spots.map((spot, idx) => (
                <Link key={spot.slug} href={`/spots/${spot.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-sm sm:text-base">
                              {spot.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">
                                {spot.rating.toFixed(1)}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {DIFFICULTY_LABELS[spot.difficulty]}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            <MapPin className="size-3 inline mr-1" />
                            {spot.address}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {spot.matchingFishNames.map((fishName) => (
                              <Badge
                                key={fishName}
                                className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              >
                                <Fish className="size-3 mr-0.5" />
                                {fishName}
                              </Badge>
                            ))}
                            {spot.matchingFishCount > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{spot.matchingFishCount - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-gray-400 shrink-0 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 他の地域 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            他の地域の{method.name}スポット
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGION_GROUPS.filter((r) => r.slug !== region.slug).map((r) => (
              <Link
                key={r.slug}
                href={`/fishing/${method.slug}/area/${r.slug}`}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 text-center">
                    <span className="text-sm font-medium">{r.name}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 他の釣り方 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">
            {region.name}の他の釣り方
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FISHING_METHODS.filter((m) => m.slug !== method.slug).map((m) => (
              <Link key={m.slug} href={`/fishing/${m.slug}/area/${region.slug}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-sm font-medium">
                      {region.name}の{m.name}
                    </span>
                    <ChevronRight className="size-4 ml-auto text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
