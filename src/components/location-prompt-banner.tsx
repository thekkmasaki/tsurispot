"use client";

import { useState, useEffect } from "react";
import { MapPin, X, Loader2, Navigation } from "lucide-react";

const DISMISSED_KEY = "tsurispot_location_dismissed";

export function LocationPromptBanner() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    // SSR ガード
    if (typeof window === "undefined") return;

    // 既に閉じた場合は表示しない（セッション中）
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // Permissions API で現在の状態を確認
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          // 既に許可済み → バナー不要
          setGranted(true);
          return;
        }
        if (result.state === "denied") {
          // 拒否済み → バナーを出しても意味がない
          return;
        }
        // "prompt" 状態 → バナーを表示
        setVisible(true);
      });
    } else {
      // Permissions API 非対応 → とりあえず表示
      setVisible(true);
    }
  }, []);

  const handleAllow = () => {
    if (!navigator.geolocation) return;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      () => {
        setGranted(true);
        setVisible(false);
      },
      () => {
        // 拒否されても閉じる
        dismiss();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  if (!visible || granted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300 sm:hidden">
      <div className="mx-2 mb-2 rounded-2xl border border-sky-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <Navigation className="size-5 text-sky-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              近くの釣り場を見つけよう
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              位置情報を許可すると、現在地から近い順に釣り場を表示できます
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleAllow}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 active:bg-sky-800 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    取得中...
                  </>
                ) : (
                  <>
                    <MapPin className="size-3.5" />
                    許可する
                  </>
                )}
              </button>
              <button
                onClick={dismiss}
                className="px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                今はしない
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="閉じる"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
