import type { Metadata } from "next";
import Link from "next/link";
import { fishingSpots } from "@/lib/data/spots";
import { AreaFilteredSpotList } from "@/components/spots/area-filter";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "初心者におすすめの堤防釣りスポット一覧【2026年版】",
  description:
    "堤防釣り初心者におすすめの釣りスポットを厳選紹介。足場が安定して安全な堤防・漁港・桟橋の釣り場を難易度別に掲載。駐車場・トイレ情報や釣れる魚も確認できます。初めての堤防釣りはここから。",
  openGraph: {
    title: "初心者におすすめの堤防釣りスポット一覧【2026年版】",
    description:
      "堤防釣り初心者におすすめの釣りスポットを厳選紹介。安全で足場の良い堤防・漁港を難易度別に掲載。",
    type: "website",
    url: "https://tsurispot.com/fishing-spots/breakwater-beginner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing-spots/breakwater-beginner",
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
      name: "初心者向け堤防釣りスポット",
      item: "https://tsurispot.com/fishing-spots/breakwater-beginner",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "堤防釣りとは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "堤防釣りとは、漁港や港の防波堤・堤防からおこなう釣りのことです。足場がコンクリートで安定しており、波も穏やかなため初心者やファミリーでも安全に楽しめます。サビキ釣りやちょい投げ、穴釣りなど様々な釣り方が可能です。",
      },
    },
    {
      "@type": "Question",
      name: "堤防釣りに必要な道具は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "最低限必要なのは釣竿（万能竿2〜3m）、スピニングリール（2000〜3000番）、仕掛け（サビキ仕掛けが万能）、エサ（アミエビ）です。初心者セットなら3,000〜5,000円で一式揃います。バケツ、クーラーボックス、タオル、ゴミ袋もあると便利です。",
      },
    },
    {
      "@type": "Question",
      name: "初心者でも堤防釣りで魚は釣れますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい、堤防釣りは初心者でも比較的簡単に魚が釣れます。特にサビキ釣りならアジ、サバ、イワシなどの回遊魚が群れで釣れることも多く、投げる技術も不要です。夏〜秋のシーズンなら初心者でも高い確率で釣果が期待できます。",
      },
    },
    {
      "@type": "Question",
      name: "堤防釣りのおすすめの時期は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "6月〜10月がベストシーズンです。特に夏はアジやサバの回遊が活発で、サビキ釣りの好シーズン。秋はタチウオやカマスも加わり魚種が豊富になります。冬でもカサゴやメバルなどの根魚は堤防から狙えます。",
      },
    },
    {
      "@type": "Question",
      name: "堤防釣りで注意すべきことは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "柵のない堤防ではライフジャケットを着用しましょう。滑りにくい靴を履き、天候悪化時は無理せず撤退してください。釣り禁止・立入禁止区域では釣りをしないこと。ゴミは必ず持ち帰り、漁業関係者の邪魔にならないよう配慮することが大切です。",
      },
    },
  ],
};

export default function BreakwaterBeginnerPage() {
  const spots = fishingSpots
    .filter(
      (s) =>
        s.difficulty === "beginner" &&
        (s.spotType === "breakwater" || s.spotType === "pier" || s.spotType === "port")
    )
    .sort((a, b) => b.rating - a.rating);

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
          { label: "初心者向け堤防釣りスポット" },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          初心者におすすめの堤防釣りスポット
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          堤防釣りは、足場が安定していて波も穏やかなため、釣り初心者が最初に訪れるのに最適な釣り場です。
          コンクリートで整備された堤防や漁港なら、特別な装備がなくても安全に釣りを楽しめます。
          サビキ釣りでアジやイワシを狙ったり、ちょい投げでキスを釣ったり、穴釣りでカサゴを釣ったりと、
          一つの堤防で様々な釣り方が楽しめるのも大きな魅力です。
          このページでは、初心者でも安心して楽しめる全国の堤防・漁港の釣りスポットを厳選してご紹介します。
        </p>
      </div>

      <AreaFilteredSpotList spots={spots} />

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="mb-6 text-lg font-bold sm:text-xl">堤防釣りのよくある質問</h2>
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
            href="/guide/beginner"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">釣り初心者完全ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              道具選びから釣り方まで徹底解説
            </p>
          </Link>
          <Link
            href="/guide/sabiki"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">サビキ釣り完全ガイド</p>
            <p className="mt-1 text-xs text-muted-foreground">
              堤防の定番、サビキ釣りを詳しく解説
            </p>
          </Link>
          <Link
            href="/fishing-spots/best-saltwater"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">海釣りおすすめスポット</p>
            <p className="mt-1 text-xs text-muted-foreground">
              全国の海釣りスポットを評価順に紹介
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
