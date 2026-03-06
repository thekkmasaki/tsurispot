import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Waves, Mountain, Ship, TreePine, Fence, Anchor } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { fishingSpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";
import { SPOT_TYPE_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

const SPOT_TYPE_ICONS: Record<FishingSpot["spotType"], typeof MapPin> = {
  port: Anchor,
  beach: Waves,
  rocky: Mountain,
  river: TreePine,
  pier: Ship,
  breakwater: Fence,
};

const SPOT_TYPE_DESCRIPTIONS: Record<FishingSpot["spotType"], string> = {
  port: "漁港は足場が良く、初心者にも安全な釣り場です。サビキ釣りやちょい投げなど手軽な釣りが楽しめます。",
  beach: "砂浜からの投げ釣りでキスやカレイが狙えます。サーフフィッシングでヒラメやマゴチも人気です。",
  rocky: "磯釣りは大物が狙えるポイント。メジナやクロダイの他、青物も回遊してきます。",
  river: "河川では渓流釣りからシーバスまで多彩な釣りが楽しめます。淡水魚も汽水域の魚も狙えます。",
  pier: "桟橋は足場が安定しており、家族連れにも人気。アジやイワシなど回遊魚のサビキ釣りに最適です。",
  breakwater: "堤防は最も身近な釣り場。初心者からベテランまで幅広い釣りが楽しめる定番ポイントです。",
};

const SPOT_TYPE_ORDER: FishingSpot["spotType"][] = [
  "breakwater",
  "port",
  "beach",
  "rocky",
  "river",
  "pier",
];

export const metadata: Metadata = {
  title: "釣り場タイプ別で探す - 堤防・漁港・砂浜・磯・河川・桟橋【全国】",
  description:
    "全国の釣り場を堤防・漁港・砂浜・磯・河川・桟橋のタイプ別に検索。初心者向けの堤防から上級者向けの磯まで、釣り場タイプごとの特徴とおすすめスポットを紹介。",
  openGraph: {
    title: "釣り場タイプ別で探す - 堤防・漁港・砂浜・磯・河川・桟橋【全国】",
    description:
      "全国の釣り場を堤防・漁港・砂浜・磯・河川・桟橋のタイプ別に検索。",
    type: "website",
    url: "https://tsurispot.com/spot-type",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/spot-type",
  },
};

export default function SpotTypeIndexPage() {
  // タイプ別集計
  const typeCountMap = new Map<string, number>();
  for (const spot of fishingSpots) {
    typeCountMap.set(spot.spotType, (typeCountMap.get(spot.spotType) || 0) + 1);
  }

  // タイプ別都道府県内訳
  const typePrefMap = new Map<string, Map<string, number>>();
  for (const spot of fishingSpots) {
    if (!typePrefMap.has(spot.spotType)) {
      typePrefMap.set(spot.spotType, new Map());
    }
    const prefMap = typePrefMap.get(spot.spotType)!;
    const prefName = spot.region.prefecture;
    prefMap.set(prefName, (prefMap.get(prefName) || 0) + 1);
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
        name: "釣り場タイプ別",
        item: "https://tsurispot.com/spot-type",
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣り場タイプ別" },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          釣り場タイプ別で探す
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          全国{fishingSpots.length.toLocaleString()}件の釣り場を
          タイプ別に検索できます
        </p>
      </div>

      {/* タイプ一覧 */}
      <div className="grid gap-6">
        {SPOT_TYPE_ORDER.map((type) => {
          const Icon = SPOT_TYPE_ICONS[type];
          const count = typeCountMap.get(type) || 0;
          const prefMap = typePrefMap.get(type);
          const prefCount = prefMap ? prefMap.size : 0;

          return (
            <Card key={type} className="gap-0 py-0">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/spot-type/${type}`}
                      className="group"
                    >
                      <h2 className="text-lg font-bold group-hover:text-primary sm:text-xl">
                        {SPOT_TYPE_LABELS[type]}の釣り場
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                          ({count}件)
                        </span>
                      </h2>
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {SPOT_TYPE_DESCRIPTIONS[type]}
                    </p>

                    {/* 都道府県リンク */}
                    {prefMap && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {Array.from(prefMap.entries())
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 12)
                          .map(([prefName, spotCount]) => {
                            const pref = prefectures.find(
                              (p) => p.name === prefName
                            );
                            if (!pref) return null;
                            return (
                              <Link
                                key={pref.slug}
                                href={`/spot-type/${type}/${pref.slug}`}
                              >
                                <Badge
                                  variant="outline"
                                  className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                                >
                                  {pref.nameShort}
                                  <span className="ml-1 text-muted-foreground">
                                    ({spotCount})
                                  </span>
                                </Badge>
                              </Link>
                            );
                          })}
                        {prefCount > 12 && (
                          <Link href={`/spot-type/${type}`}>
                            <Badge
                              variant="outline"
                              className="cursor-pointer text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                              他{prefCount - 12}県
                            </Badge>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 関連リンク */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          関連リンク
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link
            href="/fish"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            魚種から探す
          </Link>
          <Link
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
          <Link
            href="/spots"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            全国の釣り場
          </Link>
        </div>
      </section>
    </div>
  );
}
