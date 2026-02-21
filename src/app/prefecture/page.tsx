import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  prefectures,
  regionGroupOrder,
  getPrefecturesByRegionGroup,
} from "@/lib/data/prefectures";
import { regions } from "@/lib/data/regions";
import { fishingSpots } from "@/lib/data/spots";

export const metadata: Metadata = {
  title: "都道府県から釣り場を探す｜全国の釣りスポット一覧",
  description:
    "全国47都道府県の釣り場・穴場スポットを地方別に探せます。北海道から沖縄まで、初心者にもおすすめの釣りスポットを都道府県ごとに紹介。近くの釣り場が見つかります。",
  openGraph: {
    title: "都道府県から釣り場を探す｜全国の釣りスポット一覧",
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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary sm:size-6" />
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
            都道府県から釣り場を探す
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          全国47都道府県の釣りスポットを地方別に紹介
        </p>
      </div>

      {/* Region groups */}
      <div className="space-y-8 sm:space-y-10">
        {regionGroupOrder.map((groupName) => {
          const prefs = grouped.get(groupName) || [];
          return (
            <section key={groupName}>
              <h2 className="mb-3 border-b pb-2 text-lg font-bold sm:mb-4 sm:text-xl">
                {groupName}
              </h2>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {prefs.map((pref) => {
                  const spotCount = getSpotCountForPrefecture(pref.name);
                  const areaCount = getAreaCountForPrefecture(pref.name);
                  return (
                    <Link key={pref.slug} href={`/prefecture/${pref.slug}`}>
                      <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                        <CardContent className="p-3 sm:p-4">
                          <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                            {pref.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span>{spotCount}件のスポット</span>
                            {areaCount > 0 && (
                              <span>{areaCount}エリア</span>
                            )}
                          </div>
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
        </div>
      </section>
    </div>
  );
}
