#!/usr/bin/env node
/**
 * 座標品質スイープ — 内陸疑いスポットと近接重複の機械検出
 *
 * 背景: 武豊エリアで「海釣りスポットなのに座標が内陸の住宅地」という誤りが
 * 2件見つかった（taketoyo-kou-ryokuchi / taketoyo-ryokuchi-a11）。
 * この種の誤座標が全体にどれだけあるかを定量化する。**検出のみ、データ修正はしない。**
 *
 * ── 判定手法 ──
 * 1. 内陸疑い（inland-suspect）:
 *    海釣り系スポット（port/beach/rocky/pier/breakwater/surf）について、
 *    国土地理院 標高API にスポット周辺の点を問い合わせる。
 *      https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php
 *    海上の点は {"elevation":"-----"} が返る（陸上は数値）。
 *    - 中心点: スポット座標自体が海上なら waterfront（1リクエストで確定）
 *    - 第1リング: 東西南北4方向×400m → 1点でも海なら waterfront（ショートサーキット）
 *    - 第2リング: 8方向×700m → ここでやっと海が出たら inland-weak（弱疑い）、
 *      全点陸なら inland-suspect（強疑い）
 *    検証済み: 武豊緑地護岸(34.8554,136.9362)の東400mは海 /
 *              武豊港緑地(34.8520,136.9220)の周囲400mは全部陸（SE700mで海 → weak）
 *    ※当初仕様は「第2リングで海ならパス」だったが、既知の誤座標
 *      taketoyo-kou-ryokuchi（実際は海岸から約600m内陸の住宅地）が
 *      SE700mプローブで海に到達してパスしてしまうため、第2リング到達は
 *      「weak（400m超〜700m圏に水際）」として別枠でフラグする方式に変更した。
 *
 * 2. 近接重複（duplicate-suspect）: ネットワーク不要。
 *    全スポットペアで「距離500m以内 かつ（名前の編集距離が近い or 包含関係）」
 *    を検出（武豊緑地/武豊緑地護岸/武豊港緑地のようなケース）。
 *
 * ── レート制限 ──
 * 標高APIは必ず直列・1リクエストごとに200ms待機（5req/s上限厳守、並列化禁止）。
 * リトライは2回まで。
 *
 * ── 中断・再開 ──
 * 200スポットごとに .claude/state/coord-sweep-progress.json へ中間保存（gitignored）。
 * 再実行時はチェックポイントから自動再開する。
 *
 * 使い方:
 *   node scripts/find-inland-spots.mjs                       # 全件スイープ + レポート出力
 *   node scripts/find-inland-spots.mjs --check slug1,slug2   # 指定slugのみ内陸チェック（検証用）
 *   node scripts/find-inland-spots.mjs --fresh               # チェックポイントを破棄して最初から
 *
 * 出力: scripts/output/coord-sweep-report.json + コンソールサマリ
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECKPOINT = path.join(ROOT, '.claude/state/coord-sweep-progress.json');
const REPORT = path.join(ROOT, 'scripts/output/coord-sweep-report.json');

const GSI_API = 'https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php';
const REQUEST_INTERVAL_MS = 200; // 5req/s 上限厳守
const MAX_RETRIES = 2;
const CHECKPOINT_EVERY = 200;

/** 海釣り系spotType（river/lake/pondと管理釣り場は除外） */
const SEA_SPOT_TYPES = new Set(['port', 'beach', 'rocky', 'pier', 'breakwater', 'surf']);

/** 第1リング: 東西南北4方向×400m */
const RING1 = [
  { dir: 'N', bearing: 0, dist: 400 },
  { dir: 'E', bearing: 90, dist: 400 },
  { dir: 'S', bearing: 180, dist: 400 },
  { dir: 'W', bearing: 270, dist: 400 },
];
/** 第2リング: 8方向×700m */
const RING2 = [
  { dir: 'N', bearing: 0, dist: 700 },
  { dir: 'NE', bearing: 45, dist: 700 },
  { dir: 'E', bearing: 90, dist: 700 },
  { dir: 'SE', bearing: 135, dist: 700 },
  { dir: 'S', bearing: 180, dist: 700 },
  { dir: 'SW', bearing: 225, dist: 700 },
  { dir: 'W', bearing: 270, dist: 700 },
  { dir: 'NW', bearing: 315, dist: 700 },
];

