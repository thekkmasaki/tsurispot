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

// 広告ラベル文言（全広告枠で統一。「おすすめ」等の曖昧な表現は誤認を招くため禁止）
const AD_LABEL = "スポンサー";

// AdSense push を許可する広告コンテナの最小幅(px)。
// 全スロット中の最小明示幅は SideRail の 160px のため、120px で正当な枠を誤ブロックしない。
const MIN_AD_WIDTH = 120;

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

    // 収益優先(2026-07 全戻し): #216(2026-07-03)で全 AdUnit を IntersectionObserver(300px手前)の
    // ビューポート遅延 push にしたところ、スクロールされない下部枠が読み込まれず 1PVあたり広告表示が
    // ~0.6 まで激減し AdSense の RPM(ページのインプレッション収益)が 7/5 以降ほぼ半減した。
    // PSI(速度)より収益を優先し、マウント時に即 push する旧来挙動へ戻す。
    // 幅ガード(狭幅での "No slot size" 回避)と display:none 枠の非 push は維持する。
    let roRef: ResizeObserver | null = null;

    const tryPush = () => {
      if (pushed.current) return true;
      // 幅ガード: レイアウト確定前の一時的な狭幅(実測79px等)で push すると
      // AdSense が "No slot size for availableWidth" エラーを出し配信もされない。
      // 最小の明示スロットは SideRail の 160px なので 120px 未満では push せず
      // ResizeObserver で幅が確保されるまで待つ。
      if (el.offsetWidth >= MIN_AD_WIDTH) {
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

    const startPush = () => {
      // 即座に幅があれば実行
      if (tryPush()) return;

      // 幅0の場合はResizeObserverで待つ
      roRef = new ResizeObserver(() => {
        if (tryPush()) roRef?.disconnect();
      });
      roRef.observe(el);
    };

    // マウント時に即 push（ビューポート遅延を撤廃）。display:none の広告
    // （例: MobileHeaderBannerAd が PC で hidden）は offsetWidth=0 のため push されず、
    // レスポンシブで表示に切り替わった時点で ResizeObserver 経由で push される（従来互換）。
    startPush();

    return () => {
      roRef?.disconnect();
    };
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
          <span className="text-[11px] font-medium tracking-widest text-muted-foreground">{AD_LABEL}</span>
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
      {/* CLS対策: 遅延挿入される広告が下を押し下げないよう最小高さを予約 */}
      <AdUnit slot={AD_SLOTS.display} format="auto" placement="display" className="min-h-[250px]" />
    </AdWrapper>
  );
}

// ---- セクション間ネイティブ広告（波デザインでサイトに馴染む） ----
export function NativeAdBreak({ className = "" }: { className?: string }) {
  if (!ADSENSE_ID) return null;
  // w-full: flex コンテナ直下に置かれると mx-auto の auto マージンが stretch を打ち消し
  // fit-content 幅に収縮して広告が配信されなくなるため明示する
  return (
    <div className={`mx-auto w-full max-w-4xl px-4 py-10 ${className}`}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ocean-mid/20 to-transparent" />
        <Waves className="size-4 text-ocean-mid/30" />
        <span className="text-[11px] font-medium tracking-widest text-muted-foreground">{AD_LABEL}</span>
        <Waves className="size-4 text-ocean-mid/30" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-ocean-mid/20 to-transparent" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 p-3 sm:p-5 shadow-sm shadow-ocean-deep/[0.03]">
        {/* CLS対策: fluid広告の後挿入による押し下げを防ぐため最小高さを予約 */}
        <AdUnit slot={AD_SLOTS.native_break} format="auto" placement="native_break" className="min-h-[250px]" />
      </div>
    </div>
  );
}

// ---- Multiplex広告（関連コンテンツ風グリッド、フッター前に最適） ----
export function MultiplexAd({ className = "", placement = "multiplex" }: { className?: string; placement?: "multiplex" | "pre_footer" }) {
  // CLS対策: autorelaxed広告の後挿入による押し下げを防ぐため最小高さ(min-h-[250px])を予約
  return (
    <AdUnit
      slot={placement === "pre_footer" ? AD_SLOTS.pre_footer : AD_SLOTS.multiplex}
      placement={placement}
      format="autorelaxed"
      className={`my-8 min-h-[250px] ${className}`}
    />
  );
}

// ---- 自動広告（Auto Ads）の方針 ----
// STEP 0（2026-06）: 増収のため「ビネット（ページ遷移時の全画面オーバーレイ）」のみ
// AdSense管理画面で有効化する。ビネットはオーバーレイなので in-page を押し下げず CLS=0。
// 以下は管理画面側の設定であり、コードでの実装は不要（adsbygoogle.js は layout.tsx で全ページ読込済み）。
//   - ビネット（ページ間広告）         → ON
//   - ページ内フォーマット（記事内等）  → OFF（既存の手動枠と二重化＆領域予約なしでCLS悪化するため）
//   - オーバーレイ アンカー広告         → OFF（下記 MobileStickyAd と二重化するため）
// アンカーは手動の MobileStickyAd（領域予約・dismiss付き）で出している。
// 詳細・手順・ロールバック → ./VIGNETTE-STEP0.md

