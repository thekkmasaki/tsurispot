#!/usr/bin/env node
/**
 * データ要約ユーティリティ
 *
 * TypeScriptのスポット・魚データをテキスト解析し、JSON要約キャッシュを生成する。
 * .mjs から .ts ファイルを直接 import できないため、正規表現でフィールドを抽出する。
 *
 * 使い方:
 *   import { getFishSummary, getSpotSummary, ensureCache } from "./lib/export-data.mjs";
 *   const fish = await getFishSummary();    // 魚種サマリ配列
 *   const spots = await getSpotSummary();   // スポットサマリ配列
 *   await ensureCache();                    // キャッシュ再生成（存在しない場合のみ）
 *
 *   node scripts/twitter/lib/export-data.mjs          # 直接実行でキャッシュ生成
 *   node scripts/twitter/lib/export-data.mjs --force   # 強制再生成
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** プロジェクトルート */
const ROOT = join(__dirname, "../../..");
/** キャッシュディレクトリ */
const CACHE_DIR = join(__dirname, "..", ".cache");
/** 魚種キャッシュパス */
const FISH_CACHE = join(CACHE_DIR, "fish-summary.json");
/** スポットキャッシュパス */
const SPOT_CACHE = join(CACHE_DIR, "spot-summary.json");
/** 魚種データディレクトリ */
const DATA_DIR = join(ROOT, "src", "lib", "data");

// ─── 魚種データ解析 ───

/**
 * 魚種TSファイルからslug・name・seasonMonths・peakMonthsを正規表現で抽出する
 * @param {string} filePath - fish-sea.ts / fish-freshwater.ts / fish-brackish.ts のパス
 * @returns {{ slug: string, name: string, peakMonths: number[], seasonMonths: number[] }[]}
 */
function parseFishFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const results = [];

  // 各オブジェクトブロックを { ... } 単位で分割
  // fishSpecies配列内の各要素を正規表現でマッチ
  const slugRe = /slug:\s*["']([^"']+)["']/g;
  const nameRe = /^\s*name:\s*["']([^"']+)["']/gm;
  const seasonRe = /seasonMonths:\s*\[([^\]]*)\]/g;
  const peakRe = /peakMonths:\s*\[([^\]]*)\]/g;

  const slugs = [...content.matchAll(slugRe)].map((m) => m[1]);
  const names = [...content.matchAll(nameRe)].map((m) => m[1]);
  const seasons = [...content.matchAll(seasonRe)].map((m) =>
    m[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
  );
  const peaks = [...content.matchAll(peakRe)].map((m) =>
    m[1]
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n))
  );

  // 最小の配列長に合わせてペアリング
  const len = Math.min(slugs.length, names.length, seasons.length, peaks.length);
  for (let i = 0; i < len; i++) {
    results.push({
      slug: slugs[i],
      name: names[i],
      seasonMonths: seasons[i],
      peakMonths: peaks[i],
    });
  }

  return results;
}

/**
 * 全魚種データを解析してサマリ配列を返す
 * @returns {{ slug: string, name: string, peakMonths: number[], seasonMonths: number[] }[]}
 */
function buildFishSummary() {
  // fish-sea.ts は集約ファイル(import + spread)で inline 定義が無く0種になる。
  // 海水魚は5つのサブファイルを直接解析する（旧実装は海水魚が全欠落し31種のみだった）。
  const fishFiles = [
    "fish-sea-popular.ts",
    "fish-sea-kaiyuu.ts",
    "fish-sea-tai-suzuki.ts",
    "fish-sea-root-hata.ts",
    "fish-sea-ika-tako.ts",
    "fish-freshwater.ts",
    "fish-brackish.ts",
  ];
  const all = [];

  for (const file of fishFiles) {
    const filePath = join(DATA_DIR, file);
    if (!existsSync(filePath)) {
      console.warn(`[export-data] 魚種ファイルが見つかりません: ${file}`);
      continue;
    }
    const parsed = parseFishFile(filePath);
    all.push(...parsed);
    console.log(`[export-data] ${file}: ${parsed.length}種を解析`);
  }

  // slug重複排除
  const seen = new Set();
  const unique = all.filter((f) => {
    if (seen.has(f.slug)) return false;
    seen.add(f.slug);
    return true;
  });

  console.log(`[export-data] 魚種合計: ${unique.length}種`);
  return unique;
}

// ─── スポットデータ解析 ───

/**
 * スポットTSファイルからname・slug・region・spotType・catchableFish(slugのみ)を抽出する
 * @param {string} filePath - spots-*.ts のパス
 * @returns {{ slug: string, name: string, region: string, spotType: string, fishSlugs: string[] }[]}
 */
function parseSpotFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const results = [];

  // id: "..." パターンでブロックを分割する
  // 各スポットは id: "sXXX" を持つ。id の出現位置で分割してブロック化する。
  const idPattern = /^\s*id:\s*["'][^"']+["']/gm;
  const idMatches = [...content.matchAll(idPattern)];

  if (idMatches.length === 0) return results;

  // 各idの出現位置から次のidの出現位置（または末尾）までをブロックとして切り出す
  const spotBlocks = [];
  for (let i = 0; i < idMatches.length; i++) {
    const start = idMatches[i].index;
    const end = i + 1 < idMatches.length ? idMatches[i + 1].index : content.length;
    spotBlocks.push(content.slice(start, end));
  }

  for (const block of spotBlocks) {
    // slug（行頭にあるとは限らない。同じ行に id, name, slug が並ぶケースあり）
    const slugMatch = block.match(/slug:\s*["']([^"']+)["']/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];

    // name（同上）
    const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
    const name = nameMatch ? nameMatch[1] : slug;

    // spotType
    const typeMatch = block.match(/spotType:\s*["']([^"']+)["']/);
    const spotType = typeMatch ? typeMatch[1] : "unknown";

    // region - regionやlocalRegion, lr 呼び出しの引数からIDを取得
    // region: region("r10") または region: lr("r450") または region: localRegion("r138") 等
    const regionMatch = block.match(/region:\s*(?:region|lr|localRegion)\(["']([^"']+)["']\)/);
    const regionId = regionMatch ? regionMatch[1] : "";

    // catchableFish - fish("slug") のパターンからslugを抽出
    const fishSlugs = [];
    const fishCallRe = /fish\(["']([^"']+)["']\)/g;
    let fishMatch;
    while ((fishMatch = fishCallRe.exec(block)) !== null) {
      if (!fishSlugs.includes(fishMatch[1])) {
        fishSlugs.push(fishMatch[1]);
      }
    }

    results.push({
      slug,
      name,
      region: regionId,
      spotType,
      fishSlugs,
    });
  }

  return results;
}

/**
 * 全 spots-*.ts を処理してサマリ配列を返す。
 * 以前は先頭20ファイル(アルファベット順)のみ処理し、北海道/九州など後方の地域が
 * 週末スポット候補から漏れる地理バイアスがあった。合計~18MBの正規表現解析だが
 * キャッシュされるため実行毎の負荷は限定的。
 * @returns {{ slug: string, name: string, region: string, spotType: string, fishSlugs: string[] }[]}
 */
function buildSpotSummary() {
  // spots-*.ts ファイルを列挙（ただし spots.ts 本体は除外）
  const targetFiles = readdirSync(DATA_DIR)
    .filter((f) => f.startsWith("spots-") && f.endsWith(".ts"))
    .sort();

  console.log(`[export-data] スポットファイル: ${targetFiles.length}件を処理`);

  const all = [];
  for (const file of targetFiles) {
    const filePath = join(DATA_DIR, file);
    try {
      const parsed = parseSpotFile(filePath);
      all.push(...parsed);
      console.log(`[export-data] ${file}: ${parsed.length}スポットを解析`);
    } catch (err) {
      console.warn(`[export-data] ${file} の解析に失敗: ${err.message}`);
    }
  }

  // slug重複排除
  const seen = new Set();
  const unique = all.filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });

  console.log(`[export-data] スポット合計: ${unique.length}件`);
  return unique;
}

// ─── キャッシュ管理 ───

/**
 * キャッシュディレクトリを作成する
 */
function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
    console.log(`[export-data] キャッシュディレクトリ作成: ${CACHE_DIR}`);
  }
}

/**
 * 魚種サマリを取得する（キャッシュがあればそれを返す）
 * @returns {Promise<{ slug: string, name: string, peakMonths: number[], seasonMonths: number[] }[]>}
 */
export async function getFishSummary() {
  if (existsSync(FISH_CACHE)) {
    try {
      return JSON.parse(readFileSync(FISH_CACHE, "utf-8"));
    } catch {
      console.warn("[export-data] 魚種キャッシュの読み込みに失敗。再生成します。");
    }
  }
  // キャッシュがない or 壊れている場合は再生成
  ensureCacheDir();
  const summary = buildFishSummary();
  writeFileSync(FISH_CACHE, JSON.stringify(summary, null, 2), "utf-8");
  return summary;
}

/**
 * スポットサマリを取得する（キャッシュがあればそれを返す）
 * @returns {Promise<{ slug: string, name: string, region: string, spotType: string, fishSlugs: string[] }[]>}
 */
export async function getSpotSummary() {
  if (existsSync(SPOT_CACHE)) {
    try {
      return JSON.parse(readFileSync(SPOT_CACHE, "utf-8"));
    } catch {
      console.warn("[export-data] スポットキャッシュの読み込みに失敗。再生成します。");
    }
  }
  ensureCacheDir();
  const summary = buildSpotSummary();
  writeFileSync(SPOT_CACHE, JSON.stringify(summary, null, 2), "utf-8");
  return summary;
}

/**
 * キャッシュが存在しない場合に再生成する
 * --force フラグで強制再生成
 * @param {boolean} [force=false] - 強制再生成するかどうか
 */
export async function ensureCache(force = false) {
  ensureCacheDir();

  if (force || !existsSync(FISH_CACHE)) {
    console.log("[export-data] 魚種キャッシュを生成中...");
    const fishSummary = buildFishSummary();
    writeFileSync(FISH_CACHE, JSON.stringify(fishSummary, null, 2), "utf-8");
    console.log(`[export-data] 魚種キャッシュ保存: ${FISH_CACHE}`);
  } else {
    console.log("[export-data] 魚種キャッシュは最新です");
  }

  if (force || !existsSync(SPOT_CACHE)) {
    console.log("[export-data] スポットキャッシュを生成中...");
    const spotSummary = buildSpotSummary();
    writeFileSync(SPOT_CACHE, JSON.stringify(spotSummary, null, 2), "utf-8");
    console.log(`[export-data] スポットキャッシュ保存: ${SPOT_CACHE}`);
  } else {
    console.log("[export-data] スポットキャッシュは最新です");
  }
}

// ─── 直接実行時 ───

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("export-data.mjs") ||
    process.argv[1].includes("export-data"));

if (isDirectRun) {
  const force = process.argv.includes("--force");
  console.log("=== データ要約キャッシュ生成 ===\n");
  await ensureCache(force);
  console.log("\n完了!");
}
