/**
 * スポット詳細レイアウトのA/Bテスト（ページ単位の分割テスト）
 *
 * 新レイアウト（B）: 概要（基本情報・設備）を上に寄せ、要点チップをヘッダーに置く。
 * 広告の数と順番は変えず、どの広告も control より下に動かないことを前提にしている
 * （広告より上で足した分は、同じ広告より上で削る分で必ず相殺する）。
 *
 * ユーザー単位ではなく slug 単位で振り分ける理由:
 * - ISR/Cloudflare の HTML キャッシュを壊さない（Cookie で出し分けると全キャッシュが割れる）
 * - クライアント側で後から差し替えると CLS と広告枠の位置ずれが起きる
 * - GA4 の pagePath 正規表現だけで両群を集計できる（カスタムディメンション登録不要）
 *
 * 振り分け: slug の文字数が偶数 → B（新）、奇数 → A（現行）。
 * 2026-11 時点の sitemap で偶数 2,734件 / 奇数 2,615件。地域・内容とは無相関。
 * 群ごとの元々の差は「導入前後の変化率の差（差分の差）」で打ち消して評価する。
 */

/** GA4 で B 群（新レイアウト）を絞り込む pagePath 正規表現（RE2）。 */
export const SPOT_LAYOUT_B_PATH_REGEX = "^/spots/([^/]{2})+$";
/** GA4 で A 群（現行レイアウト）を絞り込む pagePath 正規表現（RE2）。 */
export const SPOT_LAYOUT_A_PATH_REGEX = "^/spots/[^/]([^/]{2})*$";

/** 実験の停止スイッチ。false にすると全スポットが現行レイアウトに戻る。 */
const SPOT_LAYOUT_AB_ENABLED = true;

export function isSpotLayoutB(slug: string): boolean {
  return SPOT_LAYOUT_AB_ENABLED && slug.length % 2 === 0;
}
