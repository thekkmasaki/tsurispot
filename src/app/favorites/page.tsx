import type { Metadata } from "next";
import { FavoritesClient } from "./favorites-client";

export const metadata: Metadata = {
  title: "お気に入りスポット",
  description: "お気に入りに保存した釣りスポットを一覧で確認・管理できます。ブラウザのローカルストレージに保存されるため、アカウント登録不要で手軽にブックマークとして活用できます。",
  robots: { index: false },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
