"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Fish,
  Heart,
  MapPin,
  MoreHorizontal,
  X,
  Trophy,
  BookOpen,
  GraduationCap,
  Scale,
  Target,
  Sparkles,
  Calendar,
  Compass,
  Package,
  Home,
  FileText,
  Anchor,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";

const mainNavItems = [
  { href: "/spots", label: "スポット", icon: MapPin },
  { href: "/blog", label: "釣果週報", icon: FileText },
  { href: "/catchable-now", label: "今釣れる", icon: Fish },
  { href: "/map", label: "地図", icon: Map },
  { href: "/favorites", label: "お気に入り", icon: Heart },
];

// 「もっと見る」（ヘッダーのドロップダウンと同じグループ・ラベルに同期）
const moreNavGroups = [
  {
    heading: "メイン",
    items: [
      { href: "/", label: "ホーム", icon: Home },
      { href: "/ranking", label: "ランキング", icon: Trophy },
      { href: "/fish", label: "魚図鑑", icon: BookOpen },
    ],
  },
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

export function MobileNav() {
  const pathname = usePathname();
  const { count: favCount } = useFavorites();
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ページ遷移時にメニューを閉じる
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  // 外部クリックで閉じる + Escキーで閉じる
  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  // 「もっと見る」のアイテムが現在アクティブかチェック
  const hasActiveMore = moreNavItems.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/" && pathname.startsWith(item.href))
  );

  return (
    <>
      {/* もっと見るメニュー（オーバーレイ） */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden" />
      )}

      {moreOpen && (
        <div
          ref={menuRef}
          className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-2 right-2 z-50 rounded-3xl border bg-background shadow-2xl shadow-ocean-deep/10 md:hidden animate-in slide-in-from-bottom-4 duration-200 overscroll-contain"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="text-sm font-bold text-foreground font-display">メニュー</span>
            <button
              onClick={() => setMoreOpen(false)}
              aria-label="メニューを閉じる"
              className="rounded-full p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="size-5 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
          <nav
            aria-label="その他のメニュー"
            className="max-h-[60vh] overflow-y-auto p-3"
          >
            {moreNavGroups.map((group, groupIndex) => (
              <div key={group.heading} className={cn(groupIndex > 0 && "mt-2")}>
                <p className="px-2 pb-1.5 text-xs font-semibold text-muted-foreground">
                  {group.heading}
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl px-2 py-3.5 text-center text-xs transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isActive
                            ? "bg-ocean-mid/10 text-ocean-mid font-medium"
                            : "text-muted-foreground hover:bg-sand-light/50"
                        )}
                      >
                        <item.icon className="size-5" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* ボトムナビ */}
      <nav aria-label="メインナビゲーション" className="fixed bottom-0 left-0 right-0 z-50 border-t border-ocean-mid/10 bg-background/95 backdrop-blur-lg md:hidden pb-safe">
        <div className="flex items-center justify-around">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const isFav = item.href === "/favorites";
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] transition-colors min-h-[48px] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive
                    ? "text-ocean-mid"
                    : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <item.icon
                    aria-hidden="true"
                    className={cn("h-5 w-5", isActive && "fill-ocean-mid/20")}
                  />
                  {isFav && favCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white">
                      {favCount > 99 ? "99+" : favCount}
                    </span>
                  )}
                </div>
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
          {/* もっと見るボタン */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-label="その他のメニュー"
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] transition-colors min-h-[48px] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              moreOpen || hasActiveMore ? "text-ocean-mid" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal aria-hidden="true" className={cn("h-5 w-5", (moreOpen || hasActiveMore) && "fill-ocean-mid/20")} />
            <span className="font-medium whitespace-nowrap">もっと</span>
          </button>
        </div>
      </nav>
    </>
  );
}
