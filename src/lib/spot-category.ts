/**
 * スポットの大分類（海・川・湖池・釣り堀・管理釣り場）。
 * 一覧カードと詳細ページで「どんな釣り場か」を一目で分かるようにするためのラベル。
 * データを import しない純粋関数なので、クライアントからも使える。
 */
import type { FishingSpot } from "@/types";

export type SpotCategoryKey = "sea" | "river" | "lake" | "tsuribori" | "managed";

export const SPOT_CATEGORY_LABELS: Record<SpotCategoryKey, string> = {
  sea: "海",
  river: "川",
  lake: "湖・池",
  tsuribori: "釣り堀",
  managed: "管理釣り場",
};

type CategoryInput = Pick<FishingSpot, "spotType" | "isManagedPond" | "facilityKind">;

export function getSpotCategory(spot: CategoryInput): SpotCategoryKey {
  if (spot.isManagedPond) {
    return spot.facilityKind === "tsuribori" || spot.facilityKind === "kaijo" ? "tsuribori" : "managed";
  }
  if (spot.spotType === "river") return "river";
  if (spot.spotType === "lake" || spot.spotType === "pond") return "lake";
  return "sea";
}

/** 大分類より細かい補足（海上釣り堀・渓流など）。不要なら null。 */
export function getSpotCategoryDetail(spot: CategoryInput): string | null {
  if (!spot.isManagedPond) return null;
  if (spot.facilityKind === "kaijo") return "海上釣り堀";
  if (spot.facilityKind === "tsuribori") return null;
  return spot.spotType === "river" ? "渓流" : null;
}
