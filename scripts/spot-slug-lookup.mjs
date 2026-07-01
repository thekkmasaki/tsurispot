/**
 * spot-slug-lookup.mjs
 *
 * スポットTSファイル（src/lib/data/spots-*.ts）から name(日本語) と slug を抽出し、
 * スポット名 → slug の解決を行う。週報スキルの内部リンク自動化で使う
 * （手動 grep を廃し、表記ゆれを吸収したうえで /spots/{slug} リンクを生成するため）。
 *
 * TSファイルを正規表現でパースする（TSランタイム不要）。dump-spots.mjs と同方式。
 *
 * 使い方:
 *   node scripts/spot-slug-lookup.mjs "須磨海づり公園"   → 候補を最大5件、スコア順で表示
 *   node scripts/spot-slug-lookup.mjs "明石港" "神戸港"   → 複数まとめて解決
 *   node scripts/spot-slug-lookup.mjs --json             → 全 {name, slug} マップをJSON出力
 *   node scripts/spot-slug-lookup.mjs --json "明石"       → 一致候補のみJSON出力
 *
 * 出力(通常): 各クエリごとに `query\tslug\tname` をタブ区切りで1行ずつ。
 *             一致なしは `query\t(no match)`。スクリプト/エージェントがパースしやすい形。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'lib', 'data');

/** spots-*.ts 全ファイルから {name, slug} を抽出（オブジェクト単位でブロック分割） */
function extractSpots() {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.startsWith('spots-') && f.endsWith('.ts'));

  const spots = [];
  const seen = new Set();

  for (const file of files) {
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');

    // slug の位置を全て拾い、各 slug の周辺ブロック（前後）から最も近い name を対応づける。
    // FishingSpot は id/name/slug の順で定義されるのが通例なので、slug の「手前」で
    // 一番近い name を採用する（次スポットの name を誤って拾わないため後方は見ない）。
    const slugPattern = /slug:\s*["']([^"']+)["']/g;
    const namePattern = /name:\s*["']([^"']+)["']/g;

    const names = [];
    let m;
    while ((m = namePattern.exec(content)) !== null) {
      names.push({ val: m[1], index: m.index });
    }

    let sm;
    while ((sm = slugPattern.exec(content)) !== null) {
      const slug = sm[1];
      if (seen.has(slug)) continue;
      // slug より手前で最も近い name を探す
      let best = null;
      for (const n of names) {
        if (n.index < sm.index) {
          if (!best || n.index > best.index) best = n;
        } else {
          break;
        }
      }
      if (!best) continue;
      seen.add(slug);
      spots.push({ name: best.val, slug, file });
    }
  }

  return spots;
}

/** 表記ゆれ吸収のための正規化: 空白除去・全半角・記号・よくある表記差を寄せる */
function normalize(s) {
  return s
    .normalize('NFKC')
    .replace(/[\s　]/g, '')
    .replace(/[（）()「」【】・,、.。]/g, '')
    .replace(/漁港|港$/g, '港') // 「◯◯漁港」と「◯◯港」を寄せる
    .replace(/海釣り公園|海づり公園|フィッシングパーク/g, '海釣り公園')
    .toLowerCase();
}

/** クエリに対する候補をスコア順で返す */
function lookup(query, spots) {
  const nq = normalize(query);
  if (!nq) return [];

  // 誤リンクは記事品質を下げるため、確実なマッチ（完全一致 or どちらかがもう一方を包含）
  // のみ採用する。曖昧な部分一致は false positive を生むので使わない。
  // クエリが短すぎる（2文字未満）と包含マッチが暴発するため足切りする。
  if (nq.length < 2) return [];

  const scored = spots
    .map((sp) => {
      const nn = normalize(sp.name);
      let score = 0;
      if (nn === nq) score = 100; // 完全一致
      else if (nn.includes(nq)) score = 80 - (nn.length - nq.length); // クエリがスポット名に含まれる
      else if (nq.includes(nn) && nn.length >= 3) score = 60 - (nq.length - nn.length); // スポット名(3文字以上)がクエリに含まれる
      return { ...sp, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored;
}

// ---- CLI ----
const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const queries = args.filter((a) => a !== '--json');

const spots = extractSpots();

if (jsonMode) {
  if (queries.length === 0) {
    // 全マップ
    process.stdout.write(
      JSON.stringify(
        spots.map(({ name, slug }) => ({ name, slug })),
        null,
        2
      ) + '\n'
    );
  } else {
    const out = {};
    for (const q of queries) {
      out[q] = lookup(q, spots)
        .slice(0, 5)
        .map(({ name, slug, score }) => ({ name, slug, score }));
    }
    process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  }
  process.exit(0);
}

if (queries.length === 0) {
  console.error(
    'Usage: node scripts/spot-slug-lookup.mjs "スポット名" [...]\n' +
      '       node scripts/spot-slug-lookup.mjs --json [クエリ...]'
  );
  console.error(`(読み込んだスポット数: ${spots.length})`);
  process.exit(1);
}

for (const q of queries) {
  const hits = lookup(q, spots).slice(0, 5);
  if (hits.length === 0) {
    console.log(`${q}\t(no match)`);
    continue;
  }
  // 先頭は最有力候補。残りは参考として表示。
  hits.forEach((h, i) => {
    const tag = i === 0 ? '' : '  (候補)';
    console.log(`${q}\t${h.slug}\t${h.name}${tag}`);
  });
}
