import type { Metadata } from "next";
import Link from "next/link";
import { fishingSpots } from "@/lib/data/spots";
import { SpotCard } from "@/components/spots/spot-card";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "初心者におすすめの川釣りスポット一覧【2026年版】",
  description:
    "川釣り初心者におすすめの釣りスポットを厳選紹介。全国の河川釣り場を難易度別に掲載。渓流釣り・バス釣り・ハゼ釣りなど、川で楽しめる釣り方や釣れる魚の情報も充実。初めての川釣りに最適な場所が見つかります。",
  openGraph: {
    title: "初心者におすすめの川釣りスポット一覧【2026年版】",
    description:
      "川釣り初心者におすすめの釣りスポットを厳選。全国の河川釣り場を難易度別に掲載。",
    type: "website",
    url: "https://tsurispot.com/fishing-spots/river-beginner",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing-spots/river-beginner",
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
      name: "初心者向け川釣りスポット",
      item: "https://tsurispot.com/fishing-spots/river-beginner",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "川釣りとは？海釣りとの違いは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "川釣りは河川や湖沼で行う淡水の釣りです。海釣りとの大きな違いは、多くの河川では遊漁券（遊漁料）の購入が必要な点です。対象魚はアユ、ヤマメ、イワナ、ブラックバス、フナ、コイなど。自然豊かな環境で四季の移ろいを感じながら釣りが楽しめます。",
      },
    },
    {
      "@type": "Question",
      name: "川釣り初心者におすすめの釣り方は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "初心者にはウキ釣りやミャク釣りがおすすめです。ウキ釣りはウキの動きでアタリがわかりやすく、フナやコイ、オイカワなどが狙えます。管理釣り場（釣り堀）でのニジマス釣りも手軽で確実に釣れるので、初心者の最初の一歩に最適です。",
      },
    },
    {
      "@type": "Question",
      name: "川釣りに必要な道具は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "延べ竿（3〜5m）、仕掛け（ウキ・ハリス・針のセット）、エサ（練りエサやミミズ）が基本です。リール不要の延べ竿なら2,000〜3,000円程度で購入でき、仕掛けも数百円です。川釣りは海釣りよりも初期費用を抑えて始められます。",
      },
    },
    {
      "@type": "Question",
      name: "川釣りで遊漁券は必ず必要ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "河川によって異なります。漁業協同組合が管理する河川では遊漁券の購入が必要です。1日券は500〜2,000円程度、年券は3,000〜10,000円程度が一般的です。コンビニや釣具店、オンラインで購入できます。管理釣り場の場合は入場料に含まれています。",
      },
    },
    {
      "@type": "Question",
      name: "川釣りのベストシーズンはいつですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "魚種によって異なりますが、春〜秋（4月〜10月）が全般的に楽しみやすい時期です。アユは6〜9月、ヤマメ・イワナは3〜9月（渓流釣り解禁期間）、バス釣りは4〜10月がベストです。フナやコイは年中狙えますが、春の乗っ込みシーズンが特に好釣果が期待できます。",
      },
    },
  ],
};

export default function RiverBeginnerPage() {
  const spots = fishingSpots
    .filter((s) => s.spotType === "river" && s.difficulty === "beginner")
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
          { label: "初心者向け川釣りスポット" },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          初心者におすすめの川釣りスポット
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          川釣りは自然豊かな環境で四季の移ろいを感じながら楽しめる釣りです。
          海釣りに比べて道具がシンプルで初期費用も抑えられるため、気軽に始められます。
          清流でのヤマメやイワナ狙い、里川でのフナやオイカワ釣り、湖沼でのバス釣りなど、
          川釣りには様々な楽しみ方があります。
          このページでは、初心者でも安全にアクセスできて釣果が期待できる全国の川釣りスポットを厳選してご紹介します。
        </p>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {spots.length}件のスポットが見つかりました
      </p>

      {spots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 py-12 text-center">
          <p className="text-muted-foreground">
            初心者向けの川釣りスポットを準備中です。
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <Link href="/spots" className="text-primary hover:underline">
              全ての釣りスポット一覧
            </Link>
            からお探しください。
          </p>
        </div>
      )}

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="mb-6 text-lg font-bold sm:text-xl">川釣りのよくある質問</h2>
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
            href="/fishing-spots/breakwater-beginner"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">初心者向け堤防釣りスポット</p>
            <p className="mt-1 text-xs text-muted-foreground">
              堤防・漁港の初心者向け釣り場
            </p>
          </Link>
          <Link
            href="/fishing-spots/near-me"
            className="rounded-lg border bg-white p-4 text-center transition-shadow hover:shadow-md"
          >
            <p className="font-semibold">近くの釣り場を探す</p>
            <p className="mt-1 text-xs text-muted-foreground">
              現在地から近い釣りスポットを検索
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
