import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { Train } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import { getRegionGroupBySlug } from "@/lib/data/regions-group";
import { getPrefectureByName } from "@/lib/data/prefectures";
import { getTrainRegions, getTrainSpotsByRegion, groupTrainSpotsByPrefecture } from "@/lib/data/train-spots";
import { TRAIN_WALK_MAX_MINUTES } from "@/lib/data/station-access";
import { CITY_ORIGINS, getIndexableCities } from "@/lib/data/city-origins";
import { composeMetaDescription, joinNames } from "@/lib/seo/meta-description";
import { SPOT_TYPE_LABELS } from "@/types";
import { safeJsonLd } from "@/lib/safe-json-ld";

export const dynamic = "force-static";
export const revalidate = 604800;

type PageProps = { params: Promise<{ region: string }> };

export function generateStaticParams() {
  return getTrainRegions().map(({ region }) => ({ region: region.slug }));
}

function getRegionIfIndexable(slug: string) {
  const region = getRegionGroupBySlug(slug);
  if (!region || !getTrainRegions().some((r) => r.region.slug === region.slug)) return null;
  return region;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: slug } = await params;
  const region = getRegionIfIndexable(slug);
  if (!region) return { title: "ページが見つかりません", robots: { index: false, follow: true } };
  const spots = getTrainSpotsByRegion(region);
  const within10 = spots.filter((t) => t.walk.minutes <= 10).length;
  const title = `${region.name}の電車で行ける釣り場${spots.length}か所｜駅から徒歩${TRAIN_WALK_MAX_MINUTES}分以内`;
  const description = composeMetaDescription(
    [
      `${region.name}で駅から徒歩${TRAIN_WALK_MAX_MINUTES}分以内の釣り場を${spots.length}か所掲載。`,
      within10 > 0 ? `うち徒歩10分以内は${within10}か所。` : false,
      `${joinNames(spots.slice(0, 3).map((t) => `${t.spot.name}（${t.walk.station}から徒歩${t.walk.minutes}分）`), 2)}など。`,
      `車なしで行ける釣り場を都道府県別に紹介します。`,
    ],
    { fallbackTail: [`釣れる魚や設備も確認できます。`] },
  );
  const url = `https://tsurispot.com/fishing-spots/by-train/${region.slug}`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website", url, siteName: "ツリスポ" },
    alternates: { canonical: url },
  };
}

export default async function ByTrainRegionPage({ params }: PageProps) {
  const { region: slug } = await params;
  const region = getRegionIfIndexable(slug);
  if (!region) permanentRedirect("/fishing-spots/by-train");
  const groups = groupTrainSpotsByPrefecture(region);
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const within10 = groups.reduce((n, g) => n + g.items.filter((t) => t.walk.minutes <= 10).length, 0);
  const pageUrl = `https://tsurispot.com/fishing-spots/by-train/${region.slug}`;
  const indexable = new Set(getIndexableCities().map((c) => c.slug));
  const cities = CITY_ORIGINS.filter((c) => indexable.has(c.slug) && region.prefectures.includes(c.prefecture));
  const otherRegions = getTrainRegions().filter((r) => r.region.slug !== region.slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "電車で行ける釣り場", item: "https://tsurispot.com/fishing-spots/by-train" },
      { "@type": "ListItem", position: 3, name: region.name, item: pageUrl },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "電車で行ける釣り場", href: "/fishing-spots/by-train" },
          { label: region.name },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <Train className="size-5 text-primary sm:size-6" />
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">{region.name}の電車で行ける釣り場</h1>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {region.name}で、駅から徒歩{TRAIN_WALK_MAX_MINUTES}分以内の釣り場を{total}か所紹介します
          {within10 > 0 && `（うち徒歩10分以内は${within10}か所）`}。
          各都道府県の中は駅から近い順です。徒歩の目安は各スポットのアクセス情報（掲載時点）によるもので、
          釣り座までの距離によって変わります。
        </p>
        {groups.length > 1 && (
          <nav className="mt-4 flex flex-wrap gap-2" aria-label="都道府県へ移動">
            {groups.map((g) => (
              <a key={g.prefecture} href={`#pref-${g.prefecture}`} className="rounded-full border px-3 py-1 text-xs hover:bg-muted">
                {g.prefecture}（{g.items.length}）
              </a>
            ))}
          </nav>
        )}
      </div>

      {groups.map((g, gi) => {
        const pref = getPrefectureByName(g.prefecture);
        return (
          <section key={g.prefecture} id={`pref-${g.prefecture}`} className="mt-8 scroll-mt-20">
            <h2 className="mb-3 text-lg font-bold sm:text-xl">
              {g.prefecture}の電車で行ける釣り場（{g.items.length}か所）
            </h2>
            <ul className="divide-y rounded-lg border">
              {g.items.map(({ spot, walk }) => (
                <li key={spot.id}>
                  <Link
                    prefetch={false}
                    href={`/spots/${spot.slug}`}
                    className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted/50 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3"
                  >
                    <span className="font-medium">
                      {spot.name}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {spot.region.areaName}・{SPOT_TYPE_LABELS[spot.spotType]}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {walk.station}から徒歩{walk.minutes}分
                      {spot.catchableFish.length > 0 &&
                        `・${joinNames(spot.catchableFish.map((cf) => cf.fish.name), 3)}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {pref && (
              <p className="mt-2 text-right text-xs">
                <Link prefetch={false} href={`/prefecture/${pref.slug}`} className="text-primary hover:underline">
                  {g.prefecture}の釣り場をすべて見る →
                </Link>
              </p>
            )}
            {gi === 0 && <InArticleAd />}
          </section>
        );
      })}

      <section className="mt-10 rounded-xl border bg-muted/30 p-4 sm:p-6">
        <h2 className="mb-3 text-base font-bold sm:text-lg">ほかの探し方</h2>
        <div className="flex flex-wrap gap-2">
          {cities.map((c) => (
            <Link
              prefetch={false}
              key={c.slug}
              href={`/fishing-spots/near/${c.slug}`}
              className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            >
              {c.name}から近い釣り場
            </Link>
          ))}
          {otherRegions.map(({ region: r }) => (
            <Link
              prefetch={false}
              key={r.slug}
              href={`/fishing-spots/by-train/${r.slug}`}
              className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            >
              {r.name}の電車で行ける釣り場
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
