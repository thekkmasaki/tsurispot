"use client";

import { useState, useCallback } from "react";

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
  /** "one" = 1問ずつ表示（デフォルト）, "all" = 全問一覧表示（旧仕様） */
  mode?: "all" | "one";
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LABELS = ["A", "B", "C", "D"] as const;

/* ------------------------------------------------------------------ */
/*  Progress Bar                                                       */
/* ------------------------------------------------------------------ */

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm font-semibold">
        <span className="text-purple-700">
          問題 {current} / {total}
        </span>
        <span className="text-slate-400">{pct}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Summary                                                      */
/* ------------------------------------------------------------------ */

function ScoreSummary({
  total,
  answeredMap,
  onRetry,
}: {
  total: number;
  answeredMap: Map<string, boolean>;
  onRetry?: () => void;
}) {
  const answeredCount = answeredMap.size;
  const correctCount = Array.from(answeredMap.values()).filter(Boolean).length;

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
          <p className="mb-1 text-sm font-semibold text-purple-600">
            全問回答完了！
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {total}問中{" "}
            <span className="text-purple-600">{correctCount}問正解</span>
            <span className="ml-1 text-lg text-slate-500">({pct}%)</span>
          </p>
          {pct >= 80 ? (
            <p className="mt-2 text-sm text-green-600 font-medium">
              素晴らしい！合格ラインです
            </p>
          ) : pct >= 60 ? (
            <p className="mt-2 text-sm text-yellow-600 font-medium">
              もう少し！間違えた問題を復習しましょう
            </p>
          ) : (
            <p className="mt-2 text-sm text-red-600 font-medium">
              もう一度しっかり復習しましょう
            </p>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-700 active:bg-purple-800"
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
  questions,
  showNumbers = true,
  startNumber = 1,
  mode = "one",
}: ExamQuizProps) {
  const [answeredMap, setAnsweredMap] = useState<Map<string, boolean>>(
    new Map()
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track whether the user has clicked "次の問題へ" after the last question
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = useCallback(
    (id: string, correct: boolean) => {
      setAnsweredMap((prev) => {
        const next = new Map(prev);
        next.set(id, correct);
        return next;
      });
    },
    []
  );

  const handleRetry = useCallback(() => {
    setAnsweredMap(new Map());
    setCurrentIndex(0);
    setShowResult(false);
  }, []);

  /* ---------- "all" mode: original behaviour ---------- */
  if (mode === "all") {
    return (
      <div className="space-y-6">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            q={q}
            index={startNumber + i}
            showNumber={showNumbers}
            onAnswer={(correct) => handleAnswer(q.id, correct)}
          />
        ))}
        <ScoreSummary total={questions.length} answeredMap={answeredMap} onRetry={handleRetry} />
      </div>
    );
  }

  /* ---------- "one" mode: sequential, one at a time ---------- */
  const total = questions.length;
  const isLastQuestion = currentIndex === total - 1;
  const currentQ = questions[currentIndex];
  const isCurrentAnswered = currentQ ? answeredMap.has(currentQ.id) : false;

  // Show final result screen
  if (showResult) {
    return (
      <div className="space-y-6">
        <ProgressBar current={total} total={total} />
        <ScoreSummary total={total} answeredMap={answeredMap} onRetry={handleRetry} />
      </div>
    );
  }

  if (!currentQ) return null;

  return (
    <div className="space-y-6">
      <ProgressBar current={currentIndex + 1} total={total} />

      <QuestionCard
        key={currentQ.id}
        q={currentQ}
        index={startNumber + currentIndex}
        showNumber={showNumbers}
        onAnswer={(correct) => handleAnswer(currentQ.id, correct)}
      />

      {/* Navigation button (only after answering) */}
      {isCurrentAnswered && (
        <div className="flex justify-center pt-2">
          {isLastQuestion ? (
            <button
              type="button"
              onClick={() => setShowResult(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-purple-700 active:bg-purple-800"
            >
              結果を見る
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-8 py-3 text-base font-bold text-white shadow-sm transition-colors hover:bg-purple-700 active:bg-purple-800"
            >
              次の問題へ
              <span aria-hidden="true">&rarr;</span>
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
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === q.correctIndex;

  const handleSelect = useCallback(
    (idx: number) => {
      if (answered) return;
      setSelected(idx);
      onAnswer(idx === q.correctIndex);
    },
    [answered, onAnswer, q.correctIndex]
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

      {/* Result & Explanation (shown after answering) */}
      {answered && (
        <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
          {/* Correct / Incorrect banner */}
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 ${
              isCorrect ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <span
              className={`text-xl font-bold ${
                isCorrect ? "text-green-600" : "text-red-600"
              }`}
            >
              {isCorrect ? "\u25CB" : "\u2715"}
            </span>
            <span
              className={`text-base font-bold ${
                isCorrect ? "text-green-700" : "text-red-700"
              }`}
            >
              {isCorrect ? "正解です！" : "不正解です"}
            </span>
            <span className="ml-auto text-sm font-semibold text-slate-600">
              正解: {LABELS[q.correctIndex]}
            </span>
          </div>

          {/* Main explanation */}
          <div className="mb-4 rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              解説
            </p>
            <p className="text-sm leading-relaxed text-slate-700">
              {q.explanation}
            </p>
          </div>

          {/* Per-choice explanations */}
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
                          isChoiceCorrect
                            ? "text-green-600"
                            : "text-slate-500"
                        }`}
                      >
                        {LABELS[idx]}.
                      </span>
                      <span
                        className={
                          isChoiceCorrect
                            ? "text-green-800"
                            : "text-slate-600"
                        }
                      >
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
