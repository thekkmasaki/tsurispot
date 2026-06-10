/**
 * diagram-generator.ts
 *
 * 特許パイプラインのコア: 構造物検出結果（SpotAnalysisResult）から
 * FishingPointDiagram用のデータ（SpotDiagramData）を自動生成する。
 *
 * パイプラインフロー:
 *   SpotAnalysisResult → generateDiagramData() → SpotDiagramData
 *
 * 特許請求項1の「マップ生成部(140)」に相当する処理。
 */

import type {
  SpotAnalysisResult,
  AnalysisZone,
  SeaBottomFeature,
} from "./types";
import type {
  SpotDiagramData,
  DiagramFacility,
  DiagramPosition,
  SeaFeature,
  SeaFishLabel,
} from "@/components/spots/fishing-point-diagram";

// ---------------------------------------------------------------------------
// SVG座標系の定数（FishingPointDiagram のレイアウトに合わせる）
// ---------------------------------------------------------------------------

const SVG_WIDTH = 1000;
const SVG_MARGIN = 50;
const USABLE_WIDTH = SVG_WIDTH - SVG_MARGIN * 2; // 900

// Y座標はFishingPointDiagramのLY定数に対応
const Y_FACILITY = 55;
const Y_SEA_FISH_LABEL_BASE = 280;
const Y_SEA_FISH_LABEL_DEEP = 340;
const Y_BOTTOM_FISH = 490;

// ---------------------------------------------------------------------------
// 1. メイン: generateDiagramData
// ---------------------------------------------------------------------------

/**
 * SpotAnalysisResult（構造物検出結果）からSpotDiagramData（ダイアグラム表示用）を自動生成。
 *
 * これが特許の「マップ生成部」の実装。
 * - 検出されたゾーンから釣りポジションを配置
 * - 海底地物をSeaFeatureに変換
 * - 各ゾーンの推定魚種をラベル配置
 * - 施設情報を変換
 */
export function generateDiagramData(
  analysis: SpotAnalysisResult
): SpotDiagramData {
  const positions = generatePositions(analysis);
  const seaFeatures = generateSeaFeatures(analysis.seaBottomFeatures);
  const seaFishLabels = generateFishLabels(analysis.zones);
  const fishNotes = generateFishNotes(analysis.zones);
  const facilities = generateFacilities(analysis.facilities);

  return {
    layout: analysis.layoutType,
    structureLabel: analysis.structureLabel,
    seaLabel: analysis.seaLabel,
    facilities,
    positions,
    seaFeatures,
    seaFishLabels,
    fishNotes,
    accessibilityNote: undefined,
  };
}

// ---------------------------------------------------------------------------
// 2. ポジション（番号付き釣りポイントマーカー）生成
// ---------------------------------------------------------------------------

/**
 * 地図表示用の番号付き釣りポイントマーカー。
 * 特許請求項6「推奨される釣りポイントの位置を示す番号付きマーカー」に相当。
 * 座標系に依存しない relativeX（0=西端, 1=東端）で返す。
 */
export interface MapPointMarker {
  number: number;
  name: string;
  shortName: string;
  rating: "hot" | "good" | "normal";
  /** 構造物ラインに対する相対位置（0=西端, 1=東端） */
  relativeX: number;
  depth?: string;
  fish: {
    name: string;
    method: string;
    season: string;
    difficulty: "easy" | "medium" | "hard";
  }[];
  features?: string[];
  description: string;
}

/**
 * ゾーン情報から番号付き釣りポイントを自動決定。
 *
 * アルゴリズム:
 * 1. positionCount個のポジションを構造物長に沿って等間隔配置
 * 2. 各ポジションが属するゾーンを特定
 * 3. ゾーンの評価・魚種情報をポジションに付与
 * 4. 端のポジションには潮通し補正（大物確率アップ）
 */
