import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import {
  FEATURE_ICONS,
  FeatureChipGrid,
  RegionPrefGrid,
  SpotSpecCard,
} from "@/components/spots/spot-feature-ui";
import {
  MIN_SPOTS_PER_PREF,
  SPOT_FEATURES,
  getFeaturePrefCounts,
  getFeatureSpots,
  getSpotFeature,
} from "@/lib/data/spot-features";

type PageProps = { params: Promise<{ feature: string }> };

const TOP_LIMIT = 30;

export function generateStaticParams() {
  return SPOT_FEATURES.map((f) => ({ feature: f.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { feature: slug } = await params;
  const feature = getSpotFeature(slug);
  if (!feature) return { title: "ページが見つかりません" };
  const count = getFeatureSpots(feature).length;
  const url = `https://tsurispot.com/spot-feature/${feature.slug}`;
  const title = `${feature.heading}【全国${count}件】都道府県別に探す`;
  const description = `全国の${feature.heading}を${count}件掲載。都道府県ごとの一覧から、トイレ・駐車場・料金・難易度・釣れる魚を比べて選べます。`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "ツリスポ",
      images: [
        {
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(feature.heading)}&emoji=%F0%9F%8E%A3`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function SpotFeaturePage({ params }: PageProps) {
  const { feature: slug } = await params;
  const feature = getSpotFeature(slug);
  if (!feature) permanentRedirect("/spot-feature");

  const spots = getFeatureSpots(feature);
  const prefCounts = getFeaturePrefCounts(feature);
  const Icon = FEATURE_ICONS[feature.icon];
  const url = `https://tsurispot.com/spot-feature/${feature.slug}`;
  const allFeatures = SPOT_FEATURES.map((f) => ({ feature: f }));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
        { "@type": "ListItem", position: 2, name: "特徴から探す", item: "https://tsurispot.com/spot-feature" },
        { "@type": "ListItem", position: 3, name: feature.heading, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: feature.heading,
      numberOfItems: spots.length,
      itemListElement: spots.slice(0, TOP_LIMIT).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `https://tsurispot.com/spots/${s.slug}`,
      })),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "特徴から探す", href: "/spot-feature" },
          { label: feature.label },
        ]}
      />

      <header className="mt-2 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{feature.heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">全国 {spots.length}件</p>
        </div>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{feature.intro}</p>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">都道府県から探す</h2>
        <RegionPrefGrid
          items={prefCounts}
          minCount={MIN_SPOTS_PER_PREF}
          hrefFor={(pref) => `/spot-feature/${feature.slug}/${pref.slug}`}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          ※数字は掲載件数。{MIN_SPOTS_PER_PREF}件未満の県は各スポットページから確認してください。
        </p>
      </section>

      <InArticleAd className="my-6" />

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">
          全国の{feature.heading}（評価順 上位{Math.min(TOP_LIMIT, spots.length)}件）
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {spots.slice(0, TOP_LIMIT).map((spot) => (
            <SpotSpecCard key={spot.id} spot={spot} />
          ))}
        </div>
      </section>

      {feature.tips.length > 0 && (
        <section className="mt-8 rounded-2xl border bg-amber-50/60 p-4 dark:bg-amber-950/20 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Lightbulb className="size-5 text-amber-600" aria-hidden="true" />
            {feature.label}の釣り場に行くときのポイント
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
            {feature.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">ほかの特徴から探す</h2>
        <FeatureChipGrid items={allFeatures} activeSlug={feature.slug} />
      </section>
    </div>
  );
}
