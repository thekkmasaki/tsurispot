import type { Metadata } from "next";
import Link from "next/link";
import { LineBanner } from "@/components/line-banner";
import {
  ChevronLeft,
  DollarSign,
  TrendingDown,
  RotateCcw,
  Lightbulb,
  Check,
  Star,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "釣りの費用ガイド - 予算3千円〜3万円の始め方",
  description:
    "釣りを始めるのにいくらかかる？予算3,000円・10,000円・30,000円の3つのコース別に必要な道具と費用を徹底解説。ランニングコストや節約のコツも紹介します。",
  openGraph: {
    title: "釣りの費用ガイド - 予算3千円〜3万円の始め方",
    description:
      "釣りを始めるのにいくらかかる？予算別に必要な道具と費用を徹底解説。",
    type: "article",
    url: "https://tsurispot.com/guide/budget",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/guide/budget",
  },
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
      name: "釣りの始め方ガイド",
      item: "https://tsurispot.com/guide",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "釣りの費用ガイド",
      item: "https://tsurispot.com/guide/budget",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "釣りを始めるのに最低いくらかかりますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "最低約3,000円から始められます。サビキ釣りセット（竿とリール付き）が2,000円前後、仕掛けとエサで1,000円程度です。100均のバケツを使えば追加費用も抑えられます。",
      },
    },
    {
      "@type": "Question",
      name: "初心者におすすめの予算はいくらですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "10,000円コースがおすすめです。竿とリールのセット、仕掛け各種、クーラーボックス、プライヤーなどが揃い、サビキ釣りからちょい投げまで幅広い釣り方に対応できます。",
      },
    },
    {
      "@type": "Question",
      name: "釣りのランニングコスト（維持費）はいくらですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1回の釣行あたり500〜2,000円程度です。主にエサ代（アミエビ300〜500円、青イソメ500〜800円）と仕掛けの消耗品代がかかります。交通費や駐車場代は釣り場によって異なります。",
      },
    },
    {
      "@type": "Question",
      name: "レンタルで釣りを体験できますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい。海釣り公園や管理釣り場の中には、レンタル竿を無料または数百円で貸し出している施設があります。エサ代だけで手ぶらで釣りを体験できるので、まず一度試したい方にはレンタルがおすすめです。",
      },
    },
    {
      "@type": "Question",
      name: "釣り道具を安く揃えるコツはありますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "セール時期（年末年始・決算期）を狙う、型落ちモデルを選ぶ、中古品を活用するなどの方法があります。また、使用後に真水で洗い乾燥させるなどメンテナンスをしっかり行えば道具の寿命が大幅に延びて長期的なコストを抑えられます。",
      },
    },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "釣りの費用ガイド - 予算3千円〜3万円の始め方",
  description:
    "釣りを始めるのにいくらかかる？予算3,000円・10,000円・30,000円の3つのコース別に必要な道具と費用を徹底解説。ランニングコストや節約のコツも紹介します。",
  datePublished: "2025-01-01",
  dateModified: new Date().toISOString().split("T")[0],
  author: {
    "@type": "Person",
    name: "正木 家康",
    jobTitle: "編集長",
    url: "https://tsurispot.com/about",
  },
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
    logo: {
      "@type": "ImageObject",
      url: "https://tsurispot.com/logo.svg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://tsurispot.com/guide/budget",
  },
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-4 text-xl font-bold">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
      <span className="font-medium">ヒント：</span>
      {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
      <span className="font-medium">注意：</span>
      {children}
    </div>
  );
}

function BudgetItem({
  name,
  price,
}: {
  name: string;
  price: string;
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Check className="size-4 shrink-0 text-primary" />
        {name}
      </span>
      <span className="shrink-0 font-medium text-foreground">{price}</span>
    </li>
  );
}

