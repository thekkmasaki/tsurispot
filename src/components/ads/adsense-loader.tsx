"use client";

import Script from "next/script";
import { useAutomationGuard } from "@/lib/use-automation-guard";

// AdSense の adsbygoogle.js を、自動化ブラウザ(navigator.webdriver === true)では
// 読み込まないようゲートするローダー。ボット由来の広告リクエスト＝無効トラフィックを
// オリジンで抑止し、AdSense の配信制限リスクを下げる。
// NEXT_PUBLIC_* はビルド時にインライン化されるためクライアント側で参照可能。
export function AdSenseLoader() {
  const allowed = useAutomationGuard();
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  if (!allowed || !adsenseId) return null;

  return (
    // lazyOnload で初回ロードのレンダリングブロックを回避（CLS/LCP優先）。
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      strategy="lazyOnload"
      crossOrigin="anonymous"
    />
  );
}
