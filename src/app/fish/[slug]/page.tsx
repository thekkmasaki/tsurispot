import { Metadata } from "next";
import Image from "next/image";
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
  Camera,
  Users,
  BookOpen,
  Clock,
  Trophy,
} from "lucide-react";
import { FishImage } from "@/components/ui/spot-image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFishSpeciesWithSpots, getCoOccurringFish, getFishBySameMethod, getFishBySameSeason } from "@/lib/data";
import { DIFFICULTY_LABELS, CATCH_RATING_LABELS } from "@/types";
import { MonthCalendar } from "@/components/fish/month-calendar";
import { NearbySpotsSorter } from "@/components/fish/nearby-spots-sorter";
import { YouTubeVideoList } from "@/components/youtube-video-card";
import { ProductList } from "@/components/affiliate/product-list";
import { getProductsByFish, getTopProducts } from "@/lib/data/products";
import { getHookSizeData } from "@/lib/data/hook-sizes";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ShareButtons } from "@/components/ui/share-buttons";
import { InArticleAd } from "@/components/ads/ad-unit";
import { seasonalGuides } from "@/lib/data/seasonal-guides";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const allFish = getFishSpeciesWithSpots();

// 釣法名 → /methods/[slug] のマッピング（methods/[slug]ページに存在するもののみ）
const METHOD_NAME_TO_SLUG: Record<string, string> = {
  "サビキ釣り": "sabiki",
  "アジング": "ajing",
  "エギング": "eging",
  "メバリング": "mebaring",
  "ショアジギング": "shore-jigging",
  "ちょい投げ": "choi-nage",
  "ちょい投げ釣り": "choi-nage",
  "ウキ釣り": "uki-zuri",
  "穴釣り": "ana-zuri",
};

