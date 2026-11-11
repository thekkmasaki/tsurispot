"use client";

import { useSyncExternalStore } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShakurhythmSpotContext } from "@/lib/shakurhythm";

const APP_STORE_URL = "https://apps.apple.com/jp/app/id6825799808";

const noopSubscribe = () => () => {};
/** iPhone/iPad/Mac（Apple 端末）か。SSR 時は null（文言は共通の既定表示） */
function useIsApple(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent),
    () => null
  );
}

function track(source: string, prefecture: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "shakurhythm_click", { source, prefecture });
}

/**
 * スポット詳細のアオリイカ欄に出す、シャクリズムの案内（スポットごとに文面が変わる1〜2行）。
 * - highSeason（春・秋の時期）はアイコン付きのカード、それ以外は文字1行。
 * - Android では「iPhone版のみ」と出して無駄なクリックを減らす（ラベルの差し替えのみ＝高さ不変）。
 */
export function ShakurhythmSpotNote({
  ctx,
  source,
  className,
}: {
  ctx: ShakurhythmSpotContext;
  source: string;
  className?: string;
}) {
  const isApple = useIsApple();
  const prefSlug = encodeURIComponent(ctx.prefecture);
  const href = `${APP_STORE_URL}?ct=tsurispot_${source}_${prefSlug}`;

  const timing =
    ctx.night === "banned"
      ? "夜釣りは禁止なので、朝マヅメ・夕マヅメが勝負です。"
      : ctx.night === "ok"
        ? "夕マヅメから夜も狙えます。"
        : "";
  const lead = ctx.inSeason
    ? `${ctx.spotName}のアオリイカは${ctx.seasonLabel}が狙い目で、今がその時期です。`
    : `${ctx.spotName}のアオリイカは${ctx.seasonLabel}が狙い目です。`;
  const cta = isApple === false ? "iPhone版のみ（Android未対応）" : "App Storeで無料ダウンロード";

  if (!ctx.highSeason) {
    return (
      <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
        {lead}
        {timing}
        エギングのフォールの秒数は、ツリスポ公式アプリ
        <a
          href={href}
          target="_blank"
          rel="noopener"
          onClick={() => track(source, ctx.prefecture)}
          className="mx-0.5 font-bold text-primary underline-offset-2 hover:underline"
        >
          「シャクリズム」
        </a>
        が振動で数えてくれます（iPhone・Apple Watch・無料）。
      </p>
    );
  }

  return (
    <aside className={cn("rounded-xl border border-primary/30 bg-primary/5 p-4", className)}>
      <p className="text-xs font-bold text-primary">エギングするなら｜ツリスポ公式アプリ</p>
      <p className="mt-1.5 text-sm leading-relaxed">
        {lead}
        {timing}
        フォールの秒数は「シャクリズム」が数えて、振動で知らせます。ラインから目を離さずにシャクれます。
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        onClick={() => track(source, ctx.prefecture)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
      >
        <Smartphone className="size-4" aria-hidden="true" />
        {cta}
      </a>
      <span className="ml-3 text-xs text-muted-foreground">iPhone・Apple Watch</span>
    </aside>
  );
}
