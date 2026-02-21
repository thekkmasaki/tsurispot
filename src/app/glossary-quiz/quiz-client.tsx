"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, BookOpenText, RefreshCw, Share2 } from "lucide-react";

// ===== 用語データ =====
interface QuizTerm {
  term: string;
  description: string;
}

const allTerms: QuizTerm[] = [
  { term: "ボウズ", description: "魚が1匹も釣れなかったこと。「オデコ」とも言う。" },
  { term: "釣果", description: "釣りの成果・結果のこと。釣れた魚の種類や数量を指す。" },
  { term: "外道", description: "狙っていた魚以外の魚が釣れること。またはその魚。" },
  { term: "本命", description: "その日のメインターゲットとして狙っている魚のこと。" },
  { term: "入れ食い", description: "仕掛けを入れるたびに魚が釣れる、非常によく釣れている状態。" },
  { term: "バラす", description: "掛かった魚が針から外れて逃げてしまうこと。" },
  { term: "アタリ", description: "魚が餌やルアーに食いつき、竿先や糸に変化が出ること。「バイト」とも言う。" },
  { term: "アワセ", description: "アタリがあったときに竿を立てて針を魚に掛ける動作。「フッキング」とも言う。" },
  { term: "取り込み", description: "掛けた魚を最終的に手元まで引き寄せてキャッチすること。「ランディング」とも言う。" },
  { term: "根掛かり", description: "仕掛けやルアーが海底の岩やゴミに引っ掛かって動かなくなること。" },
  { term: "リリース", description: "釣った魚を海や川に逃がすこと。小さい魚はリリースがマナー。" },
  { term: "サビキ釣り", description: "複数の疑似餌がついた仕掛けでアジ・サバ・イワシなどを狙う釣法。初心者に最もおすすめ。" },
  { term: "ウキ釣り", description: "ウキ（浮き）を使って仕掛けを一定の深さに漂わせる釣法。アタリがウキの動きでわかりやすい。" },
  { term: "投げ釣り", description: "オモリを遠くに投げて海底付近の魚を狙う釣法。キスやカレイがターゲット。" },
  { term: "穴釣り", description: "テトラポッドや岩の隙間に仕掛けを落として根魚を狙う釣法。" },
  { term: "エギング", description: "エギ（餌木）というルアーでイカを狙う釣法。アオリイカが人気ターゲット。" },
  { term: "ショアジギング", description: "岸からメタルジグを投げて青物を狙う釣法。" },
  { term: "フカセ釣り", description: "軽い仕掛けを潮に乗せて自然に流す釣法。クロダイやメジナが対象。" },
  { term: "ロッド", description: "釣り竿のこと。対象魚や釣法によって長さや硬さが異なる。" },
  { term: "ハリス", description: "針に直結する糸。メインの道糸より細いものを使うのが一般的。" },
  { term: "道糸", description: "リールに巻いてあるメインのライン。PE・フロロ・ナイロンなどの素材がある。" },
  { term: "サルカン", description: "道糸とハリスをつなぐ回転金具。糸のヨレ（ねじれ）を防ぐ。「スイベル」とも言う。" },
  { term: "ジグヘッド", description: "オモリと針が一体になったルアー用の仕掛け。ワームを装着して使う。" },
  { term: "タモ", description: "魚を取り込むための網。大きな魚を引き上げるときに使う。「玉網」とも言う。" },
  { term: "メタルジグ", description: "金属製のルアー。遠投性に優れ、青物やヒラメなどを狙える。" },
  { term: "ナブラ", description: "小魚の群れが大型魚に追われて海面にバシャバシャと跳ねている状態。チャンスタイム。" },
  { term: "活性", description: "魚のエサへの反応の良さ。「活性が高い」＝よく食う、「活性が低い」＝食いが渋い。" },
  { term: "回遊", description: "魚が群れで移動すること。回遊魚（アジ・サバなど）は潮の流れに沿って移動する。" },
  { term: "マヅメ", description: "日の出前後の「朝マヅメ」と日の入り前後の「夕マヅメ」の総称。魚の活性が上がる最も釣れやすい時間帯。" },
  { term: "朝マヅメ", description: "日の出前後1〜2時間。プランクトンが活発になり、食物連鎖が始まる最高の時間帯。" },
  { term: "潮目", description: "異なる潮流がぶつかるライン。プランクトンやエサが集まり、魚が集まりやすいポイント。" },
  { term: "大潮", description: "満月・新月の前後に起こる、潮の干満差が最も大きい状態。魚の活性が上がりやすい。" },
  { term: "潮止まり", description: "満潮・干潮の前後で潮の流れが止まる時間帯。魚の活性が落ちやすい。" },
  { term: "堤防", description: "港や海岸にある防波堤。足場がよく初心者に最適な釣り場。" },
  { term: "テトラ", description: "堤防の外側に積まれたテトラポッド（消波ブロック）。根魚の好ポイントだが足場注意。" },
  { term: "サーフ", description: "砂浜のこと。ヒラメ・キスなどが狙え、遠投が基本。" },
  { term: "カケアガリ", description: "海底が急に浅くなる場所。魚がエサを捕食するポイントになりやすい。" },
];

