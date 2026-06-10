/**
 * normalize-analysis.ts
 *
 * 構造物検出結果（SpotAnalysisResult）のポストプロセス層。
 * パイプライン生出力のJSONを表示品質まで引き上げる正規化を行う。
 *
 * 方針: 計算で導出できる値（構造物長・テトラ座標・ノイズ除去）はここで補完し、
 * JSONには焼き込まない（パイプライン再実行で手仕上げが消えるのを防ぐ）。
 * 人間の知識が必要な値（structureLabel・facilities等）はJSON側を正とする。
 */

import type { SpotAnalysisResult, DetectedStructure } from "./types";

// ノイズ除去の閾値（CLIP confidenceは0.20〜0.28に分布するため相対的に判定）
const STRUCT_MIN_CONFIDENCE = 0.24;
const STRUCT_MIN_AREA_RATIO = 0.001;
const MIN_KEPT_STRUCTURES = 3;

// テトラポッド導出の閾値
const TETRA_MIN_CONFIDENCE = 0.24;
const TETRA_MIN_AREA_RATIO = 0.0005;
const MAX_DERIVED_TETRAPODS = 60;

// 解析座標とスポット座標の許容乖離（これを超えたら解析結果を表示しない）
const MAX_LOCATION_DRIFT_METERS = 1500;

// ゾーンポリゴンの垂線幅（spot-leaflet-map.tsx の ZONE_HALF_WIDTH と同値）
const ZONE_HALF_WIDTH = 0.0009;

interface LatLng {
  lat: number;
  lng: number;
}

/** 2点間の距離（メートル、haversine） */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * 解析結果の座標がスポット座標と整合しているか。
 * 乖離が大きい場合は「別の場所の解析結果」であり、表示すると虚偽表示になる。
 */
export function isAnalysisLocationConsistent(
  analysis: SpotAnalysisResult,
  spotLat: number,
  spotLng: number
): boolean {
  return (
    haversineMeters(analysis.coordinates, { lat: spotLat, lng: spotLng }) <=
    MAX_LOCATION_DRIFT_METERS
  );
}

/** spot-leaflet-map.tsx の makeConverters と同じ端点フォールバック */
function resolveEndpoints(analysis: SpotAnalysisResult): {
  west: LatLng;
  east: LatLng;
} {
  const west = analysis.structureEndpoints?.west ?? {
    lat: analysis.coordinates.lat,
    lng: analysis.coordinates.lng - 0.003,
  };
  const east = analysis.structureEndpoints?.east ?? {
    lat: analysis.coordinates.lat,
    lng: analysis.coordinates.lng + 0.003,
  };
  return { west, east };
}

/** 構造物長を端点間距離から導出（10m単位） */
function deriveStructureLength(analysis: SpotAnalysisResult): number {
  const { west, east } = resolveEndpoints(analysis);
  return Math.round(haversineMeters(west, east) / 10) * 10;
}

/**
 * 低信頼・極小領域のノイズ構造物を除去。
 * フィルタ後が少なすぎる場合は信頼度上位を最低限残す（地図の説明力を維持）。
 */
function filterStructures(structures: DetectedStructure[]): DetectedStructure[] {
  const filtered = structures.filter(
    (s) =>
      s.confidence >= STRUCT_MIN_CONFIDENCE &&
      s.areaRatio >= STRUCT_MIN_AREA_RATIO
  );
  if (filtered.length >= MIN_KEPT_STRUCTURES) return filtered;

  return [...structures]
    .sort((a, b) => b.confidence - a.confidence || b.areaRatio - a.areaRatio)
    .slice(0, MIN_KEPT_STRUCTURES);
}

/**
 * tetrapodカテゴリの検出構造物から地図表示用のテトラ座標を導出。
 * relativePosition を構造物ライン（west→east）上に射影し、
 * 海側（ゾーンポリゴンと同じ -perp 方向）にオフセットして配置する。
 */
function deriveTetrapods(
  analysis: SpotAnalysisResult
): { lat: number; lng: number; brightness: number }[] {
  const candidates = analysis.detectedStructures
    .filter(
      (s) =>
        s.category === "tetrapod" &&
        s.confidence >= TETRA_MIN_CONFIDENCE &&
        s.areaRatio >= TETRA_MIN_AREA_RATIO &&
        s.distanceFromShore !== "onshore"
    )
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, MAX_DERIVED_TETRAPODS);

  if (candidates.length === 0) return [];

  const { west, east } = resolveEndpoints(analysis);
  const lngSpan = east.lng - west.lng;
  const latSpan = east.lat - west.lat;
  const len = Math.hypot(lngSpan, latSpan);
  const perpLat = len > 0 ? (lngSpan / len) * ZONE_HALF_WIDTH : ZONE_HALF_WIDTH;
  const perpLng = len > 0 ? (-latSpan / len) * ZONE_HALF_WIDTH : 0;

  const SHORE_OFFSET: Record<string, number> = {
    near: 0.3,
    medium: 0.6,
    far: 0.9,
  };

  return candidates.map((s, i) => {
    const x = Math.min(1, Math.max(0, s.relativePosition));
    // 同位置に重なった検出を決定論的に散らす（index基準、乱数は使わない）
    const xJitter = ((i % 5) - 2) * 0.004;
    const seaFactor =
      (SHORE_OFFSET[s.distanceFromShore] ?? 0.6) + ((i % 3) - 1) * 0.12;
    const xx = Math.min(1, Math.max(0, x + xJitter));

    return {
      lat: round6(west.lat + xx * latSpan - perpLat * seaFactor),
      lng: round6(west.lng + xx * lngSpan - perpLng * seaFactor),
      brightness: Math.round(s.confidence * 500),
    };
  });
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

/**
 * パイプライン生出力を表示品質に正規化する。
 * 手仕上げ済みの値（structureLength>0・detectedTetrapods既存・facilities）は一切上書きしない。
 */
export function normalizeAnalysisResult(
  raw: SpotAnalysisResult
): SpotAnalysisResult {
  const structureLength =
    raw.structureLength && raw.structureLength > 0
      ? raw.structureLength
      : deriveStructureLength(raw);

  const detectedTetrapods =
    raw.detectedTetrapods && raw.detectedTetrapods.length > 0
      ? raw.detectedTetrapods
      : deriveTetrapods(raw);

  const positionCount =
    raw.positionCount ||
    Math.min(Math.max(raw.zones.length * 2, 5), 15);

  return {
    ...raw,
    structureLength,
    detectedStructures: filterStructures(raw.detectedStructures),
    detectedTetrapods,
    positionCount,
  };
}