function BudgetComparisonDiagram() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">予算別セット構成の比較</h3>
      <svg
        viewBox="0 0 700 340"
        width="100%"
        style={{ maxWidth: 700 }}
        aria-label="予算別セット構成図。3000円・10000円・30000円の3段階で含まれる道具を比較"
        className="mx-auto"
      >
        {/* 背景 */}
        <rect x="0" y="0" width="700" height="340" rx="12" fill="#F9FAFB" />

        {/* 3,000円コース */}
        <rect x="20" y="20" width="200" height="300" rx="8" fill="#FFFFFF" stroke="#22C55E" strokeWidth="2" />
        <rect x="20" y="20" width="200" height="40" rx="8" fill="#22C55E" />
        <rect x="20" y="52" width="200" height="8" fill="#22C55E" />
        <text x="120" y="46" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">3,000円コース</text>
        <text x="120" y="78" textAnchor="middle" fill="#22C55E" fontSize="11" fontWeight="bold">お試し</text>

        <rect x="40" y="95" width="160" height="30" rx="6" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1" />
        <text x="120" y="115" textAnchor="middle" fill="#166534" fontSize="11">サビキセット（竿+リール）</text>

        <rect x="40" y="135" width="160" height="30" rx="6" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1" />
        <text x="120" y="155" textAnchor="middle" fill="#166534" fontSize="11">仕掛け</text>

        <rect x="40" y="175" width="160" height="30" rx="6" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1" />
        <text x="120" y="195" textAnchor="middle" fill="#166534" fontSize="11">エサ（アミエビ）</text>

        <rect x="40" y="215" width="160" height="30" rx="6" fill="#DCFCE7" stroke="#22C55E" strokeWidth="1" />
        <text x="120" y="235" textAnchor="middle" fill="#166534" fontSize="11">バケツ（100均）</text>

        <rect x="40" y="255" width="160" height="30" rx="6" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="4" />
        <text x="120" y="275" textAnchor="middle" fill="#9CA3AF" fontSize="11">クーラーBOX なし</text>

        {/* 10,000円コース */}
        <rect x="250" y="20" width="200" height="300" rx="8" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
        <rect x="250" y="20" width="200" height="40" rx="8" fill="#3B82F6" />
        <rect x="250" y="52" width="200" height="8" fill="#3B82F6" />
        <text x="350" y="46" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">10,000円コース</text>
        <text x="350" y="78" textAnchor="middle" fill="#3B82F6" fontSize="11" fontWeight="bold">おすすめ!</text>

        <rect x="270" y="95" width="160" height="30" rx="6" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
        <text x="350" y="115" textAnchor="middle" fill="#1E40AF" fontSize="11">竿+リールセット</text>

        <rect x="270" y="135" width="160" height="30" rx="6" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
        <text x="350" y="155" textAnchor="middle" fill="#1E40AF" fontSize="11">仕掛け各種</text>

        <rect x="270" y="175" width="160" height="30" rx="6" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
        <text x="350" y="195" textAnchor="middle" fill="#1E40AF" fontSize="11">クーラーボックス</text>

        <rect x="270" y="215" width="160" height="30" rx="6" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
        <text x="350" y="235" textAnchor="middle" fill="#1E40AF" fontSize="11">プライヤー+ハサミ</text>

        <rect x="270" y="255" width="160" height="30" rx="6" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="1" />
        <text x="350" y="275" textAnchor="middle" fill="#1E40AF" fontSize="11">消耗品（エサ等）</text>

        {/* 30,000円コース */}
        <rect x="480" y="20" width="200" height="300" rx="8" fill="#FFFFFF" stroke="#A855F7" strokeWidth="2" />
        <rect x="480" y="20" width="200" height="40" rx="8" fill="#A855F7" />
        <rect x="480" y="52" width="200" height="8" fill="#A855F7" />
        <text x="580" y="46" textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="bold">30,000円コース</text>
        <text x="580" y="78" textAnchor="middle" fill="#A855F7" fontSize="11" fontWeight="bold">本格スタート</text>

        <rect x="500" y="95" width="160" height="30" rx="6" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1" />
        <text x="580" y="115" textAnchor="middle" fill="#6B21A8" fontSize="11">ブランドロッド</text>

        <rect x="500" y="135" width="160" height="30" rx="6" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1" />
        <text x="580" y="155" textAnchor="middle" fill="#6B21A8" fontSize="11">シマノ/ダイワリール</text>

        <rect x="500" y="175" width="160" height="30" rx="6" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1" />
        <text x="580" y="195" textAnchor="middle" fill="#6B21A8" fontSize="11">ライン+仕掛け</text>

        <rect x="500" y="215" width="160" height="30" rx="6" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1" />
        <text x="580" y="235" textAnchor="middle" fill="#6B21A8" fontSize="11">クーラー+タックルBOX</text>

        <rect x="500" y="255" width="160" height="30" rx="6" fill="#F3E8FF" stroke="#A855F7" strokeWidth="1" />
        <text x="580" y="275" textAnchor="middle" fill="#6B21A8" fontSize="11">ライフジャケット</text>
      </svg>
    </div>
  );
}

