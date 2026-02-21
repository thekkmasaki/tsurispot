"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Fish, RefreshCw, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- 型定義 ---

type ScoreKey =
  | "calm"
  | "active"
  | "family"
  | "solo"
  | "shore"
  | "surf"
  | "eging"
  | "night"
  | "hirame"
  | "aji"
  | "versatile"
  | "sabiki"
  | "lure"
  | "tech"
  | "fullgear"
  | "jigging"
  | "practical";

type Scores = Record<ScoreKey, number>;

// --- 質問データ ---

interface Choice {
  label: string;
  sub?: string;
  scores: Partial<Scores>;
}

interface Question {
  id: number;
  text: string;
  choices: Choice[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "休日はどう過ごしたい？",
    choices: [
      { label: "のんびりリラックス", sub: "ゆったり過ごしたい", scores: { calm: 2 } },
      { label: "アクティブに動きたい", sub: "体を動かしてスカッとしたい", scores: { active: 2 } },
      { label: "家族や友人とワイワイ", sub: "みんなで楽しみたい", scores: { family: 2 } },
      { label: "一人で集中したい", sub: "自分の時間を大切にしたい", scores: { solo: 2 } },
    ],
  },
  {
    id: 2,
    text: "好きな時間帯は？",
    choices: [
      { label: "早朝（朝日を見ながら）", sub: "4〜7時の澄んだ空気が好き", scores: { shore: 2 } },
      { label: "日中（太陽の下で）", sub: "明るい時間に動きたい", scores: { surf: 2 } },
      { label: "夕方（夕焼けの中で）", sub: "マジックアワーが最高", scores: { eging: 2 } },
      { label: "夜（静かな夜の海）", sub: "夜の海の神秘が好き", scores: { night: 2 } },
    ],
  },
  {
    id: 3,
    text: "食べ物の好みは？",
    choices: [
      { label: "白身魚の刺身が好き", sub: "ヒラメ・カレイ系", scores: { hirame: 2 } },
      { label: "青魚が好き", sub: "アジ・サバ・イワシ系", scores: { aji: 2 } },
      { label: "イカやタコが好き", sub: "刺身・天ぷらで食べたい", scores: { eging: 2 } },
      { label: "特にこだわりなし", sub: "何でも美味しく食べられる", scores: { versatile: 2 } },
    ],
  },
  {
    id: 4,
    text: "道具にこだわる方？",
    choices: [
      { label: "シンプルが一番", sub: "難しい道具は苦手", scores: { sabiki: 2 } },
      { label: "ある程度こだわりたい", sub: "良い道具を使いたい", scores: { lure: 2 } },
      { label: "ガジェット大好き", sub: "最新機器を試したい", scores: { tech: 2 } },
      { label: "形から入るタイプ", sub: "まずは装備を揃えたい", scores: { fullgear: 2 } },
    ],
  },
  {
    id: 5,
    text: "釣果への期待は？",
    choices: [
      { label: "たくさん釣りたい", sub: "数で満足したい", scores: { sabiki: 2 } },
      { label: "大物を狙いたい", sub: "デカいのを釣り上げたい", scores: { jigging: 2 } },
      { label: "釣れなくても楽しめればOK", sub: "過程を楽しみたい", scores: { calm: 2 } },
      { label: "食べられる魚が釣りたい", sub: "食卓に並べたい", scores: { practical: 2 } },
    ],
  },
];

// --- 結果タイプ定義 ---

interface ResultType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  textColor: string;
  links: { label: string; href: string }[];
  trigger: ScoreKey[];
}

