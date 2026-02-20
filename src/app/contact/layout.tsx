import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ - ツリスポ",
  description:
    "ツリスポへのお問い合わせページです。スポット情報の修正・追加要望、バグ報告などお気軽にお寄せください。",
  alternates: {
    canonical: "https://tsurispot.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
