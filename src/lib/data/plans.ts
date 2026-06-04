/**
 * B2B釣具店向け課金プランの価格（単一ソース）。
 * 価格を表示する箇所（partner / subscribe / paid-plan-inquiry）はこの定数を参照し、
 * 表記のばらつき・将来の不整合を防ぐ。金額は税込・円。
 *
 * 注意: 2年目以降の価格(afterYear)はStripe単体では自動切替できないため、
 * 初年度Priceで運用し1年後に手動でPrice変更/Scheduleする（docs/stripe-setup.md 参照）。
 */
export const PLAN_PRICING = {
  basic: { firstYear: 500, afterYear: 980 },
  pro: { firstYear: 1980, afterYear: 2980 },
} as const;

/** 金額をカンマ区切りで返す（例: 1980 → "1,980"） */
export function formatYen(value: number): string {
  return value.toLocaleString("ja-JP");
}
