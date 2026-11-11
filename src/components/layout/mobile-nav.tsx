"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Heart, MapPin, MoreHorizontal, X, Home, Users, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "./nav-config";
import { useFavorites } from "@/hooks/use-favorites";

// 中央は投稿FAB（下のJSXで固定描画）。「釣果レポート」タブは編集部ブログ行きで
// 「レポートを書く場所」という期待と概念衝突していたため、投稿に置換し /blog は「もっと見る」へ
const mainNavLeft = [
  { href: "/spots", label: "スポット", icon: MapPin },
  { href: "/timeline", label: "タイムライン", icon: Users },
];
const mainNavRight = [
  { href: "/map", label: "地図", icon: Map },
  { href: "/favorites", label: "お気に入り", icon: Heart },
];

// 「もっと」メニューはヘッダーと共通の NAV_GROUPS（目的別グループ・同じラベル）。ホームだけ先頭に足す
const moreNavGroups = [
  { title: "", items: [{ href: "/", label: "ホーム", icon: Home }] },
  ...NAV_GROUPS,
];
const moreNavItems = moreNavGroups.flatMap((g) => g.items);

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
          role="menu"
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
          <div className="max-h-[65vh] space-y-3 overflow-y-auto p-3">
            {moreNavGroups.map((group) => (
              <div key={group.title || "home"}>
                {group.title && <p className="px-1 pb-1 text-xs font-bold text-muted-foreground">{group.title}</p>}
                <div className="grid grid-cols-3 gap-1">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={false}
                        role="menuitem"
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg px-1 py-2.5 text-center text-xs transition-colors touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          isActive ? "bg-accent font-medium text-primary" : "text-foreground hover:bg-muted",
                        )}
                      >
                        <item.icon className="size-5 text-muted-foreground" aria-hidden="true" />
                        <span className="leading-tight">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ボトムナビ */}
      <nav aria-label="メインナビゲーション" className="fixed bottom-0 left-0 right-0 z-50 border-t border-ocean-mid/10 bg-background/95 backdrop-blur-lg md:hidden pb-safe">
        <div className="flex items-center justify-around">
          {[...mainNavLeft, ...mainNavRight].map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const isFav = item.href === "/favorites";
            const link = (
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
            // 左2つの後（中央）に投稿FABを挟む
            if (index === mainNavLeft.length) {
              return (
                <span key={`fab-${item.href}`} className="contents">
                  <Link
                    href="/post"
                    prefetch={false}
                    aria-label="釣果・つぶやきを投稿する"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] transition-colors min-h-[48px] touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      pathname.startsWith("/post") ? "text-ocean-mid" : "text-muted-foreground"
                    )}
                  >
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Send aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="font-medium whitespace-nowrap">投稿</span>
                  </Link>
                  {link}
                </span>
              );
            }
            return link;
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
