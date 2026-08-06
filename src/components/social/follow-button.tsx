"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface FollowButtonProps {
  tsuriId: string;
  className?: string;
}

// ユーザーカード用の小型フォローボタン（既存 /api/follow を利用）。
// 自分自身のカードでは非表示になる
export function FollowButton({ tsuriId, className }: FollowButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const viewerId = session?.user?.tsuriId;
  const [following, setFollowing] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setFollowing(false);
      return;
    }
    fetch(`/api/follow?tsuriId=${encodeURIComponent(tsuriId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setFollowing(Boolean(data?.following)))
      .catch(() => setFollowing(false));
  }, [status, tsuriId]);

  if (viewerId === tsuriId) return null;

  const handleClick = async () => {
    if (status !== "authenticated") {
      toast.info("フォローにはログインが必要です");
      router.push("/login");
      return;
    }
    if (pending || following === null) return;

    const next = !following;
    setFollowing(next);
    setPending(true);
    try {
      const res = await fetch("/api/follow", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tsuriId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "操作に失敗しました");
    } catch (err) {
      setFollowing(!next);
      toast.error(err instanceof Error ? err.message : "操作に失敗しました");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || following === null}
      className={cn(
        "shrink-0 rounded-full border-[1.5px] px-4 py-1 text-xs font-semibold transition-colors disabled:opacity-60",
        following
          ? "border-ocean-mid bg-ocean-mid text-white hover:opacity-90"
          : "border-ocean-mid bg-transparent text-ocean-mid hover:bg-ocean-mid/10",
        className,
      )}
    >
      {following === null ? "…" : following ? "フォロー中" : "フォロー"}
    </button>
  );
}
