import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PlusCircle, ArrowRight } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { SpotListClient } from "@/components/spots/spot-list-client";
import { SpotListFallback } from "@/components/spots/spot-list-fallback";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/ui/page-header";
import { InArticleAd } from "@/components/ads/ad-unit";
import { toListSpot } from "@/lib/data/list-spot";
import { SeasonalAffiliateSection } from "@/components/seasonal-affiliate-section";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";

// ISR: 1時間ごとに再検証 (Cloudflare cache 効率と App Runner 負荷低減のため SSG/ISR を採用)
export const revalidate = 3600;

const sc = fishingSpots.length.toLocaleString();

// 全 FishingSpot をクライアントに渡すと JS バンドル / RSC ペイロードが肥大化するため、
// 一覧カードに必要な軽量 ListSpot に絞ってから SpotListClient へ渡す（CWV改善）。
const listSpots = fishingSpots.map(toListSpot);

// 掲載スポット全体で最も多い釣り方（装備レコメンドの文脈スコアリングに使う）。
// 一覧ページは 1,555PV に対し affiliateClick 0 件＝収益枠が1つも無い状態だった（2026-08-23 実測）。
const nationalMethodCount = new Map<string, number>();
for (const spot of fishingSpots) {
  for (const cf of spot.catchableFish) {
    nationalMethodCount.set(cf.method, (nationalMethodCount.get(cf.method) || 0) + 1);
  }
}
const nationalMethods = Array.from(nationalMethodCount.entries())
  .sort((a, b) => b[1] - a[1])
  .map(([method]) => method);

