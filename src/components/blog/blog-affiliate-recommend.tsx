"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { RecommendProductCard } from "@/components/affiliate/recommend-product-card";
import {
  type AffiliateProduct,
  getRelevantAffiliateProducts,
} from "@/lib/data/affiliate-products";

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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {products.map((product) => (
          <RecommendProductCard key={product.id} product={product} pageType="blog" />
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。価格は変動する場合があります。
      </p>
    </div>
  );
}
