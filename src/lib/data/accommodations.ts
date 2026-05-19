/**
 * 釣り宿・宿泊施設データ (Phase 2 scaffold)
 *
 * 楽天トラベル / じゃらん の affiliate link は user が手動で実 URL に置換すること。
 * affiliate-products.ts のルール「勝手にリンクを生成しないこと」を尊重し、
 * 各 accommodation の externalUrls は最初 placeholder (#) で出力する。
 *
 * publish 前に少なくとも各レコードで rakutenUrl か jalanUrl のどちらかに
 * 実 affiliate URL を埋めること。 placeholder のままだと UX 劣化のため
 * 該当 accommodation は render 時に skip される。
 */

export interface Accommodation {
  id: string;
  name: string;
  /** URL slug */
  slug: string;
  /** 都道府県名（FishingSpot.region.prefecture と一致させる） */
  prefecture: string;
  /** 県内のエリア (例: 「南房総」「淡路島」「能登半島」) */
  areaName: string;
  /** 緯度経度 (近隣 spot 計算用) */
  lat: number;
  lng: number;
  /** 釣り場特化の宿か、 釣り客歓迎の旅館か等 */
  type: "fishing_inn" | "fishing_friendly_ryokan" | "fishing_friendly_hotel" | "guest_house";
  /** 紹介文 (200-400 字) */
  description: string;
  /** 価格帯目安 (1泊 1人) */
  priceRange: string;
  /** 提供サービス */
  features: AccommodationFeature[];
  /** 楽天トラベル URL (affiliate 含む)、 未設定なら "#" */
  rakutenUrl: string;
  /** じゃらん URL (affiliate 含む)、 未設定なら "#" */
  jalanUrl: string;
  /** 近くの釣り場 slug (FishingSpot.slug に一致) */
  nearbySpotSlugs?: string[];
  /** 主に狙える魚 */
  targetFish?: string[];
}

export type AccommodationFeature =
  | "boat_charter"
  | "tackle_rental"
  | "early_checkin"
  | "fish_cooking"
  | "ice_storage"
  | "near_port"
  | "guide_service"
  | "free_parking"
  | "pet_friendly";

export const ACCOMMODATION_FEATURE_LABELS: Record<AccommodationFeature, string> = {
  boat_charter: "船チャーター可",
  tackle_rental: "タックルレンタル",
  early_checkin: "早朝チェックイン",
  fish_cooking: "釣果料理対応",
  ice_storage: "氷・保管庫あり",
  near_port: "漁港至近",
  guide_service: "ガイドサービス",
  free_parking: "無料駐車場",
  pet_friendly: "ペット同伴可",
};

/**
 * 釣り宿データ scaffold。
 * 段階的に拡張する。 affiliate link は user が実 URL に置換すること。
 *
 * 現状: 釣り客の多い 10 都道府県の代表的なエリアに 1-2 件ずつ scaffold。
 * 6ヶ月計画で各県 3-5 件、 合計 80-150 件に拡張予定。
 */
