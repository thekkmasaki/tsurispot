import type { Metadata } from "next";
import Link from "next/link";

const baseUrl = "https://tsurispot.com";

export const metadata: Metadata = {
  title: "公認釣りインストラクター試験対策ガイド",
  description:
    "公認釣りインストラクター試験（JOFI）の筆記試験対策に役立つ学習ガイド。漁業法・遊漁船業法などの法規、釣りマナー・指導法、釣り具の知識を章ごとに解説。確認クイズ付きで講習前の予習に最適。",
  alternates: {
    canonical: `${baseUrl}/instructor-exam`,
  },
  openGraph: {
    title: "公認釣りインストラクター試験対策ガイド | ツリスポ",
    description:
      "公認釣りインストラクター試験の筆記対策をオンラインで学べる無料ガイド。全7章・確認クイズ130問以上。",
    url: `${baseUrl}/instructor-exam`,
    type: "website",
    siteName: "ツリスポ",
  },
  twitter: {
    card: "summary_large_image",
    title: "公認釣りインストラクター試験対策ガイド | ツリスポ",
    description:
      "漁業法・マナー・釣り具の知識を全7章・確認クイズ130問以上で学べる無料ガイド。",
  },
  keywords: [
    "釣りインストラクター",
    "試験対策",
    "公認釣りインストラクター",
    "JOFI",
    "全釣協",
    "漁業法",
    "釣りマナー",
    "釣り具",
    "過去問",
    "問題集",
    "釣り資格",
  ],
};

/** 章データ */
const chapters = [
  {
    num: 1,
    title: "漁業関連法規",
    slug: "law",
    icon: "\u2696\uFE0F",
    description:
      "漁業法・遊漁船業法・水産資源保護法など、インストラクターに必要な法規知識を体系的に学びます。",
    quizCount: 50,
    ready: true,
  },
  {
    num: 2,
    title: "気象海象と安全対策",
    slug: "safety",
    icon: "\uD83C\uDF0A",
    description:
      "天気図の読み方、潮汐、波浪、落雷・落水事故の予防策など安全管理の知識を解説します。",
    quizCount: 0,
    ready: false,
  },
  {
    num: 3,
    title: "釣りマナーと指導法",
    slug: "manners",
    icon: "\uD83D\uDCCB",
    description:
      "先行者優先の原則、ゴミの持ち帰り、周辺住民への配慮など、インストラクターとしての指導法を学びます。",
    quizCount: 40,
    ready: true,
  },
  {
    num: 4,
    title: "釣りの文化史",
    slug: "history",
    icon: "\uD83D\uDCDC",
    description:
      "日本の釣り文化の歴史、和竿・テンカラなどの伝統技法、釣り文学の名作を紹介します。",
    quizCount: 0,
    ready: false,
  },
  {
    num: 5,
    title: "釣り具の知識",
    slug: "tackle",
    icon: "\uD83C\uDFA3",
    description:
      "竿・リール・糸・針・仕掛けなど、釣り具の基本構造と選び方を体系的に解説します。",
    quizCount: 40,
    ready: true,
  },
  {
    num: 6,
    title: "釣り技術と知識",
    slug: "technique",
    icon: "\uD83D\uDC1F",
    description:
      "キャスティング、合わせ方、取り込み、魚の締め方など実技に関わる知識を学びます。",
    quizCount: 0,
    ready: false,
  },
  {
    num: 7,
    title: "水域の自然環境知識",
    slug: "environment",
    icon: "\uD83C\uDF3F",
    description:
      "魚類の生態、水質環境、プランクトン、潮流と釣果の関係など自然科学の基礎を学びます。",
    quizCount: 0,
    ready: false,
  },
];

