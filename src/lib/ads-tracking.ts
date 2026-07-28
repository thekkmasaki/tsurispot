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
 * 判定はイベント駆動（bait 即判定＋スクリプト load/error 確定待ち）で、壁時計の推測をしない。
 * スクリプト状態が確定する前に離脱したセッションは送信されない（分母にも入らない）ため、
 * gtag 自体のブロックによる欠測と合わせ、概ね「下限値（過小評価）」の集計になる。
 * detect_method で層別に読むこと:
 *  - bait   = cosmetic フィルタ検知（ほぼ確実にブロッカー。ABP Acceptable Ads 構成では
 *             実広告が一部表示されつつ陽性になり得るため厳密なゼロ誤陽性ではない）
 *  - script = スクリプト取得失敗（ブロッカー/ネットワーク断の合算=この経路単独では上限値）
 */
export function trackAdBlock(detection: { blocked: boolean; method: "bait" | "script" }) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "ad_blocked", {
    blocked: detection.blocked ? 1 : 0,
    detect_method: detection.method,
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

// ---- pending滞留の観測（fallbackの盲点計測） ----
// 「push済みなのに結果が確定しない」枠（例: スクリプトはロードされるが広告リクエストのみ
// 遮断されるブロッカー構成、AdSenseが status を書かずに終わるケース）は fallback も発動せず、
// どの指標にも現れない。ページ離脱時に滞留枠数を1イベントで送信し、
// 「fallbackすべきなのにしなかった率」の規模を可視化する（判定には使わない・観測のみ）。

const pendingAdSlots = new Set<string>();
let pendingHookInstalled = false;

function installPendingHook() {
  if (pendingHookInstalled || typeof window === "undefined") return;
  pendingHookInstalled = true;
  window.addEventListener(
    "pagehide",
    () => {
      if (pendingAdSlots.size === 0) return;
      if (typeof window.gtag !== "function") return;
      // GA4 は unload 系イベントで sendBeacon を使うためベストエフォートで届く
      window.gtag("event", "ad_pending_slots", {
        count: pendingAdSlots.size,
        ...(effectiveConnectionType() ? { net_effective_type: effectiveConnectionType() } : {}),
      });
    },
    { once: true }
  );
}

/** push済みで結果未確定の枠を登録（冪等）。fallbackエンジンの evaluate から呼ぶ */
export function markAdSlotPending(key: string) {
  installPendingHook();
  pendingAdSlots.add(key);
}

/** 結果確定（filled/unfilled/blocked）またはアンマウント時に滞留から外す */
export function resolveAdSlotPending(key: string) {
  pendingAdSlots.delete(key);
}
