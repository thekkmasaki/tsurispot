/**
 * GA4 イベント計測ユーティリティ（検索・お気に入り・Push購読）
 *
 * 送信パターンは affiliate-config.ts の trackAffiliateClick /
 * ads-tracking.ts の trackAdEvent に揃えている
 * （SSR・gtag 未ロード時は早期 return で何もしない）。
 *
 * - search / select_content / add_to_wishlist は GA4 標準（推奨）イベント
 * - remove_from_wishlist / push_subscription はカスタムイベント
 */

/** サイト内検索の実行を GA4 標準イベント `search` として送信 */
export function trackSearch(params: { searchTerm: string; resultCount: number }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "search", {
    search_term: params.searchTerm,
    result_count: params.resultCount,
  });
}

/** 検索結果の選択を GA4 標準イベント `select_content` として送信 */
export function trackSearchSelect(params: { itemType: string; slug: string }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "select_content", {
    content_type: params.itemType,
    item_id: params.slug,
  });
}

/**
 * お気に入りの追加/削除を送信
 * - add: GA4 標準イベント `add_to_wishlist`
 * - remove: カスタムイベント `remove_from_wishlist`
 */
export function trackFavorite(params: { action: "add" | "remove"; slug: string }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(
    "event",
    params.action === "add" ? "add_to_wishlist" : "remove_from_wishlist",
    { item_id: params.slug },
  );
}

/** 回遊リンクの種別（GA4 の content_type に入る） */
export type InternalLinkContentType =
  | "nearby_spot"
  | "same_pref_spot"
  | "pref_all"
  | "related_post";

/**
 * サイト内の回遊リンクのクリックを GA4 標準イベント `select_content` として送信
 *
 * PV/セッション改善施策の効果測定用。どの導線が実際に次のページへ繋がったかを
 * link_placement（設置箇所）と link_position（同一モジュール内の並び順）で切り分ける。
 * 次元名の link_placement は ads-tracking.ts の ad_placement と衝突させないために分けている。
 */
export function trackInternalLink(params: {
  contentType: InternalLinkContentType;
  itemId: string;
  linkPlacement: string;
  position?: number;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "select_content", {
    content_type: params.contentType,
    item_id: params.itemId,
    link_placement: params.linkPlacement,
    ...(params.position !== undefined ? { link_position: params.position } : {}),
  });
}

export type PushSubscriptionAction = "subscribe" | "unsubscribe" | "permission_denied";

/** Web Push 購読状態の変化をカスタムイベント `push_subscription` として送信 */
export function trackPush(params: { action: PushSubscriptionAction }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "push_subscription", {
    subscription_action: params.action,
  });
}
