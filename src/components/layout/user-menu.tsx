"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-driftwood transition-colors hover:bg-sand-light hover:text-foreground"
      >
        <User className="h-4 w-4" />
        <span className="hidden sm:inline">ログイン</span>
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
        className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-sand-light"
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
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 rounded-2xl border bg-white py-2 shadow-xl shadow-ocean-deep/5">
          <div className="border-b px-4 pb-2">
            <p className="truncate text-sm font-medium">{user.nickname}</p>
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
