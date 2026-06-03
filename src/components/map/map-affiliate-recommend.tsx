"use client";

import { useMemo } from "react";
import { ShoppingBag } from "lucide-react";
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

interface MapAffiliateRecommendProps {
  /** 表示中スポットの代表的な釣り方（頻度上位） */
  methods: string[];
  /** 表示中スポットの代表的な魚名（頻度上位） */
  fishNames: string[];
  isNightFishing?: boolean;
  prefecture?: string;
  /** 表示中スポット数（0 のとき非表示） */
  spotCount: number;
}

/**
 * 地図のリストSheet上部に出すコンパクトなアフィリエイト導線。
 * マッチングは spot 詳細と同じ getRelevantAffiliateProducts を再利用し、表示だけ地図用に小型化する。
 * 計測は pageType:"map" で分離する。
 */
export function MapAffiliateRecommend({
  methods,
  fishNames,
  isNightFishing = false,
  prefecture,
  spotCount,
}: MapAffiliateRecommendProps) {
  const month = useMemo(() => new Date().getMonth() + 1, []);
  const fishKey = fishNames.join(",");
  const methodKey = methods.join(",");

  const products = useMemo(
    () => getRelevantAffiliateProducts(methods, month, 3, isNightFishing, prefecture, fishNames),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [methodKey, fishKey, isNightFishing, prefecture, month],
  );

  if (spotCount === 0 || products.length === 0) return null;

  return (
    <div className="border-b bg-gradient-to-r from-primary/5 to-transparent p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-bold text-foreground">
        <ShoppingBag className="size-4 text-primary" />
        この辺りで釣れる魚におすすめの道具
      </h3>
      <ul className="mt-2 space-y-1.5">
        {products.map((product) => {
          const rakutenUrl = getRakutenUrl(product.name);
          return (
            <li key={product.id} className="rounded-md border bg-card p-2">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{product.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {CATEGORY_LABELS[product.category]}
                    {product.priceRange ? ` · ${product.priceRange}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={() =>
                      trackAffiliateClick({
                        productName: product.name,
                        productCategory: product.category,
                        platform: "amazon",
                        pageType: "map",
                      })
                    }
                    className="rounded bg-[#FF9900] px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#E88B00]"
                  >
                    Amazon
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
                        pageType: "map",
                      })
                    }
                    className="rounded bg-[#BF0000] px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-[#A00000]"
                  >
                    楽天
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-1.5 text-[9px] text-muted-foreground">
        ※ アフィリエイトリンクを含みます。購入による追加費用は発生しません。
      </p>
    </div>
  );
}
