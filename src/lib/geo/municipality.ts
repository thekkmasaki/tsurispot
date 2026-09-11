/**
 * 住所文字列から市区町村（基礎自治体）名を抽出する。
 *
 * エリアページ（/area/[slug]）が region.id 完全一致でスポットを拾い、
 * 同じ市区町村が「伊根 / 伊根・宮津 / 伊根・経ヶ岬」等に分割されて
 * 各ページ数件ずつしか載らない（=「おすすめ3選」）問題を解くため、
 * スポットを市区町村単位でまとめ直す土台に使う。
 *
 * 政令指定都市は市単位に統合（「横浜市中区」→「横浜市」）、
 * 東京23区は区が基礎自治体なので区単位（「江東区」）、
 * 郡は基礎自治体でないため除去（「与謝郡伊根町」→「伊根町」）する。
 */

/**
 * @param address 例「〒626-0424 京都府伊根町亀島450」「京都府与謝郡伊根町本庄浜」
 * @param prefecture region.prefecture（例「京都府」）
 * @returns 市区町村名（例「伊根町」）。抽出できなければ null
 */
export function extractMunicipality(address: string, prefecture: string): string | null {
  if (!address) return null;
  // 郵便番号を除去
  let s = address.replace(/〒?\s*\d{3}-?\d{4}/, "").trim();
  // 先頭の都道府県を除去
  if (prefecture && s.startsWith(prefecture)) s = s.slice(prefecture.length);
  else s = s.replace(/^.{2,3}[都道府県]/, ""); // prefが一致しない場合の保険
  // 郡を除去（後ろに町村が続くもののみ。「郡上市」を誤除去しない）
  s = s.replace(/^.{1,4}?郡(?=.+?[町村])/, "");
  // 先頭から最初の「市/区/町/村」までを基礎自治体名とする（非貪欲＝政令市は市で止まる）
  const m = s.match(/^(.+?[市区町村])/);
  return m ? m[1] : null;
}
