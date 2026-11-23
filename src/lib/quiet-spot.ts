/**
 * 「近くの穴場」用の判定（混みにくい・あまり知られていない釣り場）。
 *
 * lib/hidden-gem.ts の isHiddenGem は「穴場×高級魚」（高級魚が釣れる・初心者向けでない等）の厳しい
 * 判定で全国39件しかなく、「近くの穴場」を探す人の大半は近くに1件も出ない。ここではもっと広く、
 * 掲載データで確かめられる事実だけで「口コミが少ない＝知られていない」釣り場を拾う。
 *
 * 条件（すべて満たすもの）:
 *  - 掲載品質を満たす（isSitemapEligible）・釣り禁止情報が無い・管理釣り場/釣り堀ではない
 *  - 海釣り公園・フィッシングパーク・マリーナ等の大規模施設ではない（名前で判定）
 *  - Googleマップの口コミ件数がデータにあり、QUIET_MAX_REVIEWS 件以下
 *    （口コミ件数のデータが無いスポットは「不明」なので穴場に数えない＝推測で付けない）
 *  - 評価が QUIET_MIN_RATING 以上（人が少ないだけで評価の低い場所は勧めない）
 * isHiddenGem（穴場×高級魚）に当たるスポットも「穴場」として扱う。
 */
import type { FishingSpot } from "@/types";
import { isSitemapEligible } from "@/lib/seo-quality";
import { isHiddenGem } from "@/lib/hidden-gem";

export const QUIET_MAX_REVIEWS = 30;
export const QUIET_MIN_RATING = 3.5;

const LARGE_FACILITY_RE =
  /(フィッシングパーク|海釣り公園|海づり公園|海釣公園|釣り公園|海づり施設|海釣り施設|釣り堀|釣堀|管理釣り場|マリーナ)/;

/** 口コミが少なく混みにくい釣り場（「近くの穴場」） */
export function isQuietSpot(spot: FishingSpot): boolean {
  if (spot.fishingBan) return false;
  if (!isSitemapEligible(spot)) return false;
  if (isHiddenGem(spot)) return true;
  if (spot.isManagedPond) return false;
  if (LARGE_FACILITY_RE.test(spot.name)) return false;
  if (spot.googleReviewCount == null) return false;
  if (spot.googleReviewCount > QUIET_MAX_REVIEWS) return false;
  return (spot.googleRating ?? spot.rating) >= QUIET_MIN_RATING;
}
