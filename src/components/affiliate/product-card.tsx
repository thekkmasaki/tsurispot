"use client";

import { ExternalLink, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAmazonUrl, getRakutenUrl } from "@/lib/affiliate-config";
import type { Product } from "@/lib/data/products";

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const amazonUrl = getAmazonUrl(product.amazonAsin, product.name);
  const rakutenUrl = getRakutenUrl(product.rakutenSearchQuery);

  return (
    <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col p-4 sm:p-5">
        {/* ヘッダー：バッジ */}
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {product.priority <= 3 && (
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              <Star className="mr-0.5 size-3 fill-amber-500 text-amber-500" />
              おすすめ
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {DIFFICULTY_LABEL[product.difficulty]}
          </Badge>
        </div>

        {/* 商品名 */}
        <h3 className="mb-1.5 text-sm font-bold leading-snug text-foreground sm:text-base">
          {product.name}
        </h3>

        {/* 説明 */}
        <p className="mb-3 flex-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {product.description}
        </p>

        {/* 価格帯 */}
        <div className="mb-3">
          <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
            {product.priceRange}
          </span>
        </div>

        {/* CTAボタン */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FF9900] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#E88B00]"
          >
            Amazonで見る
            <ExternalLink className="size-3.5" />
          </a>
          <a
            href={rakutenUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#BF0000] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#A00000]"
          >
            楽天で見る
            <ExternalLink className="size-3.5" />
          </a>
        </div>

        {/* 免責事項 */}
        <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
          ※ 価格は変動します。最新の価格は各サイトでご確認ください。
        </p>
      </CardContent>
    </Card>
  );
}
