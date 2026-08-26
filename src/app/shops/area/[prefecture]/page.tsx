import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import {
  Store,
  MapPin,
  Phone,
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

// ----- クエリ直結の実データ件数（営業時間・エサ取扱） -----
// GSC実測: /shops/area/* は「釣具屋」「近くの釣具屋」で平均順位8なのに CTR 1.1% と
// 取りこぼしが大きい一方、「釣具屋 24時間」は CTR 4.5% と10倍ある。
// 時間帯条件がクエリ側の主要な絞り込み軸なので、実データの件数を title/description/H1直下に出す。
// businessHours は自由記述のため、「24時間営業」単独表記の店だけを24時間営業として数える。
// 「平日3:00〜23:00 / 金・土・祝前日 24時間営業」のような曜日限定営業は
// 常時24時間ではないので除外し（過大表示の回避）、開店時刻が5時以前なら早朝営業として数える。
function countShopUtility(shops: ReturnType<typeof getShopsForPrefecture>) {
  const is24 = (hours: string) => hours.trim() === "24時間営業";
  const isEarly = (hours: string) => {
    if (is24(hours)) return false;
    const m = hours.match(/(\d{1,2}):\d{2}/);
    return m ? Number(m[1]) <= 5 : false;
  };
  return {
    n24: shops.filter((s) => is24(s.businessHours)).length,
    nEarly: shops.filter((s) => isEarly(s.businessHours)).length,
    nLive: shops.filter((s) => s.hasLiveBait).length,
    nFrozen: shops.filter((s) => s.hasFrozenBait).length,
    nRental: shops.filter((s) => s.hasRentalRod).length,
  };
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
  const count = shops.length;
  const topShopNames = shops
    .slice(0, 2)
    .map((s) => s.name)
    .join("・");

  // layout.tsx の title.template が「| ツリスポ（つりすぽ）」を自動付与するため
  // 手書きのブランド名は付けない（付けると「| ツリスポ | ツリスポ（つりすぽ）」と
  // 二重表示になり SERP で本文が切れて CTR を大きく落とす。本番で実測確認済み）
  const { n24, nEarly, nLive, nFrozen, nRental } = countShopUtility(shops);
  // 「釣具屋 24時間」「近くの釣具屋 現在営業中」等の時間帯クエリに title 前方で答える
  const hoursHook =
    n24 > 0 ? `24時間営業${n24}件` : nEarly > 0 ? `早朝営業${nEarly}件` : null;
  const title =
    count > 0
      ? `${pref.name}の釣具屋・エサ店${count}件｜${hoursHook ? `${hoursHook}・` : ""}営業時間掲載`
      : `${pref.name}の釣具屋・エサ店一覧`;

  const utility = [
    n24 > 0 ? `24時間営業${n24}件` : null,
    nEarly > 0 ? `早朝営業${nEarly}件` : null,
    nLive > 0 ? `活きエサ取扱${nLive}件` : null,
    nFrozen > 0 ? `冷凍エサ取扱${nFrozen}件` : null,
    nRental > 0 ? `レンタルロッド${nRental}件` : null,
  ]
    .filter(Boolean)
    .join("・");
  const timingNote =
    n24 > 0
      ? "深夜・早朝のエサ調達に使える店も含みます。"
      : nEarly > 0
        ? "朝マズメ前に開く店も含みます。"
        : "";
  const description =
    count > 0
      ? `${pref.name}の釣具屋・釣りエサ屋${count}件の営業時間・住所・電話を一覧掲載。${utility ? `${utility}。` : ""}${timingNote}${topShopNames}などをエリア名つきで比較できます。`
      : `${pref.name}の釣具屋・釣具店は掲載準備中です。近隣県の釣具店一覧や${pref.name}の人気釣りスポット情報をご覧いただけます。`;

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

  // H1直下でも時間帯の実件数を示す（「釣具屋 24時間」「現在営業中」系クエリとの本文一致）
  const headerUtility = countShopUtility(baseShops);
  const headerHookParts = [
    headerUtility.n24 > 0 ? `24時間営業${headerUtility.n24}件` : null,
    headerUtility.nEarly > 0 ? `早朝営業${headerUtility.nEarly}件` : null,
  ].filter(Boolean);
  const headerHook = headerHookParts.length
    ? `（${headerHookParts.join("・")}）`
    : "";

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
            {pref.name}の釣具屋・エサ店
          </h1>
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          {count > 0
            ? `${count}件の釣具店・エサ店を掲載中${headerHook}`
            : "掲載準備中 ― 情報が入り次第追加します"}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* メインコンテンツ */}
        <div className="flex-1">
          {count > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {shops.map((shop) => {
                const planLevel = planMap[shop.slug] ?? "free";
                const isPro = planLevel === "pro";
                const isBasic = planLevel === "basic";
                const isPaid = isPro || isBasic;

                return (
                  <Link prefetch={false}
                    key={shop.id}
                    href={`/shops/${shop.slug}`}
                    className="group block"
                  >
                    <Card className="h-full transition-shadow hover:shadow-md group-hover:border-primary/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-snug transition-colors group-hover:text-primary">
                            {shop.name}
                          </CardTitle>
                          <ChevronRight className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {shop.region.prefecture} ·{" "}
                          {shop.region.areaName}エリア
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="size-4 shrink-0 text-muted-foreground" />
                          <span className="line-clamp-1">{shop.address}</span>
                        </div>
                        {shop.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="size-4 shrink-0 text-muted-foreground" />
                            <span>{shop.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="size-4 shrink-0 text-muted-foreground" />
                          <span className="line-clamp-1">
                            {shop.businessHours}
                          </span>
                        </div>

                        {/* サービスバッジ */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {shop.hasLiveBait && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-xs text-green-700 hover:bg-green-100"
                            >
                              活きエサ
                            </Badge>
                          )}
                          {shop.hasFrozenBait && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-xs text-blue-700 hover:bg-blue-100"
                            >
                              冷凍エサ
                            </Badge>
                          )}
                          {shop.hasRentalRod && (
                            <Badge
                              variant="secondary"
                              className="bg-indigo-100 text-xs text-indigo-700 hover:bg-indigo-100"
                            >
                              レンタルロッド
                            </Badge>
                          )}
                          {shop.hasParking && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-xs text-amber-700 hover:bg-amber-100"
                            >
                              駐車場あり
                            </Badge>
                          )}
                          {isPaid && (
                            <Badge
                              className={
                                isPro
                                  ? "bg-amber-100 text-xs text-amber-700 hover:bg-amber-100"
                                  : "bg-blue-100 text-xs text-blue-700 hover:bg-blue-100"
                              }
                            >
                              {isPro ? "公式（プロ）" : "公式"}
                            </Badge>
                          )}
                        </div>

                        <p className="line-clamp-2 pt-1 text-sm text-muted-foreground">
                          {shop.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
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
