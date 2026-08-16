"use client";
/**
 * 「80点以上の日だけ通知する」購読ボタン（案③）。
 * - 匿名 OK: /api/push/subscribe-index にお気に入り＋行動圏シグナルを同送する
 * - お気に入りが変わったら購読内容を再送して追随する
 * - 解除はサーバー側の登録だけ消す（週報など他の購読は壊さない）
 */
import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

const FLAG_KEY = "tsurispot-index-push";

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

function readRecentSlugs(): string[] {
  try {
    const raw = localStorage.getItem("tsurispot-recently-viewed");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr)
      ? arr
          .map((s: { slug?: string }) => s?.slug)
          .filter((s): s is string => typeof s === "string")
      : [];
  } catch {
    return [];
  }
}

function readSavedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem("tsurispot_user_location");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.latitude === "number" &&
      typeof parsed?.longitude === "number" &&
      Date.now() - (parsed.timestamp ?? 0) < 3600000
    ) {
      return { lat: parsed.latitude, lng: parsed.longitude };
    }
  } catch {
    // noop
  }
  return null;
}

export function IndexPushButton({ favorites }: { favorites: string[] }) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }
    setSupported(true);
    try {
      if (localStorage.getItem(FLAG_KEY) !== "1") return;
    } catch {
      return;
    }
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    });
  }, []);

  const postSubscription = useCallback(
    async (sub: PushSubscription) => {
      const res = await fetch("/api/push/subscribe-index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          favorites,
          recentSlugs: readRecentSlugs(),
          location: readSavedLocation(),
        }),
      });
      return res.ok;
    },
    [favorites],
  );

  // お気に入りが変わったら購読内容を追随させる
  useEffect(() => {
    if (!subscribed || favorites.length === 0) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) await postSubscription(sub).catch(() => {});
    });
  }, [subscribed, favorites, postSubscription]);

  if (!supported || favorites.length === 0) return null;

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      const reg = await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
        }));
      if (await postSubscription(sub)) {
        setSubscribed(true);
        try {
          localStorage.setItem(FLAG_KEY, "1");
        } catch {
          // noop
        }
      }
    } catch (e) {
      console.error("[index-push] subscribe error", e);
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
        await fetch("/api/push/subscribe-index", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
      }
      setSubscribed(false);
      try {
        localStorage.removeItem(FLAG_KEY);
      } catch {
        // noop
      }
    } finally {
      setLoading(false);
    }
  };

  return subscribed ? (
    <button
      onClick={handleUnsubscribe}
      disabled={loading}
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-medium text-emerald-700"
    >
      <Bell className="h-3.5 w-3.5" />
      通知ON（毎朝・80点以上の日のみ）
      <BellOff className="ml-1 h-3 w-3 opacity-60" />
    </button>
  ) : (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
    >
      <Bell className="h-3.5 w-3.5" />
      80点以上の日だけ通知する
    </button>
  );
}
