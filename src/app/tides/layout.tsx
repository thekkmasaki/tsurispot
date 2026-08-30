import type { Metadata } from "next";

// メタデータは各ページ（/tides ハブ・/tides/[station] 地点別）が個別に定義する。
// レイアウトで canonical を固定すると239地点ページ全てが /tides 扱いになるため定義しない。
export const metadata: Metadata = {
  openGraph: {
    type: "website",
    siteName: "ツリスポ",
  },
};

export default function TidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
