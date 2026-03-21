"use client";

import { useState, useCallback, useMemo, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ExamQuizQuestion {
  id: string;
  question: string;
  choices: [string, string, string, string];
  correctIndex: number; // 0-3
  explanation: string;
  choiceExplanations?: [string, string, string, string];
}

export interface ExamQuizProps {
  questions: ExamQuizQuestion[];
  showNumbers?: boolean;
  startNumber?: number;
  /** "one" = 1問ずつ表示（デフォルト）, "all" = 全問一覧表示 */
  mode?: "all" | "one";
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LABELS = ["A", "B", "C", "D"] as const;

/* ------------------------------------------------------------------ */
/*  Live Score Board (常時表示)                                         */
/* ------------------------------------------------------------------ */

function LiveScoreBoard({
  current,
  total,
  correctCount,
  wrongCount,
}: {
  current: number;
  total: number;
  correctCount: number;
  wrongCount: number;
}) {
  const answered = correctCount + wrongCount;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const accuracyPct = answered > 0 ? Math.round((correctCount / answered) * 100) : 0;

  return (
    <div className="mb-6 space-y-3">
      {/* 進捗バー */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-slate-700">
          問 {current} / {total}
        </span>
        <span className="text-xs text-slate-400">{pct}%</span>
      </div>
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`進捗: ${total}問中${current}問目`}
      >
        {/* 正解分 */}
        {correctCount > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${(correctCount / total) * 100}%` }}
          />
        )}
        {/* 不正解分 */}
        {wrongCount > 0 && (
          <div
            className="h-full bg-red-400 transition-all duration-500"
            style={{ width: `${(wrongCount / total) * 100}%` }}
          />
        )}
      </div>

      {/* スコア表示 */}
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 font-semibold text-green-600">
          <span className="inline-block size-2 rounded-full bg-green-500" />
          正解 {correctCount}
        </span>
        <span className="flex items-center gap-1 font-semibold text-red-500">
          <span className="inline-block size-2 rounded-full bg-red-400" />
          不正解 {wrongCount}
        </span>
        <span className="ml-auto text-slate-500">
          {answered > 0 ? `正答率 ${accuracyPct}%` : ""}
        </span>
      </div>

      {/* 合格目安 */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-700">
        合格目安: <span className="font-bold">80点以上</span>（{total}問中{Math.ceil(total * 0.8)}問正解）
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Final Result Screen                                                */
/* ------------------------------------------------------------------ */

function FinalResult({
  questions,
  answeredMap,
  onRetry,
  onReviewWrong,
}: {
  questions: ExamQuizQuestion[];
  answeredMap: Map<string, number>;
  onRetry: () => void;
  onReviewWrong: () => void;
}) {
  const total = questions.length;
  const correctCount = Array.from(answeredMap.entries()).filter(
    ([id, idx]) => {
      const q = questions.find((q) => q.id === id);
      return q && idx === q.correctIndex;
    }
  ).length;
  const wrongCount = total - correctCount;
  const pct = Math.round((correctCount / total) * 100);

  // 合格判定
  const passed = pct >= 80;
  const grade =
    pct >= 90
      ? "S"
      : pct >= 80
      ? "A"
      : pct >= 70
      ? "B"
      : pct >= 60
      ? "C"
      : "D";
  const gradeColor =
    grade === "S"
      ? "text-yellow-500"
      : grade === "A"
      ? "text-green-600"
      : grade === "B"
      ? "text-blue-600"
      : grade === "C"
      ? "text-orange-500"
      : "text-red-500";

  // 間違えた問題リスト
  const wrongQuestions = questions.filter((q) => {
    const sel = answeredMap.get(q.id);
    return sel !== undefined && sel !== q.correctIndex;
  });

  return (
    <div className="space-y-6">
      {/* メインスコア */}
      <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-b from-purple-50 to-white p-6 text-center sm:p-8">
        <p className="mb-1 text-sm font-semibold text-purple-500">試験結果</p>

        {/* グレード */}
        <div className="mb-3">
          <span className={`text-6xl font-black ${gradeColor}`}>{grade}</span>
        </div>

        {/* 点数 */}
        <p className="text-3xl font-extrabold text-slate-900">
          {total}問中{" "}
          <span className="text-purple-600">{correctCount}問正解</span>
        </p>
        <p className="mt-1 text-lg font-bold text-slate-500">{pct}点 / 100点</p>

        {/* 合否 */}
        <div
          className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${
            passed
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {passed ? "合格ライン到達！" : "合格ライン未達（80%以上で合格）"}
        </div>

        {/* 内訳 */}
        <div className="mt-6 flex justify-center gap-6 text-sm">
          <div>
            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
            <p className="text-slate-500">正解</p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
            <p className="text-slate-500">不正解</p>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div>
            <p className="text-2xl font-bold text-purple-600">{pct}%</p>
            <p className="text-slate-500">正答率</p>
          </div>
        </div>
      </div>

      {/* 間違えた問題一覧 */}
      {wrongQuestions.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
          <h3 className="mb-3 text-sm font-bold text-red-700">
            間違えた問題（{wrongQuestions.length}問）
          </h3>
          <ul className="space-y-2">
            {wrongQuestions.map((q, i) => {
              const userSelectedIndex = answeredMap.get(q.id)!;
              return (
                <li key={q.id} className="rounded-lg border border-red-100 bg-white px-4 py-3">
                  <p className="text-sm text-slate-800">
                    <span className="mr-1.5 font-bold text-red-500">Q{questions.indexOf(q) + 1}.</span>
                    {q.question}
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    あなたの回答: {LABELS[userSelectedIndex]}. {q.choices[userSelectedIndex]}
                  </p>
                  <p className="mt-0.5 text-xs text-green-700">
                    正解: {LABELS[q.correctIndex]}. {q.choices[q.correctIndex]}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* アクション */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {wrongQuestions.length > 0 && (
          <button
            type="button"
            onClick={onReviewWrong}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-red-300 bg-white px-6 py-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
          >
            間違えた問題だけ復習
          </button>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
        >
          もう一度全問挑戦する
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Summary (for "all" mode)                                     */
/* ------------------------------------------------------------------ */

function ScoreSummary({
  total,
  answeredMap,
  questions,
  onRetry,
}: {
  total: number;
  answeredMap: Map<string, number>;
  questions: ExamQuizQuestion[];
  onRetry?: () => void;
}) {
  const answeredCount = answeredMap.size;
  const correctCount = Array.from(answeredMap.entries()).filter(
    ([id, idx]) => {
      const q = questions.find((q) => q.id === id);
      return q && idx === q.correctIndex;
    }
  ).length;

  if (answeredCount === 0) return null;

  const allDone = answeredCount === total;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div
      className={`rounded-xl border-2 p-5 text-center transition-colors duration-300 ${
        allDone
          ? "border-purple-500 bg-purple-50"
          : "border-slate-200 bg-white"
      }`}
    >
      {allDone ? (
        <>
          <p className="mb-1 text-sm font-semibold text-purple-600">全問回答完了！</p>
          <p className="text-2xl font-extrabold text-slate-900">
            {total}問中{" "}
            <span className="text-purple-600">{correctCount}問正解</span>
            <span className="ml-1 text-lg text-slate-500">({pct}%)</span>
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
            >
              もう一度挑戦する
            </button>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">
          回答済み: {answeredCount} / {total}問
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function ExamQuiz({
  questions: allQuestions,
  showNumbers = true,
  startNumber = 1,
  mode = "one",
}: ExamQuizProps) {
  const [answeredMap, setAnsweredMap] = useState<Map<string, number>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [reviewWrongOnly, setReviewWrongOnly] = useState(false);

  // 現在出題中の問題リスト（復習モード対応）
  const questions = useMemo(() => {
    if (!reviewWrongOnly) return allQuestions;
    return allQuestions.filter((q) => {
      const sel = answeredMap.get(q.id);
      return sel !== undefined && sel !== q.correctIndex;
    });
  }, [reviewWrongOnly, allQuestions, answeredMap]);

  const correctCount = Array.from(answeredMap.entries()).filter(
    ([id, idx]) => {
      const q = allQuestions.find((q) => q.id === id);
      return q && idx === q.correctIndex;
    }
  ).length;
  const wrongCount = answeredMap.size - correctCount;

  const handleAnswer = useCallback((id: string, selectedIndex: number) => {
    setAnsweredMap((prev) => {
      const next = new Map(prev);
      next.set(id, selectedIndex);
      return next;
    });
  }, []);

  const handleRetry = useCallback(() => {
    setAnsweredMap(new Map());
    setCurrentIndex(0);
    setShowResult(false);
    setReviewWrongOnly(false);
  }, []);

  const handleReviewWrong = useCallback(() => {
    // 間違えた問題だけで再出題（スコアはリセット）
    setReviewWrongOnly(true);
    setCurrentIndex(0);
    setShowResult(false);
    // answeredMapはリセットしない（wrongの判定に使う）
    // → 次のレンダリングでquestionsが絞り込まれる
    // → その後answeredMapをリセット
    setTimeout(() => {
      setAnsweredMap(new Map());
    }, 0);
  }, []);

  /* ---------- "all" mode ---------- */
  if (mode === "all") {
    return (
      <div className="space-y-6">
        {allQuestions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={startNumber + i}
            showNumber={showNumbers}
            onAnswer={(selectedIndex) => handleAnswer(q.id, selectedIndex)}
          />
        ))}
        <ScoreSummary total={allQuestions.length} answeredMap={answeredMap} questions={allQuestions} onRetry={handleRetry} />
      </div>
    );
  }

  /* ---------- "one" mode ---------- */
  const total = questions.length;

  // 結果画面
  if (showResult) {
    return (
      <FinalResult
        questions={reviewWrongOnly ? questions : allQuestions}
        answeredMap={answeredMap}
        onRetry={handleRetry}
        onReviewWrong={handleReviewWrong}
      />
    );
  }

  if (total === 0 || !questions[currentIndex]) return null;

  const currentQ = questions[currentIndex];
  const isCurrentAnswered = answeredMap.has(currentQ.id);
  const isLastQuestion = currentIndex === total - 1;

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 復習モードラベル */}
      {reviewWrongOnly && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-center text-sm font-semibold text-red-600">
          復習モード — 間違えた{total}問に再挑戦中
        </div>
      )}

      {/* リアルタイムスコアボード */}
      <LiveScoreBoard
        current={currentIndex + 1}
        total={total}
        correctCount={correctCount}
        wrongCount={wrongCount}
      />

      {/* 問題カード */}
      <div key={currentQ.id} className="animate-in fade-in duration-300">
        <QuestionCard
          q={currentQ}
          index={reviewWrongOnly ? currentIndex + 1 : startNumber + allQuestions.indexOf(currentQ)}
          showNumber={showNumbers}
          onAnswer={(selectedIndex) => handleAnswer(currentQ.id, selectedIndex)}
        />
      </div>

      {/* ナビゲーションボタン */}
      {isCurrentAnswered && (
        <div className="flex justify-center pt-2">
          {isLastQuestion ? (
            <button
              type="button"
              onClick={() => {
                setShowResult(true);
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
            >
              結果を見る
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCurrentIndex((prev) => prev + 1);
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
            >
              次の問題へ →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Question Card                                                      */
/* ------------------------------------------------------------------ */

function QuestionCard({
  q,
  index,
  showNumber,
  onAnswer,
}: {
  q: ExamQuizQuestion;
  index: number;
  showNumber: boolean;
  onAnswer: (selectedIndex: number) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === q.correctIndex;

  const handleSelect = useCallback(
    (idx: number) => {
      if (answered) return;
      setSelected(idx);
      onAnswer(idx);
    },
    [answered, onAnswer]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Question header */}
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-base font-bold leading-relaxed text-slate-900">
          {showNumber && (
            <span className="mr-1.5 text-purple-600">Q{index}.</span>
          )}
          {q.question}
        </p>
      </div>

      {/* Choices */}
      <div className="space-y-2.5 px-5 py-4 sm:px-6">
        {q.choices.map((choice, idx) => {
          const isThisCorrect = idx === q.correctIndex;
          const isThisSelected = idx === selected;

          let btnClasses: string;
          let labelClasses: string;

          if (!answered) {
            btnClasses =
              "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 cursor-pointer";
            labelClasses = "bg-slate-100 text-slate-600";
          } else if (isThisCorrect) {
            btnClasses = "border-green-500 bg-green-50 cursor-default";
            labelClasses = "bg-green-500 text-white";
          } else if (isThisSelected && !isThisCorrect) {
            btnClasses = "border-red-500 bg-red-50 cursor-default";
            labelClasses = "bg-red-500 text-white";
          } else {
            btnClasses =
              "border-slate-200 bg-white opacity-60 cursor-default";
            labelClasses = "bg-slate-100 text-slate-400";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-colors duration-150 ${btnClasses}`}
              aria-label={`${LABELS[idx]}: ${choice}`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${labelClasses}`}
              >
                {LABELS[idx]}
              </span>
              <span
                className={`text-sm font-medium ${
                  answered && isThisCorrect
                    ? "text-green-800"
                    : answered && isThisSelected
                    ? "text-red-800"
                    : answered
                    ? "text-slate-400"
                    : "text-slate-800"
                }`}
              >
                {choice}
              </span>
              {answered && isThisCorrect && (
                <span className="ml-auto shrink-0 text-xs font-semibold text-green-600">
                  正解
                </span>
              )}
              {answered && isThisSelected && !isThisCorrect && (
                <span className="ml-auto shrink-0 text-xs font-semibold text-red-600">
                  あなたの回答
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 ${
              isCorrect ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <span className={`text-xl font-bold ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              {isCorrect ? "\u25CB" : "\u2715"}
            </span>
            <span className={`text-base font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
              {isCorrect ? "正解です！" : "不正解です"}
            </span>
            <span className="ml-auto text-sm font-semibold text-slate-600">
              正解: {LABELS[q.correctIndex]}
            </span>
          </div>

          <div className="mb-4 rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">解説</p>
            <p className="text-sm leading-relaxed text-slate-700">{q.explanation}</p>
          </div>

          {q.choiceExplanations && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                各選択肢の解説
              </p>
              {q.choiceExplanations.map((exp, idx) => {
                if (!exp) return null;
                const isChoiceCorrect = idx === q.correctIndex;
                return (
                  <div
                    key={idx}
                    className={`rounded-lg border px-3 py-2 ${
                      isChoiceCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-sm">
                      <span
                        className={`mr-1.5 font-bold ${
                          isChoiceCorrect ? "text-green-600" : "text-slate-500"
                        }`}
                      >
                        {LABELS[idx]}.
                      </span>
                      <span className={isChoiceCorrect ? "text-green-800" : "text-slate-600"}>
                        {exp}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
