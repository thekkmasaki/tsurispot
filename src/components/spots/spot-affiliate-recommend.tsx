"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag } from "lucide-react";
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

interface SpotAffiliateRecommendProps {
  /** スポットのcatchableFishから取得した釣り方の配列 */
  methods: string[];
  /** 夜釣りが可能なスポットかどうか */
  isNightFishing?: boolean;
  /** スポットの都道府県（地域限定商品のフィルタ用） */
  prefecture?: string;
}

export function SpotAffiliateRecommend({ methods, isNightFishing = false, prefecture }: SpotAffiliateRecommendProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const relevant = getRelevantAffiliateProducts(methods, currentMonth, 6, isNightFishing, prefecture);
    setProducts(relevant);
  }, [methods, isNightFishing, prefecture]);

  if (products.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-muted-foreground">
        <ShoppingBag className="size-4" />
        この釣り場でおすすめの装備
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        当日バタバタしないよう、事前にネットで揃えておくのがおすすめです
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const rakutenUrl = getRakutenUrl(product.name);
          return (
            <Card key={product.id} className="group h-full gap-0 py-0 transition-all hover:shadow-md hover:border-primary/30">
              <CardContent className="flex h-full flex-col p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    className={`shrink-0 text-[10px] ${CATEGORY_COLORS[product.category]}`}
                  >
                    {CATEGORY_LABELS[product.category]}
                  </Badge>
                </div>
                <h4 className="mt-2 text-sm font-semibold leading-tight">
                  {product.name}
                </h4>
                <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                  {product.description}
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackAffiliateClick({
                      productName: product.name,
                      productCategory: product.category,
                      platform: "amazon",
                      pageType: "spot",
                    })}
                    className="flex items-center justify-center gap-1 rounded-md bg-[#FF9900] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#E88B00]"
                  >
                    Amazonで見る
                    <ExternalLink className="size-3" />
                  </a>
                  <a
                    href={rakutenUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() => trackAffiliateClick({
                      productName: product.name,
                      productCategory: product.category,
                      platform: "rakuten",
                      pageType: "spot",
                    })}
                    className="flex items-center justify-center gap-1 rounded-md bg-[#BF0000] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#A00000]"
                  >
                    楽天で見る
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。
      </p>
    </div>
  );
}
