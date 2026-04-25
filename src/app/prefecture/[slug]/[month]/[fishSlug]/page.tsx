import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Fish,
  Calendar,
  ChevronLeft,
  HelpCircle,
  Thermometer,
  ShoppingBag,
  ExternalLink,
  Star,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishSpecies } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import {
  MONTHS,
  getMonthBySlug,
  isMonthInRange,
  FISHING_METHODS,
} from "@/lib/data/fishing-methods";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";
import { InArticleAd } from "@/components/ads/ad-unit";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";

type PageProps = {
  params: Promise<{ slug: string; month: string; fishSlug: string }>;
};

export const dynamicParams = false;

const MIN_SPOTS = 2;

// 水温目安（地域別・月別）
const WATER_TEMP: Record<number, string> = {
  1: "8〜12℃",
  2: "7〜10℃",
  3: "10〜14℃",
  4: "13〜17℃",
  5: "16〜20℃",
  6: "19〜23℃",
  7: "22〜27℃",
  8: "25〜29℃",
  9: "23〜27℃",
  10: "19〜23℃",
  11: "15〜19℃",
  12: "11〜15℃",
};

const CATEGORY_LABELS: Record<string, string> = {
  sea: "海水魚",
  freshwater: "淡水魚",
  brackish: "汽水魚",
};

/**
 * 有効な都道府県×月×魚種の組み合わせを事前計算
 * generateStaticParams と月ナビゲーターの両方で使用
 */
function buildValidCombos(): Map<string, Set<string>> {
  // key: `${prefSlug}/${fishSlug}`, value: Set<monthSlug>
  const map = new Map<string, Set<string>>();

  for (const pref of prefectures) {
    const prefSpots = fishingSpots.filter(
      (s) => s.region.prefecture === pref.name
    );

    for (const month of MONTHS) {
      const fishMap = new Map<string, number>();
      for (const spot of prefSpots) {
        for (const cf of spot.catchableFish) {
          if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
            fishMap.set(cf.fish.slug, (fishMap.get(cf.fish.slug) || 0) + 1);
          }
        }
      }

      for (const [fSlug, count] of fishMap) {
        if (count >= MIN_SPOTS) {
          const key = `${pref.slug}/${fSlug}`;
          if (!map.has(key)) map.set(key, new Set());
          map.get(key)!.add(month.slug);
        }
      }
    }
  }

  return map;
}

const validCombos = buildValidCombos();

