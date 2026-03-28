"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useFavorites } from "@/hooks/use-favorites";
import { getTitle } from "@/lib/titles";
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
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchOverlayClient } from "./search-overlay-client";
import { LineButton } from "./line-button";
import { UserMenu } from "./user-menu";
// メインナビ（常時表示：最大6個）
const mainNavItems = [
  { href: "/spots", label: "スポット", icon: MapPin },
  { href: "/blog", label: "釣果レポート", icon: FileText },
  { href: "/catchable-now", label: "今釣れる", icon: Fish },
  { href: "/map", label: "地図", icon: Map },
  { href: "/ranking", label: "ランキング", icon: Trophy },
  { href: "/fish", label: "図鑑", icon: BookOpen },
];

// ドロップダウン「もっと見る」
const moreNavItems = [
  { href: "/methods", label: "釣り方ガイド", icon: Anchor },
  { href: "/area", label: "エリア一覧", icon: Compass },
  { href: "/area-guide", label: "エリアガイド記事", icon: MapPin },
  { href: "/monthly", label: "月別釣りガイド", icon: Calendar },
  { href: "/guide", label: "釣りガイド", icon: GraduationCap },
  { href: "/bouzu-checker", label: "ボウズ確率チェッカー", icon: Target },
  { href: "/shops", label: "釣具店ガイド", icon: Store },
  { href: "/gear", label: "おすすめ道具", icon: Package },
  { href: "/fishing-rules", label: "ルールとマナー", icon: Scale },
  { href: "/quiz", label: "釣りクイズ", icon: Sparkles },
  { href: "/instructor-exam", label: "インストラクター試験", icon: ClipboardCheck },
  { href: "/catch-reports", label: "釣行レポート", icon: Fish },
  { href: "/umigyo", label: "海業推進", icon: Anchor },
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
        aria-haspopup="true"
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
        <div role="menu" className="absolute right-0 top-full mt-1 w-56 rounded-2xl border bg-white py-2 shadow-xl shadow-ocean-deep/5">
          {moreNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                  isActive
                    ? "bg-ocean-mid/5 font-medium text-ocean-mid"
                    : "text-driftwood hover:bg-sand-light/50"
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
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
  const { data: session } = useSession();
  const { count: favCount } = useFavorites();
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    if (session?.user?.tsuriId) {
      fetch("/api/user/catch-reports")
        .then((r) => r.json())
        .then((data) => setReportCount(data.reportCount || 0))
        .catch(() => {});
    }
  }, [session?.user?.tsuriId]);

  const headerBg = session?.user?.tsuriId
    ? getTitle(reportCount).headerClass
    : "from-white/95 via-white/90 to-sand-light/80";

  return (
    <header className={`sticky top-0 z-50 border-b border-border/40 bg-gradient-to-r ${headerBg} backdrop-blur-lg transition-colors duration-500`}>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-mid to-ocean-deep text-white">
            <Fish className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="bg-gradient-to-r from-ocean-deep to-ocean-mid bg-clip-text text-lg font-bold text-transparent font-[family-name:var(--font-zen-maru)]">ツリスポ</span>
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
          <UserMenu />
          <Link
            href="/favorites"
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
        </div>
      </div>
    </header>
  );
}
