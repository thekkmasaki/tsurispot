import type { StructureCategory } from "@/types";
import { STRUCTURE_CATEGORY_LABELS } from "@/types";
import {
  structureFishMapping,
  getStructureFishSlugs,
  getStructureMethods,
} from "@/lib/data/structure-fish-mapping";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MonthlyRecommendationFish {
  name: string;
  method: string;
  recommendLevel: "high" | "mid" | "low";
  catchReportCount: number;
  inSeasonNow: boolean;
}

interface SatelliteAnalysisSectionProps {
  structureTypes: StructureCategory[];
  spotName: string;
  spotType: string;
  /** 実際に航空写真をAI解析した結果か（true=実解析スポット / false=釣り場タイプ由来の一般的想定）。
   *  false のときは「衛星/AI解析で検出」と断言しない（虚偽表示防止）。 */
  isAnalyzed?: boolean;
  /** 環境パラメータ（季節・地域・潮汐・水温）適用後の今月のおすすめ魚種（実解析スポットのみ） */
  monthlyRecommendation?: {
    month: number;
    fish: MonthlyRecommendationFish[];
  };
}

const RECOMMEND_MARK: Record<MonthlyRecommendationFish["recommendLevel"], string> = {
  high: "◎", // ◎
  mid: "○",  // ○
  low: "△",  // △
};

// ---------------------------------------------------------------------------
// Visual icon mapping per structure category
// ---------------------------------------------------------------------------

const STRUCTURE_ICONS: Record<StructureCategory, string> = {
  seawall: "\u{1F3D7}\u{FE0F}",       // 🏗️
  tetrapod: "\u{1F53A}",              // 🔺
  rocky: "\u{1FAA8}",                 // 🪨
  sandy: "\u{1F3D6}\u{FE0F}",        // 🏖️
  pier: "\u{1F309}",                  // 🌉
  "port-facility": "\u2693",          // ⚓
  "other-structure": "\u{1F3E0}",     // 🏠
  water: "\u{1F30A}",                 // 🌊
  land: "\u{1F3D4}\u{FE0F}",         // 🏔️
};

// ---------------------------------------------------------------------------
// Fish slug → Japanese name mapping
// ---------------------------------------------------------------------------

const FISH_SLUG_LABELS: Record<string, string> = {
  aji: "アジ",
  saba: "サバ",
  iwashi: "イワシ",
  suzuki: "スズキ",
  kurodai: "クロダイ",
  mebaru: "メバル",
  kasago: "カサゴ",
  ainame: "アイナメ",
  soi: "ソイ",
  mejina: "メジナ",
  akou: "アコウ",
  ishidai: "イシダイ",
  karei: "カレイ",
  kisu: "シロギス",
  hirame: "ヒラメ",
};

// ---------------------------------------------------------------------------
// Method slug → Japanese name mapping
// ---------------------------------------------------------------------------

const METHOD_SLUG_LABELS: Record<string, string> = {
  sabiki: "サビキ釣り",
  "uki-zuri": "ウキ釣り",
  "choi-nage": "ちょい投げ",
  "ana-zuri": "穴釣り",
  mebaring: "メバリング",
  "hechi-zuri": "ヘチ釣り",
  fukase: "フカセ釣り",
  "kago-zuri": "カゴ釣り",
  "nage-zuri": "投げ釣り",
  "surf-casting": "サーフキャスティング",
  ajing: "アジング",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SatelliteAnalysisSection({
  structureTypes,
  spotName,
  isAnalyzed = false,
  monthlyRecommendation,
}: SatelliteAnalysisSectionProps) {
  if (structureTypes.length === 0) return null;

  const fishSlugs = getStructureFishSlugs(structureTypes);
  const methods = getStructureMethods(structureTypes);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          {"\u{1F6F0}\u{FE0F}"}
        </span>
        <h2 className="text-xl font-bold text-slate-800">
          {isAnalyzed ? "AI構造物解析" : "想定される構造物・釣り場の特徴"}
        </h2>
        {isAnalyzed && (
          <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
            特許技術
          </span>
        )}
      </div>

      <p className="mb-6 text-sm text-slate-600">
        {isAnalyzed
          ? `「${spotName}」周辺の航空写真をAIで解析して検出した構造物カテゴリに基づく推定です。`
          : `「${spotName}」の釣り場タイプから一般的に想定される構造物カテゴリです（この釣り場個別の画像解析は行っていません）。`}
      </p>

      {/* 今月のおすすめ（環境パラメータ適用後・実解析スポットのみ） */}
      {isAnalyzed && monthlyRecommendation && monthlyRecommendation.fish.length > 0 && (
        <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <span aria-hidden="true">{"\u{1F4C5}"}</span>
            今月（{monthlyRecommendation.month}月）のおすすめ推定
            <span className="text-[10px] font-normal text-indigo-700">
              季節・地域・潮汐・水温を考慮
            </span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {monthlyRecommendation.fish.map((f) => (
              <span
                key={f.name}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  f.inSeasonNow
                    ? "bg-white text-indigo-900 border border-indigo-200"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
                }`}
              >
                <span aria-hidden="true">{RECOMMEND_MARK[f.recommendLevel]}</span>
                {f.name}
                <span className="text-[10px] text-slate-500">{f.method}</span>
                {f.catchReportCount > 0 && (
                  <span className="rounded bg-emerald-100 px-1 py-0.5 text-[10px] font-bold text-emerald-700">
                    実釣果{f.catchReportCount}件
                  </span>
                )}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-indigo-700/70">
            ◎=好条件 ○=狙える △=条件次第（いずれもAIによる推定で釣果を保証するものではありません）
          </p>
        </div>
      )}

      {/* Structure cards grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {structureTypes.map((type) => {
          const info = structureFishMapping[type];
          const label = STRUCTURE_CATEGORY_LABELS[type];
          const icon = STRUCTURE_ICONS[type];

          return (
            <div
              key={type}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {icon}
                </span>
                <h3 className="text-base font-semibold text-slate-800">
                  {label}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-slate-600">
                {info.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Fish & method badges */}
      {fishSlugs.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
            <span aria-hidden="true">{"\u{1F41F}"}</span>
            推定対象魚種
          </h3>
          <div className="flex flex-wrap gap-2">
            {fishSlugs.map((slug) => (
              <span
                key={slug}
                className="inline-block rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-800"
              >
                {FISH_SLUG_LABELS[slug] ?? slug}
              </span>
            ))}
          </div>
        </div>
      )}

      {methods.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
            <span aria-hidden="true">{"\u{1FA9D}"}</span>
            推奨釣法
          </h3>
          <div className="flex flex-wrap gap-2">
            {methods.map((slug) => (
              <span
                key={slug}
                className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
              >
                {METHOD_SLUG_LABELS[slug] ?? slug}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-600">
        {isAnalyzed
          ? "※ 航空写真のAI構造物解析による自動推定です（特許出願中・特願2026-042836）。実際の釣果を保証するものではありません。"
          : "※ 釣り場タイプからの一般的な想定であり、この釣り場個別の画像解析・実際の釣果を保証するものではありません。"}
      </p>
    </section>
  );
}
