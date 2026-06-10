import type { Metadata } from "next";

// マイページはログインユーザー専用のため検索結果に出さない。
// robots.txt の disallow ではなく noindex メタで除外を一本化している
// （disallow するとクローラーがメタを読めず「ブロック済みだがインデックス登録」になるため）。
// このメタデータは配下の records / fishdex / prefecture-map / stats にも継承される。
export const metadata: Metadata = {
  title: "マイページ",
  description:
    "ツリスポのマイページ。釣果記録・釣魚図鑑・都道府県制覇マップ・釣果統計など、あなたの釣りの記録をまとめて管理できます。",
  robots: { index: false, follow: false },
};

export default function MypageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
