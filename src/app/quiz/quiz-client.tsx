"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, Fish, RefreshCw, Share2 } from "lucide-react";
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

  const [copied, setCopied] = useState(false);

  function getShareText() {
    if (!result) return "";
    return `【釣りスタイル診断】私は「${result.name}」でした！\n${result.description.slice(0, 50)}...\nあなたはどのタイプ？👇\nhttps://tsurispot.com/quiz\n#ツリスポ #釣りスタイル診断 #釣り`;
  }

  function shareTwitter() {
    const text = getShareText();
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      "_blank",
      "width=550,height=420"
    );
  }

  function shareLine() {
    const text = getShareText();
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent("https://tsurispot.com/quiz")}&text=${encodeURIComponent(text)}`,
      "_blank",
      "width=550,height=420"
    );
  }

  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://tsurispot.com/quiz")}`,
      "_blank",
      "width=550,height=420"
    );
  }

  function handleCopy() {
    const text = getShareText();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  function handleNativeShare() {
    if (!result) return;
    const text = getShareText();
    if (navigator.share) {
      navigator.share({ text, url: "https://tsurispot.com/quiz" }).catch(() => {});
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
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Fish className="size-3" />
              <span>ツリスポ 釣りスタイル診断</span>
              <span>|</span>
              <span>tsurispot.com/quiz</span>
            </div>
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

        {/* SNSシェアボタン */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
            <Share2 className="size-4" />
            結果をシェアする
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={shareTwitter}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] hover:shadow-md"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X (Twitter)
            </button>
            <button
              onClick={shareLine}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-[#06C755] hover:text-white hover:border-[#06C755] hover:shadow-md"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
              LINE
            </button>
            <button
              onClick={shareFacebook}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] hover:shadow-md"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 hover:shadow-md"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              {copied ? "コピー済み" : "コピー"}
            </button>
          </div>
          <button
            onClick={handleNativeShare}
            className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-medium text-white transition-all hover:from-cyan-600 hover:to-blue-600 hover:shadow-md sm:hidden"
          >
            <Share2 className="size-4" />
            その他のアプリでシェア
          </button>
        </div>

        {/* もう一度ボタン */}
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={handleReset}
        >
          <RefreshCw className="size-4" />
          もう一度診断する
        </Button>

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
