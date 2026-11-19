/**
 * 施設型スポットの定休日判定。
 *
 * 2026-11 UX監査: 平磯海づり公園（毎週木曜休園）に、木曜当日も「今日の釣行指数」
 * 「今日のベスト」を出していた。managementInfo.closedDays（文章）から曜日だけを機械的に読み、
 * 休園日には指数・Push を出さないために使う。
 *
 * 読めるのは「毎週木曜日」「毎週火・水曜日」のような単純な曜日指定だけ。
 * 「第2火曜」「不定休」「冬季休業」などは判定しない（null = 休みとは扱わない）。
 * 祝日カレンダーは持っていないため、「祝日は開園」の施設でも木曜祝日は休園扱いになる。
 * 表示側は note（原文）を必ず添えて、利用者が例外を読めるようにすること。
 */
const JP_WEEKDAY: Record<string, number> = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };

/** 定休の曜日（0=日〜6=土）。単純な曜日指定として読めなければ null */
export function parseClosedWeekdays(closedDays: string | undefined | null): number[] | null {
  if (!closedDays) return null;
  const m = closedDays
    .trim()
    .match(/^毎週([月火水木金土日])(?:曜日?)?(?:[・、]([月火水木金土日])(?:曜日?)?)?(?![月火水木金土日])/);
  if (!m) return null;
  return [m[1], m[2]].filter(Boolean).map((d) => JP_WEEKDAY[d]);
}

/** ymd（"YYYY-MM-DD"、JSTの日付）がそのスポットの定休曜日に当たるか */
export function isSpotClosedOn(
  spot: { managementInfo?: { closedDays?: string } },
  ymd: string,
): boolean {
  const weekdays = parseClosedWeekdays(spot.managementInfo?.closedDays);
  if (!weekdays) return false;
  const [y, mo, d] = ymd.split("-").map(Number);
  if (!y || !mo || !d) return false;
  // 日付だけから曜日を出す（UTC固定でタイムゾーンの影響を受けない）
  return weekdays.includes(new Date(Date.UTC(y, mo - 1, d)).getUTCDay());
}
