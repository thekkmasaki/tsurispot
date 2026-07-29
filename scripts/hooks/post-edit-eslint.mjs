#!/usr/bin/env node
// Claude Code PostToolUse(Edit|Write)フック: 編集された src/ 配下の .ts/.tsx を
// その1ファイルだけ eslint --fix し、自動修正できない残エラーは exit 2 で
// Claude にフィードバックして即時修正させる（1ファイルなので数秒で完了する）。
//
// - キルスイッチ: 環境変数 TSURISPOT_HOOKS_OFF=1 で即スキップ
// - src/ 外・.ts/.tsx 以外（データ大量編集・md・画像等）では発火しない
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.TSURISPOT_HOOKS_OFF === '1') process.exit(0);

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {}

const filePath = input.tool_input?.file_path || '';
if (!/\.(ts|tsx)$/.test(filePath)) process.exit(0);

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
// Windows はパスの大文字小文字・区切りが揺れるので正規化して比較
const norm = (p) => p.replace(/\\/g, '/').toLowerCase();
if (!norm(filePath).startsWith(norm(join(repoRoot, 'src')) + '/')) process.exit(0);
if (!existsSync(filePath)) process.exit(0);

const eslintBin = join(repoRoot, 'node_modules', 'eslint', 'bin', 'eslint.js');
if (!existsSync(eslintBin)) process.exit(0);

try {
  execFileSync(
    process.execPath,
    [eslintBin, '--fix', '--no-warn-ignored', filePath],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 16 * 1024 * 1024,
    }
  );
} catch (err) {
  // exit 1 = 自動修正できない lint エラーが残った（fatal も同経路）
  const output = `${err.stdout || ''}\n${err.stderr || ''}`.trim();
  const head = output.split('\n').filter(Boolean).slice(0, 20).join('\n');
  console.error(`eslint エラー（自動修正不可・要手動修正）: ${filePath}\n${head}`);
  process.exit(2);
}
process.exit(0);
