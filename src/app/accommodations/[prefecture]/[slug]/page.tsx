import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, BedDouble, MapPin, Fish, Anchor, Star } from "lucide-react";
import {
  Accommodation,
  ACCOMMODATION_FEATURE_LABELS,
  getAccommodationBySlug,
  getPublishableAccommodations,
} from "@/lib/data/accommodations";
import { getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { HeaderBannerAd, InArticleAd, NativeAdBreak } from "@/components/ads/ad-unit";

// ISR: 6 時間ごとに再検証 (affiliate link 状態が変わる可能性)
export const revalidate = 21600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // affiliate link 設定済みのみ pre-render (placeholder は除外)
  return getPublishableAccommodations().map((a) => ({
    prefecture: prefectureNameToSlug(a.prefecture),
    slug: a.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ prefecture: string; slug: string }>;
}): Promise<Metadata> {
  const { prefecture, slug } = await params;
  const acc = getAccommodationBySlug(slug);
  if (!acc) return { title: "Not Found" };
  const pref = getPrefectureBySlug(prefecture);
  const prefLabel = pref?.name ?? acc.prefecture;
  const title = `${acc.name}｜${prefLabel}${acc.areaName}の釣り宿`;
  const description = `${acc.name} は ${prefLabel}${acc.areaName}の釣り客向け宿泊施設。 ${acc.description.slice(0, 80)} 1泊 ${acc.priceRange}。`;
  return {
    title,
    description,
    alternates: {
      canonical: `https://tsurispot.com/accommodations/${prefecture}/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://tsurispot.com/accommodations/${prefecture}/${slug}`,
      siteName: "ツリスポ",
    },
  };
}

export default async function AccommodationDetailPage({
  params,
}: {
  params: Promise<{ prefecture: string; slug: string }>;
}) {
  const { prefecture, slug } = await params;
  const acc = getAccommodationBySlug(slug);
  if (!acc) notFound();
  if (prefectureNameToSlug(acc.prefecture) !== prefecture) notFound();

  const pref = getPrefectureBySlug(prefecture);
  const prefLabel = pref?.name ?? acc.prefecture;

  // この宿に紐づく近くの釣りスポット (slug 指定があればそれを優先)
  const linkedSpots = (acc.nearbySpotSlugs ?? [])
    .map((s) => fishingSpots.find((sp) => sp.slug === s))
    .filter(Boolean) as typeof fishingSpots;

  // affiliate link が未設定なら publish しない (UX 劣化防止)
  const hasRakuten = acc.rakutenUrl && acc.rakutenUrl !== "#";
  const hasJalan = acc.jalanUrl && acc.jalanUrl !== "#";

  const lodgingJsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: acc.name,
    description: acc.description,
    geo: {
      "@type": "GeoCoordinates",
      latitude: acc.lat,
      longitude: acc.lng,
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: acc.prefecture,
      addressLocality: acc.areaName,
      addressCountry: "JP",
    },
    priceRange: acc.priceRange,
    amenityFeature: acc.features.map((f) => ({
      "@type": "LocationFeatureSpecification",
      name: ACCOMMODATION_FEATURE_LABELS[f],
      value: true,
    })),
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingJsonLd) }}
      />
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "釣り宿", href: "/accommodations" },
          { label: prefLabel, href: `/accommodations/${prefecture}` },
          { label: acc.name },
        ]}
      />

      <HeaderBannerAd />

      <Link
        href={`/accommodations/${prefecture}`}
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {prefLabel}の釣り宿一覧に戻る
      </Link>

      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <BedDouble className="size-4" />
          {accommodationTypeLabel(acc.type)}
        </div>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">{acc.name}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-4" />
            {prefLabel} {acc.areaName}
          </span>
          <span className="inline-flex items-center gap-1">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            {acc.priceRange}/泊
          </span>
        </div>
      </header>

      <section className="mb-8 rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-bold">宿の特徴</h2>
        <p className="leading-relaxed text-sm sm:text-base">{acc.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {acc.features.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {ACCOMMODATION_FEATURE_LABELS[f]}
            </span>
          ))}
        </div>
      </section>

      <InArticleAd />

      {acc.targetFish && acc.targetFish.length > 0 && (
        <section className="mb-8 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Fish className="size-5 text-primary" />
            <h2 className="text-lg font-bold">主に狙える魚</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {acc.targetFish.map((fish) => (
              <span key={fish} className="rounded-full bg-muted px-3 py-1 text-sm">
                {fish}
              </span>
            ))}
          </div>
        </section>
      )}

      {linkedSpots.length > 0 && (
        <section className="mb-8 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="mb-3 flex items-center gap-2">
            <Anchor className="size-5 text-primary" />
            <h2 className="text-lg font-bold">この宿の近くの釣りスポット</h2>
          </div>
          <ul className="space-y-2">
            {linkedSpots.map((s) => (
              <li key={s.slug}>
                <Link href={`/spots/${s.slug}`} className="text-sm text-primary hover:underline">
                  {s.name} ({s.region.areaName})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <NativeAdBreak />

      <section className="mb-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 p-5 sm:p-6">
        <h2 className="mb-3 text-lg font-bold">予約・空き状況の確認</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          下記の予約サイトから空き状況・料金プランを確認できます。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {hasRakuten && (
            <a
              href={acc.rakutenUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 min-h-[44px]"
            >
              楽天トラベルで予約
            </a>
          )}
          {hasJalan && (
            <a
              href={acc.jalanUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 min-h-[44px]"
            >
              じゃらんで予約
            </a>
          )}
          {!hasRakuten && !hasJalan && (
            <p className="rounded-lg border border-dashed border-muted p-3 text-sm text-muted-foreground">
              予約リンクは準備中です。 直接お問い合わせください。
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function accommodationTypeLabel(type: Accommodation["type"]): string {
  return {
    fishing_inn: "釣り宿",
    fishing_friendly_ryokan: "釣り客歓迎の旅館",
    fishing_friendly_hotel: "釣り客歓迎のホテル",
    guest_house: "ゲストハウス",
  }[type];
}

const PREFECTURE_NAME_TO_SLUG: Record<string, string> = {
  北海道: "hokkaido", 青森県: "aomori", 岩手県: "iwate", 宮城県: "miyagi", 秋田県: "akita",
  山形県: "yamagata", 福島県: "fukushima", 茨城県: "ibaraki", 栃木県: "tochigi", 群馬県: "gunma",
  埼玉県: "saitama", 千葉県: "chiba", 東京都: "tokyo", 神奈川県: "kanagawa", 新潟県: "niigata",
  富山県: "toyama", 石川県: "ishikawa", 福井県: "fukui", 山梨県: "yamanashi", 長野県: "nagano",
  岐阜県: "gifu", 静岡県: "shizuoka", 愛知県: "aichi", 三重県: "mie", 滋賀県: "shiga",
  京都府: "kyoto", 大阪府: "osaka", 兵庫県: "hyogo", 奈良県: "nara", 和歌山県: "wakayama",
  鳥取県: "tottori", 島根県: "shimane", 岡山県: "okayama", 広島県: "hiroshima", 山口県: "yamaguchi",
  徳島県: "tokushima", 香川県: "kagawa", 愛媛県: "ehime", 高知県: "kochi", 福岡県: "fukuoka",
  佐賀県: "saga", 長崎県: "nagasaki", 熊本県: "kumamoto", 大分県: "oita", 宮崎県: "miyazaki",
  鹿児島県: "kagoshima", 沖縄県: "okinawa",
};

function prefectureNameToSlug(name: string): string {
  return PREFECTURE_NAME_TO_SLUG[name] ?? "";
}
