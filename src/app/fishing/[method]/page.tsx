import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Calendar,
  Fish,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FISHING_METHODS,
  MONTHS,
  getMethodBySlug,
  getFishForMethodAndMonth,
  getSpotsForMethodAndMonth,
} from "@/lib/data/fishing-methods";

interface Props {
  params: Promise<{ method: string }>;
}

export async function generateStaticParams() {
  return FISHING_METHODS.map((m) => ({ method: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { method: methodSlug } = await params;
  const method = getMethodBySlug(methodSlug);
  if (!method) return {};

  const title = `${method.name}月別ガイド｜1月〜12月の釣れる魚・おすすめスポット`;
  const description = `${method.name}を月別に完全攻略。1月から12月まで、各月に釣れる魚・おすすめスポット・タックル情報を網羅。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/fishing/${method.slug}`,
      siteName: "ツリスポ",
    },
    alternates: {
      canonical: `https://tsurispot.com/fishing/${method.slug}`,
    },
  };
}

const seasonColors: Record<string, string> = {
  冬: "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800",
  春: "from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800",
  夏: "from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-800",
  秋: "from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-800",
};

const seasonBadgeColors: Record<string, string> = {
  冬: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  春: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  夏: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  秋: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export default async function MethodPage({ params }: Props) {
  const { method: methodSlug } = await params;
  const method = getMethodBySlug(methodSlug);
  if (!method) notFound();

  const currentMonth = new Date().getMonth() + 1;

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
    ],
  };

  // 各月のデータを事前計算
  const monthlyData = MONTHS.map((m) => {
    const fish = getFishForMethodAndMonth(method, m.num);
    const spots = getSpotsForMethodAndMonth(method, m.num, 3);
    return { month: m, fish, spots };
  });

  // ベストシーズン判定（最盛期の魚が多い月）
  const bestMonths = monthlyData
    .map((d) => ({
      ...d,
      peakCount: d.fish.filter((f) => f.isPeak).length,
    }))
    .filter((d) => d.peakCount > 0)
    .sort((a, b) => b.peakCount - a.peakCount)
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣り方×月別ガイド", href: "/fishing" },
            { label: `${method.name}月別ガイド` },
          ]}
        />

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{method.icon}</span>
            <h1 className="text-2xl sm:text-3xl font-bold">
              {method.name}月別ガイド
            </h1>
          </div>
          <p className="text-gray-600 mb-4">{method.description}</p>

          {/* ベストシーズン */}
          {bestMonths.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">
                ベストシーズン:
              </span>
              {bestMonths.map((bm) => (
                <Link
                  key={bm.month.slug}
                  href={`/fishing/${method.slug}/${bm.month.slug}`}
                >
                  <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 hover:bg-orange-200 cursor-pointer">
                    {bm.month.name}（最盛期{bm.peakCount}魚種）
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ガイドへのリンク */}
        <div className="mb-8">
          <Link
            href={method.guide}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            {method.name}の基本ガイドを見る
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* 12ヶ月カード */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="size-5" />
            月別ガイド一覧
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyData.map(({ month, fish, spots }) => {
              const peakFish = fish.filter((f) => f.isPeak);
              const isCurrentMonth = month.num === currentMonth;

              return (
                <Link
                  key={month.slug}
                  href={`/fishing/${method.slug}/${month.slug}`}
                >
                  <Card
                    className={`hover:shadow-md transition-shadow h-full border ${
                      isCurrentMonth
                        ? "ring-2 ring-blue-400 border-blue-300"
                        : ""
                    }`}
                  >
                    <CardContent
                      className={`p-4 bg-gradient-to-br ${seasonColors[month.season]}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{month.name}</h3>
                          <Badge
                            className={`text-xs ${seasonBadgeColors[month.season]}`}
                          >
                            {month.season}
                          </Badge>
                          {isCurrentMonth && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                              今月
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="size-4 text-gray-400" />
                      </div>

                      {/* 魚種数 */}
                      <div className="flex items-center gap-3 mb-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Fish className="size-3.5" />
                          {fish.length}魚種
                        </span>
                        {peakFish.length > 0 && (
                          <span className="text-orange-600 font-medium">
                            最盛期{peakFish.length}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {spots.length}スポット
                        </span>
                      </div>

                      {/* 代表魚種 */}
                      {fish.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {fish.slice(0, 3).map((f) => (
                            <Badge
                              key={f.slug}
                              variant="secondary"
                              className={`text-xs ${
                                f.isPeak
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                                  : ""
                              }`}
                            >
                              {f.name}
                              {f.isPeak && " 🔥"}
                            </Badge>
                          ))}
                          {fish.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{fish.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      {fish.length === 0 && (
                        <p className="text-xs text-gray-500">
                          対象魚が少なめの時期
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 他の釣り方 */}
        <section>
          <h2 className="text-xl font-bold mb-4">他の釣り方</h2>
          <div className="flex flex-wrap gap-2">
            {FISHING_METHODS.filter((m) => m.slug !== method.slug).map((m) => (
              <Link key={m.slug} href={`/fishing/${m.slug}`}>
                <Badge
                  variant="outline"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm py-1.5 px-3"
                >
                  {m.icon} {m.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
