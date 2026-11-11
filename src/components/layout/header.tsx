"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useFavorites } from "@/hooks/use-favorites";
import { Fish, Map, MapPin, Heart, Trophy, ChevronDown, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlayClient } from "./search-overlay-client";
import { LineButton } from "./line-button";
import { UserMenu } from "./user-menu";
import { NotificationBell } from "@/components/social/notification-bell";
import { NAV_GROUPS, isNavActive } from "./nav-config";

// メインナビ。ラベルは whitespace-nowrap 前提のため、全項目が入らない幅では
// 下位項目をバーから隠す（「もっと見る」には NAV_GROUPS で全項目が入っている）。
// 幅の目安: md=スポット+タイムライン / lg=+ブログ+地図 / xl=+ランキング
const mainNavItems = [
  { href: "/spots", label: "スポット", icon: MapPin, bar: "" },
  { href: "/timeline", label: "タイムライン", icon: Users, bar: "" },
  { href: "/blog", label: "ブログ", icon: FileText, bar: "hidden lg:flex" },
  { href: "/map", label: "地図", icon: Map, bar: "hidden lg:flex" },
  { href: "/ranking", label: "ランキング", icon: Trophy, bar: "hidden xl:flex" },
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
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const mainHrefs = new Set(mainNavItems.filter((i) => !i.bar).map((i) => i.href));
  const hasActiveChild = NAV_GROUPS.some((g) =>
    g.items.some((item) => !mainHrefs.has(item.href) && isNavActive(pathname, item.href)),
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="その他のメニュー"
        className={cn(
          "flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          hasActiveChild ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        もっと見る
        <ChevronDown aria-hidden="true" className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 grid w-[30rem] grid-cols-2 gap-x-2 gap-y-3 rounded-xl border bg-background p-3 shadow-lg"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="px-2 pb-1 text-xs font-bold text-muted-foreground">{group.title}</p>
              {group.items.map((item) => {
                const isActive = isNavActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                      isActive ? "bg-accent font-medium text-primary" : "text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count: favCount } = useFavorites();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" prefetch={false} className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Fish className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="whitespace-nowrap font-display text-lg font-bold text-primary">ツリスポ</span>
        </Link>

        <nav aria-label="メインナビゲーション" className="hidden items-center gap-1 md:flex">
          {mainNavItems.map((item) => {
            const isActive = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.bar,
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <DropdownMenu />
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <SearchOverlayClient />
          {/* md〜lg はナビとの幅取り合いで折返しの原因になるため LINE 訴求を一時的に隠す */}
          <span className="md:max-lg:hidden">
            <LineButton />
          </span>
          <Link
            href="/favorites"
            prefetch={false}
            className={cn(
              "relative flex items-center justify-center rounded-lg p-2 transition-colors",
              pathname === "/favorites" ? "text-primary" : "text-muted-foreground hover:text-foreground",
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
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
