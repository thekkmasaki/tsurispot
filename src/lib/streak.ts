/**
 * 釣行ストリーク（連続釣行記録）計算ロジック。
 * dates は YYYY-MM-DD 配列。重複は内部で排除する。
 */

export interface Streak {
  current: number;          // 今日 or 昨日まで連続している日数（途切れていればゼロ）
  longest: number;          // 全期間の最長連続日数
  lastDate: string | null;  // 最終釣行日 (YYYY-MM-DD)
  totalDays: number;        // ユニーク釣行日数
}

function todayJST(): string {
  // App Runner / ローカル環境はUTCで動くため、JSTオフセット +9h
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 3600 * 1000);
  return jst.toISOString().slice(0, 10);
}

function diffDays(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00Z`).getTime();
  const db = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((da - db) / 86400000);
}

export function calculateStreak(dates: string[]): Streak {
  const valid = dates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
  if (valid.length === 0) {
    return { current: 0, longest: 0, lastDate: null, totalDays: 0 };
  }

  // 重複排除 + 新しい順
  const uniq = Array.from(new Set(valid)).sort().reverse();
  const today = todayJST();
  const lastDate = uniq[0];

  // 現在のストリーク（今日 or 昨日からスタート）
  let current = 0;
  if (lastDate === today || diffDays(today, lastDate) === 1) {
    current = 1;
    for (let i = 1; i < uniq.length; i++) {
      if (diffDays(uniq[i - 1], uniq[i]) === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // 全期間最長ストリーク
  let longest = 1;
  let run = 1;
  for (let i = 1; i < uniq.length; i++) {
    if (diffDays(uniq[i - 1], uniq[i]) === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  return {
    current,
    longest: Math.max(longest, current),
    lastDate,
    totalDays: uniq.length,
  };
}

/**
 * 日付配列から `{date: count}` の Map を生成（カレンダーヒートマップ用）。
 * 同じ日に複数回チェックインがあれば count が増える。
 */
export function buildDailyCounts(dates: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const d of dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    counts[d] = (counts[d] || 0) + 1;
  }
  return counts;
}
