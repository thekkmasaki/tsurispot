"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useMemo } from "react";
import { getFavorites } from "@/components/spots/favorite-button";
import { ActiveUsers } from "@/components/layout/active-users";
import {
  Fish,
  Map,
  MapPin,
  BookOpen,
  GraduationCap,
  Scale,
  Heart,
  Package,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  ChevronDown,
  Compass,
  FileText,
  Anchor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./search-overlay";

// メインナビ（常時表示：最大5個）
const mainNavItems = [
  { href: "/spots", label: "スポット", icon: MapPin },
  { href: "/map", label: "地図", icon: Map },
  { href: "/fish", label: "図鑑", icon: BookOpen },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/catchable-now", label: "今釣れる", icon: Fish },
];

// ドロップダウン「もっと見る」
const moreNavItems = [
  { href: "/methods", label: "釣り方ガイド", icon: Anchor },
  { href: "/area", label: "エリア一覧", icon: Compass },
  { href: "/area-guide", label: "エリアガイド記事", icon: MapPin },
  { href: "/blog", label: "コラム", icon: FileText },
  { href: "/monthly", label: "月別釣りガイド", icon: Calendar },
  { href: "/guide", label: "釣りガイド", icon: GraduationCap },
  { href: "/bouzu-checker", label: "ボウズ確率チェッカー", icon: Target },
  { href: "/quiz", label: "釣りスタイル診断", icon: Sparkles },
  { href: "/gear", label: "おすすめ道具", icon: Package },
  { href: "/fishing-rules", label: "ルールとマナー", icon: Scale },
];

function DropdownMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ドロップダウン内のリンクがアクティブかチェック
  const hasActiveChild = moreNavItems.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        もっと見る
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border bg-white py-2 shadow-lg">
          {moreNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/5 font-medium text-primary"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    setFavCount(getFavorites().length);
    // localStorageの変更を監視
    const onStorage = () => setFavCount(getFavorites().length);
    window.addEventListener("storage", onStorage);
    // カスタムイベントで同一タブ内の変更も検知
    window.addEventListener("favorites-updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("favorites-updated", onStorage);
    };
  }, []);

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
          {mainNavItems.map((item) => {
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
          <DropdownMenu />
        </nav>

        <div className="flex items-center gap-2">
          <ActiveUsers />
          <SearchOverlay />
          <Link
            href="/favorites"
            className={cn(
              "relative flex items-center justify-center rounded-lg p-2 transition-colors",
              pathname === "/favorites"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            aria-label="お気に入り"
          >
            <Heart className="h-5 w-5" />
            {favCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {favCount > 99 ? "99+" : favCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
