import type { FishRegionalAptitude } from "../types";

/**
 * 淡水魚（fish-freshwater.ts の27種）の地域適性。
 * 淡水魚は地形ゲート（海系spotType=0）が主役のため、地域適性は
 * 「本当に分布しない地域」を0にする程度の粗い指定で足りる。
 * 値の意味・解決順は ../types.ts を参照。
 */
export const freshwaterAptitude: Record<string, FishRegionalAptitude> = {
  // 27種は P3 で投入（例: itou は北海道限定、biwamasu/biwako-oonamazu は琵琶湖限定、
  // himemasu は支笏湖・十和田湖等の湖沼限定、ayu は沖縄0 など）
};
