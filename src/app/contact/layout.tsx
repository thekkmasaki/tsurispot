import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お問い合わせ - ツリスポ",
  description:
    "ツリスポへのお問い合わせページです。釣りスポット情報の修正・新規追加の要望、サイトのバグ報告、釣具店の無料掲載相談、広告・提携のご相談など、どんな内容でもお気軽にお寄せください。通常3営業日以内に返信いたします。",
  alternates: {
    canonical: "https://tsurispot.com/contact",
  },
  openGraph: {
    title: "お問い合わせ | ツリスポ",
    description:
      "スポット情報の修正・追加要望、バグ報告、釣具店の掲載相談、広告・提携のご相談などお気軽にどうぞ。通常3営業日以内に返信します。",
    url: "https://tsurispot.com/contact",
    siteName: "ツリスポ",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
