import type { Metadata } from "next";
import Link from "next/link";
import { Heart, User } from "lucide-react";
import { StreakCard } from "@/components/activity/streak-card";
import { FishdexSummaryCard } from "@/components/fish/fishdex-summary-card";
import { fishSpecies } from "@/lib/data/fish";
import { Card, CardContent } from "@/components/ui/card";

/**
 * 匿名マイページ（案②）。ログインの壁の手前で「自分の記録」を見られる場所。
 * 記録はこの端末の localStorage が正。ログインすると /api 側と統合される。
 */
export const metadata: Metadata = {
  title: "あなたの記録",
  description:
    "ツリスポの利用記録（連続日数・活動カレンダー・バッジ）をアカウント登録なしで確認できます。記録はこの端末に保存されます。",
  robots: { index: false },
};

export default function MePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <User className="h-5 w-5 text-ocean-mid" />
        あなたの記録
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        アカウント登録なしで使えます。記録はこの端末に保存されています。
      </p>

      <StreakCard className="mt-4" />

      <FishdexSummaryCard total={fishSpecies.length} className="mt-4" />

      <Card className="mt-4">
        <CardContent className="p-4">
          <Link
            prefetch={false}
            href="/favorites"
            className="flex items-center gap-2 text-sm font-medium text-ocean-mid"
          >
            <Heart className="h-4 w-4" />
            お気に入りスポットを見る
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            お気に入りに入れたスポットは、毎日の釣行判断の起点になります。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
