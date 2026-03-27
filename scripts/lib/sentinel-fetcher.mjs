// sentinel-fetcher.mjs
// Sentinel-2 衛星画像をEarth-search STAC API経由で検索・取得するモジュール

import { fromUrl } from 'geotiff';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '..', '..', 'patent', 'data', 'cache');
const STAC_API = 'https://earth-search.aws.element84.com/v1/search';

/**
 * STAC APIでSentinel-2タイルを検索
 * @param {number} lat - 緯度
 * @param {number} lng - 経度
 * @returns {{ item: object, bandUrls: { B02: string, B03: string, B04: string, B08: string } } | null}
 */
export async function searchSentinelTile(lat, lng) {
  const now = new Date().toISOString();
  const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

  const bbox = [lng - 0.01, lat - 0.01, lng + 0.01, lat + 0.01];

  const response = await fetch(STAC_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      collections: ['sentinel-2-l2a'],
      bbox,
      datetime: `${yearAgo}/${now}`,
      query: { 'eo:cloud_cover': { lt: 20 } },
      sortby: [{ field: 'properties.datetime', direction: 'desc' }],
      limit: 5,
    }),
  });

  if (!response.ok) {
    console.error(`STAC API error: ${response.status} ${response.statusText}`);
    return null;
  }

  const data = await response.json();

  if (!data.features || data.features.length === 0) {
    console.warn(`No Sentinel-2 tiles found for (${lat}, ${lng})`);
    return null;
  }

  const item = data.features[0];
  const assets = item.assets;

  // バンドURLを抽出（B02=Blue, B03=Green, B04=Red, B08=NIR）
  const bandUrls = {
    B02: assets.blue?.href || assets.B02?.href || null,
    B03: assets.green?.href || assets.B03?.href || null,
    B04: assets.red?.href || assets.B04?.href || null,
    B08: assets.nir?.href || assets.B08?.href || null,
  };

  // 全バンドが取得できたか確認
  for (const [band, url] of Object.entries(bandUrls)) {
    if (!url) {
      console.warn(`Band ${band} URL not found in STAC item ${item.id}`);
      return null;
    }
  }

  return { item, bandUrls };
}

/**
 * キャッシュ付きSentinel-2タイル検索
 * @param {string} slug - スポットのスラッグ（キャッシュキー）
 * @param {number} lat - 緯度
 * @param {number} lng - 経度
 * @returns {{ item: object, bandUrls: { B02: string, B03: string, B04: string, B08: string } } | null}
 */
export async function searchWithCache(slug, lat, lng) {
  const cacheFile = join(CACHE_DIR, `${slug}.sentinel.json`);

  // キャッシュ読み込み
  if (existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(readFileSync(cacheFile, 'utf-8'));
      if (cached.bandUrls && cached.item) {
        console.log(`Cache hit: ${slug}`);
        return cached;
      }
    } catch {
      // キャッシュ破損 → 再取得
    }
  }

  // STAC API検索
  const result = await searchSentinelTile(lat, lng);

  if (result) {
    // キャッシュ保存
    mkdirSync(dirname(cacheFile), { recursive: true });
    writeFileSync(cacheFile, JSON.stringify({
      item: result.item,
      bandUrls: result.bandUrls,
      cachedAt: new Date().toISOString(),
    }, null, 2), 'utf-8');
    console.log(`Cached: ${slug}`);
  }

  return result;
}

/**
 * COGバンドデータからピクセルを読み取り
 * @param {{ B02: string, B03: string, B04: string, B08: string }} bandUrls - 各バンドのCOG URL
 * @param {number} lat - 中心緯度
 * @param {number} lng - 中心経度
 * @param {number} [radiusM=500] - 読み取り半径（メートル）
 * @returns {{
 *   bands: { red: Float32Array, green: Float32Array, blue: Float32Array, nir: Float32Array },
 *   width: number, height: number,
 *   pixelToCoord: (px: number, py: number) => { lat: number, lng: number },
 *   coordToPixel: (lat: number, lng: number) => { px: number, py: number },
 *   bounds: { west: number, east: number, south: number, north: number }
 * }}
 */
/**
 * WGS84 (lat/lng) → UTM (easting, northing) 変換
 * Sentinel-2 COGはUTM座標系のため必要
 */
function latLngToUtm(lat, lng) {
  const toRad = (d) => (d * Math.PI) / 180;
  const a = 6378137.0; // WGS84 semi-major
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const e_prime2 = e2 / (1 - e2);
  const k0 = 0.9996;

  const zone = Math.floor((lng + 180) / 6) + 1;
  const lng0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;

  const latRad = toRad(lat);
  const lngRad = toRad(lng);

  const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
  const T = Math.tan(latRad) ** 2;
  const C = e_prime2 * Math.cos(latRad) ** 2;
  const A = Math.cos(latRad) * (lngRad - lng0);

  // M: meridional arc
  const M = a * (
    (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * latRad
    - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * latRad)
    + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * latRad)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * latRad)
  );

  const easting = k0 * N * (A + (1 - T + C) * A ** 3 / 6
    + (5 - 18 * T + T ** 2 + 72 * C - 58 * e_prime2) * A ** 5 / 120) + 500000;

  let northing = k0 * (M + N * Math.tan(latRad) * (
    A ** 2 / 2 + (5 - T + 9 * C + 4 * C ** 2) * A ** 4 / 24
    + (61 - 58 * T + T ** 2 + 600 * C - 330 * e_prime2) * A ** 6 / 720
  ));
  if (lat < 0) northing += 10000000;

  return { easting, northing, zone };
}

