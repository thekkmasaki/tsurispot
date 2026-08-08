"use client";

import { useEffect, useRef, useState } from "react";
import { Waves } from "lucide-react";
import {
  trackAdEvent,
  trackAdFallback,
  trackAdFallbackLateFill,
  trackHouseAdNoFill,
  markAdSlotPending,
  resolveAdSlotPending,
} from "@/lib/ads-tracking";
import { AD_SLOTS } from "@/lib/ads-config";
import { HouseAd } from "./house-ad";
import { decideAdSlotOutcome } from "@/lib/ad-fallback-decision";
import { getAdSenseScriptState, subscribeAdSenseScriptState } from "@/lib/adsense-script-state";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID;

// 広告ラベル文言（全広告枠で統一。「おすすめ」等の曖昧な表現は誤認を招くため禁止）
const AD_LABEL = "スポンサー";

// fallback（自前ハウス広告=サイト内誘導）表示中のラベル文言。自社コンテンツに「スポンサー」と
// 誤ラベルしないための差し替え。ラベル行ごと消すと20-30pxの上方向シフト(CLS)が出るため、
// 行は維持してテキストだけ替える（行高は同一）。
const HOUSE_LABEL = "TsuriSpot";

// AdSense push を許可する広告コンテナの最小幅(px)。
// 全スロット中の最小明示幅は SideRail の 160px のため、120px で正当な枠を誤ブロックしない。
const MIN_AD_WIDTH = 120;

// pending滞留観測用のインスタンス採番（ads-tracking の markAdSlotPending のキーに使う）
let adUnitInstanceSeq = 0;

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

