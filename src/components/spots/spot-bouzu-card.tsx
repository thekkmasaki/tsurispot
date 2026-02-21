"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle, Fish, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SpotBouzuCardProps {
  spotType: string;
  difficulty: string;
  rating: number;
  reviewCount: number;
  prefecture: string;
  isFree: boolean;
  hasRentalRod: boolean;
  catchableFishCount: number;
}

// 都道府県ごとの釣り圧補正（都会ほどプラス＝ボウズ確率UP）
const PREFECTURE_PRESSURE: Record<string, number> = {
  // 大都市圏（高い釣り圧）
  "東京": 18, "神奈川": 14, "大阪": 14, "愛知": 12, "埼玉": 15,
  "千葉": 8, "兵庫": 8, "福岡": 6, "京都": 10,
  // 中規模都市圏
  "静岡": 2, "広島": 4, "宮城": 4, "新潟": 0, "岡山": 4,
  "三重": 0, "長崎": -2, "和歌山": -2, "石川": 0, "富山": 0,
  // 地方（低い釣り圧 → マイナス）
  "北海道": -8, "沖縄": -6, "鹿児島": -6, "宮崎": -6,
  "高知": -8, "徳島": -4, "愛媛": -4, "香川": -2,
  "大分": -4, "熊本": -4, "佐賀": -4, "山口": -4,
  "鳥取": -6, "島根": -6, "福井": -4, "山形": -6,
  "秋田": -8, "岩手": -8, "青森": -6,
  "茨城": 4, "栃木": 6, "群馬": 8, "山梨": 6, "長野": 4,
  "岐阜": 4, "滋賀": 6, "奈良": 10, "福島": -2,
};

function getPrefecturePressure(prefecture: string): number {
  // 都府県を除いた名前でマッチング
  const key = prefecture.replace(/[都道府県]$/, "");
  return PREFECTURE_PRESSURE[key] ?? 0;
}

// 月別の釣れやすさ補正
function getMonthCorrection(month: number): number {
  // 6-10月はハイシーズン（ボウズ確率低下）、1-2月は厳冬期（ボウズ確率上昇）
  const corrections: Record<number, number> = {
    1: 18, 2: 15, 3: 8, 4: 0, 5: -5,
    6: -10, 7: -12, 8: -10, 9: -8, 10: -5,
    11: 2, 12: 12,
  };
  return corrections[month] ?? 0;
}

function calcSpotBouzuProbability(
  props: SpotBouzuCardProps,
  currentMonth: number
): number {
  // 1. 釣り場タイプ別のベーススコア
  const spotTypeBase: Record<string, number> = {
    port: 22,
    pier: 25,
    breakwater: 25,
    beach: 40,
    rocky: 38,
    river: 35,
  };
  let score = spotTypeBase[props.spotType] ?? 30;

  // 2. 難易度補正
  const difficultyMod: Record<string, number> = {
    beginner: -8,
    intermediate: 0,
    advanced: 8,
  };
  score += difficultyMod[props.difficulty] ?? 0;

  // 3. 地域差（都会vs田舎）
  score += getPrefecturePressure(props.prefecture);

  // 4. 月別補正
  score += getMonthCorrection(currentMonth);

  // 5. 評価スコアによる補正（高評価＝釣れやすい）
  if (props.rating >= 4.5) score -= 8;
  else if (props.rating >= 4.0) score -= 4;
  else if (props.rating >= 3.5) score -= 2;
  else if (props.rating < 3.0) score += 5;

  // 6. レンタル竿あり（管理的な場所→ボウズしにくい）
  if (props.hasRentalRod) score -= 5;

  // 7. 魚種の多さ（多い＝何かしら釣れやすい）
  if (props.catchableFishCount >= 8) score -= 6;
  else if (props.catchableFishCount >= 5) score -= 3;
  else if (props.catchableFishCount <= 2) score += 5;

  // 8. 無料スポット（人が多い→やや釣り圧）
  if (props.isFree) score += 3;

  return Math.max(5, Math.min(95, score));
}

interface ResultInfo {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof CheckCircle;
}

function getResultInfo(probability: number): ResultInfo {
  if (probability <= 20) {
    return { label: "かなり釣れやすい", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle };
  } else if (probability <= 35) {
    return { label: "釣れる可能性が高い", color: "text-blue-600", bgColor: "bg-blue-50", icon: CheckCircle };
  } else if (probability <= 50) {
    return { label: "準備次第で釣れる", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: HelpCircle };
  } else if (probability <= 70) {
    return { label: "やや厳しい条件", color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertTriangle };
  } else {
    return { label: "厳しい条件", color: "text-red-600", bgColor: "bg-red-50", icon: AlertTriangle };
  }
}

