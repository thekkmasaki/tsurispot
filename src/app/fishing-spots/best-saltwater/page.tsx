import type { Metadata } from "next";
import Link from "next/link";
import { fishingSpots } from "@/lib/data/spots";
import { AreaFilteredSpotList, type SpotCardData } from "@/components/spots/area-filter";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "海釣りおすすめスポット一覧｜全国の人気釣り場【2026年版】",
  description:
    "全国の海釣りおすすめスポットを評価順にランキング。漁港・堤防・磯・砂浜・桟橋など海釣りスポットを網羅。初心者向けの安全な釣り場から上級者向けの本格磯まで、釣れる魚や設備情報も掲載。",
  openGraph: {
    title: "海釣りおすすめスポット一覧｜全国の人気釣り場【2026年版】",
    description:
      "全国の海釣りおすすめスポットを評価順にランキング。漁港・堤防・磯・砂浜など海釣り場を網羅。",
    type: "website",
    url: "https://tsurispot.com/fishing-spots/best-saltwater",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing-spots/best-saltwater",
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
    {
      "@type": "ListItem",
      position: 3,
      name: "海釣りおすすめスポット",
      item: "https://tsurispot.com/fishing-spots/best-saltwater",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "海釣りにおすすめの場所はどこですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者には足場が安定した漁港や堤防がおすすめです。駐車場やトイレが整備されている場所を選ぶと快適に釣りが楽しめます。中上級者には磯釣りや砂浜からのサーフフィッシングも人気です。当サイトでは全国の海釣りスポットを評価順にご紹介しています。",
      },
    },
    {
      "@type": "Question",
      name: "海釣り初心者におすすめの釣り方は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "サビキ釣りが最もおすすめです。足元に仕掛けを落とすだけでアジ、サバ、イワシなどが釣れます。投げる技術が不要で、群れが回ってくれば一度にたくさん釣れるので初心者でも楽しめます。堤防や漁港で行うのが基本です。",
      },
    },
    {
      "@type": "Question",
      name: "海釣りのベストシーズンはいつですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "6月〜11月が最も魚種が豊富で釣りやすいシーズンです。夏はサビキ釣りでアジやイワシ、秋は青物やタチウオが狙えます。冬でもカサゴやメバルなどの根魚は釣れるので、防寒対策をすれば年中楽しめます。",
      },
    },
    {
      "@type": "Question",
      name: "海釣りに必要な費用はどのくらいですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者セット（竿・リール・仕掛け）は3,000〜5,000円程度で購入できます。エサ代は500〜1,000円、クーラーボックスは1,000〜3,000円です。無料で釣りができるスポットも多く、1万円以内で海釣りを始められます。",
      },
    },
    {
      "@type": "Question",
      name: "海釣りで注意すべきことは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "安全面ではライフジャケットの着用、天候の確認、滑りにくい靴の着用が重要です。マナー面ではゴミの持ち帰り、釣り場の清掃、釣り禁止区域の遵守が大切です。また、毒魚（ゴンズイ、ハオコゼなど）に注意し、素手で触らないようにしましょう。",
      },
    },
  ],
};

export default function BestSaltwaterPage() {
  const saltwaterTypes = ["port", "beach", "rocky", "pier", "breakwater"] as const;
  const spots: SpotCardData[] = fishingSpots
    .filter((s) => (saltwaterTypes as readonly string[]).includes(s.spotType))
    .sort((a, b) => b.rating - a.rating)
    .map((s) => ({
      id: s.id, slug: s.slug, name: s.name, spotType: s.spotType,
      difficulty: s.difficulty, rating: s.rating, isFree: s.isFree,
      hasParking: s.hasParking, hasToilet: s.hasToilet,
      hasRentalRod: s.hasRentalRod, hasConvenienceStore: s.hasConvenienceStore,
      mainImageUrl: s.mainImageUrl, region: s.region,
      fishNames: s.catchableFish.map((cf) => cf.fish.name),
    }));

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣りスポット", href: "/spots" },
          { label: "海釣りおすすめスポット" },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          海釣りおすすめスポット
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          全国の海釣りスポットを評価順にご紹介します。
          漁港・堤防・磯・砂浜・桟橋など、様々なタイプの海釣り場を掲載しています。
          初心者でも安心して楽しめる足場の良い漁港から、大物が狙える本格的な磯釣りポイントまで、
          あなたのレベルや目的に合った海釣りスポットが見つかります。
          各スポットの釣れる魚、設備情報、アクセス方法も確認できるので、釣行計画にお役立てください。
        </p>
      </div>

      <AreaFilteredSpotList spots={spots} />

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="mb-6 text-lg font-bold sm:text-xl">海釣りのよくある質問</h2>
        <div className="space-y-4">
          {(faqJsonLd.mainEntity as Array<{ "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }>).map((faq, i) => (
            <div key={i} className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">{faq.name}</h3>
              <p className="text-sm text-muted-foreground">{faq.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Related links */}
      <section className="mt-10 rounded-xl border bg-muted/30 p-6">
        <h2 className="mb-4 text-lg font-bold">関連ページ</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link
            href="/fishing-spots/breakwater-beginner"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">初心者向け堤防釣りスポット</p>
            <p className="mt-1 text-xs text-muted-foreground">
              初心者に安全な堤防・漁港を厳選
            </p>
          </Link>
          <Link
            href="/guide/beginner"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">釣り初心者完全ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              道具選びから釣り方まで徹底解説
            </p>
          </Link>
          <Link
            href="/seasonal"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">季節別釣りガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              春夏秋冬のおすすめ釣りを紹介
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
