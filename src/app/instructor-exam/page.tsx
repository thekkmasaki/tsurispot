import type { Metadata } from "next";
import Link from "next/link";
import {
  Scale,
  CloudRain,
  ClipboardList,
  ScrollText,
  Anchor,
  Fish,
  Leaf,
  type LucideIcon,
} from "lucide-react";

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
      "公認釣りインストラクター試験の筆記対策をオンラインで学べる無料ガイド。全7章・確認クイズ290問以上。",
    url: `${baseUrl}/instructor-exam`,
    type: "website",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=公認釣りインストラクター試験対策&emoji=📝", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "公認釣りインストラクター試験対策ガイド | ツリスポ",
    description:
      "漁業法・マナー・釣り具の知識を全7章・確認クイズ290問以上で学べる無料ガイド。",
    images: ["https://tsurispot.com/api/og?title=公認釣りインストラクター試験対策&emoji=📝"],
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
const chapters: {
  num: number;
  title: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  quizCount: number;
  ready: boolean;
}[] = [
  {
    num: 1,
    title: "漁業関連法規",
    slug: "law",
    icon: Scale,
    description:
      "漁業法・遊漁船業法・水産資源保護法など、インストラクターに必要な法規知識を体系的に学びます。",
    quizCount: 50,
    ready: true,
  },
  {
    num: 2,
    title: "気象海象と安全対策",
    slug: "safety",
    icon: CloudRain,
    description:
      "天気図の読み方、潮汐、波浪、落雷・落水事故の予防策など安全管理の知識を解説します。",
    quizCount: 40,
    ready: true,
  },
  {
    num: 3,
    title: "釣りマナーと指導法",
    slug: "manners",
    icon: ClipboardList,
    description:
      "先行者優先の原則、ゴミの持ち帰り、周辺住民への配慮など、インストラクターとしての指導法を学びます。",
    quizCount: 40,
    ready: true,
  },
  {
    num: 4,
    title: "釣りの文化史",
    slug: "history",
    icon: ScrollText,
    description:
      "日本の釣り文化の歴史、和竿・テンカラなどの伝統技法、釣り文学の名作を紹介します。",
    quizCount: 40,
    ready: true,
  },
  {
    num: 5,
    title: "釣り具の知識",
    slug: "tackle",
    icon: Anchor,
    description:
      "竿・リール・糸・針・仕掛けなど、釣り具の基本構造と選び方を体系的に解説します。",
    quizCount: 40,
    ready: true,
  },
  {
    num: 6,
    title: "釣り技術と知識",
    slug: "technique",
    icon: Fish,
    description:
      "キャスティング、合わせ方、取り込み、魚の締め方など実技に関わる知識を学びます。",
    quizCount: 40,
    ready: true,
  },
  {
    num: 7,
    title: "水域の自然環境知識",
    slug: "environment",
    icon: Leaf,
    description:
      "魚類の生態、水質環境、プランクトン、潮流と釣果の関係など自然科学の基礎を学びます。",
    quizCount: 40,
    ready: true,
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
              "公認釣りインストラクター試験（JOFI）の筆記試験対策に役立つ無料学習ガイド。漁業法・マナー・釣り具の知識を全7章・確認クイズ290問以上で体系的に学べます。",
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

      {/* JSON-LD: FAQPage (GEO最適化) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "公認釣りインストラクターとは何ですか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "公認釣りインストラクターは、一般社団法人 全日本釣り団体協議会（全釣り協 / JOFI）が認定する公認資格です。釣りの安全指導、マナー啓発、技術指導を目的とし、全国で約2,000名以上が活動しています。受験資格は20歳以上で、筆記・論文・実技・面接の4科目からなる試験に合格する必要があります。",
                },
              },
              {
                "@type": "Question",
                name: "釣りインストラクター試験の費用はいくらですか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "費用の目安は、受講料 約1万円 + 受験料 約1万円 + 登録費 約2万円 = 計約4万円です。合格後は3年ごとに更新研修を受ける必要があります。",
                },
              },
              {
                "@type": "Question",
                name: "試験対策にはどのくらいの勉強時間が必要ですか？",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "個人差はありますが、筆記試験の範囲（漁業法・マナー・釣り具の知識など全7分野）をカバーするには約20〜30時間の学習が目安です。当サイトの学習ガイドと確認クイズ290問以上を活用すれば、効率的に知識を整理できます。",
                },
              },
            ],
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

        {/* 試験の統計情報（GEO: 統計・出典追加） */}
        <section className="mb-10 rounded-xl border border-sky-200 bg-sky-50 p-5">
          <h2 className="mb-3 text-lg font-bold text-sky-900">公認釣りインストラクター資格について</h2>
          <p className="text-sm text-sky-800 leading-relaxed">
            公認釣りインストラクター制度は、<strong>一般社団法人 全日本釣り団体協議会（全釣り協 / JOFI）</strong>が運営する公認資格です。
            釣りの安全指導、マナー啓発、技術向上を目的とし、全国で<strong>約2,000名以上</strong>のインストラクターが活動しています。
            試験は年に数回実施され、筆記（選択式60分）・論文・実技・面接の4科目で構成されます。
          </p>
          <p className="mt-2 text-sm text-sky-800 leading-relaxed">
            当ガイドでは筆記試験の主要範囲を<strong>全7章・確認クイズ{chapters.reduce((sum, ch) => sum + ch.quizCount, 0)}問</strong>でカバーしています。
            漁業法（令和2年12月施行の改正法）、遊漁船業法、水産資源保護法などの最新法規に対応した内容です。
          </p>
          <p className="mt-2 text-xs text-sky-600">
            出典:{" "}
            <a
              href="https://www.zenturi-jofi.or.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-sky-800"
            >
              全日本釣り団体協議会 公式サイト
            </a>
            。資格制度の詳細・最新の試験日程は公式サイトをご確認ください。
          </p>
        </section>

        {/* 学習ガイド & 確認クイズ */}
        <section className="mb-10">
          <h2 className="mb-2 text-xl font-bold">学習ガイド & 確認クイズ</h2>
          <p className="mb-4 text-sm text-muted-foreground">各科目の重要ポイントを教科書形式で解説。学習後はクイズで知識を定着させましょう。</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {chapters.map((ch) => {
              const Icon = ch.icon;
              return ch.ready ? (
                <div key={ch.slug} className="rounded-xl border p-5 transition-colors hover:border-primary/20">
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100">
                      <Icon className="size-6 text-sky-700" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">第{ch.num}章</p>
                      <h3 className="font-bold">{ch.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ch.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/instructor-exam/${ch.slug}`}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                      学習する
                    </Link>
                    {ch.quizCount > 0 && (
                      <Link
                        href={`/instructor-exam/${ch.slug}/quiz`}
                        className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-purple-700 cursor-pointer"
                      >
                        クイズ {ch.quizCount}問
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div key={ch.slug} className="rounded-xl border border-dashed p-5 opacity-60">
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <Icon className="size-6 text-gray-400" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground">第{ch.num}章</p>
                      <h3 className="font-bold">{ch.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{ch.description}</p>
                      <p className="mt-2 text-xs font-medium text-gray-400">準備中</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            全{chapters.reduce((sum, ch) => sum + ch.quizCount, 0)}問収録（今後さらに追加予定）
          </p>
        </section>

        {/* 論文・実技対策 */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">その他の試験対策</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-5 transition-colors hover:border-primary/20">
              <h3 className="font-bold">論文対策</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                頻出テーマ5選と800字論文の構成フレームワークを解説
              </p>
              <div className="mt-4">
                <Link
                  href="/instructor-exam/essay"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  論文対策を見る
                </Link>
              </div>
            </div>
            <div className="rounded-xl border p-5 transition-colors hover:border-primary/20">
              <h3 className="font-bold">実技対策</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                キャスティング・結び方・仕掛け作りの手順と減点ポイントを解説
              </p>
              <div className="mt-4">
                <Link
                  href="/instructor-exam/practical"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  実技対策を見る
                </Link>
              </div>
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
            <li>
              <Link
                href="/quiz"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                釣りクイズ
              </Link>{" "}
              -- 遊びながら学べる釣り検定（全240問）
            </li>
            <li>
              <Link
                href="/spots"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                全国の釣りスポット
              </Link>{" "}
              -- 学んだ知識を活かして実際に釣りに行こう
            </li>
            <li>
              <Link
                href="/gear"
                className="font-medium text-green-700 underline hover:text-green-900"
              >
                おすすめ釣り道具
              </Link>{" "}
              -- 試験の釣り具知識を実際の道具選びに活用
            </li>
          </ul>
        </section>

        {/* よくある質問（GEO: FAQ表示 + FAQPage schema連動） */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-bold">よくある質問</h2>
          <div className="space-y-4">
            <details className="rounded-xl border p-4">
              <summary className="cursor-pointer font-semibold text-sm">公認釣りインストラクターとは何ですか？</summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                一般社団法人 全日本釣り団体協議会（全釣り協 / JOFI）が認定する公認資格です。釣りの安全指導、マナー啓発、技術指導を目的とし、全国で約2,000名以上が活動しています。受験資格は20歳以上で、筆記・論文・実技・面接の4科目からなる試験に合格する必要があります。
              </p>
            </details>
            <details className="rounded-xl border p-4">
              <summary className="cursor-pointer font-semibold text-sm">試験の費用はいくらですか？</summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                費用の目安は、受講料 約1万円 + 受験料 約1万円 + 登録費 約2万円 = 計約4万円です。合格後は3年ごとに更新研修を受ける必要があります。
              </p>
            </details>
            <details className="rounded-xl border p-4">
              <summary className="cursor-pointer font-semibold text-sm">試験対策にはどのくらいの勉強時間が必要ですか？</summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                個人差はありますが、筆記試験の範囲（漁業法・マナー・釣り具の知識など全7分野）をカバーするには約20〜30時間の学習が目安です。当サイトの学習ガイドと確認クイズ{chapters.reduce((sum, ch) => sum + ch.quizCount, 0)}問以上を活用すれば、効率的に知識を整理できます。
              </p>
            </details>
          </div>
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
