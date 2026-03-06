import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Target, ChevronLeft, HelpCircle, Users, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { fishingSpots } from "@/lib/data/spots";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

type PageProps = {
  params: Promise<{ type: string; prefecture: string }>;
};

const SPOT_TYPE_KEYS = Object.keys(SPOT_TYPE_LABELS) as FishingSpot["spotType"][];

export function generateStaticParams() {
  const combos: { type: string; prefecture: string }[] = [];
  const seen = new Set<string>();
  for (const spot of fishingSpots) {
    const pref = prefectures.find((p) => p.name === spot.region.prefecture);
    if (!pref) continue;
    const key = `${spot.spotType}/${pref.slug}`;
    if (!seen.has(key)) {
      seen.add(key);
      combos.push({ type: spot.spotType, prefecture: pref.slug });
    }
  }
  return combos;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { type, prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  if (!pref || !SPOT_TYPE_KEYS.includes(type as FishingSpot["spotType"])) {
    return { title: "ページが見つかりません" };
  }

  const label = SPOT_TYPE_LABELS[type as FishingSpot["spotType"]];
  const spots = fishingSpots.filter(
    (s) => s.spotType === type && s.region.prefecture === pref.name
  );
  const title = `${pref.name}の${label}釣り場${spots.length}選【2026年最新】`;
  const description = `${pref.name}の${label}の釣り場${spots.length}件を紹介。釣れる魚・難易度・設備・アクセス情報を完全ガイド。初心者から上級者まで${pref.name}の${label}で釣りをするならツリスポ。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/spot-type/${type}/${prefecture}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/spot-type/${type}/${prefecture}`,
    },
  };
}

