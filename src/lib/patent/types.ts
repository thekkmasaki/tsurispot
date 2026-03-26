/**
 * types.ts
 *
 * 特許パイプラインの構造物検出結果の型定義。
 * SAM2（セグメンテーション）+ CLIP（分類）の出力フォーマット。
 *
 * パイプラインフロー:
 *   衛星画像 → SAM2セグメンテーション → マスク群
 *   → CLIP分類 → DetectedStructure[]
 *   → ゾーン分割 → AnalysisZone[]
 *   → 魚種推定 → SpotAnalysisResult
 *   → ダイアグラム自動生成 → SpotDiagramData
 */

import type { StructureCategory } from "@/types";

// ---------------------------------------------------------------------------
// 1. 検出された個別構造物
// ---------------------------------------------------------------------------

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectedStructure {
  /** 一意識別子 */
  id: string;
  /** 構造物カテゴリ（9種） */
  category: StructureCategory;
  /** CLIP分類の信頼度（0-1） */
  confidence: number;
  /** 画像上のバウンディングボックス（px） */
  bbox: BoundingBox;
  /** セグメンテーションポリゴン座標（画像px） */
  polygon?: [number, number][];
  /** 画像全体に対する面積比率（0-1） */
  areaRatio: number;
  /** 構造物全体に対する相対位置（0=左端, 1=右端） */
  relativePosition: number;
  /** 海岸線からの距離カテゴリ */
  distanceFromShore: "onshore" | "near" | "medium" | "far";
}

// ---------------------------------------------------------------------------
// 2. 海底地物（沈設構造物・天然地形）
// ---------------------------------------------------------------------------

export type SeaBottomFeatureType =
  | "tetrapod"
  | "reef-stone"
  | "reef-concrete"
  | "reef-hex"
  | "seagrass"
  | "rocky-bottom"
  | "sandy-bottom";

export interface SeaBottomFeature {
  /** 地物タイプ */
  type: SeaBottomFeatureType;
  /** 構造物長に対する水平範囲（0-1） */
  xRange: [number, number];
  /** 海岸からの距離カテゴリ */
  distanceFromShore: "near" | "medium" | "far";
  /** 推定水深（m） */
  estimatedDepth?: number;
  /** 検出信頼度 */
  confidence: number;
}

// ---------------------------------------------------------------------------
// 3. 解析ゾーン（構造物を区間分割したもの）
// ---------------------------------------------------------------------------

export interface AnalysisZone {
  /** ゾーンID */
  id: string;
  /** ゾーン名（例: "西エリア"） */
  name: string;
  /** 構造物長に対する水平範囲（0-1） */
  xRange: [number, number];
  /** このゾーンに含まれる構造物カテゴリ */
  structures: StructureCategory[];
  /** このゾーン前面の海底地物 */
  seaBottomFeatures: SeaBottomFeatureType[];
  /** 推定水深 */
  estimatedDepth: {
    shore: number;
    offshore: number;
  };
  /** 潮通しの良さ（0-1, 端ほど高い） */
  currentFlow: number;
  /** 推定魚種（構造物+環境から自動導出） */
  estimatedFish: EstimatedFish[];
  /** ゾーン評価（構造物の多様性+潮通し+魚種数から自動算出） */
  rating: "hot" | "good" | "normal";
}

export interface EstimatedFish {
  /** 魚名 */
  name: string;
  /** 推定釣法 */
  method: string;
  /** シーズン */
  season: string;
  /** 難易度 */
  difficulty: "easy" | "medium" | "hard";
  /** 推定確率（0-1） */
  probability: number;
}

// ---------------------------------------------------------------------------
// 4. 施設検出（陸上の建物・設備）
// ---------------------------------------------------------------------------

export interface DetectedFacility {
  /** 施設ID */
  id: string;
  /** 施設名 */
  name: string;
  /** アイコン */
  icon: string;
  /** 構造物長に対する相対位置（0-1） */
  relativePosition: number;
}

// ---------------------------------------------------------------------------
// 5. スポット解析結果（パイプラインの最終出力）
// ---------------------------------------------------------------------------

export interface SpotAnalysisResult {
  /** スポットslug */
  spotSlug: string;
  /** 解析対象の座標 */
  coordinates: {
    lat: number;
    lng: number;
  };
  /** 衛星画像のメタデータ */
  imageMetadata: {
    source: "sentinel-2" | "google-maps" | "manual";
    date: string;
    resolution: number;
    imageSize: { width: number; height: number };
  };
  /** 主要構造物のレイアウトタイプ */
  layoutType: "seawall" | "pier" | "port" | "beach";
  /** 構造物の端点座標（xRange→実座標変換用） */
  structureEndpoints?: {
    west: { lat: number; lng: number };
    east: { lat: number; lng: number };
  };
  /** 構造物ラベル */
  structureLabel: string;
  /** 海域名 */
  seaLabel: string;
  /** 検出された構造物一覧 */
  detectedStructures: DetectedStructure[];
  /** 海底地物一覧 */
  seaBottomFeatures: SeaBottomFeature[];
  /** 解析ゾーン一覧 */
  zones: AnalysisZone[];
  /** 検出された施設 */
  facilities: DetectedFacility[];
  /** 構造物の総延長（m） */
  structureLength: number;
  /** 推奨ポジション数 */
  positionCount: number;
  /** 航空写真から検出されたテトラポッド座標 */
  detectedTetrapods?: { lat: number; lng: number; brightness: number }[];
  /** 解析日時 */
  analyzedAt: string;
  /** パイプラインバージョン */
  pipelineVersion: string;
}
