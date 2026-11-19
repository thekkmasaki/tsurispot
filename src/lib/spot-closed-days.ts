/**
 * 施設型スポットの定休日判定。
 *
 * 2026-11 UX監査: 休園日の当日に「今日の釣行指数」「今日は釣り日和」を出していた
 * （平磯海づり公園＝毎週木曜、すそのフィッシングパーク＝第3木曜）。
 * managementInfo.closedDays（文章）の先頭にある曜日指定を機械的に読み、休園日には
 * 指数・Push・釣り日和を出さないために使う。
 *
 * 読めるもの:
 *   「毎週木曜日」「火曜・水曜」「水・木」「第3木曜」「第1・第3金曜」「毎月第3金曜」
 *   祝日への言及（「祝日は営業」「祝日の場合は翌日」など）→ 祝日は休みと断定しない
 *   「8月を除く」「7・8月は無休」、「月〜水」、「1月1日」「元旦」、年末年始の日付範囲「12/28〜1/2」
 * 読まないもの（null または該当部分を無視＝休みと決めつけない）:
 *   「不定休」「冬季休業」「年末年始」（日付が書かれていない）、
 *   「3〜11月 水・木、12〜2月 …」のように月で曜日が変わる書き方、
 *   「土日祝のみ営業」「営業は3/21〜11/30」のような営業日側の説明
 *
 * 「祝日の場合は翌日」の翌日側の休みは判定しない。表示側は原文を必ず添えること。
 */
const JP_WEEKDAY: Record<string, number> = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };

export interface ClosedRule {
  /** 毎週休みの曜日（0=日〜6=土） */
  weekly: number[];
  /** 「第3木曜」のような月内N回目の曜日 */
  nth: { weekday: number; nths: number[] }[];
  /** 祝日に当たる定休曜日は開園する */
  holidayOpen: boolean;
  /** 「8月を除く」: この月は定休曜日でも開園 */
  exceptMonths: number[];
  /** 日付指定の休み（月日。from > to は年またぎ） */
  dates: { from: [number, number]; to: [number, number] }[];
}

/**
 * 国民の祝日・振替休日（内閣府公表）。「祝日は開園」の施設を休園と誤表示しないために使う。
 * ここに無い年は祝日なしとして扱う（＝定休曜日はそのまま休園扱いになる）ので、毎年追加すること。
 */
const HOLIDAYS = new Set([
  "2026-01-01", "2026-01-12", "2026-02-11", "2026-02-23", "2026-03-20", "2026-04-29",
  "2026-05-03", "2026-05-04", "2026-05-05", "2026-05-06", "2026-07-20", "2026-08-11",
  "2026-09-21", "2026-09-22", "2026-09-23", "2026-10-12", "2026-11-03", "2026-11-23",
  "2027-01-01", "2027-01-11", "2027-02-11", "2027-02-23", "2027-03-21", "2027-03-22",
  "2027-04-29", "2027-05-03", "2027-05-04", "2027-05-05", "2027-07-19", "2027-08-11",
  "2027-09-20", "2027-09-23", "2027-10-11", "2027-11-03", "2027-11-23",
]);

export function isJapaneseHoliday(ymd: string): boolean {
  return HOLIDAYS.has(ymd);
}

const ITEM_RE = /^(?:第([1-5])(?:[・/]第?([1-5]))?週?)?([月火水木金土日])(?:曜日?)?/;

