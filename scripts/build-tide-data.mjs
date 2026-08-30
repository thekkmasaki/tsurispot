#!/usr/bin/env node
/**
 * 気象庁 潮位表（天文潮推算値）の年次データ取り込みスクリプト
 *
 * 使い方:
 *   node scripts/build-tide-data.mjs --year 2026                # 満干のみ生成（通常）
 *   node scripts/build-tide-data.mjs --year 2026 --with-hourly  # 毎時潮位も含める（/tides グラフ用）
 *   node scripts/build-tide-data.mjs --check                    # 今日+14日のデータ存在チェックのみ
 *
 * 出力:
 *   public/tide-data/{year}/{CODE}.json  … 地点×年の満干時刻・潮位（配信は /api/tide/[code] 経由）
 *   src/lib/tide/stations.ts             … 全地点マスタ（code/name/lat/lng）自動生成
 *   src/lib/tide/new-moons.ts            … 朔（新月）のJST時刻テーブル 自動生成（Meeus法）
 *
 * 年次更新手順（例年11月頃に気象庁が翌年分を公開）:
 *   1. node scripts/build-tide-data.mjs --year 2027
 *   2. 生成差分をコミットして PR → merge → deploy（force-static のためデプロイで反映）
 *   ※ 未更新のまま年末が近づくと src/lib/tide/__tests__ の日付カバレッジテストが CI で fail する
 *
 * データ出典: 気象庁 潮位表 https://www.data.jma.go.jp/kaiyou/db/tide/suisan/
 * （政府標準利用規約に基づき出典明記の上で利用。サイト表示側にも出典を記載すること）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "public", "tide-data");
const TIDE_LIB_DIR = path.join(ROOT, "src", "lib", "tide");

const JMA_BASE = "https://www.data.jma.go.jp/kaiyou";
const USER_AGENT = "TsuriSpotTideBuilder/1.0 (+https://tsurispot.com; annual tide-table import)";
const CONCURRENCY = 5; // 気象庁サーバーへの配慮: 同時5接続まで
const REQUEST_INTERVAL_MS = 200; // リクエスト開始間隔

// ---------------------------------------------------------------------------
// CLI 引数
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const getFlag = (name) => args.includes(name);
const getOpt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : null;
};

const CHECK_ONLY = getFlag("--check");
const WITH_HOURLY = getFlag("--with-hourly");
const YEAR = Number(getOpt("--year") ?? new Date().getFullYear());

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (attempt === 3) throw new Error(`取得失敗 ${url}: ${e.message}`);
      await sleep(1000 * attempt);
    }
  }
  throw new Error("unreachable");
}

/** JST の今日 (YYYY-MM-DD) */
function todayJST() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00+09:00`);
  d.setUTCDate(d.getUTCDate() + days);
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(d);
}

// ---------------------------------------------------------------------------
// --check モード: 今日+14日分のデータ存在チェック
// ---------------------------------------------------------------------------
if (CHECK_ONLY) {
  const target = addDays(todayJST(), 14);
  const year = target.slice(0, 4);
  const sample = path.join(DATA_DIR, year, "TK.json");
  if (!fs.existsSync(sample)) {
    console.error(`NG: ${target}（今日+14日）のデータがありません。`);
    console.error(`    node scripts/build-tide-data.mjs --year ${year} を実行してください。`);
    process.exit(1);
  }
  const json = JSON.parse(fs.readFileSync(sample, "utf8"));
  if (!json.days[target]) {
    console.error(`NG: ${sample} に ${target} のエントリがありません。データを再生成してください。`);
    process.exit(1);
  }
  console.log(`OK: ${target}（今日+14日）までデータあり`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 1. 地点一覧（station{year}.php）のパース
//    列: 地点記号 / 掲載地点名 / 緯度(度分) / 経度(度分) / ...
// ---------------------------------------------------------------------------
function parseDegMin(text) {
  // 例: "35゜39'"（気象庁は度記号に ゜ U+309C を使用） / "35°39′" → 35 + 39/60
  const m = text.match(/(\d+)\s*[°゜度]\s*(\d+(?:\.\d+)?)\s*[′'分]?/);
  if (!m) return null;
  return Math.round((Number(m[1]) + Number(m[2]) / 60) * 10000) / 10000;
}

function parseStationPage(html) {
  const stations = [];
  const rows = html.split(/<tr[^>]*>/i).slice(1);
  for (const row of rows) {
    const cells = [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) =>
      m[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .trim()
    );
    if (cells.length < 4) continue;
    // 地点記号セル（英数2文字）を起点に、名称・緯度・経度を拾う
    const codeIdx = cells.findIndex((c) => /^[A-Z][A-Z0-9]$|^[0-9][A-Z]$/.test(c));
    if (codeIdx < 0) continue;
    const code = cells[codeIdx];
    const name = cells[codeIdx + 1];
    if (!name || !/[぀-ヿ一-鿿]/.test(name)) continue; // 名称に日本語が無い行はヘッダ等
    const latCell = cells.slice(codeIdx + 2).find((c) => parseDegMin(c) !== null);
    const lngCell = cells
      .slice(cells.indexOf(latCell) + 1)
      .find((c) => parseDegMin(c) !== null);
    const lat = latCell ? parseDegMin(latCell) : null;
    const lng = lngCell ? parseDegMin(lngCell) : null;
    if (lat === null || lng === null) continue;
    // 日本近海の妥当範囲（南鳥島 153°58'E まで含む）
    if (lat < 20 || lat > 46 || lng < 122 || lng > 155) continue;
    stations.push({ code, name, lat, lng });
  }
  // code 重複排除（同一表内での重複は想定外だが防御）
  const seen = new Set();
  return stations.filter((s) => (seen.has(s.code) ? false : (seen.add(s.code), true)));
}

// ---------------------------------------------------------------------------
// 2. 年次推算 txt の固定長パース
//    1行=1日: 1-72桁 毎時潮位24×3桁 / 73-78 年月日(2桁ずつ) / 79-80 地点記号
//             81-108 満潮4組×(時分4桁+潮位3桁) / 109-136 干潮4組（欠測は 9999999）
// ---------------------------------------------------------------------------
function parseTideTxt(txt, expectedCode, year) {
  const days = {};
  for (const rawLine of txt.split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    const line = rawLine.padEnd(136, " ");
    const yy = line.slice(72, 74).trim();
    const mm = line.slice(74, 76).trim();
    const dd = line.slice(76, 78).trim();
    const code = line.slice(78, 80).trim();
    if (code !== expectedCode) {
      throw new Error(`地点記号不一致: 期待=${expectedCode} 実際=${code}`);
    }
    const fullYear = 2000 + Number(yy);
    if (fullYear !== year) throw new Error(`年不一致: 期待=${year} 実際=${fullYear}`);
    const dateKey = `${fullYear}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;

    const parseExtremes = (offset) => {
      const out = [];
      for (let g = 0; g < 4; g++) {
        const pos = offset + g * 7;
        const timeRaw = line.slice(pos, pos + 4);
        const heightRaw = line.slice(pos + 4, pos + 7);
        if (timeRaw.trim() === "9999" || timeRaw.trim() === "") continue;
        const hh = Number(timeRaw.slice(0, 2).trim());
        const mi = Number(timeRaw.slice(2, 4).trim());
        const height = Number(heightRaw.trim());
        if (!Number.isFinite(hh) || !Number.isFinite(mi) || !Number.isFinite(height)) continue;
        if (hh > 23 || mi > 59) continue; // 99:99 等の欠測バリアント防御
        out.push([`${String(hh).padStart(2, "0")}:${String(mi).padStart(2, "0")}`, height]);
      }
      return out;
    };

    const day = { hi: parseExtremes(80), lo: parseExtremes(108) };
    if (WITH_HOURLY) {
      const hourly = [];
      for (let h = 0; h < 24; h++) {
        hourly.push(Number(line.slice(h * 3, h * 3 + 3).trim()));
      }
      day.hourly = hourly;
    }
    days[dateKey] = day;
  }
  return days;
}

