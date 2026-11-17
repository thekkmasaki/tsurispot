/**
 * サーバー専用: スポット周辺の「地形（水深）」の目安を引く。
 *
 * 海しるAPI（海上保安庁）の等深線から、スポット地点から水深20mラインまでの
 * 水平距離を一度だけバッチ取得し（scripts/fetch-spot-depth-contour.mjs）、
 * それを3段階の地形タイプに分けて表示する。タイプの定義は lib/depth-terrain.ts。
 *
 * JSON（約4,000件）を import するので、クライアントコンポーネントから import しないこと。
 * 一覧・検索へは ListSpot.depthTerrain（タイプ文字列だけ）として渡す。
 */
import depthData from "@/lib/data/spot-depth-contour.json";
import { classifyDepthKind, DEPTH_TERRAIN_LABELS, type DepthTerrainKind } from "@/lib/depth-terrain";

export type { DepthTerrainKind } from "@/lib/depth-terrain";

export interface DepthTerrain {
  kind: DepthTerrainKind;
  /** 地形タイプの見出し */
  label: string;
  /** 釣りへの意味（無い場合は undefined） */
  hint?: string;
}

/**
 * 20mラインまでの距離（m）から表示用の地形情報を作る。
 * null は「取得範囲（約1.4km）内に20mラインが無い」を意味する。
 * 距離（100m〜1km）は投げて届く範囲（50〜80m）の外なので画面には出さず、
 * 「急に深くなるか・遠浅か」という坂の傾向を測る物差しとしてだけ使う。
 */
export function classifyDepthTerrain(distanceTo20m: number | null): DepthTerrain {
  const kind = classifyDepthKind(distanceTo20m);
  return {
    kind,
    label: DEPTH_TERRAIN_LABELS[kind],
    hint: kind === "steep" ? "冬の深場狙い（イカ・根魚）の候補" : undefined,
  };
}

const spots = depthData.spots as Record<string, number | null>;

/** スポットの地形（水深）目安。データが無ければ null */
export function getSpotDepthTerrain(slug: string): DepthTerrain | null {
  if (!Object.prototype.hasOwnProperty.call(spots, slug)) return null;
  return classifyDepthTerrain(spots[slug]);
}

/** 一覧・検索用: 地形タイプだけ。データが無ければ undefined */
export function getSpotDepthKind(slug: string): DepthTerrainKind | undefined {
  if (!Object.prototype.hasOwnProperty.call(spots, slug)) return undefined;
  return classifyDepthKind(spots[slug]);
}

/** 海しるAPI利用規約 第5条で明示が求められている文言 */
export const MSIL_DISCLAIMER =
  "このサービスは、海しるAPIを利用して取得した情報をもとに作成しているが、サービスの内容は海上保安庁によって保証されたものではない";
