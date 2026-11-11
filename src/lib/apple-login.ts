// Sign in with Apple（Cognito の federated IdP "SignInWithApple" 経由）の機能スイッチ。
// 環境変数 APPLE_LOGIN_ENABLED が文字列 "true" の時だけ有効。未設定・それ以外は
// ボタンを出さず、サーバー action も拒否する（従来どおり Google だけのログイン）。

/** Cognito に作る Apple IdP の名前（Cognito の固定値。identity_provider に渡す） */
export const APPLE_IDP_NAME = "SignInWithApple";
/** Cognito に作られている Google IdP の名前 */
export const GOOGLE_IDP_NAME = "Google";

export function isAppleLoginEnabled(): boolean {
  return process.env.APPLE_LOGIN_ENABLED === "true";
}

/**
 * Cognito の /oauth2/authorize に付ける identity_provider。
 * Apple 無効時は従来どおり何も付けない（Cognito のアプリクライアントが Google 単独なら
 * Hosted UI を経ずに Google へ自動で飛ぶ、という今の動きをそのまま保つ）。
 * Apple 有効時はアプリクライアントに IdP が 2 つ並ぶため、付けないと Cognito の選択画面が
 * 挟まる。押したボタンの IdP へ直接飛ばすために明示する。
 */
export function authorizeParamsFor(
  provider: "google" | "apple",
  appleEnabled: boolean,
): Record<string, string> | undefined {
  if (!appleEnabled) return undefined;
  return { identity_provider: provider === "apple" ? APPLE_IDP_NAME : GOOGLE_IDP_NAME };
}
