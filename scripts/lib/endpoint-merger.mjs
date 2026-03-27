/**
 * endpoint-merger.mjs
 * Sentinel-2解析結果とOSM解析結果を統合するモジュール
 */

/**
 * ハバシン距離（メートル）
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * dominantStructure文字列からlayoutTypeへの変換マップ
 */
const STRUCTURE_TO_LAYOUT = {
  seawall: 'seawall',
  tetrapod: 'seawall',
  sandy: 'beach',
  rocky: 'seawall',
  pier: 'pier',
  'port-facility': 'port',
};

/**
 * spotTypeからdetectedStructuresを推定生成
 */
function inferStructuresFromSpotType(spotType) {
  const mapping = {
    port: [
      { type: 'seawall', relativePosition: 0.3, confidence: 0.4 },
      { type: 'port-facility', relativePosition: 0.7, confidence: 0.4 },
    ],
    beach: [{ type: 'sandy', relativePosition: 0.5, confidence: 0.4 }],
    rocky: [{ type: 'rocky', relativePosition: 0.5, confidence: 0.4 }],
    river: [{ type: 'other-structure', relativePosition: 0.5, confidence: 0.3 }],
    pier: [{ type: 'pier', relativePosition: 0.5, confidence: 0.4 }],
    breakwater: [
      { type: 'seawall', relativePosition: 0.3, confidence: 0.4 },
      { type: 'tetrapod', relativePosition: 0.7, confidence: 0.4 },
    ],
  };
  return mapping[spotType] || [{ type: 'seawall', relativePosition: 0.5, confidence: 0.3 }];
}

/**
 * Sentinel-2とOSMの解析結果を統合する
 *
 * @param {object|null} sentinelResult - image-analyzer.mjsの出力
 * @param {object|null} osmResult - osm-structure-analyzer.mjsの出力
 * @param {string} spotType - 'port' | 'beach' | 'rocky' | 'river' | 'pier' | 'breakwater'
 * @returns {object|null} 統合結果。両方nullの場合はnullを返す
 */
export function mergeEndpoints(sentinelResult, osmResult, spotType) {
  const hasSentinel = sentinelResult != null;
  const hasOsm = osmResult != null;

  // D) 両方なし
  if (!hasSentinel && !hasOsm) {
    return null;
  }

  // A) 両方あり
  if (hasSentinel && hasOsm) {
    // structureTypesは { seawall: count, tetrapod: count, ... } 形式
    const stTypes = sentinelResult.structureTypes || {};
    const totalCount = Object.values(stTypes).reduce((s, v) => s + v, 0) || 1;
    let posAccum = 0;
    const detectedStructures = Object.entries(stTypes)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => {
        const relativePosition = posAccum + (count / totalCount) / 2;
        posAccum += count / totalCount;
        return {
          type,
          relativePosition: Math.round(relativePosition * 100) / 100,
          confidence: osmResult.confidence * 0.6 + sentinelResult.confidence * 0.4,
        };
      });

    // OSMポリゴン（公園等）がSentinel-2検出構造物より極端に大きい場合、
    // Sentinel-2端点を優先（OSMは公園全体の輪郭であり護岸ではない）
    const sentinelWest = sentinelResult.endpoints?.west;
    const sentinelEast = sentinelResult.endpoints?.east;
    let sentinelLength = 0;
    if (sentinelWest && sentinelEast) {
      sentinelLength = haversineDistance(sentinelWest.lat, sentinelWest.lng, sentinelEast.lat, sentinelEast.lng);
    }
    const osmLength = osmResult.structureLength || 0;
    const useSentinelEndpoints = sentinelLength > 100 && osmLength > sentinelLength * 2;

    const chosenEndpoints = useSentinelEndpoints ? sentinelResult.endpoints : osmResult.endpoints;
    const chosenLength = useSentinelEndpoints ? Math.round(sentinelLength * 1.1) : osmLength;

    return {
      endpoints: chosenEndpoints,
      structureLength: chosenLength,
      layoutType: osmResult.layoutType,
      confidence: osmResult.confidence * 0.6 + sentinelResult.confidence * 0.4,
      source: 'sentinel+osm',
      dominantStructure: sentinelResult.dominantStructure || spotType,
      detectedStructures,
    };
  }

  // B) Sentinel-2のみ
  if (hasSentinel && !hasOsm) {
    const west = sentinelResult.endpoints?.west;
    const east = sentinelResult.endpoints?.east;
    let structureLength = 200;
    if (west && east) {
      structureLength = haversineDistance(west.lat, west.lng, east.lat, east.lng) * 1.1;
    }

    const dominant = sentinelResult.dominantStructure || 'seawall';
    const layoutType = STRUCTURE_TO_LAYOUT[dominant] || 'seawall';

    const stTypes = sentinelResult.structureTypes || {};
    const totalCount = Object.values(stTypes).reduce((s, v) => s + v, 0) || 1;
    let posAccum2 = 0;
    const detectedStructures = Object.entries(stTypes)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => {
        const relativePosition = posAccum2 + (count / totalCount) / 2;
        posAccum2 += count / totalCount;
        return {
          type,
          relativePosition: Math.round(relativePosition * 100) / 100,
          confidence: sentinelResult.confidence * 0.7,
        };
      });

    return {
      endpoints: sentinelResult.endpoints,
      structureLength,
      layoutType,
      confidence: sentinelResult.confidence * 0.7,
      source: 'sentinel',
      dominantStructure: dominant,
      detectedStructures:
        detectedStructures.length > 0
          ? detectedStructures
          : [{ type: dominant, relativePosition: 0.5, confidence: sentinelResult.confidence * 0.7 }],
    };
  }

  // C) OSMのみ
  return {
    endpoints: osmResult.endpoints,
    structureLength: osmResult.structureLength,
    layoutType: osmResult.layoutType,
    confidence: osmResult.confidence * 0.8,
    source: 'osm',
    dominantStructure: osmResult.layoutType || spotType,
    detectedStructures: inferStructuresFromSpotType(spotType),
  };
}

export { haversineDistance };
