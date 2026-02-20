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
      url: `https://tsurispot.jp/fish/${fish.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.jp/fish/${fish.slug}`,
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
      url: "https://tsurispot.jp",
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
        item: "https://tsurispot.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "魚種図鑑",
        item: "https://tsurispot.jp/fish",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: fish.name,
        item: `https://tsurispot.jp/fish/${fish.slug}`,
      },
    ],
  };

  // Similar difficulty fish for internal linking
  const similarFish = allFish
    .filter((f) => f.difficulty === fish.difficulty && f.slug !== fish.slug)
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
      {fish.spots.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <MapPin className="size-5 text-primary" />
            釣れるスポット
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {fish.spots.map((spot) => (
              <Link key={spot.id} href={`/spots/${spot.slug}`}>
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
            ))}
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
    </div>
  );
}
