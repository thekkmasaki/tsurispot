/**
 * 「〇〇から近い釣り場」ページ（/fishing-spots/near/[city]）の起点都市と、距離計算のヘルパ。
 *
 * - 起点は各都市の代表駅（座標は駅の位置。距離は直線距離で、道のりや所要時間ではない）
 * - 都市は「政令指定都市20＋東京＋需要が見込める県庁所在地など」の30都市。
 *   全市区町村に作ると、近い都市同士で顔ぶれがほぼ同じ薄いページが大量にできる（過去の
 *   「クロール済み未登録」増加の教訓）ので、増やすときは次の2条件をテストで守る:
 *     1. 直線 NEAR_RADIUS_WIDE_KM 以内に掲載品質のスポットが MIN_SPOTS_FOR_CITY 件以上ある
 *     2. どの2都市も、近い順上位 OVERLAP_TOP_N 件の重なり（Jaccard）が MAX_OVERLAP 未満
 * - 掲載品質（isSitemapEligible）を満たし、釣り禁止（fishingBan）が無いスポットだけを並べる
 */
import type { FishingSpot } from "@/types";
import { fishingSpots } from "./spots";
import { haversineKm } from "@/lib/geo/distance";
import { isSitemapEligible } from "@/lib/seo-quality";

export interface CityOrigin {
  slug: string;
  /** 「東京」「横浜」— タイトルは「{name}から近い釣り場」 */
  name: string;
  /** 起点にした駅（本文で「東京駅から直線◯km」と書く） */
  originLabel: string;
  prefecture: string;
  lat: number;
  lng: number;
}

export const CITY_ORIGINS: CityOrigin[] = [
  { slug: "sapporo", name: "札幌", originLabel: "札幌駅", prefecture: "北海道", lat: 43.0687, lng: 141.3508 },
  { slug: "hakodate", name: "函館", originLabel: "函館駅", prefecture: "北海道", lat: 41.7737, lng: 140.7264 },
  { slug: "sendai", name: "仙台", originLabel: "仙台駅", prefecture: "宮城県", lat: 38.2601, lng: 140.8822 },
  { slug: "utsunomiya", name: "宇都宮", originLabel: "宇都宮駅", prefecture: "栃木県", lat: 36.5594, lng: 139.8985 },
  { slug: "saitama", name: "さいたま", originLabel: "大宮駅", prefecture: "埼玉県", lat: 35.9064, lng: 139.6239 },
  { slug: "chiba", name: "千葉", originLabel: "千葉駅", prefecture: "千葉県", lat: 35.6131, lng: 140.1134 },
  { slug: "tokyo", name: "東京", originLabel: "東京駅", prefecture: "東京都", lat: 35.6812, lng: 139.7671 },
  { slug: "kawasaki", name: "川崎", originLabel: "川崎駅", prefecture: "神奈川県", lat: 35.5313, lng: 139.697 },
  { slug: "yokohama", name: "横浜", originLabel: "横浜駅", prefecture: "神奈川県", lat: 35.4658, lng: 139.6223 },
  { slug: "sagamihara", name: "相模原", originLabel: "相模大野駅", prefecture: "神奈川県", lat: 35.5321, lng: 139.4378 },
  { slug: "niigata", name: "新潟", originLabel: "新潟駅", prefecture: "新潟県", lat: 37.9122, lng: 139.0611 },
  { slug: "kanazawa", name: "金沢", originLabel: "金沢駅", prefecture: "石川県", lat: 36.5781, lng: 136.6478 },
  { slug: "shizuoka", name: "静岡", originLabel: "静岡駅", prefecture: "静岡県", lat: 34.9719, lng: 138.3891 },
  { slug: "hamamatsu", name: "浜松", originLabel: "浜松駅", prefecture: "静岡県", lat: 34.7037, lng: 137.7351 },
  { slug: "nagoya", name: "名古屋", originLabel: "名古屋駅", prefecture: "愛知県", lat: 35.1709, lng: 136.8815 },
  { slug: "kyoto", name: "京都", originLabel: "京都駅", prefecture: "京都府", lat: 34.9858, lng: 135.7588 },
  { slug: "osaka", name: "大阪", originLabel: "大阪駅", prefecture: "大阪府", lat: 34.7025, lng: 135.4959 },
  { slug: "sakai", name: "堺", originLabel: "堺東駅", prefecture: "大阪府", lat: 34.5733, lng: 135.483 },
  { slug: "kobe", name: "神戸", originLabel: "三ノ宮駅", prefecture: "兵庫県", lat: 34.6946, lng: 135.1955 },
  { slug: "wakayama", name: "和歌山", originLabel: "和歌山駅", prefecture: "和歌山県", lat: 34.2321, lng: 135.1916 },
  { slug: "okayama", name: "岡山", originLabel: "岡山駅", prefecture: "岡山県", lat: 34.6664, lng: 133.918 },
  { slug: "hiroshima", name: "広島", originLabel: "広島駅", prefecture: "広島県", lat: 34.3976, lng: 132.4754 },
  { slug: "takamatsu", name: "高松", originLabel: "高松駅", prefecture: "香川県", lat: 34.3507, lng: 134.0469 },
  { slug: "matsuyama", name: "松山", originLabel: "松山駅", prefecture: "愛媛県", lat: 33.8366, lng: 132.7516 },
  { slug: "kitakyushu", name: "北九州", originLabel: "小倉駅", prefecture: "福岡県", lat: 33.8868, lng: 130.8826 },
  { slug: "fukuoka", name: "福岡", originLabel: "博多駅", prefecture: "福岡県", lat: 33.5902, lng: 130.4207 },
  { slug: "nagasaki", name: "長崎", originLabel: "長崎駅", prefecture: "長崎県", lat: 32.7523, lng: 129.8695 },
  { slug: "kumamoto", name: "熊本", originLabel: "熊本駅", prefecture: "熊本県", lat: 32.7899, lng: 130.6886 },
  { slug: "kagoshima", name: "鹿児島", originLabel: "鹿児島中央駅", prefecture: "鹿児島県", lat: 31.5838, lng: 130.5414 },
  { slug: "naha", name: "那覇", originLabel: "県庁前駅", prefecture: "沖縄県", lat: 26.2124, lng: 127.6792 },
];