/**
 * UTM → WGS84 (lat/lng) 逆変換
 */
function utmToLatLng(easting, northing, zone, isNorth = true) {
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const e_prime2 = e2 / (1 - e2);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const k0 = 0.9996;

  const x = easting - 500000;
  const y = isNorth ? northing : northing - 10000000;

  const M = y / k0;
  const mu = M / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));

  const phi1 = mu
    + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
  const T1 = Math.tan(phi1) ** 2;
  const C1 = e_prime2 * Math.cos(phi1) ** 2;
  const R1 = a * (1 - e2) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
  const D = x / (N1 * k0);

  const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (
    D ** 2 / 2
    - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e_prime2) * D ** 4 / 24
    + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * e_prime2 - 3 * C1 ** 2) * D ** 6 / 720
  );

  const lng0 = ((zone - 1) * 6 - 180 + 3) * Math.PI / 180;
  const lng = lng0 + (
    D - (1 + 2 * T1 + C1) * D ** 3 / 6
    + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * e_prime2 + 24 * T1 ** 2) * D ** 5 / 120
  ) / Math.cos(phi1);

  return { lat: lat * 180 / Math.PI, lng: lng * 180 / Math.PI };
}

export async function fetchBandPixels(bandUrls, lat, lng, radiusM = 500) {
  // リファレンスとしてB04(Red)のGeoTIFFメタデータを取得
  const refTiff = await fromUrl(bandUrls.B04);
  const refImage = await refTiff.getImage();

  const origin = refImage.getOrigin();       // [originX, originY] — UTM座標
  const resolution = refImage.getResolution(); // [resX, resY] — メートル/ピクセル
  const imageWidth = refImage.getWidth();
  const imageHeight = refImage.getHeight();
  const originX = origin[0];
  const originY = origin[1];
  const resX = resolution[0];   // 通常 10 (m/px)
  const resY = resolution[1];   // 通常 -10

  // UTMゾーン番号をSTACメタデータまたは座標から推定
  const utmZone = Math.floor((lng + 180) / 6) + 1;
  const isNorth = lat >= 0;

  // 中心座標のUTM変換
  const center = latLngToUtm(lat, lng);

  // UTM座標 → ピクセル変換
  function utmToPixel(e, n) {
    const px = Math.round((e - originX) / resX);
    const py = Math.round((n - originY) / resY);
    return { px, py };
  }

  function pixelToUtm(px, py) {
    return {
      easting: originX + px * resX,
      northing: originY + py * resY,
    };
  }

  // ピクセル→WGS84座標変換
  function pixelToCoord(px, py) {
    const utm = pixelToUtm(px, py);
    return utmToLatLng(utm.easting, utm.northing, utmZone, isNorth);
  }

  // WGS84→ピクセル変換
  function coordToPixel(coordLat, coordLng) {
    const utm = latLngToUtm(coordLat, coordLng);
    return utmToPixel(utm.easting, utm.northing);
  }

  // 読み取りウィンドウ: 中心±radiusM
  const tl = utmToPixel(center.easting - radiusM, center.northing + radiusM);
  const br = utmToPixel(center.easting + radiusM, center.northing - radiusM);

  const x0 = Math.max(0, Math.min(tl.px, br.px));
  const y0 = Math.max(0, Math.min(tl.py, br.py));
  const x1 = Math.min(imageWidth, Math.max(tl.px, br.px));
  const y1 = Math.min(imageHeight, Math.max(tl.py, br.py));

  const window = [x0, y0, x1, y1];
  const width = x1 - x0;
  const height = y1 - y0;

  if (width <= 0 || height <= 0) {
    throw new Error(`Invalid window: [${window}] (image: ${imageWidth}x${imageHeight}). UTM center: ${center.easting.toFixed(0)},${center.northing.toFixed(0)}`);
  }

  console.log(`    Window: [${x0},${y0},${x1},${y1}] = ${width}x${height}px (UTM zone ${utmZone})`);

  // 各バンドを並列で読み取り
  async function readBand(url) {
    const tiff = await fromUrl(url);
    const image = await tiff.getImage();
    const rasters = await image.readRasters({ window });
    return new Float32Array(rasters[0]);
  }

  const [blue, green, red, nir] = await Promise.all([
    readBand(bandUrls.B02),
    readBand(bandUrls.B03),
    readBand(bandUrls.B04),
    readBand(bandUrls.B08),
  ]);

  // 返却用はウィンドウオフセット込み
  function pixelToCoordOffset(px, py) {
    return pixelToCoord(px + x0, py + y0);
  }

  function coordToPixelOffset(coordLat, coordLng) {
    const { px, py } = coordToPixel(coordLat, coordLng);
    return { px: px - x0, py: py - y0 };
  }

  // WGS84のboundsを計算
  const boundsNW = pixelToCoord(x0, y0);
  const boundsSE = pixelToCoord(x1, y1);

  return {
    bands: { red, green, blue, nir },
    width,
    height,
    pixelToCoord: pixelToCoordOffset,
    coordToPixel: coordToPixelOffset,
    bounds: {
      west: Math.min(boundsNW.lng, boundsSE.lng),
      east: Math.max(boundsNW.lng, boundsSE.lng),
      south: Math.min(boundsNW.lat, boundsSE.lat),
      north: Math.max(boundsNW.lat, boundsSE.lat),
    },
  };
}
