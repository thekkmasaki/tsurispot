"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { getTitle } from "@/lib/titles";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user?.tsuriId) {
      fetch("/api/user/catch-reports")
        .then((r) => r.json())
        .then((data) => setReportCount(data.reportCount || 0))
        .catch(() => {});
    }
  }, [session?.user?.tsuriId]);

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

  // ローディング中は何も表示しない
  if (status === "loading") {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  // 未ログイン
  if (!session?.user?.tsuriId) {
    return (
      <Link
        href="/login"
        className="flex items-center justify-center rounded-lg p-2 text-driftwood transition-colors hover:bg-sand-light hover:text-foreground"
        aria-label="ログイン"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  // ログイン済み
  const user = session.user;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="ユーザーメニュー"
        className="relative flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-sand-light"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ocean-mid text-xs font-bold text-white">
            {user.nickname.charAt(0)}
          </div>
        )}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
        {(() => {
          const title = getTitle(reportCount);
          return (
            <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-1 py-px text-[8px] leading-none ${title.className}`}>
              {title.emoji}{title.label}
            </span>
          );
        })()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 rounded-2xl border bg-white py-2 shadow-xl shadow-ocean-deep/5">
          <div className="border-b px-4 pb-2">
            <p className="truncate text-sm font-medium">{user.nickname}</p>
            {(() => {
              const title = getTitle(reportCount);
              return (
                <p className="mt-0.5">
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none ${title.className}`}>
                    {title.emoji}{title.label}
                  </span>
                </p>
              );
            })()}
          </div>
          <Link
            href="/mypage"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-driftwood transition-colors hover:bg-sand-light/50"
          >
            <Settings className="h-4 w-4" />
            マイページ
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-driftwood transition-colors hover:bg-sand-light/50"
          >
            <LogOut className="h-4 w-4" />
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
