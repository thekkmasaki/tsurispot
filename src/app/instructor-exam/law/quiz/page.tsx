import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";
import { lawQuestions } from "@/lib/data/instructor-exam/law-questions";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第1章 漁業関連法規 確認クイズ（全50問）| 公認釣りインストラクター試験対策",
  description:
    "漁業法・漁業権・遊漁船業法・水産資源保護法の知識を全50問の4択クイズでチェック。1問ずつ回答して理解度を確認しよう。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/law/quiz`,
  },
  openGraph: {
    title: "漁業関連法規 確認クイズ（全50問）| 釣りインストラクター試験対策 | ツリスポ",
    description: "漁業法・漁業権・遊漁船業法・水産資源保護法の知識を全50問の4択クイズでチェック。",
    url: `${baseUrl}/instructor-exam/law/quiz`,
    type: "website",
    siteName: "ツリスポ",
  },
  twitter: {
    card: "summary_large_image",
    title: "漁業関連法規 確認クイズ（全50問）| 試験対策",
    description: "漁業法・漁業権・遊漁船業法の知識を4択クイズでチェック。合格目安80点以上。",
  },
};

export default function LawQuizPage() {
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
              { "@type": "ListItem", position: 3, name: "漁業関連法規", item: `${baseUrl}/instructor-exam/law` },
              { "@type": "ListItem", position: 4, name: "確認クイズ", item: `${baseUrl}/instructor-exam/law/quiz` },
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
            name: "漁業関連法規 確認クイズ（全50問）",
            description: "漁業法・漁業権・遊漁船業法・水産資源保護法の知識を4択クイズで確認",
            educationalLevel: "advanced",
            about: { "@type": "Thing", name: "漁業関連法規" },
            provider: { "@type": "Organization", name: "ツリスポ", url: baseUrl },
            isPartOf: { "@type": "Course", name: "公認釣りインストラクター試験対策ガイド", url: `${baseUrl}/instructor-exam` },
            numberOfQuestions: 50,
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
            <li><Link href="/instructor-exam/law" className="hover:text-foreground">漁業関連法規</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">確認クイズ</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-sky-300">第1章 漁業関連法規</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">漁業関連法規 確認クイズ</h1>
          <p className="mt-2 text-sky-200">
            全{lawQuestions.length}問の4択クイズで理解度をチェックしましょう。
          </p>
        </div>

        <ExamQuiz questions={lawQuestions} />

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/instructor-exam/law"
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
