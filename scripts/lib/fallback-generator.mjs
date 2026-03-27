/**
 * fallback-generator.mjs
 * Sentinel-2もOSMも失敗時のフォールバック。
 * spotTypeと座標から最小限のSpotAnalysisResultを生成する。
 */

import { resolveSeaLabel } from './sea-label-resolver.mjs';

/**
 * ある地点からbearing方向にdistanceメートル移動した座標を計算
 * @param {number} lat - 起点緯度
 * @param {number} lng - 起点経度
 * @param {number} bearing - 方向（度数、0=北、90=東）
 * @param {number} distance - 距離（メートル）
 * @returns {{ lat: number, lng: number }}
 */
function destinationPoint(lat, lng, bearing, distance) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const toDeg = rad => rad * 180 / Math.PI;
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const brng = toRad(bearing);
  const d = distance / R;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );
  return { lat: toDeg(lat2), lng: toDeg(lng2) };
}

/**
 * spotTypeと緯度帯からデフォルトのbearingを推定
 */
function estimateDefaultBearing(spotType, lat, lng) {
  // pier: 海に向かって垂直 → 日本の太平洋側なら南向き(180)、日本海側なら北向き(0)
  if (spotType === 'pier') {
    return lng < 136 ? 0 : 180;
  }
  // beach: 海岸線に沿って → 東西(90)がデフォルト
  if (spotType === 'beach') return 90;
  // 港湾/防波堤: 海岸線に平行 → 東西(90)がデフォルト
  return 90;
}

/**
 * spotType別のデフォルト構造物長（メートル）
 */
const DEFAULT_LENGTHS = {
  port: 200,
  beach: 500,
  rocky: 150,
  pier: 100,
  breakwater: 300,
  river: 100,
};

/**
 * spotType別のデフォルト構造物
 */
const DEFAULT_STRUCTURES = {
  port: ['seawall', 'port-facility'],
  beach: ['sandy'],
  rocky: ['rocky'],
  river: ['other-structure'],
  pier: ['pier'],
  breakwater: ['seawall', 'tetrapod'],
};

/**
 * spotType→layoutType変換
 */
const LAYOUT_MAP = {
  port: 'port',
  beach: 'beach',
  rocky: 'seawall',
  pier: 'pier',
  breakwater: 'seawall',
  river: 'port',
};

/**
 * spotType別のデフォルト魚種
 */
const DEFAULT_FISH = {
  port: [
    { name: 'アジ', method: 'サビキ釣り', difficulty: 'easy' },
    { name: 'サバ', method: 'サビキ釣り', difficulty: 'easy' },
    { name: 'イワシ', method: 'サビキ釣り', difficulty: 'easy' },
    { name: 'クロダイ', method: 'ウキ釣り', difficulty: 'hard' },
  ],
  beach: [
    { name: 'キス', method: '投げ釣り', difficulty: 'easy' },
    { name: 'カレイ', method: '投げ釣り', difficulty: 'medium' },
    { name: 'ヒラメ', method: 'サーフキャスティング', difficulty: 'hard' },
  ],
  rocky: [
    { name: 'メジナ', method: 'フカセ釣り', difficulty: 'medium' },
    { name: 'クロダイ', method: 'ウキ釣り', difficulty: 'hard' },
    { name: 'カサゴ', method: '穴釣り', difficulty: 'easy' },
  ],
  river: [
    { name: 'スズキ', method: 'ルアー釣り', difficulty: 'medium' },
    { name: 'ハゼ', method: 'ちょい投げ', difficulty: 'easy' },
  ],
  pier: [
    { name: 'アジ', method: 'サビキ釣り', difficulty: 'easy' },
    { name: 'クロダイ', method: 'ヘチ釣り', difficulty: 'hard' },
    { name: 'メバル', method: 'メバリング', difficulty: 'medium' },
  ],
  breakwater: [
    { name: 'アジ', method: 'サビキ釣り', difficulty: 'easy' },
    { name: 'メバル', method: '穴釣り', difficulty: 'medium' },
    { name: 'カサゴ', method: '穴釣り', difficulty: 'easy' },
    { name: 'サバ', method: 'サビキ釣り', difficulty: 'easy' },
  ],
};

/**
 * フォールバック用の簡易3ゾーン生成
 */