// ブレークポイントに一致する時だけ true。CSS の display:none で広告を隠すと、非表示でも
// <ins> が幅0で DOM に残り、adsbygoogle.push({}) が DOM 順で処理して "No slot size for
// availableWidth=0" 例外→push キュー停止→他の広告が埋まらなくなる（2026-07 モバイル広告不配信の真因）。
// 非表示ブレークポイントでは DOM ごとアンマウントするため、この matchMedia でゲートする。
// SSR/初回描画は false（navigator/matchMedia 不在＝hydration 一致、広告は元々 client push で実害なし）。
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
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
  /** true の枠は、ブロック/no-fill で埋まらなかった時に自前ハウス広告(サイト内誘導)へ差し替える */
  houseFallback?: boolean;
  /** fallback 判定結果をラッパーに通知（"empty" 時に「スポンサー」ラベルを抑制するため） */
  onStatus?: (status: "filled" | "empty") => void;
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
  houseFallback = false,
  onStatus,
}: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const viewed = useRef(false);
  const suppressed = useAdsSuppressed();
  // ブロック/no-fill で埋まらず自前ハウス広告に差し替えた状態（実広告の遅延fillで自動復帰する）
  const [fellBack, setFellBack] = useState(false);
  // fallback 実行時刻（誤発火の自己修復計測用）。null = fallback していない
  const fellBackAtRef = useRef<number | null>(null);
  // onStatus の重複通知防止（empty→empty 等の連打を抑止）
  const notifiedRef = useRef<"empty" | "filled" | null>(null);
  // 最新の onStatus を参照するための ref（fallback effect は初回マウントで配線するため）
  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);
  // push 完了（幅ガード解除後の遅延 push 含む）を fallback エンジンに伝えるフック
  const evaluateRef = useRef<(() => void) | null>(null);

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
          // （フィルされない場合もあるが placement 間の相対比較には有効。
          //   スクリプト未ロード時は配列に queue されるだけでも成功扱い＝描画確認ではない点に注意）
          if (placement) trackAdEvent({ placement, slot, event: "ad_impression" });
          // 幅ガード解除後の遅延 push でも fallback エンジンが再評価できるよう通知
          evaluateRef.current?.();
        } catch {
          // push({}) が同期 throw するのは adsbygoogle.js ロード済みで TagError が出るケース
          // （一時的な幅0等）。ここで true を返すと ResizeObserver が外れて再試行経路が消え、
          // pushed=false のまま fallback エンジンも永久 pending＝広告も HouseAd も出ない
          // 死に枠になる（再監査指摘）。false を返して監視を維持し、サイズ変化時に再試行する。
          return false;
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
              // HouseAd(fallback)表示中は実広告が見えていないので ad_viewable を送らない
              // （視認率の水増し防止。viewed は立てず、実広告復帰後の視認は計測可能なまま残す）
              if (fellBackAtRef.current != null) {
                timer = null;
                return;
              }
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

  // fallback エンジン: イベント駆動で <ins> の状態を「観測するだけ」（push 系には一切触れない）。
  // 壁時計での締切判定はしない。adsbygoogle.js は lazyOnload（window load 後+idle）でしか
  // 読み込まれないため、時間ベースの判定は遅い回線の正常ユーザーを大量に誤 fallback させる
  // （PR#295 監査 F1）。判定材料と発火タイミング:
  //  - スクリプト状態（adsense-script-state）: onError='blocked' が確定した時のみ blocked 扱い
  //  - <ins> の data-ad-status: AdSense 応答後に filled/unfilled が付与される（MutationObserver で監視）
  //  - 幅ガード保留中（未 push）の枠は評価しない（push 成功時に evaluateRef 経由で再評価）
  // 判定ロジック本体は decideAdSlotOutcome（pure 関数・ユニットテスト済み）。
  //
  // 可逆性（監査 F2 対策の核）: fallback 後も監視を続け、実広告が遅れて fill されたら
  // HouseAd を撤去してラベルを復帰し、ad_fallback_late_fill を送信する。
  // late_fill ÷ ad_fallback = 誤発火率で、本機能の安全性を直接観測できる。
  useEffect(() => {
    if (!ADSENSE_ID || suppressed || !houseFallback) return;
    const el = containerRef.current;
    if (!el) return;
    const ins = el.querySelector("ins.adsbygoogle");
    if (!ins) return;

    let disposed = false;
    // pending滞留観測のキー（push済みで結果未確定のまま離脱した枠数を pagehide で送る）
    const pendingKey = `${placement ?? "slot"}#${++adUnitInstanceSeq}`;

    const notify = (s: "empty" | "filled") => {
      if (notifiedRef.current === s) return;
      notifiedRef.current = s;
      onStatusRef.current?.(s);
    };

    const evaluate = () => {
      if (disposed) return;
      const outcome = decideAdSlotOutcome({
        scriptState: getAdSenseScriptState(),
        pushed: pushed.current,
        adStatus: ins.getAttribute("data-ad-status"),
      });
      if (outcome === "pending") {
        // push済みなのに確定しない枠（広告リクエストのみ遮断される層等）を滞留として記録
        if (pushed.current) markAdSlotPending(pendingKey);
        return; // 確定情報が来るまで何もしない
      }
      resolveAdSlotPending(pendingKey);

      if (outcome === "filled") {
        if (fellBackAtRef.current != null) {
          // 誤 fallback の自己修復: HouseAd を撤去してラベル復帰、誤発火率テレメトリを送信
          trackAdFallbackLateFill(placement, Date.now() - fellBackAtRef.current);
          fellBackAtRef.current = null;
          setFellBack(false);
        }
        notify("filled");
        return;
      }

      // blocked / unfilled → 空き枠なので自前ハウス広告に差し替え（初回のみ）
      if (fellBackAtRef.current == null) {
        fellBackAtRef.current = Date.now();
        setFellBack(true);
        trackAdFallback(placement, outcome);
        // no-fill 由来の差し替えだけ専用イベントでも送る（在庫不足の量をディメンション登録前でも追うため）
        if (outcome === "unfilled") trackHouseAdNoFill(placement);
        notify("empty");
      }
    };

    // AdSense が <ins> に付与する属性（処理・fill 結果）の変化を監視
    const mo = new MutationObserver(evaluate);
    mo.observe(ins, { attributes: true, attributeFilter: ["data-ad-status", "data-adsbygoogle-status"] });
    // スクリプト状態の遷移（loaded/blocked）を購読
    const unsubscribe = subscribeAdSenseScriptState(evaluate);
    // 遅延 push（幅ガード解除）時の再評価フック
    evaluateRef.current = evaluate;
    // SPA 遷移後などスクリプト状態が既に確定済みのケースに備え、現時点の状態で一度評価
    evaluate();

    return () => {
      disposed = true;
      mo.disconnect();
      unsubscribe();
      evaluateRef.current = null;
      // アンマウント枠（SPA遷移等）を滞留として誤計上しない
      resolveAdSlotPending(pendingKey);
    };
    // 初回マウントで observer/購読を配線し、以後はイベントが駆動する。
    // onStatus は onStatusRef 経由で常に最新を参照する（stale closure 回避）。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ADSENSE_ID || suppressed) return null;

  return (
    // data-house-fallback は globals.css の unfilled collapse のスコープ限定に使う。
    // min-h 予約の無い枠(MobileHeaderBannerAd等)まで折りたたむと、no-fill 時に
    // ビューポート内で約50pxの上方向シフト(CLS)が新規発生するため、fallback枠に限定する。
    <div
      ref={containerRef}
      className={`ad-container w-full ${className}`}
      {...(houseFallback ? { "data-house-fallback": "true" } : {})}
    >
      {/* <ins> は差し替え後も DOM から消さず温存する（push キューへの副作用ゼロ）。
          HouseAd は <ins> の後に通常フローで並ぶが、表示中の空間は重ならない:
          - blocked: スクリプト未処理の <ins> は中身が無く高さ0
          - unfilled: ビューポート内では公式挙動で枠の空白が温存されるため、
            globals.css の ins.adsbygoogle[data-ad-status="unfilled"] { display:none } で折りたたむ
          実広告が遅れて fill された場合は fallback エンジンが HouseAd を撤去する（併存しない）。 */}
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
      {fellBack && <HouseAd placement={placement} />}
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
  labelText = AD_LABEL,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  label?: boolean;
  /** ラベル行のテキスト。fallback時は HOUSE_LABEL に差し替える（行は消さない=シフト0） */
  labelText?: string;
  variant?: AdVariant;
}) {
  if (!ADSENSE_ID) return null;
  return (
    <div className={`relative ${AD_WRAPPER_STYLES[variant]} ${className}`}>
      {label && (
        <div className="mb-2 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-[11px] font-medium tracking-widest text-muted-foreground">{labelText}</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
        </div>
      )}
      {children}
    </div>
  );
}

// ---- 記事内広告（コンテンツのセクション間） ----
export function InArticleAd({ className = "" }: { className?: string }) {
  // ブロック/no-fill 時は自前ハウス広告に差し替え、ラベルは「スポンサー」→「TsuriSpot」に
  // テキストのみ差し替える（行は維持=シフト0）。実広告が遅延fillされたら自動で復帰する。
  const [empty, setEmpty] = useState(false);
  return (
    <AdWrapper className={`my-8 ${className}`} labelText={empty ? HOUSE_LABEL : AD_LABEL}>
      {/* CLS対策: lazyOnloadで遅延挿入される広告が下のコンテンツを押し下げないよう
          最小高さを予約する（SidebarAd/DisplayAd と同じ250px基準）。 */}
      <AdUnit
        slot={AD_SLOTS.in_article}
        placement="in_article"
        format="fluid"
        layout="in-article"
        className="min-h-[250px]"
        style={{ display: "block", textAlign: "center" }}
        houseFallback
        onStatus={(s) => setEmpty(s === "empty")}
      />
    </AdWrapper>
  );
}

// ---- ディスプレイ広告（レスポンシブ） ----
export function DisplayAd({ className = "" }: { className?: string }) {
  const [empty, setEmpty] = useState(false);
  return (
    <AdWrapper className={`my-6 ${className}`} labelText={empty ? HOUSE_LABEL : AD_LABEL}>
      {/* CLS対策: 遅延挿入される広告が下を押し下げないよう最小高さを予約 */}
      <AdUnit
        slot={AD_SLOTS.display}
        format="auto"
        placement="display"
        className="min-h-[250px]"
        houseFallback
        onStatus={(s) => setEmpty(s === "empty")}
      />
    </AdWrapper>
  );
}

// ---- セクション間ネイティブ広告（波デザインでサイトに馴染む） ----
export function NativeAdBreak({ className = "" }: { className?: string }) {
  // フック順序を保つため状態は早期 return より前で宣言する
  const [empty, setEmpty] = useState(false);
  if (!ADSENSE_ID) return null;
  // w-full: flex コンテナ直下に置かれると mx-auto の auto マージンが stretch を打ち消し
  // fit-content 幅に収縮して広告が配信されなくなるため明示する
  return (
    <div className={`mx-auto w-full max-w-4xl px-4 py-10 ${className}`}>
      {/* fallback時はテキストのみ「TsuriSpot」に差し替え（行は消さない=シフト0） */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-ocean-mid/20 to-transparent" />
        <Waves className="size-4 text-ocean-mid/30" />
        <span className="text-[11px] font-medium tracking-widest text-muted-foreground">{empty ? HOUSE_LABEL : AD_LABEL}</span>
        <Waves className="size-4 text-ocean-mid/30" />
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-ocean-mid/20 to-transparent" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 p-3 sm:p-5 shadow-sm shadow-ocean-deep/[0.03]">
        {/* CLS対策: fluid広告の後挿入による押し下げを防ぐため最小高さを予約 */}
        <AdUnit
          slot={AD_SLOTS.native_break}
          format="auto"
          placement="native_break"
          className="min-h-[250px]"
          houseFallback
          onStatus={(s) => setEmpty(s === "empty")}
        />
      </div>
    </div>
  );
}

// ---- Multiplex広告（関連コンテンツ風グリッド、フッター前に最適） ----
export function MultiplexAd({
  className = "",
  placement = "multiplex",
  onStatus,
}: {
  className?: string;
  placement?: "multiplex" | "pre_footer";
  /** 親（PreFooterAd 等）にラベル抑制を伝えるための通知 */
  onStatus?: (status: "filled" | "empty") => void;
}) {
  // CLS対策: autorelaxed広告の後挿入による押し下げを防ぐため最小高さ(min-h-[250px])を予約
  return (
    <AdUnit
      slot={placement === "pre_footer" ? AD_SLOTS.pre_footer : AD_SLOTS.multiplex}
      placement={placement}
      format="autorelaxed"
      className={`my-8 min-h-[250px] ${className}`}
      houseFallback
      onStatus={onStatus}
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
//   - 空の広告枠の埋め合わせ(Fill empty in-page ads) → OFF維持（ONにすると unfilled が
//     第3の値 unfill-optimized になり、fallback(HouseAd) と collapse CSS が不発化する）
// アンカーは手動の MobileStickyAd（領域予約・dismiss付き）で出している。
// 詳細・手順・ロールバック → ./VIGNETTE-STEP0.md

// ---- フッター前広告（全ページ共通） ----
export function PreFooterAd() {
  // フック順序を保つため状態は早期 return より前で宣言する
  const [empty, setEmpty] = useState(false);
  if (!ADSENSE_ID) return null;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* fallback時はテキストのみ「TsuriSpot」に差し替え（行は消さない=シフト0） */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">{empty ? HOUSE_LABEL : AD_LABEL}</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>
      <div className="rounded-2xl border border-border/50 bg-card/60 p-4 sm:p-6 shadow-sm shadow-ocean-deep/[0.03]" style={{ minWidth: "300px" }}>
        <MultiplexAd placement="pre_footer" onStatus={(s) => setEmpty(s === "empty")} />
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
          houseFallback
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
        <AdUnit slot={AD_SLOTS.sidebar_sticky} placement="sidebar_sticky" format="auto" className="min-h-[250px]" houseFallback />
      </AdWrapper>
    </div>
  );
}

// ---- ヘッダー下リーダーボード広告（PCのみ） ----
export function HeaderBannerAd() {
  // lg(1024px)以上でのみマウント。旧 `hidden lg:block` の CSS 非表示だと、モバイルでも
  // 幅0の <ins> が DOM に残り push キューを止め、モバイル広告(MobileHeaderBanner/Sticky)が
  // 埋まらなくなる（2026-07 不具合の真因）。matchMedia で非該当時は DOM ごと出さない。
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  if (!ADSENSE_ID || !isDesktop) return null;
  return (
    <div className="border-b border-border/30 bg-muted/10">
      <div className="mx-auto max-w-5xl px-4 py-2">
        {/* CLS対策: 遅延挿入される広告がヘッダー下のコンテンツを押し下げないよう
            最小高さを予約する（728x90 リーダーボード基準）。 */}
        <AdUnit slot={AD_SLOTS.header_banner} placement="header_banner" format="horizontal" responsive className="min-h-[90px]" />
      </div>
    </div>
  );
}

// ---- 左右固定サイドバナー広告（kabutan.jp式、PCワイド画面のみ） ----
// 実レイアウトの最大コンテンツ幅。最も広いページ(/spots 等)は Tailwind の `container` を使い、
// v4 のデフォルト --breakpoint-2xl: 96rem がそのまま max-width になる（tailwind.config は無く
// globals.css の @theme にも breakpoint 上書きは無い＝96rem=1536px が実効値）。
// 旧実装は 1280px 前提だったため、container 幅のページで左レールがフィルタUIに被っていた。
const CONTENT_MAX = 1536;
// レール1本 160px + コンテンツとの間隔 16px = 176px を左右に確保できる幅で初めて表示する。
// 1536 + 176*2 = 1888px。
const SIDE_RAIL_MIN_WIDTH = CONTENT_MAX + 176 * 2;
// レールの外側位置。コンテンツ左端 (100vw - CONTENT_MAX)/2 から 176px 内側に置く。
// 画面が最小ゲート幅ぴったりの時に 0 以下へ落ちないよう 8px で下限を切る。
const SIDE_RAIL_OFFSET = `max(8px, calc((100vw - ${CONTENT_MAX}px) / 2 - 176px))`;

// 被らないことの検算（1920px モニタの最大化ウィンドウ）:
//  - スクロールバー有り: MQ幅=1903 → 表示。100vw は既定でスクロールバーを含む(=1920)ため
//    left = max(8, (1920-1536)/2 - 176) = 16px。レールは 16〜176px を占める。
//    コンテンツ左端は (1903-1536)/2 = 183.5px → 7.5px の余白が残り重ならない。
//  - スクロールバー無し(1920): left = 16px、コンテンツ左端 192px → 16px の余白。
//  - ゲート境界 1888px ちょうど: left = 8px（下限）、コンテンツ左端 176px → 8px の余白。
// いずれも余白は正のままで、かつ 1888 < 1903 なので 1920px ユーザーを弾かない
// （ゲートを 1900px 超にすると Windows のスクロールバー分で 1920 ユーザーが漏れる）。
export function SideRailAds() {
  const [wide, setWide] = useState(false);

  // CSS の display 制御だとコンポーネントは常時マウントされ、各 AdUnit が
  // ResizeObserver を張ってしまう。matchMedia でゲートして SIDE_RAIL_MIN_WIDTH 未満では
  // DOM 自体を出さず、observer 生成・AdSense push も発生させない。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(min-width: ${SIDE_RAIL_MIN_WIDTH}px)`);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!ADSENSE_ID || !wide) return null;

  return (
    <>
      {/* 左サイドレール（表示条件と位置は上の定数コメントの検算どおり） */}
      <div
        className="fixed top-1/2 -translate-y-1/2 z-40"
        style={{ left: SIDE_RAIL_OFFSET }}
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
        style={{ right: SIDE_RAIL_OFFSET }}
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
      houseFallback
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
  // md未満(モバイル)でのみマウント。旧 `md:hidden` の CSS 非表示だと PC でも幅0の <ins> が
  // DOM に残り push キューを止め、PC の本文広告が埋まらなくなる。DOM ごとゲートする。
  const isMobile = useMediaQuery("(max-width: 767px)");

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

  if (!ADSENSE_ID || dismissed || !visible || !isMobile) return null;

  return (
    // suspend はインラインstyleではなく hidden クラスで行う
    // （smart-mobile-ad.tsx の MutationObserver が style*="display: none" を未充足広告の
    //   自動折りたたみと誤検知して恒久 dismiss してしまうのを防ぐため）
    // md:hidden は撤廃（isMobile ゲートで DOM ごとマウント制御するため）。
    <div
      ref={containerRef}
      className={`fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 border-t border-border/30 bg-background/95 backdrop-blur-sm${suspended ? " hidden" : ""}`}
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
  // md未満(モバイル)でのみマウント。旧 `md:hidden` の CSS 非表示だと PC でも幅0の <ins> が
  // DOM に残り push キューを止め、PC の本文広告が埋まらなくなる。matchMedia で DOM ごとゲート。
  const isMobile = useMediaQuery("(max-width: 767px)");
  if (!ADSENSE_ID || !isMobile) return null;
  return (
    <div className="border-b border-border/20 bg-muted/5">
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
