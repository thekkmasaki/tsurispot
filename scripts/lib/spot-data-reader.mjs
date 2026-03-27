/**
 * spot-data-reader.mjs
 * TSファイルからスポットデータを読み取るモジュール
 * fish("slug")パターンでcatchableFishを正確に抽出
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', '..', 'src', 'lib', 'data');

// ============================================================
// Fish slug → 日本語名マッピング（fish-sea.ts / fish-freshwater.ts / fish-brackish.ts から構築）
// ============================================================
let _fishNameMap = null;

function loadFishNameMap() {
  if (_fishNameMap) return _fishNameMap;

  _fishNameMap = new Map();
  const fishFiles = ['fish-sea.ts', 'fish-freshwater.ts', 'fish-brackish.ts'];

  for (const file of fishFiles) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf-8');
    // slug: "xxx" の直前にある name: "yyy" を対にして抽出
    const slugRegex = /slug:\s*"([^"]+)"/g;
    const nameRegex = /name:\s*"([^"]+)"/g;

    const slugs = [];
    const names = [];
    let m;
    while ((m = slugRegex.exec(content)) !== null) {
      slugs.push({ val: m[1], index: m.index });
    }
    while ((m = nameRegex.exec(content)) !== null) {
      names.push({ val: m[1], index: m.index });
    }

    // 各slugに対して、直前で最も近いnameを対応付け
    for (const s of slugs) {
      let closestName = null;
      let closestDist = Infinity;
      for (const n of names) {
        const dist = s.index - n.index;
        if (dist > 0 && dist < closestDist) {
          closestDist = dist;
          closestName = n.val;
        }
      }
      if (closestName) {
        _fishNameMap.set(s.val, closestName);
      }
    }
  }

  return _fishNameMap;
}

/**
 * fish slugを日本語名に変換
 * @param {string} slug - "aji", "saba" etc.
 * @returns {string} "アジ", "サバ" etc. (見つからない場合はslugそのまま)
 */
export function resolveFishName(slug) {
  const map = loadFishNameMap();
  return map.get(slug) || slug;
}

/**
 * spots-*.ts ファイル一覧を取得（外部依存なし）
 */
function getSpotFiles() {
  const files = fs.readdirSync(DATA_DIR);
  return files
    .filter(f => f.startsWith('spots-') && f.endsWith('.ts'))
    .map(f => path.join(DATA_DIR, f));
}

/**
 * TSファイル内容からスポットブロックを抽出
 * 各スポットは slug: "xxx" を持つオブジェクトリテラル
 * region内のslugは除外する（前80文字にareaNameがあればregionのslug）
 */
function extractSpotBlocks(content) {
  const spots = [];

  // slug: "xxx" の位置をすべて検出し、spotのslugだけをフィルタ
  const slugRegex = /slug:\s*"([^"]+)"/g;
  const spotSlugs = [];
  let m;
  while ((m = slugRegex.exec(content)) !== null) {
    // 前80文字を見てareaNameが含まれていたらregion内のslug → skip
    const before = content.slice(Math.max(0, m.index - 80), m.index);
    if (/areaName:/.test(before)) continue;
    spotSlugs.push({ slug: m[1], index: m.index });
  }

  for (let i = 0; i < spotSlugs.length; i++) {
    const start = spotSlugs[i].index;
    const end = i + 1 < spotSlugs.length ? spotSlugs[i + 1].index : content.length;
    const block = content.slice(start, end);
    spots.push({ slug: spotSlugs[i].slug, block });
  }

  return spots;
}

/**
 * スポットブロックからlatitude/longitudeを抽出
 */
function extractCoords(block) {
  const latMatch = block.match(/latitude:\s*([-\d.]+)/);
  const lngMatch = block.match(/longitude:\s*([-\d.]+)/);
  return {
    lat: latMatch ? parseFloat(latMatch[1]) : 0,
    lng: lngMatch ? parseFloat(lngMatch[1]) : 0,
  };
}

/**
 * スポットブロックからspotTypeを抽出
 */
function extractSpotType(block) {
  const match = block.match(/spotType:\s*"([^"]+)"/);
  return match ? match[1] : 'port';
}

/**
 * スポットブロックからboolean施設フラグを抽出
 */
