"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/lib/auth";

// ログイン開始の Server Action。
// 旧実装は client で /api/auth/csrf を fetch してから素の form POST だったため、
// CSRF 取得が完了するまでボタンが描画されず（SSR HTML にボタンが載らない）、取得失敗や
// レースで「押しても無反応」になる構造だった。Server Action なら CSRF はフレームワークが
// 処理し、ボタンは SSR に載り、Next の progressive enhancement で JS 無効でも動作する。
export async function loginWithGoogle() {
  try {
    await signIn("cognito", { redirectTo: "/mypage" });
  } catch (err) {
    // signIn の正常系は NEXT_REDIRECT を throw して Cognito の authorize URL へ遷移する
    // （そのまま伝播させる）。AuthError のみ /login のエラーバナー + 自動リトライ導線へ変換。
    if (err instanceof AuthError) redirect("/login?error=Configuration");
    throw err;
  }
}
