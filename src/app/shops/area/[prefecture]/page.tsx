import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import {
  Store,
  MapPin,
  Clock,
  ChevronRight,
  Fish,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { tackleShops } from "@/lib/data/shops";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { adjacentPrefectures } from "@/lib/data/prefecture-info";
import { fishingSpots } from "@/lib/data/spots";
import { getEffectivePlanMap } from "@/lib/shop-plan";
import { getShopHoursTraits, shopHoursLabels } from "@/lib/shop-hours";
import { AreaShopList, type AreaShopItem } from "@/components/shops/area-shop-list";
import {
  buildShopAreaDescription,
  buildShopAreaLead,
  buildShopAreaTitle,
} from "@/lib/seo/shop-meta";

type Params = Promise<{ prefecture: string }>;

// ----- 都道府県ごとの店舗をフィルタ -----
function getShopsForPrefecture(prefName: string) {
  return tackleShops
    .filter(
      (s) =>
        s.region.prefecture === prefName &&
        s.slug !== "sample-premium" &&
        s.slug !== "sample-basic"
    )
    .sort((a, b) => {
      // planLevel順: pro → basic → free → undefined
      const planOrder = { pro: 0, basic: 1, free: 2 };
      const aPlan = planOrder[a.planLevel ?? "free"] ?? 2;
      const bPlan = planOrder[b.planLevel ?? "free"] ?? 2;
      if (aPlan !== bPlan) return aPlan - bPlan;
      // isPremium順
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      return 0;
    });
}

// ----- generateStaticParams -----
// dynamicParams=false は Next.js 16 で NoFallbackError を多発させるため撤廃。未知 param は下記で親へ 301。

export async function generateStaticParams() {
  return prefectures.map((pref) => ({ prefecture: pref.slug }));
}

// 課金状態(DynamoDB)を一覧の優先表示に反映するため 1時間 ISR。
// 詳細ページは純SSGのまま維持し、この一覧だけ実効プランで並べ替える（SEO本文・metadataは不変）。
export const revalidate = 3600;

// ----- generateMetadata -----
export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  if (!pref) return { title: "ページが見つかりません" };

  const shops = getShopsForPrefecture(pref.name);

  // layout.tsx の title.template が「| ツリスポ（つりすぽ）」を自動付与するため
  // 手書きのブランド名は付けない（付けると「| ツリスポ | ツリスポ（つりすぽ）」と
  // 二重表示になり SERP で本文が切れて CTR を大きく落とす。本番で実測確認済み）
  //
  // GSC 実測（2026-09-21〜10-18）: /shops/area/* の表示の 87% は「釣具屋」「近くの釣具屋」
  // 「◯◯ 釣具屋」の汎用・地名クエリ（CTR 0.3〜0.6%）で、旧 title が前方で答えていた
  // 時間帯系（24時間/営業中）は 7%。県名・件数・市区町村名で汎用意図に先に答え、
  // 時間帯・エサの実件数は description と H1 直下に残す（文言生成は shop-meta.ts に集約）。
  const title = buildShopAreaTitle({ prefName: pref.name, shops });
  const description = buildShopAreaDescription({ prefName: pref.name, shops });

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/shops/area/${prefecture}`,
      siteName: "ツリスポ",
      images: [
        {
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(title)}&emoji=%F0%9F%93%8D`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: `https://tsurispot.com/shops/area/${prefecture}`,
    },
  };
}

