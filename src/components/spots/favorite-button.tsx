"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "tsurispot-favorites";

function getFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setFavorites(slugs: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
}

export function FavoriteButton({ spotSlug }: { spotSlug: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsFavorite(getFavorites().includes(spotSlug));
  }, [spotSlug]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const current = getFavorites();
    let next: string[];
    if (current.includes(spotSlug)) {
      next = current.filter((s) => s !== spotSlug);
    } else {
      next = [...current, spotSlug];
    }
    setFavorites(next);
    setIsFavorite(!isFavorite);

    // ヘッダーのバッジ更新用カスタムイベント
    window.dispatchEvent(new Event("favorites-updated"));

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={toggleFavorite}
      aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
      className={cn(
        "flex items-center justify-center rounded-full p-3 transition-all active:scale-90 min-w-[44px] min-h-[44px]",
        isFavorite
          ? "bg-red-50 hover:bg-red-100"
          : "bg-gray-50 hover:bg-gray-100"
      )}
    >
      <Heart
        className={cn(
          "size-6 transition-transform duration-300",
          isFavorite && "fill-red-500 text-red-500",
          !isFavorite && "text-gray-400",
          isAnimating && "scale-125"
        )}
      />
    </button>
  );
}

export { getFavorites };
