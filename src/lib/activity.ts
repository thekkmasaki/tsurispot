/**
 * ハイブリッド活動レベル（案②: ストリークの定義変更）。
 * 1日の関わりを3段階で表す:
 *   Lv1 = 見た（サイトを開いた） / Lv2 = 動いた（お気に入り追加・「釣ったことある」等の操作） / Lv3 = 行った（釣行記録・釣果投稿）
 * 同じ日に複数レベルがあれば最大レベルを採用する。
 * レベル値は CalendarHeatmap の colorFor()（1/2/3+ → emerald-300/500/700）にそのまま渡せる。
 */

export const ACTIVITY_LEVEL_LABELS = ["なし", "見た", "動いた", "行った"] as const;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** JSTの今日 (YYYY-MM-DD)。サーバー(UTC)でもブラウザでも同じ結果になる。 */
export function todayJST(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600 * 1000);
  return jst.toISOString().slice(0, 10);
}

/**
 * 訪問/アクション/釣行の日付配列を {date: level} に統合する。
 * 不正な日付は無視。levelは 1〜3。
 */
export function buildActivityLevels(
  visits: string[],
  actions: string[],
  trips: string[],
): Record<string, number> {
  const levels: Record<string, number> = {};
  const apply = (dates: string[], level: number) => {
    for (const d of dates) {
      if (!DATE_RE.test(d)) continue;
      if ((levels[d] || 0) < level) levels[d] = level;
    }
  };
  apply(visits, 1);
  apply(actions, 2);
  apply(trips, 3);
  return levels;
}

/** レベル別の日数集計（凡例表示用）。 */
export function countByLevel(
  levels: Record<string, number>,
): { lv1: number; lv2: number; lv3: number } {
  let lv1 = 0;
  let lv2 = 0;
  let lv3 = 0;
  for (const v of Object.values(levels)) {
    if (v === 1) lv1++;
    else if (v === 2) lv2++;
    else if (v >= 3) lv3++;
  }
  return { lv1, lv2, lv3 };
}

/** 同一月内のLv3日数の最大値（「通い詰め」バッジ判定用）。 */
export function maxTripsInAnyMonth(levels: Record<string, number>): number {
  const byMonth: Record<string, number> = {};
  for (const [date, lv] of Object.entries(levels)) {
    if (lv < 3) continue;
    const month = date.slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  }
  return Object.values(byMonth).reduce((a, b) => Math.max(a, b), 0);
}
