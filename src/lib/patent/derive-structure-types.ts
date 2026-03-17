/**
 * derive-structure-types.ts
 *
 * ビルド時にスポットの spotType から structureTypes を自動導出するユーティリティ。
 * 80以上あるスポットデータファイルを手動で書き換えなくても、
 * spotType ベースで暫定的な構造物カテゴリを付与できる。
 *
 * - 手動設定済みの structureTypes がある場合はそちらを優先（manual override）
 * - 未設定の場合は spotTypeToStructures マッピングから導出
 */

import type { FishingSpot, StructureCategory } from "@/types";
import { spotTypeToStructures } from "@/lib/data/structure-fish-mapping";

// ---------------------------------------------------------------------------
// 1. enrichSpotWithStructures
// ---------------------------------------------------------------------------

/**
 * 単一スポットに対して structureTypes を導出・付与する。
 *
 * - spot.structureTypes が既に設定済み（非空配列）の場合はそのまま返す
 * - 未設定の場合は spot.spotType から spotTypeToStructures を参照して導出
 *
 * 元のオブジェクトは変更せず、新しいオブジェクトを返す。
 */
export function enrichSpotWithStructures(spot: FishingSpot): FishingSpot {
  // Manual override takes priority
  if (spot.structureTypes && spot.structureTypes.length > 0) {
    return spot;
  }

  const derived = spotTypeToStructures[spot.spotType] ?? [];

  return {
    ...spot,
    structureTypes: derived,
  };
}

// ---------------------------------------------------------------------------
// 2. enrichAllSpots
// ---------------------------------------------------------------------------

/**
 * スポット配列全体に対して structureTypes を一括導出する。
 * enrichSpotWithStructures を各スポットに適用して返す。
 */
export function enrichAllSpots(spots: FishingSpot[]): FishingSpot[] {
  return spots.map(enrichSpotWithStructures);
}

// ---------------------------------------------------------------------------
// 3. getStructureStats
// ---------------------------------------------------------------------------

/**
 * スポット配列内の各構造物カテゴリの出現回数を集計する。
 * structureTypes が未設定のスポットはカウントに含まれない。
 *
 * @returns 構造物カテゴリ → 該当スポット数 のレコード
 */
export function getStructureStats(
  spots: FishingSpot[]
): Record<StructureCategory | string, number> {
  const stats: Record<string, number> = {};

  for (const spot of spots) {
    const types = spot.structureTypes;
    if (!types) continue;

    for (const t of types) {
      stats[t] = (stats[t] ?? 0) + 1;
    }
  }

  return stats;
}
