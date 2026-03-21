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
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LABELS = ["A", "B", "C", "D"] as const;

/* ------------------------------------------------------------------ */
/*  Score Summary                                                      */
/* ------------------------------------------------------------------ */

function ScoreSummary({
  total,
  answeredMap,
}: {
  total: number;
  answeredMap: Map<string, boolean>;
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
            <span className="ml-1 text-lg text-slate-500">（{pct}%）</span>
          </p>
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
}: ExamQuizProps) {
  const [answeredMap, setAnsweredMap] = useState<Map<string, boolean>>(
    new Map()
  );

  return (
    <div className="space-y-6">
      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={startNumber + i}
          showNumber={showNumbers}
          onAnswer={(correct) => {
            setAnsweredMap((prev) => {
              const next = new Map(prev);
              next.set(q.id, correct);
              return next;
            });
          }}
        />
      ))}

      <ScoreSummary total={questions.length} answeredMap={answeredMap} />
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
