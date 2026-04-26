"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites, getFavorites } from "@/hooks/use-favorites";

export function FavoriteButton({ spotSlug }: { spotSlug: string }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleFavorite(spotSlug);

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const fav = isFavorite(spotSlug);

  return (
    <button
      onClick={handleClick}
      aria-label={fav ? "お気に入りから削除" : "お気に入りに追加"}
      className={cn(
        "flex items-center justify-center rounded-full p-3 transition-all active:scale-90 min-w-[44px] min-h-[44px]",
        fav
          ? "bg-red-50 hover:bg-red-100"
          : "bg-gray-50 hover:bg-gray-100"
      )}
    >
      <Heart
        className={cn(
          "size-6 transition-transform duration-300",
          fav && "fill-red-500 text-red-500",
          !fav && "text-gray-400",
          isAnimating && "scale-125"
        )}
      />
    </button>
  );
}

/** 後方互換性のため再エクスポート */
export { getFavorites };
