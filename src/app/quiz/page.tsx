import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, GraduationCap, Lightbulb } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { QuizCategoryCard } from "@/components/quiz/quiz-category-card";
import { QUIZ_CATEGORIES } from "@/types/quiz";

export const metadata: Metadata = {
  title: "釣りクイズ — 遊んで学べる釣り検定｜全240問 | ツリスポ",
  description:
    "釣りの知識を楽しくテスト！魚の名前、旬の時期、釣り方、毒魚の見分け方など全8カテゴリ240問。初心者から上級者まで楽しめる4択クイズで、釣りの知識を身につけよう。",
  openGraph: {
    title: "釣りクイズ — 遊んで学べる釣り検定 | ツリスポ",
    description:
      "全8カテゴリ240問！釣りの知識を楽しくテストしよう。",
    type: "website",
    url: "https://tsurispot.com/quiz",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=釣りクイズ&emoji=🎯", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://tsurispot.com/quiz",
  },
  twitter: {
    card: "summary_large_image",
    title: "釣りクイズ — 遊んで学べる釣り検定 | ツリスポ",
    description: "全8カテゴリ240問！釣りの知識を楽しくテストしよう。",
    images: ["https://tsurispot.com/api/og?title=釣りクイズ&emoji=🎯"],
  },
  keywords: [
    "釣りクイズ",
    "釣り検定",
    "魚クイズ",
    "釣り知識",
    "毒魚クイズ",
    "釣り用語",
    "釣り方クイズ",
    "釣り問題",
    "釣りテスト",
    "魚の名前クイズ",
  ],
};

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
  ],
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "釣りクイズ — 遊んで学べる釣り検定",
  description:
    "釣りの知識を楽しくテスト！魚の名前、旬の時期、釣り方、毒魚の見分け方など全8カテゴリ240問。初心者から上級者まで楽しめる4択クイズ。",
  url: "https://tsurispot.com/quiz",
  isPartOf: {
    "@type": "WebSite",
    name: "ツリスポ",
    url: "https://tsurispot.com",
  },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: QUIZ_CATEGORIES.length,
    itemListElement: QUIZ_CATEGORIES.map((cat, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: cat.name,
      url: `https://tsurispot.com/quiz/${cat.slug}`,
    })),
  },
};

const totalQuestions = QUIZ_CATEGORIES.reduce(
  (sum, cat) => sum + cat.questionCount,
  0
);

const relatedLinks = [
  {
    href: "/fish",
    icon: BookOpen,
    label: "魚図鑑を見る",
    sub: "115種以上の魚種データベース",
  },
  {
    href: "/guide",
    icon: Compass,
    label: "釣り方ガイド",
    sub: "サビキ・ルアー・エギングなど",
  },
  {
    href: "/for-beginners",
    icon: GraduationCap,
    label: "初心者ガイド",
    sub: "これから釣りを始める方へ",
  },
  {
    href: "/glossary",
    icon: Lightbulb,
    label: "釣り用語集",
    sub: "知っておきたい釣り用語",
  },
];

export default function QuizListPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
        {/* ヒーローセクション */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
            <h1 className="text-2xl font-bold sm:text-3xl">
              <span className="mr-2">🎯</span>
              釣りクイズ — 遊んで学べる釣り検定
            </h1>
            <p className="mt-3 text-amber-100 text-sm sm:text-base leading-relaxed">
              全{QUIZ_CATEGORIES.length}カテゴリ・{totalQuestions}
              問以上の問題で釣りの知識を試そう！
              <br className="hidden sm:block" />
              初心者から上級者まで楽しめるクイズを用意しました。
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-6 pb-16">
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "釣りクイズ" },
            ]}
          />

          {/* カテゴリ一覧 */}
          <section className="mt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {QUIZ_CATEGORIES.map((cat) => (
                <QuizCategoryCard
                  key={cat.slug}
                  slug={cat.slug}
                  name={cat.name}
                  description={cat.description}
                  icon={cat.icon}
                  questionCount={cat.questionCount}
                  color={cat.color}
                />
              ))}
            </div>
          </section>

          {/* クイズの特徴（GEO: 統計データ追加） */}
          <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-bold text-gray-900">ツリスポ釣りクイズの特徴</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              ツリスポの釣りクイズは、<strong>全国2,141か所以上の釣り場データ</strong>と<strong>115種以上の魚種データベース</strong>をもとに作成された本格的な釣り知識テストです。
              全{QUIZ_CATEGORIES.length}カテゴリ・{totalQuestions}問以上を収録し、初心者から上級者まで幅広いレベルに対応しています。
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <li className="rounded-lg bg-amber-50 px-3 py-2 text-center">
                <span className="block text-lg font-bold text-amber-600">{QUIZ_CATEGORIES.length}</span>
                <span className="text-xs text-gray-500">カテゴリ</span>
              </li>
              <li className="rounded-lg bg-amber-50 px-3 py-2 text-center">
                <span className="block text-lg font-bold text-amber-600">{totalQuestions}+</span>
                <span className="text-xs text-gray-500">問題数</span>
              </li>
              <li className="rounded-lg bg-amber-50 px-3 py-2 text-center">
                <span className="block text-lg font-bold text-amber-600">2,141+</span>
                <span className="text-xs text-gray-500">釣り場データ</span>
              </li>
              <li className="rounded-lg bg-amber-50 px-3 py-2 text-center">
                <span className="block text-lg font-bold text-amber-600">115+</span>
                <span className="text-xs text-gray-500">魚種</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-gray-400">
              出典: ツリスポ独自データベース（2026年3月時点）。各クイズの問題は釣り場・魚種の実データに基づいて作成しています。
            </p>
          </section>

          {/* インストラクター試験対策リンク */}
          <div className="mt-8 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
            <h2 className="text-lg font-bold text-indigo-800">釣りインストラクター試験対策</h2>
            <p className="mt-1 text-sm text-indigo-700">
              公認釣りインストラクター試験の筆記対策に特化した学習ガイドと確認クイズ（全130問）もご利用いただけます。
            </p>
            <Link
              href="/instructor-exam"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              試験対策ガイドを見る →
            </Link>
          </div>

          {/* 関連コンテンツ */}
          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 sm:text-xl">
              <span>📚</span>
              もっと釣りを学ぶ
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              クイズで気になったテーマを深掘りしよう
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {relatedLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all hover:border-amber-300 hover:shadow-sm">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                      <link.icon className="size-5 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {link.label}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {link.sub}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
