/**
 * クイズ機能の型定義
 */

/** クイズカテゴリのスラッグ */
export type QuizCategory =
  | "fish-knowledge"
  | "seasonal-fish"
  | "fishing-methods"
  | "spot-detective"
  | "danger-fish"
  | "glossary"
  | "rules-manners"
  | "local";

/** 難易度 */
export type QuizDifficulty = "beginner" | "intermediate" | "advanced";

/** クイズ1問のデータ */
export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  difficulty: QuizDifficulty;
  question: string;
  /** 4択の選択肢 */
  choices: string[];
  /** 正解のインデックス (0-3) */
  correctIndex: number;
  /** 正解後に表示する解説 */
  explanation: string;
  /** 関連ページへのリンク */
  relatedLinks?: { label: string; href: string }[];
  /** 問題に使う画像（魚の写真等） */
  imageUrl?: string;
}

/** カテゴリのメタデータ */
export interface QuizCategoryMeta {
  slug: QuizCategory;
  name: string;
  nameShort: string;
  description: string;
  icon: string;
  color: string;
  questionCount: number;
}

/** ユーザーの回答記録 */
export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

/** クイズの結果 */
export interface QuizResult {
  category: QuizCategory;
  difficulty: QuizDifficulty;
  score: number;
  total: number;
  title: string;
  answers: QuizAnswer[];
}

/** スコアに応じた称号 */
export const QUIZ_TITLES: Record<string, { min: number; title: string; emoji: string; message: string }[]> = {
  default: [
    { min: 10, title: "釣りの神", emoji: "👑", message: "パーフェクト！あなたは釣りの神です！" },
    { min: 8, title: "釣りマスター", emoji: "🏆", message: "素晴らしい！かなりの釣り通ですね！" },
    { min: 6, title: "釣り中級者", emoji: "🎣", message: "なかなかの知識です！もう少しで上級者！" },
    { min: 4, title: "釣り初心者", emoji: "🐟", message: "まだまだ伸びしろあり！ガイドで学ぼう！" },
    { min: 0, title: "釣りビギナー", emoji: "🌊", message: "これから一緒に釣りを学びましょう！" },
  ],
};

/** カテゴリメタデータ一覧 */
export const QUIZ_CATEGORIES: QuizCategoryMeta[] = [
  {
    slug: "fish-knowledge",
    name: "魚種図鑑クイズ",
    nameShort: "魚図鑑",
    description: "写真や特徴から魚の名前を当てよう！115種以上の魚種データベースから出題",
    icon: "🐟",
    color: "blue",
    questionCount: 50,
  },
  {
    slug: "seasonal-fish",
    name: "旬の魚クイズ",
    nameShort: "旬の魚",
    description: "今月釣れる魚は？季節と魚の関係をマスターしよう",
    icon: "📅",
    color: "green",
    questionCount: 30,
  },
  {
    slug: "fishing-methods",
    name: "釣り方マスタークイズ",
    nameShort: "釣り方",
    description: "サビキ、エギング、ルアー…釣り方の知識を試そう",
    icon: "🎯",
    color: "orange",
    questionCount: 30,
  },
  {
    slug: "spot-detective",
    name: "スポット探偵クイズ",
    nameShort: "スポット",
    description: "説明文や特徴からどの釣り場か当てよう！全国2,141スポットから出題",
    icon: "🗺️",
    color: "purple",
    questionCount: 30,
  },
  {
    slug: "danger-fish",
    name: "毒魚・危険生物クイズ",
    nameShort: "毒魚",
    description: "釣り人の安全を守る！危険な魚の見分け方と対処法",
    icon: "☠️",
    color: "red",
    questionCount: 20,
  },
  {
    slug: "glossary",
    name: "釣り用語クイズ",
    nameShort: "用語",
    description: "マヅメ、シャクリ、ドラグ…釣り用語の意味わかる？",
    icon: "📖",
    color: "teal",
    questionCount: 30,
  },
  {
    slug: "rules-manners",
    name: "釣りルール・マナークイズ",
    nameShort: "ルール",
    description: "知らないと恥ずかしい！釣り場のルールとマナー",
    icon: "📋",
    color: "yellow",
    questionCount: 20,
  },
  {
    slug: "local",
    name: "ご当地釣りクイズ",
    nameShort: "ご当地",
    description: "明石、東京湾、福岡…各地の釣り文化に詳しい？",
    icon: "📍",
    color: "pink",
    questionCount: 30,
  },
];
