"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, Map, MapPin, BookOpen, GraduationCap, Scale, Heart, Store, Globe, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./search-overlay";

const navItems = [
  { href: "/spots", label: "スポット", icon: MapPin },
  { href: "/area", label: "エリア", icon: Globe },
  { href: "/map", label: "地図", icon: Map },
  { href: "/catchable-now", label: "今釣れる", icon: Fish },
  { href: "/fish", label: "図鑑", icon: BookOpen },
  { href: "/shops", label: "釣具店", icon: Store },
  { href: "/guide", label: "ガイド", icon: GraduationCap },
  { href: "/gear", label: "道具", icon: Package },
  { href: "/fishing-rules", label: "ルール", icon: Scale },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Fish className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground">ツリスポ</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Inline search */}
          <SearchOverlay />

          {/* Favorites link */}
          <Link
            href="/favorites"
            className={cn(
              "flex items-center justify-center rounded-lg p-2 transition-colors",
              pathname === "/favorites"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-label="お気に入り"
          >
            <Heart className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
