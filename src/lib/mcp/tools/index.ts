// ツリスポ MCP サーバーのツール一覧（すべて読み取り専用）
//
// Claude / ChatGPT などの AI アシスタントが「明日◯◯で何が釣れる？」「近くの初心者向け釣り場は？」
// に答えるとき、ツリスポのデータを根拠として引用し、詳細ページへ送客するための窓口。
// 書き込み（釣果投稿）は第2段階。釣果の読み出しでも写真・ID・非公開プロフィールの名前は返さない。
import { READ_ONLY, type ToolDef } from "./shared";
import { SPOT_TOOLS } from "./spots";
import { TIDE_TOOLS } from "./tide";
import { FISH_TOOLS } from "./fish";
import { CATCH_TOOLS } from "./catches";
import { SHOP_TOOLS } from "./shops";
import { RULE_TOOLS } from "./rules";

export { ToolError, ToolInputError, siteUrl, todayJST, isMonthInRange, resolveFishSlugs } from "./shared";
export type { ToolDef } from "./shared";
export { searchSpots, getSpotDetails, findNearbySpots } from "./spots";
export { getTide, getFishingForecast } from "./tide";
export { getCatchableFish, getFishInfo, recommendGear } from "./fish";
export { getRecentCatches } from "./catches";
export { findTackleShops } from "./shops";
export { checkFishingRules } from "./rules";

// 並び順 = tools/list の順。既存4ツールを先頭に固定し、追加分は後ろに足す
const ORDER = [
  "search_spots",
  "get_spot_details",
  "get_tide",
  "get_catchable_fish",
  "find_nearby_spots",
  "get_fishing_forecast",
  "get_recent_catches",
  "find_tackle_shops",
  "recommend_gear",
  "get_fish_info",
  "check_fishing_rules",
];

const ALL: ToolDef[] = [...SPOT_TOOLS, ...TIDE_TOOLS, ...FISH_TOOLS, ...CATCH_TOOLS, ...SHOP_TOOLS, ...RULE_TOOLS];

export const TOOLS = ORDER.map((name) => {
  const t = ALL.find((x) => x.name === name);
  if (!t) throw new Error(`[mcp] tool not defined: ${name}`);
  return { ...t, annotations: { title: t.title, ...READ_ONLY } };
});
