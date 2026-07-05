import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Fish, Calendar, Target, ChevronLeft, HelpCircle, Clock, Utensils, Sparkles, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { SeasonalAffiliateSection } from "@/components/seasonal-affiliate-section";
import { toListSpot } from "@/lib/data/list-spot";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { getFishBySlug } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import { getSpotsByPrefectureAndFish, getEligiblePrefFishCombos } from "@/lib/data";
import { FISHING_METHODS } from "@/lib/data/fishing-methods";
import { REGION_GROUPS } from "@/lib/data/regions-group";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";
import { buildPrefFishDescription } from "@/lib/seo/meta-description";
import {
  generateContextMethodBrief,
  generateTimeAdvice,
  getRegionGroup,
  REGION_CLIMATE,
  FISH_TIPS,
} from "@/lib/utils/spot-content-generator";
import {
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildItemListJsonLd,
  buildHowToJsonLd,
} from "@/lib/seo/article-jsonld";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";

type PageProps = {
  params: Promise<{ slug: string; fishSlug: string }>;
};

export function generateStaticParams() {
  // 実在する全ての (都道府県, 魚種) 組み合わせを完全列挙して SSG で事前生成する。
  // 「上位300のみ生成 + 残りオンデマンド」という部分プリレンダ構成が build 時の空HTML焼き付きの
  // 原因だったため、force-dynamic を廃し、fish/[slug] と同じ「完全列挙 → 静的」パターンに統一する。
  // これにより TTFB が改善し、クロール効率が上がる。
  // count>=3 はインデックス対象（sitemap掲載）、1-2件は noindex だが内部リンク到達用に事前生成する。
  return getEligiblePrefFishCombos(1).map(({ prefSlug, fishSlug }) => ({
    slug: prefSlug,
    fishSlug,
  }));
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
  const metaMethodMap = new Map<string, number>();
  for (const spot of spots) {
    const cf = spot.catchableFish.find((c) => c.fish.slug === fishSlug);
    if (cf) metaMethodMap.set(cf.method, (metaMethodMap.get(cf.method) || 0) + 1);
  }
  const metaTopMethods = Array.from(metaMethodMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => m);
  // 初心者向け（難易度やさしい）スポット数を実データから集計し、description の訴求に使う（CTR向上・捏造なし）
  const metaEasyCount = spots.filter((s) => {
    const cf = s.catchableFish.find((c) => c.fish.slug === fishSlug);
    return cf?.catchDifficulty === "easy";
  }).length;

  // 最盛期月・スポット件数を前方配置してCTRを上げる（noindexの薄ページ<3件は汎用titleにフォールバック）
  const metaPeakLabel = metaPeakMonths.slice(0, 2).join("・");
  const metaCountLabel = spots.length >= 3 ? `${spots.length}選` : "";
  const title = metaPeakLabel
    ? `${pref.name}の${fish.name}釣りスポット${metaCountLabel}｜${metaPeakLabel}が最盛期・釣り方`
    : `${pref.name}で${fish.name}が釣れるスポット・時期・釣り方`;
  // 実績スポット名（rating 順上位）を description に加えて一意性・情報量を高める
  const metaTopSpotNames = [...spots]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2)
    .map((s) => s.name);
  const description = buildPrefFishDescription({
    prefName: pref.name,
    fishName: fish.name,
    spotCount: spots.length,
    topSpotNames: metaTopSpotNames,
    peakMonths: metaPeakMonths,
    topMethods: metaTopMethods,
    easyCount: metaEasyCount,
  });

  return {
    title,
    description,
    // スポット3件未満の薄ページは noindex（クロールは follow）。sitemap/内部リンクのしきい値と統一。
    robots: { index: spots.length >= 3, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/prefecture/${slug}/fish/${fishSlug}`,
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

  // ── 強化セクション用データ（攻略・タックル・時期・アフィリ・クロスリンク） ──
  // 代表スポット（攻略・時間帯アドバイスの文脈用に、掲載順トップのスポットを使う）
  const representativeSpot = spotsWithCatchInfo[0]?.spot ?? spots[0];
  // 地域気候（intro/攻略のローカライズ用）
  const climateText = REGION_CLIMATE[getRegionGroup(pref.name)];
  // ビルド時点の月（アフィリエイトの季節マッチング用の近似値）
  const buildMonth = new Date().getMonth() + 1;

  // 攻略法プロ―ズ：上位メソッドごとに文脈ブリーフ + 魚のタックル/コツを合成
  const attackMethods = methodBreakdown.slice(0, 2).map(({ method, count }) => {
    const fm = fish.fishingMethods?.find(
      (m) => m.methodName === method || method.includes(m.methodName) || m.methodName.includes(method)
    );
    return {
      method,
      count,
      brief: generateContextMethodBrief(method, representativeSpot),
      tackle: fm?.tackle,
      tips: fm?.tips ?? [],
    };
  });
  const fishTip = FISH_TIPS[fish.name];

  // HowTo 手順：代表メソッドの tips（無ければ魚の基本釣法 tips）から
  const howToSource = attackMethods[0]?.tips.length
    ? attackMethods[0].tips
    : (fish.fishingMethods?.[0]?.tips ?? []);
  const howToSteps = howToSource.slice(0, 5).map((t, i) => ({
    name: `ステップ${i + 1}`,
    text: t,
  }));

  // 時間帯アドバイス（朝/夕/夜マヅメ）
  const timeAdvice = generateTimeAdvice(representativeSpot);

  // 魚×釣法連動アフィリエイト（県名・魚名で文脈スコアリング）
  const affiliateProducts = getRelevantAffiliateProducts(
    methodBreakdown.map((m) => m.method),
    buildMonth,
    3,
    false,
    pref.name,
    [fish.name]
  );

  // 月別ベストタイミング（◎最盛期 / ○シーズン / —オフ）
  const peakSet = new Set(fish.peakMonths);
  const seasonSet = new Set(fish.seasonMonths);
  const monthTimeline = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const level: "peak" | "season" | "off" = peakSet.has(m)
      ? "peak"
      : seasonSet.has(m)
      ? "season"
      : "off";
    return { month: m, level };
  });

  // クロスリンク（県×魚 → 釣法×地域）：代表メソッドを実在の FISHING_METHODS slug に解決
  const topMethodName = methodBreakdown[0]?.method;
  const topMethodDef = topMethodName
    ? FISHING_METHODS.find(
        (fm) =>
          fm.name === topMethodName ||
          fm.methods.some((mm) => mm === topMethodName || topMethodName.includes(mm))
      )
    : undefined;
  const areaRegionGroup = REGION_GROUPS.find((rg) => rg.prefectures.includes(pref.name));

  // シーズン情報
  const seasonMonthNames = fish.seasonMonths
    .sort((a, b) => a - b)
    .map((m) => `${m}月`);
  const peakMonthNames = fish.peakMonths
    .sort((a, b) => a - b)
    .map((m) => `${m}月`);

  // FAQ用の統計（答えファースト＋数値根拠の強化に使用。実データのみ・ゼロ除算ガード付き）
  const easySpotNames = spotsWithCatchInfo
    .filter(({ catchInfo }) => catchInfo?.catchDifficulty === "easy")
    .map(({ spot }) => spot.name);
  const easyCount = easySpotNames.length;
  const easyPct = spots.length > 0 ? Math.round((easyCount / spots.length) * 100) : 0;
  const topMethod = methodBreakdown[0];
  const topMethodPct = topMethod && spots.length > 0 ? Math.round((topMethod.count / spots.length) * 100) : 0;
  const seasonLen = fish.seasonMonths.length;
  const peakLen = fish.peakMonths.length;
  const peakRatio = seasonLen > 0 ? Math.round((peakLen / seasonLen) * 100) : 0;

  const pageUrl = `https://tsurispot.com/prefecture/${pref.slug}/fish/${fish.slug}`;
  const headline = `${pref.name}で${fish.name}が釣れるスポット・時期・釣り方【完全ガイド】`;
  const pageDescription = `${pref.name}で${fish.name}が釣れるおすすめスポット${spots.length}件を徹底紹介。ベストシーズン・おすすめ釣り方・初心者向け穴場スポットまで完全ガイド。`;

  // FAQ データ
  const faqItems = [
    {
      question: `${pref.name}で${fish.name}が釣れるスポットは何件ありますか？`,
      answer: `${pref.name}で${fish.name}が釣れるスポットは${spots.length}件です。${easyCount > 0 ? `うち初心者向け（難易度やさしい）が${easyCount}件（${easyPct}%）あります。` : ""}${methodBreakdown.length > 0 ? `主な釣り方は${methodBreakdown.slice(0, 3).map((m) => m.method).join("、")}です。` : ""}`,
    },
    {
      question: `${pref.name}で${fish.name}が釣れる時期はいつですか？`,
      answer: seasonMonthNames.length > 0
        ? `${pref.name}での${fish.name}のシーズンは${seasonMonthNames.join("・")}の${seasonLen}ヶ月間です。${peakMonthNames.length > 0 ? `特に${peakMonthNames.join("・")}（${peakLen}ヶ月）が最盛期で、最も釣果が期待できます。` : ""}`
        : `${fish.name}の詳しいシーズン情報は各スポットページでご確認ください。`,
    },
    {
      question: `${pref.name}で${fish.name}を釣るにはどんな釣り方がおすすめですか？`,
      answer: methodBreakdown.length > 0 && topMethod
        ? `${pref.name}で${fish.name}を狙うなら${topMethod.method}が最有力で、掲載${spots.length}件中${topMethod.count}件（${topMethodPct}%）のスポットで実績があります。${methodBreakdown.length > 1 ? `次いで${methodBreakdown.slice(1, 3).map((m) => `${m.method}${m.count}件`).join("、")}でも狙えます。` : ""}`
        : `${fish.name}の釣り方の詳細は各スポットページでご確認ください。`,
    },
    {
      question: `${pref.name}で${fish.name}釣りの初心者におすすめのスポットはどこですか？`,
      answer: easyCount > 0
        ? `${pref.name}で${fish.name}を狙える初心者向け（難易度やさしい）スポットは${easyCount}件（全${spots.length}件中${easyPct}%）あります。中でも${easySpotNames.slice(0, 3).join("・")}は足場が安定しておすすめです。${topMethod ? `${topMethod.method}から始めてみましょう。` : ""}`
        : `${pref.name}で${fish.name}を初心者が狙う場合は、堤防や漁港など足場が安定したスポットを選びましょう。${topMethod ? `${topMethod.method}なら初心者でも比較的釣りやすいです。` : ""}`,
    },
    {
      question: `${pref.name}で${fish.name}は何月がベストシーズンですか？`,
      answer:
        peakMonthNames.length > 0
          ? `${pref.name}での${fish.name}のベストシーズンは${peakMonthNames.join("・")}の${peakLen}ヶ月です。${seasonLen > 0 ? `シーズン全体${seasonLen}ヶ月のうち約${peakRatio}%がこの最盛期にあたり、水温と活性が合うこの時期が最も釣果を期待できます。` : ""}`
          : seasonMonthNames.length > 0
          ? `${pref.name}での${fish.name}のシーズンは${seasonMonthNames.join("・")}の${seasonLen}ヶ月間です。`
          : `${fish.name}のシーズンは各スポットの詳細ページでご確認ください。`,
    },
    {
      question: `${pref.name}で${fish.name}を釣るのに必要なタックル・仕掛けは？`,
      answer: attackMethods[0]?.tackle
        ? `${attackMethods[0].method}の場合、ロッドは${attackMethods[0].tackle.rod}、リールは${attackMethods[0].tackle.reel}、ライン${attackMethods[0].tackle.line}が目安です。仕掛け・ルアーは${attackMethods[0].tackle.hookOrLure}を用意しましょう。`
        : `${fish.name}を狙うなら、釣り方に合わせた竿・リール・仕掛けを準備しましょう。各スポットの詳細ページで具体的なタックルを確認できます。`,
    },
    {
      question: `${fish.name}はどんな食べ方・料理がおすすめですか？`,
      answer:
        fish.cookingTips.length > 0
          ? `${fish.name}は${fish.cookingTips.slice(0, 3).join("、")}などで美味しく食べられます。${fish.tasteRating >= 4 ? "食味の評価も高く、釣って楽しい・食べて美味しい人気の魚です。" : ""}`
          : `${fish.name}は塩焼きや煮付けなど、シンプルな調理で美味しく食べられます。新鮮なうちに血抜き・冷却をしておくと、より美味しくいただけます。`,
    },
  ];

  // JSON-LD（共通ビルダーに統一）
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "ホーム", url: "https://tsurispot.com" },
    { name: "都道府県一覧", url: "https://tsurispot.com/prefecture" },
    { name: pref.name, url: `https://tsurispot.com/prefecture/${pref.slug}` },
    { name: `${fish.name}の釣り情報`, url: pageUrl },
  ]);

  const articleJsonLd = buildArticleJsonLd({
    headline,
    description: pageDescription,
    url: pageUrl,
    datePublished: "2025-01-01",
  });

  const faqJsonLd = buildFaqJsonLd(faqItems);

  const itemListJsonLd = buildItemListJsonLd({
    name: `${pref.name}で${fish.name}が釣れる釣り場`,
    items: spots.slice(0, 30).map((spot) => ({
      name: spot.name,
      url: `https://tsurispot.com/spots/${spot.slug}`,
    })),
    numberOfItems: spots.length,
  });

  // HowTo（釣り方が取得できた場合のみ）
  const howToJsonLd =
    howToSteps.length > 0
      ? buildHowToJsonLd({
          name: `${pref.name}で${fish.name}を${attackMethods[0]?.method ?? "釣る"}方法`,
          description: `${pref.name}で${fish.name}を狙うための${attackMethods[0]?.method ?? "釣り"}の手順とコツ。`,
          steps: howToSteps,
        })
      : null;

  const jsonLdArray = [
    breadcrumbJsonLd,
    articleJsonLd,
    faqJsonLd,
    itemListJsonLd,
    ...(howToJsonLd ? [howToJsonLd] : []),
  ];

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
      <Link prefetch={false}
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
          {climateText && `${pref.name}は${climateText}。`}
          このページでは{pref.name}の{fish.name}が狙えるスポット一覧に加え、釣り方の攻略法・月別のベストタイミング・時間帯のコツ・おすすめタックル
          {fish.cookingTips.length > 0 && "・美味しい食べ方"}まで、現地の釣行に役立つ情報をまとめています。近くの釣り場探しにもご活用ください。
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

      {/* 釣り方の攻略法 */}
      {attackMethods.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Compass className="size-5 text-primary" />
            {pref.name}で{fish.name}を釣る方法・攻略法
          </h2>
          <div className="space-y-4">
            {attackMethods.map((am) => (
              <Card key={am.method} className="gap-0 py-0">
                <CardContent className="space-y-2 p-4">
                  <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold sm:text-base">
                    <Badge variant="outline" className="text-xs">{am.method}</Badge>
                    <span className="text-xs font-normal text-muted-foreground">
                      {pref.name}内{am.count}スポットで実績
                    </span>
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{am.brief}。</p>
                  {am.tips.length > 0 && (
                    <ul className="ml-4 list-disc space-y-0.5 text-sm text-muted-foreground">
                      {am.tips.slice(0, 3).map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  )}
                  {am.tackle && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">推奨タックル:</span> ロッド {am.tackle.rod}／リール {am.tackle.reel}／ライン {am.tackle.line}／{am.tackle.hookOrLure}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {fishTip && (
              <p className="flex items-start gap-1.5 text-sm leading-relaxed text-muted-foreground">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <span><span className="font-medium text-foreground">{fish.name}のワンポイント:</span> {fishTip}</span>
              </p>
            )}
          </div>
        </section>
      )}

      {/* 月別ベストタイミング・時間帯 */}
      <section className="mb-8 sm:mb-10">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
          <Calendar className="size-5 text-primary" />
          {pref.name}で{fish.name}が釣れる時期・時間帯
        </h2>
        <div className="grid grid-cols-12 gap-1 text-center">
          {monthTimeline.map(({ month, level }) => (
            <div key={month} className="flex flex-col items-center rounded-md border py-1.5">
              <span className="text-[10px] text-muted-foreground">{month}月</span>
              <span
                className={`text-sm font-bold ${
                  level === "peak"
                    ? "text-orange-500"
                    : level === "season"
                    ? "text-primary"
                    : "text-muted-foreground/40"
                }`}
              >
                {level === "peak" ? "◎" : level === "season" ? "○" : "—"}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">◎ 最盛期 ・ ○ シーズン ・ — オフシーズン</p>
        {timeAdvice && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-muted/40 p-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-muted-foreground">{timeAdvice}</p>
          </div>
        )}
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
                    <Link prefetch={false}
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
            <SpotCard key={spot.id} spot={toListSpot(spot)} />
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
              <Link prefetch={false} key={f.slug} href={`/prefecture/${pref.slug}/fish/${f.slug}`}>
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
              <Link prefetch={false} key={p.prefSlug} href={`/prefecture/${p.prefSlug}/fish/${fish.slug}`}>
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

      {/* 食べ方・料理 */}
      {fish.cookingTips.length > 0 && (
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
            <Utensils className="size-5 text-primary" />
            釣れた{fish.name}の美味しい食べ方
          </h2>
          <Card className="gap-0 py-0">
            <CardContent className="space-y-2 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                {fish.name}は食味の評価が5段階中{fish.tasteRating}。
                {fish.cookingTips.slice(0, 4).join("、")}など、さまざまな料理で楽しめます。
              </p>
              <p className="text-xs">
                釣った{fish.name}は、新鮮なうちに血抜き・冷却をしておくとより美味しくいただけます。
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {/* おすすめ装備（アフィリエイト） */}
      <SeasonalAffiliateSection
        products={affiliateProducts}
        seasonLabel={`${pref.name}の${fish.name}`}
        regionName=""
      />

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
          <Link prefetch={false}
            href={`/prefecture/${pref.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {pref.name}の釣り場
          </Link>
          <Link prefetch={false}
            href={`/fish/${fish.slug}`}
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {fish.name}の釣り方
          </Link>
          {topMethodDef && areaRegionGroup && (
            <Link prefetch={false}
              href={`/fishing/${topMethodDef.slug}/area/${areaRegionGroup.slug}`}
              className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
            >
              {areaRegionGroup.name}の{topMethodDef.name}
            </Link>
          )}
          <Link prefetch={false}
            href="/prefecture"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            都道府県から探す
          </Link>
          <Link prefetch={false}
            href="/fish"
            className="rounded-full border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            魚種から探す
          </Link>
          <Link prefetch={false}
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