// スコアの内訳を説明するためのブレイクダウン
function getBreakdown(
  props: SpotBouzuCardProps,
  currentMonth: number
): { label: string; effect: string; positive: boolean }[] {
  const items: { label: string; effect: string; positive: boolean }[] = [];

  // 釣り場タイプ
  const typeLabels: Record<string, string> = {
    port: "漁港", pier: "桟橋", breakwater: "堤防", beach: "砂浜", rocky: "磯", river: "河川",
  };
  const typeBase: Record<string, number> = { port: 22, pier: 25, breakwater: 25, beach: 40, rocky: 38, river: 35 };
  const base = typeBase[props.spotType] ?? 30;
  items.push({
    label: `釣り場タイプ（${typeLabels[props.spotType] ?? props.spotType}）`,
    effect: base <= 25 ? "釣れやすい" : base <= 35 ? "普通" : "やや難しい",
    positive: base <= 30,
  });

  // 地域差
  const pressure = getPrefecturePressure(props.prefecture);
  if (pressure >= 10) {
    items.push({ label: `所在地（${props.prefecture}）`, effect: "都市部で釣り圧が高い", positive: false });
  } else if (pressure >= 4) {
    items.push({ label: `所在地（${props.prefecture}）`, effect: "やや釣り圧あり", positive: false });
  } else if (pressure <= -4) {
    items.push({ label: `所在地（${props.prefecture}）`, effect: "釣り圧が低く好条件", positive: true });
  } else {
    items.push({ label: `所在地（${props.prefecture}）`, effect: "平均的な釣り圧", positive: true });
  }

  // 月別
  const monthCorr = getMonthCorrection(currentMonth);
  const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  if (monthCorr <= -5) {
    items.push({ label: `時期（${monthNames[currentMonth]}）`, effect: "ハイシーズンで好条件", positive: true });
  } else if (monthCorr >= 10) {
    items.push({ label: `時期（${monthNames[currentMonth]}）`, effect: "オフシーズンで厳しい", positive: false });
  } else {
    items.push({ label: `時期（${monthNames[currentMonth]}）`, effect: "まずまずの時期", positive: true });
  }

  // 魚種数
  if (props.catchableFishCount >= 5) {
    items.push({ label: `対象魚種（${props.catchableFishCount}種）`, effect: "多くの魚種が狙える", positive: true });
  } else if (props.catchableFishCount <= 2) {
    items.push({ label: `対象魚種（${props.catchableFishCount}種）`, effect: "狙える魚種が少ない", positive: false });
  }

  return items;
}

const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function SpotBouzuCard(props: SpotBouzuCardProps) {
  const currentMonth = useMemo(() => new Date().getMonth() + 1, []);
  const probability = useMemo(() => calcSpotBouzuProbability(props, currentMonth), [props, currentMonth]);
  const result = useMemo(() => getResultInfo(probability), [probability]);
  const breakdown = useMemo(() => getBreakdown(props, currentMonth), [props, currentMonth]);

  const Icon = result.icon;

  return (
    <Card className="overflow-hidden">
      <div className={cn("px-4 py-3 flex items-center gap-2", result.bgColor)}>
        <Fish className={cn("h-5 w-5", result.color)} />
        <h3 className="font-bold text-sm">今日のボウズ確率</h3>
        <span className="text-xs text-muted-foreground ml-auto">{MONTH_NAMES[currentMonth - 1]}時点</span>
      </div>
      <CardContent className="p-4 space-y-4">
        {/* メイン結果 */}
        <div className="flex items-center gap-4">
          <div className={cn("flex items-center justify-center rounded-2xl w-20 h-20", result.bgColor)}>
            <span className={cn("text-3xl font-bold", result.color)}>{probability}%</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <Icon className={cn("h-4 w-4", result.color)} />
              <span className={cn("font-semibold text-sm", result.color)}>{result.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {probability <= 30
                ? "この釣り場は今の時期、比較的釣れやすい条件が揃っています。"
                : probability <= 50
                ? "しっかり準備して朝マズメを狙えば、釣果が期待できます。"
                : "時期やタイミングを工夫して、ボウズ回避を目指しましょう。"}
            </p>
          </div>
        </div>

        {/* 根拠の内訳 */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">計算の根拠</p>
          <div className="space-y-1.5">
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-600">{item.label}</span>
                <span className={cn(
                  "font-medium",
                  item.positive ? "text-green-600" : "text-orange-600"
                )}>
                  {item.effect}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 注釈 */}
        <p className="text-[10px] text-muted-foreground leading-relaxed border-t pt-3">
          ※ ボウズ確率は釣り場タイプ・所在地の釣り圧・時期・対象魚種数・難易度・評価スコアなどから独自に算出した参考値です。
          実際の釣果は天候・潮回り・時間帯・技術によって大きく変動します。
        </p>
      </CardContent>
    </Card>
  );
}
