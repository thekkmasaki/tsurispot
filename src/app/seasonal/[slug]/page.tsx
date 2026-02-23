import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  MapPin,
  Wrench,
  Lightbulb,
  AlertTriangle,
  ListOrdered,
  HelpCircle,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotCard } from "@/components/spots/spot-card";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { seasonalGuides } from "@/lib/data/seasonal-guides";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return seasonalGuides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = seasonalGuides.find((g) => g.slug === slug);
  if (!guide) return { title: "ページが見つかりません" };

  const title = `${guide.season}の${guide.method}完全ガイド【2026年版】| ツリスポ`;
  const description = `${guide.season}の${guide.method}を徹底解説。${guide.description.slice(0, 100)}...おすすめスポット・必要な道具・釣り方のコツまで網羅。`;

  return {
    title,
    description,
    openGraph: {
      title: `${guide.season}の${guide.method}完全ガイド【2026年版】`,
      description,
      type: "article",
      url: `https://tsurispot.com/seasonal/${guide.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/seasonal/${guide.slug}`,
    },
  };
}

const SEASON_COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  "冬": { bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-200 dark:border-blue-900", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  "春": { bg: "bg-pink-50 dark:bg-pink-950", border: "border-pink-200 dark:border-pink-900", text: "text-pink-600", badge: "bg-pink-100 text-pink-700" },
  "夏": { bg: "bg-orange-50 dark:bg-orange-950", border: "border-orange-200 dark:border-orange-900", text: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
  "秋": { bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-200 dark:border-amber-900", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
};

export default async function SeasonalGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const guide = seasonalGuides.find((g) => g.slug === slug);
  if (!guide) notFound();

  const color = SEASON_COLOR[guide.season] ?? SEASON_COLOR["春"];

  // 対象月に釣れる魚を取得
  const targetFishData = guide.targetFish
    .map((fishSlug) => fishSpecies.find((f) => f.slug === fishSlug))
    .filter(Boolean);

  // おすすめスポットを取得: spotTypeが一致し、対象月にcatchableFishがあるスポットをrating順
  const recommendedSpots = fishingSpots
    .filter((spot) => {
      const typeMatch = guide.spotTypes.includes(spot.spotType);
      if (!typeMatch) return false;
      const hasFishInSeason = spot.catchableFish.some((cf) => {
        const cfMonths: number[] = [];
        if (cf.monthStart <= cf.monthEnd) {
          for (let m = cf.monthStart; m <= cf.monthEnd; m++) cfMonths.push(m);
        } else {
          for (let m = cf.monthStart; m <= 12; m++) cfMonths.push(m);
          for (let m = 1; m <= cf.monthEnd; m++) cfMonths.push(m);
        }
        return guide.months.some((gm) => cfMonths.includes(gm));
      });
      return hasFishInSeason;
    })
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  // 関連する季節特集
  const relatedGuides = guide.relatedSlugs
    .map((rs) => seasonalGuides.find((g) => g.slug === rs))
    .filter(Boolean);

  // JSON-LD: BreadcrumbList
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
        name: "季節別釣りガイド",
        item: "https://tsurispot.com/seasonal",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: guide.title,
        item: `https://tsurispot.com/seasonal/${guide.slug}`,
      },
    ],
  };

  // JSON-LD: FAQPage
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  // JSON-LD: HowTo
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `${guide.season}の${guide.method}の手順`,
    description: guide.description,
    step: guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
    })),
  };

  const monthLabels = guide.months.map((m) => `${m}月`).join("・");

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />

      <main className="container mx-auto max-w-4xl px-4 py-6 sm:py-12">
        {/* パンくず */}
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "季節別釣りガイド", href: "/seasonal" },
            { label: guide.title },
          ]}
        />

        {/* ヘッダー */}
        <div className={`mb-8 rounded-xl border-2 ${color.border} ${color.bg} p-5 sm:p-8`}>
          <div className="text-center">
            <Badge className={`mb-3 ${color.badge}`}>
              <Calendar className="mr-1 size-3" />
              {monthLabels}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {guide.season}の{guide.method}完全ガイド
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {guide.description}
            </p>
          </div>
        </div>

        {/* 目次 */}
        <nav className="mb-8 rounded-lg border bg-muted/30 p-4">
          <p className="mb-2 text-sm font-bold">目次</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li><a href="#fish" className="hover:text-primary">この時期に釣れる魚</a></li>
            <li><a href="#spots" className="hover:text-primary">おすすめスポット</a></li>
            <li><a href="#gear" className="hover:text-primary">必要な道具・仕掛け</a></li>
            <li><a href="#steps" className="hover:text-primary">釣り方の手順</a></li>
            <li><a href="#tips" className="hover:text-primary">釣り方のコツ</a></li>
            <li><a href="#cautions" className="hover:text-primary">注意点</a></li>
            <li><a href="#faq" className="hover:text-primary">よくある質問</a></li>
            <li><a href="#related" className="hover:text-primary">関連ページ</a></li>
          </ul>
        </nav>

        {/* この時期に釣れる魚 */}
        <section id="fish" className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Fish className={`size-5 ${color.text}`} />
            この時期に釣れる魚
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {targetFishData.map((fish) =>
              fish ? (
                <Link key={fish.slug} href={`/fish/${fish.slug}`}>
                  <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Fish className="size-5 shrink-0 text-sky-400" />
                      <div className="min-w-0">
                        <p className="font-semibold group-hover:text-primary">
                          {fish.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {fish.description.slice(0, 40)}...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : null
            )}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            <Link href="/catchable-now" className="text-primary hover:underline">
              今釣れる魚をもっと見る
            </Link>
          </p>
        </section>

        {/* おすすめスポット */}
        <section id="spots" className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <MapPin className={`size-5 ${color.text}`} />
            おすすめスポット
          </h2>
          {recommendedSpots.length > 0 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {recommendedSpots.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  href="/spots"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  全てのスポットを見る
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              条件に合うスポットが見つかりませんでした。
              <Link href="/spots" className="text-primary hover:underline">
                全スポット一覧
              </Link>
              から探してみてください。
            </p>
          )}
        </section>

        {/* 必要な道具・仕掛け */}
        <section id="gear" className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Wrench className={`size-5 ${color.text}`} />
            必要な道具・仕掛け
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {guide.gear.map((item) => (
              <Card key={item.name} className="gap-0 py-0">
                <CardContent className="p-4">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            <Link href="/beginner-checklist" className="text-primary hover:underline">
              持ち物チェックリストも確認する
            </Link>
          </p>
        </section>

        {/* 釣り方の手順 */}
        <section id="steps" className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <ListOrdered className={`size-5 ${color.text}`} />
            釣り方の手順
          </h2>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 sm:p-6">
              <ol className="list-none space-y-4">
                {guide.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </section>

        {/* 釣り方のコツ */}
        <section id="tips" className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Lightbulb className={`size-5 ${color.text}`} />
            釣り方のコツ
          </h2>
          <Card className="gap-0 py-0">
            <CardContent className="p-4 sm:p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {guide.tips.map((tip, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* 注意点 */}
        <section id="cautions" className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <AlertTriangle className="size-5 text-amber-500" />
            注意点
          </h2>
          <Card className="gap-0 border-amber-200 py-0 dark:border-amber-900">
            <CardContent className="p-4 sm:p-6">
              <ul className="space-y-3 text-sm text-muted-foreground">
                {guide.cautions.map((caution, index) => (
                  <li key={index} className="flex gap-2">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* よくある質問 */}
        <section id="faq" className="mb-8 sm:mb-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold sm:text-xl">
            <HelpCircle className={`size-5 ${color.text}`} />
            よくある質問
          </h2>
          <div className="space-y-3">
            {guide.faq.map((item, index) => (
              <Card key={index} className="gap-0 py-0">
                <CardContent className="p-4 sm:p-5">
                  <p className="flex items-start gap-2 font-semibold text-sm">
                    <span className={`shrink-0 font-bold ${color.text}`}>Q.</span>
                    {item.question}
                  </p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="shrink-0 font-bold text-primary">A.</span>
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 関連ページ */}
        <section id="related" className="mb-8">
          <h2 className="mb-4 text-lg font-bold sm:text-xl">関連ページ</h2>

          {/* 関連する季節特集 */}
          {relatedGuides.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-3 text-sm font-bold text-muted-foreground">
                他の季節特集
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGuides.map((rg) =>
                  rg ? (
                    <Link key={rg.slug} href={`/seasonal/${rg.slug}`}>
                      <Card className="group h-full gap-0 py-0 transition-shadow hover:shadow-md">
                        <CardContent className="p-4">
                          <p className="text-sm font-semibold group-hover:text-primary">
                            {rg.title}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {rg.months.map((m) => `${m}月`).join("・")}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* その他の関連ページ */}
          <div className="rounded-xl border bg-muted/30 p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/seasonal"
                className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
              >
                <p className="font-semibold">季節別釣りガイド</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  春夏秋冬のおすすめ釣り
                </p>
              </Link>
              <Link
                href="/methods"
                className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
              >
                <p className="font-semibold">釣り方ガイド</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  釣り方・釣法の詳しい解説
                </p>
              </Link>
              <Link
                href="/catchable-now"
                className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
              >
                <p className="font-semibold">今釣れる魚</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  今の時期に釣れる魚をチェック
                </p>
              </Link>
              <Link
                href="/guide"
                className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
              >
                <p className="font-semibold">釣りの始め方ガイド</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  初心者向けステップバイステップ
                </p>
              </Link>
              <Link
                href="/beginner-checklist"
                className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
              >
                <p className="font-semibold">持ち物チェックリスト</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  忘れ物防止チェックリスト
                </p>
              </Link>
              <Link
                href="/spots"
                className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
              >
                <p className="font-semibold">全国釣りスポット</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  1000件以上の釣りスポット
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
