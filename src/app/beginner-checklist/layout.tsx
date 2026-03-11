import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "初心者持ち物チェックリスト",
  description:
    "海釣り・堤防釣り初心者のための持ち物チェックリスト。必須アイテムからあると便利なグッズまで、忘れ物ゼロで釣りを楽しむための完全リスト。",
  alternates: {
    canonical: "https://tsurispot.com/beginner-checklist",
  },
  openGraph: {
    title: "初心者持ち物チェックリスト | ツリスポ",
    description:
      "海釣り・堤防釣り初心者のための持ち物チェックリスト。忘れ物ゼロで釣りを楽しもう。",
    url: "https://tsurispot.com/beginner-checklist",
    siteName: "ツリスポ",
  },
};

export default function BeginnerChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
