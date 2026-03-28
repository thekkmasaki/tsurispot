// NGワードリスト（暴言・差別語・性的表現）
const NG_WORDS = [
  // 暴言・侮辱
  "死ね", "殺す", "殺してやる", "ころす", "しね",
  "バカ", "ばか", "馬鹿", "アホ", "あほ", "クソ", "くそ", "糞",
  "キモい", "きもい", "キモ", "うざい", "ウザい",
  "ゴミ", "カス", "ボケ", "ぼけ",
  // 差別語
  "ガイジ", "がいじ", "障害者", "池沼", "知障",
  "チョン", "シナ", "ニガー",
  // 性的表現
  "セックス", "エロ", "ちんこ", "まんこ", "おっぱい",
  "ポルノ", "AV女優", "風俗",
  // 詐欺・犯罪
  "出会い系", "援助交際", "パパ活", "ママ活",
  "覚醒剤", "大麻", "麻薬", "ドラッグ",
];

// スパムパターン（URL/メアド/電話番号）
const SPAM_PATTERNS = [
  /https?:\/\/\S+/i,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  /0[0-9]{1,4}-?[0-9]{1,4}-?[0-9]{3,4}/,
  /\d{3}-\d{4}-\d{4}/, // 携帯番号
  /LINE|ライン|らいん/i,
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