export default async function SpotTypePrefecturePage({ params }: PageProps) {
  const { type, prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  if (!pref || !SPOT_TYPE_KEYS.includes(type as FishingSpot["spotType"])) notFound();

  const spotType = type as FishingSpot["spotType"];
  const label = SPOT_TYPE_LABELS[spotType];
  const spots = fishingSpots.filter(
    (s) => s.spotType === spotType && s.region.prefecture === pref.name
  );
  if (spots.length === 0) notFound();

  // 難易度集計
  const difficultyCount = { beginner: 0, intermediate: 0, advanced: 0 };
  for (const spot of spots) {
    difficultyCount[spot.difficulty]++;
  }
  const freeCount = spots.filter((s) => s.isFree).length;

  // 釣れる魚集計
  const fishCountMap = new Map<
    string,
    { name: string; slug: string; count: number }
  >();
  for (const spot of spots) {
    for (const cf of spot.catchableFish) {
      const existing = fishCountMap.get(cf.fish.slug);
      if (existing) {
        existing.count++;
      } else {
        fishCountMap.set(cf.fish.slug, {
          name: cf.fish.name,
          slug: cf.fish.slug,
          count: 1,
        });
      }
    }
  }
  const topFish = Array.from(fishCountMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // 釣り方集計
  const methodMap = new Map<string, number>();
  for (const spot of spots) {
    for (const cf of spot.catchableFish) {
      methodMap.set(cf.method, (methodMap.get(cf.method) || 0) + 1);
    }
  }
  const methodBreakdown = Array.from(methodMap.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // 同タイプの他県
  const otherPrefsForType = new Map<
    string,
    { prefSlug: string; prefName: string; count: number }
  >();
  for (const spot of fishingSpots) {
    if (spot.spotType !== spotType) continue;
    if (spot.region.prefecture === pref.name) continue;
    const spotPref = prefectures.find(
      (p) => p.name === spot.region.prefecture
    );
    if (!spotPref) continue;
    const existing = otherPrefsForType.get(spotPref.slug);
    if (existing) {
      existing.count++;
    } else {
      otherPrefsForType.set(spotPref.slug, {
        prefSlug: spotPref.slug,
        prefName: spotPref.name,
        count: 1,
      });
    }
  }
  const relatedPrefs = Array.from(otherPrefsForType.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // 同県の他タイプ
  const otherTypesInPref: { type: FishingSpot["spotType"]; count: number }[] = [];
  for (const t of SPOT_TYPE_KEYS) {
    if (t === spotType) continue;
    const count = fishingSpots.filter(
      (s) => s.spotType === t && s.region.prefecture === pref.name
    ).length;
    if (count > 0) {
      otherTypesInPref.push({ type: t, count });
    }
  }
  otherTypesInPref.sort((a, b) => b.count - a.count);

  const pageUrl = `https://tsurispot.com/spot-type/${type}/${prefecture}`;

  // FAQ
  const faqItems = [
    {
      question: `${pref.name}の${label}の釣り場は何件ありますか？`,
      answer: `現在、${pref.name}の${label}の釣り場は${spots.length}件掲載しています。${difficultyCount.beginner > 0 ? `初心者向けは${difficultyCount.beginner}件です。` : ""}`,
    },
    {
      question: `${pref.name}の${label}ではどんな魚が釣れますか？`,
      answer:
        topFish.length > 0
          ? `${pref.name}の${label}では${topFish.slice(0, 5).map((f) => f.name).join("、")}などが釣れます。${methodBreakdown.length > 0 ? `主な釣り方は${methodBreakdown.slice(0, 3).map((m) => m.method).join("、")}です。` : ""}`
          : `${pref.name}の${label}で釣れる魚の詳細は各スポットページでご確認ください。`,
    },
    {
      question: `${pref.name}の${label}で無料で釣れる場所はありますか？`,
      answer:
        freeCount > 0
          ? `${pref.name}の${label}のうち${freeCount}件が無料で釣りができます。有料のスポットは${spots.length - freeCount}件です。各スポットの詳細ページで料金情報をご確認ください。`
          : `${pref.name}の${label}の料金詳細は各スポットページでご確認ください。`,
    },
  ];

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
        name: "釣り場タイプ別",
        item: "https://tsurispot.com/spot-type",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${label}の釣り場`,
        item: `https://tsurispot.com/spot-type/${type}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${pref.name}の${label}`,
        item: pageUrl,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${pref.name}の${label}の釣り場`,
    numberOfItems: spots.length,
    itemListElement: spots.slice(0, 30).map((spot, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, faqJsonLd, itemListJsonLd]),
        }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣り場タイプ別", href: "/spot-type" },
          { label: `${label}の釣り場`, href: `/spot-type/${type}` },
          { label: `${pref.name}` },
        ]}
      />

      <Link
        href={`/spot-type/${type}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {label}の釣り場一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の{label}釣り場一覧
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {spots.length}件の{label}スポットを掲載
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pref.name}にある{label}の釣り場を{spots.length}件掲載しています。
          {topFish.length > 0 &&
            `主に${topFish
              .slice(0, 4)
              .map((f) => f.name)
              .join("・")}などが釣れます。`}
          {difficultyCount.beginner > 0 &&
            `初心者向けのスポットは${difficultyCount.beginner}件あります。`}
        </p>
      </div>

      {/* サマリカード */}
      <section className="mb-6 sm:mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Users className="size-4 text-primary" />
                難易度の内訳
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                {(
                  Object.entries(difficultyCount) as [
                    keyof typeof DIFFICULTY_LABELS,
                    number,
                  ][]
                ).map(
                  ([key, count]) =>
                    count > 0 && (
                      <p key={key}>
                        {DIFFICULTY_LABELS[key]}: {count}件
                      </p>
                    )
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Wallet className="size-4 text-primary" />
                料金
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>無料: {freeCount}件</p>
                <p>有料: {spots.length - freeCount}件</p>
              </div>
            </CardContent>
          </Card>

          {methodBreakdown.length > 0 && (
            <Card className="gap-0 py-0">
              <CardContent className="p-4">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Target className="size-4 text-primary" />
                  主な釣り方
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {methodBreakdown.slice(0, 5).map(({ method, count }) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                      <span className="ml-1 text-muted-foreground">
                        ({count})
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {topFish.length > 0 && (
            <Card className="gap-0 py-0">
              <CardContent className="p-4">
                <h2 className="mb-2 text-sm font-bold">釣れる魚</h2>
                <div className="flex flex-wrap gap-1">
                  {topFish.slice(0, 6).map((f) => (
                    <Link key={f.slug} href={`/fish/${f.slug}`}>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer text-xs hover:bg-primary hover:text-primary-foreground"
                      >
                        {f.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* スポット一覧 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <MapPin className="size-5 text-primary" />
          {pref.name}の{label}スポット（{spots.length}件）
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots
            .sort((a, b) => b.rating - a.rating)
            .map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
        </div>
      </section>

      {/* 同県の他タイプ */}
      {otherTypesInPref.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.name}の他の釣り場タイプ
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {otherTypesInPref.map(({ type: t, count }) => (
              <Link key={t} href={`/spot-type/${t}/${pref.slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary">
                      {SPOT_TYPE_LABELS[t]}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {count}スポット
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 同タイプの他県 */}
      {relatedPrefs.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {label}の釣り場がある他の都道府県
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {relatedPrefs.map((p) => (
              <Link
                key={p.prefSlug}
                href={`/spot-type/${type}/${p.prefSlug}`}
              >
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                      {p.prefName}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.count}スポット
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          {pref.name}の{label}に関するよくある質問
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <Card key={idx} className="gap-0 py-0">
              <CardContent className="p-4">
                <h3 className="mb-2 text-sm font-bold sm:text-base">
                  Q. {item.question}
                </h3>
                <p className="text-sm text-muted-foreground">
                  A. {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 関連リンク */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          関連リンク
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/spot-type/${type}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {label}の釣り場一覧
          </Link>
          <Link
            href={`/prefecture/${pref.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の釣り場
          </Link>
          <Link
            href="/spot-type"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            釣り場タイプ一覧
          </Link>
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
        </div>
      </section>
    </div>
  );
}
