"use client";

import Script from "next/script";
import { useAutomationGuard } from "@/lib/use-automation-guard";
import { setAdSenseScriptState } from "@/lib/adsense-script-state";

// AdSense の adsbygoogle.js を、自動化ブラウザ(navigator.webdriver === true)では
// 読み込まないようゲートするローダー。ボット由来の広告リクエスト＝無効トラフィックを
// オリジンで抑止し、AdSense の配信制限リスクを下げる。
// NEXT_PUBLIC_* はビルド時にインライン化されるためクライアント側で参照可能。
//
// onLoad/onError を adsense-script-state に配線し、fallback判定・ブロック計測が
// 「スクリプト自身のライフサイクル」で駆動されるようにする（壁時計での推測は誤判定源）。
// onError = 取得失敗（広告ブロッカー/DNSフィルタ/ネットワーク断の合算）。
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
      onLoad={() => setAdSenseScriptState("loaded")}
      onError={() => setAdSenseScriptState("blocked")}
    />
  );
}
