import type { FishingSpot } from "@/types";

/** 一覧の絞り込みに使う「水辺の種類」。spotType を 海／川／湖・池 の3つにまとめる */
export type WaterType = "sea" | "river" | "lake";

export const WATER_TYPES: WaterType[] = ["sea", "river", "lake"];

export const WATER_TYPE_LABELS: Record<WaterType, string> = {
  sea: "海",
  river: "川",
  lake: "湖・池",
};

export function waterTypeOf(spotType: FishingSpot["spotType"]): WaterType {
  if (spotType === "river") return "river";
  if (spotType === "lake" || spotType === "pond") return "lake";
  return "sea";
}

/**
 * 全体の上位 limit 件に加えて、種類ごとの上位 limit 件も含めたリストを返す（評価順を保つ）。
 * 「川」を選んだときに、全体の上位に入らない川の釣り場も出せるようにするため。
 */
export function pickForWaterFilter<T extends { id: string; spotType: FishingSpot["spotType"] }>(
  spots: T[],
  limit: number,
): { spot: T; water: WaterType; inAll: boolean }[] {
  const perType: Record<WaterType, number> = { sea: 0, river: 0, lake: 0 };
  const out: { spot: T; water: WaterType; inAll: boolean }[] = [];
  spots.forEach((spot, i) => {
    const water = waterTypeOf(spot.spotType);
    const inAll = i < limit;
    const inType = perType[water] < limit;
    perType[water]++;
    if (inAll || inType) out.push({ spot, water, inAll });
  });
  return out;
}

export function countByWaterType(spots: { spotType: FishingSpot["spotType"] }[]): Record<WaterType, number> {
  const c: Record<WaterType, number> = { sea: 0, river: 0, lake: 0 };
  for (const s of spots) c[waterTypeOf(s.spotType)]++;
  return c;
}
