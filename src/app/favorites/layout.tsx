import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お気に入りスポット一覧 - ツリスポ",
  description:
    "お気に入りに登録した釣りスポットをまとめて確認できるページです。アカウント登録不要で、気になるスポットをワンタップで保存。釣れる魚・施設情報・アクセスを比較しながら次の釣行先を計画しましょう。",
  alternates: {
    canonical: "https://tsurispot.com/favorites",
  },
  openGraph: {
    title: "お気に入りスポット一覧 | ツリスポ",
    description:
      "お気に入りに保存した釣りスポットをまとめて確認。アカウント不要でワンタップ保存、釣行計画に便利な比較機能付き。",
    url: "https://tsurispot.com/favorites",
    siteName: "ツリスポ",
  },
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
