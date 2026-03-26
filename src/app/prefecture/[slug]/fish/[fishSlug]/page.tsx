import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Fish, Calendar, Target, ChevronLeft, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishSpecies, getFishBySlug } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import { getSpotsByPrefectureAndFish } from "@/lib/data";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";

type PageProps = {
  params: Promise<{ slug: string; fishSlug: string }>;
};

// generateStaticParams: 実データに基づく組み合わせのみ生成
export const dynamicParams = false;

export function generateStaticParams() {
  const combos: { slug: string; fishSlug: string }[] = [];
  const seen = new Set<string>();

  for (const spot of fishingSpots) {
    const pref = prefectures.find((p) => p.name === spot.region.prefecture);
    if (!pref) continue;

    for (const cf of spot.catchableFish) {
      const key = `${pref.slug}/${cf.fish.slug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      combos.push({ slug: pref.slug, fishSlug: cf.fish.slug });
    }
  }

  return combos;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, fishSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const fish = getFishBySlug(fishSlug);
  if (!pref || !fish) return { title: "ページが見つかりません" };

  const spots = getSpotsByPrefectureAndFish(pref.name, fishSlug);

  // ベストシーズン・釣り方をメタデータ用に取得
  const metaPeakMonths = fish.peakMonths.sort((a, b) => a - b).map((m) => `${m}月`);
  const metaSeasonMonths = fish.seasonMonths.sort((a, b) => a - b).map((m) => `${m}月`);
  const metaMethodMap = new Map<string, number>();
  for (const spot of spots) {
    const cf = spot.catchableFish.find((c) => c.fish.slug === fishSlug);
    if (cf) metaMethodMap.set(cf.method, (metaMethodMap.get(cf.method) || 0) + 1);
  }
  const metaTopMethods = Array.from(metaMethodMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m);

  const title = `${pref.name}で${fish.name}が釣れるスポット・時期・釣り方【完全ガイド】`;
  const description = `${pref.name}で${fish.name}が釣れるおすすめスポット${spots.length}件を徹底紹介。${metaPeakMonths.length > 0 ? `ベストシーズンは${metaPeakMonths.join("・")}。` : metaSeasonMonths.length > 0 ? `シーズンは${metaSeasonMonths.join("・")}。` : ""}${metaTopMethods.length > 0 ? `おすすめの釣り方は${metaTopMethods.join("・")}。` : ""}初心者向けの穴場スポットから上級者向けポイントまで、${pref.name}で${fish.name}を釣るための情報を完全ガイド。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/prefecture/${slug}/fish/${fishSlug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/prefecture/${slug}/fish/${fishSlug}`,
    },
  };
}

// 難易度ラベル（CatchableFish用）
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

export default async function PrefectureFishPage({ params }: PageProps) {
  const { slug, fishSlug } = await params;
  const pref = getPrefectureBySlug(slug);
  const fish = getFishBySlug(fishSlug);
  if (!pref || !fish) notFound();

  const spots = getSpotsByPrefectureAndFish(pref.name, fishSlug);
  if (spots.length === 0) notFound();

  // 各スポットの釣れる魚情報を取得
  const spotsWithCatchInfo = spots.map((spot) => {
    const catchInfo = spot.catchableFish.find((cf) => cf.fish.slug === fishSlug);
    return { spot, catchInfo };
  });

  // 釣り方別に集計
  const methodMap = new Map<string, number>();
  for (const { catchInfo } of spotsWithCatchInfo) {
    if (catchInfo) {
      const m = catchInfo.method;
      methodMap.set(m, (methodMap.get(m) || 0) + 1);
    }
  }
  const methodBreakdown = Array.from(methodMap.entries())
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count);

  // 同じ県の他の魚種
  const otherFishInPref = new Map<string, { slug: string; name: string; count: number }>();
  for (const spot of spots) {
    for (const cf of spot.catchableFish) {
      if (cf.fish.slug === fishSlug) continue;
      const existing = otherFishInPref.get(cf.fish.slug);
      if (existing) {
        existing.count++;
      } else {
        otherFishInPref.set(cf.fish.slug, {
          slug: cf.fish.slug,
          name: cf.fish.name,
          count: 1,
        });
      }
    }
  }
  const relatedFishInPref = Array.from(otherFishInPref.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // 同じ魚種の他の県
  const otherPrefsForFish = new Map<string, { prefSlug: string; prefName: string; count: number }>();
  for (const spot of fishingSpots) {
    if (spot.region.prefecture === pref.name) continue;
    if (!spot.catchableFish.some((cf) => cf.fish.slug === fishSlug)) continue;
    const spotPref = prefectures.find((p) => p.name === spot.region.prefecture);
    if (!spotPref) continue;
    const existing = otherPrefsForFish.get(spotPref.slug);
    if (existing) {
      existing.count++;
    } else {
      otherPrefsForFish.set(spotPref.slug, {
        prefSlug: spotPref.slug,
        prefName: spotPref.name,
        count: 1,
      });
    }
  }
  const relatedPrefsForFish = Array.from(otherPrefsForFish.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // シーズン情報
  const seasonMonthNames = fish.seasonMonths
    .sort((a, b) => a - b)
    .map((m) => `${m}月`);
  const peakMonthNames = fish.peakMonths
    .sort((a, b) => a - b)
    .map((m) => `${m}月`);

  const pageUrl = `https://tsurispot.com/prefecture/${pref.slug}/fish/${fish.slug}`;
  const headline = `${pref.name}で${fish.name}が釣れるスポット・時期・釣り方【完全ガイド】`;
  const pageDescription = `${pref.name}で${fish.name}が釣れるおすすめスポット${spots.length}件を徹底紹介。ベストシーズン・おすすめ釣り方・初心者向け穴場スポットまで完全ガイド。`;

  // FAQ データ
  const faqItems = [
    {
      question: `${pref.name}で${fish.name}が釣れるスポットは何件ありますか？`,
      answer: `現在、${pref.name}で${fish.name}が釣れるスポットは${spots.length}件掲載しています。${methodBreakdown.length > 0 ? `主な釣り方は${methodBreakdown.slice(0, 3).map((m) => m.method).join("、")}です。` : ""}`,
    },
    {
      question: `${pref.name}で${fish.name}が釣れる時期はいつですか？`,
      answer: seasonMonthNames.length > 0
        ? `${pref.name}での${fish.name}のシーズンは${seasonMonthNames.join("・")}です。${peakMonthNames.length > 0 ? `特に${peakMonthNames.join("・")}が最盛期で、最も釣果が期待できます。` : ""}`
        : `${fish.name}の詳しいシーズン情報は各スポットページでご確認ください。`,
    },
    {
      question: `${pref.name}で${fish.name}を釣るにはどんな釣り方がおすすめですか？`,
      answer: methodBreakdown.length > 0
        ? `${pref.name}で${fish.name}を狙うなら、${methodBreakdown[0].method}が最も多く${methodBreakdown[0].count}件のスポットで実績があります。${methodBreakdown.length > 1 ? `他にも${methodBreakdown.slice(1, 3).map((m) => m.method).join("、")}でも狙えます。` : ""}各スポットの詳細ページで具体的な釣り方をご確認ください。`
        : `${fish.name}の釣り方の詳細は各スポットページでご確認ください。`,
    },
    {
      question: `${pref.name}で${fish.name}釣りの初心者におすすめのスポットはどこですか？`,
      answer: (() => {
        const easySpots = spotsWithCatchInfo.filter(({ catchInfo }) => catchInfo?.catchDifficulty === "easy").map(({ spot }) => spot.name);
        return easySpots.length > 0
          ? `${pref.name}で${fish.name}を初心者が狙うなら、${easySpots.slice(0, 3).join("・")}がおすすめです。比較的難易度が低く、足場も安定しているスポットです。${methodBreakdown.length > 0 ? `${methodBreakdown[0].method}から始めてみましょう。` : ""}`
          : `${pref.name}で${fish.name}を初心者が狙う場合は、堤防や漁港など足場が安定したスポットを選びましょう。${methodBreakdown.length > 0 ? `${methodBreakdown[0].method}なら初心者でも比較的釣りやすいです。` : ""}`;
      })(),
    },
  ];

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
        name: `${fish.name}の釣り情報`,
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

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${pref.name}で${fish.name}が釣れる釣り場`,
    numberOfItems: spots.length,
    itemListElement: spots.slice(0, 30).map((spot, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
  };

  const jsonLdArray = [breadcrumbJsonLd, articleJsonLd, faqJsonLd, itemListJsonLd];

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
          { label: `${fish.name}の釣り情報` },
        ]}
      />

      {/* 戻るリンク */}
      <Link
        href={`/prefecture/${pref.slug}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground min-h-[44px]"
      >
        <ChevronLeft className="size-4" />
        {pref.name}の釣り場一覧に戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {pref.name}で{fish.name}が釣れるスポット・時期・釣り方
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          おすすめスポット{spots.length}件｜初心者向け穴場から人気ポイントまで
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {pref.name}で{fish.name}が釣れるおすすめの釣り場を{spots.length}件ご紹介します。
          {seasonMonthNames.length > 0 && `釣れる時期は${seasonMonthNames.join("・")}。`}
          {peakMonthNames.length > 0 && `特に${peakMonthNames.join("・")}がベストシーズンで、初心者でも釣果が期待できます。`}
          {methodBreakdown.length > 0 && `おすすめの釣り方は${methodBreakdown.slice(0, 3).map((m) => m.method).join("・")}。`}
          近くの釣り場探しにもご活用ください。
        </p>
      </div>

      {/* シーズン・釣り方サマリ */}
      <section className="mb-6 sm:mb-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* シーズン情報 */}
          <Card className="gap-0 py-0">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Calendar className="size-4 text-primary" />
                {fish.name}のベストシーズン
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
              </div>
            </CardContent>
          </Card>

          {/* 釣り方 */}
          {methodBreakdown.length > 0 && (
            <Card className="gap-0 py-0">
              <CardContent className="p-4">
                <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <Target className="size-4 text-primary" />
                  {fish.name}のおすすめ釣り方
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {methodBreakdown.map(({ method, count }) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                      <span className="ml-1 text-muted-foreground">({count})</span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
        </div>
      </section>

      {/* スポット一覧 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <MapPin className="size-5 text-primary" />
          {pref.name}の{fish.name}おすすめ釣りスポット{spots.length}選
        </h2>

        {/* スポット詳細テーブル */}
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
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      </section>

      {/* 同じ県の他の魚種 */}
      {relatedFishInPref.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {pref.name}で釣れるその他のおすすめ魚種
          </h2>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {relatedFishInPref.map((f) => (
              <Link key={f.slug} href={`/prefecture/${pref.slug}/fish/${f.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                >
                  {f.name}
                  <span className="ml-1 text-muted-foreground">({f.count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 同じ魚種の他の県 */}
      {relatedPrefsForFish.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 text-base font-bold sm:text-lg">
            {fish.name}が釣れるその他の都道府県・おすすめエリア
          </h2>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {relatedPrefsForFish.map((p) => (
              <Link key={p.prefSlug} href={`/prefecture/${p.prefSlug}/fish/${fish.slug}`}>
                <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                  <CardContent className="p-3 sm:p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                      {p.prefName}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.count}スポット
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* よくある質問 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
          <HelpCircle className="size-5 text-primary" />
          {pref.name}の{fish.name}に関するよくある質問
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
            href={`/prefecture/${pref.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の釣り場
          </Link>
          <Link
            href={`/fish/${fish.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {fish.name}の釣り方
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
