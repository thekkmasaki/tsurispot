// 日付・ISO週ユーティリティ。metrics保存キーと期間計算に使う。

export function ymd(d) {
  return d.toISOString().slice(0, 10);
}

export function addDays(d, n) {
  const c = new Date(d);
  c.setUTCDate(c.getUTCDate() + n);
  return c;
}

// ISO 8601 週番号 (例: 2026-W25)。週は月曜始まり。
export function isoWeekKey(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // 月=0..日=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // その週の木曜
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((date - firstThursday) / (7 * 24 * 3600 * 1000));
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
