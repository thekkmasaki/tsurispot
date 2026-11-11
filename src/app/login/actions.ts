"use server";

import { AuthError } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";
import { APP_LINK_REQ_COOKIE, isAppLinkEnabled, resolveLoginRedirect } from "@/lib/app-link/config";
import { authorizeParamsFor, isAppleLoginEnabled } from "@/lib/apple-login";

// ログイン開始の Server Action。
// 旧実装は client で /api/auth/csrf を fetch してから素の form POST だったため、
// CSRF 取得が完了するまでボタンが描画されず（SSR HTML にボタンが載らない）、取得失敗や
// レースで「押しても無反応」になる構造だった。Server Action なら CSRF はフレームワークが
// 処理し、ボタンは SSR に載り、Next の progressive enhancement で JS 無効でも動作する。
async function startLogin(provider: "google" | "apple") {
  // 戻り先は固定の 2 つだけ（クエリ値は使わない＝オープンリダイレクトを作らない）。
  // アプリ連携が有効で app_link_req Cookie がある時だけ /app-link、それ以外は従来どおり /mypage。
  const redirectTo = isAppLinkEnabled()
    ? resolveLoginRedirect(true, Boolean((await cookies()).get(APP_LINK_REQ_COOKIE)))
    : "/mypage";
  // identity_provider は Apple 有効時だけ付ける（無効時は従来と同一の signIn 呼び出し）。
  // signIn の第 3 引数は Auth.js が authorize URL のクエリへそのまま載せる。
  const authorizationParams = authorizeParamsFor(provider, isAppleLoginEnabled());
  try {
    if (authorizationParams) {
      await signIn("cognito", { redirectTo }, authorizationParams);
    } else {
      await signIn("cognito", { redirectTo });
    }
  } catch (err) {
    // signIn の正常系は NEXT_REDIRECT を throw して Cognito の authorize URL へ遷移する
    // （そのまま伝播させる）。AuthError のみ /login のエラーバナー + 自動リトライ導線へ変換。
    if (err instanceof AuthError) redirect("/login?error=Configuration");
    throw err;
  }
}

export async function loginWithGoogle() {
  await startLogin("google");
}

export async function loginWithApple() {
  // ボタンを出していない時（APPLE_LOGIN_ENABLED 未設定）は、直接叩かれても始めない。
  if (!isAppleLoginEnabled()) redirect("/login");
  await startLogin("apple");
}
