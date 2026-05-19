"use client";

import { useEffect, useRef, useState } from "react";
import { Waves } from "lucide-react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

/** body[data-no-ads="true"] が付与されていれば広告を抑制（有料店舗ページ等） */
function useAdsSuppressed(): boolean {
  const [suppressed, setSuppressed] = useState(false);
  useEffect(() => {
    if (document.body.getAttribute("data-no-ads") === "true") {
      setSuppressed(true);
    }
    // NoAdsSignal が後からマウントされるケースに備えて監視
    const observer = new MutationObserver(() => {
      setSuppressed(document.body.getAttribute("data-no-ads") === "true");
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-no-ads"] });
    return () => observer.disconnect();
  }, []);
  return suppressed;
}

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
  const suppressed = useAdsSuppressed();

  useEffect(() => {
    if (!ADSENSE_ID || pushed.current || suppressed) return;

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

  if (!ADSENSE_ID || suppressed) return null;

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

// ---- スティッキーサイドバー広告（スクロール追従） ----
export function StickySidebarAd({ className = "" }: { className?: string }) {
  if (!ADSENSE_ID) return null;
  return (
    <div className={`sticky top-20 ${className}`}>
      <AdWrapper variant="sidebar" label={false}>
        <AdUnit slot={SLOTS.display} format="auto" className="min-h-[250px]" />
      </AdWrapper>
    </div>
  );
}

// ---- ヘッダー下リーダーボード広告（PCのみ） ----
export function HeaderBannerAd() {
  if (!ADSENSE_ID) return null;
  return (
    <div className="hidden lg:block border-b border-border/30 bg-muted/10">
      <div className="mx-auto max-w-5xl px-4 py-2">
        <AdUnit slot={SLOTS.display} format="horizontal" responsive />
      </div>
    </div>
  );
}

// ---- 左右固定サイドバナー広告（kabutan.jp式、PCワイド画面のみ） ----
export function SideRailAds() {
  if (!ADSENSE_ID) return null;
  return (
    <>
      {/* 左サイドレール: 1680px以上でのみ表示（コンテンツ1280px+広告160px×2+余白80px） */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-40"
        style={{ left: "max(8px, calc((100vw - 1280px) / 2 - 176px))", display: "var(--side-rail-display, none)" }}
      >
        <div className="w-[160px]">
          <AdUnit
            slot={SLOTS.display}
            format="vertical"
            style={{ display: "block", width: "160px", minHeight: "600px" }}
            responsive={false}
          />
        </div>
      </div>
      {/* 右サイドレール */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-40"
        style={{ right: "max(8px, calc((100vw - 1280px) / 2 - 176px))", display: "var(--side-rail-display, none)" }}
      >
        <div className="w-[160px]">
          <AdUnit
            slot={SLOTS.display}
            format="vertical"
            style={{ display: "block", width: "160px", minHeight: "600px" }}
            responsive={false}
          />
        </div>
      </div>
      {/* 1680px未満ではサイドレール非表示 */}
      <style>{`
        :root { --side-rail-display: none; }
        @media (min-width: 1680px) { :root { --side-rail-display: block; } }
      `}</style>
    </>
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

// ---- モバイル固定フッター広告（kabutan.jp式、MobileNav上部に固定） ----
export function MobileStickyAd() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!ADSENSE_ID) return;
    // 1秒後に表示（viewability を稼ぐため遅延を短縮、 AdSense ポリシー的に即時もOKだが UX 重視で 1s）
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!ADSENSE_ID || dismissed || !visible) return null;

  return (
    <div
      className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden border-t border-border/30 bg-background/95 backdrop-blur-sm"
    >
      <div className="relative px-2 py-1">
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-5 right-2 z-50 flex size-5 items-center justify-center rounded-full bg-muted/90 text-[10px] text-muted-foreground shadow-sm"
          aria-label="広告を閉じる"
        >
          ✕
        </button>
        <AdUnit
          slot={SLOTS.display}
          format="horizontal"
          style={{ display: "block", width: "100%", height: "90px" }}
          responsive
        />
      </div>
    </div>
  );
}

// ---- モバイルヘッダーバナー広告（モバイルのみ表示） ----
export function MobileHeaderBannerAd() {
  if (!ADSENSE_ID) return null;
  return (
    <div className="md:hidden border-b border-border/20 bg-muted/5">
      <div className="mx-auto max-w-lg px-2 py-1">
        <AdUnit
          slot={SLOTS.display}
          format="horizontal"
          style={{ display: "block", width: "100%", height: "50px" }}
          responsive
        />
      </div>
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
      {isVisible ? (children || <InArticleAd />) : <div className="min-h-[250px]" />}
    </div>
  );
}
