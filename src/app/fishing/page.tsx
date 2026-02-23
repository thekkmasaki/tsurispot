import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Calendar, Fish, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  FISHING_METHODS,
  MONTHS,
  getFishForMethodAndMonth,
} from "@/lib/data/fishing-methods";

export const metadata: Metadata = {
  title: "釣り方×月別ガイド｜サビキ・ちょい投げ・ウキ釣り・エギング・ルアーの月別攻略",
  description:
    "サビキ釣り・ちょい投げ・ウキ釣り・エギング・ルアーの5つの釣り方を月別に完全攻略。各月に釣れる魚、おすすめスポット、タックル情報をまとめたマトリクスガイド。",
  openGraph: {
    title: "釣り方×月別ガイド｜サビキ・ちょい投げ・ウキ釣り・エギング・ルアーの月別攻略",
    description:
      "5つの釣り方×12ヶ月。各月ごとの釣れる魚・おすすめスポットを完全網羅。",
    type: "website",
    url: "https://tsurispot.com/fishing",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing",
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
      name: "釣り方×月別ガイド",
      item: "https://tsurispot.com/fishing",
    },
  ],
};

// 月ごとの背景色
const seasonColors: Record<string, string> = {
  冬: "bg-blue-50 dark:bg-blue-950/30",
  春: "bg-green-50 dark:bg-green-950/30",
  夏: "bg-orange-50 dark:bg-orange-950/30",
  秋: "bg-amber-50 dark:bg-amber-950/30",
};

