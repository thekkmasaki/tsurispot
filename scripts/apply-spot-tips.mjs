#!/usr/bin/env node
/**
 * スポット攻略メモ（localTips）の一括適用ツール
 *
 * scripts/output/spot-tips-proposals/<slug>.json の提案を
 * src/lib/data/spot-tips-add.ts の spotTipsAdd へ反映する。
 * apply-fish-source-fixes.mjs と同型（提案JSON→ドライラン→--apply、dedup勝者解決つき）。
 *
 * 提案JSONスキーマ:
 * {
 *   "spotSlug": "rumoi-port",
 *   "tips": [
 *     { "text": "南防波堤の先端は水深があり秋はサバ・イワシの回遊が濃い", "source": "アングラーズ 留萌港", "evidence": "https://... で確認" }
 *   ]
 * }
 * evidence は裏取りURLの記録用（spot-tips-add.ts には text/source のみ書き込む）。
 *
 * 使い方:
 *   node scripts/apply-spot-tips.mjs          # ドライラン
 *   node scripts/apply-spot-tips.mjs --apply  # 実適用
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');
const PROPOSAL_DIR = path.join(ROOT, 'scripts/output/spot-tips-proposals');
const TARGET = path.join(ROOT, 'src/lib/data/spot-tips-add.ts');
const APPLY = process.argv.includes('--apply');

// dedup勝者slugの集合（敗者slugへの提案は無効化するため）
async function loadLiveSlugs() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tips-'));
  const outfile = path.join(tmpDir, 'b.mjs');
  try {
    await build({
      stdin: { contents: `export { fishingSpots } from './src/lib/data/spots';`, resolveDir: ROOT, loader: 'ts' },
      bundle: true, format: 'esm', platform: 'node', tsconfig: path.join(ROOT, 'tsconfig.json'), outfile, logLevel: 'error',
    });
    const { fishingSpots } = await import(pathToFileURL(outfile).href);
    return new Map(fishingSpots.map((s) => [s.slug, s.name]));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

const live = await loadLiveSlugs();

if (!fs.existsSync(PROPOSAL_DIR)) {
  console.log(`提案なし: ${path.relative(ROOT, PROPOSAL_DIR)} が存在しません`);
  process.exit(0);
}
const files = fs.readdirSync(PROPOSAL_DIR).filter((f) => f.endsWith('.json'));

const merged = {}; // slug -> [{text, source}]
const applied = [];
const skipped = [];
for (const f of files) {
  const doc = JSON.parse(fs.readFileSync(path.join(PROPOSAL_DIR, f), 'utf8'));
  const slug = doc.spotSlug;
  if (!live.has(slug)) {
    skipped.push(`${slug}: 実行時スポットに存在しない（dedup敗者slugの可能性）`);
    continue;
  }
  const tips = (doc.tips || []).filter((t) => t.text?.trim() && t.source?.trim());
  if (!tips.length) {
    skipped.push(`${slug}: 有効な tip（text+source）が無い`);
    continue;
  }
  merged[slug] = tips.map((t) => ({ text: t.text.trim(), source: t.source.trim() }));
  applied.push(`${slug}（${live.get(slug)}）: ${tips.length}件`);
}

// spot-tips-add.ts を生成（既存の手書き分は破棄せずマージ）
if (APPLY && applied.length > 0) {
  // 既存 spotTipsAdd を読み込んでマージ（同一slugは新提案で上書き）
  let existing = {};
  try {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'exist-'));
    const outfile = path.join(tmpDir, 'e.mjs');
    await build({ stdin: { contents: `export { spotTipsAdd } from './src/lib/data/spot-tips-add';`, resolveDir: ROOT, loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', tsconfig: path.join(ROOT, 'tsconfig.json'), outfile, logLevel: 'error' });
    existing = (await import(pathToFileURL(outfile).href)).spotTipsAdd ?? {};
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch { /* 初回は空 */ }
  const all = { ...existing, ...merged };
  const keys = Object.keys(all).sort();
  const body = keys
    .map((slug) => {
      const items = all[slug]
        .map((t) => `    { text: ${JSON.stringify(t.text)}, source: ${JSON.stringify(t.source)} },`)
        .join('\n');
      return `  ${JSON.stringify(slug)}: [\n${items}\n  ],`;
    })
    .join('\n');
  const header = fs.readFileSync(TARGET, 'utf8').split('export const spotTipsAdd')[0];
  fs.writeFileSync(TARGET, `${header}export const spotTipsAdd: Record<string, { text: string; source: string }[]> = {\n${body}\n};\n`);
}

console.log(`=== ${APPLY ? '適用' : 'ドライラン'} 結果 ===`);
console.log(`適用${APPLY ? '' : '可能'}: ${applied.length}スポット`);
for (const a of applied) console.log(`  ✓ ${a}`);
console.log(`スキップ: ${skipped.length}件`);
for (const s of skipped) console.log(`  - ${s}`);
