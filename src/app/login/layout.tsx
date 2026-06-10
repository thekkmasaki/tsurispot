import type { Metadata } from "next";

// ログインページは検索結果に出す価値がないため noindex。
// robots.txt の disallow ではなく noindex メタで除外を一本化している
// （disallow するとクローラーがメタを読めず「ブロック済みだがインデックス登録」になるため）。
export const metadata: Metadata = {
  title: "ログイン",
  description:
    "ツリスポにログインして、釣果記録の保存やお気に入りスポットの同期など、便利な機能を利用しましょう。",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
