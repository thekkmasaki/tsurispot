/**
 * Capacitor ネイティブアプリ（iOS/Android）内で動作しているかを判定するユーティリティ。
 *
 * 方針: Web バンドルを汚さないため `@capacitor/core` を import せず、
 * Capacitor がネイティブ実行時にのみ注入するグローバル `window.Capacitor` を参照する。
 * 通常の Web ブラウザでは `window.Capacitor` が undefined のため false を返す。
 */

interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

function getCapacitor(): CapacitorGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
}

/** Capacitor ネイティブアプリ（iOS/Android）内なら true。Web ブラウザでは false。 */
export function isNativeApp(): boolean {
  return getCapacitor()?.isNativePlatform?.() === true;
}

/** 実行プラットフォーム名（"ios" | "android" | "web"）。 */
export function getNativePlatform(): string {
  return getCapacitor()?.getPlatform?.() ?? "web";
}

/** iOS ネイティブアプリ内なら true。 */
export function isIosApp(): boolean {
  return getNativePlatform() === "ios";
}