// ── 実データ読み込み（spot-quality-stats.mjs と同方式: esbuildでバンドル評価） ──
export async function loadSpots() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tsurispot-coord-sweep-'));
  const outfile = path.join(tmpDir, 'bundle.mjs');
  try {
    await build({
      stdin: {
        contents: `export { fishingSpots } from './src/lib/data/spots';`,
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
    const mod = await import(pathToFileURL(outfile).href);
    return mod.fishingSpots;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ── 幾何ユーティリティ ──────────────────────────────
const EARTH_R = 6371000; // m
const toRad = (deg) => (deg * Math.PI) / 180;

/** ハーバサイン距離（m） */
export function haversine(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
}

/** 座標から bearing(度)・距離(m) だけ移動した点（小距離なので平面近似で十分） */
export function offsetPoint(lat, lng, bearingDeg, distM) {
  const b = toRad(bearingDeg);
  const dLat = (distM * Math.cos(b)) / 111320;
  const dLng = (distM * Math.sin(b)) / (111320 * Math.cos(toRad(lat)));
  return { lat: lat + dLat, lng: lng + dLng };
}

// ── 標高API ─────────────────────────────────────────
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 1点の標高を問い合わせる。戻り値:
 *   { status: 'sea' } | { status: 'land', elevation } | { status: 'error', message }
 * 必ず呼び出しごとに REQUEST_INTERVAL_MS 待機（直列前提）。
 */
export async function probeElevation(lat, lng, userAgent = 'tsurispot-coord-sweep/1.0') {
  const url = `${GSI_API}?lon=${lng.toFixed(6)}&lat=${lat.toFixed(6)}&outtype=JSON`;
  let lastError = 'unknown';
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 10000);
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': userAgent } });
      clearTimeout(timer);
      await sleep(REQUEST_INTERVAL_MS);
      if (!res.ok) {
        lastError = `HTTP ${res.status}`;
        continue;
      }
      const json = await res.json();
      if (json.elevation === '-----') return { status: 'sea' };
      if (typeof json.elevation === 'number') return { status: 'land', elevation: json.elevation };
      lastError = `unexpected payload: ${JSON.stringify(json).slice(0, 100)}`;
    } catch (e) {
      lastError = e.name === 'AbortError' ? 'timeout' : String(e.message || e);
      await sleep(REQUEST_INTERVAL_MS);
    }
  }
  return { status: 'error', message: lastError };
}

/**
 * 1スポットの水際判定。
 * 戻り値: { verdict: 'waterfront'|'inland-weak'|'inland-suspect'|'probe-error',
 *           probes: [...], requestCount }
 *   waterfront     … 座標自体が海上 or 400m以内に海（正常とみなす）
 *   inland-weak    … 400m以内は全陸だが700m以内に海（弱疑い・要目視）
 *   inland-suspect … 700m以内に海が一切ない（強疑い）
 */
export async function checkSpot(spot) {
  const probes = [];
  let requestCount = 0;
  let errorCount = 0;

  // 中心点: スポット座標自体が海上なら即 waterfront（1リクエストで確定）
  const center = await probeElevation(spot.latitude, spot.longitude);
  requestCount++;
  probes.push({ dir: 'C', dist: 0, ...center });
  if (center.status === 'sea') return { verdict: 'waterfront', probes, requestCount };
  if (center.status === 'error') errorCount++;

  for (const ring of [RING1, RING2]) {
    for (const { dir, bearing, dist } of ring) {
      const p = offsetPoint(spot.latitude, spot.longitude, bearing, dist);
      const result = await probeElevation(p.lat, p.lng);
      requestCount++;
      probes.push({ dir, dist, ...result });
      if (result.status === 'sea') {
        // 第1リング到達なら waterfront、第2リングでやっと到達なら weak
        const verdict = ring === RING1 ? 'waterfront' : 'inland-weak';
        return { verdict, probes, requestCount }; // ショートサーキット
      }
      if (result.status === 'error') errorCount++;
    }
  }
  // 全プローブがエラーなら判定不能（内陸とは断定しない）
  if (errorCount === probes.length) return { verdict: 'probe-error', probes, requestCount };
  return { verdict: 'inland-suspect', probes, requestCount };
}

// ── 近接重複検出（ネットワーク不要） ─────────────────
/** 名前正規化: NFKC + 空白除去 + 括弧書き除去 */
function normalizeName(name) {
  return name
    .normalize('NFKC')
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/\s+/g, '');
}

