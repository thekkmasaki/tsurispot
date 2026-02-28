import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Fish } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import QuizClient from "./quiz-client";

export const metadata: Metadata = {
  title: "釣りスタイル診断｜あなたにぴったりの釣り方は？",
  description:
    "たった5問であなたにぴったりの釣りスタイルを診断。サビキ・ルアー・エギングなど最適な釣り方とおすすめスポットを提案。初心者もベテランも無料で今すぐ診断。",
  openGraph: {
    title: "釣りスタイル診断｜あなたにぴったりの釣り方は？",
    description: "5つの質問に答えるだけで、あなたにおすすめの釣りスタイルがわかる！初心者からベテランまで楽しめる釣り診断。",
    type: "website",
    url: "https://tsurispot.com/quiz",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/quiz",
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
      name: "釣りスタイル診断",
      item: "https://tsurispot.com/quiz",
    },
  ],
};

export default function QuizPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
        {/* ヘッダー */}
        <section className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Fish className="size-7 sm:size-8" />
              釣りスタイル診断
            </h1>
            <p className="mt-2 text-cyan-100 text-sm sm:text-base">
              5つの質問に答えるだけで、あなたにぴったりの釣りスタイルがわかります。
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-6 pb-16">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "釣りスタイル診断" }]} />
          <QuizClient />
        </div>
      </div>
    </>
  );
}
