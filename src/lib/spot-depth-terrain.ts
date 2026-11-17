/**
 * スポット周辺の「地形（水深）」の目安。
 *
 * 海しるAPI（海上保安庁）の等深線から、スポット地点から水深20mラインまでの
 * 水平距離を一度だけバッチ取得し（scripts/fetch-spot-depth-contour.mjs）、
 * それを3段階の地形タイプに分けて表示する。
 *
 * - 足もとの水深ではない（等深線は 20/50/100/150/200m しか無く、元は500m格子で沿岸は粗い）。
 *   そのため数字を主役にせず「地形のタイプ」で見せ、距離は補足に留める。
 * - データに無い slug（川・池・湖など）は null を返し、行を出さない。
 */
import depthData from "@/lib/data/spot-depth-contour.json";

export type DepthTerrainKind = "steep" | "moderate" | "shallow";

export interface DepthTerrain {
  kind: DepthTerrainKind;
  /** 地形タイプの見出し */
  label: string;
  /** 釣りへの意味（無い場合は undefined） */
  hint?: string;
  /** 補足: 20mラインまでの距離の説明 */
  detail: string;
}

/** 20mラインがこの距離以内なら「岸近くから深い」 */
export const STEEP_MAX_M = 300;
/** 20mラインがこの距離以内なら「やや深場が近い」。超えたら（または見つからなければ）浅め */
export const MODERATE_MAX_M = 1000;

/**
 * 20mラインまでの距離（m）から地形タイプを決める。
 * null は「取得範囲（約1.4km）内に20mラインが無い」を意味する。
 */
export function classifyDepthTerrain(distanceTo20m: number | null): DepthTerrain {
  if (distanceTo20m != null && distanceTo20m <= STEEP_MAX_M) {
    return {
      kind: "steep",
      label: "岸近くから深い地形",
      hint: "冬に深場へ移るイカ・根魚を狙いやすい",
      detail: `沖合${formatDistance(distanceTo20m)}で水深20m`,
    };
  }
  if (distanceTo20m != null && distanceTo20m <= MODERATE_MAX_M) {
    return {
      kind: "moderate",
      label: "やや深場が近い地形",
      detail: `沖合${formatDistance(distanceTo20m)}で水深20m`,
    };
  }
  return {
    kind: "shallow",
    label: "周辺は浅めの地形",
    detail: "約1km以内に水深20mの場所なし",
  };
}

function formatDistance(m: number): string {
  // 100m未満は「100m以内」と丸める（座標の誤差を考えると細かい数字は意味が無い）
  if (m < 100) return "100m以内";
  return `約${Math.round(m / 50) * 50}m`;
}

const spots = depthData.spots as Record<string, number | null>;

/** スポットの地形（水深）目安。データが無ければ null */
export function getSpotDepthTerrain(slug: string): DepthTerrain | null {
  if (!Object.prototype.hasOwnProperty.call(spots, slug)) return null;
  return classifyDepthTerrain(spots[slug]);
}

/** 海しるAPI利用規約 第5条で明示が求められている文言 */
export const MSIL_DISCLAIMER =
  "このサービスは、海しるAPIを利用して取得した情報をもとに作成しているが、サービスの内容は海上保安庁によって保証されたものではない";