function extractBooleanFlag(block, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*(true|false)`);
  const match = block.match(regex);
  return match ? match[1] === 'true' : false;
}

/**
 * catchableFish配列からfish("slug"), method, catchDifficulty, monthStart, monthEndを抽出
 */
function extractCatchableFish(block) {
  const result = [];

  // catchableFish: [ ... ] の範囲を特定
  const cfStart = block.indexOf('catchableFish:');
  if (cfStart === -1) return result;

  // catchableFish: の後の最初の [ から対応する ] までを切り出す
  const afterCf = block.slice(cfStart);
  const bracketStart = afterCf.indexOf('[');
  if (bracketStart === -1) return result;

  let depth = 0;
  let bracketEnd = -1;
  for (let i = bracketStart; i < afterCf.length; i++) {
    if (afterCf[i] === '[') depth++;
    else if (afterCf[i] === ']') {
      depth--;
      if (depth === 0) {
        bracketEnd = i;
        break;
      }
    }
  }

  if (bracketEnd === -1) return result;

  const cfContent = afterCf.slice(bracketStart, bracketEnd + 1);

  // 各 fish("xxx") エントリを抽出
  const fishEntryRegex = /fish\(\s*"([^"]+)"\s*\)/g;
  let fishMatch;
  while ((fishMatch = fishEntryRegex.exec(cfContent)) !== null) {
    const fishSlug = fishMatch[1];
    // このfishマッチの周辺（同じオブジェクトリテラル内）からmethod等を抽出
    // fish(...)の位置から前後の { } を探す
    const entryEnd = findClosingBrace(cfContent, fishMatch.index);
    const entryStart = findOpeningBrace(cfContent, fishMatch.index);

    if (entryStart !== -1 && entryEnd !== -1) {
      const entry = cfContent.slice(entryStart, entryEnd + 1);
      const method = extractStringField(entry, 'method');
      const difficulty = extractStringField(entry, 'catchDifficulty');
      const monthStart = extractNumberField(entry, 'monthStart');
      const monthEnd = extractNumberField(entry, 'monthEnd');

      result.push({
        name: fishSlug,
        method: method || '',
        difficulty: difficulty || 'medium',
        monthStart: monthStart || 1,
        monthEnd: monthEnd || 12,
      });
    }
  }

  return result;
}

/**
 * 指定位置から前方に遡って最も近い { を見つける
 */
function findOpeningBrace(text, pos) {
  for (let i = pos; i >= 0; i--) {
    if (text[i] === '{') return i;
  }
  return -1;
}

/**
 * 指定位置から後方に向かって対応する } を見つける
 * ネストは考慮しない（catchableFishエントリは1階層のオブジェクト）
 */
function findClosingBrace(text, pos) {
  for (let i = pos; i < text.length; i++) {
    if (text[i] === '}') return i;
  }
  return -1;
}

/**
 * オブジェクトリテラル文字列からstring型フィールドを抽出
 */
function extractStringField(entry, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*"([^"]+)"`);
  const match = entry.match(regex);
  return match ? match[1] : null;
}

/**
 * オブジェクトリテラル文字列からnumber型フィールドを抽出
 */
function extractNumberField(entry, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*(\\d+)`);
  const match = entry.match(regex);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * 1つのTSファイルを解析してスポット配列を返す
 */
function parseSpotFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const blocks = extractSpotBlocks(content);

  return blocks.map(({ slug, block }) => {
    const { lat, lng } = extractCoords(block);
    return {
      slug,
      lat,
      lng,
      spotType: extractSpotType(block),
      catchableFish: extractCatchableFish(block),
      hasParking: extractBooleanFlag(block, 'hasParking'),
      hasToilet: extractBooleanFlag(block, 'hasToilet'),
      hasFishingShop: extractBooleanFlag(block, 'hasFishingShop'),
      hasConvenienceStore: extractBooleanFlag(block, 'hasConvenienceStore'),
      hasRentalRod: extractBooleanFlag(block, 'hasRentalRod'),
    };
  });
}

// ============================================================
// キャッシュ（全ファイル解析は重いので一度だけ実行）
// ============================================================
let _cache = null;

function loadAll() {
  if (_cache) return _cache;

  const files = getSpotFiles();
  const allSpots = new Map();

  for (const file of files) {
    const spots = parseSpotFile(file);
    for (const spot of spots) {
      // 重複slugは後勝ち（上書き）
      allSpots.set(spot.slug, spot);
    }
  }

  _cache = allSpots;
  return _cache;
}

// ============================================================
// Public API
// ============================================================

/**
 * 単一スポットのデータを返す
 * @param {string} slug
 * @returns {object|null}
 */
export function readSpotData(slug) {
  const all = loadAll();
  return all.get(slug) || null;
}

/**
 * 全スポットのデータを返す
 * @returns {Map<string, object>}
 */
export function readAllSpots() {
  return loadAll();
}

/**
 * キャッシュをクリア（テスト用）
 */
export function clearCache() {
  _cache = null;
}
