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
 *   季節休業（2026-11 追加）: 「12〜2月は休業」「1・2月は閉園」「7/1〜9/30は休業」「休園 12/29〜3/31」
 *   営業期間（この外は休み）: 「営業は3/21〜11/30」「営業期間 11/1〜翌3/31」「冬季(1〜3月)のみ営業」
 *     「季節営業(2026年は5/3〜11/3)」← 年つきはその年だけに当てはめる
 *   年つきの特定日: 「2026-11-29 は休み」「2026年11月は2・9・16日」
 * 読まないもの（null または該当部分を無視＝休みと決めつけない）:
 *   「不定休」「冬季休業」「年末年始」（日付が書かれていない）、
 *   「11月下旬〜4月上旬」「水温で前後」のような境界があいまいな期間、
 *   「エサ釣りは12〜3月休業」のような一部の釣りだけの休み、
 *   「3〜11月 水・木、12〜2月 …」のように月で曜日が変わる書き方、
 *   「土日祝のみ営業」のような営業曜日の説明
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
  /** 日付指定の休み（月日。from > to は年またぎ。year があればその年だけ） */
  dates: DateRange[];
  /** 「12〜2月は休業」: 月まるごと休み */
  closedMonths: number[];
  /**
   * 営業期間（「営業は3/21〜11/30」「冬季(1〜3月)のみ営業」）。どれにも入らない日は休み。
   * year 付きの期間（「2026年は5/3〜11/3」）は、その年の日付にだけ当てはめる。
   */
  openRanges: DateRange[];
}

interface DateRange {
  from: [number, number];
  to: [number, number];
  year?: number;
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
  const rule: ClosedRule = {
    weekly: [], nth: [], holidayOpen: false, exceptMonths: [], dates: [], closedMonths: [], openRanges: [],
  };
  parseSeason(text, rule);
  if (parseWeekly(text, rule)) parseNewYear(text, rule);
  if (
    rule.weekly.length === 0 && rule.nth.length === 0 && rule.dates.length === 0 &&
    rule.closedMonths.length === 0 && rule.openRanges.length === 0
  ) return null;
  return rule;
}

// ---------------------------------------------------------------------------
// 季節休業・営業期間（2026-11 追加: 冬季休業中の管理釣り場に釣行指数を出していた）
// ---------------------------------------------------------------------------

/** 文の区切り（「エサ釣りは12〜3月休業」のように主語つきの部分休業は読まない） */
const CLAUSE = String.raw`(?:^|[、。,，(（\s])`;
/** 月まるごと休みを表す語 */
const CLOSED_WORD = String.raw`(?:休業|休み|閉園|休園|休館|禁漁|釣り休止|一般開放なし)`;
/** あいまいな期間（上旬・中旬・前後・例年 など）。日付境界がずれるので期間として読まない */
const VAGUE = /上旬|中旬|下旬|前後|頃|ごろ|例年|予定|次第|春彼岸/;

function monthSpan(from: number, to: number): number[] {
  const out: number[] = [];
  for (let m = from; ; m = (m % 12) + 1) {
    out.push(m);
    if (m === to || out.length > 12) break;
  }
  return out;
}

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** 「3/21」「11月末」「4月24日」「4月」を [月, 日] にする。end=true なら月だけの指定は月末 */
function md(token: string, end: boolean): [number, number] | null {
  let m = token.match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) return [Number(m[1]), Number(m[2])];
  m = token.match(/^(\d{1,2})月(?:(\d{1,2})日|(末))?$/);
  if (!m) return null;
  const mo = Number(m[1]);
  if (mo < 1 || mo > 12) return null;
  if (m[2]) return [mo, Number(m[2])];
  return [mo, m[3] || end ? DAYS_IN_MONTH[mo - 1] : 1];
}

const DATE_TOKEN = String.raw`\d{1,2}\/\d{1,2}|\d{1,2}月(?:\d{1,2}日|末)?`;
const RANGE_RE = new RegExp(String.raw`(${DATE_TOKEN})\s*〜\s*(?:翌年?)?(${DATE_TOKEN}|\d{1,2})`, "g");

