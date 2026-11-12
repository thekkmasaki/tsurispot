"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { ArrowRight, Globe, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

/** ツリスポ釣果記録（iPhone）。App Store の ct= でどこから入ったかを App Store Connect で見られる */
export const CATCHLOG_APP_STORE_URL = "https://apps.apple.com/jp/app/id6833248739";
export const CATCHLOG_ICON = "/images/apps/catchlog-icon.png";

export function catchlogHref(source: string) {
  return `${CATCHLOG_APP_STORE_URL}?ct=tsurispot_${source}`;
}

export function trackCatchlogClick(source: string) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "catchlog_click", { source });
}

const noopSubscribe = () => () => {};
/** iPhone/iPad か。SSR 時は null */
function useIsIos(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)),
    () => null
  );
}

function AppIcon({ size = 44 }: { size?: number }) {
  return (
    <Image
      src={CATCHLOG_ICON}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[22%] border border-black/5"
    />
  );
}

/** 「アプリで記録 → このページに載る」の連携図（1行） */
function LinkFlow({ to }: { to: string }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-bold">
      <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-1 ring-1 ring-border">
        <Smartphone className="size-3.5 text-primary" aria-hidden="true" />
        アプリで記録
      </span>
      <span className="inline-flex items-center gap-0.5 text-[11px] font-normal text-muted-foreground">
        投稿
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </span>
      <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-1 ring-1 ring-border">
        <Globe className="size-3.5 text-primary" aria-hidden="true" />
        {to}
      </span>
    </p>
  );
}

/**
 * ① スポットの釣果投稿フォームの上。iPhone 以外は「iPhone版のみ」の1行。
 */
export function CatchlogFormPromo({ className }: { className?: string }) {
  const isIos = useIsIos();
  const href = catchlogHref("spot_form");

  if (isIos === false) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        <Smartphone className="mr-1 inline size-3.5 align-[-2px]" aria-hidden="true" />
        iPhoneなら公式アプリ
        <a
          href={href}
          target="_blank"
          rel="noopener"
          onClick={() => trackCatchlogClick("spot_form")}
          className="mx-0.5 font-bold text-primary hover:underline"
        >
          「ツリスポ釣果記録」
        </a>
        でも投稿できます（iPhone版のみ）。
      </p>
    );
  }

  return (
    <aside className={cn("rounded-xl border border-primary/25 bg-primary/5 p-3.5", className)}>
      <div className="flex items-start gap-3">
        <AppIcon />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-primary">ツリスポ公式アプリ（iPhone・無料）</p>
          <p className="text-sm font-bold leading-snug">ツリスポ釣果記録</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            写真を選ぶだけで、潮・天気・水温まで自動で記録。
          </p>
        </div>
      </div>
      <LinkFlow to="この「みんなの釣果報告」に載る" />
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">同じツリスポのアカウントで使えます</p>
        <a
          href={href}
          target="_blank"
          rel="noopener"
          onClick={() => trackCatchlogClick("spot_form")}
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-foreground px-4 text-xs font-bold text-background hover:opacity-90"
        >
          App Storeで見る
        </a>
      </div>
    </aside>
  );
}

/**
 * ③ ウェブで釣果を投稿した直後。iPhone のときだけ出す。
 */
export function CatchlogPostedPromo({ className }: { className?: string }) {
  const isIos = useIsIos();
  if (!isIos) return null;
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border bg-muted/40 p-3 text-left", className)}>
      <AppIcon size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">アプリにも取り込めます</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          「ツリスポ釣果記録」に同じアカウントでログインすると、この釣果がアプリに入ります。次からは潮・天気も自動で残せます。
        </p>
        <a
          href={catchlogHref("spot_posted")}
          target="_blank"
          rel="noopener"
          onClick={() => trackCatchlogClick("spot_posted")}
          className="mt-1 inline-block text-xs font-bold text-primary hover:underline"
        >
          ツリスポ釣果記録を見る
        </a>
      </div>
    </div>
  );
}

/**
 * ④ マイページ「投稿した釣果」の上。ログイン中の人向けに、アカウント連携を伝える。
 */
export function CatchlogMypageNote({ className }: { className?: string }) {
  const isIos = useIsIos();
  return (
    <div className={cn("flex items-center gap-3 rounded-lg bg-primary/5 p-3", className)}>
      <AppIcon size={36} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold">iPhoneアプリ「ツリスポ釣果記録」と同じアカウントです</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          アプリで記録して投稿した釣果も、ここにまとまります。{isIos === false && "（iPhone版のみ）"}
        </p>
      </div>
      <a
        href={catchlogHref("mypage")}
        target="_blank"
        rel="noopener"
        onClick={() => trackCatchlogClick("mypage")}
        className="shrink-0 text-xs font-bold text-primary hover:underline"
      >
        アプリを見る
      </a>
    </div>
  );
}

/**
 * ② 釣果一覧の「アプリから投稿」印。押すと App Store。
 */
export function CatchlogViaBadge() {
  return (
    <a
      href={catchlogHref("via_badge")}
      target="_blank"
      rel="noopener"
      onClick={() => trackCatchlogClick("via_badge")}
      title="iPhoneアプリ「ツリスポ釣果記録」から投稿されました"
      className="ml-1.5 inline-flex items-center gap-0.5 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 align-middle text-[10px] font-bold text-primary hover:bg-primary/10"
    >
      <Smartphone className="size-3" aria-hidden="true" />
      アプリから投稿
    </a>
  );
}