export function generateMapPositions(
  analysis: SpotAnalysisResult
): MapPointMarker[] {
  const { zones } = analysis;
  // positionCountがない場合はゾーン数×2（最低5、最大15）で自動決定
  const positionCount = analysis.positionCount || Math.min(Math.max(zones.length * 2, 5), 15);
  const positions: MapPointMarker[] = [];

  for (let i = 0; i < positionCount; i++) {
    // ポジション番号は右端（東端）から1始まり
    const number = positionCount - i;
    // X座標: 左端（西端）から右端（東端）へ等間隔
    const relativeX = i / (positionCount - 1);

    // このポジションが属するゾーンを特定
    const zone = findZoneForPosition(zones, relativeX);

    // ゾーン情報から魚種・評価を取得
    const fish = zone?.estimatedFish
      ? zone.estimatedFish
          .filter((f) => f.probability >= 0.40)
          .map((f) => ({
            name: f.name,
            method: f.method,
            season: f.season,
            difficulty: f.difficulty,
          }))
      : [];

    // 水深情報
    const depth = zone
      ? `足元${zone.estimatedDepth.shore}m${
          zone.estimatedDepth.offshore > zone.estimatedDepth.shore
            ? ` / 沖${zone.estimatedDepth.offshore}m`
            : ""
        }`
      : undefined;

    const features = generatePositionFeatures(
      number,
      positionCount,
      zone,
      fish
    );

    positions.push({
      number,
      name: generatePositionName(number, positionCount, zone),
      shortName: generateShortName(number, positionCount),
      rating: determineRating(number, positionCount, zone, fish),
      relativeX,
      fish,
      depth,
      features: features.length > 0 ? features : undefined,
      description: generatePositionDescription(number, positionCount, zone, fish),
    });
  }

  return positions;
}

/** SVGダイアグラム用: MapPointMarker を SVG 座標系の DiagramPosition に変換 */
function generatePositions(analysis: SpotAnalysisResult): DiagramPosition[] {
  return generateMapPositions(analysis).map((p) => ({
    id: `auto-t${p.number}`,
    number: p.number,
    name: p.name,
    shortName: p.shortName,
    rating: p.rating,
    fish: p.fish,
    depth: p.depth,
    features: p.features,
    description: p.description,
    x: Math.round(SVG_MARGIN + p.relativeX * USABLE_WIDTH),
  }));
}

// ---------------------------------------------------------------------------
// 3. 海底地物（SeaFeature）生成
// ---------------------------------------------------------------------------

/**
 * SeaBottomFeature → SeaFeature 変換。
 * 検出されたxRangeをSVG座標系に変換する。
 */
function generateSeaFeatures(features: SeaBottomFeature[]): SeaFeature[] {
  return features.map((f) => {
    const left = Math.round(f.xRange[0] * 100);
    const width = Math.round((f.xRange[1] - f.xRange[0]) * 100);

    const diagramType = mapFeatureType(f.type);
    const icon = diagramType === "tetrapod" ? "▓" : "◆";

    // Y位置: テトラは浅い（218付近）、魚礁は深い（350-370付近）
    const y =
      f.distanceFromShore === "near"
        ? 218
        : f.distanceFromShore === "medium"
          ? 350 + Math.random() * 30
          : 400;

    return {
      name: getFeatureName(f.type),
      icon,
      left,
      width,
      type: diagramType,
      y: Math.round(y),
    };
  });
}

// ---------------------------------------------------------------------------
// 4. 魚種ラベル生成
// ---------------------------------------------------------------------------

/**
 * ゾーンの推定魚種からSVG上の魚種ラベルを自動配置。
 *
 * アルゴリズム:
 * - 各ゾーンの中心X座標にラベルを配置
 * - 高確率の魚種を上部（護岸寄り）に、底物は下部に配置
 * - 同一ゾーンの魚種はグループ化して1行に
 */
function generateFishLabels(zones: AnalysisZone[]): SeaFishLabel[] {
  const labels: SeaFishLabel[] = [];

  for (const zone of zones) {
    if (!zone.estimatedFish) continue;
    if (zone.estimatedFish.length === 0) continue;

    const centerX =
      SVG_MARGIN + ((zone.xRange[0] + zone.xRange[1]) / 2) * USABLE_WIDTH;

    // 表層・中層の魚（probability >= 0.55）
    const surfaceFish = zone.estimatedFish.filter(
      (f) =>
        f.probability >= 0.55 &&
        !isBottomFish(f.name) &&
        !isBigGameFish(f.name)
    );
    if (surfaceFish.length > 0) {
      labels.push({
        text: surfaceFish.map((f) => f.name).join("・"),
        x: Math.round(centerX - surfaceFish.length * 15),
        y: Y_SEA_FISH_LABEL_BASE,
      });
    }

    // 回遊魚・大型魚
    const bigFish = zone.estimatedFish.filter(
      (f) => f.probability >= 0.40 && isBigGameFish(f.name)
    );
    if (bigFish.length > 0) {
      labels.push({
        text: bigFish.map((f) => f.name).join("・"),
        x: Math.round(centerX - bigFish.length * 10),
        y: Y_SEA_FISH_LABEL_DEEP,
      });
    }

    // エギングターゲット（端のゾーンのみ）
    const egiTargets = zone.estimatedFish.filter(
      (f) => f.method.includes("エギング") && f.probability >= 0.60
    );
    if (
      egiTargets.length > 0 &&
      (zone.xRange[0] < 0.1 || zone.xRange[1] > 0.9)
    ) {
      labels.push({
        text: egiTargets.map((f) => f.name).join("・"),
        x: Math.round(
          zone.xRange[0] < 0.1
            ? SVG_MARGIN
            : SVG_WIDTH - SVG_MARGIN - 60
        ),
        y: 260,
      });
    }
  }

  // 底物ラベル（全ゾーン統合）
  const allBottomFish = new Set<string>();
  for (const zone of zones) {
    if (!zone.estimatedFish) continue;
    for (const f of zone.estimatedFish) {
      if (isBottomFish(f.name) && f.probability >= 0.50) {
        allBottomFish.add(f.name);
      }
    }
  }
  if (allBottomFish.size > 0) {
    labels.push({
      text: Array.from(allBottomFish).join("・"),
      x: Math.round(SVG_WIDTH / 2 - allBottomFish.size * 15),
      y: Y_BOTTOM_FISH,
    });
  }

  return deduplicateLabels(labels);
}

