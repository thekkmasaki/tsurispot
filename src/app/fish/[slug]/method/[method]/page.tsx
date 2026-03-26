import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Fish,
  Calendar,
  Target,
  ChevronLeft,
  HelpCircle,
  Wrench,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { fishSpecies, getFishBySlug } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import {
  FISHING_METHODS,
  getMethodBySlug,
} from "@/lib/data/fishing-methods";
import {
  affiliateProducts,
  getSeasonFromMonth,
} from "@/lib/data/affiliate-products";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import type { FishingMethod } from "@/types";

type PageProps = {
  params: Promise<{ slug: string; method: string }>;
};

// generateStaticParams: 魚のfishingMethods × FISHING_METHODSの照合
export const dynamicParams = false;

export function generateStaticParams() {
  const combos: { slug: string; method: string }[] = [];
  const seen = new Set<string>();

  for (const fish of fishSpecies) {
    if (!fish.fishingMethods || fish.fishingMethods.length === 0) continue;
    for (const fm of fish.fishingMethods) {
      for (const methodDef of FISHING_METHODS) {
        if (methodDef.methods.includes(fm.methodName)) {
          const key = `${fish.slug}/${methodDef.slug}`;
          if (!seen.has(key)) {
            seen.add(key);
            combos.push({ slug: fish.slug, method: methodDef.slug });
          }
        }
      }
    }
  }

  return combos;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, method } = await params;
  const fish = getFishBySlug(slug);
  const methodDef = getMethodBySlug(method);
  if (!fish || !methodDef) return { title: "ページが見つかりません" };

  const matchingMethods = fish.fishingMethods?.filter((fm) =>
    methodDef.methods.includes(fm.methodName)
  ) ?? [];

  const title = `${fish.name}を${methodDef.name}で釣る方法【仕掛け・タックル・コツ完全ガイド】`;
  const description = `${fish.name}を${methodDef.name}で釣るための仕掛け・タックル・釣り方のコツを徹底解説。${matchingMethods.length > 0 ? `おすすめのシーズンは${matchingMethods[0].bestSeason}。` : ""}初心者から上級者まで役立つ${fish.name}×${methodDef.name}の完全ガイド。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/fish/${slug}/method/${method}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/fish/${slug}/method/${method}`,
    },
  };
}

// 難易度ラベル
const METHOD_DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
};

const METHOD_DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
};

const CATCH_DIFFICULTY_LABELS: Record<string, string> = {
  easy: "簡単",
  medium: "普通",
  hard: "難しい",
};

const CATCH_DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