const resultTypes: ResultType[] = [
  {
    id: "sabiki-master",
    name: "サビキマスター",
    description:
      "数釣り派のあなたは、堤防でサビキ釣りが最高の幸せ！アジやイワシを大量に釣り上げる爽快感はクセになります。初心者でも成果が出やすく、ファミリーにも人気の釣りスタイルです。",
    icon: "釣",
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    links: [
      { label: "サビキ釣りの方法を見る", href: "/methods/sabiki" },
      { label: "初心者ガイド", href: "/guide" },
    ],
    trigger: ["sabiki"],
  },
  {
    id: "lure-hunter",
    name: "ルアーハンター",
    description:
      "テクニカル派のあなたは、ルアーで魚との駆け引きを楽しむスタイルがぴったり！アジングやメバリングでゲーム性を追求してみましょう。腕前が上がるほど楽しさも倍増します。",
    icon: "狩",
    color: "from-orange-500 to-amber-400",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    links: [
      { label: "アジング釣法を見る", href: "/methods/ajing" },
      { label: "ルアーガイド", href: "/guide" },
    ],
    trigger: ["lure", "active"],
  },
  {
    id: "eging-sniper",
    name: "エギングスナイパー",
    description:
      "イカ狙い一筋のあなたには、繊細なしゃくりで勝負するエギングがぴったり！夕暮れから夜にかけての時間帯が特に熱く、大型アオリイカとのファイトは格別の興奮を味わえます。",
    icon: "烏",
    color: "from-purple-500 to-violet-400",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    links: [
      { label: "エギング釣法を見る", href: "/methods/eging" },
      { label: "エギングガイド", href: "/guide" },
    ],
    trigger: ["eging"],
  },
  {
    id: "shore-jigging",
    name: "ショアジギンガー",
    description:
      "青物回遊を待つロマン派のあなたには、ショアジギングが最高のスタイル！ブリやカンパチなど大型魚の引きは、一度味わったら忘れられない感動があります。早朝の磯でキャストする爽快感も格別です。",
    icon: "波",
    color: "from-teal-500 to-emerald-400",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
    links: [
      { label: "ショアジギング釣法を見る", href: "/methods/shore-jigging" },
      { label: "ジギングガイド", href: "/guide" },
    ],
    trigger: ["jigging", "shore"],
  },
  {
    id: "float-fisher",
    name: "のんびりウキ釣り師",
    description:
      "癒し派のあなたには、ウキ釣りが最高のスタイル！浮きをぼーっと眺めながら過ごす時間は、日常の疲れを癒してくれます。チヌやグレなど繊細な釣りで、のんびりした釣行を楽しみましょう。",
    icon: "浮",
    color: "from-green-500 to-lime-400",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    links: [
      { label: "ウキ釣り釣法を見る", href: "/methods/uki-zuri" },
      { label: "釣りガイド", href: "/guide" },
    ],
    trigger: ["calm"],
  },
  {
    id: "family-fisher",
    name: "ファミリーフィッシャー",
    description:
      "家族の笑顔が一番の釣果のあなたには、安全で楽しい釣り場でのファミリーフィッシングがぴったり！子どもでも安心な堤防でのサビキや、管理釣り場でのトラウト釣りがおすすめです。",
    icon: "家",
    color: "from-pink-500 to-rose-400",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
    links: [
      { label: "ファミリー向けガイド", href: "/guide" },
      { label: "初心者チェックリスト", href: "/beginner-checklist" },
    ],
    trigger: ["family"],
  },
  {
    id: "night-master",
    name: "夜釣りの達人",
    description:
      "静寂の夜の海で大物を狙うあなたには、夜釣りスタイルが最高！タチウオやメバルのスペシャリストとして、ライトゲームから大型魚まで幅広く楽しめます。夜の海ならではの静けさと興奮を体験してみてください。",
    icon: "月",
    color: "from-indigo-600 to-blue-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    links: [
      { label: "夜釣りガイド", href: "/guide" },
      { label: "メバリング釣法を見る", href: "/methods/mebaring" },
    ],
    trigger: ["night", "solo"],
  },
  {
    id: "all-rounder",
    name: "万能アングラー",
    description:
      "何でもこなすオールラウンダーのあなたには、季節と状況に合わせて釣り方を変えるスタイルがぴったり！今釣れる魚を追いかけて、春夏秋冬それぞれの釣りを楽しんでみましょう。",
    icon: "全",
    color: "from-slate-600 to-gray-500",
    bgColor: "bg-slate-50",
    textColor: "text-slate-700",
    links: [
      { label: "今釣れる魚を確認", href: "/catchable-now" },
      { label: "釣りカレンダー", href: "/fishing-calendar" },
    ],
    trigger: ["versatile", "practical", "tech", "fullgear", "surf", "hirame", "aji"],
  },
];

// --- スコア計算 ---

