// sitemap の月系ページ（県×月×魚種マトリクス・県×月・月×地域・釣り方×月）の lastModified 算出。
//
// 旧実装は「ビルド年のその月1日」固定だったため2つの問題があった:
//   1. 過去月ページは lastmod が Googlebot の最終クロールより古くなり「変更なし」と
//      判定され続け、#157/#179 の noindex→index 転換が再クロールされず伝わらない
//   2. 未来月ページ（例: 7月ビルドの december）は未来日付になり Google に無視される

/** robots 方針が noindex→index,follow に転換した日（#157/#179、2026-06-23 本番反映）。
 *  この日以降に Googlebot が再クロールしたページは index 転換が確認済み。 */
export const INDEX_POLICY_DATE = new Date(Date.UTC(2026, 5, 23));

/** 直近のテンプレ内容改訂日（2026-07-31）。
 *  6/23の robots 方針転換(INDEX_POLICY_DATE)以降も、全マトリクス/月系ページに実コンテンツ
 *  改善（meta description 一意化・内部リンク動脈 #280 等）が入っていたが、lastmod が 6/23 で
 *  固着していたため「その後また変わった」という新鮮な再クロール信号が Google に途絶えていた。
 *  2026-07-30 の GSC サンプル実測で、6/23 より前にクロールされた旧 noindex マトリクスが
 *  再クロールされずに滞留（＝再クロールされれば転換率ほぼ100%）していることを確認したため、
 *  実際に内容が改訂された事実に基づき lastmod の下限を一度だけ前進させる。
 *  ※ 毎ビルドでは動かさない（Google が lastmod を不信化する）。実際にテンプレ内容を
 *    改善したデプロイの時だけ、この定数を更新すること。 */
export const CONTENT_REVISION_DATE = new Date(Date.UTC(2026, 6, 31));

/**
 * 月系ページの lastModified。
 * - 「直近の過去のその月1日」を返す（未来日付を出さない）
 * - 「既に到来した」方針/改訂日（INDEX_POLICY_DATE / CONTENT_REVISION_DATE）のうち最新を下限に
 *   クランプ（旧 noindex のまま Google 側に残るページへ再クロールシグナルを立てる）
 * - 未到来の日付は下限にしない → 未来日付を絶対に返さない
 * - 値が動くのは「その月 or 改訂日が到来した瞬間」のみで、ビルド間では安定
 *   （毎ビルド更新される lastmod は Google が lastmod 自体を不信化するため避ける）
 */
export function monthLastModified(monthNum: number, buildDate: Date): Date {
  const year = buildDate.getUTCFullYear();
  const thisYear = new Date(Date.UTC(year, monthNum - 1, 1));
  const mostRecentPast =
    thisYear.getTime() <= buildDate.getTime()
      ? thisYear
      : new Date(Date.UTC(year - 1, monthNum - 1, 1));
  // 既に到来した方針/改訂日のうち最も新しいものを下限にする。
  // まだ到来していない日付（未来の改訂日）は floor にしない＝未来 lastmod を出さない。
  const floor = [INDEX_POLICY_DATE, CONTENT_REVISION_DATE]
    .map((d) => d.getTime())
    .filter((t) => t <= buildDate.getTime())
    .reduce((max, t) => (t > max ? t : max), 0);
  return mostRecentPast.getTime() < floor
    ? new Date(floor)
    : mostRecentPast;
}
