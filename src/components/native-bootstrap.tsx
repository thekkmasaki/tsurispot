"use client";

import { useEffect, useState } from "react";
import { isNativeApp } from "@/lib/platform";
import { initPushTapHandling } from "@/lib/native-push";

/**
 * Capacitor ネイティブアプリ起動時のみ動く初期化レイヤ。Web では完全に no-op。
 *
 * - ステータスバーを濃紺ヘッダー（#0369a1）に合わせ白文字に
 * - ネットワーク断を検知してオフライン用フォールバックを全画面表示
 *   （リモートURL方式の白画面リジェクト対策。起動前からの圏外は iOS 側の
 *    CAPBridgeViewController フックで offline.html を表示）
 * - 外部リンク（アフィリエイト等）は SFSafariViewController で開く
 *   （WKWebView 内 target="_blank" 無反応 / Google 等の disallowed_useragent 回避）
 * - プッシュ通知タップで payload の url へ遷移
 */
export function NativeBootstrap() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    document.documentElement.classList.add("capacitor-native");

    let networkHandle: { remove: () => Promise<void> } | null = null;

    void (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Light });
      } catch {
        /* noop */
      }

      try {
        const { Network } = await import("@capacitor/network");
        const status = await Network.getStatus();
        setOffline(!status.connected);
        networkHandle = await Network.addListener(
          "networkStatusChange",
          (s) => setOffline(!s.connected),
        );
      } catch {
        /* noop */
      }

      void initPushTapHandling();
    })();

    // 外部リンクはシステムブラウザ（SFSafariViewController）で開く
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(a.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (url.hostname === window.location.hostname) return; // 自サイト内は WebView のまま
      e.preventDefault();
      void import("@capacitor/browser")
        .then(({ Browser }) => Browser.open({ url: a.href }))
        .catch(() => window.open(a.href, "_blank"));
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      void networkHandle?.remove();
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl">
        🎣
      </div>
      <h2 className="text-lg font-bold text-gray-800">オフラインです</h2>
      <p className="text-sm leading-relaxed text-gray-600">
        インターネットに接続できません。
        <br />
        電波の良い場所で再度お試しください。
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-700"
      >
        再読み込み
      </button>
    </div>
  );
}
