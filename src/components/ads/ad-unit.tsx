"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

// ---- 基本AdSenseユニット ----
interface AdUnitProps {
  slot?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle" | "fluid" | "autorelaxed";
  layoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

export function AdUnit({
  slot,
  format = "auto",
  layoutKey,
  className = "",
  style,
  responsive = true,
}: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ID) return;
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded
    }
  }, []);

  if (!ADSENSE_ID) return null;

  return (
    <div className={`ad-container flex justify-center ${className}`}>
      <ins
        className="adsbygoogle"
        style={style || { display: "block" }}
        data-ad-client={ADSENSE_ID}
        {...(slot && { "data-ad-slot": slot })}
        data-ad-format={format}
        {...(layoutKey && { "data-ad-layout-key": layoutKey })}
        {...(responsive && { "data-full-width-responsive": "true" })}
        ref={adRef}
      />
    </div>
  );
}

// ---- 記事内広告（コンテンツのセクション間） ----
export function InArticleAd({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      format="fluid"
      layoutKey="-gw-3+1f-3d+2z"
      className={`my-8 ${className}`}
      style={{ display: "block", textAlign: "center" }}
    />
  );
}

// ---- ディスプレイ広告（レスポンシブ） ----
export function DisplayAd({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      format="auto"
      className={`my-6 ${className}`}
    />
  );
}

// ---- Multiplex広告（関連コンテンツ風グリッド、フッター前に最適） ----
export function MultiplexAd({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      format="autorelaxed"
      className={`my-8 ${className}`}
    />
  );
}

// ---- アンカー広告（モバイル下部固定） ----
// AdSense Auto Adsが自動で出すため、手動実装は不要
// → AdSense管理画面で「アンカー広告」をONにするだけ

// ---- フッター前広告（全ページ共通） ----
export function PreFooterAd() {
  if (!ADSENSE_ID) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="rounded-xl bg-gray-50 p-4">
        <MultiplexAd />
      </div>
    </div>
  );
}

// ---- サイドバー広告（デスクトップのみ、sticky） ----
export function SidebarAd({ className = "" }: { className?: string }) {
  return (
    <div className={`hidden lg:block ${className}`}>
      <div className="sticky top-24">
        <AdUnit
          format="vertical"
          className="min-h-[250px]"
          style={{ display: "block", minWidth: "160px" }}
        />
      </div>
    </div>
  );
}

// ---- リスト間広告（カードリスト内に挿入） ----
export function InFeedAd({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      format="fluid"
      layoutKey="-6t+ed+2i-1n-4w"
      className={`my-4 ${className}`}
      style={{ display: "block" }}
    />
  );
}

// ---- パラレル広告（PC: 横並び2枠） ----
export function ParallelAds({ className = "" }: { className?: string }) {
  if (!ADSENSE_ID) return null;
  return (
    <div className={`my-8 grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
      <AdUnit format="rectangle" style={{ display: "block", width: "100%", height: "250px" }} />
      <AdUnit format="rectangle" style={{ display: "block", width: "100%", height: "250px" }} />
    </div>
  );
}

// ---- 遅延ロード広告（スクロールして画面に入ったら読み込み） ----
export function LazyAd({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (children || <InArticleAd />) : <div className="min-h-[100px]" />}
    </div>
  );
}
