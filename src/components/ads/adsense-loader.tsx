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
    // afterInteractive でハイドレーション直後に読込。next/script が body 末尾へ注入するため
    // 非ブロックで、全広告枠が min-h-[250px] で領域予約済のため CLS は不変。
    // lazyOnload（window load 後 + idle）だと ATF 枠の描画が着地直帰 PV に間に合わず、
    // 広告が出ずに終わる＋視認率が下がるため、fill と視認を早める狙い。
    // eager push（ad-unit 側）は一切変えないので #253（per-ad push 遅延で収益半減）とは別軸で安全。
    <Script
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      onLoad={() => setAdSenseScriptState("loaded")}
      onError={() => setAdSenseScriptState("blocked")}
    />
  );
}
