// NGワードリスト（暴言・差別語・性的表現）
// 注意: 釣りコンテキストで誤検出しやすい語は除外
//   - 「ゴミ」→「ゴミが多い」等の現場報告で使う
//   - 「カス」→「カスミアジ」等の魚名・「カスが残る」等
//   - 「ボケ」「ぼけ」→「ボケ（ボケジャコ）」は釣り餌の名前
//   - 「障害者」→「障害者用トイレあり」等のバリアフリー情報
//   - 「ライン」→ 釣り糸のことを「ライン」と呼ぶ
const NG_WORDS = [
  // 暴言・侮辱
  "死ね", "殺す", "殺してやる", "ころす", "しね",
  "バカ", "ばか", "馬鹿", "アホ", "あほ", "クソ", "くそ", "糞",
  "キモい", "きもい", "うざい", "ウザい",
  // 差別語
  "ガイジ", "がいじ", "池沼", "知障",
  "チョン", "シナ人", "ニガー",
  // 性的表現
  "セックス", "ちんこ", "まんこ", "おっぱい",
  "ポルノ", "AV女優", "風俗",
  // 詐欺・犯罪
  "出会い系", "援助交際", "パパ活", "ママ活",
  "覚醒剤", "大麻", "麻薬", "ドラッグ",
];

// スパムパターン（URL/メアド/電話番号）
// 注意: 「LINE」「ライン」は釣り糸の意味で頻出するため単体ではNG対象外
const SPAM_PATTERNS = [
  /https?:\/\/\S+/i,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  /0[0-9]{1,4}-?[0-9]{1,4}-?[0-9]{3,4}/,
  /\d{3}-\d{4}-\d{4}/, // 携帯番号
  /LINE\s*(ID|交換|追加|教え)/i, // LINE ID交換の勧誘のみ検出
];

// 連続同一文字（5文字以上の繰り返し = 荒らし）
const REPEAT_PATTERN = /(.)\1{4,}/;

export interface ModerationTextResult {
  ok: boolean;
  reason?: string;
}

/**
 * テキスト配列をNGワード・スパムチェック
 */
export function checkNgWords(texts: string[]): ModerationTextResult {
  const combined = texts.join(" ");

  // NGワードチェック
  for (const word of NG_WORDS) {
    if (combined.includes(word)) {
      return { ok: false, reason: "不適切な表現が含まれています" };
    }
  }

  // スパムパターンチェック
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(combined)) {
      return { ok: false, reason: "URLやメールアドレス、電話番号は投稿できません" };
    }
  }

  // 連続同一文字チェック
  if (REPEAT_PATTERN.test(combined)) {
    return { ok: false, reason: "不適切な投稿パターンが検出されました" };
  }

  return { ok: true };
}
