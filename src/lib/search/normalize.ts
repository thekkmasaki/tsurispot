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
