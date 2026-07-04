"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useBottomAdSuspended } from "@/components/layout/bottom-layer";
const MobileStickyAd = dynamic(() => import("@/components/ads/ad-unit").then(m => ({ default: m.MobileStickyAd })));

const STORAGE_KEY = "tsurispot-mobile-ad-dismissed";

export function SmartMobileStickyAd() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  // 一時UI（Cookie/比較/位置情報/PWA）表示中は広告をサスペンド。
  // dismissedとは別の一時非表示で、広告の上にコンテンツが被さる状態（AdSenseポリシー違反リスク）を根絶する
  const suspended = useBottomAdSuspended();

  useEffect(() => {
    setMounted(true);
    if (typeof sessionStorage !== "undefined") {
      setDismissed(sessionStorage.getItem(STORAGE_KEY) === "1");
    }
  }, []);

  useEffect(() => {
    if (!mounted || dismissed) return;
    const observer = new MutationObserver(() => {
      const adEl = document.querySelector('[data-ad-slot="mobile-sticky"]');
      if (adEl) {
        const parent = adEl.closest('[style*="display: none"]');
        if (parent) {
          sessionStorage.setItem(STORAGE_KEY, "1");
          setDismissed(true);
        }
      }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [mounted, dismissed]);

  if (dismissed) return null;
  return <MobileStickyAd suspended={suspended} />;
}
