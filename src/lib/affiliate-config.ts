/**
 * アフィリエイト設定
 *
 * 実際のアフィリエイトIDに書き換えてください。
 * もしもアフィリエイト経由ならAmazon・楽天の両方をカバーできます。
 */
export const AFFILIATE_CONFIG = {
  amazon: {
    tag: "tsurispot-22", // Amazon アソシエイトタグ（仮）
    baseUrl: "https://www.amazon.co.jp/dp/",
  },
  rakuten: {
    affiliateId: "RAKUTEN_ID", // 楽天アフィリエイトID（仮）
    baseUrl: "https://hb.afl.rakuten.co.jp/ichiba/",
  },
  // もしもアフィリエイト経由なら両方カバーできる
  moshimo: {
    amazonId: "MOSHIMO_AMAZON_ID",
    rakutenId: "MOSHIMO_RAKUTEN_ID",
  },
};

/**
 * Amazon商品URLを生成
 */
export function getAmazonUrl(asin: string): string {
  return `${AFFILIATE_CONFIG.amazon.baseUrl}${asin}?tag=${AFFILIATE_CONFIG.amazon.tag}`;
}

/**
 * 楽天検索URLを生成
 */
export function getRakutenUrl(searchQuery: string): string {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(searchQuery)}/`;
}
