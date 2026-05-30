"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

// 依存を増やさない軽量トースト。
// - 任意の場所から `toast.success("...")` のように呼べる module-level pub/sub。
// - <Toaster /> を providers に1つだけマウントする。
// - コンテナは常時 aria-live="polite" で、追加メッセージをスクリーンリーダーに通知（WCAG 4.1.3）。

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };

let listeners: ((t: ToastItem) => void)[] = [];
let counter = 0;

function emit(type: ToastType, message: string) {
  counter += 1;
  const item: ToastItem = { id: counter, type, message };
  listeners.forEach((l) => l(item));
}

export const toast = {
  success: (message: string) => emit("success", message),
  error: (message: string) => emit("error", message),
  info: (message: string) => emit("info", message),
};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const STYLES: Record<ToastType, string> = {
  success: "border-forest-green/30 bg-card text-foreground",
  error: "border-destructive/30 bg-card text-foreground",
  info: "border-border bg-card text-foreground",
};

const ICON_COLOR: Record<ToastType, string> = {
  success: "text-forest-green",
  error: "text-destructive",
  info: "text-ocean-mid",
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (t: ToastItem) => {
      setItems((prev) => [...prev, t]);
      // 4秒で自動クローズ（toast-dismiss 3-5s）
      window.setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== t.id));
      }, 4000);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = (id: number) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    // コンテナは常時マウント。aria-live により追加トーストを読み上げる（focus は奪わない）。
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom,0px))] z-[200] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {items.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lg shadow-ocean-deep/10 animate-in slide-in-from-bottom-2 fade-in duration-200",
              STYLES[t.type]
            )}
          >
            <Icon className={cn("mt-0.5 size-5 shrink-0", ICON_COLOR[t.type])} aria-hidden="true" />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="閉じる"
              className="-mr-1 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
