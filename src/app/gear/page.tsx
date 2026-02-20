import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { ProductList } from "@/components/affiliate/product-list";
import {
  products,
  getProductsByCategory,
  getProductsByDifficulty,
  PRODUCT_CATEGORY_LABELS,
} from "@/lib/data/products";

export const metadata: Metadata = {
  title: "おすすめ釣り道具 - 初心者から上級者まで厳選アイテム",
  description:
    "釣り初心者におすすめの道具を厳選して紹介。サビキセット、ロッド、リール、仕掛け、アクセサリーまでカテゴリ別にわかりやすく解説。Amazonや楽天で購入できます。",
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

export default function GearPage() {
  const beginnerSets = products.filter(
    (p) => p.difficulty === "beginner" && (p.category === "other" || p.category === "rod" || p.category === "reel")
  ).sort((a, b) => a.priority - b.priority);

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

        {/* 初心者セット */}
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
