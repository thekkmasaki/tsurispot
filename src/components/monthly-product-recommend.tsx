"use client";

import { ProductList } from "@/components/affiliate/product-list";
import type { Product } from "@/lib/data/products";

interface MonthlyProductRecommendProps {
  products: Product[];
  monthName: string;
}

export function MonthlyProductRecommend({ products, monthName }: MonthlyProductRecommendProps) {
  return (
    <ProductList
      products={products}
      title={`${monthName}の釣りに揃えたい道具`}
      description="この時期の釣りに合った道具を厳選しました。事前に準備して当日を楽しみましょう。"
      maxItems={6}
      pageType="monthly"
    />
  );
}
