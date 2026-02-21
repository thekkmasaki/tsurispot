"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdUnit({ slot, format = "auto", className = "" }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded
    }
  }, []);

  return (
    <div className={`ad-container my-6 flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8121234270035600"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        ref={adRef}
      />
    </div>
  );
}

// 記事中の自然な広告（コンテンツとの間に挿入）
export function InArticleAd({ className = "" }: { className?: string }) {
  return <AdUnit slot="auto" format="auto" className={className} />;
}
