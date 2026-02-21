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
 * Amazon商品URLを生成
 */
export function getAmazonUrl(asin: string): string {
  return `${AFFILIATE_CONFIG.amazon.baseUrl}${asin}?tag=${AFFILIATE_CONFIG.amazon.tag}`;
}

/**
 * 楽天検索URLを生成（アフィリエイトID付き）
 */
export function getRakutenUrl(searchQuery: string): string {
  const { affiliateId } = AFFILIATE_CONFIG.rakuten;
  const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(searchQuery)}/`;
  return `${AFFILIATE_CONFIG.rakuten.baseUrl}${affiliateId}/?pc=${encodeURIComponent(searchUrl)}&link_type=hybrid_url&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJoeWJyaWRfdXJsIiwiY29sIjoxfQ`;
}
