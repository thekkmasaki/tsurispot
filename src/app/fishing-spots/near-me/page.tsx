import type { Metadata } from "next";
import { fishingSpots } from "@/lib/data/spots";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { NearMeClient } from "./near-me-client";

export const metadata: Metadata = {
  title: "近くの釣り場・釣りスポットを探す｜現在地から検索【2026年版】",
  description:
    "現在地から近くの釣り場・釣りスポットをかんたん検索。位置情報を使って最寄りの釣りスポットを距離順に表示します。全国1000件以上の釣り場から、あなたの近くにある堤防・漁港・磯・河川の釣り場が見つかります。",
  openGraph: {
    title: "近くの釣り場・釣りスポットを探す｜現在地から検索【2026年版】",
    description:
      "現在地から近くの釣り場を検索。位置情報で最寄りの釣りスポットを距離順に表示。",
    type: "website",
    url: "https://tsurispot.com/fishing-spots/near-me",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing-spots/near-me",
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
      name: "近くの釣り場",
      item: "https://tsurispot.com/fishing-spots/near-me",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "近くの釣り場はどうやって探せますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "このページの「現在地から釣り場を探す」ボタンを押すと、ブラウザの位置情報機能を使って最寄りの釣り場を距離順に表示します。スマートフォンのGPSを利用するので、外出先でも簡単に近くの釣り場が見つかります。",
      },
    },
    {
      "@type": "Question",
      name: "位置情報を許可しなくても使えますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい、位置情報を許可しない場合でも全国の人気釣りスポットを評価順に表示します。地域や釣り場のタイプで絞り込むこともできます。",
      },
    },
    {
      "@type": "Question",
      name: "近くの釣り場に行く前に確認すべきことは？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "釣り禁止区域でないかの確認、駐車場やトイレの有無、天気予報と潮汐情報のチェックが大切です。各スポットの詳細ページで設備情報やアクセス方法を確認できます。初めての場所は明るい時間帯に訪れるのがおすすめです。",
      },
    },
    {
      "@type": "Question",
      name: "釣り場の情報は最新ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "当サイトでは定期的に釣り場情報を更新しています。ただし、台風や工事などで一時的に立入禁止になる場合もあります。釣行前に最新の状況を現地の釣具店や自治体のウェブサイトで確認することをおすすめします。",
      },
    },
    {
      "@type": "Question",
      name: "初心者でも行ける近くの釣り場を探すには？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "位置情報で釣り場を検索した後、難易度が「初心者向け」と表示されているスポットを選びましょう。漁港や堤防タイプの釣り場は足場が安定しており、初心者やファミリーにおすすめです。設備（駐車場・トイレ）が整っている場所を選ぶとより快適です。",
      },
    },
  ],
};

export default function NearMePage() {
  const spotData = fishingSpots.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    spotType: s.spotType,
    difficulty: s.difficulty,
    rating: s.rating,
    latitude: s.latitude,
    longitude: s.longitude,
    prefecture: s.region.prefecture,
    areaName: s.region.areaName,
    catchableFishNames: s.catchableFish.slice(0, 3).map((cf) => cf.fish.name),
    hasParking: s.hasParking,
    hasToilet: s.hasToilet,
    isFree: s.isFree,
    hasRentalRod: s.hasRentalRod,
    mainImageUrl: s.mainImageUrl,
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
          { label: "近くの釣り場" },
        ]}
      />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          近くの釣り場・釣りスポットを探す
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          「近くに釣りができる場所はないかな？」そんなときは位置情報を使って最寄りの釣りスポットを探しましょう。
          ボタンひとつであなたの現在地から近い順に釣り場が表示されます。
          堤防・漁港・磯・砂浜・河川など全国1000件以上の釣りスポットの中から、
          今すぐ行ける近くの釣り場が見つかります。
          各スポットの釣れる魚や設備情報も一目でわかるので、釣行計画がスムーズに立てられます。
        </p>
      </div>

      <NearMeClient spots={spotData} />

      {/* FAQ section */}
      <section className="mt-12">
        <h2 className="mb-6 text-lg font-bold sm:text-xl">よくある質問</h2>
        <div className="space-y-4">
          {(faqJsonLd.mainEntity as Array<{ "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }>).map((faq, i) => (
            <div key={i} className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">{faq.name}</h3>
              <p className="text-sm text-muted-foreground">{faq.acceptedAnswer.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
