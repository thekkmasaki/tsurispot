// sitemap の月系ページ（県×月×魚種マトリクス・県×月・月×地域・釣り方×月）の lastModified 算出。
//
// 旧実装は「ビルド年のその月1日」固定だったため2つの問題があった:
//   1. 過去月ページは lastmod が Googlebot の最終クロールより古くなり「変更なし」と
//      判定され続け、#157/#179 の noindex→index 転換が再クロールされず伝わらない
//   2. 未来月ページ（例: 7月ビルドの december）は未来日付になり Google に無視される

/** robots 方針が noindex→index,follow に転換した日（#157/#179、2026-06-23 本番反映）。
 *  この日以降に Googlebot が再クロールしたページは index 転換が確認済み。 */
export const INDEX_POLICY_DATE = new Date(Date.UTC(2026, 5, 23));

/**
 * 月系ページの lastModified。
 * - 「直近の過去のその月1日」を返す（未来日付を出さない）
 * - INDEX_POLICY_DATE を下限にクランプ（旧 noindex のまま Google 側に残るページへ再クロールシグナルを立てる）
 * - 値が動くのは「その月が到来した瞬間」の年1回のみで、ビルド間では安定
 *   （毎ビルド更新される lastmod は Google が lastmod 自体を不信化するため避ける）
 */
export function monthLastModified(monthNum: number, buildDate: Date): Date {
  const year = buildDate.getUTCFullYear();
  const thisYear = new Date(Date.UTC(year, monthNum - 1, 1));
  const mostRecentPast =
    thisYear.getTime() <= buildDate.getTime()
      ? thisYear
      : new Date(Date.UTC(year - 1, monthNum - 1, 1));
  return mostRecentPast.getTime() < INDEX_POLICY_DATE.getTime()
    ? INDEX_POLICY_DATE
    : mostRecentPast;
}
