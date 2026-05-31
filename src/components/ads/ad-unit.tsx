"use client";

import { useEffect, useRef, useState } from "react";
import { Waves } from "lucide-react";
import { trackAdEvent } from "@/lib/ads-tracking";
import { AD_SLOTS } from "@/lib/ads-config";

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

// ---- 基本AdSenseユニット ----
interface AdUnitProps {
  slot?: string;
  /** 広告枠の論理名。指定すると GA4 へ impression/viewability を送信する（計測対象になる） */
  placement?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle" | "fluid" | "autorelaxed";
  layout?: string;
  layoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

export function AdUnit({
  slot,
  placement,
  format = "auto",
  layout,
  layoutKey,
  className = "",
  style,
  responsive = true,
}: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const viewed = useRef(false);
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
          // 広告リクエストが出た＝impression として placement 別に計測。
          // （フィルされない場合もあるが placement 間の相対比較には有効）
          if (placement) trackAdEvent({ placement, slot, event: "ad_impression" });
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
    // 広告は初回マウント時に1回だけ push する設計のため依存配列は空に固定する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // viewability 計測: 枠の50%以上が連続1秒見えたら ad_viewable を1回送信（MRC基準準拠）。
  // LazyAd の IntersectionObserver と同じパターン。placement 未指定の枠は計測しない。
  useEffect(() => {
    if (!ADSENSE_ID || suppressed || !placement) return;
    const el = containerRef.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (viewed.current) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!timer) {
            timer = setTimeout(() => {
              viewed.current = true;
              trackAdEvent({ placement, slot, event: "ad_viewable" });
              io.disconnect();
            }, 1000);
          }
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5, 1] }
    );
    io.observe(el);

    return () => {
      if (timer) clearTimeout(timer);
      io.disconnect();
    };
  }, [placement, slot, suppressed]);

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
      {/* CLS対策: lazyOnloadで遅延挿入される広告が下のコンテンツを押し下げないよう
          最小高さを予約する（SidebarAd/DisplayAd と同じ250px基準）。 */}
      <AdUnit
        slot={AD_SLOTS.in_article}
        placement="in_article"
        format="fluid"
        layout="in-article"
        className="min-h-[250px]"
        style={{ display: "block", textAlign: "center" }}
      />
    </AdWrapper>
  );
}

// ---- ディスプレイ広告（レスポンシブ） ----
export function DisplayAd({ className = "" }: { className?: string }) {
  return (
    <AdWrapper className={`my-6 ${className}`}>
      <AdUnit slot={AD_SLOTS.display} format="auto" placement="display" />
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
        <AdUnit slot={AD_SLOTS.native_break} format="auto" placement="native_break" />
      </div>
    </div>
  );
}

// ---- Multiplex広告（関連コンテンツ風グリッド、フッター前に最適） ----
export function MultiplexAd({ className = "", placement = "multiplex" }: { className?: string; placement?: "multiplex" | "pre_footer" }) {
  return (
    <AdUnit
      slot={placement === "pre_footer" ? AD_SLOTS.pre_footer : AD_SLOTS.multiplex}
      placement={placement}
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
        <MultiplexAd placement="pre_footer" />
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
          slot={AD_SLOTS.sidebar}
          placement="sidebar"
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
        <AdUnit slot={AD_SLOTS.sidebar_sticky} placement="sidebar_sticky" format="auto" className="min-h-[250px]" />
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
        <AdUnit slot={AD_SLOTS.header_banner} placement="header_banner" format="horizontal" responsive />
      </div>
    </div>
  );
}

// ---- 左右固定サイドバナー広告（kabutan.jp式、PCワイド画面のみ） ----
export function SideRailAds() {
  const [wide, setWide] = useState(false);

  // CSS の display 制御だとコンポーネントは常時マウントされ、各 AdUnit が
  // ResizeObserver を張ってしまう。matchMedia でゲートして 1680px 未満では
  // DOM 自体を出さず、observer 生成・AdSense push も発生させない。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1680px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!ADSENSE_ID || !wide) return null;

  return (
    <>
      {/* 左サイドレール: 1680px以上でのみ表示（コンテンツ1280px+広告160px×2+余白80px） */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-40"
        style={{ left: "max(8px, calc((100vw - 1280px) / 2 - 176px))" }}
      >
        <div className="w-[160px]">
          <AdUnit
            slot={AD_SLOTS.side_rail}
            placement="side_rail_left"
            format="vertical"
            style={{ display: "block", width: "160px", minHeight: "600px" }}
            responsive={false}
          />
        </div>
      </div>
      {/* 右サイドレール */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-40"
        style={{ right: "max(8px, calc((100vw - 1280px) / 2 - 176px))" }}
      >
        <div className="w-[160px]">
          <AdUnit
            slot={AD_SLOTS.side_rail}
            placement="side_rail_right"
            format="vertical"
            style={{ display: "block", width: "160px", minHeight: "600px" }}
            responsive={false}
          />
        </div>
      </div>
    </>
  );
}

// ---- リスト間広告（カードリスト内に挿入） ----
export function InFeedAd({ className = "" }: { className?: string }) {
  return (
    // CLS対策: スポット一覧グリッド(col-span-full)に遅延挿入されても
    // カード列を押し下げないよう最小高さを予約する。
    <AdUnit
      slot={AD_SLOTS.in_feed}
      placement="in_feed"
      format="fluid"
      layoutKey="-6t+ed+2i-1n-4w"
      className={`my-4 min-h-[250px] ${className}`}
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
        <AdUnit slot={AD_SLOTS.parallel} placement="parallel" format="rectangle" style={{ display: "block", width: "100%", height: "250px" }} />
        <AdUnit slot={AD_SLOTS.parallel} placement="parallel" format="rectangle" style={{ display: "block", width: "100%", height: "250px" }} />
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
          slot={AD_SLOTS.mobile_sticky}
          placement="mobile_sticky"
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
          slot={AD_SLOTS.mobile_header_banner}
          placement="mobile_header_banner"
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
