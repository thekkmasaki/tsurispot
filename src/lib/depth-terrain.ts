/**
 * 地形（水深）タイプの定義。クライアントからも import できるよう、データ本体（JSON）は持たない。
 * スポットごとの値は server 専用の lib/spot-depth-terrain.ts が引く。
 *
 * 海しるAPI（海上保安庁）の等深線から求めた「水深20mラインまでの距離」を3段階に分ける。
 * 足もとの水深ではないので、表示は地形タイプを主役にし、距離は補足に留める。
 */
import { normalizeForSearch } from "@/lib/search/spot-match";

export type DepthTerrainKind = "steep" | "moderate" | "shallow";

export const DEPTH_TERRAIN_KINDS: readonly DepthTerrainKind[] = ["steep", "moderate", "shallow"];

/** 20mラインがこの距離以内なら「岸近くから深い」 */
export const STEEP_MAX_M = 300;
/** 20mラインがこの距離以内なら「やや深場が近い」。超えたら（または見つからなければ）浅め */
export const MODERATE_MAX_M = 1000;

export const DEPTH_TERRAIN_LABELS: Record<DepthTerrainKind, string> = {
  steep: "急に深くなる地形",
  moderate: "ゆるやかに深くなる地形",
  shallow: "遠浅の地形",
};

/** 絞り込みボタン用の短い表記 */
export const DEPTH_TERRAIN_SHORT_LABELS: Record<DepthTerrainKind, string> = {
  steep: "急に深くなる",
  moderate: "ゆるやかに深くなる",
  shallow: "遠浅",
};

/**
 * キーワード検索で地形タイプに当たる言葉。
 * 「深場」「深い」は深い側2タイプの両方、「ドン深」「急深」は最も深いタイプだけに当てる。
 */
const TERRAIN_SEARCH_WORDS: Record<DepthTerrainKind, string[]> = {
  steep: ["急に深くなる", "ドン深", "どん深", "急深", "深場", "深い"],
  moderate: ["ゆるやかに深くなる", "深場", "深い"],
  shallow: ["遠浅", "浅い", "浅め"],
};

// spot-match.ts と相互 import になるため、正規化はモジュール初期化時ではなく初回使用時に行う
let normalizedWords: Record<DepthTerrainKind, string[]> | null = null;
function getNormalizedWords(): Record<DepthTerrainKind, string[]> {
  normalizedWords ??= {
    steep: TERRAIN_SEARCH_WORDS.steep.map(normalizeForSearch),
    moderate: TERRAIN_SEARCH_WORDS.moderate.map(normalizeForSearch),
    shallow: TERRAIN_SEARCH_WORDS.shallow.map(normalizeForSearch),
  };
  return normalizedWords;
}

/** 検索語（正規化済みの1語）がこの地形タイプに当たるか。語の一部入力（「ドン」等）にも当てる */
export function terrainMatchesWord(kind: DepthTerrainKind, normalizedWord: string): boolean {
  if (normalizedWord.length < 2) return false;
  return getNormalizedWords()[kind].some((w) => w.includes(normalizedWord));
}

/** 全文検索インデックスに混ぜる用の語（スペース区切り） */
export function terrainSearchText(kind: DepthTerrainKind): string {
  return TERRAIN_SEARCH_WORDS[kind].join(" ");
}

export function isDepthTerrainKind(v: unknown): v is DepthTerrainKind {
  return typeof v === "string" && (DEPTH_TERRAIN_KINDS as readonly string[]).includes(v);
}

/** 20mラインまでの距離（m）→ 地形タイプ。null は「取得範囲（約1.4km）内に20mラインが無い」 */
export function classifyDepthKind(distanceTo20m: number | null): DepthTerrainKind {
  if (distanceTo20m != null && distanceTo20m <= STEEP_MAX_M) return "steep";
  if (distanceTo20m != null && distanceTo20m <= MODERATE_MAX_M) return "moderate";
  return "shallow";
}