// ---------------------------------------------------------------------------
// 5. 魚分布メモ生成
// ---------------------------------------------------------------------------

/**
 * 全ゾーンの魚種情報から、ダイアグラム下部のメモを自動生成。
 */
function generateFishNotes(zones: AnalysisZone[]): string[] {
  const notes: string[] = [];

  // 全域で出現する魚種を特定
  const fishZoneCount = new Map<string, number>();
  for (const zone of zones) {
    if (!zone.estimatedFish) continue;
    const fishNames = new Set(
      zone.estimatedFish.filter((f) => f.probability >= 0.70).map((f) => f.name)
    );
    for (const name of fishNames) {
      fishZoneCount.set(name, (fishZoneCount.get(name) ?? 0) + 1);
    }
  }

  const ubiquitousFish = Array.from(fishZoneCount.entries())
    .filter(([, count]) => count >= zones.length * 0.6)
    .map(([name]) => name);

  if (ubiquitousFish.length > 0) {
    const methods = new Set<string>();
    for (const zone of zones) {
      if (!zone.estimatedFish) continue;
      for (const f of zone.estimatedFish) {
        if (ubiquitousFish.includes(f.name)) methods.add(f.method);
      }
    }
    notes.push(
      `${ubiquitousFish.join("・")}は全域で回遊（${Array.from(methods).slice(0, 2).join("/")}はどの番号でもOK）`
    );
  }

  // テトラ帯の根魚
  const tetrapodZones = zones.filter((z) =>
    z.seaBottomFeatures.includes("tetrapod")
  );
  if (tetrapodZones.length > 0) {
    const rootFish = new Set<string>();
    for (const z of tetrapodZones) {
      if (!z.estimatedFish) continue;
      for (const f of z.estimatedFish) {
        if (isRockFish(f.name)) rootFish.add(f.name);
      }
    }
    if (rootFish.size > 0) {
      notes.push(`${Array.from(rootFish).join("・")}はテトラ付近に多い`);
    }
  }

  // 底物
  const bottomFishNames = new Set<string>();
  for (const zone of zones) {
    if (!zone.estimatedFish) continue;
    for (const f of zone.estimatedFish) {
      if (isBottomFish(f.name) && f.probability >= 0.50)
        bottomFishNames.add(f.name);
    }
  }
  if (bottomFishNames.size > 0) {
    notes.push(
      `${Array.from(bottomFishNames).join("と")}は投げ釣りで狙う`
    );
  }

  // エギング（端）
  const endZoneEgi = zones.filter(
    (z) =>
      (z.xRange[0] < 0.1 || z.xRange[1] > 0.9) &&
      z.estimatedFish?.some(
        (f) => f.method.includes("エギング") && f.probability >= 0.60
      )
  );
  if (endZoneEgi.length > 0) {
    notes.push("アオリイカは両端が好ポイント");
  }

  // 大型青物
  const bigGameZones = zones.filter((z) =>
    z.estimatedFish?.some((f) => isBigGameFish(f.name) && f.probability >= 0.40)
  );
  if (bigGameZones.length > 0) {
    const bigFishNames = new Set<string>();
    for (const z of bigGameZones) {
      if (!z.estimatedFish) continue;
      for (const f of z.estimatedFish) {
        if (isBigGameFish(f.name)) bigFishNames.add(f.name);
      }
    }
    const zoneNames = bigGameZones.map((z) => z.name.replace("エリア", ""));
    notes.push(
      `大型青物（${Array.from(bigFishNames).join("・")}）は${zoneNames.join("・")}に集中`
    );
  }

  return notes;
}

