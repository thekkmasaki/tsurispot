/**
 * クイズ問題データ（240問）
 * Part1: fish-knowledge(50), seasonal-fish(30), fishing-methods(30), spot-detective(30)
 * Part2: danger-fish(20), glossary(30), rules-manners(20), local(30)
 */
import type { QuizQuestion, QuizCategory, QuizDifficulty } from "@/types/quiz";
import { quizQuestionsPart1 } from "./quiz-questions-part1";
import { quizQuestionsPart2 } from "./quiz-questions-part2";

/** 全クイズ問題（240問） */
export const allQuizQuestions: QuizQuestion[] = [
  ...quizQuestionsPart1,
  ...quizQuestionsPart2,
];

/** カテゴリで絞り込み */
export function getQuestionsByCategory(
  category: QuizCategory | string
): QuizQuestion[] {
  return allQuizQuestions.filter((q) => q.category === category);
}

/** カテゴリ・難易度で絞り込んでシャッフル */
export function getQuestions(
  category: QuizCategory | string,
  difficulty?: QuizDifficulty | string,
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
