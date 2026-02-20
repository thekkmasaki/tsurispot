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

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleFavorite}
      aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
      className="rounded-full"
    >
      <Heart
        className={cn(
          "size-5 transition-transform duration-300",
          isFavorite && "fill-red-500 text-red-500",
          isAnimating && "scale-125"
        )}
      />
    </Button>
  );
}

export { getFavorites };
