import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Fish, ChevronLeft, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { regions } from "@/lib/data/regions";
import { fishingSpots } from "@/lib/data/spots";
import { SpotCard } from "@/components/spots/spot-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function getRegionsForPrefecture(prefectureName: string) {
  return regions.filter((r) => r.prefecture === prefectureName);
}

function getSpotsForPrefecture(prefectureName: string) {
  return fishingSpots.filter((s) => s.region.prefecture === prefectureName);
}

function getCatchableFishForPrefecture(prefectureName: string) {
  const fishMap = new Map<string, { name: string; slug: string; count: number }>();
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

  return {
    title: `${pref.name}の釣り穴場スポット${spotCountText}｜初心者にもおすすめの釣り場`,
    description: `${pref.name}で釣りができる穴場スポットを厳選紹介。堤防・漁港・磯など、駐車場・トイレ完備の初心者向けから上級者向けまで。${topFishNames}が狙えます。`,
    openGraph: {
      title: `${pref.name}の釣り穴場スポット${spotCountText}｜初心者にもおすすめの釣り場`,
      description: `${pref.name}の釣りスポット${spots.length}件。${topFishNames}が釣れます。堤防・漁港・磯など多彩な釣り場を紹介。`,
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

export default async function PrefecturePage({ params }: PageProps) {
  const { slug } = await params;
  const pref = getPrefectureBySlug(slug);
  if (!pref) notFound();

  const spots = getSpotsForPrefecture(pref.name);
  const prefRegions = getRegionsForPrefecture(pref.name);
  const catchableFish = getCatchableFishForPrefecture(pref.name);

  const beginnerSpots = spots.filter((s) => s.difficulty === "beginner");
  const freeSpots = spots.filter((s) => s.isFree);

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
    description: `${pref.name}で人気の釣り場・穴場スポットを紹介。初心者向けから上級者向けまで。`,
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
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary sm:size-6" />
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
            {pref.name}の釣り場・穴場スポット一覧
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          {spots.length}件の釣りスポット
          {beginnerSpots.length > 0 && `（初心者向け${beginnerSpots.length}件）`}
          {freeSpots.length > 0 && `・無料${freeSpots.length}件`}
        </p>
      </div>

      {/* Catchable fish in this prefecture */}
      {catchableFish.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5" />
            {pref.name}で釣れる魚
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
            {pref.name}のエリア
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

      {/* Spots list */}
      <section>
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          釣りスポット一覧（{spots.length}件）
        </h2>
        {spots.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
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
        )}
      </section>

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
        </div>
      </section>
    </div>
  );
}
