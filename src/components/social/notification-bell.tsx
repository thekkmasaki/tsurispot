"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

// ヘッダーの通知ベル。未読数は mount + window focus 時のみ取得（ポーリング禁止 = App Runner CPU配慮）。
export function NotificationBell() {
  const { status } = useSession();
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") return;
    const load = () => {
      fetch("/api/notifications/unread-count")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.count === "number") setCount(data.count);
        })
        .catch(() => {});
    };
    load();
    window.addEventListener("focus", load);
    return () => window.removeEventListener("focus", load);
  }, [status, pathname]);

  if (status !== "authenticated") return null;

  return (
    <Link
      href="/notifications"
      prefetch={false}
      onClick={() => setCount(0)}
      className={cn(
        "relative flex items-center justify-center rounded-lg p-2 transition-colors",
        pathname === "/notifications"
          ? "bg-ocean-mid/10 text-ocean-mid"
          : "text-driftwood hover:bg-sand-light hover:text-foreground",
      )}
      aria-label={count > 0 ? `通知（未読${count}件）` : "通知"}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
