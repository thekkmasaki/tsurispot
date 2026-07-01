// Weekly report poster for microCMS
//
// 週報記事を microCMS に投稿する。二重投稿防止・リトライ・ログを備える。
//   - 同一 slug が既に存在すれば PATCH（更新）、無ければ POST（新規）
//   - 失敗時は指数バックオフで最大3回リトライ
//   - 結果を tmp/weekly-report-log-YYYY-MM-DD.json に追記
//   - APIキーは .env.local(MICROCMS_API_KEY) から読む（ハードコードしない）
//
// Usage:
//   node scripts/post-weekly-report.mjs <json-file> [<json-file> ...]
//   node scripts/post-weekly-report.mjs --dry-run <json-file>   # 既存チェックのみ、書き込みなし

import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ENDPOINT = 'https://tsurispot.microcms.io/api/v1/blogs';

/** .env.local から MICROCMS_API_KEY を読む（無ければ環境変数フォールバック） */
function getApiKey() {
  if (process.env.MICROCMS_API_KEY) return process.env.MICROCMS_API_KEY;
  const envPath = join(ROOT, '.env.local');
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, 'utf-8')
      .split('\n')
      .find((l) => l.trim().startsWith('MICROCMS_API_KEY='));
    if (line) return line.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  }
  throw new Error(
    'MICROCMS_API_KEY が見つかりません（.env.local または環境変数に設定してください）'
  );
}

const API_KEY = getApiKey();
const HEADERS = { 'Content-Type': 'application/json', 'X-MICROCMS-API-KEY': API_KEY };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 指数バックオフ付き fetch（429/5xx とネットワークエラーをリトライ） */
async function fetchRetry(url, init, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
      } else {
        return res;
      }
    } catch (e) {
      lastErr = e;
    }
    const wait = 1000 * 2 ** i; // 1s, 2s, 4s
    console.warn(`  リトライ ${i + 1}/${attempts}（${wait}ms待機）: ${lastErr.message}`);
    await sleep(wait);
  }
  throw lastErr;
}

/** slug で既存記事を検索し、あれば contentId を返す */
async function findExistingId(slug) {
  const url = `${ENDPOINT}?filters=${encodeURIComponent(`slug[equals]${slug}`)}&fields=id&limit=1`;
  const res = await fetchRetry(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`既存チェック失敗: HTTP ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.contents?.[0]?.id ?? null;
}

function buildBody(data) {
  return JSON.stringify({
    title: data.title,
    content: data.content,
    slug: data.slug,
    description: data.description,
    tags: data.tags,
  });
}

function logResult(entry) {
  const date = new Date().toISOString().slice(0, 10);
  const dir = join(ROOT, 'tmp');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const logPath = join(dir, `weekly-report-log-${date}.json`);
  appendFileSync(logPath, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

async function postArticle(filePath, dryRun) {
  const data = JSON.parse(readFileSync(filePath, 'utf-8'));
  if (!data.slug) throw new Error(`${filePath}: slug がありません`);

  const existingId = await findExistingId(data.slug);
  const action = existingId ? 'PATCH(更新)' : 'POST(新規)';
  console.log(`\n[${data.slug}] ${action}${existingId ? ` id=${existingId}` : ''}`);

  if (dryRun) {
    console.log('  --dry-run: 書き込みスキップ');
    logResult({ slug: data.slug, action: 'dry-run', existingId });
    return { status: 0, action, existingId, dryRun: true };
  }

  const body = buildBody(data);
  const res = existingId
    ? await fetchRetry(`${ENDPOINT}/${existingId}`, { method: 'PATCH', headers: HEADERS, body })
    : await fetchRetry(ENDPOINT, { method: 'POST', headers: HEADERS, body });

  const text = await res.text();
  const ok = res.status >= 200 && res.status < 300;
  console.log(`  Status: ${res.status} ${ok ? 'OK' : 'FAILED'}`);
  console.log(`  Response: ${text}`);

  let id = existingId;
  try { id = JSON.parse(text).id ?? existingId; } catch { /* PATCHは空bodyのことがある */ }

  logResult({ slug: data.slug, action: existingId ? 'patch' : 'post', status: res.status, ok, id });
  return { status: res.status, ok, action, id };
}

// ---- CLI ----
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const files = argv.filter((a) => a !== '--dry-run');

if (files.length === 0) {
  console.error('Usage: node scripts/post-weekly-report.mjs [--dry-run] <json-file> [...]');
  process.exit(1);
}

const results = [];
for (const f of files) {
  try {
    results.push(await postArticle(resolve(f), dryRun));
  } catch (e) {
    console.error(`  エラー: ${e.message}`);
    logResult({ file: f, error: e.message });
    results.push({ error: e.message, file: f });
  }
}

const failed = results.filter((r) => r.error || (r.ok === false)).length;
console.log(`\n=== 完了: ${results.length - failed}/${results.length} 成功 ===`);
process.exit(failed > 0 ? 1 : 0);