function CostBreakdownDiagram() {
  return (
    <div className="my-6">
      <h3 className="mb-3 text-center text-sm font-bold text-foreground">初期費用の内訳（10,000円コースの場合）</h3>
      <svg
        viewBox="0 0 600 280"
        width="100%"
        style={{ maxWidth: 600 }}
        aria-label="初期費用の内訳図。竿・リール・仕掛け・小物・エサの費用配分を表示"
        className="mx-auto"
      >
        <rect x="0" y="0" width="600" height="280" rx="12" fill="#F9FAFB" />

        {/* 横棒グラフスタイルで内訳を表示 */}
        <text x="30" y="35" fill="#374151" fontSize="13" fontWeight="bold">費目</text>
        <text x="460" y="35" fill="#374151" fontSize="13" fontWeight="bold">金額</text>
        <text x="540" y="35" fill="#374151" fontSize="13" fontWeight="bold">割合</text>

        <line x1="30" y1="45" x2="570" y2="45" stroke="#E5E7EB" strokeWidth="1" />

        {/* 竿+リール: 5000円 = 50% */}
        <text x="30" y="75" fill="#374151" fontSize="12">竿+リール</text>
        <rect x="140" y="60" width="250" height="22" rx="4" fill="#3B82F6" />
        <text x="460" y="76" fill="#374151" fontSize="12" fontWeight="bold">5,000円</text>
        <text x="545" y="76" fill="#3B82F6" fontSize="12" fontWeight="bold">50%</text>

        {/* 仕掛け: 1500円 = 15% */}
        <text x="30" y="115" fill="#374151" fontSize="12">仕掛け各種</text>
        <rect x="140" y="100" width="75" height="22" rx="4" fill="#22C55E" />
        <text x="460" y="116" fill="#374151" fontSize="12" fontWeight="bold">1,500円</text>
        <text x="545" y="116" fill="#22C55E" fontSize="12" fontWeight="bold">15%</text>

        {/* クーラーBOX: 2000円 = 20% */}
        <text x="30" y="155" fill="#374151" fontSize="12">クーラーBOX</text>
        <rect x="140" y="140" width="100" height="22" rx="4" fill="#F59E0B" />
        <text x="460" y="156" fill="#374151" fontSize="12" fontWeight="bold">2,000円</text>
        <text x="545" y="156" fill="#F59E0B" fontSize="12" fontWeight="bold">20%</text>

        {/* 小物: 800円 = 8% */}
        <text x="30" y="195" fill="#374151" fontSize="12">小物類</text>
        <rect x="140" y="180" width="40" height="22" rx="4" fill="#EF4444" />
        <text x="460" y="196" fill="#374151" fontSize="12" fontWeight="bold">800円</text>
        <text x="545" y="196" fill="#EF4444" fontSize="12" fontWeight="bold">8%</text>

        {/* 消耗品: 700円 = 7% */}
        <text x="30" y="235" fill="#374151" fontSize="12">消耗品（エサ等）</text>
        <rect x="140" y="220" width="35" height="22" rx="4" fill="#8B5CF6" />
        <text x="460" y="236" fill="#374151" fontSize="12" fontWeight="bold">700円</text>
        <text x="545" y="236" fill="#8B5CF6" fontSize="12" fontWeight="bold">7%</text>

        <line x1="30" y1="252" x2="570" y2="252" stroke="#E5E7EB" strokeWidth="1" />
        <text x="30" y="272" fill="#374151" fontSize="13" fontWeight="bold">合計</text>
        <text x="440" y="272" fill="#3B82F6" fontSize="14" fontWeight="bold">10,000円</text>
      </svg>
    </div>
  );
}

