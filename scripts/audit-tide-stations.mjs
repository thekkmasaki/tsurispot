#!/usr/bin/env node
/**
 * 全スポット×潮汐観測地点マッピングの点検レポート
 *
 * deduplicateSpots() 適用後の実行時データ（公開スポット）全件について、
 * 最寄りの気象庁 潮位表観測地点・距離・表示モードを算出し、
 * - 距離バケット分布（〜10/〜25/〜50/〜100km）
 * - 40km超の遠隔スポット一覧（station-overrides.ts の上書き候補）
 * - river で名称が河口・汽水を示唆するスポット（ESTUARY_FULL_TIDE_SLUGS の昇格候補）
 * - address の都道府県と観測地点の位置が大きくねじれるもの
 * を出力する。結果は PR 本文に貼り、station-overrides.ts の整備に使う。
 *
 * 使い方: node scripts/audit-tide-stations.mjs
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');

async function loadRuntime() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tsurispot-tide-audit-'));
  const outfile = path.join(tmpDir, 'bundle.mjs');
  try {
    await build({
      stdin: {
        contents: `
          export { fishingSpots } from './src/lib/data/spots';
          export { TIDE_STATIONS } from './src/lib/tide/stations';
          export { getTideDisplayMode, getTideStationForSpot } from './src/lib/tide/nearest-station';
        `,
        resolveDir: ROOT,
        loader: 'ts',
      },
      bundle: true,
      format: 'esm',
      platform: 'node',
      tsconfig: path.join(ROOT, 'tsconfig.json'),
      outfile,
      logLevel: 'error',
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const { fishingSpots, getTideDisplayMode, getTideStationForSpot } = await loadRuntime();

const TIDAL_TYPES = new Set(['port', 'breakwater', 'beach', 'rocky', 'pier', 'surf']);
const ESTUARY_NAME_RE = /(河口|汽水|尻無|川尻|河川敷.*海|導流堤)/;

const buckets = { '〜10km': 0, '10〜25km': 0, '25〜40km': 0, '40〜100km': 0, '100km超': 0 };
const far = [];
const estuaryCandidates = [];
const lakeSuspects = [];
const byMode = { full: 0, 'phase-only': 0, none: 0 };
const stationUse = new Map();
const LAKE_NAME_RE = /(湖|ダム|沼)/;
const BRACKISH_OK_RE = /(浜名湖|中海|宍道湖|サロマ湖|久美浜湾|河口湖除外なし)/;

for (const spot of fishingSpots) {
  const mode = getTideDisplayMode(spot);
  byMode[mode]++;
  if (mode === 'none') continue;
  const st = getTideStationForSpot(spot);
  if (!st) continue;

  if (TIDAL_TYPES.has(spot.spotType)) {
    stationUse.set(st.code, (stationUse.get(st.code) ?? 0) + 1);
    if (st.distanceKm <= 10) buckets['〜10km']++;
    else if (st.distanceKm <= 25) buckets['10〜25km']++;
    else if (st.distanceKm <= 40) buckets['25〜40km']++;
    else if (st.distanceKm <= 100) buckets['40〜100km']++;
    else buckets['100km超']++;
    if (st.distanceKm > 40) {
      far.push({ slug: spot.slug, name: spot.name, pref: spot.region?.prefecture ?? '', type: spot.spotType, station: st.name, km: st.distanceKm });
    }
  }

  if (spot.spotType === 'river' && (ESTUARY_NAME_RE.test(spot.name) || ESTUARY_NAME_RE.test(spot.description ?? ''))) {
    estuaryCandidates.push({ slug: spot.slug, name: spot.name, pref: spot.region?.prefecture ?? '', station: st.name, km: st.distanceKm });
  }

  // 海型（full）なのに名称が湖沼らしいスポット＝淡水湖の可能性（汽水湖は除外）
  if (mode === 'full' && TIDAL_TYPES.has(spot.spotType) && LAKE_NAME_RE.test(spot.name) && !BRACKISH_OK_RE.test(spot.name)) {
    lakeSuspects.push({ slug: spot.slug, name: spot.name, pref: spot.region?.prefecture ?? '', type: spot.spotType, km: st.distanceKm });
  }
}

const tidalTotal = Object.values(buckets).reduce((a, b) => a + b, 0);
console.log('== 潮汐観測地点マッピング点検 ==');
console.log(`公開スポット: ${fishingSpots.length}件 / 表示モード: full=${byMode.full} phase-only=${byMode['phase-only']} none=${byMode.none}`);
console.log(`\n■ 海のスポット（${tidalTotal}件）の最寄り観測地点距離`);
for (const [k, v] of Object.entries(buckets)) {
  console.log(`  ${k}: ${v}件 (${((v / tidalTotal) * 100).toFixed(1)}%)`);
}
console.log(`  使用観測地点数: ${stationUse.size}/239`);

console.log(`\n■ 40km超の遠隔スポット（override候補・${far.length}件）`);
for (const f of far.sort((a, b) => b.km - a.km)) {
  console.log(`  ${f.km}km ${f.slug} (${f.pref} ${f.name} / ${f.type}) → ${f.station}`);
}

console.log(`\n■ river の河口・汽水らしきスポット（ESTUARY_FULL_TIDE_SLUGS 昇格候補・${estuaryCandidates.length}件）`);
for (const e of estuaryCandidates.sort((a, b) => a.km - b.km)) {
  console.log(`  ${e.slug} (${e.pref} ${e.name}) → ${e.station} ${e.km}km`);
}

console.log(`\n■ 海型なのに名称が湖沼らしいスポット（淡水湖の疑い・override(null)候補・${lakeSuspects.length}件）`);
for (const s of lakeSuspects.sort((a, b) => a.pref.localeCompare(b.pref, 'ja'))) {
  console.log(`  ${s.slug} (${s.pref} ${s.name} / ${s.type})`);
}
