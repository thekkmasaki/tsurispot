"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useBottomLayer } from "@/components/layout/bottom-layer";

const COOKIE_CONSENT_KEY = "tsurispot-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  // 下部一時UIの排他制御（最優先=100）。表示条件自体は従来のlocalStorage判定のまま
  const canShow = useBottomLayer("cookie", visible);

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

  if (!canShow) return null;

  return (
    // モバイルでは「ボトムナビ(60px+safe-area) + 固定広告(99px) + ✕ボタンのはみ出し(24px) + 分離(16px)」
    // の上に出す = 199px+safe-area。md以上は広告が出ない(ad-unit.tsx の max-width:767px ゲート)ので従来通り最下部。
    // 【この方式を戻さないこと】以前はこのバナー表示中に広告を display:none にしていたが、それだと
    // offsetWidth=0 で adsbygoogle.push({}) が走らず広告リクエストが丸ごと消える（2026-07の53日間の事故）。
    // 隠すのではなく、座標をずらして共存させる。
    // z-40: 一時UI層はナビ(z-50)より上に被せない
    <div className="fixed bottom-[calc(199px+env(safe-area-inset-bottom,0px))] md:bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-3 py-2 shadow-lg md:px-4 md:py-2.5">
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
