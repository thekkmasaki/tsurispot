/**
 * スポット品質ティア判定（SEO品質基準の一元管理）
 *
 * スポット詳細ページは品質に応じて3層のティアで扱う:
 *
 * 1. noindex帯（description < 50字 かつ 魚種 <= 1）
 *    本当に薄いページのみ noindex（follow は維持）。低品質ページの
 *    インデックスを防ぎ、サイト全体の品質評価を守る。
 *    → src/app/spots/[slug]/page.tsx の generateMetadata で適用
 *
 * 2. 中間帯（noindex帯でも sitemap帯でもないスポット）
 *    index は許可するが sitemap には載せない。内部リンク
 *    （都道府県別一覧・関連スポット等）経由でのみクロールされる。
 *    Google に「積極的に推す品質ではないが、価値はある」と伝える層。
 *
 * 3. sitemap帯（description >= 100字 かつ 魚種 >= 2）
 *    sitemap に掲載して優先的にクロール・インデックスさせる品質シグナル層。
 *    → src/app/sitemap.ts のスポット詳細フィルタで適用
 *
 * 閾値の非対称（50字/100字）は意図的な設計。中間帯を設けることで
 * 「noindexにするほど薄くはないが、sitemapで推すほど厚くもない」
 * スポットを段階的に品質改善へ誘導できる。閾値を変更する場合は
 * 必ず両関数とこのコメントをセットで見直すこと。
 *
 * 補足: src/lib/data/spots.ts の enrichDescriptions() が description < 100字 の
 * スポットを generateSpotIntro() で補完するため、実行時にはほぼ全スポットが
 * description >= 100字 になる（= noindex帯はセーフティネットとして機能）。
 */

/**
 * 品質判定に必要な最小限のフィールド。
 * FishingSpot 全体ではなくこの形を満たせばよい（テスト・スクリプトから使いやすくするため）。
 */
export type SpotQualityInput = {
  description: string;
  catchableFish: readonly unknown[];
};

/**
 * noindex帯の判定: description < 50字 かつ 魚種 <= 1
 * true のスポット詳細ページは robots: { index: false, follow: true } を付与する。
 */
export function isLowQualitySpot(spot: SpotQualityInput): boolean {
  const descLength = (spot.description || "").length;
  const fishCount = spot.catchableFish.length;
  return descLength < 50 && fishCount <= 1;
}

/**
 * sitemap帯の判定: description >= 100字 かつ 魚種 >= 2
 * true のスポットのみ sitemap.xml に掲載する（品質シグナル）。
 */
export function isSitemapEligible(spot: SpotQualityInput): boolean {
  const descLength = (spot.description || "").length;
  const fishCount = spot.catchableFish.length;
  return descLength >= 100 && fishCount >= 2;
}