/** 定休日の文章を判定ルールにする。曜日も日付も読めなければ null */
export function parseClosedRule(closedDays: string | undefined | null): ClosedRule | null {
  if (!closedDays) return null;
  const text = closedDays.trim();
  // 月によって曜日・回数が変わる書き方は、先頭だけ読むと誤るので扱わない
  if (/月は第|^\d{1,2}〜\d{1,2}月/.test(text)) return null;
  // 「土日祝のみ営業」「営業は3/21〜11/30」は営業日の説明で、曜日や日付を休みとして読むと逆になる
  if (/のみ営業|のみの営業|営業は|の営業|月は[^。、)）]*も営業/.test(text)) return null;

  const rule: ClosedRule = { weekly: [], nth: [], holidayOpen: false, exceptMonths: [], dates: [] };

  let rest = text.replace(/^(毎週|毎月)/, "");
  for (;;) {
    const m = rest.match(ITEM_RE);
    if (!m) break;
    const weekday = JP_WEEKDAY[m[3]];
    if (m[1]) {
      rule.nth.push({ weekday, nths: [m[1], m[2]].filter(Boolean).map(Number) });
    } else {
      rule.weekly.push(weekday);
    }
    rest = rest.slice(m[0].length);
    // 「月〜水」「火〜木曜」は曜日の範囲
    const range = !m[1] && rest.match(/^〜([月火水木金土日])(?:曜日?)?/);
    if (range) {
      for (let w = (weekday + 1) % 7; ; w = (w + 1) % 7) {
        rule.weekly.push(w);
        if (w === JP_WEEKDAY[range[1]]) break;
      }
      rest = rest.slice(range[0].length);
    }
    const sep = rest.match(/^[・/]/);
    if (!sep) break;
    rest = rest.slice(1);
  }
  // 「月曜日」の「日」などを曜日として二重に読んでいないか（区切りなしで曜日が続くのは想定外）
  if (/^[月火水木金土日]/.test(rest)) return null;

  if (rule.weekly.length > 0 || rule.nth.length > 0) {
    // 祝日への言及があれば、祝日は定休曜日でも休みと断定しない（営業・翌日振替・前日振替など
    // 書き方が多く、どれも「その祝日は開いている」ことが多い。振替先の休みは判定しない）。
    rule.holidayOpen = /祝/.test(rest);
    for (const m of rest.matchAll(/(\d{1,2})月を除く/g)) rule.exceptMonths.push(Number(m[1]));
    // 「8月は無休」「7・8月は無休」「7〜8月は無休」
    for (const m of rest.matchAll(/((?:\d{1,2}[・〜])*\d{1,2})月は無休/g)) {
      const nums = m[1].split(/[・〜]/).map(Number);
      if (m[1].includes("〜") && nums.length === 2) {
        for (let mo = nums[0]; ; mo = (mo % 12) + 1) {
          rule.exceptMonths.push(mo);
          if (mo === nums[1]) break;
        }
      } else {
        rule.exceptMonths.push(...nums);
      }
    }
  }

  // 日付範囲は年末年始（12月〜1月）だけ読む。「3/21〜11/30」のような範囲は営業期間のことが多く、
  // 休みとして読むと逆になる。
  for (const m of text.matchAll(/(\d{1,2})\/(\d{1,2})〜(\d{1,2})\/(\d{1,2})/g)) {
    if (Number(m[1]) === 12 && Number(m[3]) === 1) {
      rule.dates.push({ from: [12, Number(m[2])], to: [1, Number(m[4])] });
    }
  }
  if (/(?<!\d)1月1日|元旦|元日/.test(text) && !rule.dates.some((d) => inRange(d, 1, 1))) {
    rule.dates.push({ from: [1, 1], to: [1, 1] });
  }

  if (rule.weekly.length === 0 && rule.nth.length === 0 && rule.dates.length === 0) return null;
  return rule;
}

function inRange(d: { from: [number, number]; to: [number, number] }, mo: number, day: number): boolean {
  const v = mo * 100 + day;
  const from = d.from[0] * 100 + d.from[1];
  const to = d.to[0] * 100 + d.to[1];
  return from <= to ? v >= from && v <= to : v >= from || v <= to;
}

/** ymd（"YYYY-MM-DD"、JSTの日付）が休みに当たるか */
export function isClosedByRule(rule: ClosedRule | null, ymd: string): boolean {
  if (!rule) return false;
  const [y, mo, d] = ymd.split("-").map(Number);
  if (!y || !mo || !d) return false;
  if (rule.dates.some((r) => inRange(r, mo, d))) return true;
  if (rule.exceptMonths.includes(mo)) return false;
  if (rule.holidayOpen && isJapaneseHoliday(ymd)) return false;
  // 日付だけから曜日を出す（UTC固定でタイムゾーンの影響を受けない）
  const weekday = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
  if (rule.weekly.includes(weekday)) return true;
  const nthOfMonth = Math.ceil(d / 7);
  return rule.nth.some((n) => n.weekday === weekday && n.nths.includes(nthOfMonth));
}

/** 定休日の文章と日付から休みかどうかを返す（Client Component から文章を渡して使う） */
export function isClosedOn(closedDays: string | undefined | null, ymd: string): boolean {
  return isClosedByRule(parseClosedRule(closedDays), ymd);
}

/** ymd がそのスポットの休園日に当たるか */
export function isSpotClosedOn(
  spot: { managementInfo?: { closedDays?: string } },
  ymd: string,
): boolean {
  return isClosedOn(spot.managementInfo?.closedDays, ymd);
}

/** Date を JST の "YYYY-MM-DD" にする */
export function ymdJst(date: Date): string {
  return new Date(date.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
