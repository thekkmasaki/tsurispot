/**
 * 構造物-魚種マッピングテーブル
 * 特許明細書【0031】準拠
 *
 * 衛星画像から検出された構造物カテゴリに基づいて、
 * その構造物周辺で釣れやすい魚種と推奨釣法を返す。
 */

import type { StructureCategory } from "@/types";

// ---------------------------------------------------------------------------
// 1. structureFishMapping
// ---------------------------------------------------------------------------

export interface StructureFishInfo {
  /** この構造物周辺で釣れやすい魚種のスラッグ一覧 */
  fishSlugs: string[];
  /** 推奨される釣法 */
  methods: string[];
  /** この構造物が魚を集める理由の説明 */
  description: string;
}

export const structureFishMapping: Record<StructureCategory, StructureFishInfo> = {
  seawall: {
    fishSlugs: ["aji", "saba", "iwashi", "suzuki", "kurodai"],
    methods: ["sabiki", "uki-zuri", "choi-nage"],
    description:
      "護岸は足場が安定しており、壁面に付着した貝類や藻類がプランクトンを集め、" +
      "小型回遊魚（アジ・サバ・イワシ）のほか、それを捕食するスズキやクロダイが回遊する。",
  },
  tetrapod: {
    fishSlugs: ["mebaru", "kasago", "ainame", "soi", "kurodai"],
    methods: ["ana-zuri", "mebaring", "hechi-zuri"],
    description:
      "テトラポッドの隙間は根魚（メバル・カサゴ・アイナメ・ソイ）の絶好の隠れ家となる。" +
      "潮通しが良い場所ではクロダイもテトラ際を回遊する。",
  },
  rocky: {
    fishSlugs: ["mejina", "kurodai", "akou", "ishidai"],
    methods: ["uki-zuri", "fukase", "kago-zuri"],
    description:
      "岩礁帯は海藻が繁茂し、多様な生態系を形成する。メジナ・クロダイ・アコウ・イシダイなど" +
      "磯を好む魚種が豊富に生息する。",
  },
  sandy: {
    fishSlugs: ["karei", "kisu", "hirame"],
    methods: ["nage-zuri", "choi-nage", "surf-casting"],
    description:
      "砂浜・砂地はカレイ・キス・ヒラメなど砂底を好む魚種のポイント。" +
      "遠投で沖のカケアガリを狙うサーフキャスティングが有効。",
  },
  pier: {
    fishSlugs: ["kurodai", "suzuki", "mebaru", "aji"],
    methods: ["hechi-zuri", "uki-zuri", "sabiki"],
    description:
      "桟橋の柱やロープに付着した貝類・藻類が餌場となり、クロダイやスズキが居着く。" +
      "夜間は常夜灯にプランクトンが集まり、メバルやアジも寄ってくる。",
  },
  "port-facility": {
    fishSlugs: ["aji", "iwashi", "kurodai", "suzuki", "saba"],
    methods: ["sabiki", "uki-zuri", "ajing"],
    description:
      "港湾施設は潮の流れが複雑で、船の往来による攪拌が餌を巻き上げる。" +
      "常夜灯周りにはアジ・イワシが集まり、それを狙うスズキやクロダイも多い。",
  },
  "other-structure": {
    fishSlugs: ["aji", "kurodai"],
    methods: ["sabiki", "uki-zuri"],
    description:
      "その他の人工構造物（水門・排水口・橋脚など）も変化を生み、魚が付きやすい。" +
      "汎用性の高いサビキ釣りやウキ釣りで対応できる。",
  },
  water: {
    fishSlugs: [],
    methods: [],
    description: "開放水面。特定の構造物がないため、構造物由来の魚種推定は適用外。",
  },
  land: {
    fishSlugs: [],
    methods: [],
    description: "陸地。釣りの対象外エリア。",
  },
};

// ---------------------------------------------------------------------------
// 2. getStructureFishSlugs
// ---------------------------------------------------------------------------

/**
 * 複数の構造物カテゴリから、釣れやすい魚種スラッグの重複排除リストを返す。
 */
export function getStructureFishSlugs(structures: StructureCategory[]): string[] {
  const slugSet = new Set<string>();
  for (const s of structures) {
    const info = structureFishMapping[s];
    if (info) {
      for (const slug of info.fishSlugs) {
        slugSet.add(slug);
      }
    }
  }
  return Array.from(slugSet);
}

// ---------------------------------------------------------------------------
// 3. getStructureMethods
// ---------------------------------------------------------------------------

/**
 * 複数の構造物カテゴリから、推奨釣法の重複排除リストを返す。
 */
export function getStructureMethods(structures: StructureCategory[]): string[] {
  const methodSet = new Set<string>();
  for (const s of structures) {
    const info = structureFishMapping[s];
    if (info) {
      for (const method of info.methods) {
        methodSet.add(method);
      }
    }
  }
  return Array.from(methodSet);
}

// ---------------------------------------------------------------------------
// 4. spotTypeToStructures
// ---------------------------------------------------------------------------

/**
 * スポットタイプからデフォルトの構造物カテゴリを推定するマッピング。
 * 衛星画像解析結果がまだ無いスポットに対して、タイプ情報から暫定的に構造物を割り当てる。
 */
export const spotTypeToStructures: Record<string, StructureCategory[]> = {
  port: ["seawall", "port-facility"],
  beach: ["sandy"],
  rocky: ["rocky"],
  river: ["other-structure"],
  pier: ["pier"],
  breakwater: ["seawall", "tetrapod"],
};

// ---------------------------------------------------------------------------
// 5. getDefaultStructureTypes
// ---------------------------------------------------------------------------

/**
 * スポットタイプ文字列からデフォルトの構造物カテゴリ配列を返す。
 * マッピングに存在しない場合は空配列を返す。
 */
export function getDefaultStructureTypes(spotType: string): StructureCategory[] {
  return spotTypeToStructures[spotType] ?? [];
}
