/**
 * sea-label-resolver.mjs
 * 座標から最も近い海域名を返すモジュール
 *
 * ⚠ src/lib/geo/sea-label.ts と同一ロジック。片方を変えたら必ず両方を同期し、
 *   src/lib/geo/__tests__/sea-label.test.ts の代表座標で検証すること。
 *
 * 旧実装は日本海の判定が「lng<136」のみで、新潟・山形・秋田・青森西岸・石川・
 * 北海道西岸がすべて太平洋と誤判定されていた（他に大分→日本海、萩→瀬戸内、
 * 釧路→オホーツク等）。日本海/太平洋の分水嶺を緯度の関数として引き直した。
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
  // 津軽海峡は松前・函館・竜飛をカバーするため半径を0.4→0.45に拡大
  { name: '津軽海峡', lat: 41.5, lng: 140.5, radius: 0.45 },
  { name: '噴火湾', lat: 42.3, lng: 140.7, radius: 0.3 },
  { name: '陸奥湾', lat: 41.0, lng: 140.85, radius: 0.3 },
  { name: '播磨灘', lat: 34.6, lng: 134.6, radius: 0.3 },
  { name: '備讃瀬戸', lat: 34.35, lng: 133.8, radius: 0.3 },
  // オホーツク海の巨大円（半径2.0度）は釧路・根室まで飲み込んでいたため廃止し、
  // 大域判定（lat>43.6 かつ lng>142）に置き換えた
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

  // 東シナ海（九州西岸。天草・八代海を含み、鹿児島湾は除く）
  if (lng < 130) return '東シナ海';
  if (lat < 33.7 && lng < 130.55) return '東シナ海';

  // 瀬戸内海（東部: 広島〜播磨。西部: 周防灘〜安芸灘。萩・長門・高知・宇和海・大分は含まない）
  if (lat >= 33.9 && lat <= 34.8 && lng >= 132.4 && lng <= 135.2) return '瀬戸内海';
  if (lat >= 33.6 && lat <= 34.35 && lng >= 131 && lng < 132.4) return '瀬戸内海';

  // 北海道
  if (lat >= 41.4) {
    if (lat > 43.6 && lng > 142) return 'オホーツク海';
    if (lng < 0.9 * lat + 102.5) return '日本海';
    return '太平洋';
  }

  // 本州・四国・九州の日本海/太平洋分水嶺
  const divide = lat <= 36 ? 136.2 : Math.min(136.2 + 2.0 * (lat - 36), 140.8);
  if (lat >= 34.3 && lng < divide) return '日本海';
  return '太平洋';
}
