import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { MapPin, Train, HelpCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { SpotCard } from "@/components/spots/spot-card";
import { InArticleAd } from "@/components/ads/ad-unit";
import { toListSpot } from "@/lib/data/list-spot";
import { getPrefectureByName } from "@/lib/data/prefectures";
import {
  CITY_LIST_LIMIT,
  formatKm,
  getCityBySlug,
  getCityNearbySpots,
  getIndexableCities,
  getNeighborCities,
  type SpotWithDistance,
} from "@/lib/data/city-origins";
import { parseStationWalk, TRAIN_WALK_MAX_MINUTES } from "@/lib/data/station-access";
import { composeMetaDescription, joinNames } from "@/lib/seo/meta-description";
import { safeJsonLd } from "@/lib/safe-json-ld";

// 「〇〇から近い釣り場」— 都市の代表駅から直線距離で近い順に、掲載品質を満たすスポットを並べる。
// 都市の選定・件数の下限・都市同士の重なり上限は src/lib/data/city-origins.ts とそのテストで管理。
export const dynamic = "force-static";
export const revalidate = 604800;

type PageProps = { params: Promise<{ city: string }> };

const TRAIN_LIST_LIMIT = 10;
const FAMILY_LIST_LIMIT = 6;
const FISH_RANK_LIMIT = 10;

export function generateStaticParams() {
  return getIndexableCities().map((c) => ({ city: c.slug }));
}

function buildPageData(citySlug: string) {
  const city = getCityBySlug(citySlug);
  if (!city || !getIndexableCities().some((c) => c.slug === city.slug)) return null;
  const { radiusKm, spots } = getCityNearbySpots(city);
  const top = spots.slice(0, CITY_LIST_LIMIT);

  const trainSpots = spots
    .map((s) => ({ spot: s, walk: parseStationWalk(s.accessInfo) }))
    .filter((x): x is { spot: SpotWithDistance; walk: NonNullable<typeof x.walk> } =>
      x.walk !== null && x.walk.minutes <= TRAIN_WALK_MAX_MINUTES,
    )
    .slice(0, TRAIN_LIST_LIMIT);

  const familySpots = spots
    .filter((s) => s.difficulty === "beginner" && s.hasToilet)
    .slice(0, FAMILY_LIST_LIMIT);

  // 半径内で「釣れる魚」に挙がっているスポット数の多い魚
  const fishCount = new Map<string, { name: string; slug: string; count: number }>();
  for (const s of spots) {
    for (const cf of s.catchableFish) {
      const cur = fishCount.get(cf.fish.slug);
      if (cur) cur.count++;
      else fishCount.set(cf.fish.slug, { name: cf.fish.name, slug: cf.fish.slug, count: 1 });
    }
  }
  const fishRank = [...fishCount.values()].sort((a, b) => b.count - a.count).slice(0, FISH_RANK_LIMIT);

  const parkingCount = spots.filter((s) => s.hasParking).length;
  const freeCount = spots.filter((s) => s.isFree).length;

  return { city, radiusKm, spots, top, trainSpots, familySpots, fishRank, parkingCount, freeCount };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const d = buildPageData(citySlug);
  if (!d) return { title: "ページが見つかりません", robots: { index: false, follow: true } };
  const { city, radiusKm, spots, top, trainSpots, fishRank } = d;

  const title = `${city.name}から近い釣り場おすすめ${top.length}選【${city.originLabel}から直線${radiusKm}km圏】${
    trainSpots.length > 0 ? "電車で行ける釣り場も" : ""
  }`;
  const description = composeMetaDescription(
    [
      `${city.originLabel}から直線${radiusKm}km以内の釣り場${spots.length}か所を近い順に紹介。`,
      top[0] ? `一番近いのは${top[0].name}（${formatKm(top[0].distanceKm)}）。` : false,
      fishRank.length > 0 ? `${joinNames(fishRank.map((f) => f.name), 4)}などが狙えます。` : false,
      trainSpots.length > 0 ? `駅から徒歩${TRAIN_WALK_MAX_MINUTES}分以内の釣り場も掲載。` : false,
    ],
    {
      fallbackTail: [
        `駐車場・トイレなどの設備も確認できます。`,
        `日帰り釣行の計画にご活用ください。`,
      ],
    },
  );
  const url = `https://tsurispot.com/fishing-spots/near/${city.slug}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "ツリスポ",
      images: [
        {
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(`${city.name}から近い釣り場`)}&emoji=%F0%9F%93%8D`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: { canonical: url },
  };
}

