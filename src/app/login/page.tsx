"use client";

import { Fish, Loader2, AlertTriangle, ExternalLink, Info } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "ログイン処理の途中で問題が発生しました。お手数ですが、もう一度お試しください。",
  AccessDenied: "アクセスが拒否されました。もう一度お試しください。",
  Verification: "認証に失敗しました。もう一度お試しください。",
  OAuthSignin: "認証プロバイダーへの接続でエラーが発生しました。",
  OAuthCallback: "認証コールバックでエラーが発生しました。",
  OAuthCreateAccount: "アカウント作成中にエラーが発生しました。",
  EmailCreateAccount: "アカウント作成中にエラーが発生しました。",
  Callback: "コールバック処理でエラーが発生しました。",
  OAuthAccountNotLinked: "このメールアドレスは別の方法で既に登録されています。",
  EmailSignin: "メール送信でエラーが発生しました。",
  CredentialsSignin: "ログイン情報が正しくありません。",
  SessionRequired: "ログインが必要です。",
  MissingCSRF: "セッションが切れました。ページを再読み込みしてください。",
  Default: "エラーが発生しました。もう一度お試しください。",
};

function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!error) return;
    setShown(true);
    // URL から error クエリだけ除去 (履歴を汚さず replace)
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const newQuery = params.toString();
    router.replace(newQuery ? `/login?${newQuery}` : "/login", { scroll: false });
  }, [error, router, searchParams]);

  if (!shown || !error) return null;
  const message = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default;
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p className="text-amber-900">{message}</p>
      </div>
    </div>
  );
}

type LoadingState = null | "google" | "apple";

function detectInAppBrowser(): { inApp: boolean; appName: string | null } {
  if (typeof navigator === "undefined") return { inApp: false, appName: null };
  const ua = navigator.userAgent;
  if (/Line\/[\d.]+/i.test(ua)) return { inApp: true, appName: "LINE" };
  if (/FBAN|FBAV/i.test(ua)) return { inApp: true, appName: "Facebook" };
  if (/Instagram/i.test(ua)) return { inApp: true, appName: "Instagram" };
  if (/Twitter/i.test(ua)) return { inApp: true, appName: "X (Twitter)" };
  // iOS WKWebView の単純検知 (Safari の標準は Safari/ 含む、内蔵 WebView は含まない)
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari/.test(ua) && !/CriOS|FxiOS/.test(ua)) {
    return { inApp: true, appName: "アプリ内ブラウザ" };
  }
  return { inApp: false, appName: null };
}

export default function LoginPage() {
  const [loading, setLoading] = useState<LoadingState>(null);
  const [inAppBrowser, setInAppBrowser] = useState<{
    inApp: boolean;
    appName: string | null;
  }>({ inApp: false, appName: null });
  const [copied, setCopied] = useState(false);
  // null = まだ取得中, "" = 取得失敗, string = 取得済み。null 中は form をレンダリングしない
  // ことで「1 回目押下で csrfToken="" が submit される」race condition を構造的に排除。
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const detected = detectInAppBrowser();
    setInAppBrowser(detected);
    if (
      detected.appName === "LINE" &&
      typeof window !== "undefined" &&
      !window.location.search.includes("openExternalBrowser=1")
    ) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("openExternalBrowser", "1");
      window.history.replaceState({}, "", newUrl.toString());
    }
    // CSRF token をページロード時に取得して JSX hidden input に持たせる。
    // これで click 時のレース状態を完全排除し、1 回押下で確実に動く。
    fetch("/api/auth/csrf", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d: { csrfToken: string }) => setCsrfToken(d.csrfToken))
      .catch(() => {});
  }, []);

  const handleOpenInSafari = async () => {
    const targetUrl = "https://tsurispot.com/login?openExternalBrowser=1";
    if (inAppBrowser.appName === "LINE") {
      // LINE: openExternalBrowser=1 で外部Safari にジャンプする
      window.location.href = targetUrl;
      return;
    }
    // 他のアプリ内ブラウザは URL コピーで手動 Safari 起動を促す
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(targetUrl);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  // JSX で <form> + hidden input + submit ボタン構成。
  // client JS の動的 form 作成や fetch を click 後に行わないので race condition なし。
  // CSRF token は useEffect で取得して state に保持、button は token 未取得中は disabled。
  const handleSubmitClick = (provider: "google" | "apple") => {
    setLoading(provider);
    // form は default action で submit される。loading state だけ管理。
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-mid to-ocean-deep text-white">
              <Fish className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="bg-gradient-to-r from-ocean-deep to-ocean-mid bg-clip-text text-lg font-bold text-transparent font-[family-name:var(--font-zen-maru)]">
              ツリスポ
            </span>
          </div>
          <h1 className="mt-3 text-xl font-bold">ログイン</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            お気に入りや釣果をクラウドに保存
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginErrorBanner />
        </Suspense>

        {inAppBrowser.inApp && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
            <div className="mb-3 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              <div>
                <p className="font-medium text-amber-900">
                  {inAppBrowser.appName} のアプリ内ブラウザではログインできません
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Google のセキュリティポリシーにより、{inAppBrowser.appName}
                  だけでなくInstagram・X・Slack 等、すべてのアプリ内ブラウザで
                  ログインが拒否されます。Safari で開き直してください。
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenInSafari}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700"
            >
              <ExternalLink className="h-4 w-4" />
              {inAppBrowser.appName === "LINE"
                ? "Safari で開く"
                : copied
                  ? "URLコピー済 → Safariに貼り付け"
                  : "URL をコピーして Safari で開く"}
            </button>

            {inAppBrowser.appName !== "LINE" && (
              <div className="mt-3 space-y-1 text-xs text-amber-800">
                <p className="font-medium">手動の場合</p>
                <ol className="list-decimal pl-5">
                  <li>画面の「⋯」または「↗」メニューを開く</li>
                  <li>「Safariで開く」「他のブラウザで開く」を選択</li>
                </ol>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {csrfToken === null ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
              準備中...
            </div>
          ) : (
          <>
          <form method="POST" action="/api/auth/signin/cognito" onSubmit={() => handleSubmitClick("google")}>
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="callbackUrl" value="https://tsurispot.com/mypage" />
            <input type="hidden" name="identity_provider" value="Google" />
          <button
            type="submit"
            disabled={loading !== null}
            aria-busy={loading === "google"}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "google" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Googleに接続中...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </>
            )}
          </button>
          </form>

          <form method="POST" action="/api/auth/signin/cognito" onSubmit={() => handleSubmitClick("apple")}>
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="callbackUrl" value="https://tsurispot.com/mypage" />
            <input type="hidden" name="identity_provider" value="SignInWithApple" />
          <button
            type="submit"
            disabled={loading !== null}
            aria-busy={loading === "apple"}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "apple" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                Appleに接続中...
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Appleでサインイン
              </>
            )}
          </button>
          </form>
          </>
          )}

          {loading && (
            <p className="text-center text-xs text-muted-foreground">
              認証ページへ遷移中です。少しお待ちください...
            </p>
          )}
        </div>

        <div className="space-y-2 text-center text-xs text-muted-foreground">
          <p>ログインしなくても全機能を利用できます</p>
          <p>
            ログインすると、お気に入りや釣果データを
            <br />
            別の端末でも引き継げるようになります
          </p>
          <p>
            ログインにより
            <Link href="/privacy" className="underline hover:text-foreground">
              プライバシーポリシー
            </Link>
            に同意したものとみなします
          </p>
        </div>
      </div>
    </div>
  );
}
