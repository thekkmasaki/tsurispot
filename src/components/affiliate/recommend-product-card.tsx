"use client";

import { BookOpen, ChevronRight, Fish, Package, Shirt, Shrimp, Star } from "lucide-react";
import type { AffiliateProduct } from "@/lib/data/affiliate-products";
import { getRakutenUrl, trackAffiliateClick, type PageType } from "@/lib/affiliate-config";

const CATEGORY_LABELS: Record<AffiliateProduct["category"], string> = {
  tackle: "仕掛け・ライン",
  bait: "エサ",
  wear: "ウェア",
  accessory: "便利グッズ",
  book: "釣り場ガイド",
};

/** 写真がまだない商品のプレースホルダー（カテゴリ別の色＋アイコン） */
const CATEGORY_VISUAL: Record<
  AffiliateProduct["category"],
  { icon: typeof Fish; className: string }
> = {
  tackle: { icon: Fish, className: "from-sky-50 to-sky-100 text-sky-500 dark:from-sky-950/40 dark:to-sky-900/30 dark:text-sky-400" },
  bait: { icon: Shrimp, className: "from-emerald-50 to-emerald-100 text-emerald-500 dark:from-emerald-950/40 dark:to-emerald-900/30 dark:text-emerald-400" },
  wear: { icon: Shirt, className: "from-orange-50 to-orange-100 text-orange-500 dark:from-orange-950/40 dark:to-orange-900/30 dark:text-orange-400" },
  accessory: { icon: Package, className: "from-violet-50 to-violet-100 text-violet-500 dark:from-violet-950/40 dark:to-violet-900/30 dark:text-violet-400" },
  book: { icon: BookOpen, className: "from-amber-50 to-amber-100 text-amber-600 dark:from-amber-950/40 dark:to-amber-900/30 dark:text-amber-400" },
};

function isRakutenUrl(url: string): boolean {
  return /(^https?:\/\/)?([a-z0-9-]+\.)?(r10\.to|rakuten\.co\.jp)/.test(url);
}

/**
 * おすすめ商品カード（サウナイキタイの施設カードを参考に、写真→名前→価格→1つの主ボタン）。
 * 写真は Amazon SiteStripe の画像リンク（product.image）を next/image を通さずそのまま表示する
 * （画像をサーバーに保存・加工しないのがアソシエイト規約上の条件）。
 */
export function RecommendProductCard({
  product,
  pageType,
}: {
  product: AffiliateProduct;
  pageType: PageType;
}) {
  const primaryIsRakuten = isRakutenUrl(product.url);
  const primaryPlatform = primaryIsRakuten ? "rakuten" : "amazon";
  const visual = CATEGORY_VISUAL[product.category];
  const Icon = visual.icon;

  const track = (platform: "amazon" | "rakuten") =>
    trackAffiliateClick({
      productName: product.name,
      productCategory: product.category,
      platform,
      pageType,
    });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => track(primaryPlatform)}
        className="relative block"
        tabIndex={-1}
        aria-hidden="true"
      >
        {product.image ? (
          <div className="flex aspect-[4/3] items-center justify-center bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${visual.className}`}>
            <Icon className="size-12 opacity-80 sm:size-14" strokeWidth={1.5} />
          </div>
        )}
        {product.isRecommended && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            <Star className="size-3 fill-current" />
            編集部おすすめ
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[11px] text-muted-foreground">{CATEGORY_LABELS[product.category]}</p>
        <h4 className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug">{product.name}</h4>
        {product.priceRange && (
          <p className="mt-1 text-base font-bold tabular-nums text-red-600 dark:text-red-400">
            {product.priceRange}
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">目安</span>
          </p>
        )}
        <p className="mt-1 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => track(primaryPlatform)}
          className={`mt-3 flex min-h-[44px] items-center justify-center gap-1 rounded-full px-3 text-sm font-bold text-white transition-colors ${
            primaryIsRakuten ? "bg-[#BF0000] hover:bg-[#A00000]" : "bg-[#FF9900] hover:bg-[#E88B00]"
          }`}
        >
          {primaryIsRakuten ? "楽天で見る" : "Amazonで見る"}
          <ChevronRight className="size-4" aria-hidden="true" />
        </a>
        {!primaryIsRakuten && (
          <a
            href={getRakutenUrl(product.name)}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => track("rakuten")}
            className="mt-1 flex min-h-[36px] items-center justify-center text-xs font-medium text-[#BF0000] hover:underline dark:text-red-400"
          >
            楽天でも探す
          </a>
        )}
      </div>
    </article>
  );
}