/** 近場が多い都市はこの半径で絞る */
export const NEAR_RADIUS_KM = 30;
/** 30km 圏に十分な件数が無い都市はこの半径まで広げる */
export const NEAR_RADIUS_WIDE_KM = 60;
/** 30km 圏にこれだけあれば 30km で打ち切る */
const ENOUGH_WITHIN_NARROW = 30;
/** 都市ページを作る下限（60km 圏の掲載品質スポット数） */
export const MIN_SPOTS_FOR_CITY = 20;
/** 都市同士の重なりチェックに使う上位件数と上限 */
export const OVERLAP_TOP_N = 30;
export const MAX_OVERLAP = 0.5;
/** 「近い順」一覧に出す件数 */
export const CITY_LIST_LIMIT = 20;

export type SpotWithDistance = FishingSpot & { distanceKm: number };

export function getCityBySlug(slug: string): CityOrigin | undefined {
  return CITY_ORIGINS.find((c) => c.slug === slug);
}

/** 掲載品質を満たし、釣り禁止情報の無いスポット（一覧に推せるもの） */
function isRecommendable(s: FishingSpot): boolean {
  return isSitemapEligible(s) && !s.fishingBan;
}

let _recommendable: FishingSpot[] | null = null;
function recommendableSpots(): FishingSpot[] {
  if (!_recommendable) _recommendable = fishingSpots.filter(isRecommendable);
  return _recommendable;
}

/** 起点から近い順（半径 maxKm 以内）。距離は直線 km（小数1桁に丸めない生値） */
export function getSpotsNear(lat: number, lng: number, maxKm: number): SpotWithDistance[] {
  // 1度 ≒ 111km。経度方向は緯度で縮むので余裕を持たせた矩形で先に絞る
  const dLat = maxKm / 111 + 0.05;
  const dLng = maxKm / (111 * Math.cos((lat * Math.PI) / 180)) + 0.05;
  return recommendableSpots()
    .filter((s) => Math.abs(s.latitude - lat) <= dLat && Math.abs(s.longitude - lng) <= dLng)
    .map((s) => ({ ...s, distanceKm: haversineKm(lat, lng, s.latitude, s.longitude) }))
    .filter((s) => s.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export interface CityNearbyResult {
  radiusKm: number;
  /** 半径内の全スポット（近い順） */
  spots: SpotWithDistance[];
}

/** 都市ページの対象スポット。30km 圏で足りなければ 60km 圏まで広げる */
export function getCityNearbySpots(city: CityOrigin): CityNearbyResult {
  const wide = getSpotsNear(city.lat, city.lng, NEAR_RADIUS_WIDE_KM);
  const narrow = wide.filter((s) => s.distanceKm <= NEAR_RADIUS_KM);
  if (narrow.length >= ENOUGH_WITHIN_NARROW) return { radiusKm: NEAR_RADIUS_KM, spots: narrow };
  return { radiusKm: NEAR_RADIUS_WIDE_KM, spots: wide };
}

/** ページを作る（index・sitemap に載せる）都市だけ */
export function getIndexableCities(): CityOrigin[] {
  return CITY_ORIGINS.filter(
    (c) => getSpotsNear(c.lat, c.lng, NEAR_RADIUS_WIDE_KM).length >= MIN_SPOTS_FOR_CITY,
  );
}

/** 起点から近い他の都市（関連リンク用） */
export function getNeighborCities(city: CityOrigin, limit = 4): CityOrigin[] {
  return CITY_ORIGINS.filter((c) => c.slug !== city.slug)
    .map((c) => ({ c, d: haversineKm(city.lat, city.lng, c.lat, c.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.c);
}

/** 表示用の距離（「約4.7km」「約23km」） */
export function formatKm(km: number): string {
  return km < 10 ? `約${(Math.round(km * 10) / 10).toFixed(1)}km` : `約${Math.round(km)}km`;
}
