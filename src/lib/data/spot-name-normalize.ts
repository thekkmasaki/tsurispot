// スポット名の表記ゆれを吸収する名寄せ正規化。
// scripts/dedup-batch1-analyze.mjs の normalize() を src 側へ移植したもの。
// deduplicateSpots（spots.ts）が「本牧海づり施設 / 横浜本牧海づり施設 /
// 横浜・本牧海づり施設」のような同一地物の別表記を統合するために使う。
// 注意: spots.ts は next.config.ts から import されるため、このファイルも
// @/ エイリアスではなく相対パスで参照される前提で依存を持たない。

const VARIANTS: [RegExp, string][] = [
  [/﨑/g, "崎"],
  [/嶋/g, "島"],
  [/濱/g, "浜"],
  [/廣/g, "広"],
  [/條/g, "条"],
];

export function normalizeSpotName(raw: string): string {
  let n = raw.normalize("NFKC");
  // 区切り記号・括弧・空白の差を無視（「横浜・本牧」→「横浜本牧」）
  n = n.replace(/[・、,，\s()（）「」'’]/g, "");
  for (const [re, to] of VARIANTS) n = n.replace(re, to);
  // 「海釣り施設 / 海づり施設」の送りゆれを吸収
  n = n.replace(/釣り/g, "つり").replace(/づり/g, "つり");
  // 生成データ由来の「（詳細）」接尾辞
  n = n.replace(/詳細$/, "");
  return n;
}

/**
 * 2つのスポット名が同一地物の表記ゆれとみなせるか。
 * - 正規化後に完全一致（海づり/海釣り・中黒・異体字の差）
 * - 一方が他方の末尾一致で、差分が先頭の地名プレフィックスのみ
 *   （「横浜本牧海つり施設」と「本牧海つり施設」）。誤結合を避けるため
 *   短い方が5文字以上・プレフィックスは4文字以内に限る。
 * 「〜跡護岸」のような接尾辞差（別地物）は末尾一致にならないため結合されない。
 */
export function isSameSpotName(a: string, b: string): boolean {
  const na = normalizeSpotName(a);
  const nb = normalizeSpotName(b);
  if (na === nb) return true;
  const [shorter, longer] = na.length <= nb.length ? [na, nb] : [nb, na];
  if (shorter.length < 5) return false;
  if (longer.length - shorter.length > 4) return false;
  return longer.endsWith(shorter);
}
