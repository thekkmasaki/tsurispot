import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  Star,
  MapPin,
  Calendar,
  ChefHat,
  Lightbulb,
  ArrowLeft,
  Ruler,
  Tag,
  Play,
  TriangleAlert,
  Skull,
  ShieldAlert,
} from "lucide-react";
import { FishImage } from "@/components/ui/spot-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFishSpeciesWithSpots } from "@/lib/data";
import { DIFFICULTY_LABELS, CATCH_RATING_LABELS } from "@/types";
import { MonthCalendar } from "@/components/fish/month-calendar";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import { ProductList } from "@/components/affiliate/product-list";
import { getProductsByFish, getTopProducts } from "@/lib/data/products";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ShareButtons } from "@/components/ui/share-buttons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const allFish = getFishSpeciesWithSpots();

export async function generateStaticParams() {
  return allFish.map((fish) => ({
    slug: fish.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fish = allFish.find((f) => f.slug === slug);
  if (!fish) return { title: "魚種が見つかりません" };

  return {
    title: `${fish.name}（${fish.nameEnglish}）の釣り情報 - 旬の時期・釣り方・食べ方`,
    description: `${fish.name}（${fish.nameKana}）の旬の時期・釣り方・おすすめの食べ方を詳しく紹介。シーズンカレンダーや釣れるスポット一覧、初心者向けの釣り方ガイドも掲載。${fish.description}`,
    openGraph: {
      title: `${fish.name}（${fish.nameEnglish}）の釣り情報`,
      description: `${fish.name}の旬の時期・釣り方・おすすめの食べ方を紹介。${fish.description}`,
      type: "article",
      url: `https://tsurispot.com/fish/${fish.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/fish/${fish.slug}`,
    },
  };
}

export default async function FishDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const fish = allFish.find((f) => f.slug === slug);
  if (!fish) notFound();

  const isSea = fish.category === "sea";
  const currentMonth = new Date().getMonth() + 1;
  const isPeakNow = fish.peakMonths.includes(currentMonth);
  const isSeasonNow = fish.seasonMonths.includes(currentMonth);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${fish.name}（${fish.nameEnglish}）の釣り情報`,
    description: fish.description,
    author: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
    },
    about: {
      "@type": "Thing",
      name: fish.name,
      alternateName: [fish.nameKana, fish.nameEnglish, fish.scientificName],
    },
  };

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
        name: "魚種図鑑",
        item: "https://tsurispot.com/fish",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: fish.name,
        item: `https://tsurispot.com/fish/${fish.slug}`,
      },
    ],
  };

  // Similar difficulty fish for internal linking
  const similarFish = allFish
    .filter((f) => f.difficulty === fish.difficulty && f.slug !== fish.slug)
    .slice(0, 6);

  // Same category fish (sea/freshwater) for internal linking
  const sameCategoryFish = allFish
    .filter((f) => f.category === fish.category && f.slug !== fish.slug && !similarFish.find((sf) => sf.slug === f.slug))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "魚図鑑", href: "/fish" },
          { label: fish.name },
        ]}
      />
      <Link
        href="/fish"
        className="mb-5 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground transition-colors hover:text-primary min-h-[44px] sm:mb-6"
      >
        <ArrowLeft className="size-4" />
        魚種図鑑に戻る
      </Link>

      {/* ヘッダー */}
      <div
        className={`mb-6 flex flex-col items-center gap-3 overflow-hidden rounded-xl sm:mb-8 sm:gap-4 ${
          isSea
            ? "bg-gradient-to-br from-cyan-50 to-sky-100"
            : "bg-gradient-to-br from-emerald-50 to-green-100"
        }`}
      >
        <FishImage
          src={fish.imageUrl}
          alt={fish.name}
          category={fish.category}
          height="h-32 sm:h-40"
          className="w-full"
        />
        <div className="text-center pb-2">
          <h1 className="text-xl font-bold sm:text-3xl">{fish.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fish.nameKana} / {fish.scientificName}
          </p>
        </div>

        {/* 毒魚警告 */}
        {fish.isPoisonous && (
          <div className={`mx-4 mb-2 flex items-start gap-3 rounded-lg p-4 ${
            fish.dangerLevel === "high"
              ? "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200"
              : fish.dangerLevel === "medium"
                ? "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200"
                : "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
          }`}>
            <div className="shrink-0 mt-0.5">
              {fish.dangerLevel === "high" ? (
                <Skull className="size-6" />
              ) : (
                <ShieldAlert className="size-6" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm">
                {fish.dangerLevel === "high" ? "危険！" : "注意！"}
                {fish.poisonType || "この魚は毒を持っています"}
              </p>
              {fish.dangerNotes && fish.dangerNotes.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-xs">
                  {fish.dangerNotes.map((note, i) => (
                    <li key={i}>・{note}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* 今釣れるかどうかのステータス */}
        <div className="pb-4">
        {isPeakNow && (
          <Badge className="bg-orange-100 text-sm text-orange-700 hover:bg-orange-100">
            今が旬！（{currentMonth}月）
          </Badge>
        )}
        {!isPeakNow && isSeasonNow && (
          <Badge className="bg-sky-100 text-sm text-sky-700 hover:bg-sky-100">
            {currentMonth}月は釣れます
          </Badge>
        )}
        {!isSeasonNow && (
          <Badge variant="outline" className="text-sm">
            {currentMonth}月はオフシーズン
          </Badge>
        )}
        </div>
      </div>

      {/* SNSシェア */}
      <div className="mb-6 sm:mb-8">
        <ShareButtons
          url={`https://tsurispot.com/fish/${fish.slug}`}
          title={`${fish.name}の釣り方・タックル情報｜ツリスポ`}
        />
      </div>

      {/* 基本情報 */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <Tag className="size-5 text-primary" />
          基本情報
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">サイズ</p>
              <p className="mt-1 text-sm font-semibold">{fish.sizeCm}</p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">分類</p>
              <p className="mt-1 text-sm font-semibold">{fish.family}</p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="mb-1 text-xs text-muted-foreground">食味</p>
              <div className="flex items-center justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < fish.tasteRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">難易度</p>
              <p className="mt-1 text-sm font-semibold">
                {DIFFICULTY_LABELS[fish.difficulty]}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 釣れる時期カレンダー */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <Calendar className="size-5 text-primary" />
          釣れる時期
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-4 sm:p-6">
            <MonthCalendar
              seasonMonths={fish.seasonMonths}
              peakMonths={fish.peakMonths}
            />
          </CardContent>
        </Card>
      </section>

      {/* 釣れるスポット一覧 */}
      {fish.spots.length > 0 && (() => {
        const INITIAL_COUNT = 5;
        const visibleSpots = fish.spots.slice(0, INITIAL_COUNT);
        const hiddenSpots = fish.spots.slice(INITIAL_COUNT);

        const SpotItem = ({ spot }: { spot: typeof fish.spots[number] }) => (
          <Link href={`/spots/${spot.slug}`}>
            <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
              <CardContent className="flex items-center justify-between gap-2 p-3 sm:p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold group-hover:text-primary sm:text-base">
                    {spot.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {spot.region.prefecture} {spot.region.areaName}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <Badge
                    variant="outline"
                    className={`hidden text-xs sm:inline-flex ${
                      spot.catchRating === "excellent"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : spot.catchRating === "good"
                          ? "border-sky-200 bg-sky-50 text-sky-700"
                          : ""
                    }`}
                  >
                    {CATCH_RATING_LABELS[spot.catchRating]}{" "}
                    {spot.catchRating === "excellent"
                      ? "よく釣れる"
                      : spot.catchRating === "good"
                        ? "釣れる"
                        : "まずまず"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{spot.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );

        return (
          <section className="mb-6 sm:mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <MapPin className="size-5 text-primary" />
              釣れるスポット
              <span className="text-sm font-normal text-muted-foreground">({fish.spots.length}件)</span>
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {visibleSpots.map((spot) => (
                <SpotItem key={spot.id} spot={spot} />
              ))}
            </div>
            {hiddenSpots.length > 0 && (
              <details className="group/details mt-2 sm:mt-3">
                <summary className="flex cursor-pointer list-none items-center justify-center gap-1 rounded-lg border border-dashed border-muted-foreground/30 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                  <span className="group-open/details:hidden">他 {hiddenSpots.length} 件のスポットを表示</span>
                  <span className="hidden group-open/details:inline">閉じる</span>
                </summary>
                <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
                  {hiddenSpots.map((spot) => (
                    <SpotItem key={spot.id} spot={spot} />
                  ))}
                </div>
              </details>
            )}
          </section>
        );
      })()}

      {/* この魚の狙い方 */}
      {fish.fishingMethods && fish.fishingMethods.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Fish className="size-5 text-primary" />
            この魚の狙い方
          </h2>
          <div className="space-y-4 sm:space-y-6">
            {fish.fishingMethods.map((method, index) => {
              const difficultyBadge =
                method.difficulty === "beginner"
                  ? { label: "初心者向け", className: "bg-green-100 text-green-800" }
                  : method.difficulty === "intermediate"
                    ? { label: "中級者向け", className: "bg-yellow-100 text-yellow-800" }
                    : { label: "上級者向け", className: "bg-red-100 text-red-800" };

              return (
                <div
                  key={index}
                  className="rounded-xl border bg-white p-4 shadow-sm sm:p-6"
                >
                  {/* 釣法名 + 難易度バッジ */}
                  <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
                    <h3 className="text-base font-bold sm:text-lg">{method.methodName}</h3>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyBadge.className}`}
                    >
                      {difficultyBadge.label}
                    </span>
                  </div>

                  {/* ベストシーズン */}
                  <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground sm:mb-4">
                    <Calendar className="size-4 shrink-0" />
                    <span>ベストシーズン：{method.bestSeason}</span>
                  </div>

                  {/* 説明文 */}
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:mb-5">
                    {method.description}
                  </p>

                  {/* タックル表 */}
                  <div className="mb-4 rounded-lg bg-gray-50 p-3 sm:mb-5 sm:p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      タックル
                    </p>
                    <dl className="grid grid-cols-1 gap-y-1.5 text-sm sm:grid-cols-2 sm:gap-x-4">
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 font-semibold text-foreground">ロッド</dt>
                        <dd className="text-muted-foreground">{method.tackle.rod}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 font-semibold text-foreground">リール</dt>
                        <dd className="text-muted-foreground">{method.tackle.reel}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 font-semibold text-foreground">ライン</dt>
                        <dd className="text-muted-foreground">{method.tackle.line}</dd>
                      </div>
                      <div className="flex gap-2">
                        <dt className="w-20 shrink-0 font-semibold text-foreground">仕掛け・ルアー</dt>
                        <dd className="text-muted-foreground">{method.tackle.hookOrLure}</dd>
                      </div>
                      {method.tackle.otherItems.length > 0 && (
                        <div className="flex gap-2 sm:col-span-2">
                          <dt className="w-20 shrink-0 font-semibold text-foreground">その他</dt>
                          <dd className="text-muted-foreground">
                            {method.tackle.otherItems.join("、")}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Tips */}
                  {method.tips.length > 0 && (
                    <ul className="space-y-1.5">
                      {method.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2 text-sm">
                          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
                          <span className="text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* おすすめの食べ方 */}
      {fish.cookingTips.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <ChefHat className="size-5 text-primary" />
            おすすめの食べ方
          </h2>
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {fish.cookingTips.map((tip) => (
                  <Badge
                    key={tip}
                    variant="secondary"
                    className="px-3 py-1 text-sm"
                  >
                    {tip}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* 参考動画 */}
      {fish.youtubeLinks && fish.youtubeLinks.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Play className="size-5 text-primary" />
            釣り方の参考動画
          </h2>
          <YouTubeVideoList links={fish.youtubeLinks} />
        </section>
      )}

      {/* 豆知識 */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Lightbulb className="size-5 text-primary" />
          豆知識
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {fish.description}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* この魚を釣るための道具 */}
      {(() => {
        const fishProducts = getProductsByFish(slug);
        const displayProducts = fishProducts.length > 0 ? fishProducts : getTopProducts(3);
        return (
          <section className="mb-6 sm:mb-8">
            <ProductList
              products={displayProducts}
              title={`${fish.name}を釣るための道具`}
              description={
                fishProducts.length > 0
                  ? `${fish.name}釣りにおすすめのアイテムを厳選しました。`
                  : "まずは基本の道具を揃えて釣りを始めましょう。"
              }
              maxItems={3}
            />
          </section>
        );
      })()}

      {/* 同じ難易度の魚種（内部リンク強化） */}
      {similarFish.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Fish className="size-5 text-primary" />
            同じ難易度の魚種
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {similarFish.map((sf) => (
              <Link key={sf.id} href={`/fish/${sf.slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-4 text-center">
                    <Fish
                      className={`mx-auto mb-2 size-8 ${
                        sf.category === "sea" ? "text-sky-300" : "text-green-300"
                      }`}
                    />
                    <h3 className="text-sm font-semibold group-hover:text-primary">
                      {sf.name}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {DIFFICULTY_LABELS[sf.difficulty]}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 同じ種類（海水魚/淡水魚）の魚種（内部リンク強化） */}
      {sameCategoryFish.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Fish className="size-5 text-primary" />
            {fish.category === "sea" ? "他の海水魚の釣り情報" : "他の淡水魚の釣り情報"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {sameCategoryFish.map((sf) => (
              <Link key={sf.id} href={`/fish/${sf.slug}`} title={`${sf.name}の釣り情報・釣り方・旬の時期`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  {sf.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
