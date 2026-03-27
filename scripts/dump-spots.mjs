/**
 * dump-spots.mjs
 *
 * スポットTSファイルからslug/lat/lng/spotType/catchableFishを抽出し、
 * パイプライン用のJSONダンプを生成する。
 *
 * TSファイルを正規表現でパースする（TSランタイム不要）。
 *
 * Usage: node scripts/dump-spots.mjs
 * Output: patent/data/spots-dump.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'src', 'lib', 'data');
const OUTPUT = path.join(__dirname, '..', 'patent', 'data', 'spots-dump.json');

function extractSpots() {
  const spotsDir = DATA_DIR;
  const files = fs.readdirSync(spotsDir).filter(f => f.startsWith('spots-') && f.endsWith('.ts'));

  const spots = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(spotsDir, file), 'utf-8');

    // スポットオブジェクトを正規表現で抽出
    // slug, latitude, longitude, spotType, catchableFish を取得
    const slugPattern = /slug:\s*["']([^"']+)["']/g;
    const latPattern = /latitude:\s*([\d.]+)/g;
    const lngPattern = /longitude:\s*([\d.]+)/g;
    const typePattern = /spotType:\s*["']([^"']+)["']/g;

    // 各スポットブロックを { で始まり次の id: まで取得
    // より正確にはオブジェクト単位で切り出す
    const spotBlocks = content.split(/\n\s*\{[^}]*?id:\s*["']/);

    let slugMatch;
    const slugs = [];
    while ((slugMatch = slugPattern.exec(content)) !== null) {
      slugs.push({ slug: slugMatch[1], index: slugMatch.index });
    }

    const lats = [];
    let latMatch;
    while ((latMatch = latPattern.exec(content)) !== null) {
      lats.push({ val: parseFloat(latMatch[1]), index: latMatch.index });
    }

    const lngs = [];
    let lngMatch;
    while ((lngMatch = lngPattern.exec(content)) !== null) {
      lngs.push({ val: parseFloat(lngMatch[1]), index: lngMatch.index });
    }

    const types = [];
    let typeMatch;
    while ((typeMatch = typePattern.exec(content)) !== null) {
      types.push({ val: typeMatch[1], index: typeMatch.index });
    }

    // catchableFish内の魚名を抽出（簡易）
    // fish: getFishBySlug("aji") のパターン、または name: "アジ" のパターン
    const fishBySlugPattern = /getFishBySlug\(["']([^"']+)["']\)/g;

    // slugの位置とlatitude/longitudeの位置でマッチング
    for (let i = 0; i < slugs.length; i++) {
      const s = slugs[i];
      const nextSlugIndex = i + 1 < slugs.length ? slugs[i + 1].index : content.length;

      // slug以降〜次のslugまでの範囲でlatitude/longitude/spotTypeを探す
      const lat = lats.find(l => l.index > s.index && l.index < nextSlugIndex);
      const lng = lngs.find(l => l.index > s.index && l.index < nextSlugIndex);
      const type = types.find(t => t.index > s.index && t.index < nextSlugIndex);

      if (!lat || !lng) continue;

      // catchableFish内の魚slugを抽出
      const spotBlock = content.substring(s.index, nextSlugIndex);
      const fishSlugs = [];
      let fishMatch;
      const localFishPattern = /getFishBySlug\(["']([^"']+)["']\)/g;
      while ((fishMatch = localFishPattern.exec(spotBlock)) !== null) {
        fishSlugs.push(fishMatch[1]);
      }

      // method情報を抽出
      const methodPattern = /method:\s*["']([^"']+)["']/g;
      const methods = [];
      let methodMatch;
      while ((methodMatch = methodPattern.exec(spotBlock)) !== null) {
        methods.push(methodMatch[1]);
      }

      spots.push({
        slug: s.slug,
        lat: lat.val,
        lng: lng.val,
        spotType: type?.val || 'port',
        catchableFish: fishSlugs,
        methods: [...new Set(methods)],
      });
    }
  }

  return spots;
}

const spots = extractSpots();
console.log(`Extracted ${spots.length} spots`);

// 重複排除
const seen = new Set();
const unique = spots.filter(s => {
  if (seen.has(s.slug)) return false;
  seen.add(s.slug);
  return true;
});
console.log(`Unique: ${unique.length} spots`);

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(unique, null, 2), 'utf-8');
console.log(`Written to ${OUTPUT}`);
