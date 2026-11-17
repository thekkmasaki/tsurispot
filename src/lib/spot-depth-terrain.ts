/**
 * サーバー専用: スポット周辺の「地形（水深）」データを引く。
 *
 * 海しるAPI（海上保安庁）の等深線から、スポット地点から水深20mの等深線までの
 * 水平距離を一度だけバッチ取得し（scripts/fetch-spot-depth-contour.mjs）、
 * その距離を事実として表示する（解釈は付けない）。区分の定義は lib/depth-terrain.ts。
 *
 * JSON（約4,000件）を import するので、クライアントコンポーネントから import しないこと。
 * 一覧・検索へは ListSpot.depthTerrain（区分の文字列だけ）として渡す。
 */
import depthData from "@/lib/data/spot-depth-contour.json";
import { classifyDepthKind, type DepthTerrainKind } from "@/lib/depth-terrain";

export type { DepthTerrainKind } from "@/lib/depth-terrain";

export interface DepthTerrain {
  kind: DepthTerrainKind;
  /** 海しるの等深線から読める事実（例: 「水深20mの等深線まで 沖合約300m」） */
  fact: string;
}

/**
 * 20mの等深線までの距離（m）から表示用の文言を作る。
 * null は「取得範囲（約1.4km四方）内に20mの等深線が無い」を意味する。
 */
export function classifyDepthTerrain(distanceTo20m: number | null): DepthTerrain {
  const kind = classifyDepthKind(distanceTo20m);
  if (distanceTo20m == null || distanceTo20m > 1000) {
    return { kind, fact: "沖合約1km以内に水深20mの等深線なし" };
  }
  return { kind, fact: `水深20mの等深線まで 沖合${formatDistance(distanceTo20m)}` };
}

function formatDistance(m: number): string {
  // 座標は港の代表点などで誤差があるため、100m未満は「100m以内」、それ以上は50m単位に丸める
  if (m < 100) return "100m以内";
  return `約${Math.round(m / 50) * 50}m`;
}

const spots = depthData.spots as Record<string, number | null>;

/** スポットの地形（水深）データ。データが無ければ null */
export function getSpotDepthTerrain(slug: string): DepthTerrain | null {
  if (!Object.prototype.hasOwnProperty.call(spots, slug)) return null;
  return classifyDepthTerrain(spots[slug]);
}

/** 一覧・検索用: 区分だけ。データが無ければ undefined */
export function getSpotDepthKind(slug: string): DepthTerrainKind | undefined {
  if (!Object.prototype.hasOwnProperty.call(spots, slug)) return undefined;
  return classifyDepthKind(spots[slug]);
}

/** 海しるAPI利用規約 第5条で明示が求められている文言 */
export const MSIL_DISCLAIMER =
  "このサービスは、海しるAPIを利用して取得した情報をもとに作成しているが、サービスの内容は海上保安庁によって保証されたものではない";
