"use client";

import { useEffect, useRef, useState } from "react";
import { Waves } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

// ---- AdSense スロットID ----
const SLOTS = {
  display: "9949278874",
  multiplex: "8230049272",
  inArticle: "4852864864",
} as const;

// ---- 基本AdSenseユニット ----
interface AdUnitProps {
  slot?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle" | "fluid" | "autorelaxed";
  layout?: string;
  layoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

export function AdUnit({
  slot,
  format = "auto",
  layout,
  layoutKey,
  className = "",
  style,
  responsive = true,
}: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_ID || pushed.current) return;

    const el = containerRef.current;
    if (!el) return;

    const tryPush = () => {
      if (pushed.current) return true;
      if (el.offsetWidth > 0) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        } catch {
          // AdSense not loaded
        }
        return true;
      }
      return false;
    };

    // 即座に幅があれば実行
    if (tryPush()) return;

    // 幅0の場合はResizeObserverで待つ
    const observer = new ResizeObserver(() => {
      if (tryPush()) observer.disconnect();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  if (!ADSENSE_ID) return null;

  return (
    <div ref={containerRef} className={`ad-container w-full ${className}`}>
      <ins
        className="adsbygoogle"
        style={style || { display: "block", width: "100%" }}
        data-ad-client={ADSENSE_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        {...(layout && { "data-ad-layout": layout })}
        {...(layoutKey && { "data-ad-layout-key": layoutKey })}
        {...(responsive && { "data-full-width-responsive": "true" })}
      />
    </div>
  );
}

// ---- 広告ラベル付きラッパー（3バリアント） ----
type AdVariant = "default" | "sidebar" | "minimal";

const AD_WRAPPER_STYLES: Record<AdVariant, string> = {
  default: "rounded-2xl border border-border/50 bg-card/60 p-3 sm:p-4 shadow-sm shadow-ocean-deep/[0.03]",
  sidebar: "rounded-xl border border-border/40 bg-muted/20 p-3",
  minimal: "py-2",
};

function AdWrapper({
  children,
  className = "",
  label = true,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  label?: boolean;
  variant?: AdVariant;
}) {
  if (!ADSENSE_ID) return null;
  return (
    <div className={`relative ${AD_WRAPPER_STYLES[variant]} ${className}`}>
      {label && (
        <div className="mb-2 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-[10px] font-medium tracking-widest text-muted-foreground/40">スポンサー</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
        </div>
      )}
      {children}
    </div>
  );
}

// ---- 記事内広告（コンテンツのセクション間） ----
export function InArticleAd({ className = "" }: { className?: string }) {
  return (
    <AdWrapper className={`my-8 ${className}`}>
      <AdUnit
        slot={SLOTS.inArticle}
        format="fluid"
        layout="in-article"
        style={{ display: "block", textAlign: "center" }}
      />
    </AdWrapper>
  );
}

// ---- ディスプレイ広告（レスポンシブ） ----
export function DisplayAd({ className = "" }: { className?: string }) {
  return (
    <AdWrapper className={`my-6 ${className}`}>
      <AdUnit slot={SLOTS.display} format="auto" />
    </AdWrapper>
  );
}

// ---- セクション間ネイティブ広告（波デザインでサイトに馴染む） ----
export function NativeAdBreak({ className = "" }: { className?: string }) {
  if (!ADSENSE_ID) return null;
  return (
    <div className={`mx-auto max-w-4xl px-4 py-10 ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ocean-mid/20 to-transparent" />
        <Waves className="size-4 text-ocean-mid/30" />
        <span className="text-[10px] font-medium tracking-widest text-muted-foreground/40">おすすめ</span>
        <Waves className="size-4 text-ocean-mid/30" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-ocean-mid/20 to-transparent" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 p-3 sm:p-5 shadow-sm shadow-ocean-deep/[0.03]">
        <AdUnit slot={SLOTS.display} format="auto" />
      </div>
    </div>
  );
}

// ---- Multiplex広告（関連コンテンツ風グリッド、フッター前に最適） ----
export function MultiplexAd({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={SLOTS.multiplex}
      format="autorelaxed"
      className={`my-8 ${className}`}
    />
  );
}

// ---- アンカー広告（モバイル下部固定） ----
// AdSense Auto Adsが自動で出すため、手動実装は不要
// → AdSense管理画面で「ページ内フォーマット」をONにする
// → 「オーバーレイ フォーマット」のアンカー広告はOFF推奨（UXが悪い）

// ---- フッター前広告（全ページ共通） ----
export function PreFooterAd() {
  if (!ADSENSE_ID) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-[10px] font-medium tracking-widest text-muted-foreground/40 uppercase">おすすめ</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-6 shadow-sm shadow-ocean-deep/[0.03]" style={{ minWidth: "300px" }}>
        <MultiplexAd />
      </div>
    </div>
  );
}

// ---- サイドバー広告（デスクトップのみ、スポット詳細sidebar内に配置） ----
export function SidebarAd({ className = "" }: { className?: string }) {
  if (!ADSENSE_ID) return null;
  return (
    <div className={className}>
      <AdWrapper variant="sidebar" label={false}>
        <AdUnit
          slot={SLOTS.display}
          format="auto"
          className="min-h-[250px]"
        />
      </AdWrapper>
    </div>
  );
}

// ---- リスト間広告（カードリスト内に挿入） ----
export function InFeedAd({ className = "" }: { className?: string }) {
  return (
    <AdUnit
      slot={SLOTS.display}
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
    <AdWrapper className={`my-8 ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AdUnit slot={SLOTS.display} format="rectangle" style={{ display: "block", width: "100%", height: "250px" }} />
        <AdUnit slot={SLOTS.display} format="rectangle" style={{ display: "block", width: "100%", height: "250px" }} />
      </div>
    </AdWrapper>
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
