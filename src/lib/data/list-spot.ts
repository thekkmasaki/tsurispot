/**
 * サーバー専用: FishingSpot → 軽量な ListSpot への変換。
 *
 * このモジュールは hidden-gem.ts（= fishingSpots 全件を import）に依存するため、
 * **クライアントコンポーネントから絶対に import しないこと**。さもないと全スポットデータが
 * クライアントバンドルに載り、CWV改善の効果が失われる（microcms.ts と同じ運用規約）。
 * 変換結果の ListSpot だけをサーバー境界を越えてクライアントへ渡す。
 */
import type { FishingSpot, ListSpot } from "@/types";
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
