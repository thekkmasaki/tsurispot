#!/usr/bin/env node
/**
 * 魚種×スポットの出典付与・エントリ追加の一括適用ツール
 *
 * 全国の釣りメッカ照合レビュー（mecca-proposals）の提案JSONを、
 * dedup勝者のスポット定義に安全に適用する。
 * fix-inland-coords → apply-coord-fixes と同じ「提案JSON→ドライラン→--apply」方式。
 *
 * 提案JSONスキーマ（scripts/output/mecca-proposals/<fish>.json）:
 * {
 *   "fish": "suzuki",
 *   "proposals": [
 *     { "action": "add-source", "spotSlug": "runtime勝者slug", "source": "アングラーズ 旧江戸川", "evidence": "..." },
 *     { "action": "add-entry", "spotSlug": "...", "monthStart": 4, "monthEnd": 6, "peakSeason": true,
 *       "catchDifficulty": "medium", "recommendedTime": "朝夕マヅメ", "method": "エギング",
 *       "source": "...", "evidence": "..." },
 *     { "action": "note", "text": "適性値の調整提案など（このツールでは適用しない）" }
 *   ]
 * }
 *
 * 使い方:
 *   node scripts/apply-fish-source-fixes.mjs                # ドライラン（全提案の適用可否を報告）
 *   node scripts/apply-fish-source-fixes.mjs --apply        # 実適用
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const PROPOSAL_DIR = path.join(ROOT, 'scripts/output/mecca-proposals');
const APPLY = process.argv.includes('--apply');

// ── 実行時データ（dedup勝者のid解決に使う） ──────────────
async function loadRuntime() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tsurispot-fix-'));
  const outfile = path.join(tmpDir, 'bundle.mjs');
  try {
    await build({
      stdin: {
        contents: `export { fishingSpots } from './src/lib/data/spots';`,
        resolveDir: ROOT,
        loader: 'ts',
      },
      bundle: true, format: 'esm', platform: 'node',
      tsconfig: path.join(ROOT, 'tsconfig.json'), outfile, logLevel: 'error',
    });
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const { fishingSpots } = await loadRuntime();
const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));

// ── スポットファイルの読み込み ──────────────────────────
const dataDir = path.join(ROOT, 'src/lib/data');
const spotFiles = fs.readdirSync(dataDir).filter((f) => f.startsWith('spots-') && f.endsWith('.ts'));
const fileCache = new Map(); // file -> content
function readFile(f) {
  if (!fileCache.has(f)) fileCache.set(f, fs.readFileSync(path.join(dataDir, f), 'utf8'));
  return fileCache.get(f);
}

/** id からスポット定義ブロック位置（idのある行〜catchableFish配列の終端）を特定 */
function locateBlock(id) {
  const needle = `id: "${id}"`;
  for (const f of spotFiles) {
    const content = readFile(f);
    const idPos = content.indexOf(needle);
    if (idPos === -1) continue;
    const cfPos = content.indexOf('catchableFish: [', idPos);
    if (cfPos === -1) return null;
    const cfEnd = content.indexOf('\n    ],', cfPos);
    if (cfEnd === -1) return null;
    return { file: f, idPos, cfPos, cfEnd };
  }
  return null;
}

const results = { applied: [], skipped: [] };

function applyToFile(file, newContent) {
  fileCache.set(file, newContent);
}

// ── 提案の適用 ──────────────────────────────────────
const proposalFiles = fs.existsSync(PROPOSAL_DIR)
  ? fs.readdirSync(PROPOSAL_DIR).filter((f) => f.endsWith('.json'))
  : [];
if (!proposalFiles.length) {
  console.log(`提案なし: ${path.relative(ROOT, PROPOSAL_DIR)}/*.json が空です`);
  process.exit(0);
}

