import type { Metadata } from "next";
import Link from "next/link";
import { ExamQuiz } from "@/components/instructor-exam/exam-quiz";
import { tackleQuestions } from "@/lib/data/instructor-exam/tackle-questions";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "第5章 釣り具の知識 確認クイズ（全40問）| 公認釣りインストラクター試験対策",
  description:
    "ロッド・リール・ライン・針・仕掛けの知識を全40問の4択クイズでチェック。1問ずつ回答して理解度を確認しよう。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam/tackle/quiz`,
  },
};

export default function TackleQuizPage() {
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
              { "@type": "ListItem", position: 3, name: "釣り具の知識", item: `${baseUrl}/instructor-exam/tackle` },
              { "@type": "ListItem", position: 4, name: "確認クイズ", item: `${baseUrl}/instructor-exam/tackle/quiz` },
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
            <li><Link href="/instructor-exam/tackle" className="hover:text-foreground">釣り具の知識</Link></li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">確認クイズ</li>
          </ol>
        </nav>

        <div className="mb-8 rounded-2xl bg-gradient-to-br from-amber-700 to-orange-800 px-6 py-8 text-white sm:px-10">
          <p className="text-sm text-amber-300">第5章 釣り具の知識</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">確認クイズ</h1>
          <p className="mt-2 text-amber-200">
            全{tackleQuestions.length}問の4択クイズで理解度をチェックしましょう。
          </p>
        </div>

        <ExamQuiz questions={tackleQuestions} />

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/instructor-exam/tackle"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            学習ページに戻る
          </Link>
          <Link
            href="/instructor-exam"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            章の一覧へ
          </Link>
        </div>
      </div>
    </>
  );
}
