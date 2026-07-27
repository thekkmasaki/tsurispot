/**
 * 広告イベントの GA4 トラッキング
 *
 * 広告の impression（AdSense が実際に push された＝広告リクエストが出た）と
 * viewability（枠の 50% 以上が 1 秒以上画面に表示された／MRC 基準に準拠）を
 * placement 別に GA4 へ送信する。これにより「どの広告枠が見られ・稼ぐか」を
 * 可視化し、データドリブンな配置最適化の意思決定に使う。
 *
 * 送信パターンは affiliate-config.ts の trackAffiliateClick に揃えている。
 * placement の論理名は ads-config.ts（PR2 で導入）の論理名と一致させること。
 */

export type AdEventName = "ad_impression" | "ad_viewable" | "ad_click";

export function trackAdEvent(params: {
  /** 広告枠の論理名（例: "in_article", "sidebar_sticky"）。GA4 のカスタムディメンションで集計する */
  placement: string;
  /** AdSense スロットID（任意） */
  slot?: string;
  event: AdEventName;
}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", params.event, {
    ad_placement: params.placement,
    ...(params.slot ? { ad_slot: params.slot } : {}),
  });
}

/**
 * 広告ブロック検知の実測イベント。ページロード毎に1回、ブロックの有無を GA4 へ送る。
 * 割合 = blocked=1 の数 / page_view の数。
 *
 * 注意（計測の盲点）: gtag.js 自体も EasyPrivacy 等でブロックされ得るため、
 * この集計は「下限値（過小評価）」になる。絶対値ではなく相対トレンドとして扱うこと。
 */
export function trackAdBlock(blocked: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "ad_blocked", { blocked: blocked ? 1 : 0 });
}

/**
 * 広告枠が埋まらず（ブロック or no-fill）自前ハウス広告に差し替えた時に送る。
 * reason で「blocked（スクリプト未処理）」と「unfilled（配信なし）」を区別する。
 */
export function trackAdFallback(placement: string | undefined, reason: "blocked" | "unfilled") {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "ad_fallback", {
    ...(placement ? { ad_placement: placement } : {}),
    ad_fallback_reason: reason,
  });
}
