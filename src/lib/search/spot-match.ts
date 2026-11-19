import { ListSpot } from "@/types";
import { terrainMatchesWord } from "@/lib/depth-terrain";

// カタカナ → ひらがな変換
export function katakanaToHiragana(str: string): string {
  return str.replace(/[ァ-ヶ]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

// 検索用正規化（小文字+ひらがな統一）
export function normalizeForSearch(str: string): string {
  return katakanaToHiragana(str).toLowerCase();
}

// あいまい検索：双方向部分一致 + かな正規化
export function fuzzyMatch(query: string, ...targets: string[]): boolean {
  const nq = normalizeForSearch(query);
  const words = nq.split(/\s+/).filter(Boolean);
  for (const target of targets) {
    if (!target) continue;
    const nt = normalizeForSearch(target);
    // 双方向: "伊根町"で"伊根"を検索 or "伊根"で"伊根町"を検索 どちらもOK。
    // ただし逆方向（クエリが対象を含む）は1語のときだけ。複数語で許すと
    // 「明石 タチウオ」がエリア名「明石」だけで明石の全スポットに一致してしまう。
    if (nt.includes(nq) || (words.length <= 1 && nq.includes(nt))) return true;
  }
  // クエリが複数語の場合（スペース区切り）すべて含まれるかチェック
  if (words.length > 1) {
    const combined = targets.filter(Boolean).map(normalizeForSearch).join(" ");
    return words.every((w) => combined.includes(w));
  }
  return false;
}

// スポットのテキスト検索一致。
// 名前・エリア名は曖昧一致のままだが、県名は「前方一致」、住所は「県名部分を除いた上で部分一致」。
// 県名・住所を素の部分一致にすると「京都」が「東京都」とその住所に一致し、
// 京都府の検索結果が東京都のスポットで埋まる(2026-07-20実バグ)。
// 前方一致なら「京都」→京都府のみ、「東京」→東京都のみ、「京都府」もそのまま拾える。
// 住所は県名を除去することで「江東区」等の市区町村検索を維持しつつ県名誤ヒットを防ぐ。
export function spotSearchMatch(query: string, spot: ListSpot): boolean {
  if (fuzzyMatch(query, spot.name, spot.region.areaName)) return true;
  const nq = normalizeForSearch(query);
  if (normalizeForSearch(spot.region.prefecture).startsWith(nq)) return true;
  if (spot.address) {
    const addrWithoutPref = normalizeForSearch(spot.address.replace(spot.region.prefecture, ""));
    if (addrWithoutPref.includes(nq)) return true;
  }
  // 地形（水深）: 「深場」「ドン深」「遠浅」等で地形タイプに当てる
  if (spot.depthTerrain && terrainMatchesWord(spot.depthTerrain, nq.trim())) return true;
  // 魚名・釣法（「タチウオ」「サビキ」）。以前は名前・エリア・住所しか見ず、
  // 魚図鑑で324件あるタチウオが一覧検索では0件だった（2026-11 監査）。1文字は誤一致が多いので2文字以上。
  const single = nq.trim();
  if (single.length >= 2 && !/\s/.test(single)) {
    if (spot.fishNames.some((f) => normalizeForSearch(f).includes(single))) return true;
    if (spot.methods.some((m) => normalizeForSearch(m).includes(single))) return true;
  }
  // 複数語クエリ（「千葉 サビキ」「千葉 深場」「明石 タチウオ」等）は全フィールド結合で全語一致を判定
  const words = nq.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const combined = [
      spot.name,
      spot.region.areaName,
      spot.region.prefecture,
      spot.address || "",
      ...spot.fishNames,
      ...spot.methods,
    ]
      .map(normalizeForSearch)
      .join(" ");
    const terrain = spot.depthTerrain;
    return words.every((w) => combined.includes(w) || (terrain !== undefined && terrainMatchesWord(terrain, w)));
  }
  return false;
}
