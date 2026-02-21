"use client";

import { useState, useEffect } from "react";
import { ThumbsUp } from "lucide-react";

interface FishLikeButtonProps {
  spotSlug: string;
  fishSlug: string;
}

function getStorageKey(spotSlug: string, fishSlug: string) {
  return `fish_like:${spotSlug}:${fishSlug}`;
}

function isLiked(spotSlug: string, fishSlug: string): boolean {
  if (typeof window === "undefined") return false;
  const val = localStorage.getItem(getStorageKey(spotSlug, fishSlug));
  return val !== null;
}

export function FishLikeButton({ spotSlug, fishSlug }: FishLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setLiked(isLiked(spotSlug, fishSlug));
  }, [spotSlug, fishSlug]);

  function handleClick() {
    if (liked || animating) return;
    setAnimating(true);
    localStorage.setItem(getStorageKey(spotSlug, fishSlug), String(Date.now()));
    setLiked(true);
    setTimeout(() => setAnimating(false), 600);
  }

  return (
    <button
      onClick={handleClick}
      disabled={liked}
      aria-label={liked ? "釣れた！済み" : "この魚釣れた！"}
      title={liked ? "釣れた！済み" : "この魚ここで釣れた！"}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition-all duration-300 min-h-[44px] ${
        liked
          ? "bg-blue-100 text-blue-600 cursor-default"
          : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-500 cursor-pointer"
      } ${animating ? "scale-125" : ""}`}
    >
      <ThumbsUp
        className={`size-3.5 transition-transform duration-300 ${
          animating ? "scale-150" : ""
        } ${liked ? "fill-blue-500" : ""}`}
      />
      <span className="hidden sm:inline">
        {liked ? "釣れた！" : "釣れた"}
      </span>
    </button>
  );
}
