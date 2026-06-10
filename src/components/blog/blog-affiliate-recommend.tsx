"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag, Star, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type AffiliateProduct,
  getRelevantAffiliateProducts,
} from "@/lib/data/affiliate-products";
import { getRakutenUrl, trackAffiliateClick } from "@/lib/affiliate-config";

const CATEGORY_LABELS: Record<AffiliateProduct["category"], string> = {
  tackle: "仕掛け・ライン",
  bait: "エサ",
  wear: "ウェア",
  accessory: "便利グッズ",
  book: "釣り場ガイド",
};

const CATEGORY_COLORS: Record<AffiliateProduct["category"], string> = {
  tackle: "bg-blue-100 text-blue-700",
  bait: "bg-green-100 text-green-700",
  wear: "bg-orange-100 text-orange-700",
  accessory: "bg-purple-100 text-purple-700",
  book: "bg-amber-100 text-amber-700",
};

/**
 * 記事のタグ・タイトルから釣り方キーワードを抽出するためのマッピング。
 * key = 記事テキスト内で探す語、value = affiliate-products の methodKeywords にマッチする釣り方名
 */
const METHOD_KEYWORD_MAP: [pattern: string, method: string][] = [
  ["サビキ", "サビキ"],
  ["エギング", "エギング"],
  ["アジング", "アジング"],
  ["メバリング", "メバリング"],
  ["ショアジギ", "ショアジギ"],
  ["ちょい投げ", "ちょい投げ"],
  ["投げ釣り", "投げ釣り"],
  ["ウキ釣り", "ウキ釣り"],
  ["フカセ", "フカセ"],
  ["ルアー", "ルアー"],
  ["タコ", "タコ"],
  ["泳がせ", "泳がせ"],
  ["カゴ釣り", "カゴ釣り"],
  ["渓流", "渓流ルアー"],
];

/** タグとタイトルから記事に関連する釣り方を導出する */
function extractMethods(tags: string[], title: string): string[] {
  const haystack = [...tags, title].join(" ");
  const methods: string[] = [];
  for (const [pattern, method] of METHOD_KEYWORD_MAP) {
    if (haystack.includes(pattern) && !methods.includes(method)) {
      methods.push(method);
    }
  }
  return methods;
}

interface BlogAffiliateRecommendProps {
  /** 記事のタグ */
  tags: string[];
  /** 記事カテゴリ（gear カテゴリは表示商品数を増やす） */
  category: string;
  /** 記事に関連する魚名（サーバー側で relatedFish slug から解決済み） */
  fishNames?: string[];
  /** 記事タイトル（釣り方キーワード抽出に使用） */
  title: string;
}

export function BlogAffiliateRecommend({
  tags,
  category,
  fishNames = [],
  title,
}: BlogAffiliateRecommendProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);

  // 依存配列で配列参照の都度変化を避けるため key 文字列化
  const tagsKey = tags.join(",");
  const fishKey = fishNames.join(",");

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    const methods = extractMethods(tags, title);
    // 道具・装備カテゴリの記事は購入意欲が高いので多めに表示
    const maxItems = category === "gear" ? 6 : 3;
    const relevant = getRelevantAffiliateProducts(
      methods,
      month,
      maxItems,
      false,
      undefined,
      fishNames
    );
    setProducts(relevant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagsKey, fishKey, category, title]);

  if (products.length === 0) return null;

  return (
    <div className="mt-8">
      {/* ヘッダー */}
      <div className="mb-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
          <ShoppingBag className="size-5 text-primary" />
          この記事で紹介した釣りに合う装備
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          編集部が実際の釣行を想定して選んだ道具です。これから揃える方の参考にどうぞ。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const rakutenUrl = getRakutenUrl(product.name);
          return (
            <Card
              key={product.id}
              className="group relative h-full gap-0 overflow-hidden py-0 transition-all hover:shadow-lg hover:border-primary/40"
            >
              {/* 編集長おすすめバッジ */}
              {product.isRecommended && (
                <div className="absolute right-0 top-0 z-10">
                  <div className="flex items-center gap-1 rounded-bl-lg bg-orange-500 px-2 py-1 text-[10px] font-bold text-white">
                    <Star className="size-3 fill-current" />
                    編集長おすすめ
                  </div>
                </div>
              )}

              <CardContent className="flex h-full flex-col p-4">
                <div className="flex items-start gap-2">
                  <Badge
                    className={`shrink-0 text-[10px] ${CATEGORY_COLORS[product.category]}`}
                  >
                    {CATEGORY_LABELS[product.category]}
                  </Badge>
                </div>

                <h3 className="mt-2 text-sm font-bold leading-tight group-hover:text-primary">
                  {product.name}
                </h3>

                {/* 価格帯 */}
                {product.priceRange && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <Tag className="size-3 text-red-500" />
                    <span className="text-sm font-bold text-red-600">
                      {product.priceRange}
                    </span>
                  </div>
                )}

                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {product.description}
                </p>

                {/* CTAボタン */}
                <div className="mt-3 flex flex-col gap-1.5">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() =>
                      trackAffiliateClick({
                        productName: product.name,
                        productCategory: product.category,
                        platform: "amazon",
                        pageType: "blog",
                      })
                    }
                    className="flex items-center justify-center gap-1.5 rounded-md bg-[#FF9900] px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#E88B00] hover:shadow-md"
                  >
                    Amazonで詳細を見る
                    <ExternalLink className="size-3" />
                  </a>
                  <a
                    href={rakutenUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() =>
                      trackAffiliateClick({
                        productName: product.name,
                        productCategory: product.category,
                        platform: "rakuten",
                        pageType: "blog",
                      })
                    }
                    className="flex items-center justify-center gap-1.5 rounded-md bg-[#BF0000] px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#A00000] hover:shadow-md"
                  >
                    楽天で詳細を見る
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。価格は変動する場合があります。
      </p>
    </div>
  );
}
