/**
 * サーバー専用: FishingSpot → 軽量な ListSpot への変換。
 *
 * このモジュールは hidden-gem.ts（= fishingSpots 全件を import）に依存するため、
 * **クライアントコンポーネントから絶対に import しないこと**。さもないと全スポットデータが
 * クライアントバンドルに載り、CWV改善の効果が失われる（microcms.ts と同じ運用規約）。
 * 変換結果の ListSpot だけをサーバー境界を越えてクライアントへ渡す。
 */
import type { FishingSpot, ListSpot, MapSpot } from "@/types";
import { isHiddenGem, getPremiumFishForSpot } from "@/lib/hidden-gem";

export function toListSpot(spot: FishingSpot): ListSpot {
  // fishNames/methods は first-seen 順を保ったまま unique 化する
  // （SpotCard の「先頭3件 + 残数」表示の見え方を従来と一致させるため）。
  const fishNames: string[] = [];
  const seenFish = new Set<string>();
  const methods: string[] = [];
  const seenMethod = new Set<string>();
  for (const cf of spot.catchableFish) {
    const name = cf.fish.name;
    if (name && !seenFish.has(name)) {
      seenFish.add(name);
      fishNames.push(name);
    }
    if (cf.method && !seenMethod.has(cf.method)) {
      seenMethod.add(cf.method);
      methods.push(cf.method);
    }
  }
  return {
    id: spot.id,
    slug: spot.slug,
    name: spot.name,
    address: spot.address,
    region: spot.region,
    latitude: spot.latitude,
    longitude: spot.longitude,
    spotType: spot.spotType,
    difficulty: spot.difficulty,
    isFree: spot.isFree,
    hasParking: spot.hasParking,
    hasToilet: spot.hasToilet,
    hasConvenienceStore: spot.hasConvenienceStore,
    hasFishingShop: spot.hasFishingShop,
    hasRentalRod: spot.hasRentalRod,
    mainImageUrl: spot.mainImageUrl,
    rating: spot.rating,
    fishNames,
    methods,
    isHiddenGem: isHiddenGem(spot),
    hasPremiumFish: getPremiumFishForSpot(spot).length > 0,
  };
}

/** 配列をまとめて変換する薄いヘルパー。 */
export function toListSpots(spots: FishingSpot[]): ListSpot[] {
  return spots.map(toListSpot);
}

/**
 * サーバー専用: FishingSpot → 地図ページ(/map)用の軽量 MapSpot への変換。
 * toListSpot と同じ運用規約（クライアントから import 禁止）。
 * fishNames/fishSlugs は slug で first-seen unique 化し、同じ順序・同じ長さを保つ。
 */
export function toMapSpot(spot: FishingSpot): MapSpot {
  const fishNames: string[] = [];
  const fishSlugs: string[] = [];
  const seenFish = new Set<string>();
  const methods: string[] = [];
  const seenMethod = new Set<string>();
  let isNightFishing = false;
  for (const cf of spot.catchableFish) {
    const slug = cf.fish?.slug;
    const name = cf.fish?.name;
    if (slug && name && !seenFish.has(slug)) {
      seenFish.add(slug);
      fishSlugs.push(slug);
      fishNames.push(name);
    }
    if (cf.method && !seenMethod.has(cf.method)) {
      seenMethod.add(cf.method);
      methods.push(cf.method);
    }
    // 夜釣り判定（spots/[slug]/page.tsx と同ロジック）
    if (cf.recommendedTime && cf.recommendedTime.includes("夜")) {
      isNightFishing = true;
    }
  }
  return {
    id: spot.id,
    slug: spot.slug,
    name: spot.name,
    address: spot.address,
    region: spot.region,
    latitude: spot.latitude,
    longitude: spot.longitude,
    spotType: spot.spotType,
    difficulty: spot.difficulty,
    isFree: spot.isFree,
    hasParking: spot.hasParking,
    mainImageUrl: spot.mainImageUrl,
    rating: spot.rating,
    reviewCount: spot.reviewCount,
    fishNames,
    fishSlugs,
    methods,
    isNightFishing,
    // 管理釣り場判定（spots/[slug]/page.tsx と同様、slug 例外も吸収）
    isManagedPond: (spot.isManagedPond ?? false) || spot.slug === "fishing-park-hirano",
  };
}

/** 配列をまとめて変換する薄いヘルパー。 */
export function toMapSpots(spots: FishingSpot[]): MapSpot[] {
  return spots.map(toMapSpot);
}