// ===== ユーティリティ =====
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface Question {
  /** true: 用語→定義, false: 定義→用語 */
  mode: boolean;
  correct: QuizTerm;
  choices: string[];
  correctIndex: number;
}

function buildQuestions(): Question[] {
  const pool = shuffle(allTerms).slice(0, 10);
  return pool.map((correct) => {
    const others = shuffle(allTerms.filter((t) => t.term !== correct.term)).slice(0, 3);
    const mode = Math.random() > 0.5;
    const wrongChoices = others.map((t) => (mode ? t.description : t.term));
    const correctAnswer = mode ? correct.description : correct.term;
    const allChoices = shuffle([correctAnswer, ...wrongChoices]);
    return {
      mode,
      correct,
      choices: allChoices,
      correctIndex: allChoices.indexOf(correctAnswer),
    };
  });
}

// ===== コンポーネント =====
type GameState = "start" | "playing" | "result";

export function QuizClient() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showNext, setShowNext] = useState(false);

  const startQuiz = useCallback(() => {
    setQuestions(buildQuestions());
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setShowNext(false);
    setGameState("playing");
  }, []);

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedIndex !== null) return;
      setSelectedIndex(index);
      if (index === questions[currentIndex].correctIndex) {
        setScore((s) => s + 1);
      }
      setTimeout(() => setShowNext(true), 800);
    },
    [selectedIndex, questions, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setGameState("result");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedIndex(null);
      setShowNext(false);
    }
  }, [currentIndex, questions.length]);

  // ===== スタート画面 =====
  if (gameState === "start") {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mb-6 text-5xl">🎣</div>
        <h2 className="mb-3 text-xl font-bold">釣り用語クイズにチャレンジ！</h2>
        <p className="mb-2 text-sm text-muted-foreground">
          全10問の4択クイズで釣り知識を試そう。
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          用語の意味を問う問題と、説明から用語を当てる問題が出題されます。
        </p>
        <button
          onClick={startQuiz}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-bold text-primary-foreground shadow transition-opacity hover:opacity-90"
        >
          スタート
        </button>
        <div className="mt-6">
          <Link href="/glossary" className="text-sm text-primary hover:underline">
            <BookOpenText className="mr-1 inline size-4" />
            先に用語集で勉強する
          </Link>
        </div>
      </div>
    );
  }

  // ===== 結果画面 =====
  if (gameState === "result") {
    let rank: string;
    let rankColor: string;
    if (score === 10) {
      rank = "🏆 釣りマスター！完璧です";
      rankColor = "text-yellow-600";
    } else if (score >= 7) {
      rank = "🎣 なかなかの腕前！";
      rankColor = "text-blue-600";
    } else if (score >= 4) {
      rank = "📚 もう少し勉強しよう";
      rankColor = "text-orange-600";
    } else {
      rank = "🔰 まだまだ初心者。用語集で勉強！";
      rankColor = "text-red-600";
    }

    const shareText = encodeURIComponent(
      `釣り用語クイズ ${score}/10問正解！あなたも挑戦してみよう 🎣 #ツリスポ`
    );
    const shareUrl = encodeURIComponent("https://tsurispot.com/glossary-quiz");

    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-bold">クイズ結果</h2>
        <div className="my-6">
          <p className="text-5xl font-bold text-primary">{score}</p>
          <p className="mt-1 text-lg text-muted-foreground">/ 10問正解</p>
        </div>
        <p className={`mb-8 text-lg font-bold ${rankColor}`}>{rank}</p>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={startQuiz}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow transition-opacity hover:opacity-90"
          >
            <RefreshCw className="size-4" />
            もう一度チャレンジ
          </button>

          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Share2 className="size-4" />
            結果をXでシェア
          </a>

          <Link
            href="/glossary"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-bold text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <BookOpenText className="size-4" />
            用語集で復習する
          </Link>
        </div>
      </div>
    );
  }

  // ===== プレイ中 =====
  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* プログレスバー */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentIndex + 1} / {questions.length} 問</span>
          <span>スコア: {score}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {question.mode ? "次の用語の意味は？" : "次の説明にあてはまる用語は？"}
        </p>
        <h2 className="mt-3 text-lg font-bold leading-relaxed sm:text-xl">
          {question.mode ? (
            <>「<span className="text-primary">{question.correct.term}</span>」とは？</>
          ) : (
            <span className="block text-base text-muted-foreground leading-relaxed">
              {question.correct.description}
            </span>
          )}
        </h2>
      </div>

      {/* 選択肢 */}
      <div className="grid gap-3">
        {question.choices.map((choice, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === question.correctIndex;
          const answered = selectedIndex !== null;

          let buttonClass =
            "w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200 ";

          if (!answered) {
            buttonClass +=
              "border-border bg-white hover:border-primary/40 hover:bg-primary/5";
          } else if (isCorrect) {
            buttonClass +=
              "border-green-500 bg-green-50 text-green-800 animate-pulse-once";
          } else if (isSelected && !isCorrect) {
            buttonClass +=
              "border-red-500 bg-red-50 text-red-800 animate-shake";
          } else {
            buttonClass += "border-border bg-white opacity-50";
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={answered}
              className={buttonClass}
            >
              <span className="mr-3 inline-block w-6 text-center font-bold text-muted-foreground">
                {["A", "B", "C", "D"][index]}
              </span>
              {choice}
            </button>
          );
        })}
      </div>

      {/* フィードバック */}
      {selectedIndex !== null && (
        <div
          className={`rounded-xl border p-4 text-sm font-medium ${
            selectedIndex === question.correctIndex
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {selectedIndex === question.correctIndex ? (
            <p className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />
              <span>
                <span className="font-bold">正解！</span>
                {" "}
                {question.mode
                  ? question.correct.description
                  : `「${question.correct.term}」が正解です。`}
              </span>
            </p>
          ) : (
            <p className="flex items-start gap-2">
              <XCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <span>
                <span className="font-bold">残念！</span>
                {" "}
                正解は「
                <span className="font-bold">
                  {question.mode
                    ? question.correct.description
                    : question.correct.term}
                </span>
                」です。
              </span>
            </p>
          )}
        </div>
      )}

      {/* 次の問題へ */}
      {showNext && (
        <div className="text-center">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow transition-opacity hover:opacity-90"
          >
            {currentIndex + 1 >= questions.length ? "結果を見る" : "次の問題へ"}
          </button>
        </div>
      )}
    </div>
  );
}
