// iPhone アプリ「釣果記録」連携（アプリ連携）の設定・形式検証。
// 機能スイッチ APP_LINK_ENABLED が文字列 "true" の時だけ有効。それ以外は全エンドポイント 404、
// Bearer トークンは一切受け付けない（既存の挙動を完全に維持する）。

export const APP_LINK_REQ_COOKIE = "app_link_req";
export const APP_LINK_REQ_TTL_SECONDS = 10 * 60;
export const APP_SCHEME_BASE = "com.tsurispot.catchlog://auth";

export const CODE_TTL_SECONDS = 60;
export const TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;
export const TOKEN_TTL_DAYS = 90;
export const MAX_TOKENS_PER_USER = 10;
export const TOUCH_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const TOKEN_PREFIX = "tsa_";

export const CHALLENGE_RE = /^[A-Za-z0-9_-]{43}$/;
export const STATE_RE = /^[A-Za-z0-9_-]{16,64}$/;
export const VERIFIER_RE = /^[A-Za-z0-9._~-]{43,128}$/;
export const CODE_RE = /^[A-Za-z0-9_-]{43}$/;
export const TOKEN_RE = /^tsa_[A-Za-z0-9_-]{43}$/;
export const DEVICE_NAME_MAX = 40;

export function isAppLinkEnabled(): boolean {
  return process.env.APP_LINK_ENABLED === "true";
}

/** アプリへ戻る固定スキームの URL を作る（戻り先はこのスキームだけ）。 */
export function appSchemeUrl(params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `${APP_SCHEME_BASE}?${qs}`;
}

/** /login のログイン後の戻り先。固定の 2 つ以外にはならない。 */
export function resolveLoginRedirect(enabled: boolean, hasAppLinkCookie: boolean): "/app-link" | "/mypage" {
  return enabled && hasAppLinkCookie ? "/app-link" : "/mypage";
}
