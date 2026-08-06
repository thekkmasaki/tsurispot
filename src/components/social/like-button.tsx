"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  reportId: string;
  initialCount: number;
  initialLiked: boolean;
  className?: string;
}

// 釣果へのいいねボタン（optimistic update）。
// 未ログイン時は /login へ誘導。API失敗時は表示を元に戻す。
export function LikeButton({ reportId, initialCount, initialLiked, className }: LikeButtonProps) {
  const { status } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    if (status !== "authenticated") {
      toast.info("いいねにはログインが必要です");
      router.push("/login");
      return;
    }
    if (pending) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));
    setPending(true);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "いいねに失敗しました");
      if (typeof data.count === "number") setCount(Math.max(0, data.count));
    } catch (err) {
      // 失敗したら巻き戻し
      setLiked(!nextLiked);
      setCount((c) => Math.max(0, c + (nextLiked ? -1 : 1)));
      toast.error(err instanceof Error ? err.message : "いいねに失敗しました");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "いいねを取り消す" : "いいねする"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
        liked
          ? "font-semibold text-rose-600 hover:bg-rose-50"
          : "text-muted-foreground hover:bg-muted hover:text-rose-600",
        className,
      )}
    >
      <Heart className={cn("size-4", liked && "fill-current")} aria-hidden="true" />
      <span className="tabular-nums">{count > 0 ? count : "いいね"}</span>
    </button>
  );
}
