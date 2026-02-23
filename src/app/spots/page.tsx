import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { SpotListClient } from "@/components/spots/spot-list-client";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "全国の釣りスポット・釣り場を検索｜近くの穴場も探せる",
  description:
    "近くの釣りスポットや穴場の釣り場を簡単検索。全国の堤防・漁港・磯・河川など釣り場タイプや地域・難易度で絞り込みできます。初心者向けの安全な釣り場から上級者向けの本格磯まで、あなたにぴったりの釣り場が見つかります。",
  openGraph: {
    title: "全国の釣りスポット・釣り場を検索｜近くの穴場も探せる",
    description:
      "近くの釣りスポットや穴場の釣り場を検索。堤防・漁港・磯・河川などタイプ別・地域別に絞り込み。初心者にもおすすめ。",
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

export default async function SpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q || "";

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣りスポット" },
        ]}
      />
      <div className="mb-5 flex items-start justify-between gap-4 sm:mb-8">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">近くの釣りスポット・釣り場を探す</h1>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">
            全国の釣りスポット・穴場を地域・タイプ・難易度で絞り込み
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
      <SpotListClient spots={fishingSpots} initialQuery={initialQuery} />

      {/* SEO: 関連ページリンクセクション */}
      <div className="mt-10 border-t pt-8">
        <h2 className="mb-4 text-lg font-bold">目的別に釣り場を探す</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/fishing-spots/breakwater-beginner" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">堤防釣り初心者向け</span>
            <p className="mt-1 text-xs text-muted-foreground">安全で釣りやすい堤防</p>
          </Link>
          <Link href="/fishing-spots/best-saltwater" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">海釣りおすすめ</span>
            <p className="mt-1 text-xs text-muted-foreground">人気の海釣りスポット</p>
          </Link>
          <Link href="/fishing-spots/river-beginner" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">川釣り初心者向け</span>
            <p className="mt-1 text-xs text-muted-foreground">のんびり楽しめる川釣り</p>
          </Link>
          <Link href="/fishing-spots/near-me" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">近くの釣り場</span>
            <p className="mt-1 text-xs text-muted-foreground">現在地から近い順で表示</p>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">人気エリア:</span>
          <Link href="/prefecture/hokkaido" className="hover:text-primary">北海道</Link>
          <Link href="/prefecture/tokyo" className="hover:text-primary">東京</Link>
          <Link href="/prefecture/kanagawa" className="hover:text-primary">神奈川</Link>
          <Link href="/prefecture/chiba" className="hover:text-primary">千葉</Link>
          <Link href="/prefecture/shizuoka" className="hover:text-primary">静岡</Link>
          <Link href="/prefecture/aichi" className="hover:text-primary">愛知</Link>
          <Link href="/prefecture/osaka" className="hover:text-primary">大阪</Link>
          <Link href="/prefecture/hyogo" className="hover:text-primary">兵庫</Link>
          <Link href="/prefecture/fukuoka" className="hover:text-primary">福岡</Link>
          <Link href="/prefecture/okinawa" className="hover:text-primary">沖縄</Link>
          <Link href="/prefecture" className="font-medium hover:text-primary">全都道府県 →</Link>
        </div>
      </div>
    </div>
  );
}
