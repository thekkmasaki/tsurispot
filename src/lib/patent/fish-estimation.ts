/**
 * fish-estimation.ts
 *
 * 魚種推定部（特許の構成130）— 環境パラメータ統合。
 * 構造物由来の基礎スコア（estimatedFish.probability）に対し、
 * 請求項4の環境パラメータ（季節・地域・潮汐・水温）と
 * 請求項11の釣果フィードバック（実釣果報告によるブースト）を掛け合わせ、
 * 「今このスポットで狙いやすい魚」を動的に再スコアリングする。
 *
 * 決定論的な純関数のみ（now は呼び出し側から注入）。
 */

import { getMoonAge, getTideInfo } from "@/lib/weather/calculations";
import type { SpotAnalysisResult, EstimatedFish } from "./types";

// ---------------------------------------------------------------------------
// 型
// ---------------------------------------------------------------------------

/** 環境パラメータ適用後の魚種スコア（既存フィールドは不変＝後方互換） */
export interface ScoredEstimatedFish extends EstimatedFish {
  /** 環境パラメータ適用後のおすすめ度（0.05-0.98） */
  adjustedProbability: number;
  /** 現在月がシーズン内か */
  inSeasonNow: boolean;
  /** このスポットでの実釣果報告数（魚名一致分） */
  catchReportCount: number;
  /** 表示用おすすめレベル */
  recommendLevel: "high" | "mid" | "low";
}

/** スポット実データ（catchableFish）の照合用情報 */
export interface SpotCatchableFishInfo {
  name: string;
  monthStart: number;
  monthEnd: number;
  peakSeason?: boolean;
}

export interface EstimationContext {
  /** 評価基準日時（サーバー側で new Date() を注入） */
  now: Date;
  latitude: number;
  longitude: number;
  /** スポットの実データ（釣れる魚）— 地域情報パラメータとして使用 */
  catchableFish: SpotCatchableFishInfo[];
  /** スポット×魚名の実釣果報告数（請求項11: フィードバック） */
  catchCounts?: Record<string, number>;
}

// ---------------------------------------------------------------------------
// 魚名の表記ゆれ正規化（地域名・俗称 → 魚種データの正式名称）
// ---------------------------------------------------------------------------

const FISH_NAME_ALIASES: Record<string, string> = {
  スズキ: "シーバス",
  チヌ: "クロダイ",
  グレ: "メジナ",
  ガシラ: "カサゴ",
  アコウ: "キジハタ",
  ソイ: "クロソイ",
  ハマチ: "ブリ",
  メジロ: "ブリ",
  ワラサ: "ブリ",
  シロギス: "キス",
};

export function normalizeFishName(name: string): string {
  const trimmed = name.trim();
  return FISH_NAME_ALIASES[trimmed] ?? trimmed;
}

// 潮汐の影響を強く受ける回遊性魚種（請求項4: 潮汐情報の適用対象）
const MIGRATORY_FISH = new Set(
  [
    "アジ",
    "サバ",
    "イワシ",
    "ブリ",
    "イナダ",
    "カンパチ",
    "ヒラマサ",
    "タチウオ",
    "サワラ",
    "カツオ",
    "ソウダガツオ",
    "サヨリ",
    "カマス",
    "シーバス",
  ].map(normalizeFishName)
);

// ---------------------------------------------------------------------------
// 季節判定（「5月〜11月」「11月〜4月」「通年」の年跨ぎ対応）
// ---------------------------------------------------------------------------

export function parseSeasonRange(
  season: string
): { start: number; end: number } | null {
  if (!season || season.includes("通年")) return null;
  const m = season.match(/(\d{1,2})月[〜~-](\d{1,2})月/);
  if (!m) return null;
  return { start: Number(m[1]), end: Number(m[2]) };
}

export function isMonthInRange(
  month: number,
  start: number,
  end: number
): boolean {
  if (start <= end) return month >= start && month <= end;
  // 年をまたぐ場合（例: 11月〜4月）
  return month >= start || month <= end;
}

// ---------------------------------------------------------------------------
// 環境係数
// ---------------------------------------------------------------------------

/** 季節係数: シーズン内 1.0 / シーズン外 0.45（通年は1.0） */
function seasonFactor(fish: EstimatedFish, month: number): { f: number; inSeason: boolean } {
  const range = parseSeasonRange(fish.season);
  if (!range) return { f: 1.0, inSeason: true };
  const inSeason = isMonthInRange(month, range.start, range.end);
  return { f: inSeason ? 1.0 : 0.45, inSeason };
}

/**
 * 地域係数（請求項4: 地域情報）:
 * スポットの実データ（catchableFish）と照合し、実際にその海域で
 * 釣れるとされる魚を優遇、データにない魚をやや減点する。
 */
function regionFactor(
  fishName: string,
  month: number,
  catchableFish: SpotCatchableFishInfo[]
): number {
  const target = normalizeFishName(fishName);
  const match = catchableFish.find((cf) => normalizeFishName(cf.name) === target);
  if (!match) return 0.9;

  let f = 1.15;
  if (isMonthInRange(month, match.monthStart, match.monthEnd)) {
    f *= 1.1;
    if (match.peakSeason) f *= 1.05;
  }
  return f;
}