// ---------------------------------------------------------------------------
// 3. 朔（新月）テーブル生成 — Meeus "Astronomical Algorithms" 第49章
//    2025-01〜2028-02 の朔の JST 時刻を生成（月齢・潮回り計算の基準）
// ---------------------------------------------------------------------------
function meeusNewMoonJDE(k) {
  const T = k / 1236.85;
  let jde =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T * T -
    0.00000015 * T * T * T +
    0.00000000073 * T * T * T * T;

  const rad = Math.PI / 180;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T * T - 0.00000011 * T * T * T) * rad;
  const Mp =
    (201.5643 + 385.81693528 * k + 0.0107582 * T * T + 0.00001238 * T * T * T - 0.000000058 * T * T * T * T) * rad;
  const F =
    (160.7108 + 390.67050284 * k - 0.0016118 * T * T - 0.00000227 * T * T * T + 0.000000011 * T * T * T * T) * rad;
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T * T + 0.00000215 * T * T * T) * rad;

  jde +=
    -0.4072 * Math.sin(Mp) +
    0.17241 * E * Math.sin(M) +
    0.01608 * Math.sin(2 * Mp) +
    0.01039 * Math.sin(2 * F) +
    0.00739 * E * Math.sin(Mp - M) -
    0.00514 * E * Math.sin(Mp + M) +
    0.00208 * E * E * Math.sin(2 * M) -
    0.00111 * Math.sin(Mp - 2 * F) -
    0.00057 * Math.sin(Mp + 2 * F) +
    0.00056 * E * Math.sin(2 * Mp + M) -
    0.00042 * Math.sin(3 * Mp) +
    0.00042 * E * Math.sin(M + 2 * F) +
    0.00038 * E * Math.sin(M - 2 * F) -
    0.00024 * E * Math.sin(2 * Mp - M) -
    0.00017 * Math.sin(Om) -
    0.00007 * Math.sin(Mp + 2 * M) +
    0.00004 * Math.sin(2 * Mp - 2 * F) +
    0.00004 * Math.sin(3 * M) +
    0.00003 * Math.sin(Mp + M - 2 * F) +
    0.00003 * Math.sin(2 * Mp + 2 * F) -
    0.00003 * Math.sin(Mp + M + 2 * F) +
    0.00003 * Math.sin(Mp - M + 2 * F) -
    0.00002 * Math.sin(Mp - M - 2 * F) -
    0.00002 * Math.sin(3 * Mp + M) +
    0.00002 * Math.sin(4 * Mp);
  return jde;
}

