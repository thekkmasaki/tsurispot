import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { QuizClient } from "./quiz-client";

export const metadata: Metadata = {
  title: "釣り用語クイズ｜あなたの釣り知識をテスト！",
  description:
    "釣りの専門用語をクイズ形式で学べる！初心者から上級者まで楽しめる4択クイズ。全問正解を目指そう。",
  keywords: ["釣り用語クイズ", "釣り用語", "釣り知識テスト", "釣りクイズ", "釣り初心者", "釣り用語集"],
  openGraph: {
    title: "釣り用語クイズ｜あなたの釣り知識をテスト！",
    description:
      "釣りの専門用語をクイズ形式で学べる！初心者から上級者まで楽しめる4択クイズ。全問正解を目指そう。",
    type: "website",
    url: "https://tsurispot.com/glossary-quiz",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=釣り用語クイズ&emoji=📖", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "釣り用語クイズ｜あなたの釣り知識をテスト！",
    description: "釣りの専門用語をクイズ形式で学べる！初心者から上級者まで楽しめる4択クイズ。",
    images: ["https://tsurispot.com/api/og?title=釣り用語クイズ&emoji=📖"],
  },
  alternates: {
    canonical: "https://tsurispot.com/glossary-quiz",
  },
};

export default function GlossaryQuizPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: "https://tsurispot.com" },
      { "@type": "ListItem", position: 2, name: "釣り用語集", item: "https://tsurispot.com/glossary" },
      { "@type": "ListItem", position: 3, name: "釣り用語クイズ", item: "https://tsurispot.com/glossary-quiz" },
    ],
  };

  const quizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: "釣り用語クイズ",
    description: "釣りの専門用語をクイズ形式で学べる4択クイズ。初心者から上級者まで楽しめます。",
    educationalLevel: "beginner",
    about: { "@type": "Thing", name: "釣り用語" },
    provider: { "@type": "Organization", name: "ツリスポ", url: "https://tsurispot.com" },
    numberOfQuestions: 10,
    typicalAgeRange: "10-",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
      />
      <main className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <Breadcrumb items={[
          { label: "ホーム", href: "/" },
          { label: "釣り用語集", href: "/glossary" },
          { label: "釣り用語クイズ" },
        ]} />
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣り用語クイズ
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            あなたの釣り知識をテストしよう！4択クイズ全10問
          </p>
        </div>
        <QuizClient />
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-gray-900">関連コンテンツ</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/glossary">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-amber-300 hover:shadow-sm">
                <p className="text-sm font-semibold text-gray-800">📖 釣り用語集</p>
                <p className="text-xs text-gray-500">用語の意味を詳しく学ぶ</p>
              </div>
            </Link>
            <Link href="/quiz">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-amber-300 hover:shadow-sm">
                <p className="text-sm font-semibold text-gray-800">🎯 釣りクイズ</p>
                <p className="text-xs text-gray-500">全8カテゴリ240問に挑戦</p>
              </div>
            </Link>
            <Link href="/for-beginners">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-amber-300 hover:shadow-sm">
                <p className="text-sm font-semibold text-gray-800">🎓 初心者ガイド</p>
                <p className="text-xs text-gray-500">これから釣りを始める方へ</p>
              </div>
            </Link>
            <Link href="/instructor-exam">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-amber-300 hover:shadow-sm">
                <p className="text-sm font-semibold text-gray-800">📝 インストラクター試験対策</p>
                <p className="text-xs text-gray-500">全7章・確認クイズ130問</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
