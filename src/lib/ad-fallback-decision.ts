import type { AdSenseScriptState } from "./adsense-script-state";

/**
 * 広告枠の状態判定（pure関数）。AdUnit の fallback エンジンの中核で、副作用なし・テスト可能。
 *
 * 設計原則: 「確定情報が無い間は何もしない」。壁時計による締切判定は一切行わない。
 *  - 'pending' は「まだ分からない」= HouseAd を出さず、実広告の可能性を待つ（誤fallbackの根絶）。
 *  - 判定材料は (1) adsbygoogle.js のロード状態（Script onLoad/onError由来）、
 *    (2) この枠が push 済みか（幅ガード保留中の枠は評価対象外）、
 *    (3) AdSense がスクリプト処理後に <ins> へ付与する data-ad-status。
 */

export type AdSlotOutcome = "blocked" | "unfilled" | "filled" | "pending";

export function decideAdSlotOutcome(params: {
  /** adsbygoogle.js のロード状態 */
  scriptState: AdSenseScriptState;
  /** この枠の push({}) が実行済みか（幅ガードで保留中は false） */
  pushed: boolean;
  /** <ins> の data-ad-status 属性（'filled' | 'unfilled' | null=未確定） */
  adStatus: string | null;
}): AdSlotOutcome {
  // 幅ガード保留中（狭幅/非表示コンテナ）の枠は判定しない。
  // HouseAd を出しても同じ狭幅で崩れるだけであり、幅が確保されれば push 後に再評価される。
  if (!params.pushed) return "pending";

  // スクリプト取得失敗が確定 → このPVで広告は表示されない → fallback してよい
  if (params.scriptState === "blocked") return "blocked";

  // スクリプトはまだ取得中（lazyOnload は window load 後）→ 遅い回線でも誤判定しないよう待つ
  if (params.scriptState === "loading") return "pending";

  // スクリプトロード済み: AdSense の応答結果で判定
  if (params.adStatus === "filled") return "filled";
  if (params.adStatus === "unfilled") return "unfilled";

  // 処理待ち/広告リクエスト中（data-ad-status 未付与）→ MutationObserver の属性変化を待つ
  return "pending";
}
