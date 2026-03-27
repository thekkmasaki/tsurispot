/**
 * fish-estimator.mjs
 * ゾーン・構造物・既存魚データに基づいて各ゾーンの釣れる魚を推定するモジュール
 */

/**
 * 構造物→魚種マッピング
 */
const STRUCTURE_FISH = {
  seawall: {
    fish: ['アジ', 'サバ', 'イワシ', 'スズキ', 'クロダイ'],
    methods: ['サビキ釣り', 'ウキ釣り', 'ちょい投げ'],
  },
  tetrapod: {
    fish: ['メバル', 'カサゴ', 'アイナメ', 'ソイ', 'クロダイ'],
    methods: ['穴釣り', 'メバリング', 'ヘチ釣り'],
  },
  rocky: {
    fish: ['メジナ', 'クロダイ', 'アコウ', 'イシダイ'],
    methods: ['ウキ釣り', 'フカセ釣り', 'カゴ釣り'],
  },
  sandy: {
    fish: ['カレイ', 'キス', 'ヒラメ'],
    methods: ['投げ釣り', 'ちょい投げ', 'サーフキャスティング'],
  },
  pier: {
    fish: ['クロダイ', 'スズキ', 'メバル', 'アジ'],
    methods: ['ヘチ釣り', 'ウキ釣り', 'サビキ釣り'],
  },
  'port-facility': {
    fish: ['アジ', 'イワシ', 'クロダイ', 'スズキ', 'サバ'],
    methods: ['サビキ釣り', 'ウキ釣り', 'アジング'],
  },
};

/** 回遊魚 */
const MIGRATORY_FISH = new Set([
  'アジ', 'サバ', 'イワシ', 'ハマチ', 'ブリ', 'スズキ',
]);

/** 根魚 */
const ROCKFISH = new Set([
  'メバル', 'カサゴ', 'アイナメ', 'ソイ', 'アコウ',
]);

/** ファミリー向け魚 */
const FAMILY_FISH = new Set(['アジ', 'イワシ', 'サバ', 'キス']);

/**
 * 構造物リストから関連魚種を収集
 */
function collectStructureFish(structures) {
  const fishSet = new Set();
  const methodSet = new Set();
  for (const st of structures) {
    const mapping = STRUCTURE_FISH[st];
    if (mapping) {
      for (const f of mapping.fish) fishSet.add(f);
      for (const m of mapping.methods) methodSet.add(m);
    }
  }
  return { fish: [...fishSet], methods: [...methodSet] };
}

/**
 * catchableFishからnameでルックアップするマップを作成
 */
function buildFishLookup(catchableFish) {
  const map = new Map();
  for (const cf of catchableFish) {
    map.set(cf.name, cf);
  }
  return map;
}

/**
 * 単一ゾーンの推定魚を計算
 */
function estimateForZone(zone, catchableFish, fishLookup) {
  const { structures, currentFlow } = zone;
  const hasTetrapod = structures.includes('tetrapod');
  const { fish: structureFishNames, methods: structureMethods } =
    collectStructureFish(structures);

  // 魚→確率のマップ
  const fishProb = new Map();

  // 1. catchableFishの全魚に基礎確率0.60
  for (const cf of catchableFish) {
    let prob = 0.60;

    // 構造物マッチングボーナス
    if (structureFishNames.includes(cf.name)) {
      prob += 0.20;
    }

    // ゾーン位置補正
    if (currentFlow >= 0.85 && MIGRATORY_FISH.has(cf.name)) {
      prob += 0.15;
    }
    if (hasTetrapod && ROCKFISH.has(cf.name)) {
      prob += 0.20;
    }
    if (currentFlow < 0.7 && FAMILY_FISH.has(cf.name)) {
      prob += 0.10;
    }

    // クランプ
    prob = Math.max(0.30, Math.min(0.98, prob));
    fishProb.set(cf.name, prob);
  }

  // 2. 構造物関連魚でcatchableFishにない魚も追加（確率0.40）
  for (const name of structureFishNames) {
    if (!fishProb.has(name)) {
      let prob = 0.40;
      if (currentFlow >= 0.85 && MIGRATORY_FISH.has(name)) prob += 0.10;
      if (hasTetrapod && ROCKFISH.has(name)) prob += 0.15;
      prob = Math.max(0.30, Math.min(0.98, prob));
      fishProb.set(name, prob);
    }
  }

  // 3. 確率0.30未満を除外（クランプ済みなので実質全て残る）
  // 4. 確率降順ソートで結果を作成
  const result = [...fishProb.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, probability]) => {
      const existing = fishLookup.get(name);
      return {
        name,
        probability: Math.round(probability * 100) / 100,
        season: existing?.season || '通年',
        method: existing?.method || structureMethods[0] || '不明',
        difficulty: existing?.difficulty || 'medium',
      };
    });

  return result;
}

/**
 * ゾーンごとに釣れる魚を推定し、estimatedFishを埋める
 *
 * @param {Array} zones - zone-generatorの出力（estimatedFishが空）
 * @param {Array} catchableFish - スポットの既存釣れる魚データ
 * @param {string} spotType - スポットタイプ
 * @returns {Array} estimatedFishが埋められたゾーン配列
 */
export function estimateFish(zones, catchableFish = [], spotType = 'port') {
  const fishLookup = buildFishLookup(catchableFish);

  // catchableFishが空の場合、spotTypeから基礎的な魚リストを作る
  let effectiveCatchableFish = catchableFish;
  if (catchableFish.length === 0) {
    const typeMapping = {
      port: ['アジ', 'サバ', 'イワシ', 'クロダイ'],
      beach: ['キス', 'カレイ', 'ヒラメ'],
      rocky: ['メジナ', 'クロダイ', 'カサゴ'],
      river: ['スズキ', 'ハゼ', 'クロダイ'],
      pier: ['アジ', 'クロダイ', 'メバル'],
      breakwater: ['アジ', 'サバ', 'メバル', 'カサゴ'],
    };
    const names = typeMapping[spotType] || typeMapping.port;
    effectiveCatchableFish = names.map((name) => ({
      name,
      season: '通年',
      method: '',
      difficulty: 'medium',
    }));
    for (const cf of effectiveCatchableFish) {
      fishLookup.set(cf.name, cf);
    }
  }

  return zones.map((zone) => ({
    ...zone,
    estimatedFish: estimateForZone(zone, effectiveCatchableFish, fishLookup),
  }));
}
