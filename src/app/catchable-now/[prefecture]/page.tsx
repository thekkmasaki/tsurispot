import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import {
  MapPin,
  Fish,
  Calendar,
  ChevronLeft,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { RelatedPseoLinks } from "@/components/seo/related-pseo-links";
import { toListSpot } from "@/lib/data/list-spot";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { adjacentPrefectures } from "@/lib/data/prefecture-info";
import { fishingSpots } from "@/lib/data/spots";
import { MATRIX_MIN_SPOTS } from "@/lib/data";
import { MONTHS, isMonthInRange } from "@/lib/data/fishing-methods";
import { InArticleAd } from "@/components/ads/ad-unit";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";
import { SeasonalAffiliateSection } from "@/components/seasonal-affiliate-section";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo/article-jsonld";

type PageProps = {
  params: Promise<{ prefecture: string }>;
};

// 「今釣れる」は月替わりで内容が変わる。日次 ISR で月境界を跨いでも
// 最大1日で追従させる（force-dynamic はオリジン CPU を食うため使わない）。
export const revalidate = 86400;

export function generateStaticParams() {
  return prefectures.map((pref) => ({ prefecture: pref.slug }));
}

/**
 * この県・この月の「釣れる魚」「おすすめスポット」を集計。
 * generateMetadata と本体の二重集計を react cache() で 1 回にまとめる。
 * uniqueSpotCount はマトリクス（県×月×魚種）ページへのリンク適格判定用
 * （エントリ数カウントだと 301 先へリンクする事故が起きるため必ずユニーク数で判定）。
 */
const getNowAggregates = cache((prefName: string, monthNum: number) => {
  const prefSpots = fishingSpots.filter((s) => s.region.prefecture === prefName);

  const fishCountMap = new Map<
    string,
    {
      slug: string;
      name: string;
      isPeak: boolean;
      uniqueSpotCount: number;
      methods: Map<string, number>;
    }
  >();
  for (const spot of prefSpots) {
    const seenInSpot = new Set<string>();
    for (const cf of spot.catchableFish) {
      if (isMonthInRange(monthNum, cf.monthStart, cf.monthEnd)) {
        const existing = fishCountMap.get(cf.fish.slug);
        if (existing) {
          if (cf.peakSeason) existing.isPeak = true;
          existing.methods.set(cf.method, (existing.methods.get(cf.method) || 0) + 1);
        } else {
          fishCountMap.set(cf.fish.slug, {
            slug: cf.fish.slug,
            name: cf.fish.name,
            isPeak: cf.peakSeason,
            uniqueSpotCount: 0,
            methods: new Map([[cf.method, 1]]),
          });
        }
        seenInSpot.add(cf.fish.slug);
      }
    }
    for (const fSlug of seenInSpot) {
      const entry = fishCountMap.get(fSlug);
      if (entry) entry.uniqueSpotCount++;
    }
  }
  const catchableFishList = Array.from(fishCountMap.values()).sort((a, b) => {
    if (a.isPeak !== b.isPeak) return a.isPeak ? -1 : 1;
    return b.uniqueSpotCount - a.uniqueSpotCount;
  });

  const spotsWithMatchCount = prefSpots
    .map((spot) => ({
      spot,
      matchCount: spot.catchableFish.filter((cf) =>
        isMonthInRange(monthNum, cf.monthStart, cf.monthEnd)
      ).length,
    }))
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return b.spot.rating - a.spot.rating;
    });

  const methodMap = new Map<string, number>();
  for (const f of catchableFishList) {
    for (const [m, c] of f.methods) {
      methodMap.set(m, (methodMap.get(m) || 0) + c);
    }
  }
  const topMethods = Array.from(methodMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([m]) => m);

  return { catchableFishList, spotsWithMatchCount, topMethods };
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  // 無効 slug は 404 ではなく必ず存在する全国版へ 301（h1 なし 200 描画を防ぐ）
  if (!pref) permanentRedirect("/catchable-now");

  const month = MONTHS[new Date().getMonth()];
  const { catchableFishList, spotsWithMatchCount } = getNowAggregates(
    pref.name,
    month.num
  );
  const peakFish = catchableFishList.filter((f) => f.isPeak);
  const topFishNames = catchableFishList.slice(0, 3).map((f) => f.name);

  const title = `${pref.name}で今釣れる魚【${month.name}最新】旬の魚と釣れるスポット`;
  const description = `${pref.name}で今（${month.name}）釣れる魚${catchableFishList.length}種を旬・シーズン別に紹介。${topFishNames.join("・")}${peakFish.length > 0 ? `など旬の魚${peakFish.length}種` : "など"}が狙い目。実績スポット${spotsWithMatchCount.length}件から今週末に行ける釣り場が見つかります。`;

  const pageUrl = `https://tsurispot.com/catchable-now/${pref.slug}`;
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
          url: `https://tsurispot.com/api/og?title=${encodeURIComponent(`${pref.name}で今釣れる魚【${month.name}】`)}&emoji=%F0%9F%90%9F`,
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

export default async function CatchableNowPrefecturePage({
  params,
}: PageProps) {
  const { prefecture } = await params;
  const pref = getPrefectureBySlug(prefecture);
  if (!pref) permanentRedirect("/catchable-now");

  const month = MONTHS[new Date().getMonth()];
  const { catchableFishList, spotsWithMatchCount, topMethods } =
    getNowAggregates(pref.name, month.num);

  const peakFishList = catchableFishList.filter((f) => f.isPeak);
  const seasonFishList = catchableFishList.filter((f) => !f.isPeak);
  const topSpots = spotsWithMatchCount.slice(0, 9);

  // 魚リンク先: マトリクス配信確定（ユニークスポット数 >= MATRIX_MIN_SPOTS）なら
  // 県×月×魚種の詳細ガイドへ、それ未満は県×魚種ページへ（1件以上あれば必ず配信される）
  const fishHref = (f: { slug: string; uniqueSpotCount: number }) =>
    f.uniqueSpotCount >= MATRIX_MIN_SPOTS
      ? `/prefecture/${pref.slug}/${month.slug}/${f.slug}`
      : `/prefecture/${pref.slug}/fish/${f.slug}`;

  // 隣接県の「今釣れる」（回遊・クロールパス）
  const neighborPrefs = (adjacentPrefectures[pref.slug] ?? [])
    .map((slug) => prefectures.find((p) => p.slug === slug))
    .filter((p): p is (typeof prefectures)[number] => Boolean(p));

  // アフィリエイト（釣り方×月×県の文脈マッチ）
  const recommendedProducts = getRelevantAffiliateProducts(
    topMethods,
    month.num,
    3,
    false,
    pref.name
  );

  const pageUrl = `https://tsurispot.com/catchable-now/${pref.slug}`;

  // FAQ（実データのみ・捏造なし）
  const faqItems = [
    {
      question: `${pref.name}で今（${month.name}）釣れる魚は何ですか？`,
      answer:
        catchableFishList.length > 0
          ? `${pref.name}では${month.name}に${catchableFishList.length}種の魚が狙えます。${peakFishList.length > 0 ? `特に${peakFishList.slice(0, 5).map((f) => f.name).join("・")}は今が旬で、最も釣果が期待できます。` : `${catchableFishList.slice(0, 5).map((f) => f.name).join("・")}などが実績があります。`}`
          : `${pref.name}の${month.name}の釣果情報は各スポットページでご確認ください。`,
    },
    {
      question: `${pref.name}で${month.name}におすすめの釣り場はどこですか？`,
      answer:
        topSpots.length > 0
          ? `${month.name}の${pref.name}では${spotsWithMatchCount.length}件のスポットで釣果が期待できます。中でも${topSpots.slice(0, 3).map(({ spot }) => spot.name).join("・")}は狙える魚種が多くおすすめです。`
          : `${pref.name}のスポット情報は県ページでご確認ください。`,
    },
    {
      question: `${pref.name}の${month.name}はどんな釣り方が良いですか？`,
      answer:
        topMethods.length > 0
          ? `${month.name}の${pref.name}では${topMethods.slice(0, 3).join("・")}の実績が多く報告されています。狙う魚種に合わせて選びましょう。`
          : `釣り方の詳細は各スポットページでご確認ください。`,
    },
  ];

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "ホーム", url: "https://tsurispot.com" },
    { name: "今釣れる魚", url: "https://tsurispot.com/catchable-now" },
    { name: `${pref.name}で今釣れる魚`, url: pageUrl },
  ]);
  const faqJsonLd = buildFaqJsonLd(faqItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <Breadcrumb
          items={[
            { label: "今釣れる魚", href: "/catchable-now" },
            { label: pref.name },
          ]}
        />

        {/* ヘッダー */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-xl font-bold sm:text-2xl lg:text-3xl">
            {pref.name}で今釣れる魚【{month.name}最新】
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {pref.name}で今（{month.name}）釣れる魚{catchableFishList.length}種を
            旬・シーズン別に紹介。
            {peakFishList.length > 0 &&
              `今が旬の魚は${peakFishList.length}種。`}
            実績のあるスポット{spotsWithMatchCount.length}件から、今週末に行ける
            釣り場がすぐ見つかります。
          </p>
        </div>

        {/* 旬の魚 */}
        {peakFishList.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
              <Sparkles className="size-5 text-amber-500" />
              {month.name}が旬の魚（最盛期）
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {peakFishList.slice(0, 12).map((f) => (
                <Link prefetch={false} key={f.slug} href={fishHref(f)}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="p-3 sm:p-4">
                      <div className="mb-1 flex items-center gap-1.5">
                        <Fish className="size-4 shrink-0 text-primary" />
                        <h3 className="text-sm font-semibold group-hover:text-primary sm:text-base">
                          {f.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pref.name}のスポット{f.uniqueSpotCount}件・今が旬
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* シーズン中の魚 */}
        {seasonFishList.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
              <Fish className="size-5 text-primary" />
              {month.name}にシーズン中の魚
            </h2>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {seasonFishList.slice(0, 24).map((f) => (
                <Link prefetch={false} key={f.slug} href={fishHref(f)}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-2.5 py-1.5 text-xs transition-colors hover:bg-primary hover:text-primary-foreground sm:text-sm"
                  >
                    {f.name}（{f.uniqueSpotCount}件）
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        <InArticleAd />

        {/* 今月のおすすめスポット */}
        {topSpots.length > 0 && (
          <section className="mb-8 sm:mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
              <MapPin className="size-5 text-primary" />
              {month.name}の{pref.name}おすすめ釣りスポット
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {topSpots.map(({ spot }) => (
                <SpotCard key={spot.id} spot={toListSpot(spot)} />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                prefetch={false}
                href={`/prefecture/${pref.slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MapPin className="size-4" />
                {pref.name}の全スポットを見る
              </Link>
            </div>
          </section>
        )}

        {/* この月を深掘り */}
        <RelatedPseoLinks
          title={`${pref.name}の${month.name}の釣りを深掘り`}
          links={[
            {
              href: `/prefecture/${pref.slug}/${month.slug}`,
              label: `${pref.name}の${month.name}の釣り完全ガイド`,
              sublabel: "釣れる魚・スポット・水温",
            },
            {
              href: `/prefecture/${pref.slug}`,
              label: `${pref.name}の釣りスポット一覧`,
              sublabel: "県内の全スポット",
            },
            {
              href: `/monthly/${month.slug}`,
              label: `${month.name}の釣り全国ガイド`,
              sublabel: "全国の旬の魚と釣り方",
            },
            {
              href: "/catchable-now",
              label: "今釣れる魚（全国版）",
              sublabel: "旬の魚を全国から探す",
            },
          ]}
        />

        {/* 季節のおすすめ商品（アフィリエイト） */}
        {recommendedProducts.length > 0 && (
          <SeasonalAffiliateSection
            products={recommendedProducts}
            seasonLabel={month.name}
            regionName={pref.name}
          />
        )}

        {/* 近隣県の今釣れる */}
        {neighborPrefs.length > 0 && (
          <RelatedPseoLinks
            title="近隣県で今釣れる魚"
            links={neighborPrefs.map((p) => ({
              href: `/catchable-now/${p.slug}`,
              label: `${p.name}で今釣れる魚`,
              sublabel: `${month.name}の旬の魚`,
            }))}
          />
        )}

        {/* よくある質問 */}
        <section className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold sm:text-lg">
            <HelpCircle className="size-5 text-primary" />
            {pref.name}の今釣れる魚に関するよくある質問
          </h2>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <Card key={idx} className="gap-0 py-0">
                <CardContent className="p-4">
                  <h3 className="mb-2 text-sm font-bold sm:text-base">
                    Q. {item.question}
                  </h3>
                  <p className="text-sm text-muted-foreground">A. {item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 戻る導線 */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            prefetch={false}
            href="/catchable-now"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <ChevronLeft className="size-4" />
            今釣れる魚（全国版）へ
          </Link>
          <Link
            prefetch={false}
            href={`/prefecture/${pref.slug}`}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <Calendar className="size-4" />
            {pref.name}の釣りスポット一覧へ
          </Link>
        </div>
      </div>
    </>
  );
}
