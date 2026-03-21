import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";
import { safetyQuestions } from "@/lib/data/instructor-exam/safety-questions";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第2章 気象海象と安全対策 確認クイズ（全40問）| 公認釣りインストラクター試験対策",
  description:
    "天気図・潮汐・波浪・落水事故対処・救命胴衣の知識を全40問の4択クイズでチェック。1問ずつ回答して理解度を確認しよう。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/safety/quiz`,
  },
  openGraph: {
    title: "気象海象と安全対策 確認クイズ（全40問）| 釣りインストラクター試験対策 | ツリスポ",
    description: "天気図・潮汐・波浪・安全装備の知識を全40問の4択クイズでチェック。",
    url: `${baseUrl}/instructor-exam/safety/quiz`,
    type: "website",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=気象海象と安全対策 確認クイズ&emoji=🌊", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "気象海象と安全対策 確認クイズ（全40問）| 試験対策",
    description: "天気図・潮汐・波浪・安全装備の知識を4択クイズでチェック。合格目安80点以上。",
    images: ["https://tsurispot.com/api/og?title=気象海象と安全対策 確認クイズ&emoji=🌊"],
  },
  keywords: ["天気図クイズ", "潮汐問題", "波浪クイズ", "釣りインストラクター", "安全対策試験"],
};

export default function SafetyQuizPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "ホーム", item: baseUrl },
              { "@type": "ListItem", position: 2, name: "インストラクター試験", item: `${baseUrl}/instructor-exam` },
              { "@type": "ListItem", position: 3, name: "気象海象と安全対策", item: `${baseUrl}/instructor-exam/safety` },
              { "@type": "ListItem", position: 4, name: "確認クイズ", item: `${baseUrl}/instructor-exam/safety/quiz` },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Quiz",
            name: "気象海象と安全対策 確認クイズ（全40問）",
            description: "天気図・潮汐・波浪・落水事故対処・救命胴衣の知識を4択クイズで確認",
            educationalLevel: "advanced",
            about: { "@type": "Thing", name: "気象海象と安全対策" },
            provider: { "@type": "Organization", name: "ツリスポ", url: baseUrl },
            isPartOf: { "@type": "Course", name: "公認釣りインストラクター試験対策ガイド", url: `${baseUrl}/instructor-exam` },
            numberOfQuestions: 40,
            typicalAgeRange: "20-",
          }),
        }}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <nav aria-label="パンくずリスト" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-foreground">ホーム</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/instructor-exam" className="hover:text-foreground">インストラクター試験</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/instructor-exam/safety" className="hover:text-foreground">気象海象と安全対策</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">確認クイズ</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl bg-gradient-to-br from-red-700 to-rose-800 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-red-300">第2章 気象海象と安全対策</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">確認クイズ</h1>
          <p className="mt-2 text-red-200">
            全{safetyQuestions.length}問の4択クイズで理解度をチェックしましょう。
          </p>
        </div>

        <ExamQuiz questions={safetyQuestions} />

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/instructor-exam/safety"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" />
            学習ページに戻る
          </Link>
          <Link
            href="/instructor-exam"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ListOrdered className="size-4" />
            章の一覧へ
          </Link>
        </div>
      </div>
    </>
  );
}
