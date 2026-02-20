import type { Metadata } from "next";
import { MapWrapper } from "@/components/map/map-wrapper";

export const metadata: Metadata = {
  title: "地図で釣りスポットを探す - 全国の釣り場マップ",
  description:
    "全国の釣りスポットを地図上でインタラクティブに検索。マーカーをタップするだけで釣り場の詳細情報、釣れる魚、アクセス方法がわかります。近くの釣り場探しに最適な釣りマップです。",
  openGraph: {
    title: "地図で釣りスポットを探す - 全国の釣り場マップ",
    description:
      "全国の釣りスポットを地図上で検索。マーカーをタップして釣り場の詳細情報を確認できます。",
    type: "website",
    url: "https://tsurispot.com/map",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/map",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "ホーム",
      item: "https://tsurispot.com",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "釣り場マップ",
      item: "https://tsurispot.com/map",
    },
  ],
};

export default function MapPage() {
  return (
    <main className="container mx-auto px-4 py-4 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold tracking-tight sm:text-3xl">
          地図で釣りスポットを探す
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2">
          マーカーをタップしてスポットの詳細を確認できます。
        </p>
      </div>
      <MapWrapper />
    </main>
  );
}
