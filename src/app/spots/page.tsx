import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { SpotListClient } from "@/components/spots/spot-list-client";

export const metadata: Metadata = {
  title: "釣りスポット一覧 - 全国の釣り場を地域・タイプ別に検索",
  description:
    "全国の人気釣りスポットを一覧で紹介。堤防・漁港・磯・河川など釣り場タイプや地域・難易度で絞り込み検索ができます。初心者向けの安全な釣り場から上級者向けの本格磯まで、あなたにぴったりの釣り場が見つかります。",
  openGraph: {
    title: "釣りスポット一覧 - 全国の釣り場を地域・タイプ別に検索",
    description:
      "全国の人気釣りスポットを一覧で紹介。堤防・漁港・磯・河川など釣り場タイプや地域・難易度で絞り込み検索。",
    type: "website",
    url: "https://tsurispot.com/spots",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/spots",
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
      name: "釣りスポット一覧",
      item: "https://tsurispot.com/spots",
    },
  ],
};

export default function SpotsPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mb-5 flex items-start justify-between gap-4 sm:mb-8">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">釣りスポット一覧</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
            全国の釣りスポットを地域・タイプ・難易度で絞り込み
          </p>
        </div>
        <Link
          href="/spots/submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 min-h-[44px]"
        >
          <PlusCircle className="size-4" />
          <span className="hidden sm:inline">スポットを投稿</span>
          <span className="sm:hidden">投稿</span>
        </Link>
      </div>
      <SpotListClient spots={fishingSpots} />
    </div>
  );
}
