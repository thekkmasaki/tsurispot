import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Fish,
  Thermometer,
  Cloud,
  Sun,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Package,
  Calendar,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Compass,
  Shield,
  Waves,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { SpotImage } from "@/components/ui/spot-image";
import {
  monthlyGuides,
  getMonthlyGuide,
  monthSlugs,
} from "@/lib/data/monthly-guides";
import { fishSpecies } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import { seasonalGuides } from "@/lib/data/seasonal-guides";
import { getMonthlyRigs } from "@/lib/data/monthly-rigs";
import { MonthlyRigSection } from "@/components/monthly-rig-section";
import { MonthlySportsSorter } from "@/components/monthly-spots-sorter";
import type { MonthlySpot } from "@/components/monthly-spots-sorter";

interface Props {
  params: Promise<{ month: string }>;
}

export async function generateStaticParams() {
  return monthSlugs.map((slug) => ({ month: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { month } = await params;
  const guide = getMonthlyGuide(month);
  if (!guide) return {};

  const topFishNames = guide.topFish
    .slice(0, 4)
    .map((slug) => fishSpecies.find((f) => f.slug === slug)?.name)
    .filter(Boolean)
    .join("・");

  const title = `${guide.nameJa}の釣り｜今釣れる魚・おすすめ釣り方・狙える魚種一覧【2026年版】`;
  const description = `${guide.nameJa}に釣れる魚と釣り方を徹底解説。${guide.nameJa}のおすすめターゲットは${topFishNames}。初心者でも楽しめる${guide.nameJa}の釣りスポット・仕掛け・コツを紹介。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://tsurispot.com/monthly/${month}`,
      siteName: "ツリスポ",
      ...(guide.heroImage
        ? {
            images: [
              {
                url: `https://tsurispot.com${guide.heroImage}`,
                width: 1200,
                height: 630,
                alt: guide.heroImageAlt || `${guide.nameJa}の釣り`,
              },
            ],
          }
        : {}),
    },
    alternates: {
      canonical: `https://tsurispot.com/monthly/${month}`,
    },
  };
}

export default async function MonthlyGuidePage({ params }: Props) {
  const { month } = await params;
  const guide = getMonthlyGuide(month);
  if (!guide) notFound();

  // その月に釣れる魚をfish.tsから取得
  const fishForMonth = fishSpecies
    .filter((f) => f.seasonMonths.includes(guide.month))
    .sort((a, b) => {
      // peakMonthsに含まれる魚を優先
      const aIsPeak = a.peakMonths.includes(guide.month) ? 1 : 0;
      const bIsPeak = b.peakMonths.includes(guide.month) ? 1 : 0;
      return bIsPeak - aIsPeak;
    })
    .slice(0, 8);

  // topFishのスラッグで魚を取得（データが指定した魚を優先表示）
  const guidedFish = guide.topFish
    .map((slug) => fishSpecies.find((f) => f.slug === slug))
    .filter(Boolean);

  const displayFish =
    guidedFish.length > 0 ? guidedFish : fishForMonth;

  // その月のおすすめ仕掛けセット
  const monthlyRigs = getMonthlyRigs(guide.month);

  // その月に釣れるスポット（catchableFishの月範囲でフィルタ）
  const spotsForMonth = fishingSpots
    .filter((spot) =>
      spot.catchableFish.some((cf) => {
        const start = cf.monthStart;
        const end = cf.monthEnd;
        if (start <= end) {
          return guide.month >= start && guide.month <= end;
        } else {
          // 年をまたぐ場合（例: 10〜3月）
          return guide.month >= start || guide.month <= end;
        }
      })
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  // 前月・翌月
  const currentIndex = monthSlugs.indexOf(month);
  const prevSlug =
    currentIndex > 0 ? monthSlugs[currentIndex - 1] : monthSlugs[11];
  const nextSlug =
    currentIndex < 11 ? monthSlugs[currentIndex + 1] : monthSlugs[0];
  const prevGuide = getMonthlyGuide(prevSlug);
  const nextGuide = getMonthlyGuide(nextSlug);

  // この月に関連する季節特集ガイド
  const relatedSeasonalGuides = seasonalGuides
    .filter((sg) => sg.months.includes(guide.month))
    .slice(0, 4);

  const currentMonth = new Date().getMonth() + 1;
  const isCurrentMonth = currentMonth === guide.month;

  // 自動生成FAQ（guide.faqsに追加する動的Q&A）
  const topFishNames = displayFish.slice(0, 4).map(f => f?.name).filter(Boolean);
  const beginnerFish = displayFish.filter(f => f?.difficulty === "beginner").map(f => f?.name).filter(Boolean);

  const autoFaqs: { question: string; answer: string }[] = [
    {
      question: `${guide.nameJa}に釣れる魚は何ですか？`,
      answer: `${guide.nameJa}に釣れる代表的な魚は${topFishNames.join("、")}などです。全${fishForMonth.length}種類以上の魚が${guide.nameJa}に釣れるシーズンを迎えます。`,
    },
    {
      question: `${guide.nameJa}の釣りで初心者におすすめの魚は？`,
      answer: beginnerFish.length > 0
        ? `${guide.nameJa}に初心者が狙いやすいのは${beginnerFish.slice(0, 3).join("、")}です。サビキ釣りやちょい投げなど簡単な釣り方で楽しめます。`
        : `${guide.nameJa}は${topFishNames.slice(0, 2).join("や")}が狙い目です。堤防や漁港での釣りなら初心者でも楽しめます。`,
    },
    {
      question: `${guide.nameJa}の釣りにおすすめのスポットは？`,
      answer: spotsForMonth.length > 0
        ? `${guide.nameJa}のおすすめスポットは${spotsForMonth.slice(0, 3).map(s => s.name).join("、")}などです。全国${spotsForMonth.length}箇所以上のスポットで${guide.nameJa}の釣りが楽しめます。`
        : `${guide.nameJa}は堤防や漁港での釣りがおすすめです。足場が安定しているスポットを選びましょう。`,
    },
    {
      question: `${guide.nameJa}の釣りで注意することは？`,
      answer: `${guide.nameJa}の釣りでは${guide.conditions.weather}に注意が必要です。水温は${guide.conditions.waterTemp}で、${guide.tips[0] || "天候や潮の動きを確認して釣行計画を立てましょう"}。`,
    },
  ];

  // guide.faqsと重複しないようフィルタリング
  const existingQuestions = new Set(guide.faqs.map(f => f.question));
  const filteredAutoFaqs = autoFaqs.filter(f => !existingQuestions.has(f.question));
  const allFaqs = [...guide.faqs, ...filteredAutoFaqs];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      datePublished: "2025-06-01",
      dateModified: new Date().toISOString().split("T")[0],
      url: `https://tsurispot.com/monthly/${month}`,
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
        "@id": `https://tsurispot.com/monthly/${month}`,
      },
    },
    {
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
          name: "月別釣りガイド",
          item: "https://tsurispot.com/monthly",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${guide.nameJa}に釣れる魚`,
          item: `https://tsurispot.com/monthly/${month}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: allFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "月別釣りガイド", href: "/monthly" },
          { label: `${guide.nameJa}の釣り` },
        ]} />

        {/* ヒーロー画像 */}
        {guide.heroImage && (
          <div className="mb-6 overflow-hidden rounded-2xl">
            <img
              src={guide.heroImage}
              alt={guide.heroImageAlt || `${guide.nameJa}の釣り`}
              className="h-48 w-full object-cover sm:h-64"
              loading="eager"
            />
            {guide.heroImageAttribution && (
              <p className="mt-1 text-[10px] text-muted-foreground text-right">
                {guide.heroImageAttribution}
              </p>
            )}
          </div>
        )}

        {/* ヘッダー */}
        <div className="mb-8 overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-blue-50 to-cyan-50 p-6 sm:p-8 dark:from-blue-950/30 dark:to-cyan-950/30">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-3xl shadow-lg">
              {guide.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold sm:text-3xl">
                  {guide.nameJa}に釣れる魚一覧
                </h1>
                {isCurrentMonth && (
                  <Badge variant="default" className="text-sm">
                    今月
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {guide.title.split("｜")[1]}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {guide.description}
          </p>
        </div>

        {/* 月別統計 */}
        <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-lg border bg-blue-50/50 p-3 text-center">
            <p className="text-lg font-bold text-blue-700 sm:text-xl">{fishForMonth.length}+</p>
            <p className="text-[10px] text-blue-600 sm:text-xs">{guide.nameJa}に釣れる魚種</p>
          </div>
          <div className="rounded-lg border bg-emerald-50/50 p-3 text-center">
            <p className="text-lg font-bold text-emerald-700 sm:text-xl">{spotsForMonth.length}+</p>
            <p className="text-[10px] text-emerald-600 sm:text-xs">おすすめスポット</p>
          </div>
          <div className="rounded-lg border bg-amber-50/50 p-3 text-center">
            <p className="text-lg font-bold text-amber-700 sm:text-xl">{displayFish.filter(f => f?.peakMonths.includes(guide.month)).length}</p>
            <p className="text-[10px] text-amber-600 sm:text-xs">最盛期の魚種</p>
          </div>
        </div>

        {/* 今月の条件カード */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Calendar className="size-5 text-primary" />
            {guide.nameJa}の釣り条件
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Thermometer className="size-4" />
                  水温の目安
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-bold text-primary">
                  {guide.conditions.waterTemp}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Cloud className="size-4" />
                  天候・気候
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{guide.conditions.weather}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Sun className="size-4" />
                  日照時間
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{guide.conditions.daylight}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 今月釣れる魚 */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Fish className="size-5 text-primary" />
            {guide.nameJa}のおすすめ魚種
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {displayFish.map((fish) => {
              if (!fish) return null;
              const isPeak = fish.peakMonths.includes(guide.month);
              return (
                <Link
                  key={fish.slug}
                  href={`/fish/${fish.slug}`}
                  className="group flex items-start gap-3 rounded-lg border bg-white p-3 transition-shadow hover:shadow-md dark:bg-card"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Fish className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold group-hover:text-primary">
                        {fish.name}
                      </span>
                      {isPeak && (
                        <Badge variant="default" className="text-[10px]">
                          最盛期
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {fish.difficulty === "beginner"
                          ? "初心者向け"
                          : fish.difficulty === "intermediate"
                          ? "中級者向け"
                          : "上級者向け"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {fish.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/catchable-now"
              className="text-sm text-primary hover:underline"
            >
              今釣れる魚をもっと見る →
            </Link>
          </div>
          <div className="mt-3 text-center">
            <Link href="/fishing-spots/near-me" className="text-sm text-primary hover:underline">
              近くの釣り場を探す →
            </Link>
          </div>
        </section>

        {/* この月のおすすめ釣り方ガイド */}
        {(() => {
          const monthGuideLinks: Record<number, { href: string; title: string; description: string }[]> = {
            1: [
              { href: "/guide/casting", title: "投げ釣り", description: "カレイの投げ釣りシーズン。砂浜からの遠投で大型カレイを狙おう" },
              { href: "/guide/lure", title: "ルアー釣り", description: "メバリング入門に最適な時期。常夜灯周りを攻めよう" },
              { href: "/guide/anazuri", title: "穴釣り", description: "カサゴの穴釣りで冬の堤防を楽しもう" },
              { href: "/guide/tide", title: "潮汐の読み方", description: "潮の動きを理解して釣果アップ" },
            ],
            2: [
              { href: "/guide/lure", title: "ルアー釣り", description: "メバリング最盛期。漁港のテトラ帯が好ポイント" },
              { href: "/guide/anazuri", title: "穴釣り", description: "根魚狙いの穴釣りで寒さに負けない釣りを" },
              { href: "/guide/casting", title: "投げ釣り", description: "冬のカレイ投げ釣りラストスパート" },
              { href: "/guide/knots", title: "結び方ガイド", description: "オフシーズンに結び方をマスターしよう" },
            ],
            3: [
              { href: "/guide/sabiki", title: "サビキ釣り", description: "春のサビキ開幕。アジやイワシが回遊し始める" },
              { href: "/guide/lure", title: "ルアー釣り", description: "メバル・カサゴのライトゲームが好調" },
              { href: "/guide/float-fishing", title: "ウキ釣り", description: "チヌやメジナのウキ釣りシーズン到来" },
              { href: "/guide/eging", title: "エギング", description: "春イカの先行シーズン。大型アオリイカのチャンス" },
            ],
            4: [
              { href: "/guide/sabiki", title: "サビキ釣り", description: "サビキ釣りの本格シーズン。ファミリーにもおすすめ" },
              { href: "/guide/eging", title: "エギング", description: "春イカシーズン本番。産卵前の大型を狙え" },
              { href: "/guide/float-fishing", title: "ウキ釣り", description: "のっこみチヌのウキ釣りが熱い" },
              { href: "/guide/jigging", title: "ショアジギング", description: "青物の回遊が始まる時期" },
            ],
            5: [
              { href: "/guide/sabiki", title: "サビキ釣り", description: "アジ・サバの数釣りが楽しめる" },
              { href: "/guide/eging", title: "エギング", description: "アオリイカのベストシーズン" },
              { href: "/guide/lure", title: "ルアー釣り", description: "シーバスやチヌのルアーゲーム" },
              { href: "/guide/choinage", title: "ちょい投げ", description: "キスのちょい投げ釣りが開幕" },
            ],
            6: [
              { href: "/guide/sabiki", title: "サビキ釣り", description: "サビキ最盛期。アジ・イワシが爆釣" },
              { href: "/guide/choinage", title: "ちょい投げ", description: "キスのちょい投げが最も熱い時期" },
              { href: "/guide/eging", title: "エギング", description: "梅雨時のエギングテクニック" },
              { href: "/guide/night-fishing", title: "夜釣りガイド", description: "蒸し暑い日は涼しい夜釣りがおすすめ" },
            ],
            7: [
              { href: "/guide/sabiki", title: "サビキ釣り", description: "夏休みのサビキ釣り。子供と一緒に" },
              { href: "/guide/choinage", title: "ちょい投げ", description: "キス・ハゼのちょい投げが好調" },
              { href: "/guide/jigging", title: "ショアジギング", description: "青物回遊のピーク。ブリ・カンパチを狙え" },
              { href: "/guide/night-fishing", title: "夜釣りガイド", description: "夏の夜釣りでタチウオ・イカを狙おう" },
            ],
            8: [
              { href: "/guide/sabiki", title: "サビキ釣り", description: "真夏のサビキ。朝夕のマズメ時が狙い目" },
              { href: "/guide/choinage", title: "ちょい投げ", description: "ハゼのちょい投げシーズン到来" },
              { href: "/guide/jigging", title: "ショアジギング", description: "青物の活性が最も高い時期" },
              { href: "/guide/oyogase", title: "泳がせ釣り", description: "サビキで釣った小魚で大物を狙う" },
            ],
            9: [
              { href: "/guide/sabiki", title: "サビキ釣り", description: "秋のサビキ。大型のアジが回遊" },
              { href: "/guide/eging", title: "エギング", description: "秋イカ最盛期。新子サイズが数釣れる" },
              { href: "/guide/jigging", title: "ショアジギング", description: "秋の青物ラッシュ。堤防から大物チャンス" },
              { href: "/guide/oyogase", title: "泳がせ釣り", description: "ヒラメ・ブリの泳がせ釣りが熱い" },
            ],
            10: [
              { href: "/guide/eging", title: "エギング", description: "秋イカ後半戦。サイズアップしたアオリイカ" },
              { href: "/guide/jigging", title: "ショアジギング", description: "秋の大型青物ラストチャンス" },
              { href: "/guide/sabiki", title: "サビキ釣り", description: "秋サビキの終盤。脂ののったアジを狙え" },
              { href: "/guide/lure", title: "ルアー釣り", description: "シーバスの秋パターンが好調" },
            ],
            11: [
              { href: "/guide/eging", title: "エギング", description: "晩秋のエギング。深場に移動するイカを狙う" },
              { href: "/guide/casting", title: "投げ釣り", description: "カレイの投げ釣りシーズン開幕" },
              { href: "/guide/lure", title: "ルアー釣り", description: "メバリング開幕。秋の夜長にライトゲーム" },
              { href: "/guide/night-fishing", title: "夜釣りガイド", description: "秋の夜釣りでメバル・アジを狙う" },
            ],
            12: [
              { href: "/guide/lure", title: "ルアー釣り", description: "メバリング好調。冬の夜のライトゲーム" },
              { href: "/guide/anazuri", title: "穴釣り", description: "冬の定番。カサゴ・メバルの穴釣り" },
              { href: "/guide/casting", title: "投げ釣り", description: "カレイシーズン本番。大型カレイを狙え" },
              { href: "/guide/tide", title: "潮汐の読み方", description: "冬の釣りは潮の読みが釣果を左右する" },
            ],
          };
          const links = monthGuideLinks[guide.month];
          if (!links || links.length === 0) return null;
          return (
            <section className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                <BookOpen className="size-5 text-primary" />
                {guide.nameJa}のおすすめ釣り方ガイド
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-start gap-3 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md dark:bg-card"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <BookOpen className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold group-hover:text-primary">
                          {link.title}
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link href="/guide" className="text-sm text-primary hover:underline">
                  すべてのガイドを見る →
                </Link>
              </div>
            </section>
          );
        })()}

        {/* おすすめ仕掛けセット */}
        <MonthlyRigSection monthName={guide.nameJa} rigs={monthlyRigs} />

        {/* おすすめスポット */}
        {spotsForMonth.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <MapPin className="size-5 text-primary" />
              {guide.nameJa}におすすめの釣りスポット
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              {guide.nameJa}に旬の魚が釣れる人気スポットを厳選しました。評価の高いスポット上位{spotsForMonth.length}件を紹介します。
            </p>
            <MonthlySportsSorter
              spots={spotsForMonth.map((spot) => ({
                slug: spot.slug,
                name: spot.name,
                rating: spot.rating,
                latitude: spot.latitude,
                longitude: spot.longitude,
                spotType: spot.spotType,
                difficulty: spot.difficulty,
                mainImageUrl: spot.mainImageUrl,
                region: { prefecture: spot.region.prefecture },
                catchableFishNames: spot.catchableFish
                  .filter((cf) => {
                    const start = cf.monthStart;
                    const end = cf.monthEnd;
                    if (start <= end) {
                      return guide.month >= start && guide.month <= end;
                    } else {
                      return guide.month >= start || guide.month <= end;
                    }
                  })
                  .map((cf) => cf.fish.name)
                  .slice(0, 4),
              })) as MonthlySpot[]}
              monthName={guide.nameJa}
            />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/spots"
                className="text-sm text-primary hover:underline"
              >
                すべての釣りスポットを見る →
              </Link>
              <Link
                href="/map"
                className="text-sm text-primary hover:underline"
              >
                地図で探す →
              </Link>
              <Link
                href="/fishing-spots/near-me"
                className="text-sm text-primary hover:underline"
              >
                近くの釣り場を探す →
              </Link>
            </div>
          </section>
        )}

        {/* 今月の釣りTips */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Lightbulb className="size-5 text-amber-500" />
            {guide.nameJa}の釣りTips
          </h2>
          <Card>
            <CardContent className="pt-4">
              <ul className="space-y-3">
                {guide.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed text-muted-foreground">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* おすすめ装備 */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Package className="size-5 text-primary" />
            {guide.nameJa}のおすすめ装備
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {guide.gear.map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
                    <p className="text-sm leading-relaxed">{item}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 冬月の防寒アフィリエイト (11,12,1,2,3月) */}
          {[1, 2, 3, 11, 12].includes(guide.month) && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-blue-900">冬の釣りにおすすめの防寒アイテム</h3>
              <Card className="border-orange-200 bg-orange-50/50 py-0">
                <CardContent className="p-4">
                  <p className="mb-1 text-sm font-bold text-orange-900">電熱ベスト — 釣り中の寒さ対策に最強</p>
                  <p className="mb-3 text-xs text-orange-800 leading-relaxed">
                    USB給電で背中・腹部を温める電熱ベスト。風の強い堤防での釣りでも体の芯からポカポカ。
                    モバイルバッテリーで稼働するのでコンセント不要。防寒着の中に着るだけでOK。
                  </p>
                  <a
                    href="https://amzn.to/40sdGZ6"
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]"
                  >
                    Amazonで電熱ベストを見る
                    <ExternalLink className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/50 py-0">
                <CardContent className="p-4">
                  <p className="mb-1 text-sm font-bold text-blue-900">モバイルバッテリー — 信頼できるメーカーを選ぼう</p>
                  <p className="mb-3 text-xs text-blue-800 leading-relaxed">
                    電熱ベストの給電だけでなく、<strong>釣り中にスマホの充電が切れると潮汐アプリや地図、緊急連絡が使えなくなり危険</strong>です。
                    安全のためにも信頼できるメーカーの大容量モバイルバッテリーを必ず持参しましょう。
                  </p>
                  <a
                    href="https://amzn.to/4s3kDvE"
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]"
                  >
                    Amazonでモバイルバッテリーを見る
                    <ExternalLink className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 夏月の暑さ・安全対策アフィリエイト (5,6,7,8,9月) */}
          {[5, 6, 7, 8, 9].includes(guide.month) && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-bold text-blue-900">夏の釣りの必需品</h3>
              <Card className="border-sky-200 bg-sky-50/50 py-0">
                <CardContent className="p-4">
                  <p className="mb-1 text-sm font-bold text-sky-900">偏光サングラス — 水中の魚が見える＆目の保護</p>
                  <p className="mb-3 text-xs text-sky-800 leading-relaxed">
                    偏光レンズで水面の反射をカットし、水中の魚影や海底の地形が見えます。紫外線から目を守り、長時間の釣りでも疲れにくい。
                  </p>
                  <a href="https://amzn.to/3ZPBnuq" target="_blank" rel="sponsored noopener noreferrer"
                     className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]">
                    Amazonで偏光サングラスを見る
                    <ExternalLink className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50/50 py-0">
                <CardContent className="p-4">
                  <p className="mb-1 text-sm font-bold text-red-900">ライフジャケット — 海の事故を防ぐ必須アイテム</p>
                  <p className="mb-3 text-xs text-red-800 leading-relaxed">
                    腰巻きタイプなら動きやすく釣りの邪魔になりません。万が一の落水時に命を守る最重要装備です。
                  </p>
                  <a href="https://amzn.to/4s1DpU5" target="_blank" rel="sponsored noopener noreferrer"
                     className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]">
                    Amazonでライフジャケットを見る
                    <ExternalLink className="size-3.5" />
                  </a>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 全月共通: 基本の釣り道具 */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold">基本の釣り道具をチェック</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <a href="https://amzn.to/4s4i64m" target="_blank" rel="sponsored noopener noreferrer"
                 className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md">
                <span className="text-2xl">🎣</span>
                <div>
                  <p className="text-sm font-bold">ロッド（シマノ）</p>
                  <p className="text-xs text-muted-foreground">万能竿で堤防〜サーフまで対応</p>
                </div>
              </a>
              <a href="https://amzn.to/4atW7Om" target="_blank" rel="sponsored noopener noreferrer"
                 className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md">
                <span className="text-2xl">🔄</span>
                <div>
                  <p className="text-sm font-bold">リール（シマノ）</p>
                  <p className="text-xs text-muted-foreground">コスパ最高の定番リール</p>
                </div>
              </a>
              <a href="https://amzn.to/4s45H0i" target="_blank" rel="sponsored noopener noreferrer"
                 className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md">
                <span className="text-2xl">🧵</span>
                <div>
                  <p className="text-sm font-bold">PEライン（東レ）</p>
                  <p className="text-xs text-muted-foreground">感度が高く強度も十分</p>
                </div>
              </a>
              <a href="https://amzn.to/4cFGDbl" target="_blank" rel="sponsored noopener noreferrer"
                 className="flex items-center gap-3 rounded-lg border p-3 transition-shadow hover:shadow-md">
                <span className="text-2xl">⚓</span>
                <div>
                  <p className="text-sm font-bold">おもりセット</p>
                  <p className="text-xs text-muted-foreground">まとめ買いがお得</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* 釣りポイント解説 */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <BookOpen className="size-5 text-primary" />
            {guide.nameJa}の釣りポイント解説
          </h2>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {guide.commentary}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <HelpCircle className="size-5 text-primary" />
            {guide.nameJa}の釣りFAQ
          </h2>
          <div className="space-y-3">
            {allFaqs.map((faq, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <h3 className="mb-2 text-sm font-bold">
                    Q. {faq.question}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 釣りに役立つツール */}
        <section className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <Compass className="size-5 text-primary" />
            釣りに役立つツール
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/tides"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <Waves className="mx-auto mb-2 size-8 text-blue-500" />
              <p className="font-semibold">潮汐チャート</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣果に直結する潮汐情報
              </p>
            </Link>
            <Link
              href="/bouzu-checker"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <Target className="mx-auto mb-2 size-8 text-red-500" />
              <p className="font-semibold">ボウズチェッカー</p>
              <p className="mt-1 text-xs text-muted-foreground">
                条件から釣果確率を算出
              </p>
            </Link>
            <Link
              href="/glossary"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <BookOpen className="mx-auto mb-2 size-8 text-emerald-500" />
              <p className="font-semibold">用語集</p>
              <p className="mt-1 text-xs text-muted-foreground">
                わからない言葉をすぐ検索
              </p>
            </Link>
            <Link
              href="/quiz"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <HelpCircle className="mx-auto mb-2 size-8 text-purple-500" />
              <p className="font-semibold">釣りクイズ</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣りの知識を腕試し
              </p>
            </Link>
          </div>
        </section>

        {/* 季節の釣り特集 */}
        {relatedSeasonalGuides.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Calendar className="size-5 text-primary" />
              {guide.nameJa}の釣り特集ガイド
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {relatedSeasonalGuides.map((sg) => (
                <Link
                  key={sg.slug}
                  href={`/seasonal/${sg.slug}`}
                  className="group flex items-start gap-3 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md dark:bg-card"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                    <Calendar className="size-5 text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold group-hover:text-primary">{sg.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{sg.description.slice(0, 80)}...</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">{sg.method}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{sg.season}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 安全・マナー */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <Link href="/safety" className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 transition-shadow hover:shadow-md dark:bg-red-950/20">
            <Shield className="size-6 text-red-500" />
            <div>
              <p className="font-semibold">安全ガイド</p>
              <p className="text-xs text-muted-foreground">事故を防ぐための必読情報</p>
            </div>
          </Link>
          <Link href="/fishing-rules" className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-4 transition-shadow hover:shadow-md dark:bg-amber-950/20">
            <BookOpen className="size-6 text-amber-500" />
            <div>
              <p className="font-semibold">ルールとマナー</p>
              <p className="text-xs text-muted-foreground">釣り場で守るべきルール</p>
            </div>
          </Link>
        </div>

        {/* 初心者向けバナー */}
        <section className="mb-8">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            <div className="mb-1 text-sm font-medium text-emerald-100">はじめての方へ</div>
            <h2 className="mb-2 text-lg font-bold">{guide.nameJa}から釣りを始めませんか？</h2>
            <p className="mb-4 text-sm text-emerald-50">
              道具は5,000円から。近くの堤防で、初心者でも魚が釣れます。
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/guide/beginner"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                初心者ガイドを見る
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href="/guide/budget"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                5,000円で始める方法
              </Link>
            </div>
          </div>
        </section>

        {/* 釣り場診断CTA */}
        <div className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
          <p className="mb-2 text-base font-bold">{guide.nameJa}、どこで釣る？</p>
          <p className="mb-4 text-sm text-muted-foreground">
            条件に合った釣り場を診断します
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/fish-finder" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
              釣り場診断を試す
            </Link>
            <Link href="/recommendation" className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
              今週のおすすめを見る
            </Link>
          </div>
        </div>

        {/* 前月・翌月ナビ */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          {prevGuide && (
            <Link
              href={`/monthly/${prevSlug}`}
              className="flex items-center gap-2 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md dark:bg-card"
            >
              <ChevronLeft className="size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">前月</p>
                <p className="font-semibold">
                  {prevGuide.emoji} {prevGuide.nameJa}の釣り
                </p>
              </div>
            </Link>
          )}
          {nextGuide && (
            <Link
              href={`/monthly/${nextSlug}`}
              className="flex items-center justify-end gap-2 rounded-lg border bg-white p-4 transition-shadow hover:shadow-md dark:bg-card"
            >
              <div className="min-w-0 text-right">
                <p className="text-xs text-muted-foreground">翌月</p>
                <p className="font-semibold">
                  {nextGuide.emoji} {nextGuide.nameJa}の釣り
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-primary" />
            </Link>
          )}
        </div>

        {/* 関連リンク */}
        <div className="rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-base font-bold">関連ページ</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
              href="/map"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">地図で探す</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全国の釣り場をマップで表示
              </p>
            </Link>
            <Link
              href="/monthly"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">月別ガイド一覧</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全12ヶ月のガイドを見る
              </p>
            </Link>
            <Link
              href="/fishing-spots/breakwater-beginner"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">初心者向け堤防釣り</p>
              <p className="mt-1 text-xs text-muted-foreground">
                初心者でも安心の釣りスポット
              </p>
            </Link>
            <Link
              href="/fishing-spots/near-me"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">近くの釣り場</p>
              <p className="mt-1 text-xs text-muted-foreground">
                現在地から近い釣りスポット
              </p>
            </Link>
            <Link
              href="/fish"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">魚種図鑑</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全魚種の詳細情報を見る
              </p>
            </Link>
            <Link
              href="/spots"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">全国釣りスポット</p>
              <p className="mt-1 text-xs text-muted-foreground">
                1000+の釣り場を探す
              </p>
            </Link>
            <Link
              href="/fishing-calendar"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">釣りカレンダー</p>
              <p className="mt-1 text-xs text-muted-foreground">
                月別の釣りカレンダー
              </p>
            </Link>
            <Link
              href="/area-guide"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">エリア別ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全国のエリア別釣り場攻略
              </p>
            </Link>
            <Link
              href="/gear"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">おすすめ釣り道具</p>
              <p className="mt-1 text-xs text-muted-foreground">
                編集長厳選の道具
              </p>
            </Link>
            <Link
              href="/ranking"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">人気ランキング</p>
              <p className="mt-1 text-xs text-muted-foreground">
                人気スポットをチェック
              </p>
            </Link>
            <Link
              href="/prefecture"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">都道府県から探す</p>
              <p className="mt-1 text-xs text-muted-foreground">
                47都道府県の釣り場
              </p>
            </Link>
            <Link
              href="/methods"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">釣り方一覧</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣法別ガイド
              </p>
            </Link>
            <Link
              href="/blog"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">ブログ</p>
              <p className="mt-1 text-xs text-muted-foreground">
                最新の釣り情報
              </p>
            </Link>
            <Link
              href="/shops"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">釣具店を探す</p>
              <p className="mt-1 text-xs text-muted-foreground">
                全国の釣具店情報
              </p>
            </Link>
            <Link
              href="/for-beginners"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">はじめての方へ</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣りの始め方
              </p>
            </Link>
            <Link
              href="/beginner-checklist"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">初心者チェックリスト</p>
              <p className="mt-1 text-xs text-muted-foreground">
                持ち物リスト
              </p>
            </Link>
            <Link
              href="/guide/knots"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">結び方ガイド</p>
              <p className="mt-1 text-xs text-muted-foreground">
                基本の結び方
              </p>
            </Link>
            <Link
              href="/guide/rigs"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">仕掛け図鑑</p>
              <p className="mt-1 text-xs text-muted-foreground">
                釣り方別の仕掛け
              </p>
            </Link>
            <Link
              href="/guide/setup"
              className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md dark:bg-card"
            >
              <p className="font-semibold">道具の選び方</p>
              <p className="mt-1 text-xs text-muted-foreground">
                初めての道具選び
              </p>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
