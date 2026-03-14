import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
export async function generateStaticParams() {
  return prefectures.map((pref) => ({ prefecture: pref.slug }));
}

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

  const title = `${pref.name}の釣具店・エサ店一覧｜${count}件掲載 | ツリスポ`;
  const description = `${pref.name}で人気の釣具店・エサ店${count}件を掲載。活きエサ・冷凍エサの取扱店やレンタルロッド対応店を検索。営業時間・アクセス・エサ在庫情報も。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/shops/area/${prefecture}`,
      siteName: "ツリスポ",
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
  if (!pref) notFound();

  const shops = getShopsForPrefecture(pref.name);
  const count = shops.length;

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
            {pref.name}の釣具店・エサ店
          </h1>
        </div>
        <p className="mt-2 text-base text-muted-foreground">
          {count > 0
            ? `${count}件の釣具店・エサ店を掲載中`
            : "掲載準備中 ― 情報が入り次第追加します"}
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* メインコンテンツ */}
        <div className="flex-1">
          {count > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
              {shops.map((shop) => {
                const planLevel = shop.planLevel ?? "free";
                const isPro = planLevel === "pro";
                const isBasic = planLevel === "basic";
                const isPaid = isPro || isBasic;

                return (
                  <Link
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
                <Link
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
                      <Link
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
                <Link
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
              <Link
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
                        <Link
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
                      <Link
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
