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

interface SatelliteAnalysisSectionProps {
  structureTypes: StructureCategory[];
  spotName: string;
  spotType: string;
}

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
          AI構造物解析
        </h2>
        <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
          特許技術
        </span>
      </div>

      <p className="mb-6 text-sm text-slate-600">
        「{spotName}」周辺の衛星画像から検出された構造物カテゴリに基づく解析結果です。
      </p>

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
      <p className="text-xs text-slate-400">
        ※ 構造物分類は衛星画像解析による自動推定です（特願2026-042836）
      </p>
    </section>
  );
}