export function generateStaticParams() {
  const combos: { slug: string; month: string; fishSlug: string }[] = [];

  for (const pref of prefectures) {
    const prefSpots = fishingSpots.filter(
      (s) => s.region.prefecture === pref.name
    );

    for (const month of MONTHS) {
      const fishMap = new Map<string, number>();
      for (const spot of prefSpots) {
        for (const cf of spot.catchableFish) {
          if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
            fishMap.set(cf.fish.slug, (fishMap.get(cf.fish.slug) || 0) + 1);
          }
        }
      }

      for (const [fSlug, count] of fishMap) {
        if (count >= MIN_SPOTS) {
          combos.push({ slug: pref.slug, month: month.slug, fishSlug: fSlug });
        }
      }
    }
  }

  return combos;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, month: monthSlug, fishSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const month = getMonthBySlug(monthSlug);
  const fish = fishSpecies.find((f) => f.slug === fishSlug);
  if (!pref || !month || !fish) return { title: "ページが見つかりません" };

  const title = `${pref.name}の${month.name}の${fish.name}釣り【2026年】釣れるスポット・釣り方`;
  const description = `${pref.name}で${month.name}に${fish.name}が釣れるスポットと釣り方を紹介。${month.season}シーズンの${fish.name}釣りの時期・仕掛け・おすすめポイントを完全ガイド。`;
  const pageUrl = `https://tsurispot.com/prefecture/${slug}/${monthSlug}/${fishSlug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      siteName: "ツリスポ",
      images: [
        {
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(title)}&emoji=%F0%9F%90%9F`,
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function PrefectureMonthFishPage({
  params,
}: PageProps) {
  const { slug, month: monthSlug, fishSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const month = getMonthBySlug(monthSlug);
  const fish = fishSpecies.find((f) => f.slug === fishSlug);
  if (!pref || !month || !fish) notFound();

  // この都道府県のスポットを取得
  const prefSpots = fishingSpots.filter(
    (s) => s.region.prefecture === pref.name
  );

  // この月にこの魚が釣れるスポットを抽出
  const matchingSpots = prefSpots
    .map((spot) => {
      const matchingCf = spot.catchableFish.filter(
        (cf) =>
          cf.fish.slug === fishSlug &&
          isMonthInRange(month.num, cf.monthStart, cf.monthEnd)
      );
      if (matchingCf.length === 0) return null;
      const isPeak = matchingCf.some((cf) => cf.peakSeason);
      return { spot, matchingCf, isPeak };
    })
    .filter(
      (
        x
      ): x is {
        spot: (typeof prefSpots)[number];
        matchingCf: (typeof prefSpots)[number]["catchableFish"];
        isPeak: boolean;
      } => x !== null
    )
    .sort((a, b) => {
      // ピークシーズンのスポットを先に、その後 rating 順
      if (a.isPeak !== b.isPeak) return a.isPeak ? -1 : 1;
      return b.spot.rating - a.spot.rating;
    });

  if (matchingSpots.length < MIN_SPOTS) notFound();

  const topSpots = matchingSpots.slice(0, 10);
  const hasPeak = matchingSpots.some((s) => s.isPeak);

  // この魚をこの月に釣る方法を集計
  const methodCountMap = new Map<string, number>();
  for (const { matchingCf } of matchingSpots) {
    for (const cf of matchingCf) {
      methodCountMap.set(cf.method, (methodCountMap.get(cf.method) || 0) + 1);
    }
  }
  const methodBreakdown = Array.from(methodCountMap.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // 釣り方定義とマッチング（ガイドリンク用）
  const matchedMethods = methodBreakdown
    .map(({ method, count }) => {
      const def = FISHING_METHODS.find((fm) =>
        fm.methods.some(
          (m) => method.includes(m) || m.includes(method)
        )
      );
      const difficulty = matchingSpots
        .flatMap((s) => s.matchingCf)
        .find((cf) => cf.method === method)?.catchDifficulty;
      return { method, count, def, difficulty };
    })
    .slice(0, 6);

  // シーズンカレンダーデータ
  const calendarData = MONTHS.map((m) => {
    let count = 0;
    let isPeak = false;
    for (const spot of prefSpots) {
      for (const cf of spot.catchableFish) {
        if (
          cf.fish.slug === fishSlug &&
          isMonthInRange(m.num, cf.monthStart, cf.monthEnd)
        ) {
          count++;
          if (cf.peakSeason) isPeak = true;
        }
      }
    }
    return { month: m, count, isPeak };
  });
  const maxCount = Math.max(...calendarData.map((d) => d.count), 1);

  // おすすめアフィリエイト商品
  const topMethods = methodBreakdown.map((m) => m.method);
  const recommendedProducts = getRelevantAffiliateProducts(
    topMethods,
    month.num,
    6,
    false,
    pref.name
  );

  // 他の都道府県で同じ月にこの魚が釣れる場所
  const otherPrefectures: { name: string; slug: string; count: number }[] = [];
  for (const otherPref of prefectures) {
    if (otherPref.slug === pref.slug) continue;
    const otherPrefSpots = fishingSpots.filter(
      (s) => s.region.prefecture === otherPref.name
    );
    let count = 0;
    for (const spot of otherPrefSpots) {
      for (const cf of spot.catchableFish) {
        if (
          cf.fish.slug === fishSlug &&
          isMonthInRange(month.num, cf.monthStart, cf.monthEnd)
        ) {
          count++;
          break; // 同じスポットは1回だけカウント
        }
      }
    }
    if (count >= MIN_SPOTS) {
      otherPrefectures.push({
        name: otherPref.name,
        slug: otherPref.slug,
        count,
      });
    }
  }
  otherPrefectures.sort((a, b) => b.count - a.count);
  const topOtherPrefectures = otherPrefectures.slice(0, 12);

  // 同じ都道府県・同じ月の他の魚
  const otherFishMap = new Map<
    string,
    { slug: string; name: string; count: number }
  >();
  for (const spot of prefSpots) {
    for (const cf of spot.catchableFish) {
      if (
        cf.fish.slug !== fishSlug &&
        isMonthInRange(month.num, cf.monthStart, cf.monthEnd)
      ) {
        const existing = otherFishMap.get(cf.fish.slug);
        if (existing) {
          existing.count++;
        } else {
          otherFishMap.set(cf.fish.slug, {
            slug: cf.fish.slug,
            name: cf.fish.name,
            count: 1,
          });
        }
      }
    }
  }
  const otherFishList = Array.from(otherFishMap.values())
    .filter((f) => f.count >= MIN_SPOTS)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // 月ナビゲーター用の有効月セット
  const comboKey = `${pref.slug}/${fishSlug}`;
  const validMonths = validCombos.get(comboKey) || new Set<string>();

  // FAQ
  const faqItems = [
    {
      question: `${pref.name}で${month.name}に${fish.name}は釣れますか？`,
      answer: `はい、${pref.name}では${month.name}に${matchingSpots.length}か所のスポットで${fish.name}が釣れます。${
        hasPeak
          ? `${month.name}は${fish.name}の最盛期にあたり、特に好釣果が期待できます。`
          : `水温${WATER_TEMP[month.num]}の環境で狙うことができます。`
      }${
        methodBreakdown.length > 0
          ? `主な釣り方は${methodBreakdown
              .slice(0, 3)
              .map((m) => m.method)
              .join("・")}です。`
          : ""
      }`,
    },
    {
      question: `${pref.name}で${month.name}に${fish.name}が釣れるおすすめスポットは？`,
      answer:
        topSpots.length > 0
          ? `${pref.name}で${month.name}の${fish.name}釣りには${topSpots
              .slice(0, 3)
              .map(({ spot }) => spot.name)
              .join("・")}などがおすすめです。${
              matchingSpots.length >= 5
                ? `他にも${matchingSpots.length}件のスポットで${fish.name}を狙えます。`
                : ""
            }`
          : `${month.name}の${pref.name}での${fish.name}釣りスポット情報は現在準備中です。`,
    },
    {
      question: `${month.name}の${fish.name}釣りのコツは？`,
      answer: `${month.name}（水温${WATER_TEMP[month.num]}）の${fish.name}釣りでは、${
        methodBreakdown.length > 0
          ? `${methodBreakdown[0].method}が最もポピュラーな釣り方です。`
          : ""
      }${
        hasPeak
          ? "最盛期のため魚の活性が高く、比較的釣りやすい時期です。"
          : "水温や潮の状況に合わせたアプローチが大切です。"
      }朝マズメ・夕マズメの時間帯は特にチャンスが増えます。`,
    },
  ];

  // ページ情報
  const pageUrl = `https://tsurispot.com/prefecture/${pref.slug}/${month.slug}/${fishSlug}`;
  const headline = `${pref.name}の${month.name}の${fish.name}釣り`;
  const pageDescription = `${pref.name}で${month.name}に${fish.name}が釣れるスポット${matchingSpots.length}選と釣り方を完全ガイド。`;

  // 味の星表示
  const tasteStars = Math.round(fish.tasteRating);

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
        name: "都道府県一覧",
        item: "https://tsurispot.com/prefecture",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: pref.name,
        item: `https://tsurispot.com/prefecture/${pref.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${month.name}の釣り情報`,
        item: `https://tsurispot.com/prefecture/${pref.slug}/${month.slug}`,
      },
      {
        "@type": "ListItem",
        position: 5,
        name: fish.name,
        item: pageUrl,
      },
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
      logo: {
        "@type": "ImageObject",
        url: "https://tsurispot.com/logo.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const jsonLdArray = [breadcrumbJsonLd, articleJsonLd, faqJsonLd];

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
          { label: "都道府県一覧", href: "/prefecture" },
          { label: pref.name, href: `/prefecture/${pref.slug}` },
          {
            label: `${month.name}の釣り情報`,
            href: `/prefecture/${pref.slug}/${month.slug}`,
          },
          { label: fish.name },
        ]}
      />

      {/* 戻るリンク */}
      <Link
        href={`/prefecture/${pref.slug}/${month.slug}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {pref.name}の{month.name}の釣り情報に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}の{month.name}の{fish.name}釣り
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="text-xs"
          >
            {month.season}シーズン
          </Badge>
          {hasPeak && (
            <Badge className="bg-orange-500 text-xs hover:bg-orange-500">
              最盛期
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {matchingSpots.length}スポットで釣れる
          </span>
        </div>
      </div>

      {/* サマリーカード（3つ） */}
      <section className="mb-6 sm:mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 水温 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Thermometer className="size-4 text-primary" />
                水温目安
              </h2>
              <p className="text-lg font-bold text-primary">
                {WATER_TEMP[month.num]}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {month.season}シーズン
              </p>
            </CardContent>
          </Card>

          {/* この魚が釣れるスポット数 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <MapPin className="size-4 text-primary" />
                {fish.name}が釣れるスポット
              </h2>
              <p className="text-lg font-bold text-primary">
                {matchingSpots.length}件
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {pref.name}内の対象スポット
              </p>
            </CardContent>
          </Card>

          {/* 釣り方の数 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Fish className="size-4 text-primary" />
                対応する釣り方
              </h2>
              <p className="text-lg font-bold text-primary">
                {methodBreakdown.length}種類
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {methodBreakdown
                  .slice(0, 3)
                  .map((m) => m.method)
                  .join("・")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 魚ヒーローセクション */}
      <section className="mb-8 sm:mb-10">
        <Card className="gap-0 py-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className="flex-1">
                <h2 className="mb-2 text-base font-bold sm:text-lg">
                  {fish.name}（{fish.nameKana}）
                </h2>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  {pref.name}の{month.name}（{month.season}）は{fish.name}
                  を狙うのに
                  {hasPeak ? "最高のシーズンです" : "適したシーズンです"}。
                  水温{WATER_TEMP[month.num]}の環境で、
                  {methodBreakdown.length > 0
                    ? `${methodBreakdown[0].method}を中心に楽しめます。`
                    : "さまざまな釣り方で楽しめます。"}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {DIFFICULTY_LABELS[fish.difficulty]}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    シーズン: {fish.seasonMonths.length > 0 ? `${fish.seasonMonths[0]}月〜${fish.seasonMonths[fish.seasonMonths.length - 1]}月` : "通年"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[fish.category] || fish.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    美味しさ: {"★".repeat(tasteStars)}{"☆".repeat(5 - tasteStars)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* シーズンカレンダー */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <Calendar className="size-5 text-primary" />
          {pref.name}の{fish.name} シーズンカレンダー
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {pref.name}で{fish.name}が釣れる月を色分けで表示しています。色が濃いほど多くのスポットで狙えます。
        </p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {calendarData.map((d) => {
            let colorClass: string;
            if (d.count === 0) {
              colorClass = "bg-muted text-muted-foreground";
            } else if (d.isPeak || d.count >= maxCount * 0.8) {
              colorClass = "bg-primary text-primary-foreground";
            } else if (d.count >= maxCount * 0.5) {
              colorClass = "bg-primary/60 text-primary-foreground";
            } else {
              colorClass = "bg-primary/20 text-primary";
            }
            const isCurrent = d.month.num === month.num;
            return (
              <div
                key={d.month.slug}
                className={`rounded-lg px-2 py-2 text-center text-xs font-medium ${colorClass} ${
                  isCurrent ? "ring-2 ring-accent ring-offset-1" : ""
                }`}
              >
                <div>{d.month.name}</div>
                <div className="mt-0.5 text-[10px] opacity-80">
                  {d.count > 0 ? `${d.count}件` : "−"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground sm:text-xs">
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded bg-primary" />
            最盛期・多数
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded bg-primary/60" />
            多い
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded bg-primary/20" />
            少なめ
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded bg-muted" />
            オフシーズン
          </span>
        </div>
      </section>

      {/* おすすめ釣り方 */}
      {matchedMethods.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 text-base font-bold sm:text-lg">
            {pref.name}で{month.name}に{fish.name}を釣る方法
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchedMethods.map(({ method, count, def, difficulty }) => (
              <Card key={method} className="gap-0 py-0">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-sm font-bold">
                      {def?.icon && (
                        <span className="mr-1">{def.icon}</span>
                      )}
                      {method}
                    </h3>
                    {difficulty && (
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {difficulty === "easy"
                          ? "初心者向け"
                          : difficulty === "medium"
                            ? "中級者向け"
                            : "上級者向け"}
                      </Badge>
                    )}
                  </div>
                  {def && (
                    <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
                      {def.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {count}スポットで対応
                    </span>
                    {def && (
                      <Link
                        href={def.guide}
                        className="text-xs text-primary hover:underline"
                      >
                        釣り方ガイド →
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <InArticleAd />

      {/* おすすめスポットTOP10 */}
      {topSpots.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <MapPin className="size-5 text-primary" />
            {pref.name}の{month.name}の{fish.name}
            おすすめスポット（TOP{topSpots.length}）
          </h2>

          {/* テーブル */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium">
                    スポット名
                  </th>
                  <th className="hidden px-3 py-2 text-left font-medium sm:table-cell">
                    タイプ
                  </th>
                  <th className="px-3 py-2 text-left font-medium">釣り方</th>
                  <th className="hidden px-3 py-2 text-left font-medium md:table-cell">
                    評価
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSpots.map(({ spot, matchingCf, isPeak }) => (
                  <tr key={spot.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <Link
                        href={`/spots/${spot.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {spot.name}
                      </Link>
                      {isPeak && (
                        <Badge className="ml-1.5 bg-orange-500 text-[10px] hover:bg-orange-500">
                          旬
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {SPOT_TYPE_LABELS[spot.spotType]}
                      </p>
                    </td>
                    <td className="hidden px-3 py-2 sm:table-cell">
                      <Badge variant="secondary" className="text-xs">
                        {SPOT_TYPE_LABELS[spot.spotType]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {matchingCf
                        .map((cf) => cf.method)
                        .filter(
                          (m, i, arr) => arr.indexOf(m) === i
                        )
                        .slice(0, 2)
                        .join("・")}
                    </td>
                    <td className="hidden px-3 py-2 md:table-cell">
                      <span className="text-yellow-600">
                        {"★".repeat(Math.round(spot.rating))}
                      </span>
                      <span className="ml-1 text-muted-foreground">
                        {spot.rating.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* SpotCardグリッド */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topSpots.map(({ spot }) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        </section>
      )}

      {/* おすすめ装備 */}
      {recommendedProducts.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <ShoppingBag className="size-5 text-primary" />
            {fish.name}釣りにおすすめの装備
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {pref.name}で{month.name}に{fish.name}を狙うのにおすすめのアイテムをピックアップしました。
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedProducts.map((product) => (
              <a
                key={product.id}
                href={product.url}
                target="_blank"
                rel="nofollow noopener sponsored"
                className="group relative flex flex-col rounded-lg border p-4 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                {product.isRecommended && (
                  <span className="absolute -top-2 right-3 flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Star className="size-2.5 fill-current" />
                    編集長おすすめ
                  </span>
                )}
                <div className="mb-1">
                  <span className="text-sm font-bold group-hover:text-primary">
                    {product.name}
                  </span>
                </div>
                {product.priceRange && (
                  <div className="flex items-center gap-1">
                    <Tag className="size-3 text-red-500" />
                    <span className="text-sm font-bold text-red-600">
                      {product.priceRange}
                    </span>
                  </div>
                )}
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <span className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#FF9900] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#E88B00]">
                  Amazonで詳細を見る
                  <ExternalLink className="size-3" />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      <InArticleAd />

      {/* よくある質問 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          {pref.name}の{month.name}の{fish.name}釣りに関するよくある質問
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

      {/* 同じ魚が釣れる他の都道府県 */}
      {topOtherPrefectures.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {month.name}に{fish.name}が釣れる他の都道府県
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {topOtherPrefectures.map((op) => (
              <Link
                key={op.slug}
                href={`/prefecture/${op.slug}/${month.slug}/${fishSlug}`}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {op.name}
                  <span className="ml-1 text-muted-foreground">
                    ({op.count}件)
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 同じ都道府県・同じ月の他の魚 */}
      {otherFishList.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.name}で{month.name}に釣れる他の魚
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {otherFishList.map((f) => (
              <Link
                key={f.slug}
                href={`/prefecture/${pref.slug}/${month.slug}/${f.slug}`}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {f.name}
                  <span className="ml-1 text-muted-foreground">
                    ({f.count}件)
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 月ナビゲーター */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 text-base font-bold sm:text-lg">
          {pref.name}の{fish.name}：月別ガイド
        </h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {MONTHS.map((m) => {
            const isValid = validMonths.has(m.slug);
            const isCurrent = m.slug === month.slug;

            if (isCurrent) {
              return (
                <span
                  key={m.slug}
                  className="rounded-lg border-2 border-primary bg-primary/10 px-3 py-2 text-center text-sm font-bold text-primary"
                >
                  {m.name}
                </span>
              );
            }

            if (isValid) {
              return (
                <Link
                  key={m.slug}
                  href={`/prefecture/${pref.slug}/${m.slug}/${fishSlug}`}
                  className="rounded-lg border px-3 py-2 text-center text-sm transition-colors hover:bg-muted"
                >
                  {m.name}
                </Link>
              );
            }

            return (
              <span
                key={m.slug}
                className="rounded-lg border px-3 py-2 text-center text-sm text-muted-foreground/50"
              >
                {m.name}
              </span>
            );
          })}
        </div>
      </section>

      {/* 次のアクションCTA */}
      <section className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 sm:mb-10">
        <h2 className="mb-4 text-center text-base font-bold sm:text-lg">
          {pref.name}で{month.name}の{fish.name}釣りを楽しもう
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href={`/prefecture/${pref.slug}`}
            className="flex items-center gap-3 rounded-lg bg-background p-4 shadow-sm transition-all hover:shadow-md"
          >
            <MapPin className="size-8 text-primary" />
            <div>
              <div className="text-sm font-bold">
                {pref.name}の全釣りスポット
              </div>
              <div className="text-xs text-muted-foreground">
                {prefSpots.length}件のスポットを探す
              </div>
            </div>
          </Link>
          <Link
            href={`/fish/${fishSlug}`}
            className="flex items-center gap-3 rounded-lg bg-background p-4 shadow-sm transition-all hover:shadow-md"
          >
            <Fish className="size-8 text-primary" />
            <div>
              <div className="text-sm font-bold">{fish.name}の詳細情報</div>
              <div className="text-xs text-muted-foreground">
                釣り方・旬・レシピ
              </div>
            </div>
          </Link>
          <Link
            href={`/prefecture/${pref.slug}/${month.slug}`}
            className="flex items-center gap-3 rounded-lg bg-background p-4 shadow-sm transition-all hover:shadow-md"
          >
            <Calendar className="size-8 text-primary" />
            <div>
              <div className="text-sm font-bold">
                {pref.name}の{month.name}の釣り
              </div>
              <div className="text-xs text-muted-foreground">
                他の魚種も見る
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 関連リンク */}
      <section className="mt-8 sm:mt-12">
        <h2 className="mb-3 text-base font-bold sm:mb-4 sm:text-lg">
          関連リンク
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/prefecture/${pref.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の釣り場
          </Link>
          <Link
            href={`/prefecture/${pref.slug}/${month.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の{month.name}の釣り
          </Link>
          <Link
            href={`/fish/${fishSlug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {fish.name}の詳細
          </Link>
          <Link
            href={`/monthly/${month.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {month.name}の釣りガイド
          </Link>
          {matchedMethods[0]?.def && (
            <Link
              href={matchedMethods[0].def.guide}
              className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              {matchedMethods[0].def.name}ガイド
            </Link>
          )}
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
