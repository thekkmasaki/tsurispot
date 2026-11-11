"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Sakanacchi } from "@/components/fun/sakanacchi";

interface WishlistButtonProps {
  slug: string;
  className?: string;
}

export function WishlistButton({ slug, className }: WishlistButtonProps) {
  const { status } = useSession();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [jumpKey, setJumpKey] = useState(0);

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
    if (willAdd) setJumpKey((k) => k + 1);
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
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors",
        inWishlist
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-primary/60 bg-white text-primary hover:bg-accent",
        loading && "opacity-50",
        className,
      )}
    >
      {/* 追加した瞬間だけ、さかなっちがピチッと跳ねてハートを出す（key で再生し直す） */}
      <Sakanacchi
        key={jumpKey}
        size={22}
        motion={jumpKey > 0 && inWishlist ? "jump" : "none"}
        happy={jumpKey > 0 && inWishlist}
      />
      {inWishlist ? "行きたい登録済" : "行きたい"}
    </button>
  );
}
