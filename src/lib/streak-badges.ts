/**
 * 連続日数バッジ（案②）。既存18バッジは全部「釣果投稿」条件のため、
 * 訪問だけで進む唯一のバッジ群として連続日数ベースの7種を定義する。
 * 判定は「最長連続日数」基準（一度達成したバッジは失われない）。
 */

export interface StreakBadge {
  code: string;
  label: string;
  emoji: string;
  /** 必要連続日数。0 は特殊条件（通い詰め） */
  days: number;
}

export interface StreakBadgeState extends StreakBadge {
  earned: boolean;
  /** 0-100。earned なら 100 */
  progress: number;
}

export const STREAK_BADGES: StreakBadge[] = [
  { code: "streak-3", days: 3, label: "三日坊主、卒業", emoji: "🔰" },
  { code: "streak-7", days: 7, label: "一週間皆勤", emoji: "📅" },
  { code: "streak-14", days: 14, label: "二週間の海", emoji: "🌊" },
  { code: "streak-30", days: 30, label: "ひと月皆勤", emoji: "🔥" },
  { code: "streak-100", days: 100, label: "百日の釣り人", emoji: "👑" },
  { code: "streak-365", days: 365, label: "一年、毎日", emoji: "🌟" },
  { code: "streak-kayoi", days: 0, label: "通い詰め", emoji: "🎣" },
];

/**
 * @param longest 最長連続日数
 * @param current 現在の連続日数（progress表示用）
 * @param maxTripsInMonth 同一月内のLv3（釣行）日数の最大値。「通い詰め」は月4回で獲得
 */
export function evalStreakBadges(
  longest: number,
  current: number,
  maxTripsInMonth: number,
): StreakBadgeState[] {
  return STREAK_BADGES.map((b) => {
    if (b.days === 0) {
      const earned = maxTripsInMonth >= 4;
      return {
        ...b,
        earned,
        progress: earned
          ? 100
          : Math.min(99, Math.round((maxTripsInMonth / 4) * 100)),
      };
    }
    const earned = longest >= b.days;
    return {
      ...b,
      earned,
      progress: earned
        ? 100
        : Math.min(99, Math.round((Math.max(current, 0) / b.days) * 100)),
    };
  });
}
