#!/usr/bin/env node
/**
 * 魚種×スポット「釣れる度」スナップショット / before-after差分
 *
 * 魚種ページの「釣れるスポット一覧」ロジック刷新（fish-aptitude導入）の
 * 効果測定・過剰除外検知・SEO保全（組み合わせページ増減の把握）に使う。
 *
 * spot-quality-stats.mjs と同じく esbuild で実行時データをバンドルし、
 * 本番と同一の fishingSpots / fishSpecies で集計する。
 * src/lib/data/fish-aptitude が存在すれば新ロジック（ゲート+スコア）で、
 * 存在しなければ現行ロジック（catchableFish有無 + peakSeason + rating順）で
 * 集計するため、master時点の before 採取にもそのまま使える。
 *
 * 使い方:
 *   node scripts/fish-aptitude-snapshot.mjs --label before
 *     → scripts/output/fish-aptitude-snapshot-before.json
 *   node scripts/fish-aptitude-snapshot.mjs --label after
 *   node scripts/fish-aptitude-snapshot.mjs --diff scripts/output/fish-aptitude-snapshot-before.json scripts/output/fish-aptitude-snapshot-after.json
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT_DIR = path.join(ROOT, 'scripts/output');

// ── 海域ラベル（scripts/lib/sea-label-resolver.mjs と同一ロジック） ──
import { resolveSeaLabel } from './lib/sea-label-resolver.mjs';

/** 海域ラベル → 粗い「側」分類（レポート用） */
const SEA_SIDE = {
  日本海: '日本海側', 若狭湾: '日本海側', 富山湾: '日本海側',
  玄界灘: '日本海側', 響灘: '日本海側', 津軽海峡: '日本海側',
  瀬戸内海: '瀬戸内', 播磨灘: '瀬戸内', 備讃瀬戸: '瀬戸内', 大阪湾: '瀬戸内',
  東シナ海: '東シナ海', 有明海: '東シナ海',
  オホーツク海: 'オホーツク', 噴火湾: '太平洋側', 陸奥湾: '日本海側',
};
const seaSide = (label) => SEA_SIDE[label] ?? '太平洋側';

// ── diffモード ──────────────────────────────────────
const args = process.argv.slice(2);
if (args[0] === '--diff') {
  const [a, b] = [args[1], args[2]].map((p) => JSON.parse(fs.readFileSync(p, 'utf8')));
  diff(a, b);
  process.exit(0);
}

const labelIdx = args.indexOf('--label');
const label = labelIdx >= 0 ? args[labelIdx + 1] : 'snapshot';

// ── 実行時データのバンドル & 読み込み ──────────────────
const hasAptitude = fs.existsSync(path.join(ROOT, 'src/lib/data/fish-aptitude/index.ts'));

