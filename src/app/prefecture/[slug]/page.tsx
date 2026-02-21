import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Fish,
  ChevronLeft,
  Navigation,
  Calendar,
  Star,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { regions } from "@/lib/data/regions";
import { fishingSpots } from "@/lib/data/spots";
import { SpotCard } from "@/components/spots/spot-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getPrefectureInfoBySlug } from "@/lib/data/prefecture-info";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getRegionsForPrefecture(prefectureName: string) {
  return regions.filter((r) => r.prefecture === prefectureName);
}

function getSpotsForPrefecture(prefectureName: string) {
  return fishingSpots.filter((s) => s.region.prefecture === prefectureName);
}

function getSpotsByRegion(prefectureName: string) {
  const prefRegions = getRegionsForPrefecture(prefectureName);
  const regionMap = new Map<
    string,
    { region: (typeof regions)[0]; spots: typeof fishingSpots }
  >();

  for (const r of prefRegions) {
    const regionSpots = fishingSpots.filter((s) => s.region.id === r.id);
    if (regionSpots.length > 0) {
      regionMap.set(r.id, { region: r, spots: regionSpots });
    }
  }

  // Region IDにマッチしないスポットを "その他" にまとめる
  const allPrefSpots = getSpotsForPrefecture(prefectureName);
  const regionedIds = new Set<string>();
  for (const [, { spots }] of regionMap) {
    for (const s of spots) regionedIds.add(s.id);
  }
  const ungroupedSpots = allPrefSpots.filter((s) => !regionedIds.has(s.id));

  return { regionMap, ungroupedSpots };
}

function getCatchableFishForPrefecture(prefectureName: string) {
  const fishMap = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  for (const spot of fishingSpots) {
    if (spot.region.prefecture !== prefectureName) continue;
    for (const cf of spot.catchableFish) {
      const existing = fishMap.get(cf.fish.id);
      if (existing) {
        existing.count++;
      } else {
        fishMap.set(cf.fish.id, {
          name: cf.fish.name,
          slug: cf.fish.slug,
          count: 1,
        });
      }
    }
  }
  return Array.from(fishMap.values()).sort((a, b) => b.count - a.count);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pref = getPrefectureBySlug(slug);
  if (!pref) return { title: "都道府県が見つかりません" };

  const spots = getSpotsForPrefecture(pref.name);
  const fishList = getCatchableFishForPrefecture(pref.name);
  const topFishNames = fishList
    .slice(0, 5)
    .map((f) => f.name)
    .join("・");

  const spotCountText = spots.length > 0 ? `${spots.length}選` : "";
  const title = `${pref.name}の釣り場${spotCountText} - おすすめスポット完全ガイド【2025年版】`;
  const description = `${pref.name}のおすすめ釣り場・穴場スポット${spots.length > 0 ? `${spots.length}箇所` : ""}を完全ガイド。堤防・漁港・磯など初心者向けから上級者向けまでエリア別に紹介。${topFishNames}が狙えます。駐車場・トイレ情報も掲載。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description: `${pref.name}の釣りスポット${spots.length > 0 ? `${spots.length}件` : ""}をエリア別に紹介。${topFishNames}が釣れます。`,
      type: "website",
      url: `https://tsurispot.com/prefecture/${pref.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/prefecture/${pref.slug}`,
    },
  };
}

export function generateStaticParams() {
  return prefectures.map((pref) => ({ slug: pref.slug }));
}

const seasonLabels = {
  spring: "春（3〜5月）",
  summer: "夏（6〜8月）",
  autumn: "秋（9〜11月）",
  winter: "冬（12〜2月）",
} as const;

const seasonColors = {
  spring: "bg-pink-50 border-pink-200 text-pink-800",
  summer: "bg-sky-50 border-sky-200 text-sky-800",
  autumn: "bg-orange-50 border-orange-200 text-orange-800",
  winter: "bg-blue-50 border-blue-200 text-blue-800",
} as const;

