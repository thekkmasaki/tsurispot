import type { FishingSpot, FishSpecies } from "@/types";
import { fishingSpots } from "@/lib/data/spots";

// ========================================
// 設定値（閾値・重み）を1箇所で管理
// ========================================
const CONFIG = {
  // 大規模スポット除外キーワード
  excludeKeywords: ["港", "フィッシングパーク", "海釣り公園", "釣り堀", "釣り公園", "マリーナ"],

  // 軸1: 小規模さシグナル（最大20点）
  smallScale: {
    spotType: {
      rocky: 8,
      beach: 6,
      breakwater: 4,
      pier: 3,
      port: 0,
      river: 0,
    } as Record<string, number>,
    noToilet: 3,
    noParking: 3,
    noRentalRod: 2,
    noConvenience: 2,
    noFishingShop: 2,
  },

  // 軸2: 高級魚ポテンシャル（最大20点）
  premiumFish: {
    one: 10,
    two: 15,
    threeOrMore: 20,
  },

  // 軸3: 難易度（最大20点）
  difficulty: {
    spotAdvanced: 10,
    spotIntermediate: 5,
    hardFishEach: 3, // 1匹あたり（最大9点）
    hardFishMax: 9,
    cautionSafety: 3,
    dangerSafety: 5,
  },

  // 軸4: 知名度の低さ（最大20点）
  popularity: {
    bottom10Pct: 10,
    bottom25Pct: 6,
    ratingMid: 5, // 3.0-3.8
    ratingHighPenalty: -8, // 4.0-4.19（4.2以上はハードカットで除外済み）
  },

  // 軸5: 魚種の豊富さ（最大20点）
  fishDiversity: {
    fiveOrMore: 10,
    eightOrMore: 20,
  },

  // 穴場認定条件
  threshold: {
    minTotalScore: 50, // 5軸合計（最大100点中）
    minAxesAbove: 3, // 最低3軸でこのスコア以上
    perAxisMin: 6, // 各軸の「一定以上」の基準
  },
} as const;

// ========================================
// 都道府県別reviewCount統計キャッシュ
// ========================================
let prefectureStatsCache: Map<string, { p10: number; p25: number }> | null = null;

function getPrefectureReviewStats(): Map<string, { p10: number; p25: number }> {
  if (prefectureStatsCache) return prefectureStatsCache;

  const byPrefecture = new Map<string, number[]>();
  for (const spot of fishingSpots) {
    const pref = spot.region.prefecture;
    const reviews = spot.googleReviewCount ?? spot.reviewCount;
    if (!byPrefecture.has(pref)) byPrefecture.set(pref, []);
    byPrefecture.get(pref)!.push(reviews);
  }

  prefectureStatsCache = new Map();
  for (const [pref, reviews] of byPrefecture) {
    const sorted = reviews.slice().sort((a, b) => a - b);
    const p10 = sorted[Math.floor(sorted.length * 0.1)] ?? 0;
    const p25 = sorted[Math.floor(sorted.length * 0.25)] ?? 0;
    prefectureStatsCache.set(pref, { p10, p25 });
  }

  return prefectureStatsCache;
}

// ========================================
// 公開API（シグネチャ維持）
// ========================================

/**
 * 高級魚の判定: 上級者向け + 食味4以上
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

// ========================================
// 大規模スポット除外判定
// ========================================
function isLargeScaleSpot(spot: FishingSpot): boolean {
  return CONFIG.excludeKeywords.some((kw) => spot.name.includes(kw));
}

// ========================================
// 5軸スコアリング
// ========================================

/** 軸1: 小規模さシグナル（最大20点） */
function getSmallScaleScore(spot: FishingSpot): number {
  let score = CONFIG.smallScale.spotType[spot.spotType] ?? 0;
  if (!spot.hasToilet) score += CONFIG.smallScale.noToilet;
  if (!spot.hasParking) score += CONFIG.smallScale.noParking;
  if (!spot.hasRentalRod) score += CONFIG.smallScale.noRentalRod;
  if (!spot.hasConvenienceStore) score += CONFIG.smallScale.noConvenience;
  if (!spot.hasFishingShop) score += CONFIG.smallScale.noFishingShop;
  return Math.min(score, 20);
}

/** 軸2: 高級魚ポテンシャル（最大20点） */
function getPremiumFishScore(spot: FishingSpot): number {
  const count = getPremiumFishForSpot(spot).length;
  if (count >= 3) return CONFIG.premiumFish.threeOrMore;
  if (count >= 2) return CONFIG.premiumFish.two;
  if (count >= 1) return CONFIG.premiumFish.one;
  return 0;
}

