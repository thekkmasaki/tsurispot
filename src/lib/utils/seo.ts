/**
 * SEO 用ユーティリティ。
 *
 * description を文字数制限する際、`slice(0, n)` で文字単位に切ると
 * 「...初心者でも入れ食いが楽し」のように途中で切れて、SERPでも違和感が出る。
 * 句点（。）または英文ピリオド（.）境界で切ることで自然な締まり方になる。
 */

/** description の最大長（半角換算 158 で SERP 切り詰めの安全圏）。 */
export const DESCRIPTION_MAX = 158;

/**
 * 文字列を句点境界で安全にトリム。
 * - max 以下ならそのまま返す
 * - max を超える場合、max までの中で最後の「。」または「.」位置で切る
 * - 句点が見つからない／早すぎる位置（max の半分以下）の場合のみ「…」付き末尾切り
 */
export function trimDescription(text: string, max = DESCRIPTION_MAX): string {
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastFullStop = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("."));
  if (lastFullStop > Math.floor(max / 2)) {
    return cut.slice(0, lastFullStop + 1);
  }
  return cut + "…";
}