export const metadata: Metadata = {
  title: `全国${sc}+の釣りスポット・釣り場を検索｜子連れ・初心者向けの穴場も`,
  description: `全国${sc}箇所以上の釣りスポットを地域・タイプ・難易度で絞り込み検索。堤防・漁港・磯・河川・湖の穴場から初心者OK・子連れファミリー向け・駐車場あり・トイレありの釣り場まで条件指定で探せます。今釣れる魚や混雑予想もわかる。`,
  openGraph: {
    title: `全国${sc}+の釣りスポット・釣り場を検索｜子連れ・初心者向けの穴場も`,
    description: `全国${sc}箇所以上の釣りスポットを検索。堤防・漁港・磯・河川などタイプ別・都道府県別に絞り込み。子連れ・初心者向けや駐車場あり等の条件で探せます。`,
    type: "website",
    url: "https://tsurispot.com/spots",
    siteName: "ツリスポ",
    images: [{ url: "https://tsurispot.com/api/og?title=全国の釣りスポット・釣り場検索&emoji=🎣", width: 1200, height: 630 }],
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

const spotsDatasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "日本の釣りスポットデータベース",
  description:
    "日本全国の釣りスポット・釣り場情報を収録したデータベース。堤防・漁港・磯・河川・湖沼など多様なスポットタイプをカバーし、釣れる魚種・アクセス・設備情報を提供。",
  url: "https://tsurispot.com/spots",
  license: "https://tsurispot.com/terms",
  creator: {
    "@type": "Organization",
    name: "ツリスポ編集部",
    url: "https://tsurispot.com",
  },
  distribution: {
    "@type": "DataDownload",
    encodingFormat: "text/html",
    contentUrl: "https://tsurispot.com/spots",
  },
  spatialCoverage: {
    "@type": "Place",
    name: "Japan",
  },
  variableMeasured: [
    "釣り場名",
    "位置情報（緯度・経度）",
    "スポットタイプ",
    "釣れる魚種",
    "難易度",
    "設備情報",
    "混雑予想",
  ],
  measurementTechnique: "現地調査・ユーザー投稿・公開情報の集約",
  keywords: ["釣りスポット", "釣り場", "フィッシング", "日本", "堤防", "漁港", "磯", "河川"],
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
      name: "子連れ・ファミリーにおすすめの釣り場は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "駐車場・トイレ完備で足場の良い堤防や海釣り公園がおすすめです。難易度「初心者向け」のスポットはお子様連れでも安心して楽しめます。サビキ釣りなら小さなお子様でも簡単に魚が釣れます。ファミリーフィッシングガイドも参考にしてください。",
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

export default function SpotsPage() {
  const currentMonth = new Date().getMonth() + 1; // ISR(revalidate=3600)で毎時更新される
  const affiliateProducts = getRelevantAffiliateProducts(nationalMethods, currentMonth, 3);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(spotsDatasetJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣りスポット" },
        ]}
      />
      <div className="mb-5 flex items-start justify-between gap-4 sm:mb-8">
        <PageHeader
          title="近くの釣りスポット・釣り場を探す"
          lead="全国の釣りスポット・穴場を地域・タイプ・難易度で絞り込み"
        />
        <Link prefetch={false}
          href="/spots/submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 min-h-[44px]"
        >
          <PlusCircle className="size-4" />
          <span className="hidden sm:inline">スポットを投稿</span>
          <span className="sm:hidden">投稿</span>
        </Link>
      </div>
      {/* SpotListClient は useSearchParams() を使うため Suspense 境界が必須。
          fallback は既定一覧のサーバー描画（SSR 本文の担保・CSRバックアウト再発防止） */}
      <Suspense fallback={<SpotListFallback spots={listSpots} />}>
        <SpotListClient spots={listSpots} />
      </Suspense>

      {/* おすすめ装備（収益導線）: スポット一覧を見終えた直後＝釣行準備で道具の必要性が最も高まる位置。
          収益密度トップの /fishing/[method]/area/[region]（aff/PV 1.079%）と同じ「一覧・攻略の直後」順序に揃える。 */}
      <SeasonalAffiliateSection
        products={affiliateProducts}
        seasonLabel={`${currentMonth}月`}
        regionName=""
      />

      {/* 初心者CTA */}
      <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-emerald-900 sm:text-lg">釣りが初めてですか？</h2>
            <p className="mt-1 text-sm text-emerald-700">
              道具の選び方から釣り方まで、初心者向けのガイドを用意しています。
            </p>
          </div>
          <Link prefetch={false}
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
          <Link prefetch={false} href="/fishing-spots/breakwater-beginner" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">堤防釣り初心者向け</span>
            <p className="mt-1 text-xs text-muted-foreground">安全で釣りやすい堤防</p>
          </Link>
          <Link prefetch={false} href="/fishing-spots/best-saltwater" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">海釣りおすすめ</span>
            <p className="mt-1 text-xs text-muted-foreground">人気の海釣りスポット</p>
          </Link>
          <Link prefetch={false} href="/fishing-spots/river-beginner" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">川釣り初心者向け</span>
            <p className="mt-1 text-xs text-muted-foreground">のんびり楽しめる川釣り</p>
          </Link>
          <Link prefetch={false} href="/fishing-spots/near-me" className="rounded-lg border p-3 text-sm hover:bg-muted transition-colors">
            <span className="font-medium">近くの釣り場</span>
            <p className="mt-1 text-xs text-muted-foreground">現在地から近い順で表示</p>
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">人気エリア:</span>
          <Link prefetch={false} href="/prefecture/hokkaido" className="hover:text-primary">北海道</Link>
          <Link prefetch={false} href="/prefecture/tokyo" className="hover:text-primary">東京</Link>
          <Link prefetch={false} href="/prefecture/kanagawa" className="hover:text-primary">神奈川</Link>
          <Link prefetch={false} href="/prefecture/chiba" className="hover:text-primary">千葉</Link>
          <Link prefetch={false} href="/prefecture/shizuoka" className="hover:text-primary">静岡</Link>
          <Link prefetch={false} href="/prefecture/aichi" className="hover:text-primary">愛知</Link>
          <Link prefetch={false} href="/prefecture/osaka" className="hover:text-primary">大阪</Link>
          <Link prefetch={false} href="/prefecture/hyogo" className="hover:text-primary">兵庫</Link>
          <Link prefetch={false} href="/prefecture/fukuoka" className="hover:text-primary">福岡</Link>
          <Link prefetch={false} href="/prefecture/okinawa" className="hover:text-primary">沖縄</Link>
          <Link prefetch={false} href="/prefecture" className="font-medium hover:text-primary">全都道府県 →</Link>
        </div>
      </div>

      <InArticleAd className="my-8" />
    </div>
  );
}
