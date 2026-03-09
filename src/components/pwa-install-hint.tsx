"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Share, Plus } from "lucide-react";

const DISMISS_KEY = "tsurispot-pwa-install-dismissed";
const VISIT_COUNT_KEY = "tsurispot-visit-count";
const SHOW_AFTER_VISITS = 2;

export function PWAInstallHint() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 既にインストール済み（standaloneモード）なら表示しない
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // PCなら表示しない
    if (window.innerWidth >= 768) return;
    // 既に閉じた場合は7日間表示しない
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // 訪問回数カウント
    const visits = parseInt(
      localStorage.getItem(VISIT_COUNT_KEY) || "0",
      10
    );
    localStorage.setItem(VISIT_COUNT_KEY, String(visits + 1));
    if (visits + 1 < SHOW_AFTER_VISITS) return;

    // iOS判定
    const ua = navigator.userAgent;
    const isiOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome/.test(ua);

    if (isiOS && isSafari) {
      setIsIOS(true);
      setVisible(true);
      return;
    }

    // Android: beforeinstallpromptイベントを待つ
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setVisible(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-[60px] left-3 right-3 z-40 md:hidden animate-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-sky-200 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
          <Plus className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          {isIOS ? (
            <p className="text-xs leading-tight text-gray-700">
              <Share className="mb-0.5 inline size-3.5 text-sky-600" />{" "}
              <span className="font-medium">共有</span>→
              <span className="font-medium">ホーム画面に追加</span>
              でアプリのように使えます
            </p>
          ) : (
            <button
              onClick={handleInstall}
              className="text-left text-xs leading-tight text-gray-700"
            >
              <span className="font-medium text-sky-700">
                ホーム画面に追加
              </span>
              してアプリのように使えます
            </button>
          )}
        </div>
        <button
          onClick={handleDismiss}
          aria-label="閉じる"
          className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

// beforeinstallpromptの型定義
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