export async function generateStaticParams() {
  return allFish.map((fish) => ({
    slug: fish.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fish = allFish.find((f) => f.slug === slug);
  if (!fish) return { title: "魚種が見つかりません" };

  const methodNames = fish.fishingMethods?.map(m => m.methodName).slice(0, 2).join("・") || "";
  const peakMonthsStr = fish.peakMonths.length > 0
    ? `${fish.peakMonths[0]}月〜${fish.peakMonths[fish.peakMonths.length - 1]}月`
    : "";

  return {
    title: `${fish.name}の釣り方・釣れる時期・おすすめスポット${fish.aliases?.length ? `【${fish.aliases[0]}】` : ""}`,
    description: `${fish.name}の釣り方を初心者にもわかりやすく解説。${peakMonthsStr ? `${fish.name}が釣れる時期は${peakMonthsStr}。` : ""}${methodNames ? `${methodNames}などの釣り方・仕掛け・タックル情報を詳しく紹介。` : ""}釣れるスポット一覧やシーズンカレンダーも掲載。${fish.description.slice(0, 60)}`,
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
      alternateName: [fish.nameKana, fish.nameEnglish, fish.scientificName, ...(fish.aliases || [])],
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

  // FAQ JSON-LD for fish page
  const fishFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${fish.name}はいつ釣れますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: fish.peakMonths.length > 0
            ? `${fish.name}のベストシーズンは${fish.peakMonths.map(m => `${m}月`).join("・")}です。${fish.seasonMonths.length > 0 ? `シーズン全体では${fish.seasonMonths[0]}月〜${fish.seasonMonths[fish.seasonMonths.length - 1]}月に釣ることができます。` : ""}`
            : `${fish.name}は${fish.seasonMonths.map(m => `${m}月`).join("・")}に釣ることができます。`,
        },
      },
      ...(fish.fishingMethods && fish.fishingMethods.length > 0
        ? [{
            "@type": "Question" as const,
            name: `${fish.name}の釣り方は？`,
            acceptedAnswer: {
              "@type": "Answer" as const,
              text: `${fish.name}は${fish.fishingMethods.map(m => m.methodName).join("、")}で釣ることができます。${fish.fishingMethods[0] ? `${fish.fishingMethods[0].methodName}では${fish.fishingMethods[0].tackle.rod}と${fish.fishingMethods[0].tackle.reel}を使用します。` : ""}`,
            },
          }]
        : []),
      ...(fish.spots.length > 0
        ? [{
            "@type": "Question" as const,
            name: `${fish.name}はどこで釣れますか？`,
            acceptedAnswer: {
              "@type": "Answer" as const,
              text: `${fish.name}は${fish.spots.slice(0, 3).map(s => s.name).join("、")}${fish.spots.length > 3 ? `など全国${fish.spots.length}箇所` : ""}で釣ることができます。`,
            },
          }]
        : []),
      {
        "@type": "Question",
        name: `${fish.name}は初心者でも釣れますか？`,
        acceptedAnswer: {
          "@type": "Answer",
          text: fish.difficulty === "beginner"
            ? `はい、${fish.name}は初心者でも比較的簡単に釣れる魚です。${fish.fishingMethods?.[0] ? `${fish.fishingMethods[0].methodName}がおすすめの釣り方です。` : ""}`
            : fish.difficulty === "intermediate"
              ? `${fish.name}は中級者向けの魚ですが、適切な仕掛けと時期を選べば初心者でもチャレンジできます。`
              : `${fish.name}は上級者向けの魚です。ある程度の経験を積んでから挑戦することをおすすめします。`,
        },
      },
      ...(fish.cookingTips.length > 0
        ? [{
            "@type": "Question" as const,
            name: `${fish.name}の食べ方・おすすめ料理は？`,
            acceptedAnswer: {
              "@type": "Answer" as const,
              text: `${fish.name}のおすすめの食べ方は${fish.cookingTips.join("、")}です。${fish.tasteRating >= 4 ? "味の評価が高く、食べて美味しい魚です。" : fish.tasteRating >= 3 ? "美味しく食べられる魚です。" : ""}`,
            },
          }]
        : []),
    ],
  };

  // HowTo JSON-LD for fishing method guide
  const howToJsonLd = fish.fishingMethods && fish.fishingMethods.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${fish.name}の釣り方`,
    description: `${fish.name}の基本的な釣り方を初心者にもわかりやすく解説します。${fish.fishingMethods[0].methodName}を中心に、必要な道具や仕掛け、コツを紹介。`,
    totalTime: "PT3H",
    supply: fish.fishingMethods[0] ? [
      { "@type": "HowToSupply", name: fish.fishingMethods[0].tackle.rod },
      { "@type": "HowToSupply", name: fish.fishingMethods[0].tackle.reel },
      { "@type": "HowToSupply", name: fish.fishingMethods[0].tackle.line },
      { "@type": "HowToSupply", name: fish.fishingMethods[0].tackle.hookOrLure },
    ] : [],
    step: [
      {
        "@type": "HowToStep",
        name: "釣り場を選ぶ",
        text: `${fish.name}は${fish.category === "sea" ? "堤防・漁港・磯などの海釣りスポット" : fish.category === "freshwater" ? "河川・湖・管理釣り場などの淡水スポット" : "河口や汽水域のスポット"}で狙えます。${fish.spots.length > 0 ? `${fish.spots[0].name}などが人気のポイントです。` : ""}`,
      },
      {
        "@type": "HowToStep",
        name: "タックル・仕掛けを準備する",
        text: fish.fishingMethods[0] ? `${fish.fishingMethods[0].methodName}の場合、ロッドは${fish.fishingMethods[0].tackle.rod}、リールは${fish.fishingMethods[0].tackle.reel}、ラインは${fish.fishingMethods[0].tackle.line}を使用します。仕掛けは${fish.fishingMethods[0].tackle.hookOrLure}がおすすめです。` : `${fish.name}に適したタックルを用意しましょう。`,
      },
      {
        "@type": "HowToStep",
        name: "ポイントに仕掛けを投入する",
        text: fish.fishingMethods[0] ? `${fish.fishingMethods[0].description.slice(0, 80)}` : `${fish.name}がいそうなポイントに仕掛けを投入します。`,
      },
      {
        "@type": "HowToStep",
        name: "アタリを待って合わせる",
        text: fish.fishingMethods[0]?.tips[0] || `${fish.name}のアタリは竿先やラインの変化で判断します。アタリがあったら適切なタイミングで合わせましょう。`,
      },
      {
        "@type": "HowToStep",
        name: "釣り上げて取り込む",
        text: `${fish.name}が掛かったら、無理に引っ張らず竿のしなりを活かしてやり取りしましょう。${fish.sizeCm}程度のサイズが一般的です。`,
      },
    ],
  } : null;

  // Co-occurring fish (よく一緒に釣れる魚)
  const coOccurringFish = getCoOccurringFish(fish.slug, 8);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fishFaqJsonLd) }}
      />
      {howToJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
        />
      )}
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
          priority
        />
        <div className="text-center pb-2">
          <h1 className="text-xl font-bold sm:text-3xl">{fish.name}</h1>
          {fish.aliases && fish.aliases.length > 0 && (
            <p className="mt-0.5 text-sm font-medium text-muted-foreground">
              別名: {fish.aliases.slice(0, 3).join("・")}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
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

      {/* 実釣写真ギャラリー */}
      {fish.userPhotos && fish.userPhotos.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Camera className="size-5 text-primary" />
            実釣写真
          </h2>
          <div className={`grid gap-2 sm:gap-3 ${fish.userPhotos.length === 1 ? "grid-cols-1" : fish.userPhotos.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            {fish.userPhotos.map((photo, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg border bg-gray-100">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-1.5 pt-6">
                  <p className="text-xs text-white/90">{photo.credit}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
          {fish.name}が釣れる時期・シーズンカレンダー
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

      {/* 広告 */}
      <InArticleAd className="mt-4" />

      {/* 釣れるスポット一覧（現在地ソート対応） */}
      {fish.spots.length > 0 && (
        <NearbySpotsSorter spots={fish.spots} fishName={fish.name} />
      )}

      {/* この魚の狙い方 */}
      {fish.fishingMethods && fish.fishingMethods.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Fish className="size-5 text-primary" />
            {fish.name}の釣り方・仕掛け
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {fish.name}は{fish.fishingMethods.map(m => m.methodName).join("、")}などの方法で狙えます。
            {fish.difficulty === "beginner" ? "初心者でも比較的簡単に釣れる魚です。" :
             fish.difficulty === "intermediate" ? "基本的な釣りの知識があれば狙える魚です。" :
             "経験を積んだ釣り人向けのターゲットです。"}
          </p>
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
                    <h3 className="text-base font-bold sm:text-lg">
                      {METHOD_NAME_TO_SLUG[method.methodName] ? (
                        <Link
                          href={`/methods/${METHOD_NAME_TO_SLUG[method.methodName]}`}
                          className="hover:text-primary hover:underline"
                        >
                          {method.methodName}
                        </Link>
                      ) : (
                        method.methodName
                      )}
                    </h3>
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

                  {/* 月別おすすめ針サイズ */}
                  {(() => {
                    const hookData = getHookSizeData(fish.slug, index);
                    if (!hookData) return null;
                    const MONTH_LABELS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
                    return (
                      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 p-3 sm:mb-5 sm:p-4">
                        <p className="text-xs font-bold text-amber-900 mb-2">
                          <span className="mr-1">&#x1F4CC;</span>月別おすすめ針サイズ（参考）
                        </p>
                        <p className="text-xs text-amber-700 mb-2">{hookData.hookType}</p>
                        {/* 上段: 1月〜6月 */}
                        <div className="grid grid-cols-6 gap-1 mb-1">
                          {hookData.months.slice(0, 6).map((m, mi) => {
                            const monthNum = mi + 1;
                            const isCurrentMonth = monthNum === currentMonth;
                            const isOff = m.size === "-";
                            return (
                              <div
                                key={mi}
                                className={`text-center rounded-md p-1.5 border ${
                                  isCurrentMonth
                                    ? "ring-2 ring-amber-400 bg-amber-100 border-amber-300"
                                    : "bg-white border-amber-100"
                                }`}
                                title={m.note || undefined}
                              >
                                <div className="text-[10px] text-muted-foreground">{MONTH_LABELS[mi]}</div>
                                <div className={`text-xs font-bold ${
                                  isOff ? "text-muted-foreground/50" : "text-amber-800"
                                }`}>
                                  {m.size}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* 下段: 7月〜12月 */}
                        <div className="grid grid-cols-6 gap-1">
                          {hookData.months.slice(6, 12).map((m, mi) => {
                            const monthNum = mi + 7;
                            const isCurrentMonth = monthNum === currentMonth;
                            const isOff = m.size === "-";
                            return (
                              <div
                                key={mi}
                                className={`text-center rounded-md p-1.5 border ${
                                  isCurrentMonth
                                    ? "ring-2 ring-amber-400 bg-amber-100 border-amber-300"
                                    : "bg-white border-amber-100"
                                }`}
                                title={m.note || undefined}
                              >
                                <div className="text-[10px] text-muted-foreground">{MONTH_LABELS[mi + 6]}</div>
                                <div className={`text-xs font-bold ${
                                  isOff ? "text-muted-foreground/50" : "text-amber-800"
                                }`}>
                                  {m.size}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Tip */}
                        <p className="text-xs text-amber-700 mt-2">
                          <span className="mr-1">&#x1F4A1;</span>{hookData.tip}
                        </p>
                        {/* 注意書き */}
                        <p className="text-[10px] text-muted-foreground mt-1.5 italic">
                          ※ 地域や年によって異なります。あくまで参考情報としてご活用ください
                        </p>
                      </div>
                    );
                  })()}

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

      {/* 釣り方完全ガイド */}
      <section className="mb-6 sm:mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
          <BookOpen className="size-5 text-primary" />
          {fish.name}の釣り方完全ガイド
        </h2>

        {/* 基本情報テーブル */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
          <Card className="gap-0 py-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="size-4 text-amber-500 shrink-0" />
                <p className="text-xs text-muted-foreground">難易度</p>
              </div>
              <p className="text-sm font-semibold">{DIFFICULTY_LABELS[fish.difficulty]}</p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="size-4 text-sky-500 shrink-0" />
                <p className="text-xs text-muted-foreground">ベストシーズン</p>
              </div>
              <p className="text-sm font-semibold">
                {fish.peakMonths.length > 0
                  ? `${fish.peakMonths.map(m => `${m}月`).join("・")}`
                  : `${fish.seasonMonths.map(m => `${m}月`).join("・")}`}
              </p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="size-4 text-orange-500 shrink-0" />
                <p className="text-xs text-muted-foreground">おすすめの時間帯</p>
              </div>
              <p className="text-sm font-semibold">
                {fish.category === "freshwater" ? "早朝・夕方" : "朝マズメ・夕マズメ"}
              </p>
            </CardContent>
          </Card>
          <Card className="gap-0 py-0">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="size-4 text-green-500 shrink-0" />
                <p className="text-xs text-muted-foreground">よく釣れる場所</p>
              </div>
              <p className="text-sm font-semibold">
                {fish.category === "sea"
                  ? "堤防・漁港・磯"
                  : fish.category === "freshwater"
                    ? "河川・湖・管理釣り場"
                    : "河口・汽水域"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 釣り方別の詳細解説 */}
        {fish.fishingMethods && fish.fishingMethods.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-bold sm:text-base">
              {fish.name}を釣る方法一覧
            </h3>
            <div className="space-y-3">
              {fish.fishingMethods.map((method, idx) => {
                const compatDesc = method.difficulty === "beginner"
                  ? "初心者にもおすすめ"
                  : method.difficulty === "intermediate"
                    ? "ある程度の経験があると楽しめる"
                    : "腕に自信がある方向け";
                return (
                  <div key={idx} className="rounded-lg border bg-gray-50 p-3 sm:p-4">
                    <h4 className="text-sm font-bold sm:text-base mb-1">
                      {fish.name}の{method.methodName}
                    </h4>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {method.methodName}は{fish.name}を狙う{compatDesc}な釣り方です。
                      {method.description}{" "}
                      ベストシーズンは{method.bestSeason}で、
                      必要な仕掛けは{method.tackle.hookOrLure}です。
                    </p>
                    {method.tips.length > 0 && (
                      <p className="mt-1 text-xs text-primary/80">
                        ポイント: {method.tips[0]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* おすすめスポットTOP3 */}
        {fish.spots.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-bold sm:text-base">
              {fish.name}が釣れるおすすめスポットTOP3
            </h3>
            <div className="space-y-2">
              {fish.spots.slice(0, 3).map((spot, idx) => (
                <Link
                  key={spot.id}
                  href={`/spots/${spot.slug}`}
                  className="flex items-center gap-3 rounded-lg border bg-white p-3 transition-colors hover:bg-gray-50"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{spot.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {spot.region.prefecture} {spot.region.areaName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium">{spot.rating.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
            {fish.spots.length > 3 && (
              <p className="mt-2 text-xs text-muted-foreground text-center">
                他{fish.spots.length - 3}件のスポットでも{fish.name}が釣れます
              </p>
            )}
          </div>
        )}

        {/* 料理・食べ方ミニセクション */}
        {fish.cookingTips.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold sm:text-base">
              {fish.name}の美味しい食べ方
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {fish.name}は{fish.cookingTips.slice(0, 4).join("、")}などで美味しく食べられます。
              {fish.tasteRating >= 4
                ? `食味評価は星${fish.tasteRating}つと高く、釣って良し食べて良しの人気ターゲットです。`
                : fish.tasteRating >= 3
                  ? "味も良く、釣りの後の食卓を彩ってくれます。"
                  : "新鮮なうちに調理するのがおすすめです。"}
              {fish.peakMonths.length > 0
                ? `特に${fish.peakMonths.map(m => `${m}月`).join("・")}に釣れた${fish.name}は脂が乗って格別です。`
                : ""}
            </p>
          </div>
        )}
      </section>

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

      {/* よく一緒に釣れる魚（共起魚種） */}
      {coOccurringFish.length > 0 && (
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
            <Users className="size-5 text-primary" />
            {fish.name}と一緒に釣れる魚
          </h2>
          <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
            同じ釣り場で{fish.name}と一緒に狙える魚種です。
          </p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {coOccurringFish.map((cf) => (
              <Link
                key={cf.slug}
                href={`/fish/${cf.slug}`}
                title={`${cf.name}の釣り情報・釣り方を見る`}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {cf.name}
                  <span className="ml-1 text-muted-foreground">
                    ({cf.count}スポット共通)
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

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

      {/* 同じ釣り方で釣れる魚 */}
      {(() => {
        const sameMethodFish = getFishBySameMethod(slug, 6);
        if (sameMethodFish.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <Fish className="size-5 text-primary" />
              同じ釣り方で釣れる魚
            </h2>
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              {fish.name}と同じ釣り方で狙える他の魚種です。
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {sameMethodFish.map((sf) => (
                <Link key={sf.slug} href={`/fish/${sf.slug}`} title={`${sf.name}の釣り方`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                  >
                    {sf.name}
                    <span className="ml-1 text-muted-foreground">
                      ({sf.methods.join("・")})
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* 同じ時期に旬を迎える魚 */}
      {(() => {
        const sameSeasonFish = getFishBySameSeason(slug, 6);
        if (sameSeasonFish.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <Calendar className="size-5 text-primary" />
              同じ時期に旬を迎える魚
            </h2>
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              {fish.name}と同じ時期がベストシーズンの魚種です。一度の釣行で複数の魚種を狙えます。
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {sameSeasonFish.map((sf) => (
                <Link key={sf.slug} href={`/fish/${sf.slug}`} title={`${sf.name}の釣り情報`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                  >
                    {sf.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}

      {/* 関連する季節の釣り特集 */}
      {(() => {
        const relatedGuides = seasonalGuides.filter((g) =>
          g.targetFish.includes(fish.slug)
        );
        if (relatedGuides.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:mb-4 sm:text-lg">
              <BookOpen className="size-5 text-primary" />
              {fish.name}の釣り方特集ガイド
            </h2>
            <p className="mb-3 text-xs text-muted-foreground sm:text-sm">
              {fish.name}を狙うための季節別釣りガイドです。
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedGuides.map((guide) => (
                <Link key={guide.slug} href={`/seasonal/${guide.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <h3 className="text-sm font-semibold group-hover:text-primary">
                        {guide.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {guide.description}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {guide.method}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {guide.season}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
