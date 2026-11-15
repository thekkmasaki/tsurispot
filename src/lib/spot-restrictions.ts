import type { FishingSpot } from "@/types";

/**
 * スポット単位の「釣り禁止・制限」情報の要約。
 *
 * スポット詳細の基本データ表と、県別ルールページ（/fishing-rules/[prefecture]）の
 * 「釣り禁止・制限情報があるスポット」表で共用する。データに存在する項目だけを使い、
 * 推測で「禁止」を足さない（fishingBan は一次情報の出典つき、rules はスポット個別データ）。
 */
export type SpotRestrictionLevel = "ban-full" | "ban-partial" | "area" | "method";

export interface SpotRestrictionSummary {
  level: SpotRestrictionLevel;
  /** 表示用ラベル（例: 「釣り禁止」「一部区域で釣り禁止」「投げ釣り・コマセ禁止」） */
  label: string;
  /** 補足（禁止理由・区域の説明） */
  detail?: string;
  /** 出典（fishingBan の一次情報URLのみ。rules には出典フィールドが無い） */
  sourceUrls: string[];
  /** 確認日 YYYY-MM-DD（fishingBan のみ） */
  confirmedAt?: string;
}

export const RESTRICTION_LEVEL_ORDER: Record<SpotRestrictionLevel, number> = {
  "ban-full": 0,
  "ban-partial": 1,
  area: 2,
  method: 3,
};

/** 出典URLのホスト名（表示用） */
export function sourceHostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** rules から「禁止されている釣法」を列挙する（明示的に false のものだけ） */
export function getForbiddenRuleLabels(spot: Pick<FishingSpot, "rules">): string[] {
  const r = spot.rules;
  if (!r) return [];
  const labels: string[] = [];
  if (r.castingAllowed === false) labels.push("投げ釣り");
  if (r.lureAllowed === false) labels.push("ルアー釣り");
  if (r.chumAllowed === false) labels.push("コマセ（撒き餌）");
  if (r.nightFishing === false) labels.push("夜釣り");
  return labels;
}

/**
 * スポットの禁止・制限情報を1件に要約する。何も無ければ null。
 * 優先順: 釣り禁止(全面) → 釣り禁止(一部) → 立入・釣り禁止区域の記載 → 釣法の禁止。
 */
export function getSpotRestrictionSummary(
  spot: Pick<FishingSpot, "fishingBan" | "rules">,
): SpotRestrictionSummary | null {
  const ban = spot.fishingBan;
  if (ban) {
    return {
      level: ban.scope === "full" ? "ban-full" : "ban-partial",
      label: ban.scope === "full" ? "釣り禁止" : "一部区域・条件付きで釣り禁止",
      detail: ban.reason,
      sourceUrls: ban.sourceUrls,
      confirmedAt: ban.confirmedAt,
    };
  }
  const areas = spot.rules?.restrictedAreas?.filter((a) => a.trim().length > 0) ?? [];
  if (areas.length > 0) {
    return {
      level: "area",
      label: "釣り禁止・立入禁止の区域あり",
      detail: areas.join("／"),
      sourceUrls: [],
    };
  }
  const forbidden = getForbiddenRuleLabels(spot);
  if (forbidden.length > 0) {
    return {
      level: "method",
      label: `${forbidden.join("・")}は禁止`,
      sourceUrls: [],
    };
  }
  return null;
}

const MONTH_LABEL = (m: number) => `${m}月`;

/**
 * 月番号の集合を「3〜5月・9〜11月」のような範囲表記にする（年またぎは「11〜2月」）。
 * 12か月すべてなら「通年」。
 */
export function formatMonthRanges(months: number[]): string {
  const set = new Set(months.filter((m) => m >= 1 && m <= 12));
  if (set.size === 0) return "";
  if (set.size === 12) return "通年";
  // 年またぎを1つの範囲にするため、直前月が含まれない月を起点に走査する
  const starts = [...set].filter((m) => !set.has(m === 1 ? 12 : m - 1)).sort((a, b) => a - b);
  const ranges = starts.map((start) => {
    let end = start;
    while (set.has(end === 12 ? 1 : end + 1)) end = end === 12 ? 1 : end + 1;
    return start === end ? MONTH_LABEL(start) : `${start}〜${end}月`;
  });
  return ranges.join("・");
}

/** catchableFish の 1 エントリが月 m に該当するか（年またぎ対応） */
export function isMonthInRange(m: number, start: number, end: number): boolean {
  return start <= end ? m >= start && m <= end : m >= start || m <= end;
}
