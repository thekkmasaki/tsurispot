import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";
import { techniqueQuestions } from "@/lib/data/instructor-exam/technique-questions";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第6章 釣り技術と知識 確認クイズ（全40問）| 公認釣りインストラクター試験対策",
  description:
    "キャスティング・アタリとアワセ・ランディング・締め方・釣行計画の知識を全40問の4択クイズでチェック。1問ずつ回答して理解度を確認しよう。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/technique/quiz`,
  },
  openGraph: {
    title: "釣り技術と知識 確認クイズ（全40問）| 釣りインストラクター試験対策 | ツリスポ",
    description: "キャスティング・アタリとアワセ・ランディング・締め方・釣行計画の知識を全40問の4択クイズでチェック。",
    url: `${baseUrl}/instructor-exam/technique/quiz`,
    type: "website",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=釣り技術と知識 確認クイズ&emoji=🎣", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "釣り技術と知識 確認クイズ（全40問）| 試験対策",
    description: "キャスティング・アタリとアワセ・ランディング・締め方の知識を4択クイズでチェック。合格目安80点以上。",
    images: ["https://tsurispot.com/api/og?title=釣り技術と知識 確認クイズ&emoji=🎣"],
  },
  keywords: ["キャスティングクイズ", "アタリ問題", "ランディング", "魚の締め方", "釣りインストラクター", "試験問題"],
};

export default function TechniqueQuizPage() {
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
              { "@type": "ListItem", position: 3, name: "釣り技術と知識", item: `${baseUrl}/instructor-exam/technique` },
              { "@type": "ListItem", position: 4, name: "確認クイズ", item: `${baseUrl}/instructor-exam/technique/quiz` },
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
            name: "釣り技術と知識 確認クイズ（全40問）",
            description: "キャスティング・アタリとアワセ・ランディング・締め方・釣行計画の知識を4択クイズで確認",
            educationalLevel: "advanced",
            about: { "@type": "Thing", name: "釣り技術と知識" },
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
            <li><Link href="/instructor-exam/technique" className="hover:text-foreground">釣り技術と知識</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">確認クイズ</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl bg-gradient-to-br from-indigo-700 to-violet-800 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-indigo-300">第6章 釣り技術と知識</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">確認クイズ</h1>
          <p className="mt-2 text-indigo-200">
            全{techniqueQuestions.length}問の4択クイズで理解度をチェックしましょう。
          </p>
        </div>

        <ExamQuiz questions={techniqueQuestions} />

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/instructor-exam/technique"
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