// ---------------------------------------------------------------------------
// 6. 施設変換
// ---------------------------------------------------------------------------

function generateFacilities(
  facilities: SpotAnalysisResult["facilities"]
): DiagramFacility[] {
  return facilities.map((f) => ({
    id: f.id,
    name: f.name,
    icon: f.icon,
    x: Math.round(SVG_MARGIN + f.relativePosition * USABLE_WIDTH),
    y: Y_FACILITY,
  }));
}

// ---------------------------------------------------------------------------
// ヘルパー関数群
// ---------------------------------------------------------------------------

function findZoneForPosition(
  zones: AnalysisZone[],
  relativeX: number
): AnalysisZone | undefined {
  // 最も重なりが大きいゾーンを返す
  let bestZone: AnalysisZone | undefined;
  let bestOverlap = -1;

  for (const zone of zones) {
    if (relativeX >= zone.xRange[0] && relativeX <= zone.xRange[1]) {
      const overlap =
        Math.min(relativeX + 0.01, zone.xRange[1]) -
        Math.max(relativeX, zone.xRange[0]);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestZone = zone;
      }
    }
  }

  // ゾーン外の場合は最も近いゾーンを返す
  if (!bestZone && zones.length > 0) {
    let minDist = Infinity;
    for (const zone of zones) {
      const center = (zone.xRange[0] + zone.xRange[1]) / 2;
      const dist = Math.abs(relativeX - center);
      if (dist < minDist) {
        minDist = dist;
        bestZone = zone;
      }
    }
  }

  return bestZone;
}

function generatePositionName(
  number: number,
  total: number,
  zone: AnalysisZone | undefined
): string {
  if (number === 1) {
    return `ポイント1番（東端・推定一級）`;
  }
  if (number === total) {
    return `ポイント${total}番（西端）`;
  }
  if (zone?.rating === "hot") {
    return `ポイント${number}番（推定一級）`;
  }
  // 中央付近
  const relX = 1 - (number - 1) / (total - 1);
  if (Math.abs(relX - 0.5) < 0.05) {
    return `ポイント${number}番（中央付近）`;
  }
  return `ポイント${number}番`;
}

function generateShortName(number: number, total: number): string {
  if (number === 1) return "東端";
  if (number === total) return "西端";
  return `P${number}`;
}

function generatePositionDescription(
  number: number,
  total: number,
  zone: AnalysisZone | undefined,
  fish: { name: string; method: string }[]
): string {
  if (!zone) return `ポイント${number}番の釣り座。`;

  const parts: string[] = [];

  // 位置情報
  if (number === 1) {
    parts.push("東端の釣り座。");
    if (zone.currentFlow >= 0.9) {
      parts.push("構造物の先端寄りで潮通しが良く、回遊魚や大型魚が期待できる推定一級ポイント。");
    }
  } else if (number === total) {
    parts.push("西端の釣り座。");
    if (zone.currentFlow >= 0.8) {
      parts.push("潮の変化が出やすく、夕マヅメ〜夜は回遊魚狙いに向くと推定。");
    }
  } else {
    // ゾーン特徴から説明文を生成
    if (zone.seaBottomFeatures.includes("tetrapod")) {
      parts.push("テトラ帯付近。根魚が狙える。");
    }
    if (zone.seaBottomFeatures.includes("reef-stone")) {
      parts.push("捨石魚礁前のエリア。");
    }
    if (zone.seaBottomFeatures.includes("reef-concrete")) {
      parts.push("コンクリート魚礁前のエリア。");
    }
    if (zone.seaBottomFeatures.includes("reef-hex")) {
      parts.push("六角錐魚礁が近い。");
    }
    if (zone.rating === "hot" && zone.structures.length >= 2) {
      parts.push("複数の構造物が切り替わる変化点で、魚が付きやすいと推定。");
    }
  }

  // 魚種ハイライト
  if (fish.length > 0) {
    const easyFish = fish.filter((f) => f.method.includes("サビキ"));
    if (easyFish.length > 0) {
      parts.push(`${easyFish.map((f) => f.name).join("・")}のサビキ釣りが安定。`);
    }
  }

  // 初心者向け判定
  const easyCount = fish.filter(
    (f) =>
      f.method.includes("サビキ") ||
      f.method.includes("ちょい投げ") ||
      f.method.includes("投げ釣り")
  ).length;
  if (easyCount >= 2 && zone.rating !== "hot") {
    parts.push("初心者におすすめ。");
  }

  return parts.join("");
}