export default async function FishMethodPage({ params }: PageProps) {
  const { slug, method } = await params;
  const fish = getFishBySlug(slug);
  const methodDef = getMethodBySlug(method);
  if (!fish || !methodDef) notFound();

  // この魚のこの釣り方に該当するfishingMethodsを取得
  const matchingMethods: FishingMethod[] = fish.fishingMethods?.filter((fm) =>
    methodDef.methods.includes(fm.methodName)
  ) ?? [];

  if (matchingMethods.length === 0) notFound();

  // この魚×この釣り方で釣れるスポットを取得
  const matchingSpots = fishingSpots.filter((spot) =>
    spot.catchableFish.some(
      (cf) =>
        cf.fish.slug === slug &&
        methodDef.methods.includes(cf.method)
    )
  );

  // スポットごとの詳細情報
  const spotsWithCatchInfo = matchingSpots.map((spot) => {
    const catchInfo = spot.catchableFish.find(
      (cf) =>
        cf.fish.slug === slug &&
        methodDef.methods.includes(cf.method)
    );
    return { spot, catchInfo };
  });

  // シーズン情報
  const seasonMonthNames = fish.seasonMonths
    .sort((a, b) => a - b)
    .map((m) => `${m}月`);
  const peakMonthNames = fish.peakMonths
    .sort((a, b) => a - b)
    .map((m) => `${m}月`);

  // 同じ釣り方で釣れる他の魚
  const otherFishSameMethod = new Map<string, { slug: string; name: string }>();
  for (const f of fishSpecies) {
    if (f.slug === slug) continue;
    if (!f.fishingMethods) continue;
    if (f.fishingMethods.some((fm) => methodDef.methods.includes(fm.methodName))) {
      if (!otherFishSameMethod.has(f.slug)) {
        otherFishSameMethod.set(f.slug, { slug: f.slug, name: f.name });
      }
    }
  }
  const relatedFishSameMethod = Array.from(otherFishSameMethod.values()).slice(0, 15);

  // 同じ魚の他の釣り方
  const otherMethodsForFish: { slug: string; name: string }[] = [];
  const seenMethods = new Set<string>();
  seenMethods.add(method);
  for (const fm of fish.fishingMethods ?? []) {
    for (const md of FISHING_METHODS) {
      if (md.methods.includes(fm.methodName) && !seenMethods.has(md.slug)) {
        seenMethods.add(md.slug);
        otherMethodsForFish.push({ slug: md.slug, name: md.name });
      }
    }
  }

  // アフィリエイト商品（釣り方に関連する商品）
  const currentMonth = new Date().getMonth() + 1;
  const currentSeason = getSeasonFromMonth(currentMonth);
  const relevantProducts = affiliateProducts
    .filter((p) => {
      if (!p.seasons.includes("all") && !p.seasons.includes(currentSeason)) return false;
      if (p.methodKeywords.length === 0) return true;
      return p.methodKeywords.some((kw) =>
        methodDef.methods.some((m) => m.includes(kw)) ||
        matchingMethods.some((fm) => fm.methodName.includes(kw))
      );
    })
    .slice(0, 4);

  // メインのタックル情報（最初のマッチングメソッドを使用）
  const primaryMethod = matchingMethods[0];

  // FAQ
  const faqItems = [
    {
      question: `${fish.name}を${methodDef.name}で釣るのに最適な時期は？`,
      answer: primaryMethod
        ? `${fish.name}の${methodDef.name}に最適な時期は${primaryMethod.bestSeason}です。${peakMonthNames.length > 0 ? `特に${peakMonthNames.join("・")}は最盛期で、釣果が最も期待できます。` : ""}${seasonMonthNames.length > 0 ? `シーズン全体では${seasonMonthNames.join("・")}に釣れます。` : ""}`
        : `${fish.name}のシーズンは${seasonMonthNames.join("・")}です。${peakMonthNames.length > 0 ? `最盛期は${peakMonthNames.join("・")}です。` : ""}`,
    },
    {
      question: `${fish.name}の${methodDef.name}に必要なタックルは？`,
      answer: primaryMethod
        ? `竿は${primaryMethod.tackle.rod}、リールは${primaryMethod.tackle.reel}、ラインは${primaryMethod.tackle.line}がおすすめです。${primaryMethod.tackle.hookOrLure}を使用し、${primaryMethod.tackle.otherItems.length > 0 ? `その他${primaryMethod.tackle.otherItems.join("・")}も用意しましょう。` : ""}`
        : `${methodDef.name}に適したタックルは、各スポットページで確認できます。`,
    },
    {
      question: `${fish.name}を${methodDef.name}で釣れるスポットは？`,
      answer: matchingSpots.length > 0
        ? `現在${matchingSpots.length}件のスポットで${fish.name}の${methodDef.name}の実績があります。${matchingSpots.slice(0, 3).map((s) => s.name).join("・")}などがおすすめです。`
        : `${fish.name}の${methodDef.name}に適したスポット情報は現在準備中です。`,
    },
  ];

  const pageUrl = `https://tsurispot.com/fish/${fish.slug}/method/${methodDef.slug}`;
  const headline = `${fish.name}を${methodDef.name}で釣る - 仕掛け・コツ・おすすめスポット`;
  const pageDescription = `${fish.name}を${methodDef.name}で釣るための仕掛け・タックル・釣り方のコツを徹底解説。おすすめスポット${matchingSpots.length}件も掲載。`;

  // JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "魚種一覧", item: "https://tsurispot.com/fish" },
      { "@type": "ListItem", position: 3, name: fish.name, item: `https://tsurispot.com/fish/${fish.slug}` },
      { "@type": "ListItem", position: 4, name: `${methodDef.name}で釣る`, item: pageUrl },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: pageDescription,
    datePublished: "2025-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    author: {
      "@type": "Person",
      name: "正木 家康",
      jobTitle: "編集長",
      url: "https://tsurispot.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "ツリスポ",
      url: "https://tsurispot.com",
      logo: { "@type": "ImageObject", url: "https://tsurispot.com/logo.svg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
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

  // HowTo JSON-LD
  const howToSteps = [
    { name: "タックルを準備する", text: primaryMethod ? `竿: ${primaryMethod.tackle.rod}、リール: ${primaryMethod.tackle.reel}、ライン: ${primaryMethod.tackle.line}を用意します。${primaryMethod.tackle.hookOrLure}もセットしましょう。` : `${methodDef.name}に適したタックルを準備します。` },
    { name: "ポイントを選ぶ", text: `${fish.name}が回遊するポイントを選びます。${matchingSpots.length > 0 ? `${matchingSpots[0].name}などの実績スポットがおすすめです。` : "潮通しの良い場所を選びましょう。"}` },
    { name: "仕掛けをセットする", text: primaryMethod ? `${primaryMethod.description.slice(0, 100)}` : `${methodDef.name}の仕掛けをセットします。` },
    { name: "釣り開始", text: primaryMethod?.tips[0] ?? `${methodDef.name}のテクニックで${fish.name}を狙います。` },
    { name: "取り込み", text: `${fish.name}がかかったら、慌てずにやり取りして取り込みましょう。${fish.sizeCm}程度のサイズが期待できます。` },
  ];

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${fish.name}を${methodDef.name}で釣る方法`,
    description: pageDescription,
    totalTime: "PT3H",
    supply: primaryMethod ? [
      { "@type": "HowToSupply", name: primaryMethod.tackle.hookOrLure },
      ...primaryMethod.tackle.otherItems.map((item) => ({ "@type": "HowToSupply", name: item })),
    ] : [],
    tool: primaryMethod ? [
      { "@type": "HowToTool", name: primaryMethod.tackle.rod },
      { "@type": "HowToTool", name: primaryMethod.tackle.reel },
    ] : [],
    step: howToSteps.map((step, idx) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      position: idx + 1,
    })),
  };

  const jsonLdArray = [breadcrumbJsonLd, articleJsonLd, faqJsonLd, howToJsonLd];

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArray) }}
      />

      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "魚種一覧", href: "/fish" },
          { label: fish.name, href: `/fish/${fish.slug}` },
          { label: `${methodDef.name}で釣る` },
        ]}
      />

      {/* 戻るリンク */}
      <Link
        href={`/fish/${fish.slug}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {fish.name}の詳細に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {fish.name}を{methodDef.name}で釣る方法
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          仕掛け・タックル・コツを徹底解説{matchingSpots.length > 0 && ` | おすすめスポット${matchingSpots.length}件`}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {fish.name}を{methodDef.name}で釣るための完全ガイドです。
          {primaryMethod && `${primaryMethod.bestSeason}がベストシーズン。`}
          {primaryMethod && `難易度は${METHOD_DIFFICULTY_LABELS[primaryMethod.difficulty]}。`}
          {methodDef.description}
        </p>
      </div>

      {/* 基本情報カード */}
      <section className="mb-6 sm:mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 魚種基本情報 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Fish className="size-4 text-primary" />
                {fish.name}の基本情報
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>カテゴリ: {fish.category === "sea" ? "海水魚" : fish.category === "freshwater" ? "淡水魚" : "汽水魚"}</p>
                <p>サイズ: {fish.sizeCm}</p>
                <p>
                  難易度:{" "}
                  <Badge variant="secondary" className="text-xs">
                    {DIFFICULTY_LABELS[fish.difficulty]}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* シーズン */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Calendar className="size-4 text-primary" />
                シーズン
              </h2>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  釣れる時期: {seasonMonthNames.join("・")}
                </p>
                {peakMonthNames.length > 0 && (
                  <p className="text-sm">
                    <Badge className="bg-orange-500 text-xs hover:bg-orange-500">最盛期</Badge>
                    <span className="ml-1.5 text-muted-foreground">{peakMonthNames.join("・")}</span>
                  </p>
                )}
                {primaryMethod && (
                  <p className="text-sm text-muted-foreground">
                    ベストシーズン: {primaryMethod.bestSeason}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 釣り方の難易度 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Target className="size-4 text-primary" />
                {methodDef.name}の難易度
              </h2>
              <div className="space-y-1 text-sm text-muted-foreground">
                {matchingMethods.map((fm, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span>{fm.methodName}:</span>
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${METHOD_DIFFICULTY_COLORS[fm.difficulty]}`}>
                      {METHOD_DIFFICULTY_LABELS[fm.difficulty]}
                    </span>
                  </div>
                ))}
                <p className="mt-1">
                  実績スポット: {matchingSpots.length}件
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* タックル・仕掛け情報 */}
      {matchingMethods.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Wrench className="size-5 text-primary" />
            {fish.name}×{methodDef.name}のタックル・仕掛け
          </h2>
          <div className="space-y-4">
            {matchingMethods.map((fm, idx) => (
              <Card key={idx} className="gap-0 py-0">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-3 text-sm font-bold sm:text-base">
                    {fm.methodName}
                    <span className={`ml-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${METHOD_DIFFICULTY_COLORS[fm.difficulty]}`}>
                      {METHOD_DIFFICULTY_LABELS[fm.difficulty]}
                    </span>
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">{fm.description}</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <h4 className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">タックル</h4>
                      <ul className="space-y-1 text-sm">
                        <li><span className="font-medium">竿:</span> {fm.tackle.rod}</li>
                        <li><span className="font-medium">リール:</span> {fm.tackle.reel}</li>
                        <li><span className="font-medium">ライン:</span> {fm.tackle.line}</li>
                        <li><span className="font-medium">仕掛け:</span> {fm.tackle.hookOrLure}</li>
                      </ul>
                    </div>
                    {fm.tackle.otherItems.length > 0 && (
                      <div>
                        <h4 className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">その他の道具</h4>
                        <ul className="space-y-1 text-sm">
                          {fm.tackle.otherItems.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {fm.tips.length > 0 && (
                    <div className="mt-4">
                      <h4 className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">コツ・ポイント</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {fm.tips.map((tip, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-muted-foreground">
                    ベストシーズン: {fm.bestSeason}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* シーズンカレンダー */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <Calendar className="size-5 text-primary" />
          {fish.name}のシーズンカレンダー
        </h2>
        <Card className="gap-0 py-0">
          <CardContent className="p-4">
            <div className="grid grid-cols-6 gap-1 sm:grid-cols-12">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const isPeak = fish.peakMonths.includes(month);
                const isSeason = fish.seasonMonths.includes(month);
                return (
                  <div
                    key={month}
                    className={`rounded p-1.5 text-center text-xs sm:text-sm ${
                      isPeak
                        ? "bg-orange-500 font-bold text-white"
                        : isSeason
                          ? "bg-blue-100 text-blue-800"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {month}月
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-orange-500" />
                最盛期
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded bg-blue-100" />
                シーズン
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* アフィリエイト商品 */}
      {relevantProducts.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            {fish.name}の{methodDef.name}におすすめの道具
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relevantProducts.map((product) => (
              <Card key={product.id} className="gap-0 py-0">
                <CardContent className="p-4">
                  <h3 className="mb-1 text-sm font-bold">{product.name}</h3>
                  <p className="mb-3 text-xs text-muted-foreground">{product.description}</p>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    詳細を見る
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* おすすめスポット一覧 */}
      {matchingSpots.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5 text-primary" />
            {fish.name}を{methodDef.name}で釣れるスポット（{matchingSpots.length}件）
          </h2>

          {/* テーブル */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">スポット名</th>
                  <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">タイプ</th>
                  <th className="px-3 py-2 text-left font-medium">釣り方</th>
                  <th className="px-3 py-2 text-left font-medium hidden sm:table-cell">難易度</th>
                  <th className="px-3 py-2 text-left font-medium hidden md:table-cell">時期</th>
                </tr>
              </thead>
              <tbody>
                {spotsWithCatchInfo.map(({ spot, catchInfo }) => (
                  <tr key={spot.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Link
                        href={`/spots/${spot.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {spot.name}
                      </Link>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {SPOT_TYPE_LABELS[spot.spotType]}
                      </p>
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {SPOT_TYPE_LABELS[spot.spotType]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2">
                      {catchInfo?.method || "-"}
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      {catchInfo && (
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${CATCH_DIFFICULTY_COLORS[catchInfo.catchDifficulty]}`}>
                          {CATCH_DIFFICULTY_LABELS[catchInfo.catchDifficulty]}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">
                      {catchInfo ? `${catchInfo.monthStart}月〜${catchInfo.monthEnd}月` : "-"}
                      {catchInfo?.peakSeason && (
                        <Badge className="ml-1 bg-orange-500 text-[10px] hover:bg-orange-500">旬</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SpotCardグリッド */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchingSpots.slice(0, 12).map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
          {matchingSpots.length > 12 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              他{matchingSpots.length - 12}件のスポットはテーブルからご確認ください
            </p>
          )}
        </section>
      )}

      {/* 同じ魚の他の釣り方 */}
      {otherMethodsForFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {fish.name}の他の釣り方
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {otherMethodsForFish.map((m) => (
              <Link key={m.slug} href={`/fish/${fish.slug}/method/${m.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {m.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 同じ釣り方で釣れる他の魚 */}
      {relatedFishSameMethod.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {methodDef.name}で釣れる他の魚
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {relatedFishSameMethod.map((f) => (
              <Link key={f.slug} href={`/fish/${f.slug}/method/${method}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {f.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* よくある質問 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          {fish.name}の{methodDef.name}に関するよくある質問
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <Card key={idx} className="gap-0 py-0">
              <CardContent className="p-4">
                <h3 className="font-bold text-sm sm:text-base mb-2">
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
            href={`/fish/${fish.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {fish.name}の詳細
          </Link>
          <Link
            href={methodDef.guide}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {methodDef.name}ガイド
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
          <Link
            href="/guide"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            釣り方ガイド
          </Link>
        </div>
      </section>
    </div>
  );
}