const seasonBadgeColors: Record<string, string> = {
  冬: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  春: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  夏: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  秋: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export default function FishingIndexPage() {
  // 今月を判定
  const currentMonth = new Date().getMonth() + 1;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "釣り方×月別ガイド" },
          ]}
        />

        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          釣り方×月別ガイド
        </h1>
        <p className="text-gray-600 mb-8">
          5つの人気釣り方を月ごとに攻略。釣れる魚・おすすめスポット・タックル情報を完全網羅。
        </p>

        <div className="mb-6 rounded-xl bg-amber-50 p-4 text-center">
          <p className="text-sm text-amber-800">
            <span className="font-bold">何から始めればいいかわからない？</span>
            →{" "}
            <Link href="/guide/beginner" className="font-bold underline hover:text-amber-900">
              初心者完全ガイド
            </Link>
            を読んでみよう！
          </p>
        </div>

        {/* 釣り方カード一覧 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Fish className="size-5" />
            釣り方から選ぶ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FISHING_METHODS.map((method) => {
              const currentFish = getFishForMethodAndMonth(
                method,
                currentMonth
              );
              return (
                <Link
                  key={method.slug}
                  href={`/fishing/${method.slug}`}
                >
                  <Card className="hover:shadow-md transition-shadow h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{method.icon}</span>
                        <h3 className="font-bold text-lg">{method.name}</h3>
                        <ChevronRight className="size-4 ml-auto text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {method.description}
                      </p>
                      {currentFish.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            今月釣れる魚:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {currentFish.slice(0, 4).map((f) => (
                              <Badge
                                key={f.slug}
                                variant="secondary"
                                className={
                                  f.isPeak
                                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs"
                                    : "text-xs"
                                }
                              >
                                {f.name}
                                {f.isPeak && " 🔥"}
                              </Badge>
                            ))}
                            {currentFish.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{currentFish.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 月別マトリクス表 */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="size-5" />
            月×釣り方マトリクス
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            各セルの数字はその月にその釣り方で狙える魚種数です。タップで詳細ページへ。
          </p>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 dark:bg-gray-800 p-2 text-left min-w-[100px]">
                    釣り方
                  </th>
                  {MONTHS.map((m) => (
                    <th
                      key={m.slug}
                      className={`border border-gray-200 p-2 text-center min-w-[60px] ${
                        m.num === currentMonth
                          ? "bg-blue-100 dark:bg-blue-900 font-bold"
                          : seasonColors[m.season]
                      }`}
                    >
                      {m.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FISHING_METHODS.map((method) => (
                  <tr key={method.slug}>
                    <td className="border border-gray-200 p-2 font-medium">
                      <Link
                        href={`/fishing/${method.slug}`}
                        className="flex items-center gap-1 hover:text-blue-600"
                      >
                        <span>{method.icon}</span>
                        {method.name}
                      </Link>
                    </td>
                    {MONTHS.map((m) => {
                      const count = getFishForMethodAndMonth(
                        method,
                        m.num
                      ).length;
                      const hasPeak = getFishForMethodAndMonth(
                        method,
                        m.num
                      ).some((f) => f.isPeak);
                      return (
                        <td
                          key={m.slug}
                          className={`border border-gray-200 p-0 text-center ${
                            m.num === currentMonth
                              ? "bg-blue-50 dark:bg-blue-950/50"
                              : ""
                          }`}
                        >
                          <Link
                            href={`/fishing/${method.slug}/${m.slug}`}
                            className={`block p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors ${
                              count === 0
                                ? "text-gray-300"
                                : hasPeak
                                  ? "text-orange-600 font-bold"
                                  : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {count > 0 ? count : "-"}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* モバイル: カード表示 */}
          <div className="md:hidden space-y-6">
            {FISHING_METHODS.map((method) => (
              <div key={method.slug}>
                <h3 className="font-bold text-lg mb-2 flex items-center gap-1">
                  <span>{method.icon}</span>
                  {method.name}
                </h3>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHS.map((m) => {
                    const count = getFishForMethodAndMonth(
                      method,
                      m.num
                    ).length;
                    const hasPeak = getFishForMethodAndMonth(
                      method,
                      m.num
                    ).some((f) => f.isPeak);
                    return (
                      <Link
                        key={m.slug}
                        href={`/fishing/${method.slug}/${m.slug}`}
                        className={`rounded-lg p-2 text-center text-sm transition-colors ${
                          m.num === currentMonth
                            ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-400"
                            : seasonColors[m.season]
                        } ${count === 0 ? "opacity-40" : "hover:ring-2 hover:ring-blue-300"}`}
                      >
                        <div className="text-xs text-gray-500">{m.name}</div>
                        <div
                          className={`font-bold ${
                            hasPeak
                              ? "text-orange-600"
                              : count > 0
                                ? "text-gray-800 dark:text-gray-200"
                                : "text-gray-300"
                          }`}
                        >
                          {count > 0 ? count : "-"}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 今月のおすすめ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">
            {MONTHS[currentMonth - 1].name}のおすすめ釣り方
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FISHING_METHODS.map((method) => {
              const fish = getFishForMethodAndMonth(method, currentMonth);
              if (fish.length === 0) return null;
              const peakCount = fish.filter((f) => f.isPeak).length;
              return (
                <Link
                  key={method.slug}
                  href={`/fishing/${method.slug}/${MONTHS[currentMonth - 1].slug}`}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{method.icon}</span>
                          <h3 className="font-bold">
                            {MONTHS[currentMonth - 1].name}の{method.name}
                          </h3>
                        </div>
                        <ArrowRight className="size-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">
                          {fish.length}魚種
                        </Badge>
                        {peakCount > 0 && (
                          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                            最盛期 {peakCount}魚種
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            }).filter(Boolean)}
          </div>
        </section>

        {/* 凡例 */}
        <section className="rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
          <h3 className="font-bold mb-2">凡例</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1">
              <span className="font-bold text-orange-600">太字オレンジ</span>
              <span>= 最盛期の魚あり</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-4 h-4 bg-blue-100 rounded border border-blue-300" />
              <span>= 今月</span>
            </div>
            {Object.entries(seasonBadgeColors)
              .slice(0, 4)
              .map(([season]) => (
                <div key={season} className="flex items-center gap-1">
                  <span
                    className={`inline-block w-4 h-4 rounded border border-gray-200 ${seasonColors[season]}`}
                  />
                  <span>= {season}</span>
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