/** レーベンシュタイン編集距離 */
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

/**
 * 距離500m以内 かつ 名前類似（包含 or 編集距離が短い方の長さの40%以下）のペアを列挙。
 * 全ペア比較は緯度ソート+スライディングウィンドウで O(n·w) に削減。
 */
function findDuplicateSuspects(spots) {
  const MAX_DIST_M = 500;
  const LAT_WINDOW_DEG = MAX_DIST_M / 111320 + 1e-6;
  const sorted = spots
    .map((s) => ({ s, norm: normalizeName(s.name) }))
    .sort((a, b) => a.s.latitude - b.s.latitude);

  const pairs = [];
  for (let i = 0; i < sorted.length; i++) {
    const A = sorted[i];
    for (let j = i + 1; j < sorted.length; j++) {
      const B = sorted[j];
      if (B.s.latitude - A.s.latitude > LAT_WINDOW_DEG) break;
      const dist = haversine(A.s.latitude, A.s.longitude, B.s.latitude, B.s.longitude);
      if (dist > MAX_DIST_M) continue;

      const contains = A.norm.includes(B.norm) || B.norm.includes(A.norm);
      const editDist = contains ? 0 : levenshtein(A.norm, B.norm);
      const threshold = Math.max(1, Math.floor(Math.min(A.norm.length, B.norm.length) * 0.4));
      const similar = contains || editDist <= threshold;
      if (!similar) continue;

      pairs.push({
        slugA: A.s.slug,
        nameA: A.s.name,
        slugB: B.s.slug,
        nameB: B.s.name,
        prefecture: A.s.region?.prefecture ?? '',
        distanceM: Math.round(dist),
        nameRelation: contains ? 'containment' : `editDistance=${editDist}`,
      });
    }
  }
  return pairs.sort((a, b) => a.distanceM - b.distanceM);
}

// ── チェックポイント ─────────────────────────────────
function loadCheckpoint() {
  try {
    return JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8'));
  } catch {
    return null;
  }
}

function saveCheckpoint(state) {
  fs.mkdirSync(path.dirname(CHECKPOINT), { recursive: true });
  fs.writeFileSync(CHECKPOINT, JSON.stringify(state));
}

