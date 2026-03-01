import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Thermometer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { MONTHS } from "@/lib/data/fishing-methods";
import { prefectures } from "@/lib/data/prefectures";
import { fishSpecies } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";

type PageProps = {
  params: Promise<{ month: string; regionGroup: string }>;
};

// 地域グループのスラッグマッピング
const REGION_GROUP_SLUGS: Record<string, string> = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kinki: "近畿",
  chugoku: "中国",
  shikoku: "四国",
  "kyushu-okinawa": "九州・沖縄",
};

const REGION_GROUP_SLUG_ENTRIES = Object.entries(REGION_GROUP_SLUGS);

function getRegionGroupBySlug(slug: string): string | undefined {
  return REGION_GROUP_SLUGS[slug];
}

function getRegionGroupSlug(name: string): string | undefined {
  return REGION_GROUP_SLUG_ENTRIES.find(([, v]) => v === name)?.[0];
}

// 季節のコツテキスト
function getSeasonalTips(season: string, regionName: string): string[] {
  const tips: string[] = [];

  switch (season) {
    case "冬":
      tips.push(
        "防寒対策を万全にしましょう。特に風が強い海沿いでは体感温度が下がります。",
        "日が短いため、早朝の準備は暗い中での作業になります。ヘッドライトの用意を。",
        "冬場は魚の活性が下がるため、エサ釣りでじっくり待つスタイルが有効です。"
      );
      if (regionName === "北海道" || regionName === "東北") {
        tips.push("路面凍結に注意。スタッドレスタイヤは必須です。");
      }
      break;
    case "春":
      tips.push(
        "水温の上昇に伴い、魚の活性が高まる季節です。",
        "花粉シーズンと重なるため、花粉症の方は対策を。",
        "産卵期の魚が多く、大型が狙えるチャンスです。"
      );
      break;
    case "夏":
      tips.push(
        "熱中症対策として、こまめな水分補給と日陰の確保が重要です。",
        "朝マヅメ・夕マヅメが最も釣果が期待できる時間帯です。",
        "夏休み期間はファミリーフィッシングで混雑するスポットが増えます。"
      );
      if (regionName === "九州・沖縄") {
        tips.push("台風シーズンに入ります。天気予報のチェックを怠らないようにしましょう。");
      }
      break;
    case "秋":
      tips.push(
        "多くの魚種が釣れるベストシーズンです。",
        "秋は魚が越冬に向けて餌を活発に追うため、ルアーへの反応も良くなります。",
        "日没が早まるため、帰りの時間に余裕を持ちましょう。"
      );
      break;
  }

  return tips;
}

