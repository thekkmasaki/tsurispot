"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { useSession } from "next-auth/react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    arr[i] = rawData.charCodeAt(i);
  }
  return arr;
}

export function NotificationSubscribeButton() {
  const { status: authStatus } = useSession();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setHydrated(true);
      return;
    }
    if (typeof window === "undefined" || typeof Notification === "undefined" || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      setHydrated(true);
      return;
    }
    setPermission(Notification.permission);

    fetch("/api/notification/subscribe")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSubscribed(Boolean(data.subscribed));
          setPublicKey(data.publicKey || null);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, [authStatus]);

  const subscribe = async () => {
    if (!publicKey) {
      setMessage("通知サーバーが未設定です");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setMessage("通知が許可されませんでした");
        setBusy(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const subJSON = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      const res = await fetch("/api/notification/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subJSON),
      });
      if (res.ok) {
        setSubscribed(true);
        setMessage("通知をオンにしました");
      } else {
        setMessage("購読の保存に失敗しました");
      }
    } catch (err) {
      console.error("subscribe error:", err);
      setMessage("購読中にエラーが発生しました");
    }
    setBusy(false);
  };

  const unsubscribe = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await fetch("/api/notification/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
      }
      setSubscribed(false);
      setMessage("通知をオフにしました");
    } catch (err) {
      console.error("unsubscribe error:", err);
      setMessage("解除中にエラーが発生しました");
    }
    setBusy(false);
  };

  const sendTest = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/notification/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(`テスト通知を送りました (${data.sent}/${data.total})`);
      } else {
        setMessage(data.error || "テスト送信失敗");
      }
    } catch {
      setMessage("テスト送信エラー");
    }
    setBusy(false);
  };

  if (authStatus !== "authenticated") return null;
  if (!hydrated) return null;
  if (permission === "unsupported") {
    return (
      <p className="text-xs text-muted-foreground">
        このブラウザは Web Push 通知に対応していません。iOS は ホーム画面に追加した PWA でのみ対応します。
      </p>
    );
  }
  if (permission === "denied") {
    return (
      <p className="text-xs text-muted-foreground">
        通知がブロックされています。ブラウザの設定で許可してから再度お試しください。
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {subscribed ? (
          <>
            <button
              type="button"
              onClick={unsubscribe}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
            >
              <BellOff className="h-3.5 w-3.5" />
              通知をオフにする
            </button>
            <button
              type="button"
              onClick={sendTest}
              disabled={busy}
              className="text-xs text-ocean-mid underline hover:text-ocean-deep disabled:opacity-50"
            >
              テスト通知を送る
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={subscribe}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ocean-mid px-3 py-1.5 text-xs font-medium text-white hover:bg-ocean-deep disabled:opacity-50"
          >
            <Bell className="h-3.5 w-3.5" />
            {busy ? "登録中..." : "プッシュ通知をオンにする"}
          </button>
        )}
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
