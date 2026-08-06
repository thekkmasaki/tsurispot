"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Repeat2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface RepostButtonProps {
  reportId: string;
  initialCount: number;
  initialReposted: boolean;
  disabled?: boolean; // 自分の投稿はリポスト不可
  className?: string;
}

// リポストボタン（optimistic update）。プロフィールのリポスト一覧に共有される
export function RepostButton({
  reportId,
  initialCount,
  initialReposted,
  disabled,
  className,
}: RepostButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [reposted, setReposted] = useState(initialReposted);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  if (disabled) return null;

  const handleClick = async () => {
    if (status !== "authenticated") {
      toast.info("リポストにはログインが必要です");
      router.push("/login");
      return;
    }
    if (pending) return;

    const next = !reposted;
    setReposted(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    setPending(true);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/repost`, {
        method: next ? "POST" : "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "リポストに失敗しました");
      if (typeof data.count === "number") setCount(Math.max(0, data.count));
      if (next) toast.success("リポストしました（プロフィールに表示されます）");
    } catch (err) {
      setReposted(!next);
      setCount((c) => Math.max(0, c + (next ? -1 : 1)));
      toast.error(err instanceof Error ? err.message : "リポストに失敗しました");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={reposted}
      aria-label={reposted ? "リポストを取り消す" : "リポストする"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
        reposted
          ? "font-semibold text-emerald-600 hover:bg-emerald-50"
          : "text-muted-foreground hover:bg-muted hover:text-emerald-600",
        className,
      )}
    >
      <Repeat2 className="size-4" aria-hidden="true" />
      <span className="tabular-nums">{count > 0 ? count : "リポスト"}</span>
    </button>
  );
}
