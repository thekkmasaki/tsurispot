import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ChevronLeft, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { fishingSpots } from "@/lib/data/spots";
import { prefectures } from "@/lib/data/prefectures";
import { regionGroupOrder } from "@/lib/data/prefectures";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import type { FishingSpot } from "@/types";

type PageProps = {
  params: Promise<{ type: string }>;
};

const SPOT_TYPE_KEYS = Object.keys(SPOT_TYPE_LABELS) as FishingSpot["spotType"][];

const SPOT_TYPE_DESCRIPTIONS: Record<FishingSpot["spotType"], string> = {
  port: "漁港は船の停泊場所を兼ねた釣り場で、足場が良く安全に釣りが楽しめます。常夜灯がある漁港では夜釣りでアジやメバルが狙え、日中はサビキ釣りやちょい投げで多彩な魚種が釣れます。初心者やファミリーにもおすすめの釣り場タイプです。",
  beach: "砂浜（サーフ）は投げ釣りの定番ポイントです。シロギスやカレイなどの砂地を好む魚が主なターゲット。近年はサーフフィッシングでヒラメやマゴチを狙うルアー釣りも大人気です。広い砂浜で開放感のある釣りが楽しめます。",
  rocky: "磯は岩場からダイナミックな釣りが楽しめるフィールドです。メジナ（グレ）やクロダイ（チヌ）のフカセ釣り、石鯛の底物釣りなど大物が狙えます。足場に注意が必要ですが、その分釣果も期待できる上級者に人気のフィールドです。",
  river: "河川は渓流のイワナ・ヤマメから、中流域のバス・ナマズ、河口域のシーバス・ハゼまで多彩な釣りが楽しめます。季節によってアユの友釣りやサケ・マス釣りなど、河川ならではの釣りも魅力です。",
  pier: "桟橋は水面に張り出した構造物から釣りができるスポットです。足場が安定しており、水深もあるため、回遊魚のサビキ釣りやアジング、メバリングに最適。家族連れや初心者にも安心して楽しめる釣り場です。",
  breakwater: "堤防は最も身近で人気のある釣り場タイプです。サビキ釣り、ウキ釣り、投げ釣り、ルアー釣りなどあらゆる釣り方が楽しめます。初心者からベテランまで幅広い釣り人に愛される、日本の釣りの原点とも言える釣り場です。",
};

export const dynamicParams = false;

export function generateStaticParams() {
  const types = new Set<string>();
  for (const spot of fishingSpots) {
    types.add(spot.spotType);
  }
  return Array.from(types).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { type } = await params;
  if (!SPOT_TYPE_KEYS.includes(type as FishingSpot["spotType"])) {
    return { title: "ページが見つかりません" };
  }
  const label = SPOT_TYPE_LABELS[type as FishingSpot["spotType"]];
  const spots = fishingSpots.filter((s) => s.spotType === type);
  const title = `${label}の釣り場一覧 - 全国${spots.length}件【2026年最新】`;
  const description = `全国の${label}の釣り場${spots.length}件を都道府県別に紹介。${label}で釣れる魚・難易度・設備情報を完全ガイド。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/spot-type/${type}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/spot-type/${type}`,
    },
  };
}

