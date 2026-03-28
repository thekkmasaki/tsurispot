"use client";

import { useMemo, useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Fish, HelpCircle, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type CatchableFishInfo,
  type SpotBouzuCardProps,
  calcSpotBouzuProbability,
  getMethodCorrection,
  getFishCatchabilityCorrection,
  getSeasonFishCorrection,
  getAreaPressure,
  getMonthCorrection,
} from "@/lib/bouzu-calculator";

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
  } else if (probability <= 65) {
    return { label: "やや厳しい条件", color: "text-orange-600", bgColor: "bg-orange-50", icon: AlertTriangle };
  } else if (probability <= 80) {
    return { label: "かなり厳しい", color: "text-red-500", bgColor: "bg-red-50", icon: AlertTriangle };
  } else {
    return { label: "ほぼ釣れない", color: "text-red-700", bgColor: "bg-red-100", icon: AlertTriangle };
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

  // 地域差（エリア単位で判定）
  const pressure = getAreaPressure(props.prefecture, props.areaName);
  const areaLabel = `${props.prefecture} ${props.areaName}`;
  if (pressure >= 10) {
    items.push({ label: `所在地（${areaLabel}）`, effect: "都市部で釣り圧が高い", positive: false });
  } else if (pressure >= 4) {
    items.push({ label: `所在地（${areaLabel}）`, effect: "やや釣り圧あり", positive: false });
  } else if (pressure <= -4) {
    items.push({ label: `所在地（${areaLabel}）`, effect: "釣り圧が低く好条件", positive: true });
  } else {
    items.push({ label: `所在地（${areaLabel}）`, effect: "平均的な釣り圧", positive: true });
  }

  // 月別
  const monthCorr = getMonthCorrection(currentMonth, props.spotType);
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

  // === 釣果データベースに基づく新しい根拠 ===
  if (props.catchableFishDetails && props.catchableFishDetails.length > 0) {
    // 釣り方別の根拠
    const methodResult = getMethodCorrection(props.catchableFishDetails, currentMonth, props.spotType);
    if (methodResult.primaryMethod && methodResult.primaryMethodRate !== null) {
      const methodRate = methodResult.primaryMethodRate;
      items.push({
        label: `主な釣り方（${methodResult.primaryMethod}）`,
        effect: methodRate <= 20
          ? `平均ボウズ率 約${methodRate}%（釣れやすい）`
          : methodRate <= 35
          ? `平均ボウズ率 約${methodRate}%（標準的）`
          : methodRate <= 50
          ? `平均ボウズ率 約${methodRate}%（やや難しい）`
          : `平均ボウズ率 約${methodRate}%（技術が必要）`,
        positive: methodRate <= 35,
      });
    }

    // 群れ魚の有無
    const fishResult = getFishCatchabilityCorrection(props.catchableFishDetails, currentMonth);
    if (fishResult.hasSchoolingFish) {
      const names = fishResult.schoolingFishNames.slice(0, 3).join("・");
      items.push({
        label: `群れ魚（${names}）`,
        effect: "群れに当たれば数釣りが期待できる",
        positive: true,
      });
    } else if (fishResult.hasDifficultFish) {
      items.push({
        label: "対象魚の難易度",
        effect: "難易度の高い魚種が含まれる",
        positive: false,
      });
    }

    // シーズン中の魚の数
    const seasonResult = getSeasonFishCorrection(props.catchableFishDetails, currentMonth);
    if (seasonResult.inSeasonCount === 0) {
      items.push({
        label: "シーズン状況",
        effect: "今月シーズン中の魚がいない",
        positive: false,
      });
    } else if (seasonResult.peakSeasonCount >= 2) {
      items.push({
        label: `シーズン状況（${seasonResult.peakSeasonCount}種がピーク）`,
        effect: "複数の魚種がベストシーズン",
        positive: true,
      });
    } else if (seasonResult.inSeasonCount >= 3) {
      items.push({
        label: `シーズン状況（${seasonResult.inSeasonCount}種が対象）`,
        effect: "多くの魚種がシーズン中",
        positive: true,
      });
    }
  }

  return items;
}

