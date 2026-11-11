import { isAppleLoginEnabled } from "@/lib/apple-login";
import LoginClient from "./login-client";

// APPLE_LOGIN_ENABLED は App Runner の実行時環境変数なので、ビルド時に固定しないよう毎回描画する。
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return <LoginClient appleEnabled={isAppleLoginEnabled()} />;
}