function calcResult(answers: (Partial<Scores> | null)[]): ResultType {
  const total: Scores = {
    calm: 0, active: 0, family: 0, solo: 0,
    shore: 0, surf: 0, eging: 0, night: 0,
    hirame: 0, aji: 0, versatile: 0, sabiki: 0,
    lure: 0, tech: 0, fullgear: 0, jigging: 0, practical: 0,
  };

  for (const answer of answers) {
    if (!answer) continue;
    for (const [key, val] of Object.entries(answer) as [ScoreKey, number][]) {
      total[key] += val;
    }
  }

  // 各タイプのスコアを計算
  const typeScores = resultTypes.map((type) => {
    const score = type.trigger.reduce((sum, key) => sum + (total[key] ?? 0), 0);
    return { type, score };
  });

  // スコアが最も高いタイプを返す
  typeScores.sort((a, b) => b.score - a.score);
  return typeScores[0].type;
}

// --- プログレスバー ---

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>質問 {current} / {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// --- 選択肢カード ---

function ChoiceCard({
  choice,
  selected,
  onClick,
}: {
  choice: Choice;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
        selected
          ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm"
      }`}
    >
      <p className="font-semibold text-gray-800">{choice.label}</p>
      {choice.sub && (
        <p className={`text-xs mt-1 ${selected ? "text-blue-600" : "text-gray-400"}`}>
          {choice.sub}
        </p>
      )}
    </button>
  );
}

// --- メインクライアントコンポーネント ---

export default function QuizClient() {
  const [step, setStep] = useState<"quiz" | "result">("quiz");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(Partial<Scores> | null)[]>(
    Array(questions.length).fill(null)
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ResultType | null>(null);

  function handleChoiceClick(choiceIndex: number) {
    setSelected(choiceIndex);
    const newAnswers = [...answers];
    newAnswers[currentQ] = questions[currentQ].choices[choiceIndex].scores;

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
        setSelected(null);
      } else {
        setAnswers(newAnswers);
        const res = calcResult(newAnswers);
        setResult(res);
        setStep("result");
        setSelected(null);
      }
    }, 350);
  }

  function handleReset() {
    setStep("quiz");
    setCurrentQ(0);
    setAnswers(Array(questions.length).fill(null));
    setSelected(null);
    setResult(null);
  }

  function handleShare() {
    if (!result) return;
    const text = `【釣りスタイル診断】私は「${result.name}」でした！あなたは？ https://tsurispot.com/quiz`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert("クリップボードにコピーしました！");
      });
    }
  }

  if (step === "result" && result) {
    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
        {/* 結果カード */}
        <div className={`rounded-2xl p-1 bg-gradient-to-br ${result.color} shadow-lg`}>
          <div className="bg-white rounded-xl p-6">
            <p className="text-center text-xs text-gray-400 mb-2">あなたの釣りスタイルは...</p>
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${result.color} flex items-center justify-center text-white text-3xl font-bold shadow-md`}
              >
                {result.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{result.name}</h2>
            </div>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed text-center">
              {result.description}
            </p>
          </div>
        </div>

        {/* おすすめページ */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">おすすめページ</h3>
          <div className="space-y-2">
            {result.links.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <span className="text-sm font-medium text-gray-700">{link.label}</span>
                  <ChevronRight className="size-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={handleReset}
          >
            <RefreshCw className="size-4" />
            もう一度診断する
          </Button>
          <Button
            className="flex-1 gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 border-0"
            onClick={handleShare}
          >
            <Share2 className="size-4" />
            シェアする
          </Button>
        </div>

        {/* 関連リンク */}
        <div className="pt-2">
          <Link href="/bouzu-checker">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="rounded-full bg-indigo-100 p-2.5">
                  <Fish className="size-5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">ボウズ確率チェッカー</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    今日の釣行でボウズになる確率を診断
                  </p>
                </div>
                <ChevronRight className="size-4 text-gray-400 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-4">
      <ProgressBar current={currentQ + 1} total={questions.length} />

      <div className="animate-in fade-in duration-300">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Q{q.id}. {q.text}
        </h2>
        <div className="space-y-3">
          {q.choices.map((choice, i) => (
            <ChoiceCard
              key={i}
              choice={choice}
              selected={selected === i}
              onClick={() => handleChoiceClick(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
