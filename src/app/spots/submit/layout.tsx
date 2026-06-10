import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "釣りスポットを投稿する - ツリスポ",
  description:
    "あなたの知っている釣りスポットをツリスポに投稿しましょう。情報はスタッフが確認後、サイトに掲載されます。",
  // 投稿フォームは検索結果に出す価値がないため noindex（robots.txt の disallow から一本化）。
  robots: { index: false, follow: false },
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
