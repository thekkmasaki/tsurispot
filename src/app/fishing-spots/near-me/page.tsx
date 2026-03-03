import type { Metadata } from "next";
import Link from "next/link";
import { Star, Car, MapPin, Fish, Anchor } from "lucide-react";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies, getCatchableNow } from "@/lib/data/fish";
import { REGION_GROUPS } from "@/lib/data/regions-group";
import { regionGroupOrder, getPrefecturesByRegionGroup } from "@/lib/data/prefectures";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { NearMeClient } from "./near-me-client";

/* ---------- スポット数を動的カウント ---------- */
const totalSpotCount = fishingSpots.length;
const totalSpotLabel = totalSpotCount >= 1000
  ? `${Math.floor(totalSpotCount / 100) * 100}`
  : String(totalSpotCount);

/* ---------- 地域別TOP5ランキング ---------- */
function getRegionTopSpots(regionPrefectures: string[], limit = 5) {
  return fishingSpots
    .filter((s) => regionPrefectures.includes(s.region.prefecture))
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

const regionRankings = REGION_GROUPS.map((rg) => ({
  ...rg,
  spots: getRegionTopSpots(rg.prefectures),
}));

/* ---------- 都道府県別スポット数 ---------- */
const prefSpotCounts = new Map<string, number>();
for (const s of fishingSpots) {
  const pref = s.region.prefecture;
  prefSpotCounts.set(pref, (prefSpotCounts.get(pref) || 0) + 1);
}

/* ---------- 釣り場タイプ別TOP3 ---------- */
type SpotTypeKey = "port" | "breakwater" | "beach" | "rocky" | "river";
const spotTypeInfo: {
  key: SpotTypeKey;
  label: string;
  description: string;
}[] = [
  {
    key: "breakwater",
    label: "堤防・漁港の釣り場",
    description:
      "堤防や漁港は足場がしっかりしており、初心者やファミリーに最もおすすめの釣り場タイプです。サビキ釣りでアジやサバ、ちょい投げでキスやカレイなど多彩な魚が狙えます。駐車場やトイレが整備されている場所も多く、気軽に釣りを始められます。夜釣りではアジングやメバリングも人気です。",
  },
  {
    key: "beach",
    label: "砂浜・サーフの釣り場",
    description:
      "砂浜（サーフ）は投げ釣りの代表的なフィールドです。キスやカレイ、ヒラメなどが主なターゲットで、広大なポイントを独り占めできるのも魅力のひとつ。ルアーフィッシングではヒラメやマゴチ、シーバスも狙えます。ウェーダーを履いて波打ち際に立つサーフフィッシングは近年人気が高まっています。",
  },
  {
    key: "rocky",
    label: "磯の釣り場",
    description:
      "磯釣りは上級者向けですが、大物との出会いが期待できるフィールドです。グレ（メジナ）やチヌ（クロダイ）のフカセ釣り、ヒラスズキやブリなどの青物をルアーで狙うロックショアゲームが人気。足場が不安定なため、スパイクシューズやライフジャケットなどの安全装備が必須です。",
  },
  {
    key: "river",
    label: "河川・湖の釣り場",
    description:
      "河川や湖は淡水釣りのフィールドで、バス釣り・渓流釣り・ヘラブナ釣りなど多様な釣りが楽しめます。上流域ではヤマメやイワナの渓流釣り、中下流域ではブラックバスやコイ釣りが人気です。遊漁券が必要な場合が多いので、事前に確認しましょう。自然に囲まれたロケーションも大きな魅力です。",
  },
];

function getSpotsByType(type: string, limit = 3) {
  // port と breakwater は堤防・漁港としてまとめる
  const types = type === "breakwater" ? ["port", "breakwater", "pier"] : [type];
  return fishingSpots
    .filter((s) => types.includes(s.spotType))
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

/* ---------- 今月釣れる魚 ---------- */
const currentMonth = new Date().getMonth() + 1; // 1-12
const catchableNowFish = getCatchableNow(currentMonth).slice(0, 8);

/* ---------- 月名 ---------- */
const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

/* ---------- Metadata ---------- */
export const metadata: Metadata = {
  title: `近くの釣り場を探す【2026年最新】全国${totalSpotLabel}箇所以上から検索`,
  description: `近くの釣り場を現在地GPS検索。全国${totalSpotLabel}箇所以上の釣りスポットから、あなたの近くにある堤防・漁港・磯・河川の釣り場が見つかります。地域別人気ランキング、初心者向け釣り場ガイドも掲載。`,
  keywords: [
    "近くの釣り場",
    "近く 釣り場所",
    "近く 釣り場",
    "釣り場 近く",
    "近くの釣りスポット",
    "釣り場 検索",
    "釣りスポット 現在地",
    "近くの釣り場 初心者",
    "釣り場 おすすめ",
  ],
  openGraph: {
    title: `近くの釣り場を探す【2026年最新】全国${totalSpotLabel}箇所以上から検索`,
    description: `近くの釣り場を現在地GPS検索。全国${totalSpotLabel}箇所以上の釣りスポットから最寄りの釣り場を距離順に表示。地域別人気ランキング・初心者ガイド付き。`,
    type: "website",
    url: "https://tsurispot.com/fishing-spots/near-me",
    siteName: "ツリスポ",
  },
  alternates: {
    canonical: "https://tsurispot.com/fishing-spots/near-me",
  },
};

/* ---------- JSON-LD ---------- */
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

const faqItems = [
  {
    question: "近くの釣り場はどうやって探せますか？",
    answer:
      "このページの「現在地から釣り場を探す」ボタンを押すと、ブラウザの位置情報機能を使って最寄りの釣り場を距離順に表示します。スマートフォンのGPSを利用するので、外出先でも簡単に近くの釣り場が見つかります。都道府県や地域から探すこともできます。",
  },
  {
    question: "位置情報を許可しなくても使えますか？",
    answer:
      "はい、位置情報を許可しない場合でも全国の人気釣りスポットを評価順に表示します。地域や釣り場のタイプで絞り込むこともできます。このページ下部の都道府県別リンク一覧からも探せます。",
  },
  {
    question: "近くの釣り場に行く前に確認すべきことは？",
    answer:
      "釣り禁止区域でないかの確認、駐車場やトイレの有無、天気予報と潮汐情報のチェックが大切です。各スポットの詳細ページで設備情報やアクセス方法を確認できます。初めての場所は明るい時間帯に訪れるのがおすすめです。",
  },
  {
    question: "釣り場の情報は最新ですか？",
    answer:
      "当サイトでは定期的に釣り場情報を更新しています。ただし、台風や工事などで一時的に立入禁止になる場合もあります。釣行前に最新の状況を現地の釣具店や自治体のウェブサイトで確認することをおすすめします。",
  },
  {
    question: "初心者でも行ける近くの釣り場を探すには？",
    answer:
      "位置情報で釣り場を検索した後、難易度が「初心者向け」と表示されているスポットを選びましょう。漁港や堤防タイプの釣り場は足場が安定しており、初心者やファミリーにおすすめです。設備（駐車場・トイレ）が整っている場所を選ぶとより快適です。",
  },
  {
    question: "車がなくても行ける釣り場はありますか？",
    answer:
      "電車やバスでアクセスできる釣り場も多数掲載しています。各スポットの詳細ページにアクセス情報が記載されているので、公共交通機関での行き方を確認できます。駅から徒歩圏内の堤防や漁港は、車がなくても気軽に釣りを楽しめます。",
  },
  {
    question: "無料で釣りができる場所はありますか？",
    answer:
      "堤防や漁港の多くは無料で釣りができます。ツリスポでは各スポットに「無料」マークを表示しているので、料金のかからない釣り場を簡単に見つけられます。ただし、管理釣り場や海釣り施設は入場料がかかる場合があります。",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: `近くの釣り場を探す - 全国${totalSpotLabel}箇所以上の釣りスポット検索`,
  description: `近くの釣り場を現在地GPS検索。全国${totalSpotLabel}箇所以上の釣りスポットから最寄りの釣り場を探せます。`,
  datePublished: "2025-06-01",
  dateModified: new Date().toISOString().split("T")[0],
  author: {
    "@type": "Person",
    name: "正木 家康",
    jobTitle: "編集長",
    url: "https://tsurispot.com/about",
  },
  publisher: {
    "@type": "Organization",
    name: "ツリスポ",
    url: "https://tsurispot.com",
    logo: {
      "@type": "ImageObject",
      url: "https://tsurispot.com/logo.svg",
    },
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://tsurispot.com/fishing-spots/near-me",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: `近くの釣り場を探す【2026年最新】全国${totalSpotLabel}箇所以上`,
  url: "https://tsurispot.com/fishing-spots/near-me",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", ".near-me-intro", ".region-ranking-section", ".catchable-now-section"],
  },
};

/* ---------- Component ---------- */
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

  const prefsByRegion = getPrefecturesByRegionGroup();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />

      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣りスポット", href: "/spots" },
          { label: "近くの釣り場" },
        ]}
      />

      {/* ===== 1. h1 + イントロ ===== */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          近くの釣り場・釣りスポットを探す
        </h1>
        <p className="near-me-intro mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          「近くに釣りができる場所はないかな？」そんなときは位置情報を使って最寄りの釣りスポットを探しましょう。
          ツリスポには全国<strong>{totalSpotCount.toLocaleString()}箇所以上</strong>の釣り場が登録されています。
          ボタンひとつであなたの現在地から近い順に釣り場が表示されるので、
          堤防・漁港・磯・砂浜・河川など様々なタイプの釣りスポットの中から、
          今すぐ行ける近くの釣り場が見つかります。
          各スポットの釣れる魚・設備情報・難易度・評価も一目でわかるので、初心者の方でも安心して釣り場選びができます。
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-blue-500" />
            全国{totalSpotCount.toLocaleString()}箇所以上
          </span>
          <span className="flex items-center gap-1">
            <Fish className="h-4 w-4 text-green-500" />
            {fishSpecies.length}魚種対応
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            評価・口コミ付き
          </span>
        </div>
      </div>

      {/* ===== 2. NearMeClient（位置情報ツール） ===== */}
      <NearMeClient spots={spotData} />

      {/* ===== 3. 地域別人気スポットランキング ===== */}
      <section className="region-ranking-section mt-12">
        <h2 className="mb-2 text-lg font-bold sm:text-xl md:text-2xl">
          地域別 人気釣り場ランキング
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          全国{totalSpotCount.toLocaleString()}箇所の釣りスポットを8地域に分けて、評価の高い人気釣り場をランキング形式でご紹介します。
          お住まいの地域や旅行先の近くにある釣り場探しにお役立てください。
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {regionRankings.map((region) => (
            <div key={region.slug} className="rounded-lg border bg-card p-4 sm:p-5">
              <h3 className="mb-3 text-base font-bold sm:text-lg">
                {region.name}の人気釣り場 TOP5
              </h3>
              {region.spots.length === 0 ? (
                <p className="text-sm text-muted-foreground">この地域のスポットは現在準備中です</p>
              ) : (
                <ol className="space-y-2">
                  {region.spots.map((spot, idx) => (
                    <li key={spot.id} className="flex items-start gap-2 text-sm">
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        idx === 0 ? "bg-yellow-500" : idx === 1 ? "bg-gray-400" : idx === 2 ? "bg-amber-700" : "bg-gray-300"
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/spots/${spot.slug}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {spot.name}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {spot.rating.toFixed(1)}
                          </span>
                          <span>{spot.region.prefecture}・{spot.region.areaName}</span>
                          <span className="truncate">
                            {spot.catchableFish.slice(0, 3).map((cf) => cf.fish.name).join("・")}
                          </span>
                        </div>
                        <div className="mt-0.5 flex gap-1">
                          {spot.hasParking && (
                            <Badge variant="outline" className="px-1 py-0 text-[10px]">P</Badge>
                          )}
                          {spot.hasToilet && (
                            <Badge variant="outline" className="px-1 py-0 text-[10px]">WC</Badge>
                          )}
                          {spot.isFree && (
                            <Badge variant="secondary" className="px-1 py-0 text-[10px]">無料</Badge>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===== 4. 今月釣れる魚 ===== */}
      <section className="catchable-now-section mt-12">
        <h2 className="mb-2 text-lg font-bold sm:text-xl md:text-2xl">
          {monthNames[currentMonth]}に釣れる魚
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          近くの釣り場に行くなら、今の時期に釣れる魚を知っておくと釣果アップにつながります。
          {monthNames[currentMonth]}にシーズンを迎える魚を紹介します。
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {catchableNowFish.map((fish) => (
            <Link
              key={fish.slug}
              href={`/fish/${fish.slug}`}
              className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
            >
              <Fish className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div className="min-w-0">
                <span className="font-medium">{fish.name}</span>
                {fish.peakMonths.includes(currentMonth) && (
                  <Badge variant="default" className="ml-1.5 px-1 py-0 text-[10px]">旬</Badge>
                )}
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {fish.description.slice(0, 60)}...
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-3 text-right">
          <Link href="/catchable-now" className="text-sm text-primary hover:underline">
            今釣れる魚をもっと見る →
          </Link>
        </div>
      </section>

      {/* ===== 5. 近くの釣り場の探し方ガイド ===== */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold sm:text-xl md:text-2xl">
          近くの釣り場を見つける方法
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          釣りに行きたいけれど、近くにどんな釣り場があるのかわからない。
          そんな方のために、自分にぴったりの釣り場の探し方を5つの方法別にご紹介します。
        </p>

        <div className="space-y-6">
          {/* 5-1 現在地から探す */}
          <div className="rounded-lg border bg-card p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
              <MapPin className="h-5 w-5 text-blue-500" />
              現在地から探す（GPS機能）
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              スマートフォンやパソコンの位置情報（GPS）機能を使えば、今いる場所から最も近い釣り場を瞬時に見つけられます。
              このページ上部の「現在地から探す」ボタンを押すだけで、近くの釣り場が距離順に一覧表示されます。
              外出先で急に釣りがしたくなったときや、旅行先で近くの釣りスポットを探したいときに便利です。
              位置情報はお使いの端末のブラウザ機能を利用しており、ツリスポがお客様の位置データを保存することはありません。
            </p>
          </div>

          {/* 5-2 都道府県から探す */}
          <div className="rounded-lg border bg-card p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
              <MapPin className="h-5 w-5 text-green-500" />
              都道府県から探す
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              お住まいの都道府県や、釣行を予定しているエリアから釣り場を探す方法です。
              ツリスポでは47都道府県すべての釣り場情報を掲載しています。
              各都道府県のページでは、その地域にある釣り場をエリア別・タイプ別に一覧で確認できます。
              このページ下部にある「都道府県別リンク一覧」から、目的の県の釣り場を直接探せます。
              地元の穴場スポットから有名釣り場まで、地域に密着した情報が見つかります。
            </p>
          </div>

          {/* 5-3 釣り方から探す */}
          <div className="rounded-lg border bg-card p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
              <Anchor className="h-5 w-5 text-orange-500" />
              釣り方から探す（サビキ・ルアー等）
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              やりたい釣り方が決まっている場合は、釣り方から近くの釣り場を絞り込むのが効率的です。
              サビキ釣りなら堤防や漁港、投げ釣りなら砂浜、ルアーフィッシングなら磯や河口部など、
              釣り方によって適した釣り場のタイプが異なります。
              ツリスポでは各スポットで実践できる釣り方や狙える魚種を詳しく掲載しているので、
              自分のスタイルに合った近くの釣り場がすぐに見つかります。
            </p>
          </div>

          {/* 5-4 初心者向けポイント */}
          <div className="rounded-lg border bg-card p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
              <Star className="h-5 w-5 text-yellow-500" />
              初心者が近くの釣り場を選ぶポイント
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              釣り初心者が近くの釣り場を選ぶとき、最も大切なのは「安全で快適な場所」を選ぶことです。
              具体的には以下の3点を重視しましょう。
              まず<strong>足場の安定性</strong>。堤防や漁港、海釣り施設は足場が平らで安全です。
              次に<strong>設備の充実度</strong>。駐車場・トイレ・近くにコンビニや釣具店があると快適です。
              最後に<strong>料金</strong>。漁港の堤防や公園隣接の釣り場は無料のところが多く、費用を抑えて釣りを始められます。
              ツリスポの各スポットページでは難易度・設備・料金を明記しているので、初心者向けの釣り場を簡単に判別できます。
            </p>
          </div>

          {/* 5-5 車がない場合 */}
          <div className="rounded-lg border bg-card p-4 sm:p-5">
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold">
              <Car className="h-5 w-5 text-purple-500" />
              車がない場合の釣り場の探し方
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              車がなくても釣りは十分に楽しめます。電車やバスでアクセスできる釣り場は全国に数多くあります。
              東京湾の若洲海浜公園（りんかい線）、大阪南港の魚つり園（ニュートラム）、
              横浜の本牧海づり施設（バス利用）など、公共交通機関で行ける好ポイントは意外と多いものです。
              ツリスポの各スポットページにはアクセス情報が詳しく記載されているので、
              最寄り駅からの所要時間やバスの路線を事前に確認できます。
              レンタルロッドがある施設なら、手ぶらで電車釣行もできるので気軽です。
            </p>
          </div>
        </div>
      </section>

      {/* ===== 6. 釣り場タイプ別解説 ===== */}
      <section className="mt-12">
        <h2 className="mb-2 text-lg font-bold sm:text-xl md:text-2xl">
          釣り場タイプ別ガイド
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          近くの釣り場を探すとき、釣り場のタイプを知っておくと自分に合ったスポットを選びやすくなります。
          各タイプの特徴と人気スポットを紹介します。
        </p>

        <div className="space-y-6">
          {spotTypeInfo.map((typeInfo) => {
            const topSpots = getSpotsByType(typeInfo.key);
            return (
              <div key={typeInfo.key} className="rounded-lg border bg-card p-4 sm:p-5">
                <h3 className="mb-2 text-base font-bold sm:text-lg">{typeInfo.label}</h3>
                <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                  {typeInfo.description}
                </p>
                {topSpots.length > 0 && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                      人気スポット TOP3
                    </h4>
                    <ul className="space-y-1.5">
                      {topSpots.map((spot, idx) => (
                        <li key={spot.id} className="flex items-center gap-2 text-sm">
                          <span className="font-bold text-muted-foreground">{idx + 1}.</span>
                          <Link
                            href={`/spots/${spot.slug}`}
                            className="text-primary hover:underline"
                          >
                            {spot.name}
                          </Link>
                          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {spot.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {spot.region.prefecture}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 7. 都道府県別リンク一覧 ===== */}
      <section className="mt-12">
        <h2 className="mb-2 text-lg font-bold sm:text-xl md:text-2xl">
          都道府県別 釣り場一覧
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          47都道府県すべての釣り場を掲載中。お住まいの地域や旅行先の釣り場を探してみてください。
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {regionGroupOrder.map((groupName) => {
            const prefs = prefsByRegion.get(groupName) || [];
            return (
              <div key={groupName} className="rounded-lg border bg-card p-3 sm:p-4">
                <h3 className="mb-2 text-sm font-bold sm:text-base">{groupName}</h3>
                <ul className="space-y-1">
                  {prefs.map((pref) => {
                    const count = prefSpotCounts.get(pref.name) || 0;
                    return (
                      <li key={pref.slug} className="text-sm">
                        <Link
                          href={`/prefecture/${pref.slug}`}
                          className="text-primary hover:underline"
                        >
                          {pref.name}
                        </Link>
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({count})
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== 8. FAQ ===== */}
      <section className="mt-12">
        <h2 className="mb-6 text-lg font-bold sm:text-xl md:text-2xl">
          近くの釣り場に関するよくある質問
        </h2>
        <div className="space-y-4">
          {faqItems.map((faq, i) => (
            <div key={i} className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 9. 関連ページリンク ===== */}
      <section className="mt-12">
        <h2 className="mb-4 text-lg font-bold sm:text-xl md:text-2xl">
          関連ページ
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              href: "/for-beginners",
              title: "釣り初心者ガイド",
              desc: "道具の選び方から釣り方の基本まで、初心者向けの総合ガイド",
            },
            {
              href: "/fishing-calendar",
              title: "釣りカレンダー",
              desc: "月別・季節別に釣れる魚と最適な釣り方がわかる年間カレンダー",
            },
            {
              href: "/catchable-now",
              title: "今釣れる魚",
              desc: "今月の旬の魚と、おすすめの釣り方・釣り場情報",
            },
            {
              href: "/ranking",
              title: "釣り場ランキング",
              desc: "全国の釣りスポットを評価順にランキング。地域別TOP10も掲載",
            },
            {
              href: "/map",
              title: "地図で釣り場を探す",
              desc: "地図上で全国の釣りスポットを視覚的に探せるマップ検索",
            },
            {
              href: "/gear",
              title: "おすすめ釣り道具",
              desc: "編集長が厳選した、初心者から上級者まで使える釣り道具紹介",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
            >
              <span className="font-medium text-primary">{link.title}</span>
              <span className="mt-1 text-xs text-muted-foreground">{link.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
