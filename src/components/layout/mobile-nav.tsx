"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Fish, Heart, MapPin, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFavorites } from "@/components/spots/favorite-button";

const navItems = [
  { href: "/spots", label: "スポット", icon: MapPin },
  { href: "/map", label: "地図", icon: Map },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/catchable-now", label: "今釣れる", icon: Fish },
  { href: "/favorites", label: "お気に入り", icon: Heart },
];

export function MobileNav() {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    setFavCount(getFavorites().length);
    const onUpdate = () => setFavCount(getFavorites().length);
    window.addEventListener("storage", onUpdate);
    window.addEventListener("favorites-updated", onUpdate);
    return () => {
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("favorites-updated", onUpdate);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-white/95 backdrop-blur-lg md:hidden pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const isFav = item.href === "/favorites";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs transition-colors min-h-[52px] min-w-[52px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn("h-5 w-5", isActive && "fill-primary/20")}
                />
                {isFav && favCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {favCount > 99 ? "99+" : favCount}
                  </span>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
