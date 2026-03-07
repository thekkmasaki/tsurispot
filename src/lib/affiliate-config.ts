/**
 * アフィリエイト設定
 */
export const AFFILIATE_CONFIG = {
  amazon: {
    tag: "tsurispot-22", // Amazon アソシエイトタグ（メイン）
    baseUrl: "https://www.amazon.co.jp/dp/",
  },
  rakuten: {
    affiliateId: "513d43ec.37411dd7.513d43ed.46a6059c",
    baseUrl: "https://hb.afl.rakuten.co.jp/ichiba/",
  },
};

/**
 * ページ種別ごとのトラッキングID
 * Amazon Associates Centralで追加のトラッキングIDを作成した場合はここを更新
 * GA4イベントでもpage_typeとして送信されるため、
 * 現状のtsurispot-22だけでもGA4側でページ別分析が可能
 */
export type PageType = "spot" | "gear" | "homepage" | "blog" | "monthly" | "fish" | "method" | "other";

/**
 * Amazon商品URLを生成（検索ベース：商品名で検索するため常に有効）
 */
export function getAmazonUrl(asinOrQuery: string, productName?: string): string {
  const query = productName || asinOrQuery;
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_CONFIG.amazon.tag}`;
}

/**
 * 楽天検索URLを生成（アフィリエイトID付き）
 */
export function getRakutenUrl(searchQuery: string): string {
  const { affiliateId } = AFFILIATE_CONFIG.rakuten;
  const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(searchQuery)}/`;
  return `https://hb.afl.rakuten.co.jp/ichiba/${affiliateId}/?pc=${encodeURIComponent(searchUrl)}&link_type=hybrid_url&ut=eyJwYWdlIjoic2hvcCIsInR5cGUiOiJoeWJyaWRfdXJsIiwiY29sIjoxfQ`;
}

/**
 * GA4アフィリエイトクリックイベントを送信
 */
export function trackAffiliateClick(params: {
  productName: string;
  productCategory: string;
  platform: "amazon" | "rakuten";
  pageType: PageType;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "affiliate_click", {
    product_name: params.productName,
    product_category: params.productCategory,
    affiliate_platform: params.platform,
    page_type: params.pageType,
  });
}
