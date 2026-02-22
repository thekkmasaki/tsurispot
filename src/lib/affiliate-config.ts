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
    affiliateId: "5134daee.e7e21566.5134daef.1df36343",
    baseUrl: "https://hb.afl.rakuten.co.jp/ichiba/",
  },
  // もしもアフィリエイト経由なら両方カバーできる
  moshimo: {
    amazonId: "MOSHIMO_AMAZON_ID",
    rakutenId: "MOSHIMO_RAKUTEN_ID",
  },
};

/**
 * Amazon商品URLを生成（検索ベース：商品名で検索するため常に有効）
 */
export function getAmazonUrl(asinOrQuery: string, productName?: string): string {
  // 商品名が提供されていれば検索リンクを生成（ASIN切れに強い）
  const query = productName || asinOrQuery;
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_CONFIG.amazon.tag}`;
}

/**
 * 楽天検索URLを生成
 * ※ 楽天アフィリエイトID未設定のため、通常の検索URLを返す
 */
export function getRakutenUrl(searchQuery: string): string {
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(searchQuery)}/`;
}
