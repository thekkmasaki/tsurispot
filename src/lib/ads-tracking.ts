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

/** 回線種別（4g/3g等）。誤判定の回線層別検算用にイベントへ添付する。未対応ブラウザは undefined。 */
function effectiveConnectionType(): string | undefined {
  if (typeof navigator === "undefined") return undefined;
  const nav = navigator as Navigator & { connection?: { effectiveType?: string } };
  return nav.connection?.effectiveType;
}

/**
 * 広告ブロック検知の実測イベント。ページロード毎に最大1回、ブロックの有無を GA4 へ送る。
 * 割合 = blocked=1 の数 / (blocked=0 + blocked=1 の数)。
 *
 * 判定はスクリプトの load/error イベント駆動（adsense-script-state）で、壁時計の推測をしない。
 * スクリプト状態が確定する前に離脱したセッションは送信されない（分母にも入らない）ため、
 * gtag 自体のブロックによる欠測と合わせ、この集計は真に「下限値（過小評価）」である。
 */
export function trackAdBlock(blocked: boolean) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "ad_blocked", {
    blocked: blocked ? 1 : 0,
    ...(effectiveConnectionType() ? { net_effective_type: effectiveConnectionType() } : {}),
  });
}

/**
 * 広告枠が埋まらず（ブロック or no-fill）自前ハウス広告に差し替えた時に送る。
 * reason: blocked＝スクリプト取得失敗（ブロッカー/ネットワーク断の合算）/ unfilled＝AdSense応答が配信なし。
 */
export function trackAdFallback(placement: string | undefined, reason: "blocked" | "unfilled") {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "ad_fallback", {
    ...(placement ? { ad_placement: placement } : {}),
    ad_fallback_reason: reason,
    ...(effectiveConnectionType() ? { net_effective_type: effectiveConnectionType() } : {}),
  });
}

/**
 * fallback後に実広告が遅れてfillされ、HouseAdを撤去して復帰した時に送る（自己修復の記録）。
 * late_fill ÷ ad_fallback がそのまま「fallback誤発火率」になる＝本機能の安全性を直接観測する主指標。
 * （「AdSense表示回数÷PV」はpushが不変のため本機能の故障を検知できない。監視はこちらを使うこと）
 */
export function trackAdFallbackLateFill(placement: string | undefined, delayMs: number) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "ad_fallback_late_fill", {
    ...(placement ? { ad_placement: placement } : {}),
    delay_ms: Math.round(delayMs),
    ...(effectiveConnectionType() ? { net_effective_type: effectiveConnectionType() } : {}),
  });
}
