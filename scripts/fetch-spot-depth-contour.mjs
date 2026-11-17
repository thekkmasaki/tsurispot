#!/usr/bin/env node
/**
 * 海しるAPI（海上保安庁）の等深線から、海のスポットごとに
 * 「水深20mラインまでの水平距離」を一括取得して JSON に保存する。
 *
 * - 一度きりのバッチ取得用。サイト表示時に API は呼ばない。
 * - 規約（短時間の大量アクセス禁止）に配慮し、1リクエストずつ間隔をあける。
 * - 途中で止まっても、出力ファイルにある slug は飛ばして再開する。
 *
 * usage:
 *   MSIL_KEY=<subscription key> node scripts/fetch-spot-depth-contour.mjs <spots.json>
 *   spots.json = [{ slug, type, lat, lng }]（fishingSpots から書き出したもの）
 *
 * 試用キーは https://portal.msil.go.jp/howtouse に公開されている。
 */
import fs from "node:fs";

const KEY = process.env.MSIL_KEY;
const SPOTS_PATH = process.argv[2];
const OUT = "src/lib/data/spot-depth-contour.json";
const LAYER_20M = 10; // depth-contour レイヤ10 = 20m 等深線
const BOX_DEG = 0.015; // 約1.4〜1.7km 四方の半幅。これより遠い線は「1km超」とみなす
const INTERVAL_MS = 400;
const MARINE = new Set(["port", "breakwater", "beach", "pier", "rocky", "surf"]);

if (!KEY || !SPOTS_PATH) {
  console.error("usage: MSIL_KEY=... node scripts/fetch-spot-depth-contour.mjs <spots.json>");
  process.exit(1);
}

const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, "utf8")).filter(
  (s) => MARINE.has(s.type) && Number.isFinite(s.lat) && Number.isFinite(s.lng),
);
const out = fs.existsSync(OUT)
  ? JSON.parse(fs.readFileSync(OUT, "utf8"))
  : { source: "海しるAPI 等深線（海上保安庁）", layer: "20m", unit: "m", spots: {} };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function distM(aLat, aLng, bLat, bLng) {
  const R = 6371000;
  const r = Math.PI / 180;
  const x = (bLng - aLng) * r * Math.cos(((aLat + bLat) / 2) * r);
  const y = (bLat - aLat) * r;
  return Math.sqrt(x * x + y * y) * R;
}

async function nearest20m(lat, lng) {
  const p = new URLSearchParams({
    f: "json",
    geometryType: "esriGeometryEnvelope",
    inSR: "4326",
    outSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    geometry: `${lng - BOX_DEG},${lat - BOX_DEG},${lng + BOX_DEG},${lat + BOX_DEG}`,
    returnGeometry: "true",
    outFields: "Depth",
    maxAllowableOffset: "0.0001",
  });
  const res = await fetch(
    `https://api.msil.go.jp/depth-contour/v2/MapServer/${LAYER_20M}/query?${p}`,
    { headers: { "Ocp-Apim-Subscription-Key": KEY } },
  );
  const j = await res.json();
  if (!Array.isArray(j.features)) throw new Error(JSON.stringify(j).slice(0, 200));
  let min = Infinity;
  for (const f of j.features)
    for (const path of f.geometry?.paths ?? [])
      for (const [x, y] of path) min = Math.min(min, distM(lat, lng, y, x));
  // 10m 単位に丸める。範囲内に線が無ければ null（= 1km超）
  return Number.isFinite(min) ? Math.round(min / 10) * 10 : null;
}

const save = () => {
  const sorted = Object.fromEntries(Object.entries(out.spots).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(OUT, JSON.stringify({ ...out, fetchedAt: new Date().toISOString().slice(0, 10), spots: sorted }) + "\n");
};

let done = 0;
let failed = 0;
for (const s of spots) {
  if (s.slug in out.spots) continue;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      out.spots[s.slug] = await nearest20m(s.lat, s.lng);
      done++;
      break;
    } catch (e) {
      if (attempt === 3) {
        failed++;
        console.error(`FAIL ${s.slug}: ${e.message}`);
      } else await sleep(5000 * attempt);
    }
  }
  if (done % 100 === 0) {
    save();
    console.log(`${Object.keys(out.spots).length}/${spots.length}`);
  }
  await sleep(INTERVAL_MS);
}
save();
console.log(`完了 取得=${done} 失敗=${failed} 合計=${Object.keys(out.spots).length}/${spots.length}`);
