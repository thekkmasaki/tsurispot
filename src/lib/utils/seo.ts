/**
 * SEO 用ユーティリティ。
 *
 * description を文字数制限する際、`slice(0, n)` で文字単位に切ると
 * 「...初心者でも入れ食いが楽し」のように途中で切れて、SERPでも違和感が出る。
 * 句点（。）または英文ピリオド（.）境界で切ることで自然な締まり方になる。
 */

/** description の最大長（半角換算 158 で SERP 切り詰めの安全圏）。 */
export const DESCRIPTION_MAX = 158;

/**
 * 文字列を句点境界で安全にトリム。
 * - max 以下ならそのまま返す
 * - max を超える場合、max までの中で最後の「。」または「.」位置で切る
 * - 句点が見つからない／早すぎる位置（max の半分以下）の場合のみ「…」付き末尾切り
 */
export function trimDescription(text: string, max = DESCRIPTION_MAX): string {
  if (!text) return "";
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastFullStop = Math.max(cut.lastIndexOf("。"), cut.lastIndexOf("."));
  if (lastFullStop > Math.floor(max / 2)) {
    return cut.slice(0, lastFullStop + 1);
  }
  return cut + "…";
}

/** title 表示の安全上限（SERP 切り詰めの安全圏。全角混在のため緩めに 60）。 */
export const TITLE_MAX = 60;

/**
 * スポット詳細ページの <title>。
 *
 * GSC の striking-distance 分析では spot-detail の実クエリが「[地名] 釣果」「[地名] 釣り情報」に
 * 集中する一方、旧 title は「{name}の釣り情報・釣果・アクセス」で最強 intent の「釣果」が後方に
 * 埋もれ CTR を取りこぼしていた。地名（=クエリ語頭）の直後に「釣果」を前置し、鮮度トークン
 * （動的年号）を足して釣果クエリの日付バイアスに合わせる。誇張表現は使わず実データ語のみ。
 *
 * OG/twitter とも文字列を共有できるよう、構造的型で受ける（FishingSpot 依存を持ち込まない）。
 */
export function buildSpotTitle(spot: {
  name: string;
  catchableFish: { fish: { name: string }; method?: string }[];
}): string {
  const year = new Date().getFullYear();
  const topFish = spot.catchableFish
    .slice(0, 2)
    .map((cf) => cf.fish.name)
    .join("・");
  const method = spot.catchableFish[0]?.method ?? "";
  const base = `${spot.name}の釣果・釣り情報【${year}年最新】`;
  const full =
    method && topFish
      ? `${spot.name}の釣果・釣り情報｜${method}で${topFish}【${year}年】`
      : base;
  if (full.length <= TITLE_MAX) return full;
  if (base.length <= TITLE_MAX) return base;
  // 地名が極端に長いスポットのフォールバック（鮮度トークンを落として釣果 intent は維持）。
  return `${spot.name}の釣果・釣り情報`;
}
