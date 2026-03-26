import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { QuizGame } from "@/components/quiz/quiz-game";
import { QUIZ_CATEGORIES } from "@/types/quiz";
import { getQuestions, getQuestionsByCategory } from "@/lib/data/quiz-questions";

type Props = {
  params: Promise<{ category: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return QUIZ_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = QUIZ_CATEGORIES.find((c) => c.slug === category);
  if (!cat) return {};

  return {
    title: `${cat.name} — 釣りクイズ | ツリスポ`,
    description: `${cat.description}。全${cat.questionCount}問の4択クイズに挑戦しよう！`,
    openGraph: {
      title: `${cat.icon} ${cat.name} | ツリスポ`,
      description: cat.description,
      type: "website",
      url: `https://tsurispot.com/quiz/${cat.slug}`,
      siteName: "ツリスポ",
      images: [{ url: `https://tsurispot.com/api/og?title=${encodeURIComponent(cat.name)}&emoji=${encodeURIComponent(cat.icon)}`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${cat.icon} ${cat.name} | ツリスポ`,
      description: cat.description,
      images: [`https://tsurispot.com/api/og?title=${encodeURIComponent(cat.name)}&emoji=${encodeURIComponent(cat.icon)}`],
    },
    alternates: {
      canonical: `https://tsurispot.com/quiz/${cat.slug}`,
    },
    keywords: [cat.name, "釣りクイズ", "4択クイズ", "釣り知識", cat.nameShort],
  };
}

export default async function QuizCategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = QUIZ_CATEGORIES.find((c) => c.slug === category);
  if (!cat) notFound();

  // 10問をランダムに取得
  const questions = getQuestions(category, undefined, 10);

  // FAQ用に最初の5問を取得（構造化データ向け）
  const allCategoryQuestions = getQuestionsByCategory(category);
  const faqQuestions = allCategoryQuestions.slice(0, 5);

  const breadcrumbJsonLd = {
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
        name: "釣りクイズ",
        item: "https://tsurispot.com/quiz",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: cat.name,
        item: `https://tsurispot.com/quiz/${cat.slug}`,
      },
    ],
  };

  const faqJsonLd =
    faqQuestions.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqQuestions.map((q) => ({
            "@type": "Question",
            name: q.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: `正解: ${q.choices[q.correctIndex]}。${q.explanation}`,
            },
          })),
        }
      : null;

  const quizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `${cat.name}（全${cat.questionCount}問）`,
    description: cat.description,
    educationalLevel: "beginner",
    about: { "@type": "Thing", name: cat.name },
    provider: { "@type": "Organization", name: "ツリスポ", url: "https://tsurispot.com" },
    numberOfQuestions: cat.questionCount,
    typicalAgeRange: "10-",
  };

  // カテゴリごとのグラデーション色マッピング
  const colorMap: Record<string, string> = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-amber-500",
    purple: "from-purple-500 to-violet-500",
    red: "from-red-500 to-rose-500",
    teal: "from-teal-500 to-cyan-500",
    yellow: "from-yellow-500 to-amber-500",
    pink: "from-pink-500 to-rose-500",
  };

  const gradient = colorMap[cat.color] || "from-blue-500 to-cyan-500";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* ヒーローセクション */}
        <section
          className={`bg-gradient-to-r ${gradient} text-white`}
        >
          <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
            <Link
              href="/quiz"
              className="mb-4 inline-flex items-center gap-1 text-sm text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              クイズ一覧に戻る
            </Link>
            <h1 className="text-2xl font-bold sm:text-3xl">
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </h1>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
              {cat.description}
            </p>
            <p className="mt-1 text-xs text-white/70">
              全{cat.questionCount}問からランダムに10問出題
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-6 pb-16">
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "釣りクイズ", href: "/quiz" },
              { label: cat.name },
            ]}
          />

          {/* クイズゲーム */}
          <div className="mt-6">
            <QuizGame
              questions={questions}
              categoryName={cat.name}
              categoryIcon={cat.icon}
            />
          </div>
        </div>
      </div>
    </>
  );
}
