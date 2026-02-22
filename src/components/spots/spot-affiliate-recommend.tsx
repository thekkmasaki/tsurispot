"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type AffiliateProduct,
  getRelevantAffiliateProducts,
} from "@/lib/data/affiliate-products";

const CATEGORY_LABELS: Record<AffiliateProduct["category"], string> = {
  tackle: "仕掛け・ライン",
  bait: "エサ",
  wear: "ウェア",
  accessory: "便利グッズ",
};

const CATEGORY_COLORS: Record<AffiliateProduct["category"], string> = {
  tackle: "bg-blue-100 text-blue-700",
  bait: "bg-green-100 text-green-700",
  wear: "bg-orange-100 text-orange-700",
  accessory: "bg-purple-100 text-purple-700",
};

interface SpotAffiliateRecommendProps {
  /** スポットのcatchableFishから取得した釣り方の配列 */
  methods: string[];
}

export function SpotAffiliateRecommend({ methods }: SpotAffiliateRecommendProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const relevant = getRelevantAffiliateProducts(methods, currentMonth, 3);
    setProducts(relevant);
  }, [methods]);

  if (products.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <ShoppingBag className="size-4" />
        この釣り場でおすすめの装備
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block"
          >
            <Card className="group h-full gap-0 py-0 transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    className={`shrink-0 text-[10px] ${CATEGORY_COLORS[product.category]}`}
                  >
                    {CATEGORY_LABELS[product.category]}
                  </Badge>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h4 className="mt-2 text-sm font-semibold leading-tight group-hover:text-primary">
                  {product.name}
                </h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-center rounded-md bg-[#FF9900]/10 px-3 py-1.5 text-xs font-medium text-[#FF9900] transition-colors group-hover:bg-[#FF9900] group-hover:text-white">
                  Amazonで見る
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。
      </p>
    </div>
  );
}
