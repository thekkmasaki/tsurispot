"use client";
import { useState, useEffect, useCallback } from "react";
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
  const { status } = useSession();
  const [favorites, setFavorites] = useState<string[]>([]);

  // mount 時に localStorage 読み込み + storage / favorites-updated イベント購読
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

  // ログイン時: サーバー側 (Redis) と localStorage を union merge
  // - 別端末で追加したお気に入りを取り込む
  // - 未ログイン時に追加した分をログイン時にサーバー側へ反映
  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch("/api/user/favorites")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const localSlugs = getFavorites();
        const serverSlugs: string[] = Array.isArray(data.favorites)
          ? data.favorites
          : [];
        const merged = Array.from(new Set([...localSlugs, ...serverSlugs]));
        // ローカルとサーバーで内容が違う場合のみ更新
        const localChanged =
          localSlugs.length !== merged.length ||
          localSlugs.some((s) => !merged.includes(s));
        const serverChanged =
          serverSlugs.length !== merged.length ||
          serverSlugs.some((s) => !merged.includes(s));
        if (localChanged) {
          saveFavorites(merged);
          setFavorites(merged);
        }
        if (serverChanged) {
          fetch("/api/user/favorites", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favorites: merged }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [status]);

  // ログイン時はサーバー側 (Redis) にも同期
  const syncToServer = useCallback(
    (slugs: string[]) => {
      if (status !== "authenticated") return;
      fetch("/api/user/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorites: slugs }),
      }).catch(() => {});
    },
    [status],
  );

  const addFavorite = useCallback(
    (slug: string) => {
      const current = getFavorites();
      if (!current.includes(slug)) {
        const next = [...current, slug];
        saveFavorites(next);
        setFavorites(next);
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, action: "increment" }),
        }).catch(() => {});
        syncToServer(next);
      }
    },
    [syncToServer],
  );

  const removeFavorite = useCallback(
    (slug: string) => {
      const current = getFavorites();
      const next = current.filter((s) => s !== slug);
      saveFavorites(next);
      setFavorites(next);
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "decrement" }),
      }).catch(() => {});
      syncToServer(next);
    },
    [syncToServer],
  );

  const toggleFavorite = useCallback(
    (slug: string) => {
      const current = getFavorites();
      if (current.includes(slug)) {
        const next = current.filter((s) => s !== slug);
        saveFavorites(next);
        setFavorites(next);
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, action: "decrement" }),
        }).catch(() => {});
        syncToServer(next);
      } else {
        const next = [...current, slug];
        saveFavorites(next);
        setFavorites(next);
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, action: "increment" }),
        }).catch(() => {});
        syncToServer(next);
      }
    },
    [syncToServer],
  );

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  return {
    favorites,
    count: favorites.length,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