export default function InstructorExamPage() {
  return (
    <>
      {/* JSON-LD: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "ホーム",
                item: baseUrl,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "公認釣りインストラクター試験対策",
                item: `${baseUrl}/instructor-exam`,
              },
            ],
          }),
        }}
      />
      {/* JSON-LD: Course (LearningResource) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: "公認釣りインストラクター試験対策ガイド",
            description:
              "公認釣りインストラクター試験（JOFI）の筆記試験対策に役立つ無料学習ガイド。漁業法・マナー・釣り具の知識を全7章・確認クイズ130問以上で体系的に学べます。",
            url: `${baseUrl}/instructor-exam`,
            provider: {
              "@type": "Organization",
              name: "ツリスポ",
              url: baseUrl,
            },
            isAccessibleForFree: true,
            inLanguage: "ja",
            coursePrerequisites: "20歳以上、釣りに興味がある方",
            hasCourseInstance: {
              "@type": "CourseInstance",
              courseMode: "online",
              courseWorkload: "PT4H",
            },
            about: [
              { "@type": "Thing", name: "漁業法" },
              { "@type": "Thing", name: "釣りマナー" },
              { "@type": "Thing", name: "釣り具の知識" },
              { "@type": "Thing", name: "公認釣りインストラクター" },
            ],
            hasPart: chapters.filter(c => c.ready).map((c) => ({
              "@type": "CreativeWork",
              name: `第${c.num}章 ${c.title}`,
              url: `${baseUrl}/instructor-exam/${c.slug}`,
            })),
            isPartOf: {
              "@id": `${baseUrl}/#website`,
            },
          }),
        }}
      />

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* パンくず */}
        <nav aria-label="パンくずリスト" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-foreground">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-foreground">
              公認釣りインストラクター試験対策
            </li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-sky-800 to-blue-900 px-6 py-10 text-white sm:px-10">
          <h1 className="text-2xl font-bold sm:text-3xl">
            公認釣りインストラクター試験対策ガイド
          </h1>
          <p className="mt-3 text-sky-200">
            講習前の予習に最適 -- 全7章の学習ガイドと確認クイズで筆記試験の知識を整理できます
          </p>
        </div>

        {/* 資格の概要テーブル */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">資格の概要</h2>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                <tr className="bg-muted/30">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                    主催
                  </th>
                  <td className="px-4 py-3">
                    一般社団法人 全日本釣り団体協議会（全釣り協）
                  </td>
                </tr>
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                    受験資格
                  </th>
                  <td className="px-4 py-3">20歳以上</td>
                </tr>
                <tr className="bg-muted/30">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                    費用の目安
                  </th>
                  <td className="px-4 py-3">
                    受講料 約1万円 + 受験料 約1万円 + 登録費 約2万円 = <strong>計 約4万円</strong>
                  </td>
                </tr>
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                    試験内容
                  </th>
                  <td className="px-4 py-3">
                    筆記（選択式 60分）+ 論文 + 実技 + 面接
                  </td>
                </tr>
                <tr className="bg-muted/30">
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                    区分
                  </th>
                  <td className="px-4 py-3">海面 / 内水面</td>
                </tr>
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left font-semibold">
                    更新
                  </th>
                  <td className="px-4 py-3">3年ごとの更新研修</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 学習ガイド（解説ページ） */}
        <section className="mb-10">
          <h2 className="mb-2 text-xl font-bold">学習ガイド</h2>
          <p className="mb-4 text-sm text-muted-foreground">各科目の重要ポイントを教科書形式で解説。講習前の予習に最適です。</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {chapters.map((ch) =>
              ch.ready ? (
                <Link
                  key={ch.slug}
                  href={`/instructor-exam/${ch.slug}`}
                  className="group flex gap-4 rounded-xl border p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-2xl">
                    {ch.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground">
                      第{ch.num}章
                    </p>
                    <h3 className="font-bold group-hover:text-primary">
                      {ch.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {ch.description}
                    </p>
                  </div>
                </Link>
              ) : (
                <div
                  key={ch.slug}
                  className="flex gap-4 rounded-xl border border-dashed p-5 opacity-60"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-2xl">
                    {ch.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground">
                      第{ch.num}章
                    </p>
                    <h3 className="font-bold">{ch.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {ch.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-gray-400">
                      準備中
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* 確認クイズ */}
        <section className="mb-10">
          <h2 className="mb-2 text-xl font-bold">確認クイズ</h2>
          <p className="mb-4 text-sm text-muted-foreground">4択問題で知識の定着度をチェック。各章の学習後に挑戦してみましょう。</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {chapters.filter((ch) => ch.ready && ch.quizCount > 0).map((ch) => (
              <Link
                key={`quiz-${ch.slug}`}
                href={`/instructor-exam/${ch.slug}#summary`}
                className="group rounded-xl border p-5 text-center transition-colors hover:border-purple-400 hover:bg-purple-50"
              >
                <span className="text-3xl">{ch.icon}</span>
                <h3 className="mt-2 font-bold group-hover:text-purple-700">
                  第{ch.num}章 {ch.title}
                </h3>
                <p className="mt-1 text-lg font-bold text-purple-600">
                  {ch.quizCount}問
                </p>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            全{chapters.reduce((sum, ch) => sum + ch.quizCount, 0)}問収録（今後さらに追加予定）
          </p>
        </section>

        {/* 論文・実技対策 */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">その他の試験対策</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-dashed p-5 opacity-60">
              <h3 className="font-bold">論文対策</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                頻出テーマと書き方のポイントを解説（準備中）
              </p>
            </div>
            <div className="rounded-xl border border-dashed p-5 opacity-60">
              <h3 className="font-bold">実技対策</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                キャスティング・結び方の実技試験対策（準備中）
              </p>
            </div>
          </div>
        </section>

        {/* ツリスポとの連携 */}
        <section className="mb-10 rounded-xl bg-green-50 p-6 border border-green-200">
          <h2 className="mb-2 text-lg font-bold text-green-800">
            ツリスポの関連コンテンツ
          </h2>
          <p className="mb-4 text-sm text-green-700">
            試験範囲に関連するツリスポのページも併せて活用すると、実践的な理解が深まります。
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/fishing-rules"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                釣りのルールとマナー
              </Link>{" "}
              -- 都道府県別の規制まとめ
            </li>
            <li>
              <Link
                href="/guide/equipment"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                釣り道具ガイド
              </Link>{" "}
              -- 竿・リール・仕掛けの基礎知識
            </li>
            <li>
              <Link
                href="/safety"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                安全ガイド
              </Link>{" "}
              -- 落水事故・落雷対策
            </li>
            <li>
              <Link
                href="/fish"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                魚種図鑑
              </Link>{" "}
              -- 魚の生態・旬の知識
            </li>
            <li>
              <Link
                href="/glossary"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                釣り用語集
              </Link>{" "}
              -- 試験で出る用語の確認に
            </li>
          </ul>
        </section>

        {/* 免責表示 */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="font-bold">免責事項</p>
          <p className="mt-1">
            当ガイドは試験対策の学習補助を目的とした非公式コンテンツです。
            一般社団法人 全日本釣り団体協議会（全釣り協）とは一切関係ありません。
            法令・制度の情報は2025年時点の内容に基づいていますが、最新の改正が反映されていない場合があります。
            正確な試験範囲・内容については、
            <a
              href="https://www.zenturi-jofi.or.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              全釣り協の公式サイト
            </a>
            をご確認ください。
            当サイトの情報をもとに生じた損害について、当サイトは一切の責任を負いません。
          </p>
        </div>
      </div>
    </>
  );
}