export default function BudgetGuidePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
        {/* パンくず */}
        <div className="mb-6">
          <Link
            href="/guide"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 size-4" />
            釣りの始め方ガイドに戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            釣りの費用ガイド
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            予算3千円から始められる！レベル別の費用と道具を徹底解説します。
          </p>
        </div>

        <BudgetComparisonDiagram />

        <div className="space-y-6">
          {/* 3,000円コース */}
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">3,000円コース</h2>
                    <Badge className="bg-green-600 text-white">お試し</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    まずは最低限の道具で釣りを体験
                  </p>
                </div>
              </div>

              <ul className="space-y-2 rounded-lg border p-4">
                <BudgetItem
                  name="サビキセット（竿+リール+仕掛け）"
                  price="~2,500円"
                />
                <BudgetItem name="アミエビ（コマセ）" price="~300円" />
                <li className="flex justify-center">
                  <a href="https://amzn.to/4c6gaUn" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    マルキュー アミ姫を見る
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
                <BudgetItem name="バケツ（100均）" price="~110円" />
                <li className="border-t pt-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>合計</span>
                    <span className="text-lg text-green-600 dark:text-green-400">
                      ~2,910円
                    </span>
                  </div>
                </li>
              </ul>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-foreground">
                    対象：
                  </span>
                  <span className="text-muted-foreground">
                    堤防サビキ釣り、ハゼ釣り
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-green-600 dark:text-green-400">
                    メリット：
                  </span>
                  <span className="text-muted-foreground">
                    最低限の出費で釣りを始められる。お試しに最適。
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-amber-600 dark:text-amber-400">
                    デメリット：
                  </span>
                  <span className="text-muted-foreground">
                    竿の品質は期待できない。壊れやすく長持ちしにくい。
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 10,000円コース */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Star className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">10,000円コース</h2>
                    <Badge className="bg-blue-600 text-white">
                      しっかり入門
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    快適に釣りを楽しむための基本装備
                  </p>
                </div>
              </div>

              <ul className="space-y-2 rounded-lg border p-4">
                <BudgetItem name="竿+リールセット" price="~5,000円" />
                <li className="flex flex-wrap justify-center gap-2">
                  <a href="https://amzn.to/4s4i64m" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    シマノ ロッドを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                  <a href="https://amzn.to/4atW7Om" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    シマノ リールを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
                <BudgetItem name="仕掛け各種" price="~1,500円" />
                <BudgetItem name="クーラーボックス（小型）" price="~2,000円" />
                <BudgetItem name="プライヤー+ハサミ" price="~800円" />
                <BudgetItem name="その他消耗品" price="~700円" />
                <li className="border-t pt-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>合計</span>
                    <span className="text-lg text-blue-600 dark:text-blue-400">
                      ~10,000円
                    </span>
                  </div>
                </li>
              </ul>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-foreground">
                    対象：
                  </span>
                  <span className="text-muted-foreground">
                    サビキ・ちょい投げ・ウキ釣り
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-green-600 dark:text-green-400">
                    メリット：
                  </span>
                  <span className="text-muted-foreground">
                    幅広い釣りに対応でき、クーラーボックスで魚の持ち帰りも可能。コスパが良い。
                  </span>
                </div>
              </div>

              <Hint>
                このコースが一番おすすめ！初心者が快適に釣りを楽しむのに必要十分な装備が揃います。
              </Hint>
            </CardContent>
          </Card>

          {/* 30,000円コース */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <Star className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">30,000円コース</h2>
                    <Badge className="bg-purple-600 text-white">
                      本格スタート
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ブランドメーカーの道具で長く楽しむ
                  </p>
                </div>
              </div>

              <ul className="space-y-2 rounded-lg border p-4">
                <BudgetItem
                  name="ロッド（ブランドメーカー）"
                  price="~10,000円"
                />
                <li className="flex justify-center">
                  <a href="https://amzn.to/4s4i64m" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    シマノ ロッドを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
                <BudgetItem
                  name="リール（シマノ/ダイワ2500番）"
                  price="~8,000円"
                />
                <li className="flex justify-center">
                  <a href="https://amzn.to/4atW7Om" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    シマノ リールを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
                <BudgetItem name="ライン" price="~1,500円" />
                <li className="flex flex-wrap justify-center gap-2">
                  <a href="https://amzn.to/4s1SPaX" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    ナイロンラインを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                  <a href="https://amzn.to/4s45H0i" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    PEラインを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
                <BudgetItem
                  name="タックルボックス+仕掛け"
                  price="~3,000円"
                />
                <li className="flex justify-center">
                  <a href="https://amzn.to/4rvRhGx" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    釣りボックスを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                </li>
                <BudgetItem name="クーラーボックス" price="~4,000円" />
                <BudgetItem name="ライフジャケット" price="~3,500円" />
                <li className="border-t pt-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>合計</span>
                    <span className="text-lg text-purple-600 dark:text-purple-400">
                      ~30,000円
                    </span>
                  </div>
                </li>
              </ul>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-foreground">
                    対象：
                  </span>
                  <span className="text-muted-foreground">
                    ルアー釣り、本格的な堤防釣り
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="shrink-0 font-medium text-green-600 dark:text-green-400">
                    メリット：
                  </span>
                  <span className="text-muted-foreground">
                    メーカー品は耐久性が高く、感度も良い。長く使えるので結果的にコスパが良い。ライフジャケットで安全面も万全。
                  </span>
                </div>
              </div>

              <Warning>
                最初から高価な道具を揃える必要はありません。まずは低予算で試して、釣りが好きになったらステップアップするのがおすすめです。
              </Warning>
            </CardContent>
          </Card>

          <CostBreakdownDiagram />

          {/* ランニングコスト */}
          <SectionCard title="ランニングコスト（毎回の費用）">
            <p className="mb-4 text-sm text-muted-foreground">
              道具を揃えた後も、釣りに行くたびにかかる費用があります。目安を把握しておきましょう。
            </p>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    エサ代：300〜1,000円/回
                  </span>
                  <br />
                  サビキ用アミエビは300円前後。生きエサ（青イソメなど）は500〜1,000円程度。
                </div>
              </li>
              <li className="flex gap-2">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    仕掛け代：200〜500円/回
                  </span>
                  <br />
                  サビキ仕掛けは1セット200〜400円。根がかりで失うこともあるので予備を持参。
                </div>
              </li>
              <li className="flex gap-2">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    ライン交換：1,000〜2,000円/数ヶ月
                  </span>
                  <br />
                  ナイロンラインは3〜6ヶ月、PEラインは半年〜1年が交換の目安。
                  <span className="mt-1.5 flex flex-wrap gap-2">
                    <a href="https://amzn.to/4s1SPaX" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                      <ShoppingBag className="size-3" />
                      ナイロンラインを見る
                      <ExternalLink className="size-2.5" />
                    </a>
                    <a href="https://amzn.to/4s45H0i" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                      <ShoppingBag className="size-3" />
                      PEラインを見る
                      <ExternalLink className="size-2.5" />
                    </a>
                  </span>
                </div>
              </li>
              <li className="flex gap-2">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    交通費・駐車場代：0〜2,000円/回
                  </span>
                  <br />
                  釣り場によって異なります。無料駐車場のある釣り場を選ぶと節約に。
                </div>
              </li>
              <li className="flex gap-2">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    施設利用料：0〜1,000円/回
                  </span>
                  <br />
                  海釣り公園や管理釣り場は入場料がかかる場合があります。
                </div>
              </li>
            </ul>

            <div className="mt-4 rounded-lg border p-4 text-center">
              <p className="text-sm font-medium text-foreground">
                1回あたりの目安費用
              </p>
              <p className="mt-1 text-2xl font-bold text-primary">
                約500〜3,000円
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                （エサ代＋仕掛け代＋交通費）
              </p>
            </div>
          </SectionCard>

          {/* 節約のコツ */}
          <SectionCard title="節約のコツ">
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <TrendingDown className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    中古品・フリマアプリを活用する
                  </span>
                  <br />
                  メルカリやヤフオクで中古の釣具を探すと、定価の半額以下で手に入ることも。特にロッドやリールはお買い得品が見つかります。
                </div>
              </li>
              <li className="flex gap-2">
                <TrendingDown className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    仕掛けを自作する
                  </span>
                  <br />
                  慣れてきたら仕掛けを自作すると大幅にコストダウン。針とハリスを買ってサビキ仕掛けを自分で作れます。{" "}
                  <a href="https://amzn.to/408jI1f" target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100">
                    <ShoppingBag className="size-3" />
                    ハリスを見る
                    <ExternalLink className="size-2.5" />
                  </a>
                </div>
              </li>
              <li className="flex gap-2">
                <TrendingDown className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    セール時期を狙う
                  </span>
                  <br />
                  釣具店の年末年始セールや決算セールでは大幅割引になることがあります。型落ちモデルも狙い目です。
                </div>
              </li>
              <li className="flex gap-2">
                <TrendingDown className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    道具を丁寧にメンテナンスする
                  </span>
                  <br />
                  使用後に真水で洗い、乾燥させるだけで道具の寿命が大幅に延びます。特にリールのメンテナンスは重要です。
                </div>
              </li>
              <li className="flex gap-2">
                <TrendingDown className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <span className="font-medium text-foreground">
                    近場の釣り場を開拓する
                  </span>
                  <br />
                  交通費を抑えるために、自宅から近い釣り場を見つけましょう。意外と身近にいいスポットがあるかもしれません。
                </div>
              </li>
            </ul>
          </SectionCard>

          {/* 実は無料で楽しめる */}
          <div className="rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-medium">
                  実は無料で楽しめることも！
                </p>
                <p className="mt-1 text-sm">
                  海釣り公園や管理釣り場の中には、レンタル竿を無料で貸し出している施設もあります。エサ代だけで手ぶらで釣りが体験できるので、「まず一度やってみたい」という方にはレンタルがおすすめです。
                </p>
                <p className="mt-2 text-sm">
                  また、釣り好きの友人や家族に道具を借りるのも立派な選択肢。まずは体験してから、自分の道具を揃えても遅くありません。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 次のステップ */}
        <div className="mt-8 text-center sm:mt-12">
          <p className="mb-4 text-sm text-muted-foreground">
            予算が決まったら、次は道具のセッティング方法を学びましょう。
          </p>
          <Link
            href="/guide/setup"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            竿とリールのセッティングを学ぶ
          </Link>
        </div>
      {/* LINE登録バナー */}
      <div className="mt-8 sm:mt-12">
        <LineBanner variant="compact" />
      </div>
      </main>
    </>
  );
}
