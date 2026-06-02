"use client";

import {
  Fish,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Info,
  Cloud,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
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

  // ─── 初回ログイン失敗(error=Configuration)のワンショット自動リトライ保険 ───
  // 1回目は Google アカウント選択を挟む遅い経路で OAuth の pkce check に失敗し
  // `?error=Configuration` で戻ることがある(2回目は Cognito 即SSOで通る)。ユーザーに
  // 「2回押し」をさせず、初回失敗を検知したら1度だけ自動で同じプロバイダを再送する。
  const [autoRetrying, setAutoRetrying] = useState(false);
  const googleFormRef = useRef<HTMLFormElement>(null);
  const appleFormRef = useRef<HTMLFormElement>(null);
  const autoSubmittedRef = useRef(false);
  // 初回レンダー時点の error クエリを同期捕捉(LoginErrorBanner が URL から消す前に確保)
  const [initialError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("error");
  });

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
      // 取得失敗時は "" をセットしてエラー表示へ。null のままだと「準備中…」が永久ループする。
      .catch(() => setCsrfToken(""));
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
    // 自動リトライ保険のため「どのプロバイダを・いつ」試したかを記録(失敗して戻ってきた時に使う)。
    try {
      sessionStorage.setItem("login_provider", provider);
      sessionStorage.setItem("login_attempt_ts", String(Date.now()));
    } catch {
      /* sessionStorage 不可環境では保険なしで通常動作 */
    }
    // form は default action で submit される。loading state だけ管理。
  };

  // 1) 失敗検知: ?error=Configuration で戻り、かつ直近(60秒以内)に自分が試したプロバイダが
  //    分かっていて、まだ自動リトライしていなければ、1回だけ自動リトライを発火する。
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // エラー無しで /login に来たら、次回のために保険を再武装(フラグ解除)
      if (initialError !== "Configuration") {
        sessionStorage.removeItem("login_autoretry_done");
        return;
      }
      // すでに1回自動リトライ済み → これ以上は自動で繰り返さない(ループ防止・バナー表示に委ねる)
      if (sessionStorage.getItem("login_autoretry_done") === "1") return;
      const provider = sessionStorage.getItem("login_provider");
      const ts = Number(sessionStorage.getItem("login_attempt_ts") || 0);
      if (provider !== "google" && provider !== "apple") return;
      if (!(Date.now() - ts < 60_000)) return; // 古いリンク踏み等での誤発火を防ぐ
      sessionStorage.setItem("login_autoretry_done", "1");
      setLoading(provider);
      setAutoRetrying(true);
    } catch {
      /* sessionStorage 不可環境では何もしない */
    }
  }, [initialError]);

  // 2) 実行: csrfToken が揃って form がレンダーされたら、該当プロバイダの form を1度だけ自動 submit。
  useEffect(() => {
    if (!autoRetrying || autoSubmittedRef.current) return;
    if (typeof csrfToken !== "string" || csrfToken === "") return; // form 未レンダー中は待つ
    const provider =
      typeof window !== "undefined" ? sessionStorage.getItem("login_provider") : null;
    const form = provider === "apple" ? appleFormRef.current : googleFormRef.current;
    if (!form) return;
    autoSubmittedRef.current = true;
    form.requestSubmit();
  }, [autoRetrying, csrfToken]);

  return (
    <div className="relative flex min-h-[78vh] items-center justify-center overflow-hidden px-4 py-10 sm:py-14">
      {/* ── 夜明けの海: 背景アトモスフィア ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-sea-foam/30 blur-3xl" />
        <div className="absolute right-[-4rem] top-1/3 h-80 w-80 rounded-full bg-ocean-mid/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-sand-warm/40 blur-3xl" />
      </div>

      <div className="ts-rise w-full max-w-md">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 shadow-[0_24px_70px_-24px_rgba(12,46,74,0.45)] backdrop-blur-xl">
          {/* ── ヒーロー（深い海＋発光する魚エンブレム） ── */}
          <div className="relative isolate overflow-hidden bg-gradient-to-br from-ocean-deep via-ocean-mid to-ocean-deep px-8 pb-12 pt-10 text-center">
            <div aria-hidden="true" className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/3 rounded-full bg-sea-foam/40 blur-2xl" />
            </div>
            <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-70">
              <span className="absolute left-7 top-9 h-1.5 w-1.5 rounded-full bg-white/40" />
              <span className="absolute right-10 top-12 h-1 w-1 rounded-full bg-white/30" />
              <span className="absolute bottom-16 right-16 h-2 w-2 rounded-full bg-white/20" />
              <span className="absolute bottom-14 left-12 h-1 w-1 rounded-full bg-white/30" />
            </div>
            <div className="ts-float mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/30 bg-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-white/20 backdrop-blur-sm">
              <Fish className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <p className="mt-4 text-2xl font-bold tracking-wide text-white font-[family-name:var(--font-zen-maru)]">
              ツリスポ
            </p>
            <p className="mt-1.5 text-sm text-sea-foam/90">
              お気に入りや釣果を、ひとつの海へ
            </p>
            <svg
              className="absolute inset-x-0 bottom-0 h-5 w-full text-white/85"
              viewBox="0 0 400 24"
              preserveAspectRatio="none"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M0,13 C70,26 150,2 230,11 C310,20 360,7 400,13 L400,24 L0,24 Z" />
            </svg>
          </div>

          {/* ── 本体 ── */}
          <div className="px-6 pb-7 pt-6 sm:px-8">
            <div className="mb-5 text-center">
              <h1 className="text-lg font-bold text-foreground">ログイン</h1>
              <p className="mt-1 text-xs text-muted-foreground">数秒で完了・ずっと無料</p>
            </div>

            <div className="space-y-4">

        {/* 自動リトライ中はエラー文を見せず、そのまま再ログインへ流す */}
        {!autoRetrying && (
          <Suspense fallback={null}>
            <LoginErrorBanner />
          </Suspense>
        )}
        {autoRetrying && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-ocean-mid/20 bg-ocean-mid/5 p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ログインを再開しています...
          </div>
        )}

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
          ) : csrfToken === "" ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-destructive">
                読み込みに失敗しました。通信環境を確認して再読み込みしてください。
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                再読み込み
              </button>
            </div>
          ) : (
          <>
          <form ref={googleFormRef} method="POST" action="/api/auth/signin/cognito" onSubmit={() => handleSubmitClick("google")}>
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="callbackUrl" value="https://tsurispot.com/mypage" />
            <input type="hidden" name="identity_provider" value="Google" />
          <button
            type="submit"
            disabled={loading !== null}
            aria-busy={loading === "google"}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-black/[0.08] bg-white px-5 py-3.5 text-[15px] font-semibold text-gray-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-black/15 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-mid/50 focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
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

          <form ref={appleFormRef} method="POST" action="/api/auth/signin/cognito" onSubmit={() => handleSubmitClick("apple")}>
            <input type="hidden" name="csrfToken" value={csrfToken} />
            <input type="hidden" name="callbackUrl" value="https://tsurispot.com/mypage" />
            <input type="hidden" name="identity_provider" value="SignInWithApple" />
          <button
            type="submit"
            disabled={loading !== null}
            aria-busy={loading === "apple"}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-zinc-800 to-black px-5 py-3.5 text-[15px] font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
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
            {/* /space-y-3 */}
          </div>
          {/* /space-y-4 */}

            {/* 信頼シグナル */}
            <div className="mt-6 grid grid-cols-3 gap-1 border-t border-border/60 pt-5 text-center">
              <div className="flex flex-col items-center gap-1.5">
                <Cloud className="h-4 w-4 text-ocean-mid" aria-hidden="true" />
                <span className="text-[11px] text-muted-foreground">クラウド保存</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-ocean-mid" aria-hidden="true" />
                <span className="text-[11px] text-muted-foreground">端末間で同期</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-ocean-mid" aria-hidden="true" />
                <span className="text-[11px] text-muted-foreground">無料・安全</span>
              </div>
            </div>

            <div className="mt-5 space-y-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
              <p>ログインしなくても全機能を利用できます</p>
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
      </div>

      <style>{`
        @keyframes tsRise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: none; }
        }
        .ts-rise { animation: tsRise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes tsFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .ts-float { animation: tsFloat 4.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ts-rise, .ts-float { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