// 釣果データに基づくワンポイントアドバイス
function getDataDrivenTip(
  props: SpotBouzuCardProps,
  currentMonth: number,
  probability: number
): string | null {
  if (!props.catchableFishDetails || props.catchableFishDetails.length === 0) return null;

  const methodResult = getMethodCorrection(props.catchableFishDetails, currentMonth, props.spotType);
  const fishResult = getFishCatchabilityCorrection(props.catchableFishDetails, currentMonth);

  if (probability <= 30) {
    if (fishResult.hasSchoolingFish) {
      const names = fishResult.schoolingFishNames.slice(0, 2).join("・");
      return `${names}などの群れ魚が狙えるため、サビキ釣りなら初心者でも高確率で釣果が期待できます。`;
    }
    if (methodResult.primaryMethod && methodResult.primaryMethodRate && methodResult.primaryMethodRate <= 25) {
      return `${methodResult.primaryMethod}は比較的ボウズしにくい釣り方です。基本を押さえれば釣果が見込めます。`;
    }
    return "この釣り場は今の時期、比較的釣れやすい条件が揃っています。";
  } else if (probability <= 50) {
    if (methodResult.primaryMethod) {
      return `${methodResult.primaryMethod}でしっかり準備し、朝マズメ・夕マズメを狙えば釣果が期待できます。`;
    }
    return "しっかり準備して朝マズメを狙えば、釣果が期待できます。";
  } else if (probability <= 75) {
    if (fishResult.hasSchoolingFish) {
      const names = fishResult.schoolingFishNames.slice(0, 2).join("・");
      return `${names}を狙ったサビキ釣りに切り替えることで、ボウズ回避の可能性が上がります。`;
    }
    if (methodResult.primaryMethod) {
      return `${methodResult.primaryMethod}は技術と経験が求められます。時期やタイミングを工夫して挑みましょう。`;
    }
    return "時期やタイミングを工夫して、ボウズ回避を目指しましょう。";
  } else {
    // 80%以上: 正直に「今は行くべきでない」と伝える
    if (props.spotType === "river" && [10, 11, 12, 1, 2].includes(currentMonth)) {
      return "禁漁期の可能性があります。渓流の解禁日を確認してから計画を立てましょう。";
    }
    return "この時期は魚の活性が非常に低く、ベテランでもボウズが当たり前です。暖かくなるまで待つのが賢明です。";
  }
}

const MONTH_NAMES = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function SpotBouzuCard(props: SpotBouzuCardProps) {
  // useEffect でマウント後に月を設定（SSGビルド時とのハイドレーション不一致防止）
  const [currentMonth, setCurrentMonth] = useState(0);
  useEffect(() => { setCurrentMonth(new Date().getMonth() + 1); }, []);
  const probability = useMemo(() => currentMonth ? calcSpotBouzuProbability(props, currentMonth) : 0, [props, currentMonth]);
  const result = useMemo(() => getResultInfo(probability), [probability]);
  const breakdown = useMemo(() => currentMonth ? getBreakdown(props, currentMonth) : [], [props, currentMonth]);
  const dataTip = useMemo(() => currentMonth ? getDataDrivenTip(props, currentMonth, probability) : "", [props, currentMonth, probability]);

  const hasDataEnhancement = props.catchableFishDetails && props.catchableFishDetails.length > 0;

  const Icon = result.icon;

  if (!currentMonth) return null;

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
              {dataTip ?? (
                probability <= 30
                  ? "この釣り場は今の時期、比較的釣れやすい条件が揃っています。"
                  : probability <= 50
                  ? "しっかり準備して朝マズメを狙えば、釣果が期待できます。"
                  : "時期やタイミングを工夫して、ボウズ回避を目指しましょう。"
              )}
            </p>
          </div>
        </div>

        {/* 根拠の内訳 */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            {hasDataEnhancement && <BarChart3 className="h-3.5 w-3.5" />}
            計算の根拠
            {hasDataEnhancement && (
              <span className="text-[10px] font-normal text-blue-600 ml-1">釣果データ反映</span>
            )}
          </p>
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

        {/* 釣果データに基づく統計情報 */}
        {hasDataEnhancement && (() => {
          const methodResult = getMethodCorrection(props.catchableFishDetails!, currentMonth, props.spotType);
          if (!methodResult.primaryMethod) return null;
          return (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-[11px] font-semibold text-blue-700 mb-1 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                釣果データに基づく参考情報
              </p>
              <p className="text-[11px] text-blue-600 leading-relaxed">
                {methodResult.primaryMethod}の全国平均ボウズ率は約{methodResult.primaryMethodRate}%です。
                {methodResult.methodDescription && ` ${methodResult.methodDescription}。`}
              </p>
            </div>
          );
        })()}

        {/* 注釈 */}
        <p className="text-[10px] text-muted-foreground leading-relaxed border-t pt-3">
          ※ ボウズ確率は釣り場タイプ・所在地の釣り圧・時期・対象魚種数・難易度・評価スコアに加え、
          全国の釣果報告データに基づく釣り方別ボウズ率・魚種別釣りやすさ係数から算出した参考値です。
          実際の釣果は天候・潮回り・時間帯・技術・エサ選びによって大きく変動します。
        </p>
      </CardContent>
    </Card>
  );
}
