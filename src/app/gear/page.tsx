import type { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  ChevronRight,
  Fish,
  Ruler,
  Package,
  ArrowRight,
  Star,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductList } from "@/components/affiliate/product-list";
import {
  products,
  getProductsByCategory,
  getProductsByDifficulty,
} from "@/lib/data/products";

export const metadata: Metadata = {
  title: "おすすめ釣り道具 - 初心者から上級者まで厳選アイテム | ツリスポ",
  description:
    "釣り初心者におすすめの道具を厳選して紹介。サビキセット、ロッド、リール、仕掛け、アクセサリーまでカテゴリ別にわかりやすく解説。Amazon・楽天で購入できます。",
  openGraph: {
    title: "おすすめ釣り道具 - 初心者から上級者まで厳選アイテム",
    description:
      "釣り初心者におすすめの道具を厳選して紹介。カテゴリ別にわかりやすく解説。",
    type: "website",
    url: "https://tsurispot.com/gear",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/gear",
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
      name: "おすすめ釣り道具",
      item: "https://tsurispot.com/gear",
    },
  ],
};

// 特集記事データ
const featuredArticles = [
  {
    href: "/gear/sabiki",
    title: "サビキ釣りセットおすすめ10選",
    subtitle: "【2025年版】初心者向け完全ガイド",
    description:
      "価格帯別にサビキ釣りセットを徹底比較。1000円台から高品質セットまで、初心者が失敗しない選び方を解説。",
    icon: Fish,
    badge: "人気No.1",
    badgeColor: "bg-red-100 text-red-700",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50/50 border-blue-200",
  },
  {
    href: "/gear/rod-beginner",
    title: "初心者向け釣り竿おすすめ8選",
    subtitle: "最初の1本はこれ！",
    description:
      "万能竿・サビキ竿・ちょい投げ竿をカテゴリ別に比較。長さ・硬さの選び方からコスパ重視のランキングまで。",
    icon: Ruler,
    badge: "迷ったらコレ",
    badgeColor: "bg-blue-100 text-blue-700",
    iconColor: "text-green-600",
    bgColor: "bg-green-50/50 border-green-200",
  },
  {
    href: "/gear/tackle-box",
    title: "釣り道具一式セットおすすめ5選",
    subtitle: "手ぶらで始められる！",
    description:
      "竿・リール・仕掛け・バケツまで全部入り。入門セット、ファミリーセット、コンパクトセットを目的別に紹介。",
    icon: Package,
    badge: "初心者必見",
    badgeColor: "bg-green-100 text-green-700",
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50/50 border-amber-200",
  },
];

export default function GearPage() {
  const beginnerSets = products
    .filter(
      (p) =>
        p.difficulty === "beginner" &&
        (p.category === "other" || p.category === "rod" || p.category === "reel")
    )
    .sort((a, b) => a.priority - b.priority);

  const tackleProducts = getProductsByCategory("tackle");
  const accessoryProducts = [
    ...getProductsByCategory("accessory"),
    ...getProductsByCategory("wear"),
    ...getProductsByCategory("cooler"),
  ].sort((a, b) => a.priority - b.priority);

  const intermediateProducts = getProductsByDifficulty("intermediate");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
        {/* ヒーローセクション */}
        <div className="mb-10 text-center sm:mb-14">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <ShoppingBag className="size-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            おすすめ釣り道具
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            釣り歴10年以上のスタッフが厳選した、本当に使えるアイテムをご紹介します。
            初心者が最初に揃えるべき道具から、釣果を伸ばすステップアップアイテムまで、
            カテゴリ別にわかりやすくまとめました。
          </p>
        </div>

        {/* ========== 特集記事カード ========== */}
        <section className="mb-12 sm:mb-16">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <Star className="size-6 text-amber-500" />
            特集記事 - 目的別おすすめガイド
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {featuredArticles.map((article) => (
              <Link key={article.href} href={article.href} className="group">
                <Card
                  className={`h-full border-2 py-0 transition-all hover:shadow-lg ${article.bgColor}`}
                >
                  <CardContent className="flex h-full flex-col p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <article.icon
                        className={`size-6 ${article.iconColor}`}
                      />
                      <Badge
                        className={`${article.badgeColor} hover:${article.badgeColor}`}
                      >
                        {article.badge}
                      </Badge>
                    </div>
                    <h3 className="mb-1 text-base font-bold leading-snug group-hover:text-primary sm:text-lg">
                      {article.title}
                    </h3>
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {article.subtitle}
                    </p>
                    <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">
                      {article.description}
                    </p>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                      記事を読む
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== 初心者へのおすすめ ========== */}
        <div className="mb-10 sm:mb-14">
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              まずはここから！ 初めての方は「サビキセット」がおすすめです。竿・リール・仕掛けがセットになっていて、すぐに釣りを始められます。
            </p>
          </div>
          <ProductList
            products={beginnerSets}
            title="初心者セット・基本の竿とリール"
            description="まず揃えたい必須アイテム。セット購入が最もコスパが良くおすすめです。"
          />
        </div>

        {/* 仕掛け・小物 */}
        <div className="mb-10 sm:mb-14">
          <ProductList
            products={tackleProducts}
            title="仕掛け・ルアー"
            description="消耗品なので予備を持っておくと安心。釣り方に合わせて選びましょう。"
          />
        </div>

        {/* 中〜上級者向けルアー */}
        <div className="mb-10 sm:mb-14">
          <ProductList
            products={intermediateProducts}
            title="ステップアップアイテム（中〜上級者向け）"
            description="基本に慣れたら、アジングやエギングなど専門的な釣りにもチャレンジ。"
          />
        </div>

        {/* アクセサリー・便利グッズ */}
        <div className="mb-10 sm:mb-14">
          <ProductList
            products={accessoryProducts}
            title="アクセサリー・便利グッズ"
            description="安全のためのライフジャケットから、あると便利な小物まで。"
          />
        </div>

        {/* 関連リンク */}
        <div className="rounded-xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">道具選びに迷ったら</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/guide"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                釣りの始め方ガイド
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                道具選びの基本を学ぶ
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link
              href="/guide/budget"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                予算別ガイド
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                3千円〜3万円の予算別コース
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
            <Link
              href="/beginner-checklist"
              className="group rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <p className="font-semibold group-hover:text-primary">
                持ち物チェックリスト
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                忘れ物防止に活用しよう
              </p>
              <ChevronRight className="mx-auto mt-2 size-4 text-muted-foreground group-hover:text-primary" />
            </Link>
          </div>
        </div>

        {/* 免責事項 */}
        <div className="mt-8 text-center text-xs leading-relaxed text-muted-foreground/70">
          <p>
            ※ 掲載価格は目安です。実際の価格はリンク先の各ショップでご確認ください。
          </p>
          <p className="mt-1">
            ※ 当ページにはアフィリエイトリンクが含まれます。リンク経由でご購入いただくと、当サイトの運営費に充てさせていただきます。
          </p>
        </div>
      </main>
    </>
  );
}
