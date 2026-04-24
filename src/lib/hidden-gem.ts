import type { FishingSpot, FishSpecies } from "@/types";

/**
 * 高級魚の判定: 上級者向け + 食味4以上
 * 動画「激レア高級魚の通り道」にインスパイアされた分類
 */
export function isPremiumFish(fish: FishSpecies): boolean {
  return fish.difficulty === "advanced" && fish.tasteRating >= 4;
}

/**
 * スポットで釣れる高級魚の一覧を返す
 */
export function getPremiumFishForSpot(spot: FishingSpot): FishSpecies[] {
  const seen = new Set<string>();
  const result: FishSpecies[] = [];
  for (const cf of spot.catchableFish) {
    if (isPremiumFish(cf.fish) && !seen.has(cf.fish.slug)) {
      seen.add(cf.fish.slug);
      result.push(cf.fish);
    }
  }
  return result;
}

/**
 * 穴場スコアを算出（0-100）
 * 口コミが少なく、魚種が豊富で、高級魚が釣れるスポットほど高スコア
 */
export function getHiddenGemScore(spot: FishingSpot): number {
  let score = 0;

  // 口コミ数が少ない = 知名度が低い = 穴場度UP（最大30点）
  const reviews = spot.googleReviewCount ?? spot.reviewCount;
  if (reviews <= 30) score += 30;
  else if (reviews <= 60) score += 25;
  else if (reviews <= 100) score += 15;
  else if (reviews <= 150) score += 5;

  // 釣れる魚種が多い = 実力あるスポット（最大25点）
  const fishCount = spot.catchableFish.length;
  if (fishCount >= 8) score += 25;
  else if (fishCount >= 5) score += 20;
  else if (fishCount >= 3) score += 10;

  // 高級魚が釣れる = 価値が高い（最大25点）
  const premiumCount = getPremiumFishForSpot(spot).length;
  if (premiumCount >= 3) score += 25;
  else if (premiumCount >= 2) score += 20;
  else if (premiumCount >= 1) score += 12;

  // 「hard」難易度の魚がいる = 上級者向けの面白さ（最大10点）
  const hardFishCount = spot.catchableFish.filter(cf => cf.catchDifficulty === "hard").length;
  if (hardFishCount >= 2) score += 10;
  else if (hardFishCount >= 1) score += 5;

  // 磯・岩場は穴場のイメージにマッチ（最大10点）
  if (spot.spotType === "rocky") score += 10;
  else if (spot.spotType === "breakwater" || spot.spotType === "beach") score += 5;

  return Math.min(score, 100);
}

/**
 * 穴場スポット判定（スコア60以上 かつ 魚種3種以上）
 */
export function isHiddenGem(spot: FishingSpot): boolean {
  return getHiddenGemScore(spot) >= 60 && spot.catchableFish.length >= 3;
}

/**
 * 県内の穴場×高級魚スポットを取得（スコア降順）
 */
export function getHiddenGemSpotsForPrefecture(
  spots: FishingSpot[],
  limit = 5
): (FishingSpot & { hiddenGemScore: number; premiumFish: FishSpecies[] })[] {
  return spots
    .map(spot => ({
      ...spot,
      hiddenGemScore: getHiddenGemScore(spot),
      premiumFish: getPremiumFishForSpot(spot),
    }))
    .filter(s => s.hiddenGemScore >= 55 && s.premiumFish.length > 0)
    .sort((a, b) => b.hiddenGemScore - a.hiddenGemScore)
    .slice(0, limit);
}