function jdeToJstIso(jde) {
  const DELTA_T_SEC = 69; // TT-UT (2025-2028 は約69秒)
  const utMs = (jde - 2440587.5) * 86400000 - DELTA_T_SEC * 1000;
  const jst = new Date(utMs + 9 * 3600000);
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${jst.getUTCFullYear()}-${p(jst.getUTCMonth() + 1)}-${p(jst.getUTCDate())}` +
    `T${p(jst.getUTCHours())}:${p(jst.getUTCMinutes())}:${p(jst.getUTCSeconds())}+09:00`
  );
}

function buildNewMoons() {
  const list = [];
  // k=0 が 2000-01-06 の朔。2025-01 以前〜2028-02 以降をカバーする範囲を走査
  for (let k = 305; k <= 350; k++) {
    const iso = jdeToJstIso(meeusNewMoonJDE(k));
    if (iso >= "2024-12-01" && iso <= "2028-03-01") list.push(iso);
  }
  // 妥当性: 朔望月間隔 29.2〜29.9日
  for (let i = 1; i < list.length; i++) {
    const diff = (new Date(list[i]).getTime() - new Date(list[i - 1]).getTime()) / 86400000;
    if (diff < 29.2 || diff > 29.9) throw new Error(`朔の間隔が異常: ${list[i - 1]} → ${list[i]} (${diff.toFixed(2)}日)`);
  }
  return list;
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------
async function main() {
  console.log(`== 気象庁 潮位表 ${YEAR}年 取り込み開始 (hourly=${WITH_HOURLY}) ==`);

  // 1. 地点一覧
  const stationHtml = await fetchText(`${JMA_BASE}/db/tide/suisan/station${YEAR}.php`);
  const stations = parseStationPage(stationHtml);
  console.log(`地点一覧: ${stations.length}件`);
  if (stations.length < 200) {
    throw new Error(`地点数が想定外に少ない(${stations.length})。ページ構造変更の可能性。`);
  }

  // 2. 各地点の txt を取得・パース（並列5・200ms間隔）
  const outDir = path.join(DATA_DIR, String(YEAR));
  fs.mkdirSync(outDir, { recursive: true });

  let done = 0;
  const failed = [];
  const queue = [...stations];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const st = queue.shift();
      if (!st) break;
      await sleep(REQUEST_INTERVAL_MS);
      try {
        const txt = await fetchText(`${JMA_BASE}/data/db/tide/suisan/txt/${YEAR}/${st.code}.txt`);
        const days = parseTideTxt(txt, st.code, YEAR);
        const dayCount = Object.keys(days).length;
        if (dayCount < 365) throw new Error(`日数不足: ${dayCount}日`);
        const payload = { code: st.code, name: st.name, year: YEAR, lat: st.lat, lng: st.lng, days };
        fs.writeFileSync(path.join(outDir, `${st.code}.json`), JSON.stringify(payload));
        done++;
        if (done % 40 === 0) console.log(`  ...${done}/${stations.length}`);
      } catch (e) {
        failed.push({ code: st.code, name: st.name, error: e.message });
      }
    }
  });
  await Promise.all(workers);
  console.log(`txt取得・変換: 成功${done} / 失敗${failed.length}`);
  if (failed.length > 0) {
    for (const f of failed) console.error(`  失敗: ${f.code} ${f.name} — ${f.error}`);
    throw new Error("一部地点の取得に失敗。再実行してください。");
  }

  // 3. stations.ts 生成（緯度経度は度分由来＝分精度。最寄り判定用途には十分）
  const stationsTs = `// 自動生成: scripts/build-tide-data.mjs（気象庁 潮位表 掲載地点一覧 ${YEAR}年版より）
// 手動編集禁止。更新は node scripts/build-tide-data.mjs --year <year> を実行すること。
export interface TideStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const TIDE_STATIONS: TideStation[] = [
${stations.map((s) => `  { code: "${s.code}", name: "${s.name}", lat: ${s.lat}, lng: ${s.lng} },`).join("\n")}
];
`;
  fs.mkdirSync(TIDE_LIB_DIR, { recursive: true });
  fs.writeFileSync(path.join(TIDE_LIB_DIR, "stations.ts"), stationsTs);
  console.log(`stations.ts: ${stations.length}件を出力`);

  // 4. new-moons.ts 生成
  const newMoons = buildNewMoons();
  const newMoonsTs = `// 自動生成: scripts/build-tide-data.mjs（Meeus法による朔=新月のJST時刻、2025-2028年）
// 手動編集禁止。月齢・潮回り計算の基準テーブル。
export const NEW_MOONS_JST: string[] = [
${newMoons.map((s) => `  "${s}",`).join("\n")}
];
`;
  fs.writeFileSync(path.join(TIDE_LIB_DIR, "new-moons.ts"), newMoonsTs);
  console.log(`new-moons.ts: 朔${newMoons.length}件（${newMoons[0]} 〜 ${newMoons[newMoons.length - 1]}）`);

  console.log("== 完了 ==");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
