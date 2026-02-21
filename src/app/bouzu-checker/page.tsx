import type { Metadata } from "next";
import { Fish } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BouzuCheckerClient } from "./bouzu-checker-client";

export const metadata: Metadata = {
  title: "ボウズ確率チェッカー｜釣れない対策を事前診断｜ツリスポ",
  description:
    "釣り場の種類・魚種・釣法・時期・天候・経験レベルを選ぶだけでボウズ確率を即診断。ボウズ回避の具体的な対策アドバイスも表示。釣行前に必ずチェック！",
  openGraph: {
    title: "ボウズ確率チェッカー｜釣れない対策を事前診断｜ツリスポ",
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
      </div>
    </>
  );
}
