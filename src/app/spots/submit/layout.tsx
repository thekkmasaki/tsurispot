import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "釣りスポットを投稿する - ツリスポ",
  description:
    "あなたの知っている釣りスポットをツリスポに投稿しましょう。情報はスタッフが確認後、サイトに掲載されます。",
};

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
