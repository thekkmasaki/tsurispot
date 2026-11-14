/**
 * 釣具店の営業時間（自由記述の businessHours）から、釣り人が探す時間帯の属性を判定する。
 *
 * GSC 実測（2026-10-15〜11-11）: 「釣具屋 24時間」「朝早くからやってる釣具屋」など時間帯系クエリは
 * CTR 2.7% と釣具系で最も高い。一方で誤った「24時間」表示は来店トラブルに直結するため、
 * 判定は保守的に行う:
 * - 24時間: 「24時間営業」単独表記の店だけ（曜日限定の24時間営業は含めない）
 * - 早朝: いずれかの営業時間帯の開店が 5 時台以前（shop-meta.ts の件数表示と同じ基準）
 * - 深夜: いずれかの営業時間帯の閉店が 22 時以降（翌日にまたがる表記も含む）
 * 「お問い合わせください」等で時刻が読めない店はどれにも該当させない。
 */

export interface ShopHoursTraits {
  is24h: boolean;
  early: boolean;
  lateNight: boolean;
  /** 読み取れた最も早い開店時刻（分）。読めなければ null */
  earliestOpenMinutes: number | null;
}

const RANGE_RE = /(\d{1,2})[:：](\d{2})\s*[〜~ー－\-–]\s*(?:翌\s*)?(\d{1,2})[:：](\d{2})/g;

export const EARLY_OPEN_HOUR_MAX = 5;
export const LATE_CLOSE_HOUR_MIN = 22;

export function is24HourShop(businessHours: string): boolean {
  return businessHours.trim() === "24時間営業";
}

export function getShopHoursTraits(businessHours: string): ShopHoursTraits {
  const is24h = is24HourShop(businessHours);
  if (is24h) {
    return { is24h: true, early: false, lateNight: false, earliestOpenMinutes: 0 };
  }
  let earliest: number | null = null;
  let lateNight = false;
  for (const m of businessHours.matchAll(RANGE_RE)) {
    const openH = Number(m[1]);
    const openM = Number(m[2]);
    const closeH = Number(m[3]);
    if (openH > 24 || closeH > 30) continue;
    const open = openH * 60 + openM;
    if (earliest === null || open < earliest) earliest = open;
    // 閉店が 22 時以降、または開店より前の時刻＝翌日にまたがる営業
    if (closeH >= LATE_CLOSE_HOUR_MIN || closeH < openH) lateNight = true;
  }
  const early = earliest !== null && earliest < (EARLY_OPEN_HOUR_MAX + 1) * 60;
  return { is24h: false, early, lateNight, earliestOpenMinutes: earliest };
}

/** 一覧・詳細に出す時間帯ラベル（24時間 > 早朝 > 深夜 の順） */
export function shopHoursLabels(businessHours: string): string[] {
  const t = getShopHoursTraits(businessHours);
  if (t.is24h) return ["24時間営業"];
  const labels: string[] = [];
  if (t.early) labels.push("早朝営業");
  if (t.lateNight) labels.push("夜22時以降も営業");
  return labels;
}
