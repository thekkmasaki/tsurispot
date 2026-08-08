import { ListSpot } from "@/types";

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
  for (const target of targets) {
    if (!target) continue;
    const nt = normalizeForSearch(target);
    // 双方向: "伊根町"で"伊根"を検索 or "伊根"で"伊根町"を検索 どちらもOK
    if (nt.includes(nq) || nq.includes(nt)) return true;
  }
  // クエリが複数語の場合（スペース区切り）すべて含まれるかチェック
  const words = nq.split(/\s+/).filter(Boolean);
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
  // 複数語クエリ（「千葉 サビキ」等）は従来どおり全フィールド結合で全語一致を判定
  const words = nq.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const combined = [spot.name, spot.region.areaName, spot.region.prefecture, spot.address || ""]
      .map(normalizeForSearch)
      .join(" ");
    return words.every((w) => combined.includes(w));
  }
  return false;
}
