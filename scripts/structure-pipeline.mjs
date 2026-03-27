#!/usr/bin/env node
/**
 * structure-pipeline.mjs
 *
 * 衛星画像解析パイプラインのメインスクリプト。
 * 特許（特願2026-042836）の核心: 衛星画像→構造物検出→魚種推定→JSON出力
 *
 * Usage:
 *   node scripts/structure-pipeline.mjs                              # 全スポット
 *   node scripts/structure-pipeline.mjs --slug=hiraiso-fishing-park  # 単一
 *   node scripts/structure-pipeline.mjs --type=port                  # タイプ別
 *   node scripts/structure-pipeline.mjs --skip-existing              # 既存スキップ
 *   node scripts/structure-pipeline.mjs --dry-run                    # 画像URL確認のみ
 *   node scripts/structure-pipeline.mjs --limit=50                   # 件数制限
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchWithCache, fetchBandPixels } from './lib/sentinel-fetcher.mjs';
import { analyzeImage } from './lib/image-analyzer.mjs';
import { queryWithCache } from './lib/overpass-client.mjs';
import { analyzeOsmData } from './lib/osm-structure-analyzer.mjs';
import { mergeEndpoints } from './lib/endpoint-merger.mjs';
import { generateZones } from './lib/zone-generator.mjs';
import { estimateFish } from './lib/fish-estimator.mjs';
import { resolveSeaLabel } from './lib/sea-label-resolver.mjs';
import { generateFallback } from './lib/fallback-generator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const SPOTS_DUMP = path.join(PROJECT_ROOT, 'patent', 'data', 'spots-dump.json');
const STRUCTURES_DIR = path.join(PROJECT_ROOT, 'patent', 'data', 'structures');
const PROGRESS_FILE = path.join(PROJECT_ROOT, 'patent', 'data', 'progress.json');

// 魚slugから日本語名への変換テーブル
const FISH_SLUG_TO_NAME = {
  aji: 'アジ', saba: 'サバ', iwashi: 'イワシ', suzuki: 'スズキ',
  kurodai: 'クロダイ', mebaru: 'メバル', kasago: 'カサゴ', ainame: 'アイナメ',
  soi: 'ソイ', mejina: 'メジナ', akou: 'アコウ', ishidai: 'イシダイ',
  karei: 'カレイ', kisu: 'キス', hirame: 'ヒラメ', tai: 'マダイ', madai: 'マダイ',
  hamachi: 'ハマチ', buri: 'ブリ', sayori: 'サヨリ', aoriika: 'アオリイカ',
  tachiuo: 'タチウオ', haze: 'ハゼ', kawahagi: 'カワハギ', umitanago: 'ウミタナゴ',
  shirogisu: 'シロギス', chinu: 'チヌ', gure: 'グレ', aigo: 'アイゴ',
  managatsuo: 'マナガツオ', sanma: 'サンマ', ika: 'イカ', tako: 'タコ',
  sawara: 'サワラ', seigo: 'セイゴ', fukko: 'フッコ', konosiro: 'コノシロ',
  konoshiro: 'コノシロ', kamasu: 'カマス', bora: 'ボラ', mejimaguro: 'メジマグロ',
  hiramasa: 'ヒラマサ', mejiro: 'メジロ', maruaji: 'マルアジ',
  shimaaji: 'シマアジ', isaki: 'イサキ', marusouda: 'マルソウダ',
  katsuo: 'カツオ', kagokakidai: 'カゴカキダイ',
};

function convertCatchableFish(slugs, methods) {
  return slugs.map((slug, i) => ({
    name: FISH_SLUG_TO_NAME[slug] || slug,
    method: methods?.[i] || '',
    season: '通年',
    difficulty: 'medium',
  }));
}

// ---------------------------------------------------------------------------
// CLI引数パース
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    slug: null,
    type: null,
    skipExisting: false,
    dryRun: false,
    limit: 0,
  };

  for (const arg of args) {
    if (arg.startsWith('--slug=')) opts.slug = arg.split('=')[1];
    else if (arg.startsWith('--type=')) opts.type = arg.split('=')[1];
    else if (arg === '--skip-existing') opts.skipExisting = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg.startsWith('--limit=')) opts.limit = parseInt(arg.split('=')[1], 10);
  }

  return opts;
}

// ---------------------------------------------------------------------------
// 進捗管理
// ---------------------------------------------------------------------------

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  } catch {
    return { completed: [], failed: [], lastUpdated: null };
  }
}

function saveProgress(progress) {
  progress.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// 構造物ラベル生成
// ---------------------------------------------------------------------------

function resolveStructureLabel(layoutType, spotType) {
  const labels = {
    seawall: '護岸',
    pier: '桟橋',
    port: '港湾',
    beach: '砂浜',
  };
  return labels[layoutType] || labels[spotType] || '護岸';
}

// ---------------------------------------------------------------------------
// DetectedStructure配列を正式フォーマットに変換
// ---------------------------------------------------------------------------

function buildDetectedStructures(mergedResult, imageSize) {
  const structures = mergedResult.detectedStructures || [];
  return structures.map((ds, i) => ({
    id: `str-${String(i + 1).padStart(3, '0')}`,
    category: ds.type,
    confidence: ds.confidence || mergedResult.confidence,
    bbox: {
      x: Math.round(ds.relativePosition * imageSize.width * 0.8),
      y: Math.round(imageSize.height * 0.4),
      width: Math.round(imageSize.width * 0.15),
      height: Math.round(imageSize.height * 0.05),
    },
    areaRatio: 0.05,
    relativePosition: ds.relativePosition,
    distanceFromShore: 'onshore',
  }));
}

// ---------------------------------------------------------------------------
// SeaBottomFeature配列を生成
// ---------------------------------------------------------------------------

function buildSeaBottomFeatures(zones) {
  const features = [];
  for (const zone of zones) {
    for (const feat of zone.seaBottomFeatures) {
      features.push({
        type: feat,
        xRange: zone.xRange,
        distanceFromShore: 'medium',
        estimatedDepth: zone.estimatedDepth?.offshore || 6,
        confidence: 0.5,
      });
    }
  }
  return features;
}

// ---------------------------------------------------------------------------
// 1スポット処理
// ---------------------------------------------------------------------------

async function processSpot(spot, dryRun) {
  const { slug, lat, lng, spotType, catchableFish: rawFish, methods } = spot;
  const catchableFish = convertCatchableFish(rawFish || [], methods || []);

  console.log(`\n--- Processing: ${slug} (${spotType}) [${lat}, ${lng}] ---`);

  // Step 1: Sentinel-2 STAC検索
  let sentinelResult = null;
  try {
    const stacResult = await searchWithCache(slug, lat, lng);
    if (stacResult) {
      console.log(`  STAC: Found tile ${stacResult.item?.id || 'cached'}`);

      if (dryRun) {
        console.log(`  [DRY-RUN] Band URLs:`, Object.values(stacResult.bandUrls).map(u => u.substring(0, 80) + '...'));
        return { slug, status: 'dry-run', stacFound: true };
      }

      // Step 2: COG部分取得 + 画像解析
      try {
        const pixelData = await fetchBandPixels(stacResult.bandUrls, lat, lng, 500);
        console.log(`  COG: ${pixelData.width}x${pixelData.height} pixels`);

        sentinelResult = analyzeImage(
          pixelData.bands,
          pixelData.width,
          pixelData.height,
          pixelData.pixelToCoord
        );
        console.log(`  Image: coastline=${sentinelResult.coastlinePixels.length}px, dominant=${sentinelResult.dominantStructure}, confidence=${sentinelResult.confidence.toFixed(2)}`);
      } catch (err) {
        console.warn(`  COG/Analyze error: ${err.message}`);
      }
    } else {
      console.log(`  STAC: No tile found`);
    }
  } catch (err) {
    console.warn(`  STAC error: ${err.message}`);
  }

  if (dryRun) {
    return { slug, status: 'dry-run', stacFound: false };
  }

  // Step 3: OSMデータ取得+解析
  let osmResult = null;
  try {
    const osmData = await queryWithCache(slug, lat, lng, 500, spotType);
    if (osmData) {
      osmResult = analyzeOsmData(osmData, lat, lng, spotType);
      if (osmResult) {
        console.log(`  OSM: Way#${osmResult.wayId}, length=${osmResult.structureLength}m, layout=${osmResult.layoutType}`);
      } else {
        console.log(`  OSM: No matching way found`);
      }
    } else {
      console.log(`  OSM: Query failed`);
    }
  } catch (err) {
    console.warn(`  OSM error: ${err.message}`);
  }

  // Step 4: 統合
  const merged = mergeEndpoints(sentinelResult, osmResult, spotType);

  if (!merged) {
    // Step: フォールバック
    console.log(`  Fallback: No sentinel or OSM data, generating synthetic`);
    const fallback = generateFallback(slug, lat, lng, spotType, catchableFish);
    return { slug, status: 'fallback', data: fallback };
  }

  console.log(`  Merged: source=${merged.source}, length=${Math.round(merged.structureLength)}m, confidence=${merged.confidence.toFixed(2)}`);

  // Step 5: ゾーン生成
  const zones = generateZones(merged.structureLength, merged.layoutType, merged);

  // Step 6: 魚種推定
  const zonesWithFish = estimateFish(zones, catchableFish, spotType);

  // Step 7: JSON組み立て
  const imageSize = { width: 640, height: 640 };
  const seaLabel = resolveSeaLabel(lat, lng);

  const result = {
    spotSlug: slug,
    coordinates: { lat, lng },
    imageMetadata: {
      source: 'sentinel-2',
      date: new Date().toISOString().split('T')[0],
      resolution: 10,
      imageSize,
    },
    layoutType: merged.layoutType,
    structureEndpoints: merged.endpoints,
    structureLabel: resolveStructureLabel(merged.layoutType, spotType),
    seaLabel,
    detectedStructures: buildDetectedStructures(merged, imageSize),
    seaBottomFeatures: buildSeaBottomFeatures(zonesWithFish),
    zones: zonesWithFish,
    facilities: [],
    structureLength: Math.round(merged.structureLength),
    positionCount: Math.max(3, Math.round(merged.structureLength / 50)),
    analyzedAt: new Date().toISOString(),
    pipelineVersion: '1.0.0',
  };

  return { slug, status: 'success', data: result, source: merged.source };
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();

  console.log('=== 衛星画像解析パイプライン v1.0.0 ===');
  console.log(`Options:`, opts);

  // スポットデータ読み込み
  if (!fs.existsSync(SPOTS_DUMP)) {
    console.error(`Spots dump not found. Run: node scripts/dump-spots.mjs`);
    process.exit(1);
  }

  let spots = JSON.parse(fs.readFileSync(SPOTS_DUMP, 'utf-8'));
  console.log(`Loaded ${spots.length} spots`);

  // フィルタ
  if (opts.slug) {
    spots = spots.filter(s => s.slug === opts.slug);
  }
  if (opts.type) {
    spots = spots.filter(s => s.spotType === opts.type);
  }
  if (opts.skipExisting) {
    const existing = new Set(
      fs.existsSync(STRUCTURES_DIR)
        ? fs.readdirSync(STRUCTURES_DIR).map(f => f.replace('.json', ''))
        : []
    );
    spots = spots.filter(s => !existing.has(s.slug));
  }
  if (opts.limit > 0) {
    spots = spots.slice(0, opts.limit);
  }

  console.log(`Processing ${spots.length} spots`);

  // 進捗
  const progress = loadProgress();
  fs.mkdirSync(STRUCTURES_DIR, { recursive: true });

  // 統計
  const stats = { success: 0, fallback: 0, error: 0, dryRun: 0, skipped: 0 };
  const sources = { 'sentinel+osm': 0, sentinel: 0, osm: 0, fallback: 0 };

  for (let i = 0; i < spots.length; i++) {
    const spot = spots[i];

    // 既に処理済みならスキップ
    if (progress.completed.includes(spot.slug)) {
      stats.skipped++;
      continue;
    }

    try {
      const result = await processSpot(spot, opts.dryRun);

      if (result.status === 'dry-run') {
        stats.dryRun++;
        continue;
      }

      if (result.data) {
        // JSON保存
        const outPath = path.join(STRUCTURES_DIR, `${result.slug}.json`);
        fs.writeFileSync(outPath, JSON.stringify(result.data, null, 2), 'utf-8');

        if (result.status === 'fallback') {
          stats.fallback++;
          sources.fallback++;
        } else {
          stats.success++;
          sources[result.source] = (sources[result.source] || 0) + 1;
        }

        progress.completed.push(result.slug);
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      stats.error++;
      progress.failed.push({ slug: spot.slug, error: err.message, at: new Date().toISOString() });
    }

    // 5スポットごとに進捗保存
    if ((i + 1) % 5 === 0) {
      saveProgress(progress);
      console.log(`\n  [Progress] ${i + 1}/${spots.length} | Success: ${stats.success} | Fallback: ${stats.fallback} | Error: ${stats.error}`);
    }
  }

  // 最終進捗保存
  saveProgress(progress);

  // サマリー
  console.log('\n=== Pipeline Complete ===');
  console.log(`Total: ${spots.length}`);
  console.log(`Success: ${stats.success}`);
  console.log(`Fallback: ${stats.fallback}`);
  console.log(`Error: ${stats.error}`);
  console.log(`Skipped: ${stats.skipped}`);
  if (opts.dryRun) console.log(`Dry-run: ${stats.dryRun}`);
  console.log(`Sources: Sentinel+OSM=${sources['sentinel+osm']}, Sentinel=${sources.sentinel}, OSM=${sources.osm}, Fallback=${sources.fallback}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
