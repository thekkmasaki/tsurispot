/**
 * ランキングスコア算出（100点満点）。
 *
 * 以前は ranking-client(Client) 内に定義し、全2,141件に対して useMemo/描画のたびに
 * 再計算していた。サーバー(ranking/page.tsx)で事前計算して RankingSpot.score に載せ、
 * クライアントの再計算を省く（低速端末の INP/TBT を軽減）。
 */
export interface RankScoreInput {
  rating: number;
  reviewCount: number;
  fishCount: number;
  hasParking: boolean;
  hasToilet: boolean;
  hasRentalRod: boolean;
  isFree: boolean;
  difficulty: string;
}

export function calcRankScore(spot: RankScoreInput): number {
  const C = 10;
  const M = 3.8;
  const bayesian = (spot.reviewCount * spot.rating + C * M) / (spot.reviewCount + C);
  const ratingScore = (bayesian / 5) * 50;

  const fishScore = Math.min(spot.fishCount / 8, 1) * 15;

  let facilityScore = 0;
  if (spot.hasParking) facilityScore += 4;
  if (spot.hasToilet) facilityScore += 4;
  if (spot.hasRentalRod) facilityScore += 4;
  if (spot.isFree) facilityScore += 3;

  const popularityScore = Math.min(spot.reviewCount / 200, 1) * 10;

  const accessScore = spot.difficulty === "beginner" ? 10 : spot.difficulty === "intermediate" ? 5 : 2;

  return ratingScore + fishScore + facilityScore + popularityScore + accessScore;
}
