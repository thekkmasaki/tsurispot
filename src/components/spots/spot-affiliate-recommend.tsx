"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { RecommendProductCard } from "@/components/affiliate/recommend-product-card";
import {
  type AffiliateProduct,
  getRelevantAffiliateProducts,
} from "@/lib/data/affiliate-products";

const SEASON_MESSAGES: Record<string, string> = {
  spring: "春の釣りシーズン到来！GW前に装備を揃えよう",
  summer: "夏は朝マヅメと夜釣りが本番。熱中症対策も忘れずに",
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {products.map((product) => (
          <RecommendProductCard key={product.id} product={product} pageType="spot" />
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。価格は変動する場合があります。
      </p>
    </div>
  );
}
