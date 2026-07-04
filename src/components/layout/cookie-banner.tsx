"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "tsurispot-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    // Consent Mode v2: 同意で広告・解析ストレージを granted に更新
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "denied");
    // 非EEAは default が granted のため、拒否時は明示的に denied へ update する。
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
        analytics_storage: "denied",
      });
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    // モバイルでは下部ナビ(60px+safe-area)の上に出して遮蔽を防ぐ。md以上は従来通り最下部
    <div className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 py-2 shadow-lg md:px-4 md:py-2.5">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground md:text-sm">
          <span className="hidden sm:inline">当サイトではCookieを使用しています。</span>
          <span className="sm:hidden">Cookie使用に同意しますか？</span>
          <Link prefetch={false}
            href="/privacy"
            className="ml-1 text-primary underline underline-offset-2 hover:text-primary/80"
          >
            詳細
          </Link>
        </p>
        {/* 同意/拒否は同等の視認性のボタンで提示（非対称なダークパターンを避ける）。タップ領域は44px確保 */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleDecline}
            className="min-h-[44px] rounded border border-border bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-accent transition-colors md:px-4 md:py-1.5 md:text-sm"
          >
            拒否
          </button>
          <button
            onClick={handleAccept}
            className="min-h-[44px] rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors md:px-4 md:py-1.5 md:text-sm"
          >
            同意する
          </button>
        </div>
      </div>
    </div>
  );
}