// ── メイン ───────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const checkIdx = args.indexOf('--check');
  const checkSlugs = checkIdx >= 0 ? (args[checkIdx + 1] || '').split(',').filter(Boolean) : null;
  const fresh = args.includes('--fresh');

  console.log('スポットデータを読み込み中（esbuildバンドル評価）...');
  const fishingSpots = await loadSpots();
  console.log(`総スポット数: ${fishingSpots.length}`);

  const seaSpots = fishingSpots.filter(
    (s) => SEA_SPOT_TYPES.has(s.spotType) && !s.isManagedPond,
  );
  console.log(`海釣り系スポット（${[...SEA_SPOT_TYPES].join('/')}、管理釣り場除外）: ${seaSpots.length}`);

  // ── 検証モード: 指定slugのみ内陸チェック ──
  if (checkSlugs) {
    for (const slug of checkSlugs) {
      const spot = fishingSpots.find((s) => s.slug === slug);
      if (!spot) {
        console.log(`[--check] ${slug}: 見つかりません`);
        continue;
      }
      console.log(`[--check] ${slug} (${spot.name}, ${spot.spotType}, ${spot.latitude},${spot.longitude}) ...`);
      const r = await checkSpot(spot);
      console.log(`  → ${r.verdict} (リクエスト${r.requestCount}回)`);
      for (const p of r.probes) {
        console.log(`    ${p.dir} ${p.dist}m: ${p.status}${p.status === 'land' ? ` (${p.elevation}m)` : ''}${p.status === 'error' ? ` (${p.message})` : ''}`);
      }
    }
    return;
  }

  // ── Phase 1: 近接重複検出（ネットワーク不要・先に実行） ──
  console.log('\n=== Phase 1: 近接重複検出（500m以内 + 名前類似） ===');
  const duplicateSuspects = findDuplicateSuspects(fishingSpots);
  console.log(`重複疑いペア: ${duplicateSuspects.length}件`);

  // ── Phase 2: 内陸疑い検出（GSI標高API・直列） ──
  console.log('\n=== Phase 2: 内陸疑い検出（GSI標高API、直列・200ms間隔） ===');
  let results = {};
  if (!fresh) {
    const cp = loadCheckpoint();
    if (cp?.results) {
      results = cp.results;
      console.log(`チェックポイントから再開: ${Object.keys(results).length}件処理済み`);
    }
  }

  const pending = seaSpots.filter((s) => !(s.slug in results));
  console.log(`残り: ${pending.length}件 / ${seaSpots.length}件`);
  const startedAt = Date.now();
  let processed = 0;
  let requestsTotal = 0;

  // スポット単位の小規模並列（各ワーカー内のプローブは従来どおり直列+200ms間隔。
  // GSI APIのレスポンスが約2秒/件と遅く、直列だと全件7時間超かかるため。
  // 実効レートは 3並列 × 約0.5req/s ≈ 1.5req/s で5req/s上限に対し十分マナー内）
  const CONCURRENCY = 3;
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= pending.length) return;
      const spot = pending[i];
      const r = await checkSpot(spot);
      results[spot.slug] = {
        verdict: r.verdict,
        probes: r.probes.map((p) => ({
          dir: p.dir,
          dist: p.dist,
          status: p.status,
          ...(p.status === 'land' ? { elevation: p.elevation } : {}),
        })),
      };
      processed++;
      requestsTotal += r.requestCount;

      if (processed % CHECKPOINT_EVERY === 0 || processed === pending.length) {
        saveCheckpoint({ updatedAt: new Date().toISOString(), results });
        const elapsed = (Date.now() - startedAt) / 1000;
        const rate = processed / elapsed;
        const etaMin = ((pending.length - processed) / rate / 60).toFixed(1);
        const all = Object.values(results);
        const strong = all.filter((v) => v.verdict === 'inland-suspect').length;
        const weak = all.filter((v) => v.verdict === 'inland-weak').length;
        console.log(
          `  進捗 ${processed}/${pending.length}（API ${requestsTotal}req, ${elapsed.toFixed(0)}s経過, 残り約${etaMin}分） 内陸疑い累計: 強${strong}件 / 弱${weak}件`,
        );
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  if (pending.length > 0) saveCheckpoint({ updatedAt: new Date().toISOString(), results });

  // ── レポート生成 ──
  const spotBySlug = new Map(fishingSpots.map((s) => [s.slug, s]));
  const inlandSuspects = [];
  const inlandWeak = [];
  const probeErrors = [];
  for (const [slug, r] of Object.entries(results)) {
    const spot = spotBySlug.get(slug);
    if (!spot) continue; // データ側から消えたスポット
    const entry = {
      slug,
      name: spot.name,
      prefecture: spot.region?.prefecture ?? '',
      latitude: spot.latitude,
      longitude: spot.longitude,
      spotType: spot.spotType,
      probes: r.probes,
    };
    if (r.verdict === 'inland-suspect') inlandSuspects.push(entry);
    else if (r.verdict === 'inland-weak') inlandWeak.push(entry);
    else if (r.verdict === 'probe-error') probeErrors.push(entry);
  }
  const byPref = (a, b) => a.prefecture.localeCompare(b.prefecture, 'ja') || a.slug.localeCompare(b.slug);
  inlandSuspects.sort(byPref);
  inlandWeak.sort(byPref);

  const byPrefecture = {};
  for (const s of inlandSuspects) {
    byPrefecture[s.prefecture] = (byPrefecture[s.prefecture] || 0) + 1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    method: {
      inland:
        'GSI標高API（https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php）で周辺点の標高を照会。海上は elevation="-----"。中心点→第1リング(4方向×400m)→第2リング(8方向×700m)の順に評価し、中心or第1リングで海=waterfront、第2リングでやっと海=inland-weak（弱疑い）、全点陸=inland-suspect（強疑い）。',
      duplicate: '距離500m以内 かつ 名前類似（正規化後の包含 or 編集距離が短い方の40%以下）のペア。',
      caveats: [
        '磯・沖堤防・河口部など、周囲700m以内に標高データのない水面（海）が存在しても、DEMの解像度や埋立地の更新遅れにより誤検知/見逃しがありうる',
        '港湾内・運河・河川の水面はDEMが標高値を持つ（陸扱いになる）場合があり、岸壁スポットが誤ってフラグされうる',
        '内水面（湖など）が "-----"を返す場合もあり、海と区別できない',
        'inland-suspect/inland-weakは「要目視確認」のフラグであり確定エラーではない',
      ],
    },
    stats: {
      totalSpots: fishingSpots.length,
      seaSpots: seaSpots.length,
      checked: Object.keys(results).length,
      inlandSuspects: inlandSuspects.length,
      inlandWeak: inlandWeak.length,
      probeErrors: probeErrors.length,
      duplicateSuspectPairs: duplicateSuspects.length,
      inlandByPrefecture: byPrefecture,
    },
    inlandSuspects,
    inlandWeak,
    probeErrors,
    duplicateSuspects,
  };

  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));

  // ── コンソールサマリ ──
  console.log('\n=== 座標品質スイープ結果 ===');
  console.log(`総スポット: ${fishingSpots.length} / 海釣り系: ${seaSpots.length} / チェック済み: ${Object.keys(results).length}`);
  console.log(`内陸疑い(強・700m圏に海なし): ${inlandSuspects.length}件 / 弱疑い(400m超〜700m圏): ${inlandWeak.length}件 / プローブ全エラー: ${probeErrors.length}件 / 重複疑い: ${duplicateSuspects.length}ペア`);
  console.log('\n--- 内陸疑い 都道府県別 ---');
  for (const [pref, n] of Object.entries(byPrefecture).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pref}: ${n}件`);
  }
  console.log('\n--- 内陸疑い 先頭20件 ---');
  for (const s of inlandSuspects.slice(0, 20)) {
    console.log(`  ${s.slug} (${s.name}, ${s.prefecture}, ${s.spotType}) ${s.latitude},${s.longitude}`);
  }
  console.log('\n--- 重複疑い 先頭20ペア ---');
  for (const p of duplicateSuspects.slice(0, 20)) {
    console.log(`  ${p.distanceM}m: ${p.slugA}(${p.nameA}) ↔ ${p.slugB}(${p.nameB}) [${p.prefecture}]`);
  }
  console.log(`\nレポート: ${path.relative(ROOT, REPORT)}`);
}

// 直接実行時のみ main を起動（fix-inland-coords.mjs 等からの import 時は何もしない）
const isMainModule =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMainModule) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
