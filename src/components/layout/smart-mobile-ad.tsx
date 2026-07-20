"use client";
import dynamic from "next/dynamic";
import { useBottomAdSuspended } from "@/components/layout/bottom-layer";
const MobileStickyAd = dynamic(() => import("@/components/ads/ad-unit").then(m => ({ default: m.MobileStickyAd })));

export function SmartMobileStickyAd() {
  // 一時UI（Cookie/比較/位置情報/PWA）表示中は広告をサスペンド。
  // 広告の上にコンテンツが被さる状態（AdSenseポリシー違反リスク）を根絶する。
  //
  // 旧実装の「未充足広告の自動折り畳み検知」(document全域の MutationObserver +
  // sessionStorage 恒久 dismiss)は撤去した:
  // - セレクタ [data-ad-slot="mobile-sticky"] がリテラル文字列で実際の数値スロットIDと
  //   一致せず一度も発火しない dead code だった
  // - 未フィル折り畳みは MobileStickyAd 自身が containerRef 配下の <ins> の
  //   data-ad-status を監視して一時的に隠す方式に置換（恒久 dismiss は後続PVの
  //   imp 機会を失うため廃止）
  const suspended = useBottomAdSuspended();
  return <MobileStickyAd suspended={suspended} />;
}
