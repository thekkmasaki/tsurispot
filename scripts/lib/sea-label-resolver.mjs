/**
 * sea-label-resolver.mjs
 * 座標から最も近い海域名を返すモジュール
 */

/**
 * 海域ルックアップテーブル（中心座標+半径）
 */
const SEA_AREAS = [
  { name: '東京湾', lat: 35.35, lng: 139.85, radius: 0.5 },
  { name: '大阪湾', lat: 34.55, lng: 135.15, radius: 0.4 },
  { name: '相模湾', lat: 35.15, lng: 139.3, radius: 0.4 },
  { name: '駿河湾', lat: 34.9, lng: 138.55, radius: 0.5 },
  { name: '伊勢湾', lat: 34.8, lng: 136.8, radius: 0.4 },
  { name: '若狭湾', lat: 35.65, lng: 135.5, radius: 0.3 },
  { name: '富山湾', lat: 36.8, lng: 137.2, radius: 0.3 },
  { name: '有明海', lat: 33.0, lng: 130.4, radius: 0.4 },
  { name: '玄界灘', lat: 33.7, lng: 130.2, radius: 0.5 },
  { name: '響灘', lat: 33.95, lng: 130.8, radius: 0.3 },
  { name: '紀伊水道', lat: 33.9, lng: 135.0, radius: 0.4 },
  { name: '豊後水道', lat: 33.1, lng: 132.2, radius: 0.4 },
  { name: '津軽海峡', lat: 41.5, lng: 140.5, radius: 0.4 },
  { name: '噴火湾', lat: 42.3, lng: 140.7, radius: 0.3 },
  { name: '陸奥湾', lat: 41.0, lng: 140.85, radius: 0.3 },
  { name: '播磨灘', lat: 34.6, lng: 134.6, radius: 0.3 },
  { name: '備讃瀬戸', lat: 34.35, lng: 133.8, radius: 0.3 },
  { name: 'オホーツク海', lat: 44.5, lng: 144.5, radius: 2.0 },
];

/**
 * 2点間の度数距離（ユークリッド近似）
 */
function degreeDistance(lat1, lng1, lat2, lng2) {
  const dLat = lat2 - lat1;
  const dLng = lng2 - lng1;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * 座標から最も近い海域名を返す
 *
 * @param {number} lat - 緯度
 * @param {number} lng - 経度
 * @returns {string} 海域名
 */
export function resolveSeaLabel(lat, lng) {
  // 1. ルックアップテーブルで判定
  let closest = null;
  let closestDist = Infinity;

  for (const area of SEA_AREAS) {
    const dist = degreeDistance(lat, lng, area.lat, area.lng);
    if (dist <= area.radius && dist < closestDist) {
      closest = area.name;
      closestDist = dist;
    }
  }

  if (closest) return closest;

  // 2. 大域判定
  // オホーツク海
  if (lat > 42 && lng > 142) return 'オホーツク海';

  // 東シナ海
  if (lng < 130) return '東シナ海';

  // 瀬戸内海判定
  if (lat >= 33.5 && lat <= 34.8 && lng >= 131 && lng <= 135) {
    return '瀬戸内海';
  }

  // 北部判定
  if (lat > 39) {
    return lng < 136 ? '日本海' : '太平洋';
  }

  // 日本海側
  if (lng < 136) return '日本海';

  // デフォルト
  return '太平洋';
}
