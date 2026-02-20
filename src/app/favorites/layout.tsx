import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お気に入りスポット一覧 - ツリスポ",
  description:
    "お気に入りに登録した釣りスポットの一覧ページ。気になるスポットを保存してまとめて確認できます。",
};

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
