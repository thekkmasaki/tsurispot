/**
 * adsbygoogle.js のロード状態をアプリ全体で共有する極小ステートマシン（React外・モジュールスコープ）。
 *
 * 状態は3値・単方向にのみ遷移する:
 *   'loading'（初期） → 'loaded'（Script onLoad） / 'blocked'（Script onError）
 *
 * 目的: 広告fallbackやブロック計測を「壁時計での推測」ではなく「スクリプト自身の
 * ライフサイクルイベント」で判定するための土台。adsbygoogle.js は lazyOnload
 * （window load後+idle）でしか読み込まれないため、時間ベースの判定は遅い回線の
 * 正常ユーザーを大量に誤判定する（PR#295 監査 F1/F4 の教訓）。
 *
 * 'blocked' はスクリプト取得失敗の総称（広告ブロッカー/DNSフィルタ/ネットワーク断の合算）。
 * 原因は区別できないが「このPVで広告が表示されない」点は同じなので、fallback判定には十分。
 */

export type AdSenseScriptState = "loading" | "loaded" | "blocked";

let state: AdSenseScriptState = "loading";
const listeners = new Set<(s: AdSenseScriptState) => void>();

export function getAdSenseScriptState(): AdSenseScriptState {
  return state;
}

/** AdSenseLoader の Script onLoad/onError からのみ呼ぶ。確定後の再遷移は無視する。 */
export function setAdSenseScriptState(next: Exclude<AdSenseScriptState, "loading">): void {
  if (state !== "loading") return;
  state = next;
  listeners.forEach((cb) => cb(state));
}

/** 状態遷移を購読する。返り値で購読解除。購読前に確定済みの可能性があるため getAdSenseScriptState() と併用すること。 */
export function subscribeAdSenseScriptState(cb: (s: AdSenseScriptState) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