/**
 * 潮汐係数（請求項4: 潮汐情報）:
 * 月齢から潮回り（大潮〜長潮）を求め、回遊性魚種のみに適用する。
 * fishingScore 1-5 → 0.96〜1.04
 */
function tideFactor(fishName: string, now: Date, lng: number): number {
  if (!MIGRATORY_FISH.has(normalizeFishName(fishName))) return 1.0;
  const score = getTideInfo(getMoonAge(now), lng).fishingScore;
  return 0.96 + (score - 1) * 0.02;
}

/**
 * 水温係数（請求項4: 水温情報の季節近似）:
 * 海水温は気温に約2ヶ月遅行する（最冷2-3月・最暖8-9月）。
 * 月別の活性係数に緯度帯補正を加える。
 */
const WATER_TEMP_FACTOR: Record<number, number> = {
  1: 0.93, 2: 0.92, 3: 0.92, 4: 0.95, 5: 1.0, 6: 1.03,
  7: 1.04, 8: 1.05, 9: 1.05, 10: 1.03, 11: 1.0, 12: 0.95,
};

function waterTempFactor(month: number, latitude: number): number {
  let f = WATER_TEMP_FACTOR[month] ?? 1.0;
  const isColdSeason = month === 12 || month <= 4;
  if (latitude >= 37 && isColdSeason) f -= 0.02; // 北日本は低水温の影響が大きい
  if (latitude < 34 && isColdSeason) f += 0.01; // 南日本は冬も比較的高活性
  return Math.min(1.05, Math.max(0.88, f));
}

/** 釣果フィードバックブースト（請求項11）: +min(0.15, 0.03×報告数) */
function catchBoost(fishName: string, catchCounts?: Record<string, number>): {
  boost: number;
  count: number;
} {
  if (!catchCounts) return { boost: 0, count: 0 };
  const count = catchCounts[normalizeFishName(fishName)] ?? 0;
  return { boost: Math.min(0.15, 0.03 * count), count };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

// ---------------------------------------------------------------------------
// メイン: 環境パラメータ適用
// ---------------------------------------------------------------------------

export function scoreEstimatedFish(
  fish: EstimatedFish,
  ctx: EstimationContext
): ScoredEstimatedFish {
  const month = ctx.now.getMonth() + 1;

  const { f: fSeason, inSeason } = seasonFactor(fish, month);
  const fRegion = regionFactor(fish.name, month, ctx.catchableFish);
  const fTide = tideFactor(fish.name, ctx.now, ctx.longitude);
  const fTemp = waterTempFactor(month, ctx.latitude);
  const { boost, count } = catchBoost(fish.name, ctx.catchCounts);

  const adjusted = clamp(
    fish.probability * fSeason * fRegion * fTide * fTemp + boost,
    0.05,
    0.98
  );

  return {
    ...fish,
    adjustedProbability: Math.round(adjusted * 100) / 100,
    inSeasonNow: inSeason,
    catchReportCount: count,
    recommendLevel: adjusted >= 0.72 ? "high" : adjusted >= 0.45 ? "mid" : "low",
  };
}

/**
 * 解析結果の全ゾーンに環境パラメータ推定を適用し、
 * estimatedFish を adjustedProbability 降順に並べ替えて返す。
 * ScoredEstimatedFish は EstimatedFish の上位互換のため戻り値は
 * SpotAnalysisResult としてそのまま既存コンポーネントに渡せる。
 */
export function applyEnvironmentalEstimation(
  analysis: SpotAnalysisResult,
  ctx: EstimationContext
): SpotAnalysisResult {
  return {
    ...analysis,
    zones: analysis.zones.map((zone) => ({
      ...zone,
      estimatedFish: zone.estimatedFish
        .map((f) => scoreEstimatedFish(f, ctx))
        .sort((a, b) => b.adjustedProbability - a.adjustedProbability),
    })),
  };
}

/**
 * ゾーン横断の「今月のおすすめ」トップN（重複魚種は最高スコアを採用）。
 * SatelliteAnalysisSection の月間レコメンド表示用。
 */
export function getMonthlyTopFish(
  analysis: SpotAnalysisResult,
  ctx: EstimationContext,
  limit = 5
): ScoredEstimatedFish[] {
  const best = new Map<string, ScoredEstimatedFish>();
  for (const zone of analysis.zones) {
    for (const f of zone.estimatedFish) {
      const scored = scoreEstimatedFish(f, ctx);
      const key = normalizeFishName(scored.name);
      const prev = best.get(key);
      if (!prev || scored.adjustedProbability > prev.adjustedProbability) {
        best.set(key, scored);
      }
    }
  }
  return [...best.values()]
    .sort((a, b) => b.adjustedProbability - a.adjustedProbability)
    .slice(0, limit);
}