export default async function CityNearSpotsPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const d = buildPageData(citySlug);
  if (!d) permanentRedirect("/fishing-spots/near-me");
  const { city, radiusKm, spots, top, trainSpots, familySpots, fishRank, parkingCount, freeCount } = d;
  const pageUrl = `https://tsurispot.com/fishing-spots/near/${city.slug}`;
  const pref = getPrefectureByName(city.prefecture);
  const neighbors = getNeighborCities(city);

  // 近い順上位に出てくる都道府県（県ページへの導線）
  const nearbyPrefNames = [...new Set(spots.map((s) => s.region.prefecture))].slice(0, 4);

  const faqItems = [
    {
      question: `${city.name}から一番近い釣り場はどこですか？`,
      answer: top[0]
        ? `ツリスポの掲載スポットでは、${city.originLabel}から直線距離で最も近いのは${top[0].name}（${top[0].region.prefecture}${top[0].region.areaName}・${formatKm(top[0].distanceKm)}）です。${
            top[1] ? `次いで${top[1].name}（${formatKm(top[1].distanceKm)}）、` : ""
          }${top[2] ? `${top[2].name}（${formatKm(top[2].distanceKm)}）が続きます。` : ""}距離は直線距離なので、道のりや所要時間は地図アプリでご確認ください。`
        : "",
    },
    ...(trainSpots.length > 0
      ? [
          {
            question: `${city.name}から電車で行ける釣り場はありますか？`,
            answer: `あります。アクセス情報に駅から徒歩${TRAIN_WALK_MAX_MINUTES}分以内と記載のある釣り場が、この範囲に${trainSpots.length}${
              trainSpots.length >= TRAIN_LIST_LIMIT ? "か所以上" : "か所"
            }あります。たとえば${trainSpots
              .slice(0, 3)
              .map((t) => `${t.spot.name}（${t.walk.station}から徒歩${t.walk.minutes}分）`)
              .join("、")}です。`,
          },
        ]
      : []),
    ...(fishRank.length > 0
      ? [
          {
            question: `${city.name}の近くでは何が釣れますか？`,
            answer: `直線${radiusKm}km圏の掲載スポットで「釣れる魚」に多く挙がっているのは、${fishRank
              .slice(0, 5)
              .map((f) => `${f.name}（${f.count}か所）`)
              .join("、")}です。時期によって釣れる魚は変わるので、各スポットの釣れる時期も確認してください。`,
          },
        ]
      : []),
    {
      question: `${city.name}近くの釣り場に駐車場はありますか？`,
      answer: `この範囲の${spots.length}か所のうち、駐車場ありは${parkingCount}か所、無料で釣りができるのは${freeCount}か所です（掲載データの集計）。満車や有料化もあるため、出かける前に現地情報を確認してください。`,
    },
  ].filter((f) => f.answer);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "近くの釣り場を探す", item: "https://tsurispot.com/fishing-spots/near-me" },
      { "@type": "ListItem", position: 3, name: `${city.name}から近い釣り場`, item: pageUrl },
    ],
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${city.name}から近い釣り場`,
    numberOfItems: top.length,
    itemListElement: top.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://tsurispot.com/spots/${s.slug}`,
    })),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "近くの釣り場を探す", href: "/fishing-spots/near-me" },
          { label: `${city.name}から近い釣り場` },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <MapPin className="size-5 text-primary sm:size-6" />
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">{city.name}から近い釣り場</h1>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {city.originLabel}から直線{radiusKm}km以内にある釣り場{spots.length}か所のうち、近い順に{top.length}か所を紹介します。
          {top[0] && `一番近いのは${top[0].name}（${formatKm(top[0].distanceKm)}）です。`}
          {fishRank.length > 0 && `この範囲では${joinNames(fishRank.map((f) => f.name), 4)}などが狙えます。`}
          距離は直線距離です。道のりや所要時間は地図アプリでご確認ください。
        </p>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold sm:text-xl">
          {city.name}から近い釣り場（近い順）
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((s, i) => (
            <SpotCard key={s.id} spot={toListSpot(s)} distance={s.distanceKm} priority={i < 2} />
          ))}
        </div>
      </section>

      {trainSpots.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-2 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Train className="size-5 text-primary" />
            {city.name}から電車で行ける釣り場
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            アクセス情報に「駅から徒歩{TRAIN_WALK_MAX_MINUTES}分以内」と記載のある釣り場です（掲載時点の目安）。
          </p>
          <ul className="divide-y rounded-lg border">
            {trainSpots.map(({ spot, walk }) => (
              <li key={spot.id}>
                <Link
                  prefetch={false}
                  href={`/spots/${spot.slug}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 py-3 hover:bg-muted/50"
                >
                  <span className="font-medium">{spot.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {walk.station}から徒歩{walk.minutes}分・{city.originLabel}から{formatKm(spot.distanceKm)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <InArticleAd />

      {familySpots.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold sm:text-xl">{city.name}近くの初心者・家族向けの釣り場（トイレあり）</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {familySpots.map((s) => (
              <SpotCard key={s.id} spot={toListSpot(s)} distance={s.distanceKm} />
            ))}
          </div>
        </section>
      )}

      {fishRank.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-bold sm:text-xl">{city.name}の近くで釣れる魚</h2>
          <div className="flex flex-wrap gap-2">
            {fishRank.map((f) => (
              <Link
                prefetch={false}
                key={f.slug}
                href={`/fish/${f.slug}`}
                className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                {f.name}
                <span className="ml-1 text-xs text-muted-foreground">{f.count}か所</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
          <HelpCircle className="size-5 text-primary" />
          {city.name}近くの釣りに関するよくある質問
        </h2>
        <div className="space-y-3">
          {faqItems.map((f, i) => (
            <Card key={i} className="gap-0 py-0">
              <CardContent className="p-4 sm:p-5">
                <h3 className="mb-2 text-sm font-bold sm:text-base">Q. {f.question}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">A. {f.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-xl border bg-muted/30 p-4 sm:p-6">
        <h2 className="mb-3 text-base font-bold sm:text-lg">ほかの探し方</h2>
        <div className="flex flex-wrap gap-2">
          {neighbors.map((c) => (
            <Link
              prefetch={false}
              key={c.slug}
              href={`/fishing-spots/near/${c.slug}`}
              className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            >
              {c.name}から近い釣り場
            </Link>
          ))}
          {nearbyPrefNames.map((name) => {
            const p = getPrefectureByName(name);
            return p ? (
              <Link
                prefetch={false}
                key={p.slug}
                href={`/prefecture/${p.slug}`}
                className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted"
              >
                {name}の釣り場
              </Link>
            ) : null;
          })}
          {pref && !nearbyPrefNames.includes(city.prefecture) && (
            <Link
              prefetch={false}
              href={`/prefecture/${pref.slug}`}
              className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted"
            >
              {city.prefecture}の釣り場
            </Link>
          )}
          <Link
            prefetch={false}
            href="/fishing-spots/by-train"
            className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            電車で行ける釣り場
          </Link>
          <Link
            prefetch={false}
            href="/fishing-spots/near-me"
            className="rounded-full border bg-background px-3 py-1.5 text-sm hover:bg-muted"
          >
            現在地から探す
          </Link>
        </div>
      </section>
    </div>
  );
}