for (const pf of proposalFiles) {
  const doc = JSON.parse(fs.readFileSync(path.join(PROPOSAL_DIR, pf), 'utf8'));
  const fishSlug = doc.fish;
  for (const p of doc.proposals || []) {
    const label = `${fishSlug} @ ${p.spotSlug || '-'} [${p.action}]`;
    if (p.action === 'note') {
      results.skipped.push(`${label}: メモ（手動判断）: ${p.text}`);
      continue;
    }
    const spot = bySlug.get(p.spotSlug);
    if (!spot) {
      results.skipped.push(`${label}: 実行時スポットに存在しない（dedup敗者slugの可能性。dedup-winner.mjsで勝者を確認）`);
      continue;
    }
    const loc = locateBlock(spot.id);
    if (!loc) {
      results.skipped.push(`${label}: id=${spot.id} のブロックを特定できず`);
      continue;
    }
    const content = readFile(loc.file);
    const cfBody = content.slice(loc.cfPos, loc.cfEnd);

    if (p.action === 'add-source') {
      if (!p.source) { results.skipped.push(`${label}: source未指定`); continue; }
      // 単一行エントリのみ対象。source未付与のこの魚の行すべてに付与
      const lineRe = new RegExp(`^(\\s*\\{ fish: fish\\("${fishSlug}"\\)(?:(?!source:).)*?) \\},\\s*$`, 'gm');
      let count = 0;
      const newBody = cfBody.replace(lineRe, (m, head) => {
        count++;
        return `${head}, source: "${p.source}" },`;
      });
      if (count === 0) {
        const has = cfBody.includes(`fish("${fishSlug}")`);
        results.skipped.push(`${label}: ${has ? '既にsource付与済み or 複数行エントリ' : 'この魚のエントリが無い（add-entryを検討）'}`);
        continue;
      }
      applyToFile(loc.file, content.slice(0, loc.cfPos) + newBody + content.slice(loc.cfEnd));
      results.applied.push(`${label}: ${count}エントリに source="${p.source}" (${loc.file})`);
    } else if (p.action === 'add-entry') {
      const required = ['monthStart', 'monthEnd', 'peakSeason', 'catchDifficulty', 'recommendedTime', 'method', 'source'];
      if (required.some((k) => p[k] === undefined)) {
        results.skipped.push(`${label}: add-entryの必須フィールド不足`);
        continue;
      }
      // 同月レンジの既存エントリがあればスキップ（冪等）
      const dup = new RegExp(`fish\\("${fishSlug}"\\), monthStart: ${p.monthStart}, monthEnd: ${p.monthEnd}`);
      if (dup.test(cfBody)) {
        results.skipped.push(`${label}: 同月レンジのエントリが既に存在`);
        continue;
      }
      const line = `      { fish: fish("${fishSlug}"), monthStart: ${p.monthStart}, monthEnd: ${p.monthEnd}, peakSeason: ${p.peakSeason}, catchDifficulty: "${p.catchDifficulty}", recommendedTime: "${p.recommendedTime}", method: "${p.method}", source: "${p.source}" },\n`;
      const insertAt = loc.cfPos + 'catchableFish: ['.length;
      const nl = content.indexOf('\n', insertAt) + 1;
      applyToFile(loc.file, content.slice(0, nl) + line + content.slice(nl));
      results.applied.push(`${label}: エントリ追加 ${p.monthStart}-${p.monthEnd}月/${p.method} (${loc.file})`);
    } else {
      results.skipped.push(`${label}: 未知のaction`);
    }
  }
}

// ── 書き出し & レポート ────────────────────────────────
if (APPLY) {
  for (const [f, content] of fileCache) {
    const orig = fs.readFileSync(path.join(dataDir, f), 'utf8');
    if (orig !== content) fs.writeFileSync(path.join(dataDir, f), content);
  }
}
console.log(`=== ${APPLY ? '適用' : 'ドライラン'} 結果 ===`);
console.log(`適用${APPLY ? '' : '可能'}: ${results.applied.length}件`);
for (const r of results.applied) console.log(`  ✓ ${r}`);
console.log(`スキップ: ${results.skipped.length}件`);
for (const r of results.skipped) console.log(`  - ${r}`);
