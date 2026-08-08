import { SpotCard } from "@/components/spots/spot-card";
import { ListSpot } from "@/types";

// SpotListClient は useSearchParams() を使うため、静的生成時は Suspense fallback が
// SSR HTML に載る。ここが空スケルトンだと /spots の SSR から本文が消える
// （2026-07 の CSR バックアウト問題の再発）ため、既定状態（絞り込みなし・1ページ目）と
// 同じ一覧をサーバーで描画して SEO 上の本文を担保する。
// クライアントでは hydration 後に SpotListClient がこの内容を置き換える。
const ITEMS_PER_PAGE = 20;

export function SpotListFallback({ spots }: { spots: ListSpot[] }) {
  const firstPage = spots.slice(0, ITEMS_PER_PAGE);
  return (
    <div className="space-y-4 sm:space-y-6">
      <p className="text-sm text-muted-foreground">{spots.length}件のスポット</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {firstPage.map((spot, index) => (
          <SpotCard key={spot.id} spot={spot} priority={index < 4} />
        ))}
      </div>
    </div>
  );
}