/** 範囲の列（「4/29〜7/12 の土日祝、7/18〜8/30 の毎日」）を読む。「5/2〜6」の右側の日だけ表記も読む */
function readRanges(segment: string, year?: number): DateRange[] {
  const out: DateRange[] = [];
  for (const m of segment.matchAll(RANGE_RE)) {
    const from = md(m[1], false);
    if (!from) continue;
    // 「5/2〜6」: 右側が日だけなら左と同じ月。左が月だけ（「4月〜6」）は意味が取れないので読まない
    const to = /^\d{1,2}$/.test(m[2])
      ? (/\//.test(m[1]) ? ([from[0], Number(m[2])] as [number, number]) : null)
      : md(m[2], true);
    if (!to) continue;
    out.push(year ? { from, to, year } : { from, to });
  }
  return out;
}

function eraYear(s: string | undefined): number | undefined {
  if (!s) return undefined;
  const m = s.match(/(\d{4})年|令和(\d{1,2})年/);
  if (!m) return undefined;
  return m[1] ? Number(m[1]) : 2018 + Number(m[2]);
}

function parseSeason(text: string, rule: ClosedRule): void {
  // 月まるごとの休み: 「12〜2月は休業」「12月〜3月末は冬季休業」「7〜9月は高水温のため休業」「1・2月は閉園」「8月は休園」
  const monthsClosed = new RegExp(
    String.raw`${CLAUSE}(\d{1,2})月?〜(\d{1,2})月末?は(?:[^、。()（）]{0,12}のため)?(?:冬[季期])?${CLOSED_WORD}`, "g",
  );
  for (const m of text.matchAll(monthsClosed)) rule.closedMonths.push(...monthSpan(Number(m[1]), Number(m[2])));
  const listClosed = new RegExp(String.raw`${CLAUSE}((?:\d{1,2}・)*\d{1,2})月は${CLOSED_WORD}`, "g");
  for (const m of text.matchAll(listClosed)) rule.closedMonths.push(...m[1].split("・").map(Number));

  // 日付範囲の休み: 「7/1〜9/30は休業」「休園 12/29〜3/31」「11月1日〜翌年4月24日は休館」「10/1〜4/30は禁漁」
  const rangeClosed = new RegExp(
    String.raw`${CLAUSE}(?:休園\s*)?((?:${DATE_TOKEN})\s*〜\s*(?:翌年?)?(?:${DATE_TOKEN}))\s*(は?${CLOSED_WORD}|$|[(（])`, "g",
  );
  for (const m of text.matchAll(rangeClosed)) {
    const keywordBefore = /休園\s*$/.test(text.slice(0, (m.index ?? 0) + m[0].indexOf(m[1])));
    if (!keywordBefore && !new RegExp(`^は?${CLOSED_WORD}`).test(m[2])) continue;
    rule.dates.push(...readRanges(m[1]));
  }

  // 特定日の休み（年つき）: 「2026-11-29 は休み」「2026年11月は2・9・16・24・30日」「(2026年は11/18・11/25)」
  for (const m of text.matchAll(/(\d{4})-(\d{2})-(\d{2})\s*は?(?:休み|休業|休園)/g)) {
    const d: [number, number] = [Number(m[2]), Number(m[3])];
    rule.dates.push({ from: d, to: d, year: Number(m[1]) });
  }
  for (const m of text.matchAll(/(\d{4})-(\d{2})-(\d{2})〜(\d{1,2})\s*は?[^、。]{0,10}(?:休み|休業|休園)/g)) {
    rule.dates.push({ from: [Number(m[2]), Number(m[3])], to: [Number(m[2]), Number(m[4])], year: Number(m[1]) });
  }
  const dayList = text.match(/^(\d{4})年(\d{1,2})月は((?:\d{1,2}・)*\d{1,2})日$/);
  if (dayList) {
    for (const d of dayList[3].split("・")) {
      rule.dates.push({ from: [Number(dayList[2]), Number(d)], to: [Number(dayList[2]), Number(d)], year: Number(dayList[1]) });
    }
  }
  for (const m of text.matchAll(/臨時休業あり\((\d{4})年は((?:\d{1,2}\/\d{1,2}・)*\d{1,2}\/\d{1,2})\)/g)) {
    for (const t of m[2].split("・")) {
      const d = md(t, false);
      if (d) rule.dates.push({ from: d, to: d, year: Number(m[1]) });
    }
  }

  // 営業期間（この外は休み）
  const opens: { segment: string; year?: number }[] = [];
  //   「営業は3/21〜11/30」「(営業は4/1〜11月末)」「営業期間 11/1〜翌3/31」
  for (const m of text.matchAll(new RegExp(String.raw`営業(?:は|期間\s*)((?:${DATE_TOKEN})\s*〜\s*(?:翌年?)?(?:${DATE_TOKEN}))`, "g"))) {
    opens.push({ segment: m[1] });
  }
  //   「期間外(令和8年は3/14〜12/28)」「解禁期間外は釣り不可(2026年度は5/27〜6/28・9/18〜10/4)」「季節営業(2026年は5/3〜11/3)」
  for (const m of text.matchAll(/(?:期間外[^(（]*|季節営業)[(（]((?:\d{4}年|令和\d{1,2}年)度?)は([^)）]+)[)）]/g)) {
    opens.push({ segment: m[2], year: eraYear(m[1]) });
  }
  //   「2026年は3/22〜5/10のみ営業」「2026年は4/29〜9/30 の営業」「2026年は3/15〜9/30(10/1から禁漁)」
  //   「2026年は4/29〜7/12 の土日祝、7/18〜8/30 の毎日、9/5〜9/23 の土日祝に営業」
  const yearOpen = text.match(/(?:^|[。、]\s*)(\d{4})年は([^。]*?)(?:のみ営業|\s?の営業|に営業|\((?:\d{1,2}\/\d{1,2})から禁漁\)|$)/);
  if (yearOpen && new RegExp(RANGE_RE.source).test(yearOpen[2]) && !/定休|休み|休業|まで/.test(yearOpen[2])) {
    opens.push({ segment: yearOpen[2], year: Number(yearOpen[1]) });
  }
  //   「冬季(1〜3月)のみ営業」「1〜3月の毎日営業」「3月末〜11月末の期間中は無休」
  for (const m of text.matchAll(/(?:^|[(（、。])(?:冬[季期][(（])?(\d{1,2}月?(?:末)?〜\d{1,2}月(?:末)?)[)）]?(?:のみ営業|の毎日営業|の期間中は無休)/g)) {
    const seg = m[1].replace(/^(\d{1,2})〜/, "$1月〜");
    opens.push({ segment: seg });
  }
  for (const o of opens) {
    if (VAGUE.test(o.segment)) continue;
    rule.openRanges.push(...readRanges(o.segment, o.year));
  }
  rule.closedMonths = [...new Set(rule.closedMonths)].filter((m) => m >= 1 && m <= 12);
}

/** 曜日の定休を読む。月で曜日が変わる書き方・営業日側の説明なら読まずに false */
function parseWeekly(text: string, rule: ClosedRule): boolean {
  // 月によって曜日・回数が変わる書き方は、先頭だけ読むと誤るので扱わない
  if (/月は第|^\d{1,2}〜\d{1,2}月/.test(text)) return false;
  // 「土日祝のみ営業」「営業は3/21〜11/30」は営業日の説明で、曜日や日付を休みとして読むと逆になる
  if (/のみ営業|のみの営業|営業は|の営業|月は[^。、)）]*も営業/.test(text)) return false;

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
  if (/^[月火水木金土日]/.test(rest)) {
    rule.weekly = [];
    rule.nth = [];
    return false;
  }

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
  return true;
}

/** 年末年始の日付（「12/28〜1/2」「元旦」） */
function parseNewYear(text: string, rule: ClosedRule): void {
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
}

function inRange(d: DateRange, mo: number, day: number): boolean {
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
  if (rule.dates.some((r) => (r.year === undefined || r.year === y) && inRange(r, mo, d))) return true;
  if (rule.closedMonths.includes(mo)) return true;
  // 営業期間の外は休み。年つきの期間は、その年の期間が1つ以上あるときだけ判定する
  const opens = rule.openRanges.filter((r) => r.year === undefined || r.year === y);
  if (opens.length > 0 && !opens.some((r) => inRange(r, mo, d))) return true;
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