function generatePositionFeatures(
  number: number,
  total: number,
  zone: AnalysisZone | undefined,
  fish: { name: string; method: string }[]
): string[] {
  const features: string[] = [];
  if (!zone) return features;

  // 魚種数ベースの特徴
  if (fish.length >= 8) features.push("多魚種");
  if (
    fish.some((f) => f.name === "アジ" && f.method.includes("サビキ")) &&
    zone.rating === "hot"
  ) {
    features.push("サビキ好条件");
  }

  // 構造物ベースの特徴
  if (zone.seaBottomFeatures.includes("tetrapod")) features.push("テトラ際");
  if (zone.seaBottomFeatures.includes("reef-stone"))
    features.push("捨石魚礁前");
  if (zone.seaBottomFeatures.includes("reef-concrete"))
    features.push("コンクリ魚礁前");
  if (zone.seaBottomFeatures.includes("reef-hex"))
    features.push("六角錐魚礁前");

  // ポジションベースの特徴
  if (number === 1 || number === total) {
    if (zone.currentFlow >= 0.8) features.push("潮通し良好");
    if (number === 1) {
      features.push("大物期待", "先端寄り");
    }
    if (number === total) {
      features.push("夕マヅメ向き");
    }
  }

  // 中央付近
  const relX = 1 - (number - 1) / (total - 1);
  if (Math.abs(relX - 0.5) < 0.05) {
    features.push("中央付近", "アクセス良好");
  }

  // 初心者向け
  if (zone.rating === "good" && fish.some((f) => f.method.includes("サビキ"))) {
    features.push("初心者おすすめ");
  }

  // 構造変化
  if (zone.structures.length >= 2 && zone.rating === "hot") {
    features.push("地形変化あり");
  }

  return features;
}

function determineRating(
  number: number,
  total: number,
  zone: AnalysisZone | undefined,
  fish: { name: string }[]
): "hot" | "good" | "normal" {
  if (!zone) return "normal";

  // ゾーンのrating優先
  if (zone.rating === "hot") return "hot";

  // 両端は潮通しボーナス
  if ((number === 1 || number === total) && zone.currentFlow >= 0.8) {
    return fish.length >= 5 ? "hot" : "good";
  }

  // 魚種数ボーナス
  if (fish.length >= 4) return "good";

  return zone.rating;
}

function mapFeatureType(
  type: string
): "tetrapod" | "reef-stone" | "reef-concrete" | "reef-hex" {
  switch (type) {
    case "tetrapod":
      return "tetrapod";
    case "reef-concrete":
      return "reef-concrete";
    case "reef-hex":
      return "reef-hex";
    default:
      return "reef-stone";
  }
}

function getFeatureName(type: string): string {
  switch (type) {
    case "tetrapod":
      return "テトラ帯";
    case "reef-stone":
      return "捨石魚礁";
    case "reef-concrete":
      return "コンクリート魚礁";
    case "reef-hex":
      return "六角錐魚礁";
    case "seagrass":
      return "藻場";
    case "rocky-bottom":
      return "岩礁帯";
    default:
      return "砂底";
  }
}

function isBottomFish(name: string): boolean {
  return ["カレイ", "キス", "シロギス", "ヒラメ", "アイナメ"].includes(name);
}

function isRockFish(name: string): boolean {
  return ["ガシラ", "カサゴ", "メバル", "アイナメ", "ソイ", "アコウ"].includes(
    name
  );
}

function isBigGameFish(name: string): boolean {
  return ["ハマチ", "メジロ", "ブリ", "マダイ", "ヒラマサ"].includes(name);
}

function deduplicateLabels(labels: SeaFishLabel[]): SeaFishLabel[] {
  // 近接するラベルをマージ（Y座標が同じでX座標が近い場合）
  const result: SeaFishLabel[] = [];
  const used = new Set<number>();

  for (let i = 0; i < labels.length; i++) {
    if (used.has(i)) continue;
    let merged = { ...labels[i] };

    for (let j = i + 1; j < labels.length; j++) {
      if (used.has(j)) continue;
      if (
        Math.abs(merged.y - labels[j].y) < 15 &&
        Math.abs(merged.x - labels[j].x) < 80
      ) {
        // テキスト統合
        const existingNames = new Set(merged.text.split("・"));
        const newNames = labels[j].text.split("・");
        for (const n of newNames) existingNames.add(n);
        merged = {
          text: Array.from(existingNames).join("・"),
          x: Math.min(merged.x, labels[j].x),
          y: merged.y,
        };
        used.add(j);
      }
    }

    result.push(merged);
  }

  return result;
}
