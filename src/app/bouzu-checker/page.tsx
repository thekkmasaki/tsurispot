import type { Metadata } from "next";
import { Fish } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BouzuCheckerClient } from "./bouzu-checker-client";

export const metadata: Metadata = {
  title: "ボウズ確率チェッカー｜釣れない対策を事前診断",
  description:
    "釣り場の種類・魚種・釣法・時期・天候・経験レベルを選ぶだけでボウズ確率を即診断。ボウズ回避の具体的な対策アドバイスも表示。釣行前に必ずチェック！",
  openGraph: {
    title: "ボウズ確率チェッカー｜釣れない対策を事前診断",
    description:
      "釣り場・魚種・時期などを選ぶだけでボウズ確率を診断。対策アドバイスも表示する釣り人必携ツール。",
    type: "website",
    url: "https://tsurispot.com/bouzu-checker",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/bouzu-checker",
  },
};

const jsonLd = {
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
      name: "ボウズ確率チェッカー",
      item: "https://tsurispot.com/bouzu-checker",
    },
  ],
};

export default function BouzuCheckerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        {/* ヘッダー */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <div className="flex items-center gap-2 text-indigo-200 text-sm mb-3">
              <Link href="/" className="hover:text-white transition-colors">
                ホーム
              </Link>
              <ChevronRight className="size-3" />
              <span>ボウズ確率チェッカー</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Fish className="size-7 sm:size-8" />
              ボウズ確率チェッカー
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base">
              釣り場の条件や経験レベルからボウズ確率を事前に診断。対策アドバイスも表示します。
            </p>
          </div>
        </section>

        <BouzuCheckerClient />

        {/* ボウズ回避のための導線 */}
        <section className="mx-auto max-w-3xl px-4 pb-12">
          <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
            <h2 className="mb-2 text-lg font-bold text-indigo-900">ボウズを回避するために</h2>
            <p className="mb-4 text-sm text-indigo-700">
              条件の良い釣り場と適切な道具選びで、ボウズの確率を大幅に下げられます。
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/spots"
                className="rounded-lg border border-indigo-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-indigo-800">好条件のスポットを探す</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  全国2,100箇所以上の釣り場
                </p>
              </Link>
              <Link
                href="/catchable-now"
                className="rounded-lg border border-indigo-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-indigo-800">今釣れる魚を確認</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  旬の魚を狙ってボウズ回避
                </p>
              </Link>
              <Link
                href="/gear"
                className="rounded-lg border border-indigo-200 bg-white p-4 text-center transition-shadow hover:shadow-md"
              >
                <p className="font-semibold text-indigo-800">おすすめの釣り道具</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  適切な道具で釣果アップ
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
