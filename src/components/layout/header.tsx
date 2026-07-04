"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useFavorites } from "@/hooks/use-favorites";
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
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlayClient } from "./search-overlay-client";
import { LineButton } from "./line-button";
import { UserMenu } from "./user-menu";
// メインナビ（常時表示：最大6個）
const mainNavItems = [
  { href: "/spots", label: "スポット", icon: MapPin },
  { href: "/blog", label: "釣果週報", icon: FileText },
  { href: "/catchable-now", label: "今釣れる", icon: Fish },
  { href: "/map", label: "地図", icon: Map },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/fish", label: "図鑑", icon: BookOpen },
];

// ドロップダウン「もっと見る」（目的別グループ。海業推進・インストラクター試験はフッターへ移設済み）
const moreNavGroups = [
  {
    heading: "探す",
    items: [
      { href: "/area", label: "エリア一覧", icon: Compass },
      { href: "/area-guide", label: "エリアガイド記事", icon: MapPin },
      { href: "/shops", label: "釣具店ガイド", icon: Store },
    ],
  },
  {
    heading: "学ぶ",
    items: [
      { href: "/methods", label: "釣り方ガイド", icon: Anchor },
      { href: "/guide", label: "釣りガイド", icon: GraduationCap },
      { href: "/monthly", label: "月別釣りガイド", icon: Calendar },
      { href: "/fishing-rules", label: "ルールとマナー", icon: Scale },
      { href: "/gear", label: "おすすめ道具", icon: Package },
    ],
  },
  {
    heading: "楽しむ",
    items: [
      { href: "/quiz", label: "釣りクイズ", icon: Sparkles },
      { href: "/bouzu-checker", label: "ボウズ確率チェッカー", icon: Target },
      { href: "/catch-reports", label: "みんなの釣果", icon: Fish },
    ],
  },
];

// アクティブ判定用のフラットリスト
const moreNavItems = moreNavGroups.flatMap((group) => group.items);

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
        aria-expanded={open}
        aria-label="その他のメニュー"
        className={cn(
          "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          hasActiveChild
            ? "bg-ocean-mid/10 text-ocean-mid"
            : "text-driftwood hover:bg-sand-light hover:text-foreground"
        )}
      >
        もっと見る
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <nav
          aria-label="その他のメニュー"
          className="absolute right-0 top-full mt-1 w-[26rem] rounded-2xl border bg-white p-2 shadow-xl shadow-ocean-deep/5"
        >
          <div className="grid grid-cols-2 gap-x-1">
            {moreNavGroups.map((group) => (
              <div
                key={group.heading}
                className={cn("py-1", group.heading === "学ぶ" && "row-span-2")}
              >
                <p className="px-4 pb-1 pt-2 text-xs font-semibold text-muted-foreground">
                  {group.heading}
                </p>
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        isActive
                          ? "bg-ocean-mid/5 font-medium text-ocean-mid"
                          : "text-driftwood hover:bg-sand-light/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count: favCount } = useFavorites();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-gradient-to-r from-white/95 via-white/90 to-sand-light/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" prefetch={false} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-mid to-ocean-deep text-white">
            <Fish className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="bg-gradient-to-r from-ocean-deep to-ocean-mid bg-clip-text text-lg font-bold text-transparent font-display">ツリスポ</span>
        </Link>

        <nav aria-label="メインナビゲーション" className="hidden items-center gap-1 md:flex">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ocean-mid/10 text-ocean-mid"
                    : "text-driftwood hover:bg-sand-light hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
          <DropdownMenu />
        </nav>

        <div className="flex items-center gap-2">
          <SearchOverlayClient />
          <LineButton />
          <Link
            href="/favorites"
            prefetch={false}
            className={cn(
              "relative flex items-center justify-center rounded-lg p-2 transition-colors",
              pathname === "/favorites"
                ? "bg-ocean-mid/10 text-ocean-mid"
                : "text-driftwood hover:bg-sand-light hover:text-foreground"
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
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
