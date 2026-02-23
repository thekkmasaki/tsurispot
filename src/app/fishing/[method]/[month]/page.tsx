import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Fish,
  MapPin,
  Thermometer,
  Star,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FISHING_METHODS,
  MONTHS,
  getMethodBySlug,
  getMonthBySlug,
  getMethodMonthPageData,
} from "@/lib/data/fishing-methods";
import { SPOT_TYPE_LABELS, DIFFICULTY_LABELS } from "@/types";

interface Props {
  params: Promise<{ method: string; month: string }>;
}

export async function generateStaticParams() {
  const params: { method: string; month: string }[] = [];
  for (const method of FISHING_METHODS) {
    for (const month of MONTHS) {
      params.push({ method: method.slug, month: month.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { method: methodSlug, month: monthSlug } = await params;
  const method = getMethodBySlug(methodSlug);
  const month = getMonthBySlug(monthSlug);
  if (!method || !month) return {};

  const title = `${month.name}の${method.name}｜釣れる魚・おすすめスポット・タックル情報`;
  const description = `${month.name}の${method.name}を徹底ガイド。この時期に釣れる魚一覧、おすすめの釣りスポットTOP10、水温・タックル情報を完全網羅。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://tsurispot.com/fishing/${method.slug}/${month.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/fishing/${method.slug}/${month.slug}`,
    },
  };
}

export default async function MethodMonthPage({ params }: Props) {
  const { method: methodSlug, month: monthSlug } = await params;
  const data = getMethodMonthPageData(methodSlug, monthSlug);
  if (!data) notFound();

  const { method, month, fish, spots, waterTemp, overview, faqs, prevMonth, nextMonth } =
    data;

  const peakFish = fish.filter((f) => f.isPeak);
  const normalFish = fish.filter((f) => !f.isPeak);

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
        name: "釣り方×月別ガイド",
        item: "https://tsurispot.com/fishing",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${method.name}月別ガイド`,
        item: `https://tsurispot.com/fishing/${method.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${month.name}の${method.name}`,
        item: `https://tsurispot.com/fishing/${method.slug}/${month.slug}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣り方×月別ガイド", href: "/fishing" },
            { label: `${method.name}`, href: `/fishing/${method.slug}` },
            { label: `${month.name}` },
          ]}
        />

        {/* 前月・翌月ナビゲーション */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/fishing/${method.slug}/${prevMonth.slug}`}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="size-4" />
            {prevMonth.name}
          </Link>

          {/* 月セレクタ */}
          <div className="relative">
            <details className="group">
              <summary className="flex items-center gap-1 text-sm cursor-pointer text-gray-600 hover:text-gray-900 list-none">
                <Calendar className="size-4" />
                月を選ぶ
                <ChevronDown className="size-3" />
              </summary>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-10 bg-white dark:bg-gray-900 border rounded-lg shadow-lg p-2 grid grid-cols-4 gap-1 min-w-[200px]">
                {MONTHS.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/fishing/${method.slug}/${m.slug}`}
                    className={`text-center text-sm px-2 py-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/50 ${
                      m.slug === month.slug
                        ? "bg-blue-100 dark:bg-blue-900 font-bold"
                        : ""
                    }`}
                  >
                    {m.name}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <Link
            href={`/fishing/${method.slug}/${nextMonth.slug}`}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            {nextMonth.name}
            <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            {month.name}の{method.name}ガイド
            <span className="block text-base sm:text-lg font-normal text-gray-600 mt-1">
              釣れる魚とおすすめスポット
            </span>
          </h1>

          {/* 概要カード */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="size-4 text-blue-500" />
                <span className="text-sm font-medium">
                  水温目安: {waterTemp}
                </span>
                <Badge className="ml-auto text-xs" variant="secondary">
                  {month.season}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {overview}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 釣れる魚セクション */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Fish className="size-5" />
            {month.name}に{method.name}で釣れる魚
            <Badge variant="secondary" className="text-xs">
              {fish.length}魚種
            </Badge>
          </h2>

          {fish.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>
                  {month.name}の{method.name}は対象魚が少なめです。
                </p>
                <p className="mt-2">
                  <Link
                    href={`/fishing/${method.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    他の月を確認する
                  </Link>
                  {" "}または{" "}
                  <Link
                    href="/fishing"
                    className="text-blue-600 hover:underline"
                  >
                    他の釣り方を見る
                  </Link>
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 最盛期の魚 */}
              {peakFish.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <span>🔥</span> 最盛期の魚
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {peakFish.map((f) => (
                      <Link key={f.slug} href={`/fish/${f.slug}`}>
                        <Card className="hover:shadow-md transition-shadow border-orange-200 dark:border-orange-800">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0 overflow-hidden">
                                {f.imageUrl && f.imageUrl !== "/images/fish/default.jpg" ? (
                                  <img
                                    src={f.imageUrl}
                                    alt={f.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Fish className="size-6 text-orange-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm">
                                    {f.name}
                                  </h4>
                                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                                    最盛期
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {f.sizeCm} / {DIFFICULTY_LABELS[f.difficulty]}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {f.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* その他の魚 */}
              {normalFish.length > 0 && (
                <div>
                  <h3 className="text-base font-bold mb-3">
                    {peakFish.length > 0 ? "その他に釣れる魚" : "釣れる魚一覧"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {normalFish.map((f) => (
                      <Link key={f.slug} href={`/fish/${f.slug}`}>
                        <Card className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                                {f.imageUrl && f.imageUrl !== "/images/fish/default.jpg" ? (
                                  <img
                                    src={f.imageUrl}
                                    alt={f.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Fish className="size-6 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-sm">
                                  {f.name}
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {f.sizeCm} / {DIFFICULTY_LABELS[f.difficulty]}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {f.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* おすすめスポットTOP10 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="size-5" />
            {month.name}の{method.name}おすすめスポット
            {spots.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                TOP{Math.min(spots.length, 10)}
              </Badge>
            )}
          </h2>

          {spots.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>
                  {month.name}の{method.name}に適したスポットデータは現在準備中です。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {spots.map((spot, idx) => (
                <Link
                  key={spot.slug}
                  href={`/fishing-spots/${spot.slug}`}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold">{spot.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {SPOT_TYPE_LABELS[spot.spotType]}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {spot.region.prefecture}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-1">
                            <span className="flex items-center gap-1">
                              <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
                              {spot.rating.toFixed(1)}
                            </span>
                            <span>
                              {spot.matchingFishCount}魚種マッチ
                            </span>
                            <span>
                              {DIFFICULTY_LABELS[spot.difficulty]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">
                            {spot.address}
                          </p>
                          {/* マッチする魚種表示 */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {spot.catchableFish
                              .filter((cf) =>
                                method.methods.includes(cf.method)
                              )
                              .slice(0, 4)
                              .map((cf) => (
                                <Badge
                                  key={cf.fish.slug}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {cf.fish.name}
                                </Badge>
                              ))}
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-gray-400 shrink-0 mt-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 釣り方のコツ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="size-5" />
            {month.name}の{method.name}のコツ
          </h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                {faqs[2]?.answer}
              </p>
              <Link
                href={method.guide}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {method.name}の詳しいガイドを見る
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <HelpCircle className="size-5" />
            よくある質問
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <h3 className="font-bold text-sm mb-2">
                    Q. {faq.question}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    A. {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 関連リンク */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">関連ガイド</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* この月の他の釣り方 */}
            {FISHING_METHODS.filter((m) => m.slug !== method.slug).map((m) => (
              <Link
                key={m.slug}
                href={`/fishing/${m.slug}/${month.slug}`}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-sm font-medium">
                      {month.name}の{m.name}
                    </span>
                    <ChevronRight className="size-4 ml-auto text-gray-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* 月別ガイドへのリンク */}
            <Link href={`/monthly/${month.slug}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-2">
                  <Calendar className="size-5 text-blue-500" />
                  <span className="text-sm font-medium">
                    {month.name}の釣り総合ガイド
                  </span>
                  <ChevronRight className="size-4 ml-auto text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* 前月・翌月ナビゲーション（フッター） */}
        <div className="flex items-center justify-between border-t pt-6">
          <Link
            href={`/fishing/${method.slug}/${prevMonth.slug}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="size-5" />
            <div>
              <div className="text-xs text-gray-500">前月</div>
              <div className="font-medium">
                {prevMonth.name}の{method.name}
              </div>
            </div>
          </Link>
          <Link
            href={`/fishing/${method.slug}/${nextMonth.slug}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-right"
          >
            <div>
              <div className="text-xs text-gray-500">翌月</div>
              <div className="font-medium">
                {nextMonth.name}の{method.name}
              </div>
            </div>
            <ChevronRight className="size-5" />
          </Link>
        </div>
      </div>
    </>
  );
}
