/**
 * エリア別航空写真ヒーロー画像を国土地理院タイルから生成
 * Usage: node scripts/generate-area-aerial.mjs
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "images", "blog", "weekly");
mkdirSync(OUT_DIR, { recursive: true });

const ZOOM = 14;
const COLS = 5;
const ROWS = 3;
const TILE_SIZE = 256;
const CANVAS_W = COLS * TILE_SIZE;
const CANVAS_H = ROWS * TILE_SIZE;
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 480;

// 15エリア: 代表座標（海岸線が見える位置を選定）
const AREAS = [
  { id: "akashi-kobe", name: "明石・神戸", lat: 34.63, lng: 135.03 },
  { id: "osaka-sennan", name: "大阪湾・泉南", lat: 34.38, lng: 135.17 },
  { id: "tokyobay", name: "東京湾・横浜", lat: 35.44, lng: 139.65 },
  { id: "fukuoka-kitakyushu", name: "福岡・北九州", lat: 33.95, lng: 130.88 },
  { id: "suruga-izu", name: "駿河湾・伊豆", lat: 35.00, lng: 138.87 },
  { id: "chita-mikawa", name: "知多・三河", lat: 34.72, lng: 136.93 },
  { id: "nanki-shirahama", name: "南紀・白浜", lat: 33.68, lng: 135.35 },
  { id: "setouchi-hiroshima", name: "瀬戸内・広島", lat: 34.35, lng: 132.45 },
  { id: "sendai-ishinomaki", name: "仙台・石巻", lat: 38.32, lng: 141.22 },
  { id: "otaru-ishikari", name: "小樽・石狩", lat: 43.19, lng: 141.00 },
  { id: "shonan-kamakura", name: "湘南・鎌倉", lat: 35.31, lng: 139.48 },
  { id: "boso", name: "房総半島", lat: 35.05, lng: 139.83 },
  { id: "beppu-oita", name: "別府湾・大分", lat: 33.28, lng: 131.62 },
  { id: "tango-maizuru", name: "丹後・舞鶴", lat: 35.48, lng: 135.38 },
  { id: "nagasaki-hirado", name: "長崎・平戸", lat: 33.37, lng: 129.55 },
];

function lonToTile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

function latToTile(lat, zoom) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}

async function fetchTileRaw(z, x, y) {
  const url = `https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/${z}/${x}/${y}.jpg`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

async function generateAreaImage(area) {
  const centerX = lonToTile(area.lng, ZOOM);
  const centerY = latToTile(area.lat, ZOOM);
  const startX = centerX - Math.floor(COLS / 2);
  const startY = centerY - Math.floor(ROWS / 2);

  // raw RGBA pixel buffer を手動で構築
  const rawBuf = Buffer.alloc(CANVAS_W * CANVAS_H * 3, 0);
  // デフォルト: 海色 (R:60 G:90 B:120)
  for (let i = 0; i < CANVAS_W * CANVAS_H; i++) {
    rawBuf[i * 3] = 60;
    rawBuf[i * 3 + 1] = 90;
    rawBuf[i * 3 + 2] = 120;
  }

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = startX + col;
      const y = startY + row;
      const tileBuf = await fetchTileRaw(ZOOM, x, y);
      if (!tileBuf) continue;

      try {
        // タイルをraw RGBに変換
        const { data, info } = await sharp(tileBuf)
          .resize(TILE_SIZE, TILE_SIZE, { fit: "fill" })
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });

        // キャンバスにピクセルコピー
        const offsetX = col * TILE_SIZE;
        const offsetY = row * TILE_SIZE;
        for (let py = 0; py < info.height; py++) {
          const srcStart = py * info.width * 3;
          const dstStart = ((offsetY + py) * CANVAS_W + offsetX) * 3;
          data.copy(rawBuf, dstStart, srcStart, srcStart + info.width * 3);
        }
      } catch {
        // タイルの処理に失敗した場合はスキップ
      }
    }
  }

  const outPath = join(OUT_DIR, `${area.id}.jpg`);

  await sharp(rawBuf, { raw: { width: CANVAS_W, height: CANVAS_H, channels: 3 } })
    .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: "cover", position: "center" })
    .jpeg({ quality: 82 })
    .toFile(outPath);

  console.log(`  ✓ ${area.name} → ${area.id}.jpg`);
}

async function main() {
  console.log(`航空写真ヒーロー画像を生成中... (${AREAS.length}エリア)\n`);

  for (const area of AREAS) {
    try {
      await generateAreaImage(area);
    } catch (err) {
      console.error(`  ✗ ${area.name}: ${err.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n完了！");
}

main();
