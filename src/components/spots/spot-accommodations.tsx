import Link from "next/link";
import { MapPin, BedDouble, Fish, Anchor } from "lucide-react";
import {
  Accommodation,
  ACCOMMODATION_FEATURE_LABELS,
  getNearbyAccommodations,
} from "@/lib/data/accommodations";

/**
 * spot 詳細ページに差し込む「近くの釣り宿」セクション。
 * spot の prefecture + 緯度経度から近い宿を 3 件まで表示。
 * affiliate link 未設定 (rakutenUrl も jalanUrl も "#") の宿は除外。
 */
export function SpotAccommodations({
  spotPrefecture,
  spotLat,
  spotLng,
}: {
  spotPrefecture: string;
  spotLat: number;
  spotLng: number;
}) {
  const nearby = getNearbyAccommodations(spotLat, spotLng, spotPrefecture, 3).filter(
    (a) => (a.rakutenUrl && a.rakutenUrl !== "#") || (a.jalanUrl && a.jalanUrl !== "#")
  );

  if (nearby.length === 0) return null;

  return (
    <section className="my-8 rounded-2xl border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <BedDouble className="size-5 text-primary" />
        <h2 className="text-lg font-bold sm:text-xl">この釣り場の近くの釣り宿</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        早朝出船・釣果料理対応など、 釣り客向けの宿を {spotPrefecture} から厳選しました。
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {nearby.map((a) => (
          <AccommodationCard key={a.id} accommodation={a} />
        ))}
      </div>
      <div className="mt-4 text-right text-sm">
        <Link
          href={`/accommodations/${spotPrefectureToSlug(spotPrefecture)}`}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          {spotPrefecture}の釣り宿をもっと見る →
        </Link>
      </div>
    </section>
  );
}

function AccommodationCard({ accommodation }: { accommodation: Accommodation }) {
  const primaryUrl =
    accommodation.rakutenUrl && accommodation.rakutenUrl !== "#"
      ? accommodation.rakutenUrl
      : accommodation.jalanUrl;
  return (
    <Link
      href={`/accommodations/${spotPrefectureToSlug(accommodation.prefecture)}/${accommodation.slug}`}
      className="group rounded-xl border bg-background p-4 transition-shadow hover:shadow-md"
    >
      <h3 className="text-sm font-semibold leading-snug group-hover:text-primary">
        {accommodation.name}
      </h3>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3" />
        {accommodation.areaName}
      </div>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
        {accommodation.description}
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        {accommodation.features.slice(0, 3).map((f) => (
          <span
            key={f}
            className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {ACCOMMODATION_FEATURE_LABELS[f]}
          </span>
        ))}
      </div>
      {accommodation.targetFish && accommodation.targetFish.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Fish className="size-3" />
          {accommodation.targetFish.slice(0, 3).join("・")}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <span className="font-medium text-primary">{accommodation.priceRange}/泊</span>
        <Anchor className="size-3 text-muted-foreground" />
      </div>
      {/* primaryUrl は accommodation 詳細 page で実 affiliate link に再リンクされる */}
      <span className="sr-only">{primaryUrl}</span>
    </Link>
  );
}

/**
 * 都道府県名 → slug (URL 用)。 prefecture.ts と一致させる前提だが、
 * 簡易マッピングで component 独立性を保つ。
 */
function spotPrefectureToSlug(prefName: string): string {
  const map: Record<string, string> = {
    北海道: "hokkaido",
    青森県: "aomori",
    岩手県: "iwate",
    宮城県: "miyagi",
    秋田県: "akita",
    山形県: "yamagata",
    福島県: "fukushima",
    茨城県: "ibaraki",
    栃木県: "tochigi",
    群馬県: "gunma",
    埼玉県: "saitama",
    千葉県: "chiba",
    東京都: "tokyo",
    神奈川県: "kanagawa",
    新潟県: "niigata",
    富山県: "toyama",
    石川県: "ishikawa",
    福井県: "fukui",
    山梨県: "yamanashi",
    長野県: "nagano",
    岐阜県: "gifu",
    静岡県: "shizuoka",
    愛知県: "aichi",
    三重県: "mie",
    滋賀県: "shiga",
    京都府: "kyoto",
    大阪府: "osaka",
    兵庫県: "hyogo",
    奈良県: "nara",
    和歌山県: "wakayama",
    鳥取県: "tottori",
    島根県: "shimane",
    岡山県: "okayama",
    広島県: "hiroshima",
    山口県: "yamaguchi",
    徳島県: "tokushima",
    香川県: "kagawa",
    愛媛県: "ehime",
    高知県: "kochi",
    福岡県: "fukuoka",
    佐賀県: "saga",
    長崎県: "nagasaki",
    熊本県: "kumamoto",
    大分県: "oita",
    宮崎県: "miyazaki",
    鹿児島県: "kagoshima",
    沖縄県: "okinawa",
  };
  return map[prefName] ?? "";
}