async function loadRuntimeData() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tsurispot-aptitude-'));
  const outfile = path.join(tmpDir, 'bundle.mjs');
  const aptitudeExports = hasAptitude
    ? `export { getCatchTier, getCatchScore } from './src/lib/data/fish-aptitude';`
    : '';
  try {
    await build({
      stdin: {
        contents: `
          export { fishingSpots } from './src/lib/data/spots';
          export { fishSpecies } from './src/lib/data/fish';
          export { prefectures } from './src/lib/data/prefectures';
          ${aptitudeExports}
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

const rt = await loadRuntimeData();
const { fishingSpots, fishSpecies, prefectures } = rt;
const prefSlugByName = new Map(prefectures.map((p) => [p.name, p.slug]));

// ── 魚種ごとの一覧を現行/新ロジックで構築 ──────────────
/** 現行ロジック: 掲載=catchableFishに存在 / tier=peakSeason / sort=rating+(peak?2:1) */
function legacyEntries(fish) {
  const entries = [];
  for (const spot of fishingSpots) {
    const cf = spot.catchableFish.find((c) => c.fish.slug === fish.slug);
    if (!cf) continue;
    const tier = cf.peakSeason ? 'excellent' : 'good';
    const score = spot.rating + (cf.peakSeason ? 2 : 1);
    entries.push({ spot, tier, score });
  }
  entries.sort((a, b) => b.score - a.score || a.spot.slug.localeCompare(b.spot.slug));
  return entries;
}

/** 新ロジック: fish-aptitude の getCatchTier / getCatchScore */
function aptitudeEntries(fish) {
  const entries = [];
  for (const spot of fishingSpots) {
    if (!spot.catchableFish.some((c) => c.fish.slug === fish.slug)) continue;
    const tier = rt.getCatchTier(spot, fish.slug);
    if (tier === 'excluded') {
      entries.push({ spot, tier, score: 0, excluded: true });
      continue;
    }
    entries.push({ spot, tier, score: rt.getCatchScore(spot, fish.slug) });
  }
  const listed = entries.filter((e) => !e.excluded);
  listed.sort(
    (a, b) => b.score - a.score || b.spot.rating - a.spot.rating || a.spot.slug.localeCompare(b.spot.slug),
  );
  return { listed, excludedCount: entries.length - listed.length };
}

const t0 = performance.now();
const snapshot = { label, mode: hasAptitude ? 'aptitude' : 'legacy', generatedAt: null, fish: {} };
for (const fish of fishSpecies) {
  let listed, excludedCount;
  if (hasAptitude) {
    ({ listed, excludedCount } = aptitudeEntries(fish));
  } else {
    listed = legacyEntries(fish);
    excludedCount = 0;
  }
  const tierDist = { excellent: 0, good: 0, fair: 0 };
  const seaDist = {};
  const prefCombos = {};
  for (const e of listed) {
    tierDist[e.tier] = (tierDist[e.tier] || 0) + 1;
    const side = seaSide(resolveSeaLabel(e.spot.latitude, e.spot.longitude));
    seaDist[side] = (seaDist[side] || 0) + 1;
    const prefSlug = prefSlugByName.get(e.spot.region.prefecture);
    if (prefSlug) prefCombos[prefSlug] = (prefCombos[prefSlug] || 0) + 1;
  }
  const top30 = listed.slice(0, 30).map((e) => ({
    slug: e.spot.slug,
    pref: e.spot.region.prefecture,
    sea: seaSide(resolveSeaLabel(e.spot.latitude, e.spot.longitude)),
    tier: e.tier,
    score: Math.round(e.score * 10) / 10,
  }));
  snapshot.fish[fish.slug] = {
    name: fish.name,
    category: fish.category,
    count: listed.length,
    excluded: excludedCount,
    tierDist,
    seaDist,
    prefCombos,
    top30,
  };
}
const elapsedMs = Math.round(performance.now() - t0);
snapshot.elapsedMs = elapsedMs;
snapshot.totalSpots = fishingSpots.length;
snapshot.generatedAt = new Date().toISOString();

fs.mkdirSync(OUT_DIR, { recursive: true });
const outPath = path.join(OUT_DIR, `fish-aptitude-snapshot-${label}.json`);
fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 1));

// ── サマリ出力 ──────────────────────────────────────
console.log(`=== fish-aptitude snapshot (${snapshot.mode}) ===`);
console.log(`総スポット: ${snapshot.totalSpots} / 魚種: ${fishSpecies.length} / 集計 ${elapsedMs}ms`);
console.log(`出力: ${path.relative(ROOT, outPath)}`);
const ao = snapshot.fish['aoriika'];
if (ao) {
  const top30Sea = {};
  for (const t of ao.top30) top30Sea[t.sea] = (top30Sea[t.sea] || 0) + 1;
  console.log('');
  console.log('--- aoriika ---');
  console.log(`  掲載 ${ao.count}件 (除外 ${ao.excluded}件) tier=${JSON.stringify(ao.tierDist)}`);
  console.log(`  掲載の海域内訳: ${JSON.stringify(ao.seaDist)}`);
  console.log(`  TOP30の海域内訳: ${JSON.stringify(top30Sea)}`);
}

// ── diff実装 ────────────────────────────────────────
function diff(a, b) {
  console.log(`=== diff: ${a.label}(${a.mode}) → ${b.label}(${b.mode}) ===`);
  console.log(`集計時間: ${a.elapsedMs}ms → ${b.elapsedMs}ms`);
  const MIN_SPOTS = 3; // getEligiblePrefFishCombos の閾値
  let comboLost = [];
  let comboGained = [];
  const flagged = [];
  for (const slug of Object.keys(a.fish)) {
    const fa = a.fish[slug];
    const fb = b.fish[slug];
    if (!fb) continue;
    // 県×魚種combo（>=3件）の増減
    const eligibleA = new Set(Object.entries(fa.prefCombos).filter(([, c]) => c >= MIN_SPOTS).map(([p]) => p));
    const eligibleB = new Set(Object.entries(fb.prefCombos).filter(([, c]) => c >= MIN_SPOTS).map(([p]) => p));
    for (const p of eligibleA) if (!eligibleB.has(p)) comboLost.push(`${p}/fish/${slug} (${fa.prefCombos[p]}→${fb.prefCombos[p] || 0}件)`);
    for (const p of eligibleB) if (!eligibleA.has(p)) comboGained.push(`${p}/fish/${slug}`);
    // 過剰除外フラグ
    const exclRate = fb.excluded / Math.max(1, fb.count + fb.excluded);
    if (exclRate > 0.4) flagged.push(`${slug}(${fb.name}): 除外率${(exclRate * 100).toFixed(0)}% (${fb.excluded}/${fb.count + fb.excluded})`);
    // 0件化検知
    if (fa.count > 0 && fb.count === 0) flagged.push(`${slug}(${fb.name}): 掲載0件化 (${fa.count}→0)`);
  }
  console.log('');
  console.log(`--- 県×魚種ページ(>=${MIN_SPOTS}件)の増減 ---`);
  console.log(`  消滅: ${comboLost.length}件 / 新規: ${comboGained.length}件`);
  for (const c of comboLost.slice(0, 50)) console.log(`    - /prefecture/${c}`);
  if (comboLost.length > 50) console.log(`    ... 他${comboLost.length - 50}件`);
  console.log('');
  console.log(`--- 要レビューフラグ (除外率>40% or 0件化) ---`);
  if (!flagged.length) console.log('  なし');
  for (const f of flagged) console.log(`  ⚠ ${f}`);
  console.log('');
  console.log('--- 主要魚種の件数・TOP30海域変化 ---');
  const majors = ['aoriika', 'aji', 'suzuki', 'kurodai', 'madai', 'mebaru', 'kisu', 'tachiuo', 'hirame', 'yariika'];
  for (const slug of majors) {
    const fa = a.fish[slug];
    const fb = b.fish[slug];
    if (!fa || !fb) continue;
    const seaTop = (f) => {
      const m = {};
      for (const t of f.top30) m[t.sea] = (m[t.sea] || 0) + 1;
      return Object.entries(m).map(([k, v]) => `${k}${v}`).join(' ');
    };
    console.log(`  ${slug.padEnd(10)} ${String(fa.count).padStart(4)}→${String(fb.count).padStart(4)}件 (除外${fb.excluded}) | TOP30: [${seaTop(fa)}] → [${seaTop(fb)}]`);
  }
}
