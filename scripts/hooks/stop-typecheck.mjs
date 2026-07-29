#!/usr/bin/env node
// Claude Code Stopフック: ターン終了時、.ts/.tsx に未コミット変更があれば
// tsc --noEmit を実行し、「新規の」型エラーがあればターン終了をブロックして
// 自己修正させる。「型エラーのまま『完了しました』と報告できない」ことを
// 機械的に保証する層。
//
// ベースライン方式（ラチェット）:
//   このマシンは npm install 禁止運用のため node_modules が package.json に
//   追随できず、素の tsc は環境起因エラー（TS2307 等）を常に報告する。
//   そこで初回実行時のエラー集合をベースラインとして LOCALAPPDATA に記録し、
//   ベースラインに無い「新規エラー」だけをブロック対象にする。
//   エラーが減ったらベースラインも自動で縮む（増やす方向には自動更新しない）。
//   完全な正は CI（npm ci 後の tsc）が担う。
//
// - キルスイッチ: 環境変数 TSURISPOT_HOOKS_OFF=1 で即スキップ
// - ベースライン再作成: LOCALAPPDATA/tsurispot-hooks/tsc-baseline.json を削除
// - tsbuildinfo・記録類は OneDrive 外（%LOCALAPPDATA%）に置く（EPERM・同期負荷回避）
// - プロセス起動は execFileSync の引数配列のみ（シェル解釈なし・日本語パス安全）
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.TSURISPOT_HOOKS_OFF === '1') process.exit(0);

// stop_hook_active: このフックのブロックで再開したターンの終了時に true。
// ここで抜けないと ブロック→修正→再Stop→再ブロック の無限ループになる。
let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  // stdin が無い手動実行でも動かせるようにする
}
if (input.stop_hook_active) process.exit(0);

// repo root はスクリプト自身の位置から解決（cwd 非依存。saas ルート起動でも動く）
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const tscBin = join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');
if (!existsSync(tscBin)) process.exit(0);

function git(args) {
  return execFileSync('git', ['-C', repoRoot, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

// .ts/.tsx の変更（未追跡含む）が無いターンでは一切走らない
let changedFiles = [];
try {
  changedFiles = git(['status', '--porcelain'])
    .split('\n')
    .map((l) => {
      const p = l.slice(3).trim();
      // リネーム "old -> new" は新パス側を見る
      return p.includes(' -> ') ? p.split(' -> ').pop() : p;
    })
    .filter((p) => /\.(ts|tsx)$/.test(p));
} catch {
  process.exit(0);
}
if (changedFiles.length === 0) process.exit(0);

// 前回 PASS 時と作業状態（HEAD + 変更ファイル内容）が同一ならスキップ
// （TS を触っていない連続ターンで毎回 tsc を回さない）
const stateDir = join(
  process.env.LOCALAPPDATA || join(process.env.HOME || repoRoot, '.cache'),
  'tsurispot-hooks'
);
mkdirSync(stateDir, { recursive: true });
const stateFile = join(stateDir, 'last-pass.json');
const baselineFile = join(stateDir, 'tsc-baseline.json');

const hash = createHash('sha256');
try {
  hash.update(git(['rev-parse', 'HEAD']).trim());
} catch {}
for (const rel of [...changedFiles].sort()) {
  hash.update('\0' + rel + '\0');
  const abs = join(repoRoot, rel);
  if (existsSync(abs)) {
    try {
      hash.update(readFileSync(abs));
    } catch {}
  }
}
const stateHash = hash.digest('hex');
try {
  const last = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (last.hash === stateHash) process.exit(0);
} catch {}

// tsc 実行（エラーでも throw させず出力を回収する）
let tscOutput = '';
let tscFailed = false;
try {
  execFileSync(
    process.execPath,
    [tscBin, '--noEmit', '--incremental', '--tsBuildInfoFile', join(stateDir, 'tsbuildinfo')],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    }
  );
} catch (err) {
  tscFailed = true;
  tscOutput = `${err.stdout || ''}\n${err.stderr || ''}`;
}

function savePass() {
  writeFileSync(stateFile, JSON.stringify({ hash: stateHash, at: new Date().toISOString() }));
  process.exit(0);
}

if (!tscFailed) {
  // 真の PASS: ベースラインも空へ（環境が直った場合の自動回復）
  writeFileSync(baselineFile, JSON.stringify({ keys: [], updatedAt: new Date().toISOString() }));
  savePass();
}

// エラー行を「ファイル|TSコード|メッセージ」に正規化（行番号は編集でずれるため除外）
const errorLines = tscOutput
  .split('\n')
  .map((l) => l.replace(/\r$/, ''))
  .filter((l) => /error TS\d+:/.test(l));
const toKey = (l) => {
  const m = l.match(/^(.*?)\(\d+,\d+\): error (TS\d+): (.*)$/);
  return m ? `${m[1]}|${m[2]}|${m[3]}` : l;
};
const current = new Map(errorLines.map((l) => [toKey(l), l]));

let baseline = null;
try {
  baseline = new Set(JSON.parse(readFileSync(baselineFile, 'utf8')).keys);
} catch {}

if (baseline === null) {
  // ベースライン未作成: 現在のエラー集合を環境ベースラインとして記録して通す。
  // （本来はセットアップ時に一度クリーンな状態で作成しておくこと）
  writeFileSync(
    baselineFile,
    JSON.stringify({ keys: [...current.keys()], updatedAt: new Date().toISOString() }, null, 2)
  );
  savePass();
}

const newErrors = [...current.entries()].filter(([k]) => !baseline.has(k));
if (newErrors.length === 0) {
  // 新規エラーなし: ベースラインを現在集合に縮小（ラチェット）して通す
  writeFileSync(
    baselineFile,
    JSON.stringify({ keys: [...current.keys()], updatedAt: new Date().toISOString() }, null, 2)
  );
  savePass();
}

const head = newErrors.slice(0, 30).map(([, line]) => line).join('\n');
console.log(
  JSON.stringify({
    decision: 'block',
    reason:
      `型チェック失敗: 今回の作業で新規の型エラーが ${newErrors.length} 件発生しています。` +
      `修正してからターンを終了してください:\n${head}` +
      (newErrors.length > 30 ? '\n…（省略。npx tsc --noEmit で全件確認）' : '') +
      `\n（注: このマシン既知の環境起因エラー ${baseline.size} 件はベースラインとして除外済み。完全な検証は CI が実施）`,
  })
);
process.exit(0);