/** 軸3: 難易度の高さ（最大20点） */
function getDifficultyScore(spot: FishingSpot): number {
  let score = 0;

  // スポット自体の難易度
  if (spot.difficulty === "advanced") score += CONFIG.difficulty.spotAdvanced;
  else if (spot.difficulty === "intermediate") score += CONFIG.difficulty.spotIntermediate;

  // hard難易度の魚
  const hardCount = spot.catchableFish.filter((cf) => cf.catchDifficulty === "hard").length;
  score += Math.min(hardCount * CONFIG.difficulty.hardFishEach, CONFIG.difficulty.hardFishMax);

  // 安全レベル（足場が悪い = 穴場らしい）
  if (spot.safetyLevel === "danger") score += CONFIG.difficulty.dangerSafety;
  else if (spot.safetyLevel === "caution") score += CONFIG.difficulty.cautionSafety;

  return Math.min(score, 20);
}

/** 軸4: 知名度の低さ（最大20点） */
function getPopularityScore(spot: FishingSpot): number {
  const stats = getPrefectureReviewStats().get(spot.region.prefecture);
  if (!stats) return 0;

  let score = 0;
  const reviews = spot.googleReviewCount ?? spot.reviewCount;

  // 県内の相対的な位置
  if (reviews <= stats.p10) score += CONFIG.popularity.bottom10Pct;
  else if (reviews <= stats.p25) score += CONFIG.popularity.bottom25Pct;

  // rating評価（中程度が穴場らしい、高評価は人気 → 減点。4.2以上はハードカット済み）
  if (spot.rating >= 4.0) score += CONFIG.popularity.ratingHighPenalty;
  else if (spot.rating >= 3.0 && spot.rating <= 3.8) score += CONFIG.popularity.ratingMid;

  return Math.max(Math.min(score, 20), 0);
}

/** 軸5: 魚種の豊富さ（最大20点） */
function getFishDiversityScore(spot: FishingSpot): number {
  const count = spot.catchableFish.length;
  if (count >= 8) return CONFIG.fishDiversity.eightOrMore;
  if (count >= 5) return CONFIG.fishDiversity.fiveOrMore;
  return 0;
}

// ========================================
// メインスコア計算
// ========================================

/**
 * 穴場スコアを算出（0-100）
 * 5軸スコアリング: 小規模さ + 高級魚 + 難易度 + 知名度低さ + 魚種豊富さ
 */
export function getHiddenGemScore(spot: FishingSpot): number {
  // 大規模スポットは即0
  if (isLargeScaleSpot(spot)) return 0;
  // beginner は穴場に不向き
  if (spot.difficulty === "beginner") return 0;
  // 高評価スポットは穴場では��い
  if (spot.rating >= 4.2) return 0;

  const axes = [
    getSmallScaleScore(spot),
    getPremiumFishScore(spot),
    getDifficultyScore(spot),
    getPopularityScore(spot),
    getFishDiversityScore(spot),
  ];

  return axes.reduce((sum, v) => sum + v, 0);
}

/**
 * 穴場スポット判定
 * AND条件:
 * 1. 大規模スポット除外に該当しない
 * 2. 高級魚が1種以上
 * 3. catchableFish 3種以上
 * 4. difficulty != "beginner"
 * 5. 5軸合計が閾値以上
 * 6. 5軸のうち少なくとも3軸で一定スコア以上
 */
export function isHiddenGem(spot: FishingSpot): boolean {
  // 大規模スポット除外
  if (isLargeScaleSpot(spot)) return false;
  // beginner除外
  if (spot.difficulty === "beginner") return false;
  // 高級魚1種以上（必須）
  if (getPremiumFishForSpot(spot).length === 0) return false;
  // 魚種3種以上（必須）
  if (spot.catchableFish.length < 3) return false;
  // 高評価スポットは人気があるので穴場ではない
  if (spot.rating >= 4.2) return false;

  // 5軸スコア
  const axes = [
    getSmallScaleScore(spot),
    getPremiumFishScore(spot),
    getDifficultyScore(spot),
    getPopularityScore(spot),
    getFishDiversityScore(spot),
  ];

  // 合計スコア（高評価ペナルティ込み = getHiddenGemScoreと同じ値）
  const total = getHiddenGemScore(spot);
  if (total < CONFIG.threshold.minTotalScore) return false;

  // 3軸以上で一定スコア
  const axesAboveMin = axes.filter((v) => v >= CONFIG.threshold.perAxisMin).length;
  if (axesAboveMin < CONFIG.threshold.minAxesAbove) return false;

  return true;
}

/**
 * 県内の穴場×高級魚スポットを取得（スコア降順）
 */
export function getHiddenGemSpotsForPrefecture(
  spots: FishingSpot[],
  limit = 3
): (FishingSpot & { hiddenGemScore: number; premiumFish: FishSpecies[] })[] {
  return spots
    .filter((spot) => isHiddenGem(spot))
    .map((spot) => ({
      ...spot,
      hiddenGemScore: getHiddenGemScore(spot),
      premiumFish: getPremiumFishForSpot(spot),
    }))
    .sort((a, b) => b.hiddenGemScore - a.hiddenGemScore)
    .slice(0, limit);
}
