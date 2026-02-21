"use client";

import { useState } from "react";
import Link from "next/link";
import { ShareButtons } from "@/components/ui/share-buttons";
import {
  ChevronRight,
  Fish,
  AlertTriangle,
  CheckCircle,
  Share2,
  RefreshCw,
  MapPin,
  Waves,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// --- 型定義 ---

type SpotType = "breakwater" | "surf" | "rocky" | "estuary" | "managed" | "boat";
type FishCategory = "small_pelagic" | "rockfish" | "large_pelagic" | "squid_octopus" | "freshwater" | "any";
type Method = "sabiki" | "lure" | "float" | "casting" | "eging" | "other";
type TimeSlot = "dawn" | "morning" | "afternoon" | "dusk" | "night";
type ExperienceLevel = "first" | "beginner" | "intermediate" | "advanced";
type Weather = "sunny" | "cloudy" | "light_rain" | "heavy_rain";

interface FormState {
  spotType: SpotType | null;
  fishCategory: FishCategory | null;
  method: Method | null;
  month: number | null;
  timeSlot: TimeSlot | null;
  experience: ExperienceLevel | null;
  weather: Weather | null;
}

// --- スコアリングロジック ---

function calcBouzuProbability(form: FormState): number {
  // ベーススコア
  const baseScores: Record<SpotType, number> = {
    managed: 5,
    boat: 15,
    breakwater: 25,
    estuary: 30,
    rocky: 40,
    surf: 45,
  };

  // 魚種補正
  const fishCorrections: Record<FishCategory, number> = {
    small_pelagic: -10,
    rockfish: -5,
    freshwater: 0,
    any: +15,
    squid_octopus: +10,
    large_pelagic: +20,
  };

  // 釣法補正
  const methodCorrections: Record<Method, number> = {
    sabiki: -15,
    float: -5,
    casting: 0,
    lure: +10,
    eging: +10,
    other: +5,
  };

  // 月別補正
  function getMonthCorrection(month: number): number {
    if (month >= 6 && month <= 10) return -10;
    if ((month >= 4 && month <= 5) || month === 11) return 0;
    if (month === 3 || month === 12) return +10;
    return +20; // 1-2月
  }

  // 時間帯補正
  const timeCorrections: Record<TimeSlot, number> = {
    dawn: -15,
    dusk: -10,
    morning: -5,
    night: 0,
    afternoon: +10,
  };

  // 経験補正
  const experienceCorrections: Record<ExperienceLevel, number> = {
    advanced: -15,
    intermediate: -5,
    beginner: +5,
    first: +15,
  };

  // 天候補正
  const weatherCorrections: Record<Weather, number> = {
    cloudy: -5,
    sunny: 0,
    light_rain: +5,
    heavy_rain: +20,
  };

  const base = form.spotType ? baseScores[form.spotType] : 35;
  const fish = form.fishCategory ? fishCorrections[form.fishCategory] : 0;
  const method = form.method ? methodCorrections[form.method] : 0;
  const month = form.month ? getMonthCorrection(form.month) : 0;
  const time = form.timeSlot ? timeCorrections[form.timeSlot] : 0;
  const exp = form.experience ? experienceCorrections[form.experience] : 0;
  const weather = form.weather ? weatherCorrections[form.weather] : 0;

  const total = base + fish + method + month + time + exp + weather;
  return Math.max(0, Math.min(100, total));
}

// --- 結果判定 ---

interface ResultInfo {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  ringColor: string;
  textColor: string;
}

function getResultInfo(probability: number): ResultInfo {
  if (probability <= 15) {
    return {
      label: "ほぼ安心！高確率で釣れます",
      emoji: "🎉",
      color: "text-green-600",
      bgColor: "bg-green-50",
      ringColor: "stroke-green-500",
      textColor: "text-green-700",
    };
  } else if (probability <= 35) {
    return {
      label: "まずまず！準備をしっかりすれば大丈夫",
      emoji: "😊",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      ringColor: "stroke-blue-500",
      textColor: "text-blue-700",
    };
  } else if (probability <= 55) {
    return {
      label: "やや不安...対策を講じましょう",
      emoji: "🤔",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      ringColor: "stroke-yellow-500",
      textColor: "text-yellow-700",
    };
  } else if (probability <= 75) {
    return {
      label: "要注意！ボウズ覚悟の条件です",
      emoji: "😰",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      ringColor: "stroke-orange-500",
      textColor: "text-orange-700",
    };
  } else {
    return {
      label: "覚悟が必要！厳しい条件です",
      emoji: "😱",
      color: "text-red-600",
      bgColor: "bg-red-50",
      ringColor: "stroke-red-500",
      textColor: "text-red-700",
    };
  }
}

// --- 対策Tips生成 ---

function getTips(form: FormState, probability: number): string[] {
  const tips: string[] = [];

  if (probability <= 15) {
    tips.push("この条件は理想的！自信を持って釣行しましょう。");
    tips.push("釣果を最大化するため、到着後すぐに底の状況をチェックしてみましょう。");
    tips.push("複数の仕掛けを用意して、当たりパターンを早めに見つけましょう。");
    return tips;
  }

  if (form.experience === "first" || form.experience === "beginner") {
    tips.push("管理釣り場や堤防のサビキ釣りは初心者でも釣れやすく、ボウズ回避率が高いです。");
  }

  if (form.timeSlot === "afternoon") {
    tips.push("朝マズメ（日の出前後1〜2時間）に変更すると釣果が格段にアップします。");
  }

  if (form.weather === "heavy_rain") {
    tips.push("雨天・荒天は安全面でも危険です。天気が回復してから釣行することを強くおすすめします。");
  } else if (form.weather === "sunny") {
    tips.push("晴天の日は日中の高温を避け、朝・夕マズメに集中するのが効果的です。");
  }

  if (form.method === "lure" || form.method === "eging") {
    tips.push("ルアー・エギングはテクニックが必要です。釣れない場合はカラーや動かし方を細かく変えてみましょう。");
  }

  if (form.fishCategory === "large_pelagic") {
    tips.push("大型回遊魚は群れが来ない日は難しいです。SNSやコミュニティで最新の釣果情報を確認してから行きましょう。");
  }

  if (form.month === 1 || form.month === 2) {
    tips.push("厳冬期は魚の活性が低いです。水温が比較的高い港湾内や温排水近くを狙うと効果的です。");
  }

  if (form.spotType === "surf") {
    tips.push("砂浜（サーフ）は広いため、ランガン（歩きながら釣る）してヒットポイントを探しましょう。");
  }

  if (form.spotType === "rocky") {
    tips.push("磯は立ち入り危険な場所もあります。ライフジャケット着用と滑りにくい靴は必須です。");
  }

  // 共通Tips
  if (tips.length < 3) {
    tips.push("エサ・ルアーのカラーや大きさをこまめに変えることで、当たりパターンを発見できます。");
  }
  if (tips.length < 3) {
    tips.push("地元の釣具店で最新の釣果情報を聞いてから釣行すると、ボウズ確率が大幅に下がります。");
  }
  if (tips.length < 4) {
    tips.push("釣れない時間帯は場所移動を検討してみましょう。釣り場を変えることで状況が打開できることがあります。");
  }
  if (tips.length < 5) {
    tips.push("サビキ釣りは初心者でも数釣りしやすく、ボウズ回避の万能手段です。タックルを追加で持参するのもおすすめ。");
  }

  return tips.slice(0, 5);
}

// --- 円形ゲージ ---

function CircleGauge({ probability, result }: { probability: number; result: ResultInfo }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - probability / 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        {/* 背景円 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
        />
        {/* プログレス円 */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          className={result.ringColor}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      {/* 中央テキスト */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-800">{probability}%</span>
        <span className="text-xs text-gray-500 mt-1">ボウズ確率</span>
      </div>
    </div>
  );
}

// --- 選択ボタンコンポーネント ---

function SelectButton({
  selected,
  onClick,
  children,
  subLabel,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  subLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg border text-sm transition-all text-left ${
        selected
          ? "bg-blue-600 text-white border-blue-600 shadow-md"
          : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      <span className="font-medium block">{children}</span>
      {subLabel && (
        <span className={`text-[10px] mt-0.5 block ${selected ? "text-blue-100" : "text-gray-400"}`}>
          {subLabel}
        </span>
      )}
    </button>
  );
}

// --- セクションラベル ---

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-gray-700 mb-2">{children}</p>
  );
}

// --- クライアントコンポーネント本体 ---

export function BouzuCheckerClient() {
  const [form, setForm] = useState<FormState>({
    spotType: null,
    fishCategory: null,
    method: null,
    month: null,
    timeSlot: null,
    experience: null,
    weather: null,
  });
  const [showResult, setShowResult] = useState(false);

  const isComplete =
    form.spotType !== null &&
    form.fishCategory !== null &&
    form.method !== null &&
    form.month !== null &&
    form.timeSlot !== null &&
    form.experience !== null &&
    form.weather !== null;

  const probability = showResult ? calcBouzuProbability(form) : 0;
  const result = getResultInfo(probability);
  const tips = showResult ? getTips(form, probability) : [];

  function handleCheck() {
    if (isComplete) setShowResult(true);
  }

  function handleReset() {
    setForm({
      spotType: null,
      fishCategory: null,
      method: null,
      month: null,
      timeSlot: null,
      experience: null,
      weather: null,
    });
    setShowResult(false);
  }

  function handleShare() {
    const prob = calcBouzuProbability(form);
    const res = getResultInfo(prob);
    const text = `【ボウズ確率チェッカー】\nボウズ確率: ${prob}%\n${res.emoji} ${res.label}\n\nツリスポで事前診断 → https://tsurispot.com/bouzu-checker`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("クリップボードにコピーしました！");
      });
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
      {/* SNSシェア */}
      <div>
        <ShareButtons
          url="https://tsurispot.com/bouzu-checker"
          title="ボウズ確率チェッカー｜ツリスポ"
        />
      </div>

      {/* 入力フォーム */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Fish className="size-5 text-indigo-500" />
            釣行条件を入力してください
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-5">

          {/* 1. 釣り場タイプ */}
          <div>
            <SectionLabel>1. 釣り場タイプ</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SelectButton
                selected={form.spotType === "breakwater"}
                onClick={() => setForm({ ...form, spotType: "breakwater" })}
                subLabel="堤防・漁港"
              >
                堤防 / 漁港
              </SelectButton>
              <SelectButton
                selected={form.spotType === "surf"}
                onClick={() => setForm({ ...form, spotType: "surf" })}
                subLabel="サーフ"
              >
                砂浜（サーフ）
              </SelectButton>
              <SelectButton
                selected={form.spotType === "rocky"}
                onClick={() => setForm({ ...form, spotType: "rocky" })}
                subLabel="磯・岩場"
              >
                磯
              </SelectButton>
              <SelectButton
                selected={form.spotType === "estuary"}
                onClick={() => setForm({ ...form, spotType: "estuary" })}
                subLabel="河口・汽水域"
              >
                河口 / 汽水域
              </SelectButton>
              <SelectButton
                selected={form.spotType === "managed"}
                onClick={() => setForm({ ...form, spotType: "managed" })}
                subLabel="ほぼ釣れる"
              >
                管理釣り場
              </SelectButton>
              <SelectButton
                selected={form.spotType === "boat"}
                onClick={() => setForm({ ...form, spotType: "boat" })}
                subLabel="乗合・仕立て"
              >
                船釣り
              </SelectButton>
            </div>
          </div>

          {/* 2. 対象魚種カテゴリ */}
          <div>
            <SectionLabel>2. 対象魚種カテゴリ</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SelectButton
                selected={form.fishCategory === "small_pelagic"}
                onClick={() => setForm({ ...form, fishCategory: "small_pelagic" })}
                subLabel="アジ・イワシ等"
              >
                小型回遊魚
              </SelectButton>
              <SelectButton
                selected={form.fishCategory === "rockfish"}
                onClick={() => setForm({ ...form, fishCategory: "rockfish" })}
                subLabel="カサゴ・メバル等"
              >
                根魚
              </SelectButton>
              <SelectButton
                selected={form.fishCategory === "large_pelagic"}
                onClick={() => setForm({ ...form, fishCategory: "large_pelagic" })}
                subLabel="ブリ・マグロ等"
              >
                大型回遊魚
              </SelectButton>
              <SelectButton
                selected={form.fishCategory === "squid_octopus"}
                onClick={() => setForm({ ...form, fishCategory: "squid_octopus" })}
                subLabel="イカ・タコ"
              >
                イカ・タコ
              </SelectButton>
              <SelectButton
                selected={form.fishCategory === "freshwater"}
                onClick={() => setForm({ ...form, fishCategory: "freshwater" })}
                subLabel="バス・コイ等"
              >
                淡水魚
              </SelectButton>
              <SelectButton
                selected={form.fishCategory === "any"}
                onClick={() => setForm({ ...form, fishCategory: "any" })}
                subLabel="何でもOK"
              >
                特に決めていない
              </SelectButton>
            </div>
          </div>

          {/* 3. 釣法 */}
          <div>
            <SectionLabel>3. 釣法</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SelectButton
                selected={form.method === "sabiki"}
                onClick={() => setForm({ ...form, method: "sabiki" })}
                subLabel="数釣りしやすい"
              >
                サビキ
              </SelectButton>
              <SelectButton
                selected={form.method === "lure"}
                onClick={() => setForm({ ...form, method: "lure" })}
                subLabel="テクニックが必要"
              >
                ルアー
              </SelectButton>
              <SelectButton
                selected={form.method === "float"}
                onClick={() => setForm({ ...form, method: "float" })}
                subLabel="ウキ釣り"
              >
                エサ釣り（ウキ）
              </SelectButton>
              <SelectButton
                selected={form.method === "casting"}
                onClick={() => setForm({ ...form, method: "casting" })}
                subLabel="投げ釣り"
              >
                エサ釣り（投げ）
              </SelectButton>
              <SelectButton
                selected={form.method === "eging"}
                onClick={() => setForm({ ...form, method: "eging" })}
                subLabel="エギング"
              >
                エギング
              </SelectButton>
              <SelectButton
                selected={form.method === "other"}
                onClick={() => setForm({ ...form, method: "other" })}
                subLabel="その他"
              >
                その他
              </SelectButton>
            </div>
          </div>

          {/* 4. 時期（月） */}
          <div>
            <SectionLabel>4. 時期（月）</SectionLabel>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
              {months.map((m) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, month: m })}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    form.month === m
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                  }`}
                >
                  {m}月
                </button>
              ))}
            </div>
          </div>

          {/* 5. 時間帯 */}
          <div>
            <SectionLabel>5. 時間帯</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <SelectButton
                selected={form.timeSlot === "dawn"}
                onClick={() => setForm({ ...form, timeSlot: "dawn" })}
                subLabel="4〜7時"
              >
                朝マズメ
              </SelectButton>
              <SelectButton
                selected={form.timeSlot === "morning"}
                onClick={() => setForm({ ...form, timeSlot: "morning" })}
                subLabel="8〜11時"
              >
                午前
              </SelectButton>
              <SelectButton
                selected={form.timeSlot === "afternoon"}
                onClick={() => setForm({ ...form, timeSlot: "afternoon" })}
                subLabel="12〜15時"
              >
                午後
              </SelectButton>
              <SelectButton
                selected={form.timeSlot === "dusk"}
                onClick={() => setForm({ ...form, timeSlot: "dusk" })}
                subLabel="16〜18時"
              >
                夕マズメ
              </SelectButton>
              <SelectButton
                selected={form.timeSlot === "night"}
                onClick={() => setForm({ ...form, timeSlot: "night" })}
                subLabel="19〜3時"
              >
                夜
              </SelectButton>
            </div>
          </div>

          {/* 6. 経験レベル */}
          <div>
            <SectionLabel>6. 経験レベル</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SelectButton
                selected={form.experience === "first"}
                onClick={() => setForm({ ...form, experience: "first" })}
                subLabel="今回が初めて"
              >
                初めて
              </SelectButton>
              <SelectButton
                selected={form.experience === "beginner"}
                onClick={() => setForm({ ...form, experience: "beginner" })}
                subLabel="数回経験あり"
              >
                初心者
              </SelectButton>
              <SelectButton
                selected={form.experience === "intermediate"}
                onClick={() => setForm({ ...form, experience: "intermediate" })}
                subLabel="月1〜2回釣行"
              >
                中級者
              </SelectButton>
              <SelectButton
                selected={form.experience === "advanced"}
                onClick={() => setForm({ ...form, experience: "advanced" })}
                subLabel="週1以上"
              >
                上級者
              </SelectButton>
            </div>
          </div>

          {/* 7. 天候 */}
          <div>
            <SectionLabel>7. 天候</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SelectButton
                selected={form.weather === "sunny"}
                onClick={() => setForm({ ...form, weather: "sunny" })}
                subLabel="快晴"
              >
                晴れ
              </SelectButton>
              <SelectButton
                selected={form.weather === "cloudy"}
                onClick={() => setForm({ ...form, weather: "cloudy" })}
                subLabel="実は好条件"
              >
                曇り
              </SelectButton>
              <SelectButton
                selected={form.weather === "light_rain"}
                onClick={() => setForm({ ...form, weather: "light_rain" })}
                subLabel="小降り"
              >
                小雨
              </SelectButton>
              <SelectButton
                selected={form.weather === "heavy_rain"}
                onClick={() => setForm({ ...form, weather: "heavy_rain" })}
                subLabel="荒天・強雨"
              >
                雨 / 荒天
              </SelectButton>
            </div>
          </div>

          {/* 診断ボタン */}
          <div className="pt-2">
            <button
              onClick={handleCheck}
              disabled={!isComplete}
              className={`w-full py-3.5 rounded-xl text-base font-bold transition-all shadow-md ${
                isComplete
                  ? "bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:from-indigo-700 hover:to-purple-600 active:scale-95"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isComplete ? "ボウズ確率を診断する" : "すべての項目を選択してください"}
            </button>
            {!isComplete && (
              <p className="text-center text-xs text-gray-400 mt-2">
                全7項目を選択すると診断できます
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 診断結果 */}
      {showResult && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className={`border-2 ${result.bgColor} border-opacity-50`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle className={`size-5 ${result.color}`} />
                診断結果
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-5">
              {/* 円形ゲージ */}
              <div className="flex flex-col items-center gap-3 py-4">
                <CircleGauge probability={probability} result={result} />
                <div className={`text-center px-4 py-2 rounded-full ${result.bgColor}`}>
                  <p className={`font-bold text-base ${result.color}`}>
                    {result.emoji} {result.label}
                  </p>
                </div>
              </div>

              {/* 対策Tips */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="size-4 text-amber-500" />
                  ボウズ回避Tips
                </h3>
                <div className="space-y-2">
                  {tips.map((tip, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleReset}
                >
                  <RefreshCw className="size-4" />
                  もう一度診断
                </Button>
                <Button
                  className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleShare}
                >
                  <Share2 className="size-4" />
                  結果をシェア
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 関連ページリンク */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
        <Link href="/recommendation">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2.5">
                <Fish className="size-5 text-orange-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">今日のおすすめスポット</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  潮回りも考慮した最適な釣り場を提案
                </p>
              </div>
              <ChevronRight className="size-4 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/spots">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2.5">
                <MapPin className="size-5 text-blue-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">釣りスポット一覧</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  全国の人気釣り場から条件に合う場所を探す
                </p>
              </div>
              <ChevronRight className="size-4 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/tides">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-cyan-100 p-2.5">
                <Waves className="size-5 text-cyan-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">潮見表・潮汐情報</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  今日の潮回りと満潮・干潮時刻を確認
                </p>
              </div>
              <ChevronRight className="size-4 text-gray-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/beginner-checklist">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2.5">
                <CheckCircle className="size-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">初心者チェックリスト</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  釣行前の準備を漏れなくチェック
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