// ---- フッター前広告（全ページ共通） ----
export function PreFooterAd() {
  if (!ADSENSE_ID) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">{AD_LABEL}</span>
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
        {/* CLS対策: 遅延挿入される広告がヘッダー下のコンテンツを押し下げないよう
            最小高さを予約する（728x90 リーダーボード基準）。 */}
        <AdUnit slot={AD_SLOTS.header_banner} placement="header_banner" format="horizontal" responsive className="min-h-[90px]" />
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

// ---- モバイル固定フッター広告（kabutan.jp式、MobileNav上部に固定） ----
// suspended: 下部一時UI（Cookie/比較/位置情報/PWA）表示中の一時非表示（bottom-layer.tsx で調停）。
// dismissed と異なり、一時UIが消えれば自動復帰する。unmount ではなく hidden クラスで隠すことで
// 読み込み済み広告を保持し、AdSense の再リクエスト（push 重複）を発生させない。
export function MobileStickyAd({ suspended = false }: { suspended?: boolean }) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ADSENSE_ID) return;
    // 1秒後に表示（viewability を稼ぐため遅延を短縮、 AdSense ポリシー的に即時もOKだが UX 重視で 1s）
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // 表示中はページ末尾が固定広告の裏に隠れないよう、広告の高さ分だけ body 下部に余白を確保する。
  // 高さは固定（内側 h-[98px] + border-t 1px = 99px）なので offsetHeight の読み取りは不要。
  // 旧実装は offsetHeight 読み取り＋ResizeObserver で padding を書いており「読み取り→書き込み」の
  // 交錯が強制リフロー(layout thrashing)を起こし TBT を悪化させていた。レイアウト読み取りを排し、
  // md以上は広告が md:hidden(display:none) のため matchMedia で padding を外す（旧ROの追従と等価）。
  // 広告のマークアップ・スロット・表示タイミングは不変（収益影響なし）。
  useEffect(() => {
    if (!visible || dismissed || suspended) return;
    const mql = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      document.body.style.paddingBottom = mql.matches ? "" : "99px";
    };
    apply();
    mql.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      document.body.style.paddingBottom = "";
    };
  }, [visible, dismissed, suspended]);

  if (!ADSENSE_ID || dismissed || !visible) return null;

  return (
    // suspend はインラインstyleではなく hidden クラスで行う
    // （smart-mobile-ad.tsx の MutationObserver が style*="display: none" を未充足広告の
    //   自動折りたたみと誤検知して恒久 dismiss してしまうのを防ぐため）
    <div
      ref={containerRef}
      className={`fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 md:hidden border-t border-border/30 bg-background/95 backdrop-blur-sm${suspended ? " hidden" : ""}`}
    >
      {/* 下部アンカーの固定広告が読み込み後に高さ拡張すると内容が上方向にシフトし
          CLS 0.2の主因になっていた。サイズ固定+クリップ枠で拡張を物理的に遮断。
          ✕ボタンは -top-6 で外側にはみ出るため、overflow-hidden は内側divのみに付ける。
          タップ領域は44×44px確保（size-5だと誤タップ→広告誤クリックのリスク）。視覚上の●は内側spanでsize-5維持。 */}
      <div className="relative px-2 py-1 h-[98px]">
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-6 right-1 z-50 flex size-11 items-center justify-center"
          aria-label="広告を閉じる"
        >
          <span className="flex size-5 items-center justify-center rounded-full bg-muted/90 text-[10px] text-muted-foreground shadow-sm" aria-hidden="true">
            ✕
          </span>
        </button>
        <div className="h-[90px] overflow-hidden">
          <AdUnit
            slot={AD_SLOTS.mobile_sticky}
            placement="mobile_sticky"
            format="horizontal"
            style={{ display: "block", width: "100%", height: "90px" }}
            responsive={false}
          />
        </div>
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

// ---- 広告ラッパー（2026-07 全戻し: 収益優先で即ロード化） ----
// 旧: IntersectionObserver(rootMargin 200px)でスクロール到達まで children(広告)を出さず
// プレースホルダ(min-h-[250px])だけ描画していた。稼ぎ頭の spots/fish 詳細の in-content 広告
// (DisplayAd/InArticleAd)がスクロールされないと未ロード=インプレッション消滅のため、収益優先で
// children を即描画する。CLS は内側の AdUnit が min-h を予約済みなのでプレースホルダ不要。
export function LazyAd({ className = "", children }: { className?: string; children?: React.ReactNode }) {
  return <div className={className}>{children || <InArticleAd />}</div>;
}
