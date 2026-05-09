"use client";

import { useState, useEffect } from "react";
import { Bookmark, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  slug: string;
  className?: string;
}

export function WishlistButton({ slug, className }: WishlistButtonProps) {
  const { status } = useSession();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setHydrated(true);
      return;
    }
    let alive = true;
    fetch(`/api/user/wishlist?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        setInWishlist(Boolean(data.inWishlist));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, [slug, status]);

  const handleToggle = async () => {
    if (status !== "authenticated") {
      window.location.href = "/login";
      return;
    }
    if (loading) return;
    setLoading(true);
    const willAdd = !inWishlist;
    setInWishlist(willAdd);
    try {
      const res = await fetch("/api/user/wishlist", {
        method: willAdd ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) setInWishlist(!willAdd);
    } catch {
      setInWishlist(!willAdd);
    }
    setLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading || !hydrated}
      aria-pressed={inWishlist}
      aria-label={inWishlist ? "行きたいリストから外す" : "行きたいリストに追加"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
        inWishlist
          ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-gray-300 bg-white text-driftwood hover:bg-sand-light",
        loading && "opacity-50",
        className,
      )}
    >
      {inWishlist ? (
        <>
          <Check className="h-4 w-4" />
          行きたい登録済
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          行きたい
        </>
      )}
    </button>
  );
}
