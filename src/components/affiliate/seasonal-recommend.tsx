"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag, Snowflake, Sun, Leaf, Flower2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type AffiliateProduct,
  affiliateProducts,
  getSeasonFromMonth,
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

const SEASON_CONFIG = {
  spring: {
    label: "春",
    icon: Flower2,
    gradient: "from-pink-50 via-rose-50 to-orange-50",
    accent: "text-pink-600",
  },
  summer: {
    label: "夏",
    icon: Sun,
    gradient: "from-amber-50 via-yellow-50 to-orange-50",
    accent: "text-amber-600",
  },
  autumn: {
    label: "秋",
    icon: Leaf,
    gradient: "from-orange-50 via-amber-50 to-red-50",
    accent: "text-orange-600",
  },
  winter: {
    label: "冬",
    icon: Snowflake,
    gradient: "from-sky-50 via-blue-50 to-indigo-50",
    accent: "text-sky-600",
  },
} as const;

/**
 * 季節に応じたおすすめ商品を自動選択する
 */
function getSeasonalProducts(month: number, maxItems: number = 4): AffiliateProduct[] {
  const season = getSeasonFromMonth(month);

  // 季節限定商品を優先
  const seasonalOnly = affiliateProducts.filter(
    (p) => p.seasons.includes(season) && !p.seasons.includes("all")
  );

  // 通年商品から人気のものを選択（基本装備: ロッド、リール、ライン系を優先）
  const essentialIds = [
    "af-rod-shimano",
    "af-reel-shimano",
    "af-pe-line",
    "af-nylon-line",
    "af-harris",
    "af-amihime",
    "af-fishing-bag-rakuten",
    "af-tackle-box",
  ];

  const essentials = affiliateProducts.filter(
    (p) => essentialIds.includes(p.id) && p.seasons.includes("all")
  );

  // 季節限定を先に、通年の基本装備で埋める
  const combined = [...seasonalOnly, ...essentials];
  // 重複除去
  const seen = new Set<string>();
  const unique = combined.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return unique.slice(0, maxItems);
}

interface SeasonalRecommendProps {
  maxItems?: number;
}

export function SeasonalRecommend({ maxItems = 4 }: SeasonalRecommendProps) {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [season, setSeason] = useState<keyof typeof SEASON_CONFIG>("winter");
  const [month, setMonth] = useState(2);

  useEffect(() => {
    const now = new Date();
    const m = now.getMonth() + 1;
    setMonth(m);
    const s = getSeasonFromMonth(m);
    setSeason(s);
    setProducts(getSeasonalProducts(m, maxItems));
  }, [maxItems]);

  if (products.length === 0) return null;

  const config = SEASON_CONFIG[season];
  const SeasonIcon = config.icon;

  return (
    <section className={`rounded-2xl bg-gradient-to-br ${config.gradient} p-5 sm:p-6`}>
      <div className="mb-4 flex items-center gap-2">
        <div className={`flex size-8 items-center justify-center rounded-full bg-white/80 ${config.accent}`}>
          <SeasonIcon className="size-4" />
        </div>
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <ShoppingBag className="size-4 text-primary" />
            {month}月のおすすめアイテム
          </h2>
          <p className="text-xs text-muted-foreground">
            {config.label}の釣りに役立つアイテムをピックアップ
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((product) => (
          <a
            key={product.id}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block"
          >
            <Card className="group h-full gap-0 border-white/60 bg-white/80 py-0 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    className={`shrink-0 text-[10px] ${CATEGORY_COLORS[product.category]}`}
                  >
                    {CATEGORY_LABELS[product.category]}
                  </Badge>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h3 className="mt-2 text-sm font-semibold leading-tight group-hover:text-primary">
                  {product.name}
                </h3>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
                <div className="mt-3 flex items-center justify-center rounded-md bg-[#FF9900]/10 px-3 py-1.5 text-xs font-medium text-[#FF9900] transition-colors group-hover:bg-[#FF9900] group-hover:text-white">
                  {product.url.includes("rakuten") || product.url.includes("r10.to")
                    ? "楽天で見る"
                    : "Amazonで見る"}
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground">
        ※ 上記リンクはアフィリエイトリンクを含みます。購入による追加費用は発生しません。
      </p>
    </section>
  );
}
