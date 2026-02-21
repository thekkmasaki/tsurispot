import type { Metadata } from "next";
import { QuizClient } from "./quiz-client";

export const metadata: Metadata = {
  title: "釣り用語クイズ｜あなたの釣り知識をテスト！",
  description:
    "釣りの専門用語をクイズ形式で学べる！初心者から上級者まで楽しめる4択クイズ。全問正解を目指そう。",
  openGraph: {
    title: "釣り用語クイズ｜あなたの釣り知識をテスト！",
    description:
      "釣りの専門用語をクイズ形式で学べる！初心者から上級者まで楽しめる4択クイズ。全問正解を目指そう。",
    type: "website",
    url: "https://tsurispot.com/glossary-quiz",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/glossary-quiz",
  },
};

export default function GlossaryQuizPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
          釣り用語クイズ
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
          あなたの釣り知識をテストしよう！4択クイズ全10問
        </p>
      </div>
      <QuizClient />
    </main>
  );
}
