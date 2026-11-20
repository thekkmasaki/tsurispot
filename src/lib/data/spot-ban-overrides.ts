import type { FishingBan } from "@/types";

/**
 * 釣り禁止の監査結果（2026-11）。重複統合後の slug → 禁止情報。spots.ts の applyBanOverrides で適用する。
 *
 * 外部監査で「立入禁止・釣り禁止なのに通常の釣り場として掲載」と指摘された場所を、
 * 港湾管理者・自治体の公式ページで1件ずつ確認したものだけを載せる。
 * 公式で裏が取れなかった指摘は載せない（FishingBan の運用ルールと同じ。出典は一次情報のみ）。
 *
 * - description: 本文を丸ごと差し替える（全面禁止で、元の本文が釣行を勧めているとき）
 * - notice: 元の本文の先頭に足す注記（一部禁止で、元の本文を残すとき）
 */
export interface SpotBanOverride {
  fishingBan: FishingBan;
  description?: string;
  notice?: string;
}

export const spotBanOverrides: Record<string, SpotBanOverride> = {};