export default async function SpotTypePage({ params }: PageProps) {
  const { type } = await params;
  if (!SPOT_TYPE_KEYS.includes(type as FishingSpot["spotType"])) notFound();

  const spotType = type as FishingSpot["spotType"];
  const label = SPOT_TYPE_LABELS[spotType];
  const spots = fishingSpots.filter((s) => s.spotType === spotType);
  if (spots.length === 0) notFound();

  // 都道府県別集計
  const prefMap = new Map<string, FishingSpot[]>();
  for (const spot of spots) {
    const prefName = spot.region.prefecture;
    if (!prefMap.has(prefName)) prefMap.set(prefName, []);
    prefMap.get(prefName)!.push(spot);
  }

  // 地方グループ別に整理
  const regionData: {
    group: string;
    prefs: { pref: (typeof prefectures)[number]; spots: FishingSpot[] }[];
  }[] = [];
  for (const group of regionGroupOrder) {
    const groupPrefs = prefectures.filter((p) => p.regionGroup === group);
    const prefsWithSpots = groupPrefs
      .map((pref) => ({
        pref,
        spots: prefMap.get(pref.name) || [],
      }))
      .filter((p) => p.spots.length > 0);
    if (prefsWithSpots.length > 0) {
      regionData.push({ group, prefs: prefsWithSpots });
    }
  }

  // 難易度集計
  const difficultyCount = { beginner: 0, intermediate: 0, advanced: 0 };
  const freeCount = spots.filter((s) => s.isFree).length;
  for (const spot of spots) {
    difficultyCount[spot.difficulty]++;
  }

  // 釣れる魚集計
  const fishCountMap = new Map<string, { name: string; slug: string; count: number }>();
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

  // 他のタイプ
  const otherTypes = SPOT_TYPE_KEYS.filter((t) => t !== spotType);

  const pageUrl = `https://tsurispot.com/spot-type/${type}`;

  // FAQ
  const faqItems = [
    {
      question: `全国に${label}の釣り場は何件ありますか？`,
      answer: `現在、全国の${label}の釣り場は${spots.length}件掲載しています。${regionData.length > 0 ? `${regionData.map((r) => r.group).join("・")}の各地方にスポットがあります。` : ""}`,
    },
    {
      question: `${label}での釣りは初心者でも楽しめますか？`,
      answer: `${label}の釣り場のうち${difficultyCount.beginner}件が初心者向けです。${freeCount > 0 ? `無料で釣りができるスポットも${freeCount}件あります。` : ""}初めての方でも安心して楽しめるスポットが多数あります。`,
    },
    {
      question: `${label}ではどんな魚が釣れますか？`,
      answer: topFish.length > 0
        ? `${label}では${topFish.slice(0, 5).map((f) => f.name).join("、")}などが釣れます。全${fishCountMap.size}種以上の魚種が狙えます。`
        : `${label}で釣れる魚の詳細は各スポットページでご確認ください。`,
    },
  ];

  // JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "釣り場タイプ別", item: "https://tsurispot.com/spot-type" },
      { "@type": "ListItem", position: 3, name: `${label}の釣り場`, item: pageUrl },
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
    name: `${label}の釣り場一覧`,
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
          { label: `${label}の釣り場` },
        ]}
      />

      <Link
        href="/spot-type"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        釣り場タイプ一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {label}の釣り場一覧
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          全国{spots.length}件の{label}スポットを都道府県別に紹介
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {SPOT_TYPE_DESCRIPTIONS[spotType]}
        </p>
      </div>

      {/* サマリカード */}
      <section className="mb-6 sm:mb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 text-sm font-bold">難易度の内訳</h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                {(Object.entries(difficultyCount) as [keyof typeof DIFFICULTY_LABELS, number][]).map(
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
              <h2 className="mb-2 text-sm font-bold">料金</h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>無料: {freeCount}件</p>
                <p>有料: {spots.length - freeCount}件</p>
              </div>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 text-sm font-bold">人気の魚種</h2>
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
        </div>
      </section>

      {/* 都道府県別一覧 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <MapPin className="size-5 text-primary" />
          都道府県別の{label}
        </h2>

        <div className="space-y-6">
          {regionData.map(({ group, prefs }) => (
            <div key={group}>
              <h3 className="mb-3 text-sm font-bold text-muted-foreground">
                {group}
              </h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {prefs.map(({ pref, spots: prefSpots }) => (
                  <Link
                    key={pref.slug}
                    href={`/spot-type/${type}/${pref.slug}`}
                  >
                    <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                      <CardContent className="p-3 sm:p-4">
                        <h4 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                          {pref.name}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {prefSpots.length}スポット
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 人気スポットピックアップ */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 text-base font-bold sm:text-lg">
          {label}の人気スポット
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6)
            .map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
        </div>
      </section>

      {/* 他の釣り場タイプ */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-base font-bold sm:text-lg">
          他の釣り場タイプ
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {otherTypes.map((t) => {
            const tCount = fishingSpots.filter((s) => s.spotType === t).length;
            return (
              <Link key={t} href={`/spot-type/${t}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary">
                      {SPOT_TYPE_LABELS[t]}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tCount}スポット
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          {label}の釣り場に関するよくある質問
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
          <Link
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
        </div>
      </section>
    </div>
  );
}
