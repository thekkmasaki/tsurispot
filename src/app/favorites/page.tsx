import type { Metadata } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { toListSpot } from "@/lib/data/list-spot";
import { FavoritesClient } from "./favorites-client";

export const metadata: Metadata = {
  title: "お気に入りスポット",
  description: "お気に入りに保存した釣りスポットを一覧で確認・管理できます。ブラウザのローカルストレージに保存されるため、アカウント登録不要で手軽にブックマークとして活用できます。",
  robots: { index: false },
};

// SpotCard が使う軽量 ListSpot に変換してクライアントへ渡す（穴場/高級魚はサーバー事前計算）。
// 旧実装は reviewCount/safetyLevel/hasFishingShop を欠いた部分データで穴場判定していたため、
// toListSpot に統一することでバッジ判定も正しくなる。
const spotMap = Object.fromEntries(
  fishingSpots.map((s) => [s.slug, toListSpot(s)])
);

export default function FavoritesPage() {
  return <FavoritesClient spotMap={spotMap} />;
}
