"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

/**
 * Web Push 通知の subscribe UI (Phase 4)
 *
 * Service Worker は /sw.js (既存) に実装済み (push handler + notificationclick handler)。
 * このコンポーネントは subscription を作成し /api/push/subscribe に送信するだけ。
 *
 * VAPID_PUBLIC_KEY は process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY (既設定済み) から取得。
 */
export function PushSubscribe({ className }: { className?: string }) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);
    setPermission(Notification.permission);
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    });
  }, []);

  if (!supported) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.error("[push] VAPID_PUBLIC_KEY 未設定");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (res.ok) {
        setIsSubscribed(true);
      } else {
        console.error("[push] subscribe API error", res.status);
      }
    } catch (e) {
      console.error("[push] subscribe error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error("[push] unsubscribe error", e);
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <button
        type="button"
        onClick={handleUnsubscribe}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/30 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted ${className ?? ""}`}
      >
        <BellOff className="size-3" />
        通知を解除
      </button>
    );
  }

  if (permission === "denied") {
    return (
      <div className={`text-xs text-muted-foreground ${className ?? ""}`}>
        通知がブロックされています。 ブラウザ設定から有効化してください。
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 ${className ?? ""}`}
    >
      <Bell className="size-4" />
      釣果通知を受け取る
    </button>
  );
}

/** VAPID public key (base64url) を Uint8Array に変換 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
