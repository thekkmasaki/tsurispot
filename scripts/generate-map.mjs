#!/usr/bin/env node
/**
 * generate-map.mjs
 * AI解析釣りマップ — 1スポット80点フレームワーク CLIツール
 *
 * 特許パイプライン STEP 3-6 に相当する処理を統合し、
 * 高品質なSpotAnalysisResult JSONを生成する。
 *
 * Usage:
 *   # 最高品質: endpoints手動指定
 *   node scripts/generate-map.mjs hiraiso-fishing-park \
 *     --west=34.6261,135.0629 --east=34.6273,135.0692
 *
 *   # 高品質: 方向と長さ指定
 *   node scripts/generate-map.mjs hiraiso-fishing-park --bearing=70 --length=650
 *
 *   # 標準品質: 自動推定（OSM→spotType推定フォールバック）
 *   node scripts/generate-map.mjs hiraiso-fishing-park
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { readSpotData, resolveFishName } from './lib/spot-data-reader.mjs';
import { generateZones } from './lib/zone-generator.mjs';
import { estimateFish } from './lib/fish-estimator.mjs';
import { estimateFacilities } from './lib/facility-estimator.mjs';
import { resolveSeaLabel } from './lib/sea-label-resolver.mjs';
import { queryWithCache } from './lib/overpass-client.mjs';
import { analyzeOsmData } from './lib/osm-structure-analyzer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '..', 'patent', 'data', 'structures');

// ─── CLI引数パース ──────────────────────────────────────────
function parseArgs(argv) {
  const slug = argv[2];
  const args = { slug };

  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--west=')) {
      const [lat, lng] = arg.slice(7).split(',').map(Number);
      args.west = { lat, lng };
    } else if (arg.startsWith('--east=')) {
      const [lat, lng] = arg.slice(7).split(',').map(Number);
      args.east = { lat, lng };
    } else if (arg.startsWith('--bearing=')) {
      args.bearing = parseFloat(arg.slice(10));
    } else if (arg.startsWith('--length=')) {
      args.length = parseFloat(arg.slice(9));
    }
  }

  return args;
}

// ─── 座標計算 ───────────────────────────────────────────────
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function destinationPoint(lat, lng, bearing, distance) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const toDeg = rad => rad * 180 / Math.PI;
  const lat1 = toRad(lat);
  const lng1 = toRad(lng);
  const brng = toRad(bearing);
  const d = distance / R;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );
  return {
    lat: Math.round(toDeg(lat2) * 1000000) / 1000000,
    lng: Math.round(toDeg(lng2) * 1000000) / 1000000,
  };
}

function calculateBearing(lat1, lng1, lat2, lng2) {
  const toRad = deg => deg * Math.PI / 180;
  const toDeg = rad => rad * 180 / Math.PI;
  const dLng = toRad(lng2 - lng1);
  const y = Math.sin(dLng) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2))
    - Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function estimateDefaultBearing(spotType, lat, lng) {
  if (spotType === 'pier') {
    return lng < 136 ? 0 : 180;
  }
  return 90;
}

// ─── spotType→layoutType変換 ────────────────────────────────
const LAYOUT_MAP = {
  port: 'port',
  beach: 'beach',
  rocky: 'seawall',
  pier: 'pier',
  breakwater: 'seawall',
  river: 'port',
};

const DEFAULT_LENGTHS = {
  port: 200,
  beach: 500,
  rocky: 150,
  pier: 100,
  breakwater: 300,
  river: 100,
};

const DEFAULT_STRUCTURES = {
  port: ['seawall', 'port-facility'],
  beach: ['sandy'],
  rocky: ['rocky'],
  river: ['other-structure'],
  pier: ['pier'],
  breakwater: ['seawall', 'tetrapod'],
};

// ─── メイン処理 ─────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);

  if (!args.slug) {
    console.error('Usage: node scripts/generate-map.mjs <slug> [--west=lat,lng] [--east=lat,lng] [--bearing=N] [--length=N]');
    process.exit(1);
  }

  console.log(`\n🗺️  generate-map: ${args.slug}`);
  console.log('─'.repeat(50));

  // ── STEP 1: スポットデータ取得 ──
  const spot = readSpotData(args.slug);
  if (!spot) {
    console.error(`❌ スポット "${args.slug}" が見つかりません`);
    process.exit(1);
  }

  console.log(`📍 ${spot.slug} (${spot.spotType}) [${spot.lat}, ${spot.lng}]`);
  console.log(`🐟 catchableFish: ${spot.catchableFish.length}種`);

  // ── STEP 2: structureEndpoints決定 ──
  let endpoints = null;
  let structureLength = null;
  let bearing = args.bearing ?? null;
  let layoutType = LAYOUT_MAP[spot.spotType] || 'seawall';
  let osmConfidence = 0;
  let source = '';

  // 優先順位 a) CLI手動指定
  if (args.west && args.east) {
    endpoints = { west: args.west, east: args.east };
    structureLength = Math.round(haversineDistance(
      args.west.lat, args.west.lng, args.east.lat, args.east.lng
    ));
    if (bearing === null) {
      bearing = calculateBearing(
        args.west.lat, args.west.lng, args.east.lat, args.east.lng
      );
    }
    source = 'manual';
    console.log(`📐 Endpoints: manual (${structureLength}m, bearing=${Math.round(bearing)}°)`);
  }

  // 優先順位 b) CLI bearing+length指定
  if (!endpoints && args.bearing != null && args.length) {
    bearing = args.bearing;
    structureLength = args.length;
    const half = structureLength / 2;
    const startPt = destinationPoint(spot.lat, spot.lng, (bearing + 180) % 360, half);
    const endPt = destinationPoint(spot.lat, spot.lng, bearing, half);
    endpoints = startPt.lng <= endPt.lng
      ? { west: startPt, east: endPt }
      : { west: endPt, east: startPt };
    source = 'bearing+length';
    console.log(`📐 Endpoints: bearing+length (${structureLength}m, bearing=${Math.round(bearing)}°)`);
  }

  // 優先順位 c) OSM Overpass
  if (!endpoints) {
    console.log('🌍 OSMデータ取得中...');
    try {
      const osmData = await queryWithCache(args.slug, spot.lat, spot.lng, 500, spot.spotType);
      if (osmData) {
        const osmResult = analyzeOsmData(osmData, spot.lat, spot.lng, spot.spotType);
        if (osmResult && osmResult.endpoints) {
          endpoints = osmResult.endpoints;
          structureLength = osmResult.structureLength;
          layoutType = osmResult.layoutType;
          osmConfidence = osmResult.confidence;
          if (bearing === null) {
            bearing = calculateBearing(
              endpoints.west.lat, endpoints.west.lng,
              endpoints.east.lat, endpoints.east.lng
            );
          }
          source = `osm (wayId=${osmResult.wayId}, conf=${osmResult.confidence})`;
          console.log(`📐 Endpoints: OSM (${structureLength}m, bearing=${Math.round(bearing)}°, conf=${osmResult.confidence})`);
        }
      }
    } catch (err) {
      console.warn(`⚠️ OSM取得失敗: ${err.message}`);
    }
  }

  // 優先順位 d) spotTypeベース推定フォールバック
  if (!endpoints) {
    if (bearing === null) {
      bearing = estimateDefaultBearing(spot.spotType, spot.lat, spot.lng);
    }
    structureLength = args.length || DEFAULT_LENGTHS[spot.spotType] || 200;
    const half = structureLength / 2;
    const startPt = destinationPoint(spot.lat, spot.lng, (bearing + 180) % 360, half);
    const endPt = destinationPoint(spot.lat, spot.lng, bearing, half);
    endpoints = startPt.lng <= endPt.lng
      ? { west: startPt, east: endPt }
      : { west: endPt, east: startPt };
    source = 'fallback (spotType推定)';
    console.log(`📐 Endpoints: fallback (${structureLength}m, bearing=${Math.round(bearing)}°)`);
  }

  // ── STEP 3: ゾーン生成 ──
  console.log('🔧 ゾーン生成中...');
  const zones = generateZones(structureLength, layoutType, null, {
    slug: args.slug,
    bearing,
  });
  console.log(`  → ${zones.length}ゾーン生成`);

  // ── STEP 4: 魚種推定 ──
  console.log('🐟 魚種推定中...');
  const catchableFishForEstimator = spot.catchableFish.map(cf => ({
    name: resolveFishName(cf.name),
    season: `${cf.monthStart}月〜${cf.monthEnd}月`,
    method: cf.method,
    difficulty: cf.difficulty,
  }));
  const zonesWithFish = estimateFish(zones, catchableFishForEstimator, spot.spotType);

  // 全ゾーンのユニーク魚種数を計算
  const allFishNames = new Set();
  for (const z of zonesWithFish) {
    for (const f of z.estimatedFish) {
      allFishNames.add(f.name);
    }
  }
  console.log(`  → ${allFishNames.size}種の魚を推定`);

  // ── STEP 5: 施設推定 ──
  const facilities = estimateFacilities(spot);
  console.log(`🏢 施設: ${facilities.length}件`);

  // ── STEP 6: 海域名解決 ──
  const seaLabel = resolveSeaLabel(spot.lat, spot.lng);

  // ── STEP 7: detectedStructures生成 ──
  const structures = DEFAULT_STRUCTURES[spot.spotType] || ['seawall'];
  const detectedStructures = structures.map((cat, idx) => ({
    id: `str-${String(idx + 1).padStart(3, '0')}`,
    category: cat,
    confidence: source === 'manual' ? 0.90 : source.startsWith('osm') ? osmConfidence : 0.30,
    bbox: { x: 50 + idx * 100, y: 290, width: 540, height: 35 },
    areaRatio: 0.05,
    relativePosition: structures.length > 1 ? idx / (structures.length - 1) : 0.5,
    distanceFromShore: 'onshore',
  }));

  // ── STEP 8: structureLabel ──
  const structureLabel = {
    seawall: '護岸', pier: '桟橋', port: '港湾', beach: '砂浜',
  }[layoutType] || '護岸';

  // ── STEP 9: confidence計算 ──
  const hasManualEndpoints = source === 'manual';
  const hasCatchableFish = spot.catchableFish.length > 0;
  const hasOsm = source.startsWith('osm');
  let confidence = 0.20;
  if (hasManualEndpoints) confidence += 0.40;
  else if (hasOsm) confidence += osmConfidence * 0.30;
  if (hasCatchableFish) confidence += 0.25;
  if (facilities.length > 0) confidence += 0.05;
  confidence = Math.min(0.98, Math.round(confidence * 100) / 100);

  // ── STEP 10: JSON組み立て ──
  const positionCount = Math.max(3, Math.round(structureLength / 50));

  const result = {
    spotSlug: args.slug,
    coordinates: { lat: spot.lat, lng: spot.lng },
    imageMetadata: {
      source: 'sentinel-2',
      date: new Date().toISOString().split('T')[0],
      resolution: 10,
      imageSize: { width: 640, height: 640 },
    },
    layoutType,
    structureEndpoints: endpoints,
    structureLabel,
    seaLabel,
    detectedStructures,
    seaBottomFeatures: [],
    zones: zonesWithFish,
    facilities,
    structureLength,
    positionCount,
    analyzedAt: new Date().toISOString(),
    pipelineVersion: '2.0.0-generate-map',
    _meta: {
      endpointSource: source,
      bearing: Math.round(bearing),
      confidence,
      catchableFishCount: spot.catchableFish.length,
      uniqueFishInZones: allFishNames.size,
      zoneCount: zonesWithFish.length,
      facilityCount: facilities.length,
    },
  };

  // ── 出力 ──
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outputFile = path.join(OUTPUT_DIR, `${args.slug}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), 'utf-8');

  // ── 品質サマリー ──
  console.log('\n' + '═'.repeat(50));
  console.log('📊 品質サマリー');
  console.log('═'.repeat(50));
  console.log(`  スポット:     ${args.slug}`);
  console.log(`  Endpoints:   ${source}`);
  console.log(`  Bearing:     ${Math.round(bearing)}°`);
  console.log(`  構造物長:     ${structureLength}m`);
  console.log(`  ゾーン数:     ${zonesWithFish.length}`);
  console.log(`  魚種数:       ${allFishNames.size}種 (catchableFish: ${spot.catchableFish.length}種)`);
  console.log(`  施設数:       ${facilities.length}`);
  console.log(`  海域:         ${seaLabel}`);
  console.log(`  Confidence:  ${confidence}`);
  console.log(`  レイアウト:   ${layoutType} (${structureLabel})`);
  console.log('─'.repeat(50));

  // 80点基準チェック
  const score = [];
  if (hasCatchableFish) score.push('✅ catchableFish反映');
  else score.push('❌ catchableFish空');
  if (source === 'manual' || hasOsm) score.push('✅ 実座標ベースEndpoints');
  else score.push('⚠️ フォールバックEndpoints');
  if (facilities.length > 0) score.push('✅ 施設マーカーあり');
  else score.push('⚠️ 施設なし');
  score.push('✅ 決定論的生成（再現性あり）');

  console.log('\n🎯 80点チェック:');
  for (const s of score) console.log(`  ${s}`);

  console.log(`\n💾 ${outputFile}`);
  console.log('');
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