// ----- ページコンポーネント -----
export default async function PrefectureShopsPage({
  params,
}: {
  params: Params;
}) {
  const { prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  if (!pref) permanentRedirect("/shops");

  const baseShops = getShopsForPrefecture(pref.name);
  const count = baseShops.length;

  // 課金状態を加味した実効プランで優先表示を並べ替え（ISR: revalidate=3600）
  const planMap = await getEffectivePlanMap(baseShops.map((s) => s.slug));
  const planRank: Record<string, number> = { pro: 0, basic: 1, free: 2 };
  const shops = [...baseShops].sort((a, b) => {
    const ra = planRank[planMap[a.slug] ?? "free"] ?? 2;
    const rb = planRank[planMap[b.slug] ?? "free"] ?? 2;
    if (ra !== rb) return ra - rb;
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return 0;
  });

  // 一覧カード（クライアントで現在地ソート・時間帯/エサ絞り込み）。SSR 初期表示はこの並び順のまま
  const items: AreaShopItem[] = shops.map((s) => {
    const t = getShopHoursTraits(s.businessHours);
    return {
      id: s.id,
      slug: s.slug,
      name: s.name,
      areaName: s.region.areaName,
      prefecture: s.region.prefecture,
      address: s.address,
      phone: s.phone,
      businessHours: s.businessHours,
      description: s.description,
      latitude: s.latitude,
      longitude: s.longitude,
      hasLiveBait: s.hasLiveBait,
      hasFrozenBait: s.hasFrozenBait,
      hasRentalRod: s.hasRentalRod,
      hasParking: !!s.hasParking,
      is24h: t.is24h,
      early: t.early,
      lateNight: t.lateNight,
      hoursLabels: shopHoursLabels(s.businessHours),
      planLevel: planMap[s.slug] ?? "free",
    };
  });

  // 24時間・早朝営業の店（GSC: 時間帯系クエリは CTR 2.7% で釣具系最高）。24時間 → 開店が早い順
  const offHourShops = items
    .filter((s) => s.is24h || s.early)
    .map((s) => ({ s, open: getShopHoursTraits(s.businessHours).earliestOpenMinutes ?? 9999 }))
    .sort((a, b) => a.open - b.open)
    .map((x) => x.s);
  const n24 = offHourShops.filter((s) => s.is24h).length;
  const nEarly = offHourShops.length - n24;

  // H1直下でも title/description と同じ実数（件数・市区町村・時間帯）を示し本文一致させる
  const lead = buildShopAreaLead({ prefName: pref.name, shops: baseShops });

  // この都道府県の人気スポット（上位6件）
  const prefSpots = fishingSpots
    .filter((s) => s.region.prefecture === pref.name)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  // 近隣県
  const adjacentSlugs = adjacentPrefectures[prefecture] ?? [];
  const adjacentPrefs = adjacentSlugs
    .map((slug) => getPrefectureBySlug(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof getPrefectureBySlug>>[];

  // 同じ地方の県（近隣県以外も含む）
  const sameRegionPrefs = prefectures.filter(
    (p) => p.regionGroup === pref.regionGroup && p.slug !== pref.slug
  );

  // 今月のスラッグ
  const monthSlugs = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const currentMonthSlug = monthSlugs[new Date().getMonth()];
  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];
  const currentMonthName = monthNames[new Date().getMonth()];

  // ----- JSON-LD -----
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
        name: "釣具店・エサ店ガイド",
        item: "https://tsurispot.com/shops",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${pref.name}の釣具店`,
        item: `https://tsurispot.com/shops/area/${prefecture}`,
      },
    ],
  };

  const itemListJsonLd =
    count > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${pref.name}の釣具店・エサ店一覧`,
          numberOfItems: count,
          itemListElement: shops.slice(0, 30).map((shop, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: shop.name,
            url: `https://tsurispot.com/shops/${shop.slug}`,
          })),
        }
      : null;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {itemListJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      )}

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣具店・エサ店ガイド", href: "/shops" },
          { label: `${pref.name}の釣具店` },
        ]}
      />

      {/* ヘッダー */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <Store className="size-8 text-primary" />
          <h1 className="text-2xl font-bold sm:text-3xl">
            {pref.name}の釣具屋・釣具店一覧
          </h1>
        </div>
        <p className="mt-2 text-base text-muted-foreground">{lead}</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* メインコンテンツ */}
        <div className="flex-1">
          {count > 0 ? (
            <>
              {offHourShops.length > 0 && (
                <section className="mb-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
                  <h2 className="mb-1 flex items-center gap-2 text-base font-bold sm:text-lg">
                    <Clock className="size-5 text-violet-600" />
                    {pref.name}の{n24 > 0 ? "24時間営業・" : ""}早朝から開いている釣具屋
                  </h2>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {[n24 > 0 ? `24時間営業${n24}件` : null, nEarly > 0 ? `早朝（5時台まで）に開店${nEarly}件` : null]
                      .filter(Boolean)
                      .join("・")}
                    。夜釣り・朝マズメ前のエサ調達に。営業時間は季節で変わるため来店前にご確認ください。
                  </p>
                  <ul className="divide-y rounded-lg border bg-background">
                    {offHourShops.slice(0, 12).map((s) => (
                      <li key={s.id}>
                        <Link prefetch={false}
                          href={`/shops/${s.slug}`}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium">{s.name}</span>
                            <span className="block text-xs text-muted-foreground line-clamp-1">
                              {s.areaName}・{s.businessHours}
                            </span>
                          </span>
                          {s.is24h && (
                            <Badge variant="secondary" className="shrink-0 bg-violet-100 text-xs text-violet-700 hover:bg-violet-100">
                              24時間
                            </Badge>
                          )}
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {offHourShops.length > 12 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      ほか{offHourShops.length - 12}件は下の一覧で「早朝営業」「24時間営業」で絞り込めます。
                    </p>
                  )}
                </section>
              )}
              <h2 className="mb-3 text-lg font-bold">{pref.name}の釣具屋 全{count}件</h2>
              <AreaShopList shops={items} prefName={pref.name} />
            </>
          ) : (
            <div className="rounded-xl border bg-muted/30 py-16 text-center">
              <Store className="mx-auto mb-4 size-12 text-muted-foreground/40" />
              <p className="text-lg font-medium text-muted-foreground">
                {pref.name}の釣具店は掲載準備中です
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                情報が入り次第追加します。
                <Link prefetch={false}
                  href="/shops"
                  className="ml-1 text-primary hover:underline"
                >
                  全国の釣具店一覧を見る
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* サイドバー */}
        <aside className="w-full shrink-0 space-y-6 lg:w-72 xl:w-80">
          {/* この都道府県の人気スポット */}
          {prefSpots.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Fish className="size-5 text-primary" />
                  {pref.nameShort}の人気釣りスポット
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prefSpots.map((spot) => (
                    <li key={spot.slug}>
                      <Link prefetch={false}
                        href={`/spots/${spot.slug}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                      >
                        <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="line-clamp-1">{spot.name}</span>
                        <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link prefetch={false}
                  href={`/prefecture/${prefecture}`}
                  className="mt-3 flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {pref.nameShort}の釣り場をもっと見る
                  <ChevronRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          )}

          {/* 今月の釣りガイド */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-5 text-primary" />
                {currentMonthName}の釣りガイド
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link prefetch={false}
                href={`/monthly/${currentMonthSlug}`}
                className="flex items-center justify-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {currentMonthName}に釣れる魚・おすすめスポット
                <ChevronRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* 近隣県の釣具店 */}
          {adjacentPrefs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="size-5 text-primary" />
                  近隣県の釣具店
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {adjacentPrefs.map((ap) => {
                    const apCount = tackleShops.filter(
                      (s) =>
                        s.region.prefecture === ap.name &&
                        s.slug !== "sample-premium" &&
                        s.slug !== "sample-basic"
                    ).length;
                    return (
                      <li key={ap.slug}>
                        <Link prefetch={false}
                          href={`/shops/area/${ap.slug}`}
                          className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                        >
                          <span>{ap.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {apCount}件
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* 同じ地方の都道府県 */}
          {sameRegionPrefs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {pref.regionGroup}の釣具店
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {sameRegionPrefs.map((sp) => {
                    const spCount = tackleShops.filter(
                      (s) =>
                        s.region.prefecture === sp.name &&
                        s.slug !== "sample-premium" &&
                        s.slug !== "sample-basic"
                    ).length;
                    return (
                      <Link prefetch={false}
                        key={sp.slug}
                        href={`/shops/area/${sp.slug}`}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                      >
                        {sp.nameShort}
                        <span className="ml-1 opacity-60">{spCount}</span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
