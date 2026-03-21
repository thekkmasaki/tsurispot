"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { QuizQuestion, QuizAnswer, QuizResult } from "@/types/quiz";
import { QUIZ_TITLES } from "@/types/quiz";

type Phase = "start" | "question" | "feedback" | "result";

interface QuizGameProps {
  questions: QuizQuestion[];
  categoryName: string;
  categoryIcon: string;
}

/** スコアに応じた称号を取得 */
function getTitle(score: number): { title: string; emoji: string; message: string } {
  const titles = QUIZ_TITLES.default;
  for (const t of titles) {
    if (score >= t.min) return t;
  }
  return titles[titles.length - 1];
}

/** シェア用テキストを生成 */
function buildShareText(
  categoryName: string,
  score: number,
  total: number,
  title: string
): string {
  return `ツリスポの${categoryName}で${score}/${total}問正解！称号:${title} #ツリスポ #釣りクイズ`;
}

/** カウントアップアニメーション用フック */
function useCountUp(target: number, duration: number, active: boolean): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) {
      setCount(0);
      return;
    }
    if (target === 0) {
      setCount(0);
      return;
    }

    let start: number | null = null;
    let rafId: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, active]);

  return count;
}

export function QuizGame({ questions, categoryName, categoryIcon }: QuizGameProps) {
  const [phase, setPhase] = useState<Phase>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [slideDirection, setSlideDirection] = useState<"enter" | "none">("none");
  const questionRef = useRef<HTMLDivElement>(null);

  const total = questions.length;
  const currentQuestion = questions[currentIndex] ?? null;

  // 結果計算
  const score = answers.filter((a) => a.isCorrect).length;
  const titleInfo = getTitle(score);
  const animatedScore = useCountUp(score, 800, phase === "result");

  // 結果オブジェクト
  const result: QuizResult | null =
    phase === "result" && currentQuestion
      ? {
          category: questions[0].category,
          difficulty: questions[0].difficulty,
          score,
          total,
          title: titleInfo.title,
          answers,
        }
      : null;

  /** スタート */
  const handleStart = useCallback(() => {
    setPhase("question");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setSlideDirection("enter");
  }, []);

  /** 選択肢を選ぶ */
  const handleSelect = useCallback(
    (idx: number) => {
      if (selectedIndex !== null || !currentQuestion) return;
      setSelectedIndex(idx);
      const isCorrect = idx === currentQuestion.correctIndex;
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          selectedIndex: idx,
          isCorrect,
        },
      ]);
      // 少し待ってからフィードバックに切り替え
      setTimeout(() => setPhase("feedback"), 300);
    },
    [selectedIndex, currentQuestion]
  );

  /** 次の問題へ */
  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setPhase("result");
    } else {
      setSelectedIndex(null);
      setSlideDirection("enter");
      setCurrentIndex((prev) => prev + 1);
      setPhase("question");
      // スクロールを上に戻す
      questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentIndex, total]);

  /** リトライ */
  const handleRetry = useCallback(() => {
    setPhase("start");
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setSlideDirection("none");
  }, []);

  // スライドアニメーションのリセット
  useEffect(() => {
    if (slideDirection === "enter") {
      const timer = setTimeout(() => setSlideDirection("none"), 350);
      return () => clearTimeout(timer);
    }
  }, [slideDirection, currentIndex]);

  // キーボード操作（1-4キーで選択肢、Enterで次へ）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === "question" && selectedIndex === null) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4 && currentQuestion && num <= currentQuestion.choices.length) {
          handleSelect(num - 1);
        }
      }
      if (phase === "feedback" && e.key === "Enter") {
        handleNext();
      }
      if (phase === "start" && e.key === "Enter") {
        handleStart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, selectedIndex, currentQuestion, handleSelect, handleNext, handleStart]);

  // --- スタート画面 ---
  if (phase === "start") {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl" role="img" aria-label={categoryName}>
            {categoryIcon}
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">{categoryName}</h2>
          <div className="mb-6 space-y-1 text-slate-600">
            <p>
              全<span className="font-semibold text-sky-600">{total}</span>問に挑戦！
            </p>
            <p className="text-sm">制限時間なし</p>
          </div>
          <Button
            onClick={handleStart}
            className="min-h-[48px] w-full text-lg font-bold"
            size="lg"
            aria-label={`${categoryName}をスタート`}
          >
            スタート 🎣
          </Button>
        </div>
      </div>
    );
  }

  // --- 問題画面 ---
  if (phase === "question" && currentQuestion) {
    const progress = ((currentIndex) / total) * 100;
    const choiceLabels = ["A", "B", "C", "D"];

    return (
      <div ref={questionRef} className="mx-auto max-w-lg px-4 py-8">
        <div
          className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ${
            slideDirection === "enter"
              ? "translate-x-4 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          {/* ヘッダー: 問題番号 + プログレス */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                問題 {currentIndex + 1} / {total}
              </span>
              <span className="text-sm text-slate-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`進捗 ${Math.round(progress)}%`}
            >
              <div
                className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 問題画像（あれば） */}
          {currentQuestion.imageUrl && (
            <div className="mb-4 overflow-hidden rounded-xl">
              <img
                src={currentQuestion.imageUrl}
                alt="問題の画像"
                className="h-48 w-full object-cover"
                loading="eager"
              />
            </div>
          )}

          {/* 問題文 */}
          <div className="mb-6">
            <p className="text-lg font-bold leading-relaxed text-slate-900">
              <span className="mr-1 text-sky-500">Q.</span>
              {currentQuestion.question}
            </p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3">
            {currentQuestion.choices.map((choice, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selectedIndex !== null}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-sky-500 bg-sky-100"
                      : "border-slate-200 bg-white hover:scale-[1.02] hover:border-sky-300 hover:bg-sky-50"
                  } disabled:cursor-default`}
                  aria-label={`選択肢${choiceLabels[idx]}: ${choice}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isSelected
                        ? "bg-sky-500 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {choiceLabels[idx]}
                  </span>
                  <span className="text-sm font-medium text-slate-800">
                    {choice}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- フィードバック画面 ---
  if (phase === "feedback" && currentQuestion) {
    const lastAnswer = answers[answers.length - 1];
    const isCorrect = lastAnswer?.isCorrect ?? false;
    const correctChoice = currentQuestion.choices[currentQuestion.correctIndex];
    const choiceLabels = ["A", "B", "C", "D"];

    return (
      <div ref={questionRef} className="mx-auto max-w-lg px-4 py-8">
        <div className="space-y-4">
          {/* 正解/不正解バナー */}
          <div
            className={`rounded-2xl border-2 p-6 text-center transition-opacity duration-500 ${
              isCorrect
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <div className="mb-2 text-4xl">
              {isCorrect ? "⭕" : "❌"}
            </div>
            <p
              className={`text-xl font-bold ${
                isCorrect ? "text-green-700" : "text-red-700"
              }`}
            >
              {isCorrect ? "正解！" : "不正解…"}
            </p>
          </div>

          {/* 選択肢の振り返り */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* 問題文 */}
            <p className="mb-4 text-sm font-bold text-slate-900">
              <span className="mr-1 text-sky-500">Q.</span>
              {currentQuestion.question}
            </p>

            {/* 全選択肢を表示（正解=緑、選んだ不正解=赤） */}
            <div className="mb-4 space-y-2">
              {currentQuestion.choices.map((choice, idx) => {
                const isCorrectChoice = idx === currentQuestion.correctIndex;
                const isUserChoice = idx === lastAnswer?.selectedIndex;
                let borderColor = "border-slate-200 bg-white";
                if (isCorrectChoice) {
                  borderColor = "border-green-500 bg-green-50";
                } else if (isUserChoice && !isCorrect) {
                  borderColor = "border-red-500 bg-red-50";
                }

                return (
                  <div
                    key={idx}
                    className={`flex min-h-[40px] items-center gap-3 rounded-xl border-2 px-4 py-2 ${borderColor}`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrectChoice
                          ? "bg-green-500 text-white"
                          : isUserChoice && !isCorrect
                          ? "bg-red-500 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {choiceLabels[idx]}
                    </span>
                    <span
                      className={`text-sm ${
                        isCorrectChoice
                          ? "font-bold text-green-700"
                          : isUserChoice && !isCorrect
                          ? "font-medium text-red-700"
                          : "text-slate-600"
                      }`}
                    >
                      {choice}
                    </span>
                    {isCorrectChoice && (
                      <span className="ml-auto text-xs font-medium text-green-600">
                        正解
                      </span>
                    )}
                    {isUserChoice && !isCorrect && (
                      <span className="ml-auto text-xs font-medium text-red-600">
                        あなたの回答
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 解説 */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="mb-1 text-sm font-bold text-slate-700">
                📖 解説
              </p>
              <p className="text-sm leading-relaxed text-slate-600">
                {currentQuestion.explanation}
              </p>
            </div>

            {/* 関連リンク */}
            {currentQuestion.relatedLinks && currentQuestion.relatedLinks.length > 0 && (
              <div className="mt-4 space-y-1">
                {currentQuestion.relatedLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-800 hover:underline"
                  >
                    <span>🔗</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 次へボタン */}
          <Button
            onClick={handleNext}
            className="min-h-[48px] w-full text-base font-bold"
            size="lg"
            aria-label={
              currentIndex + 1 >= total ? "結果を見る" : "次の問題へ"
            }
          >
            {currentIndex + 1 >= total ? "結果を見る 📊" : "次の問題 →"}
          </Button>
        </div>
      </div>
    );
  }

  // --- 結果画面 ---
  if (phase === "result") {
    const shareText = buildShareText(categoryName, score, total, titleInfo.title);
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="space-y-4">
          {/* スコア表示 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-2 text-4xl">🏆</div>
            <h2 className="mb-6 text-xl font-bold text-slate-900">結果発表</h2>

            <div className="mb-4">
              <span className="text-6xl font-extrabold text-sky-600">
                {animatedScore}
              </span>
              <span className="text-2xl text-slate-400"> / {total}</span>
              <p className="mt-1 text-sm text-slate-500">正解</p>
            </div>

            <div className="mb-2">
              <span className="text-3xl">{titleInfo.emoji}</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              称号: {titleInfo.title}
            </p>
            <p className="mt-1 text-sm text-slate-600">{titleInfo.message}</p>
          </div>

          {/* 回答の振り返り */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
              <span>📊</span> 回答の振り返り
            </h3>
            <div className="space-y-2">
              {answers.map((answer, idx) => {
                const q = questions[idx];
                return (
                  <div
                    key={answer.questionId}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
                      answer.isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 text-base">
                      {answer.isCorrect ? "⭕" : "❌"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        Q{idx + 1}. {q.question}
                      </p>
                      {!answer.isCorrect && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          正解: {q.choices[q.correctIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* シェアボタン */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 text-center text-sm font-bold text-slate-700">
              結果をシェアしよう
            </h3>
            <div className="flex gap-3">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
                aria-label="Xで結果をシェア"
              >
                <span className="text-base">𝕏</span>
                <span>シェア</span>
              </a>
              <a
                href={lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#06C755] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
                aria-label="LINEで結果を送る"
              >
                <span>LINE</span>
                <span>で送る</span>
              </a>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="min-h-[48px] flex-1 text-base font-bold"
              size="lg"
              aria-label="もう一度挑戦する"
            >
              もう一度挑戦 🔄
            </Button>
            <Button
              asChild
              className="min-h-[48px] flex-1 text-base font-bold"
              size="lg"
            >
              <Link href="/quiz" aria-label="他のクイズを見る">
                他のクイズ ←
              </Link>
            </Button>
          </div>

          {/* おすすめガイド */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
              <span>📚</span> おすすめガイド
            </h3>
            <div className="space-y-2">
              <Link
                href="/guides/sabiki"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-800"
              >
                <span>🎣</span>
                <span>サビキ釣り入門ガイド</span>
              </Link>
              <Link
                href="/fish"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-800"
              >
                <span>🐟</span>
                <span>魚図鑑を見る</span>
              </Link>
              <Link
                href="/guides/equipment"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sky-600 transition-colors hover:bg-sky-50 hover:text-sky-800"
              >
                <span>🎒</span>
                <span>釣り装備ガイド</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // フォールバック
  return null;
}