// 12ヶ月 × 8地域 = 96ページ
export function generateStaticParams() {
  const params: { month: string; regionGroup: string }[] = [];
  for (const m of MONTHS) {
    for (const rSlug of Object.keys(REGION_GROUP_SLUGS)) {
      params.push({ month: m.slug, regionGroup: rSlug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { month: monthSlug, regionGroup: regionSlug } = await params;
  const monthDef = MONTHS.find((m) => m.slug === monthSlug);
  const regionName = getRegionGroupBySlug(regionSlug);
  if (!monthDef || !regionName) return { title: "ページが見つかりません" };

  const title = `${monthDef.name}に${regionName}で釣れる魚と釣り場【2026年版】`;
  const description = `${monthDef.name}（${monthDef.season}）に${regionName}地方で釣れる魚種と人気の釣り場を紹介。ベストシーズンの魚をピックアップし、おすすめスポットをご案内。${regionName}の${monthDef.name}の釣り情報はツリスポで。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/seasonal/${monthSlug}/${regionSlug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/seasonal/${monthSlug}/${regionSlug}`,
    },
  };
}

export default async function SeasonalMonthRegionPage({ params }: PageProps) {
  const { month: monthSlug, regionGroup: regionSlug } = await params;
  const monthDef = MONTHS.find((m) => m.slug === monthSlug);
  const regionName = getRegionGroupBySlug(regionSlug);
  if (!monthDef || !regionName) notFound();

  // この地域に含まれる都道府県
  const regionPrefs = prefectures.filter((p) => p.regionGroup === regionName);
  const regionPrefNames = new Set(regionPrefs.map((p) => p.name));

  // この地域のスポット
  const regionSpots = fishingSpots.filter((s) =>
    regionPrefNames.has(s.region.prefecture)
  );

  // この月にこの地域で釣れる魚を集計
  const fishMap = new Map<
    string,
    {
      slug: string;
      name: string;
      isPeak: boolean;
      spotCount: number;
      methods: Set<string>;
    }
  >();

  for (const spot of regionSpots) {
    for (const cf of spot.catchableFish) {
      if (!cf.fish.seasonMonths.includes(monthDef.num)) continue;
      const existing = fishMap.get(cf.fish.slug);
      if (existing) {
        existing.spotCount++;
        if (cf.method) existing.methods.add(cf.method);
        if (cf.fish.peakMonths.includes(monthDef.num)) existing.isPeak = true;
      } else {
        fishMap.set(cf.fish.slug, {
          slug: cf.fish.slug,
          name: cf.fish.name,
          isPeak: cf.fish.peakMonths.includes(monthDef.num),
          spotCount: 1,
          methods: new Set(cf.method ? [cf.method] : []),
        });
      }
    }
  }

  // ピーク/シーズン中で分類
  const allFishList = Array.from(fishMap.values());
  const peakFish = allFishList
    .filter((f) => f.isPeak)
    .sort((a, b) => b.spotCount - a.spotCount);
  const seasonFish = allFishList
    .filter((f) => !f.isPeak)
    .sort((a, b) => b.spotCount - a.spotCount);

  // 各魚に対応するスポットTop3を取得
  function getSpotsForFish(fishSlug: string) {
    return regionSpots
      .filter((s) =>
        s.catchableFish.some(
          (cf) =>
            cf.fish.slug === fishSlug &&
            cf.fish.seasonMonths.includes(monthDef!.num)
        )
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }

  // おすすめスポットTOP6（旬の魚が多いスポット）
  const topSpots = regionSpots
    .map((spot) => {
      const inSeasonCount = spot.catchableFish.filter((cf) =>
        cf.fish.seasonMonths.includes(monthDef.num)
      ).length;
      const peakCount = spot.catchableFish.filter((cf) =>
        cf.fish.peakMonths.includes(monthDef.num)
      ).length;
      return { spot, inSeasonCount, peakCount };
    })
    .filter((s) => s.inSeasonCount > 0)
    .sort((a, b) => b.peakCount - a.peakCount || b.inSeasonCount - a.inSeasonCount || b.spot.rating - a.spot.rating)
    .slice(0, 6);

  // 前月/翌月
  const monthIdx = MONTHS.findIndex((m) => m.slug === monthSlug);
  const prevMonth = MONTHS[(monthIdx - 1 + 12) % 12];
  const nextMonth = MONTHS[(monthIdx + 1) % 12];

  // 季節のコツ
  const seasonalTips = getSeasonalTips(monthDef.season, regionName);

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
        name: "今釣れる魚",
        item: "https://tsurispot.com/catchable-now",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: monthDef.name,
        item: `https://tsurispot.com/seasonal/${monthSlug}/${regionSlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: regionName,
        item: `https://tsurispot.com/seasonal/${monthSlug}/${regionSlug}`,
      },
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${monthDef.name}に${regionName}で釣れる魚`,
    numberOfItems: allFishList.length,
    itemListElement: allFishList.slice(0, 30).map((f, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: f.name,
      url: `https://tsurispot.com/fish/${f.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "今釣れる魚", href: "/catchable-now" },
          { label: monthDef.name },
          { label: regionName },
        ]}
      />

      {/* 戻るリンク */}
      <Link
        href="/catchable-now"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        今釣れる魚に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {monthDef.name}に{regionName}で釣れる魚と釣り場
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {monthDef.season}（{monthDef.name}）の{regionName}地方
          ｜ 釣れる魚{allFishList.length}種 ・ 対象スポット{regionSpots.length}件
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {monthDef.name}に{regionName}地方で釣れる魚を{allFishList.length}種掲載しています。
          {peakFish.length > 0 && `特に${peakFish.slice(0, 4).map((f) => f.name).join("・")}は最盛期を迎えます。`}
          {regionPrefs.length > 0 && `対象エリアは${regionPrefs.map((p) => p.nameShort).join("・")}です。`}
        </p>
      </div>

      {/* 前月/翌月ナビ */}
      <div className="mb-6 flex items-center justify-between gap-2">
        <Link
          href={`/seasonal/${prevMonth.slug}/${regionSlug}`}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
          {prevMonth.name}
        </Link>
        <span className="text-sm font-medium text-muted-foreground">
          {monthDef.name}（{monthDef.season}）
        </span>
        <Link
          href={`/seasonal/${nextMonth.slug}/${regionSlug}`}
          className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted"
        >
          {nextMonth.name}
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* 最盛期の魚 */}
      {peakFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Flame className="size-5 text-orange-500" />
            {monthDef.name}が最盛期の魚（{regionName}）
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {peakFish.map((f) => {
              const topSpots = getSpotsForFish(f.slug);
              return (
                <Card key={f.slug} className="gap-0 py-0">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/fish/${f.slug}`} className="group">
                        <h3 className="text-sm font-bold group-hover:text-primary sm:text-base">
                          {f.name}
                        </h3>
                      </Link>
                      <Badge className="shrink-0 bg-orange-500 text-xs hover:bg-orange-500">
                        最盛期
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {f.spotCount}スポットで釣れます
                    </p>
                    {f.methods.size > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Array.from(f.methods).slice(0, 3).map((m) => (
                          <Badge key={m} variant="outline" className="text-[10px]">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {topSpots.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {topSpots.map((spot) => (
                          <Link
                            key={spot.id}
                            href={`/spots/${spot.slug}`}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                          >
                            <MapPin className="size-3 shrink-0" />
                            {spot.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* シーズン中の魚 */}
      {seasonFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Fish className="size-5 text-blue-500" />
            {monthDef.name}にシーズンの魚（{regionName}）
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {seasonFish.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}`}>
                <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Fish className="size-4 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                          {f.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {f.spotCount}スポット
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* おすすめスポット */}
      {topSpots.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5 text-primary" />
            {monthDef.name}の{regionName}おすすめ釣り場
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topSpots.map(({ spot }) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </section>
      )}

      {/* 季節のコツ */}
      {seasonalTips.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Thermometer className="size-5 text-amber-600" />
            {monthDef.name}（{monthDef.season}）の釣りのコツ
          </h2>
          <Card className="gap-0 py-0 border-amber-200 bg-amber-50/50">
            <CardContent className="p-4 sm:p-5">
              <ul className="space-y-2">
                {seasonalTips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1 block size-1.5 shrink-0 rounded-full bg-amber-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 都道府県別リンク */}
      {regionPrefs.length > 1 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {regionName}の都道府県別釣り場
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {regionPrefs.map((p) => {
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

      {/* 他の地域 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-base font-bold sm:text-lg">
          {monthDef.name}の他の地域
        </h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {REGION_GROUP_SLUG_ENTRIES
            .filter(([slug]) => slug !== regionSlug)
            .map(([slug, name]) => (
              <Link key={slug} href={`/seasonal/${monthSlug}/${slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary">
                      {name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
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
            href="/catchable-now"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            今釣れる魚
          </Link>
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