export const accommodations: Accommodation[] = [
  // 北海道 (積丹半島・小樽周辺は釣り宿激戦区)
  {
    id: "acc-shakotan-fishinginn",
    name: "積丹半島 釣り宿スカイポート",
    slug: "shakotan-fishinginn",
    prefecture: "北海道",
    areaName: "積丹半島",
    lat: 43.3,
    lng: 140.5,
    type: "fishing_inn",
    description: "ヒラメ・ホッケ・ソイ狙いの船チャーターと、 釣果をその場で料理してくれる釣り宿。 港から 5 分の立地で早朝出船にも対応。 タックルレンタルあり、 釣り初心者も歓迎。",
    priceRange: "¥10,000-15,000",
    features: ["boat_charter", "tackle_rental", "early_checkin", "fish_cooking", "near_port"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["ヒラメ", "ホッケ", "ソイ", "アブラコ"],
  },
  // 千葉県 (南房総は釣り客で年中賑わう)
  {
    id: "acc-minamiboso-tatsumi",
    name: "南房総 たつみ旅館",
    slug: "minamiboso-tatsumi",
    prefecture: "千葉県",
    areaName: "南房総",
    lat: 35.0,
    lng: 139.85,
    type: "fishing_friendly_ryokan",
    description: "アジ・タイ・ヒラメの船釣りと磯釣り両対応の老舗旅館。 釣果料理プランあり、 港まで車で 5 分。 早朝チェックアウトに対応、 大型クーラーボックス保管庫完備。",
    priceRange: "¥12,000-18,000",
    features: ["boat_charter", "fish_cooking", "early_checkin", "ice_storage", "free_parking"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["マダイ", "ヒラメ", "アジ", "メジナ"],
  },
  // 神奈川県 (三浦半島)
  {
    id: "acc-miura-fishhouse",
    name: "三浦半島 フィッシュハウス三崎",
    slug: "miura-fishhouse",
    prefecture: "神奈川県",
    areaName: "三浦半島",
    lat: 35.15,
    lng: 139.6,
    type: "guest_house",
    description: "三崎港まで徒歩 3 分のゲストハウス。 マグロ・カツオの大型船と堤防釣りの両拠点。 タックルレンタルあり、 ライダー・釣り人向けの相部屋プランが ¥5,000 から。",
    priceRange: "¥5,000-9,000",
    features: ["tackle_rental", "near_port", "early_checkin", "free_parking"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["カツオ", "マグロ", "アジ", "サバ"],
  },
  // 静岡県 (伊豆半島)
  {
    id: "acc-izu-shimoda",
    name: "伊豆下田 磯釣り民宿あおぞら",
    slug: "izu-shimoda",
    prefecture: "静岡県",
    areaName: "伊豆下田",
    lat: 34.68,
    lng: 138.95,
    type: "fishing_inn",
    description: "下田の磯釣りと船釣り両対応の民宿。 メジナ・イシダイの磯釣りシーズン (10-3 月) は予約必須。 釣果料理対応、 ガイド付き磯場案内あり。",
    priceRange: "¥9,000-14,000",
    features: ["guide_service", "boat_charter", "fish_cooking", "early_checkin"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["メジナ", "イシダイ", "クロダイ", "イサキ"],
  },
  // 三重県 (志摩半島)
  {
    id: "acc-shima-fishinginn",
    name: "志摩半島 はま茶屋",
    slug: "shima-fishinginn",
    prefecture: "三重県",
    areaName: "志摩半島",
    lat: 34.3,
    lng: 136.85,
    type: "fishing_friendly_ryokan",
    description: "的矢湾の真鯛・カワハギ船と、 大王崎の地磯案内が人気の旅館。 伊勢海老料理と釣果調理のセットプランあり、 ファミリー対応の家族風呂完備。",
    priceRange: "¥11,000-16,000",
    features: ["boat_charter", "guide_service", "fish_cooking", "free_parking", "pet_friendly"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["マダイ", "カワハギ", "イシダイ", "アオリイカ"],
  },
  // 和歌山県 (南紀・串本)
  {
    id: "acc-nanki-kushimoto",
    name: "南紀串本 磯宿しおさい",
    slug: "nanki-kushimoto",
    prefecture: "和歌山県",
    areaName: "南紀・串本",
    lat: 33.48,
    lng: 135.78,
    type: "fishing_inn",
    description: "本州最南端・串本の磯釣りメッカに立地。 グレ・イシダイ・尾長メジナの磯場渡しを宿が手配。 早朝弁当と釣果料理対応、 タックル乾燥室完備。",
    priceRange: "¥10,000-15,000",
    features: ["guide_service", "early_checkin", "fish_cooking", "ice_storage"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["メジナ", "イシダイ", "クロダイ", "ヒラスズキ"],
  },
  // 兵庫県 (淡路島)
  {
    id: "acc-awaji-fishingvilla",
    name: "淡路島 フィッシングヴィラ",
    slug: "awaji-fishingvilla",
    prefecture: "兵庫県",
    areaName: "淡路島",
    lat: 34.45,
    lng: 134.85,
    type: "fishing_friendly_hotel",
    description: "明石海峡・鳴門海峡を望むホテル。 タイラバ・ジギングのチャーター船提携あり、 釣り具レンタル種類豊富。 大浴場と海鮮ビュッフェが好評。",
    priceRange: "¥13,000-20,000",
    features: ["boat_charter", "tackle_rental", "fish_cooking", "free_parking"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["マダイ", "メバル", "タチウオ", "アオリイカ"],
  },
  // 高知県 (足摺岬・室戸岬)
  {
    id: "acc-ashizuri-misaki",
    name: "足摺岬 磯民宿はえなわ",
    slug: "ashizuri-misaki",
    prefecture: "高知県",
    areaName: "足摺岬",
    lat: 32.72,
    lng: 133.02,
    type: "fishing_inn",
    description: "足摺岬の地磯と沖磯渡しに対応する釣り宿。 グレ・ヒラスズキ・尾長メジナの大物狙いに最適。 渡船代込みパック有、 釣果はその日のうちに刺身で提供。",
    priceRange: "¥9,500-14,000",
    features: ["guide_service", "boat_charter", "fish_cooking", "early_checkin"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["メジナ", "ヒラスズキ", "イシガキダイ", "尾長メジナ"],
  },
  // 長崎県 (五島列島・平戸)
  {
    id: "acc-goto-fishinginn",
    name: "五島列島 釣宿せとうち",
    slug: "goto-fishinginn",
    prefecture: "長崎県",
    areaName: "五島列島",
    lat: 32.69,
    lng: 128.84,
    type: "fishing_inn",
    description: "五島の沖磯渡しと、 ヒラマサ・カンパチのキャスティング船を兼業する宿。 ジギング大物狙いの遠征基地として人気、 大型クーラー保管室完備。",
    priceRange: "¥12,000-18,000",
    features: ["boat_charter", "guide_service", "ice_storage", "fish_cooking"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["ヒラマサ", "カンパチ", "メジナ", "イシダイ"],
  },
  // 沖縄県 (本島南部)
  {
    id: "acc-okinawa-fishinglodge",
    name: "沖縄南部 フィッシングロッジ",
    slug: "okinawa-fishinglodge",
    prefecture: "沖縄県",
    areaName: "本島南部",
    lat: 26.1,
    lng: 127.7,
    type: "guest_house",
    description: "沖縄南部のリーフ釣り・GT ジギング・タマン釣りの拠点。 タックルレンタル・ガイド込みプラン有、 釣果料理のオプション可。 連泊割引あり。",
    priceRange: "¥7,000-12,000",
    features: ["tackle_rental", "guide_service", "boat_charter", "fish_cooking"],
    rakutenUrl: "#",
    jalanUrl: "#",
    targetFish: ["ロウニンアジ", "タマン", "ガーラ", "ミーバイ"],
  },
];

export function getAccommodationsByPrefecture(prefecture: string): Accommodation[] {
  return accommodations.filter((a) => a.prefecture === prefecture);
}

export function getAccommodationBySlug(slug: string): Accommodation | undefined {
  return accommodations.find((a) => a.slug === slug);
}

/**
 * affiliate link (rakutenUrl or jalanUrl) が実 URL になっている accommodation のみ返す。
 * placeholder "#" のままのレコードは UX 劣化のため除外する。
 */
export function getPublishableAccommodations(): Accommodation[] {
  return accommodations.filter(
    (a) => (a.rakutenUrl && a.rakutenUrl !== "#") || (a.jalanUrl && a.jalanUrl !== "#")
  );
}

/**
 * spot に近い accommodation を距離で sort して返す。
 * spot.region.prefecture と一致する宿を優先、 次に緯度経度で半径計算。
 */
export function getNearbyAccommodations(
  spotLat: number,
  spotLng: number,
  spotPrefecture: string,
  limit = 3
): Accommodation[] {
  const sameRegion = accommodations.filter((a) => a.prefecture === spotPrefecture);
  const sorted = sameRegion
    .map((a) => ({
      accommodation: a,
      distanceKm: haversineKm(spotLat, spotLng, a.lat, a.lng),
    }))
    .sort((x, y) => x.distanceKm - y.distanceKm);
  return sorted.slice(0, limit).map((s) => s.accommodation);
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
