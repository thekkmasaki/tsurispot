import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { Lightbulb, ChevronLeft } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import { SeasonalAffiliateSection } from "@/components/seasonal-affiliate-section";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";
import { getPrefectureBySlug } from "@/lib/data/prefectures";
import {
  FEATURE_ICONS,
  FeatureChipGrid,
  RegionPrefGrid,
  SpotSpecCard,
} from "@/components/spots/spot-feature-ui";
import {
  MIN_SPOTS_PER_PREF,
  getFeaturePrefCombos,
  getFeaturePrefCounts,
  getFeatureSpots,
  getFeaturesForPref,
  getSpotFeature,
} from "@/lib/data/spot-features";

type PageProps = { params: Promise<{ feature: string; prefecture: string }> };

/** 1ページに出すカード上限（大県の「駐車場あり」等で数百件になるのを防ぐ） */
const LIST_LIMIT = 60;

export function generateStaticParams() {
  return getFeaturePrefCombos();
}

async function resolve(params: PageProps["params"]) {
  const { feature: fSlug, prefecture } = await params;
  const feature = getSpotFeature(fSlug);
  const pref = getPrefectureBySlug(prefecture);
  return { feature, pref, fSlug, prefecture };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { feature, pref } = await resolve(params);
  if (!feature || !pref) return { title: "ページが見つかりません" };
  const spots = getFeatureSpots(feature, pref.name);
  const url = `https://tsurispot.com/spot-feature/${feature.slug}/${pref.slug}`;
  const fish = topFishNames(spots, 3);
  const title = `${pref.name}の${feature.heading}${spots.length}選`;
  const description = `${pref.name}の${feature.heading}を${spots.length}件紹介。${
    fish.length ? `${fish.join("・")}などが釣れます。` : ""
  }トイレ・駐車場・料金・難易度を一覧で比べて選べます。`;
  return {
    title,
    description,
    alternates: { canonical: url },
    // 件数が基準未満の組み合わせは本体で 301 するが、念のため noindex
    robots: spots.length < MIN_SPOTS_PER_PREF ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "ツリスポ",
      images: [
        {
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(title)}&emoji=%F0%9F%93%8D`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

function topFishNames(spots: ReturnType<typeof getFeatureSpots>, n: number): string[] {
  const m = new Map<string, number>();
  for (const s of spots) {
    for (const name of new Set(s.catchableFish.map((c) => c.fish.name))) {
      m.set(name, (m.get(name) ?? 0) + 1);
    }
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([name]) => name);
}

export default async function SpotFeaturePrefPage({ params }: PageProps) {
  const { feature, pref, fSlug } = await resolve(params);
  if (!feature) permanentRedirect("/spot-feature");
  if (!pref) permanentRedirect(`/spot-feature/${fSlug}`);

  const spots = getFeatureSpots(feature, pref.name);
  if (spots.length < MIN_SPOTS_PER_PREF) permanentRedirect(`/spot-feature/${feature.slug}`);

  const Icon = FEATURE_ICONS[feature.icon];
  const url = `https://tsurispot.com/spot-feature/${feature.slug}/${pref.slug}`;
  const shown = spots.slice(0, LIST_LIMIT);
  const fish = topFishNames(spots, 6);
  const prefFeatures = getFeaturesForPref(pref.name);
  const otherPrefs = getFeaturePrefCounts(feature);
  const freeCount = spots.filter((s) => s.isFree).length;
  const beginnerCount = spots.filter((s) => s.difficulty === "beginner").length;
  const toiletCount = spots.filter((s) => s.hasToilet).length;

  const methods = [...new Set(spots.flatMap((s) => s.catchableFish.map((c) => c.method)))];
  const affiliateProducts = getRelevantAffiliateProducts(
    methods,
    new Date().getMonth() + 1,
    3,
    feature.slug === "night",
    pref.name,
    fish.slice(0, 3),
  );

  const faqItems = [
    {
      question: `${pref.name}の${feature.heading}は何件ありますか？`,
      answer: `ツリスポには${pref.name}の${feature.heading}が${spots.length}件掲載されています。そのうち無料で釣りができる場所は${freeCount}件、初心者向けは${beginnerCount}件です。`,
    },
    {
      question: `${pref.name}の${feature.heading}ではどんな魚が釣れますか？`,
      answer: fish.length
        ? `掲載スポットでは${fish.join("、")}などが多く釣れています。季節ごとの釣れる魚は各スポットページで確認できます。`
        : `釣れる魚は各スポットページで確認できます。`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
        { "@type": "ListItem", position: 2, name: "特徴から探す", item: "https://tsurispot.com/spot-feature" },
        {
          "@type": "ListItem",
          position: 3,
          name: feature.heading,
          item: `https://tsurispot.com/spot-feature/${feature.slug}`,
        },
        { "@type": "ListItem", position: 4, name: pref.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${pref.name}の${feature.heading}`,
      numberOfItems: spots.length,
      itemListElement: shown.slice(0, 30).map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: s.name,
        url: `https://tsurispot.com/spots/${s.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
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
          { label: feature.label, href: `/spot-feature/${feature.slug}` },
          { label: pref.name },
        ]}
      />
      <Link
        prefetch={false}
        href={`/prefecture/${pref.slug}`}
        className="inline-flex min-h-[44px] items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        {pref.name}の釣り場トップへ
      </Link>

      <header className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
            {pref.name}の{feature.heading}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{spots.length}件</p>
        </div>
      </header>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {feature.intro}
        {fish.length > 0 && `${pref.name}の該当スポットでは${fish.slice(0, 4).join("・")}などが釣れます。`}
      </p>

      {/* サマリ（サウナイキタイの施設スペック表示を参考に、数字を大きく） */}
      <div className="mt-5 grid grid-cols-3 divide-x rounded-2xl border bg-card text-center">
        {[
          { label: "無料", value: freeCount },
          { label: "初心者向け", value: beginnerCount },
          { label: "トイレあり", value: toiletCount },
        ].map((x) => (
          <div key={x.label} className="px-2 py-3">
            <p className="text-xl font-bold tabular-nums sm:text-2xl">{x.value}</p>
            <p className="text-xs text-muted-foreground">{x.label}</p>
          </div>
        ))}
      </div>

      {/* 同じ県で条件を切り替える（サウナイキタイの絞り込みタブ相当） */}
      {prefFeatures.length > 1 && (
        <section className="mt-6">
          <h2 className="mb-3 text-base font-bold">{pref.name}で条件を変える</h2>
          <FeatureChipGrid items={prefFeatures} prefSlug={pref.slug} activeSlug={feature.slug} />
        </section>
      )}

      <InArticleAd className="my-6" />

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">
          {pref.name}の{feature.heading}一覧
          {spots.length > LIST_LIMIT && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              評価順に上位{LIST_LIMIT}件を表示
            </span>
          )}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((spot) => (
            <SpotSpecCard key={spot.id} spot={spot} />
          ))}
        </div>
        {spots.length > LIST_LIMIT && (
          <p className="mt-3 text-sm text-muted-foreground">
            残りの{spots.length - LIST_LIMIT}件は
            <Link prefetch={false} href={`/prefecture/${pref.slug}/all`} className="mx-1 text-sky-700 hover:underline">
              {pref.name}の全釣り場一覧
            </Link>
            で探せます。
          </p>
        )}
      </section>

      <SeasonalAffiliateSection
        products={affiliateProducts}
        seasonLabel={`${pref.name}の${feature.heading}`}
        regionName=""
      />

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
        <h2 className="mb-3 text-lg font-bold">よくある質問</h2>
        <dl className="space-y-3">
          {faqItems.map((q) => (
            <div key={q.question} className="rounded-xl border bg-card p-4">
              <dt className="text-sm font-bold">Q. {q.question}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">ほかの都道府県の{feature.heading}</h2>
        <RegionPrefGrid
          items={otherPrefs}
          minCount={MIN_SPOTS_PER_PREF}
          hrefFor={(p) => `/spot-feature/${feature.slug}/${p.slug}`}
        />
      </section>
    </div>
  );
}