export default async function PrefecturePage({ params }: PageProps) {
  const { slug } = await params;
  const pref = getPrefectureBySlug(slug);
  if (!pref) notFound();

  const spots = getSpotsForPrefecture(pref.name);
  const prefRegions = getRegionsForPrefecture(pref.name);
  const catchableFish = getCatchableFishForPrefecture(pref.name);
  const prefInfo = getPrefectureInfoBySlug(slug);

  const { regionMap, ungroupedSpots } = getSpotsByRegion(pref.name);

  const beginnerSpots = spots.filter((s) => s.difficulty === "beginner");
  const freeSpots = spots.filter((s) => s.isFree);

  const spotCountText = spots.length > 0 ? `${spots.length}選` : "";

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
      {
        "@type": "ListItem",
        position: 3,
        name: pref.name,
        item: `https://tsurispot.com/prefecture/${pref.slug}`,
      },
    ],
  };

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: `${pref.name}の釣り場`,
    description: prefInfo?.description || `${pref.name}で人気の釣り場・穴場スポットを紹介。初心者向けから上級者向けまで。`,
    address: {
      "@type": "PostalAddress",
      addressRegion: pref.name,
      addressCountry: "JP",
    },
    containsPlace: spots.slice(0, 20).map((spot) => ({
      "@type": "TouristAttraction",
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
  };

  // ItemList 構造化データ（スポット一覧）
  const itemListJsonLd = spots.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${pref.name}の釣り場${spotCountText}`,
    numberOfItems: spots.length,
    itemListElement: spots.slice(0, 30).map((spot, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
  } : null;

  // 近隣県のリンク取得
  const sameRegionPrefs = prefectures.filter(
    (p) => p.regionGroup === pref.regionGroup && p.slug !== pref.slug
  );

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "都道府県", href: "/prefecture" },
          { label: pref.name },
        ]}
      />

      {/* Back link */}
      <Link
        href="/prefecture"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        都道府県一覧に戻る
      </Link>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の釣り場{spotCountText} - おすすめスポット完全ガイド
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {spots.length > 0
            ? `${spots.length}件の釣りスポットをエリア別に紹介`
            : `${pref.name}の釣りスポット情報`}
          {beginnerSpots.length > 0 &&
            `｜初心者向け${beginnerSpots.length}件`}
          {freeSpots.length > 0 && `｜無料${freeSpots.length}件`}
        </p>
      </div>

      {/* Prefecture overview */}
      {prefInfo && (
        <section className="mb-8 sm:mb-10">
          <Card className="gap-0 py-0 border-primary/20 bg-primary/5">
            <CardContent className="p-4 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
                <MapPin className="size-5 text-primary" />
                {pref.name}の釣りの特徴
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {prefInfo.description}
              </p>
              <div className="space-y-2">
                {prefInfo.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm sm:text-base"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Seasonal fish guide */}
      {prefInfo?.seasonalFish && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Calendar className="size-5" />
            {pref.name}の季節ごとのおすすめ魚種
          </h2>
          {prefInfo.bestSeason && (
            <p className="mb-4 text-sm text-muted-foreground">
              {prefInfo.bestSeason}
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              Object.entries(prefInfo.seasonalFish) as [
                keyof typeof seasonLabels,
                string[],
              ][]
            ).map(([season, fishes]) => (
              <Card
                key={season}
                className={`gap-0 py-0 border ${seasonColors[season]}`}
              >
                <CardContent className="p-3 sm:p-4">
                  <h3 className="mb-2 text-sm font-bold">
                    {seasonLabels[season]}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {fishes.map((f) => (
                      <Badge
                        key={f}
                        variant="secondary"
                        className="text-xs"
                      >
                        {f}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Catchable fish in this prefecture */}
      {catchableFish.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5" />
            {pref.name}で釣れる魚種一覧
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {catchableFish.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {f.name}
                  <span className="ml-1 text-muted-foreground">
                    ({f.count})
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Area links within this prefecture */}
      {prefRegions.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Navigation className="size-5" />
            {pref.name}のエリア一覧
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prefRegions.map((r) => {
              const count = fishingSpots.filter(
                (s) => s.region.id === r.id
              ).length;
              return (
                <Link key={r.id} href={`/area/${r.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        <MapPin className="mr-1 inline size-4" />
                        {r.areaName}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count}件のスポット
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Spots grouped by area */}
      {regionMap.size > 0 ? (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            エリア別 釣りスポット一覧（全{spots.length}件）
          </h2>

          {Array.from(regionMap.values()).map(({ region: r, spots: areaSpots }) => (
            <div key={r.id} className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-primary pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4 text-primary" />
                {r.areaName}エリア（{areaSpots.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {areaSpots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          ))}

          {/* Region外のスポット */}
          {ungroupedSpots.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 border-l-4 border-muted-foreground pl-3 text-sm font-bold sm:text-base">
                <MapPin className="size-4" />
                その他のエリア（{ungroupedSpots.length}件）
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ungroupedSpots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
            </div>
          )}
        </section>
      ) : spots.length > 0 ? (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
            釣りスポット一覧（{spots.length}件）
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-8 sm:mb-10">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {pref.name}の釣りスポット情報は現在準備中です。
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              近日中に追加予定ですので、しばらくお待ちください。
            </p>
            <Link
              href="/spots"
              className="mt-4 inline-block text-sm text-primary hover:underline"
            >
              全国の釣りスポットを見る
            </Link>
          </div>
        </section>
      )}

      {/* Popular fish details (for SEO rich content) */}
      {prefInfo && prefInfo.popularFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Star className="size-5" />
            {pref.name}の代表的な釣りターゲット
          </h2>
          <div className="flex flex-wrap gap-2">
            {prefInfo.popularFish.map((fishName) => (
              <Badge
                key={fishName}
                variant="outline"
                className="px-3 py-1.5 text-sm"
              >
                {fishName}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Nearby prefectures */}
      {sameRegionPrefs.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.regionGroup}の他の都道府県
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {sameRegionPrefs.map((p) => {
              const count = fishingSpots.filter(
                (s) => s.region.prefecture === p.name
              ).length;
              return (
                <Link key={p.slug} href={`/prefecture/${p.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {count}件のスポット
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Internal links */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          関連リンク
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/spots"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            全国の釣りスポット
          </Link>
          <Link
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
          <Link
            href="/map"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            地図から探す
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
