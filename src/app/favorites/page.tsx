import type { Metadata } from "next";
import { FavoritesClient } from "./favorites-client";

export const metadata: Metadata = {
  title: "お気に入りスポット",
  description: "保存した釣りスポットを一覧で確認",
  robots: { index: false },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
