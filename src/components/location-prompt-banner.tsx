"use client";

import { useState, useEffect } from "react";
import { MapPin, X, Loader2, Navigation } from "lucide-react";

const DISMISSED_KEY = "tsurispot_location_dismissed";

export function LocationPromptBanner() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 既に閉じた場合は表示しない（セッション中）
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // Permissions API で現在の状態を確認
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted" || result.state === "denied") {
          // 許可済み or 拒否済み → バナー不要
          return;
        }
        // "prompt" 状態 → 少し遅延してバナーを表示（ページ読み込み後）
        setTimeout(() => setVisible(true), 1500);
      });
    } else {
      setTimeout(() => setVisible(true), 1500);
    }
  }, []);

  const handleAllow = () => {
    if (!navigator.geolocation) return;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 位置情報をlocalStorageに保存してリロード後も利用可能にする
        try {
          localStorage.setItem(
            "tsurispot_user_location",
            JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              timestamp: Date.now(),
            })
          );
        } catch {
          // localStorage書き込み失敗は無視
        }
        dismiss();
        // ページをリロードして近くのスポットを表示
        window.location.reload();
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          // 拒否された場合は案内を表示してからdismiss
          alert(
            "位置情報が拒否されました。\n\nブラウザの設定から位置情報を許可してください：\n・iOS: 設定 → Safari → 位置情報\n・Android: ブラウザ設定 → サイトの設定 → 位置情報"
          );
        }
        dismiss();
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
    );
  };

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-[68px] left-0 right-0 z-[60] animate-in slide-in-from-bottom-4 duration-300 sm:hidden">
      <div className="mx-2 rounded-2xl border border-sky-200 bg-white p-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100">
            <Navigation className="size-5 text-sky-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">
              近くの釣り場を見つけよう
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              位置情報を許可すると、近い順に釣り場を表示します
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleAllow}
                disabled={loading}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 active:bg-sky-800 disabled:opacity-60"
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
                className="min-h-[44px] px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                今はしない
              </button>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="閉じる"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
