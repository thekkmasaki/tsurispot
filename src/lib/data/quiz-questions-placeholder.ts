/**
 * クイズ問題データ（プレースホルダー）
 * エージェントが完成版を quiz-questions.ts に書き込むまでの仮ファイル
 */
import type { QuizQuestion } from "@/types/quiz";

export const allQuizQuestions: QuizQuestion[] = [
  {
    id: "fish-001",
    category: "fish-knowledge",
    difficulty: "beginner",
    question: "メバルの「メバル」という名前の由来は？",
    choices: [
      "目が大きく張り出している「目張」から",
      "春に群れて泳ぐ「群れ張る」から",
      "海面すれすれを泳ぐ「目端」から",
      "漁獲量が多い「恵張る」から",
    ],
    correctIndex: 0,
    explanation:
      "メバルは大きな目が特徴的な根魚で、「目が張っている」ことから「目張（メバル）」と名付けられました。夜行性で、暗い海中でも大きな目で獲物を見つけます。",
    relatedLinks: [{ label: "メバルの詳細", href: "/fish/mebaru" }],
  },
  {
    id: "danger-001",
    category: "danger-fish",
    difficulty: "beginner",
    question: "ゴンズイに刺された場合の正しい応急処置は？",
    choices: [
      "冷水で冷やす",
      "患部を吸う",
      "40〜45℃のお湯に浸ける",
      "アルコール消毒する",
    ],
    correctIndex: 2,
    explanation:
      "ゴンズイの毒はタンパク毒で熱に弱い性質があります。40〜45℃のお湯に30分以上浸けると毒が不活性化し、痛みが和らぎます。冷水は逆効果です。",
    relatedLinks: [{ label: "毒魚の対処法", href: "/safety" }],
  },
];

export function getQuestionsByCategory(category: string): QuizQuestion[] {
  return allQuizQuestions.filter((q) => q.category === category);
}

export function getQuestions(
  category: string,
  difficulty?: string,
  count: number = 10
): QuizQuestion[] {
  let questions = getQuestionsByCategory(category);
  if (difficulty) {
    questions = questions.filter((q) => q.difficulty === difficulty);
  }
  return shuffleArray(questions).slice(0, count);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