function generateFallbackZones(structureLength, structures, catchableFish) {
  const fishList =
    catchableFish.length > 0
      ? catchableFish.map((f) => ({
          name: f.name,
          probability: 0.50,
          season: f.season || '通年',
          method: f.method || '不明',
          difficulty: f.difficulty || 'medium',
        }))
      : [];

  return [
    {
      id: 'zone-1',
      name: '西端エリア',
      xRange: [0, 0.33],
      currentFlow: 0.85,
      structures: [...structures],
      seaBottomFeatures: [],
      estimatedDepth: { shore: 4.0, offshore: 8.0 },
      rating: 'hot',
      estimatedFish: fishList.map((f) => ({
        ...f,
        probability: Math.min(0.98, f.probability + 0.15),
      })),
    },
    {
      id: 'zone-2',
      name: '中央エリア',
      xRange: [0.33, 0.67],
      currentFlow: 0.55,
      structures: [...structures],
      seaBottomFeatures: [],
      estimatedDepth: { shore: 3.5, offshore: 7.0 },
      rating: 'normal',
      estimatedFish: fishList,
    },
    {
      id: 'zone-3',
      name: '東端エリア',
      xRange: [0.67, 1.0],
      currentFlow: 0.85,
      structures: [...structures],
      seaBottomFeatures: [],
      estimatedDepth: { shore: 4.0, offshore: 8.0 },
      rating: 'hot',
      estimatedFish: fishList.map((f) => ({
        ...f,
        probability: Math.min(0.98, f.probability + 0.15),
      })),
    },
  ];
}

/**
 * Sentinel-2もOSMも失敗時のフォールバック生成
 *
 * @param {string} slug - スポットのslug
 * @param {number} lat - 緯度
 * @param {number} lng - 経度
 * @param {string} spotType - 'port' | 'beach' | 'rocky' | 'river' | 'pier' | 'breakwater'
 * @param {Array} catchableFish - 既存の釣れる魚データ
 * @returns {object} SpotAnalysisResult相当のオブジェクト
 */
export function generateFallback(
  slug,
  lat,
  lng,
  spotType,
  catchableFish = [],
  options = {}
) {
  const structureLength = DEFAULT_LENGTHS[spotType] || 200;
  const structures = DEFAULT_STRUCTURES[spotType] || ['seawall'];
  const layoutType = LAYOUT_MAP[spotType] || 'seawall';
  const dominantStructure = structures[0];
  const seaLabel = resolveSeaLabel(lat, lng);

  // catchableFishが空の場合、spotTypeのデフォルト魚を使用
  const effectiveFish =
    catchableFish.length > 0
      ? catchableFish
      : DEFAULT_FISH[spotType] || DEFAULT_FISH.port;

  const zones = generateFallbackZones(structureLength, structures, effectiveFish);
  const positionCount = Math.max(3, Math.round(structureLength / 50));

  const structureLabel = {
    seawall: '護岸', pier: '桟橋', port: '港湾', beach: '砂浜',
  }[layoutType] || '護岸';

  return {
    spotSlug: slug,
    coordinates: { lat, lng },
    imageMetadata: {
      source: 'sentinel-2',
      date: new Date().toISOString().split('T')[0],
      resolution: 10,
      imageSize: { width: 640, height: 640 },
    },
    layoutType,
    structureEndpoints: (() => {
      const bearing = options.bearing ?? estimateDefaultBearing(spotType, lat, lng);
      const halfLength = structureLength / 2;
      const startPoint = destinationPoint(lat, lng, (bearing + 180) % 360, halfLength);
      const endPoint = destinationPoint(lat, lng, bearing, halfLength);
      return startPoint.lng <= endPoint.lng
        ? { west: startPoint, east: endPoint }
        : { west: endPoint, east: startPoint };
    })(),
    structureLabel,
    seaLabel,
    detectedStructures: [
      {
        id: 'str-001',
        category: dominantStructure,
        confidence: 0.20,
        bbox: { x: 50, y: 290, width: 540, height: 35 },
        areaRatio: 0.05,
        relativePosition: 0.5,
        distanceFromShore: 'onshore',
      },
    ],
    seaBottomFeatures: [],
    zones,
    facilities: options.facilities || [],
    structureLength,
    positionCount,
    analyzedAt: new Date().toISOString(),
    pipelineVersion: '1.0.0-fallback',
  };
}
