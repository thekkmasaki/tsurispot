"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Ban } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface BlockButtonProps {
  tsuriId: string;
}

// プロフィール用のブロック/解除ボタン。ブロック時は相互フォローも解除される（インライン確認方式）
export function BlockButton({ tsuriId }: BlockButtonProps) {
  const { data: session, status } = useSession();
  const viewerId = session?.user?.tsuriId;
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/users/${encodeURIComponent(tsuriId)}/block`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBlocked(Boolean(data?.blocked)))
      .catch(() => setBlocked(false));
  }, [status, tsuriId]);

  if (status !== "authenticated" || viewerId === tsuriId || blocked === null) return null;

  const toggle = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(tsuriId)}/block`, {
        method: blocked ? "DELETE" : "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "操作に失敗しました");
      setBlocked(!blocked);
      toast.success(blocked ? "ブロックを解除しました" : "ブロックしました（相互フォローも解除されます）");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "操作に失敗しました");
    } finally {
      setPending(false);
      setConfirming(false);
    }
  };

  if (!blocked && confirming) {
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={toggle}
          disabled={pending}
          className="rounded-md bg-destructive px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {pending ? "処理中..." : "ブロックする"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
        >
          キャンセル
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => (blocked ? toggle() : setConfirming(true))}
      disabled={pending}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      aria-label={blocked ? "ブロックを解除" : "このユーザーをブロック"}
    >
      <Ban className="size-3.5" aria-hidden="true" />
      {blocked ? "ブロック解除" : "ブロック"}
    </button>
  );
}
