#!/usr/bin/env node
/**
 * dedup 勝者特定ツール
 *
 * spots.ts の deduplicateSpots() 適用後の実行時データで、
 * 指定キーワードに該当するスポットが「勝者（公開中）」か「敗者（リダイレクト）」かを判定する。
 *
 * 同一地物が複数ファイルに重複登録されている場合、deduplicateSpots() は
 * catchableFish の多い方を勝者にするため、ファイル内のエントリ数＝公開ページ数ではない。
 * 敗者エントリを修正しても本番ページは変わらないので、
 * 規制是正・データ修正の前に必ずこれで勝者を特定すること。
 *
 * 使い方:
 *   node scripts/dedup-winner.mjs 日立港 門川 名蔵   キーワードで勝者/敗者を判定
 *   node scripts/dedup-winner.mjs --batch            spots-rules-batch.ts の棚卸し
 *     （batch は dedup 後に適用されるため、敗者slugのエントリは死んでいる。
 *       どのルールが実際に本番へ効いているかを県つきで一覧する）
 *   node scripts/dedup-winner.mjs --region-mismatch  address と region.prefecture の不一致を全件列挙
 *     （県のまき餌規制はスポットの所在県で決まるため、ここがズレると誤ったルールを表示する）
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..');

async function loadRuntimeData() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tsurispot-dedup-'));
  const outfile = path.join(tmpDir, 'bundle.mjs');
  try {
    await build({
      stdin: {
        contents: `
          export { fishingSpots, dedupRedirects } from './src/lib/data/spots';
          export { allRawSpots } from './src/lib/data/spots-registry';
          export { spotRulesBatch } from './src/lib/data/spots-rules-batch';
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

const keywords = process.argv.slice(2);
if (!keywords.length) {
  console.error('使い方: node scripts/dedup-winner.mjs <キーワード...>');
  process.exit(1);
}

const { fishingSpots, dedupRedirects, allRawSpots, spotRulesBatch } = await loadRuntimeData();
// slug は完全重複しているケースがあるため（例: hitachi-port が s253/s830 の2エントリ）、
// 勝者判定は必ず id で行う。slug で判定すると敗者まで勝者に見える。
const liveById = new Map(fishingSpots.map((s) => [s.id, s]));

console.log(
  `実行時スポット数: ${fishingSpots.length} / 生データ: ${allRawSpots.length} / dedupRedirects: ${dedupRedirects.size}`
);

// ── batch 棚卸しモード ──────────────────────────────
if (keywords[0] === '--batch') {
  const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));
  const entries = Object.entries(spotRulesBatch);
  console.log(`\nspots-rules-batch.ts のエントリ: ${entries.length}件\n`);
  const rows = [];
  for (const [slug, rules] of entries) {
    const live = bySlug.get(slug);
    // batch は applyBatchRules() で「rules 未設定のスポットにのみ」注入される
    const effective = Boolean(live) && live.rules === rules;
    rows.push({
      slug,
      pref: live ? live.region.prefecture : '—',
      name: live ? live.name : '(dedupで消滅 or 不在)',
      status: !live ? 'DEAD' : effective ? 'EFFECTIVE' : 'OVERRIDDEN',
      chum: rules.chumAllowed,
      casting: rules.castingAllowed,
      lure: rules.lureAllowed,
      night: rules.nightFishing,
    });
  }
  const dead = rows.filter((r) => r.status === 'DEAD');
  const eff = rows.filter((r) => r.status === 'EFFECTIVE');
  console.log(`EFFECTIVE(本番に効いている): ${eff.length} / DEAD(slugが存在しない): ${dead.length} / OVERRIDDEN: ${rows.length - eff.length - dead.length}\n`);
  console.log('--- EFFECTIVE かつ chumAllowed:true（まき餌規制県なら是正対象）---');
  for (const r of eff.filter((x) => x.chum).sort((a, b) => a.pref.localeCompare(b.pref))) {
    console.log(`  ${r.pref.padEnd(5)} ${r.slug.padEnd(38)} casting=${r.casting} lure=${r.lure} night=${r.night}  ${r.name}`);
  }
  console.log('\n--- DEAD（slugが存在せず、修正しても無意味）---');
  for (const r of dead) console.log(`  ${r.slug}  chum=${r.chum}`);
  process.exit(0);
}

// ── address と region.prefecture の不一致を列挙 ──────────
if (keywords[0] === '--region-mismatch') {
  const PREFECTURES = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
  ];
  const rows = [];
  for (const spot of fishingSpots) {
    const fromAddress = PREFECTURES.find((p) => spot.address.includes(p));
    if (!fromAddress || fromAddress === spot.region.prefecture) continue;
    rows.push({ slug: spot.slug, name: spot.name, addr: spot.address, region: spot.region.prefecture });
  }
  console.log(`\naddress と region.prefecture の不一致: ${rows.length}件\n`);
  for (const r of rows.sort((a, b) => a.slug.localeCompare(b.slug))) {
    console.log(`${r.slug}（${r.name}）\n    address="${r.addr}" / region="${r.region}"`);
  }
  console.log('\n--- テスト用 slug 一覧 ---');
  console.log(rows.map((r) => `"${r.slug}"`).sort().join(', '));
  process.exit(0);
}

for (const kw of keywords) {
  const hits = allRawSpots.filter(
    (s) => s.name.includes(kw) || s.id === kw || s.slug.includes(kw) || (s.address || '').includes(kw)
  );
  console.log(`\n${'='.repeat(70)}`);
  console.log(`【${kw}】生データ ${hits.length}件`);
  console.log('='.repeat(70));
  for (const s of hits) {
    const live = liveById.get(s.id);
    const isWinner = Boolean(live);
    const redirectTo = dedupRedirects.get(s.slug);
    // slug が生きていても id が違えば「同一slugの別エントリが勝った」ケース
    const slugWinner = fishingSpots.find((x) => x.slug === s.slug);
    const mark = isWinner
      ? '★勝者(公開中)'
      : `  敗者 → ${redirectTo || (slugWinner ? `同slug別エントリ id=${slugWinner.id}` : '(不明)')}`;
    console.log(
      `${mark}\n    id=${s.id} slug=${s.slug}\n    name=${s.name} / 魚種${s.catchableFish.length}件 / ${s.latitude},${s.longitude}\n    addr=${s.address}\n    rules=${s.rules ? JSON.stringify(s.rules).slice(0, 120) : 'なし'}`
    );
    if (live) {
      const methods = [...new Set(live.catchableFish.map((c) => c.method).filter(Boolean))];
      console.log(`    [実行時] method: ${methods.join(', ') || 'なし'}`);
      console.log(`    [実行時] desc(${live.description.length}字): ${live.description.slice(0, 110)}...`);
    }
  }
}
