"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const MobileStickyAd = dynamic(() => import("@/components/ads/ad-unit").then(m => ({ default: m.MobileStickyAd })));

const STORAGE_KEY = "tsurispot-mobile-ad-dismissed";

export function SmartMobileStickyAd() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

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
  return <MobileStickyAd />;
}
