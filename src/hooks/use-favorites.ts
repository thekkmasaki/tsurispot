"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

const STORAGE_KEY = "tsurispot-favorites";

/** スタンドアロン関数（hookの外で使える） */
export function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  window.dispatchEvent(new Event("favorites-updated"));
}

export function useFavorites() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.tsuriId;
  const [favorites, setFavorites] = useState<string[]>([]);
  const syncedRef = useRef(false);

  // 初期読み込み: localStorageから復元
  useEffect(() => {
    setFavorites(getFavorites());

    const onUpdate = () => setFavorites(getFavorites());
    window.addEventListener("storage", onUpdate);
    window.addEventListener("favorites-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("favorites-updated", onUpdate);
    };
  }, []);

  // 認証時: サーバーから同期（初回のみ）
  useEffect(() => {
    if (!isLoggedIn || syncedRef.current) return;
    syncedRef.current = true;

    (async () => {
      try {
        const res = await fetch("/api/user/favorites");
        if (!res.ok) return;
        const data = await res.json();
        const serverFavs: string[] = data.favorites || [];
        const localFavs = getFavorites();

        // マージ（重複排除）: ローカルとサーバーの和集合
        const merged = [...new Set([...serverFavs, ...localFavs])];

        saveFavorites(merged);
        setFavorites(merged);

        // マージ結果をサーバーに保存
        if (merged.length !== serverFavs.length || !merged.every((s) => serverFavs.includes(s))) {
          fetch("/api/user/favorites", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites: merged }),
          }).catch(() => {});
        }
      } catch { /* ignore */ }
    })();
  }, [isLoggedIn]);

  const syncToServer = useCallback((slugs: string[]) => {
    if (!isLoggedIn) return;
    fetch("/api/user/favorites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorites: slugs }),
    }).catch(() => {});
  }, [isLoggedIn]);

  const addFavorite = useCallback((slug: string) => {
    const current = getFavorites();
    if (!current.includes(slug)) {
      const next = [...current, slug];
      saveFavorites(next);
      setFavorites(next);
      syncToServer(next);
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "increment" }),
      }).catch(() => {});
    }
  }, [syncToServer]);

  const removeFavorite = useCallback((slug: string) => {
    const current = getFavorites();
    const next = current.filter((s) => s !== slug);
    saveFavorites(next);
    setFavorites(next);
    syncToServer(next);
    fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: "decrement" }),
    }).catch(() => {});
  }, [syncToServer]);

  const toggleFavorite = useCallback((slug: string) => {
    const current = getFavorites();
    if (current.includes(slug)) {
      const next = current.filter((s) => s !== slug);
      saveFavorites(next);
      setFavorites(next);
      syncToServer(next);
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "decrement" }),
      }).catch(() => {});
    } else {
      const next = [...current, slug];
      saveFavorites(next);
      setFavorites(next);
      syncToServer(next);
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "increment" }),
      }).catch(() => {});
    }
  }, [syncToServer]);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  return {
    favorites,
    count: favorites.length,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
