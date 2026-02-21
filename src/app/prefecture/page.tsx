import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  prefectures,
  regionGroupOrder,
  getPrefecturesByRegionGroup,
} from "@/lib/data/prefectures";
import { regions } from "@/lib/data/regions";
import { fishingSpots } from "@/lib/data/spots";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getPrefectureInfoBySlug } from "@/lib/data/prefecture-info";

export const metadata: Metadata = {
  title: "都道府県から釣り場を探す｜全国47都道府県の釣りスポット完全ガイド",
  description:
    "全国47都道府県の釣り場・穴場スポットを地方別に探せます。北海道から沖縄まで、初心者にもおすすめの釣りスポットを都道府県ごとに紹介。各県の代表的な魚種やベストシーズンも掲載。近くの釣り場が見つかります。",
  openGraph: {
    title: "都道府県から釣り場を探す｜全国47都道府県の釣りスポット完全ガイド",
    description:
      "全国47都道府県の釣り場・穴場スポットを地方別に探せます。近くの釣りスポットが見つかります。",
    type: "website",
    url: "https://tsurispot.com/prefecture",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/prefecture",
  },
};

function getSpotCountForPrefecture(prefectureName: string): number {
  return fishingSpots.filter((s) => s.region.prefecture === prefectureName)
    .length;
}

function getAreaCountForPrefecture(prefectureName: string): number {
  return regions.filter((r) => r.prefecture === prefectureName).length;
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
      name: "都道府県から探す",
      item: "https://tsurispot.com/prefecture",
    },
  ],
};

export default function PrefectureListPage() {
  const grouped = getPrefecturesByRegionGroup();

  // 合計スポット数を計算
  const totalSpots = fishingSpots.length;

  // 地方ごとのスポット数を計算
  const regionSpotCounts = new Map<string, number>();
  for (const groupName of regionGroupOrder) {
    const prefs = grouped.get(groupName) || [];
    const count = prefs.reduce(
      (sum, pref) => sum + getSpotCountForPrefecture(pref.name),
      0
    );
    regionSpotCounts.set(groupName, count);
  }

  // 最大スポット数を取得（バー表示用）
  const maxSpotCount = Math.max(
    ...prefectures.map((p) => getSpotCountForPrefecture(p.name))
  );

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "都道府県から探す" },
        ]}
      />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          都道府県から釣り場を探す
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          全国47都道府県の釣りスポット合計{totalSpots}件を地方別に紹介。
          お住まいの地域や旅行先の釣り場を探せます。
        </p>
      </div>

      {/* Region groups */}
      <div className="space-y-8 sm:space-y-10">
        {regionGroupOrder.map((groupName) => {
          const prefs = grouped.get(groupName) || [];
          const regionTotal = regionSpotCounts.get(groupName) || 0;
          return (
            <section key={groupName}>
              <div className="mb-3 flex items-baseline justify-between border-b pb-2 sm:mb-4">
                <h2 className="text-lg font-bold sm:text-xl">{groupName}</h2>
                <span className="text-sm text-muted-foreground">
                  {regionTotal}件のスポット
                </span>
              </div>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {prefs.map((pref) => {
                  const spotCount = getSpotCountForPrefecture(pref.name);
                  const areaCount = getAreaCountForPrefecture(pref.name);
                  const info = getPrefectureInfoBySlug(pref.slug);
                  const barWidth =
                    maxSpotCount > 0
                      ? Math.max((spotCount / maxSpotCount) * 100, 2)
                      : 0;

                  return (
                    <Link key={pref.slug} href={`/prefecture/${pref.slug}`}>
                      <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                              {pref.name}
                            </h3>
                            <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" />
                          </div>

                          {/* Spot count bar */}
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>

                          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span className="font-medium">
                              {spotCount}件のスポット
                            </span>
                            {areaCount > 0 && (
                              <span>{areaCount}エリア</span>
                            )}
                          </div>

                          {/* Popular fish preview */}
                          {info && info.popularFish.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {info.popularFish.slice(0, 3).map((f) => (
                                <Badge
                                  key={f}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {f}
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
          );
        })}
      </div>

      {/* Internal links */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          他の方法で探す
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/spots"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            全国の釣りスポット一覧
          </Link>
          <Link
            href="/area"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            エリアから探す
          </Link>
          <Link
            href="/map"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            地図から探す
          </Link>
          <Link
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
          <Link
            href="/fish"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            魚種から探す
          </Link>
          <Link
            href="/ranking"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            釣り場ランキング
          </Link>
        </div>
      </section>
    </div>
  );
}
