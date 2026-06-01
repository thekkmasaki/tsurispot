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

const SEASON_MESSAGES: Record<string, string> = {
  spring: "春の釣りシーズン到来！GW前に装備を揃えよう",
  summer: "夏の爆釣シーズン！熱中症対策も忘れずに",
  autumn: "秋は年間ベストシーズン！大物狙いの装備を",
  winter: "冬の釣りは防寒が命！暖かく快適に楽しもう",
};

function getSeasonKey(month: number): string {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

interface SpotAffiliateRecommendProps {
  methods: string[];
  isNightFishing?: boolean;
  prefecture?: string;
  /** スポットで釣れる魚名。専用ギアの文脈レコメンドに使う */
  fishNames?: string[];
}

export function SpotAffiliateRecommend({ methods, isNightFishing = false, prefecture, fishNames = [] }: SpotAffiliateRecommendProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [currentMonth, setCurrentMonth] = useState(1);

  // 依存配列で配列参照の都度変化を避けるため key 文字列化
  const fishKey = fishNames.join(",");

  useEffect(() => {
    const month = new Date().getMonth() + 1;
    setCurrentMonth(month);
    const relevant = getRelevantAffiliateProducts(methods, month, 6, isNightFishing, prefecture, fishNames);
    setProducts(relevant);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods, isNightFishing, prefecture, fishKey]);

  if (products.length === 0) return null;

  const seasonKey = getSeasonKey(currentMonth);
  const seasonMessage = SEASON_MESSAGES[seasonKey];

  return (
    <div className="mt-6">
      {/* ヘッダー */}
      <div className="mb-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-4">
        <h3 className="flex items-center gap-2 text-base font-bold">
          <ShoppingBag className="size-5 text-primary" />
          この釣り場の釣り方に合った装備ガイド
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {seasonMessage}
          {methods.length > 0 && `この釣り場で対応できる${methods.join("・")}に適した道具をご紹介します。`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const rakutenUrl = getRakutenUrl(product.name);
          return (
            <Card key={product.id} className="group relative h-full gap-0 overflow-hidden py-0 transition-all hover:shadow-lg hover:border-primary/40">
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

                <h4 className="mt-2 text-sm font-bold leading-tight group-hover:text-primary">
                  {product.name}
                </h4>

                {/* 価格帯 */}
                {product.priceRange && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <Tag className="size-3 text-red-500" />
                    <span className="text-sm font-bold text-red-600">{product.priceRange}</span>
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
                    onClick={() => trackAffiliateClick({
                      productName: product.name,
                      productCategory: product.category,
                      platform: "amazon",
                      pageType: "spot",
                    })}
                    className="flex items-center justify-center gap-1.5 rounded-md bg-[#FF9900] px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#E88B00] hover:shadow-md"
                  >
                    Amazonで詳細を見る
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
