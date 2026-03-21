import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ListOrdered } from "lucide-react";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";
import { mannersQuestions } from "@/lib/data/instructor-exam/manners-questions";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第3章 釣りマナーと指導法 確認クイズ（全40問）| 公認釣りインストラクター試験対策",
  description:
    "先行者優先・ゴミ問題・漁業者との共存・指導法の知識を全40問の4択クイズでチェック。1問ずつ回答して理解度を確認しよう。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/manners/quiz`,
  },
};

export default function MannersQuizPage() {
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
              { "@type": "ListItem", position: 3, name: "釣りマナーと指導法", item: `${baseUrl}/instructor-exam/manners` },
              { "@type": "ListItem", position: 4, name: "確認クイズ", item: `${baseUrl}/instructor-exam/manners/quiz` },
            ],
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
            <li><Link href="/instructor-exam/manners" className="hover:text-foreground">釣りマナーと指導法</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">確認クイズ</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-800 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-teal-300">第3章 釣りマナーと指導法</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">確認クイズ</h1>
          <p className="mt-2 text-teal-200">
            全{mannersQuestions.length}問の4択クイズで理解度をチェックしましょう。
          </p>
        </div>

        <ExamQuiz questions={mannersQuestions} />

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/instructor-exam/manners"
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
