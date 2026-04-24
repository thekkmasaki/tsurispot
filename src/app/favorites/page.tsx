import type { Metadata } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { FavoritesClient } from "./favorites-client";

export const metadata: Metadata = {
  title: "お気に入りスポット",
  description: "お気に入りに保存した釣りスポットを一覧で確認・管理できます。ブラウザのローカルストレージに保存されるため、アカウント登録不要で手軽にブックマークとして活用できます。",
  robots: { index: false },
};

// SpotCardが使うフィールドだけを抽出してクライアントに渡す
const spotMap = Object.fromEntries(
  fishingSpots.map((s) => [
    s.slug,
    {
      id: s.id,
      slug: s.slug,
      name: s.name,
      mainImageUrl: s.mainImageUrl,
      spotType: s.spotType,
      region: s.region,
      catchableFish: s.catchableFish,
      rating: s.rating,
      difficulty: s.difficulty,
      isFree: s.isFree,
      hasParking: s.hasParking,
      hasToilet: s.hasToilet,
      hasRentalRod: s.hasRentalRod,
      hasConvenienceStore: s.hasConvenienceStore,
    },
  ])
);

export default function FavoritesPage() {
  return <FavoritesClient spotMap={spotMap} />;
}
