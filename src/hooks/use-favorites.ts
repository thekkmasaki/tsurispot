"use client";
import { useState, useEffect, useCallback } from "react";

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
  const [favorites, setFavorites] = useState<string[]>([]);

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

  const addFavorite = useCallback((slug: string) => {
    const current = getFavorites();
    if (!current.includes(slug)) {
      saveFavorites([...current, slug]);
      setFavorites([...current, slug]);
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "increment" }),
      }).catch(() => {});
    }
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    const current = getFavorites();
    const next = current.filter((s) => s !== slug);
    saveFavorites(next);
    setFavorites(next);
    fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action: "decrement" }),
    }).catch(() => {});
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
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
    } else {
      saveFavorites([...current, slug]);
      setFavorites([...current, slug]);
      fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, action: "increment" }),
      }).catch(() => {});
    }
  }, []);

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
