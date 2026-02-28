import type { Metadata } from "next";
import Link from "next/link";
import { PlusCircle, ArrowRight } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { SpotListClient } from "@/components/spots/spot-list-client";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "全国の釣りスポット・釣り場を検索｜近くの穴場も探せる",
  description:
    "全国1,000箇所以上の釣りスポットを地域・タイプ・難易度で絞り込み検索。堤防・漁港・磯・河川の穴場から初心者OK・駐車場ありの釣り場まで条件指定で探せます。近くのおすすめ釣り場を今すぐ検索。",
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

const spotsItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "全国の釣りスポット一覧",
  numberOfItems: fishingSpots.length,
  itemListElement: fishingSpots
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20)
    .map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `https://tsurispot.com/spots/${s.slug}`,
    })),
};

const spotsFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "近くの釣り場はどうやって探せますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "位置情報を許可すると、現在地から近い順に釣り場を表示します。地図ページからも探せます。地域やスポットタイプで絞り込むことも可能です。",
      },
    },
    {
      "@type": "Question",
      name: "初心者におすすめの釣り場は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "堤防や漁港など足場の良い釣り場がおすすめです。スポット一覧で難易度を「初心者向け」に絞り込むと、安全で釣りやすいスポットが見つかります。",
      },
    },
    {
      "@type": "Question",
      name: "無料で釣りができる場所はありますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "多くの堤防や漁港は無料で釣りができます。スポット情報で「無料」と表記のある場所をお探しください。管理釣り場や一部の漁港では入場料が必要な場合があります。",
      },
    },
    {
      "@type": "Question",
      name: "釣り場の混雑状況はわかりますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "各スポットの詳細ページで混雑予想を確認できます。一般的に週末や祝日の早朝は混雑しやすく、平日や夕方は比較的空いています。",
      },
    },
    {
      "@type": "Question",
      name: "釣りスポットの情報は正確ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "掲載情報は定期的に更新していますが、現地の状況は変わることがあります。釣行前に最新の情報を確認し、立入禁止区域には入らないようご注意ください。",
      },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(spotsFaqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(spotsItemListJsonLd) }}
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

      {/* 初心者CTA */}
      <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-emerald-900 sm:text-lg">釣りが初めてですか？</h2>
            <p className="mt-1 text-sm text-emerald-700">
              道具の選び方から釣り方まで、初心者向けのガイドを用意しています。
            </p>
          </div>
          <Link
            href="/guide/beginner"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 min-h-[44px]"
          >
            初心者ガイドを読む
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

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
