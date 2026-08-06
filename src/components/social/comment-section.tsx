"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Flag, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import type { PostComment } from "@/lib/social-store";

interface CommentSectionProps {
  reportId: string;
  postAuthorTsuriId?: string;
  initialComments: PostComment[];
}

function formatRelative(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diffMin = Math.floor((Date.now() - t) / 60000);
  if (diffMin < 1) return "たった今";
  if (diffMin < 60) return `${diffMin}分前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}時間前`;
  const d = new Date(t);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// 釣果パーマリンクのコメント欄。投稿はログイン必須、通報は既存 /api/report-flag を commentId で共用
export function CommentSection({ reportId, postAuthorTsuriId, initialComments }: CommentSectionProps) {
  const { data: session, status } = useSession();
  const viewerId = session?.user?.tsuriId;
  const [comments, setComments] = useState<PostComment[]>(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(reportId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "コメントの投稿に失敗しました");
      setComments((prev) => [...prev, data.comment as PostComment]);
      setText("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);
    try {
      const res = await fetch(
        `/api/reports/${encodeURIComponent(reportId)}/comments/${encodeURIComponent(commentId)}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "削除に失敗しました");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const flag = async (commentId: string) => {
    try {
      const res = await fetch("/api/report-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: commentId,
          sessionId: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "通報を受け付けました");
        setFlaggedIds((prev) => new Set(prev).add(commentId));
      } else {
        toast.error(data.message || "通報に失敗しました");
      }
    } catch {
      toast.error("通報に失敗しました");
    }
  };

  return (
    <section aria-label="コメント" className="mt-5 border-t pt-4">
      <h2 className="text-sm font-bold">コメント（{comments.length}）</h2>

      <ul className="mt-3 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="group flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs">
                <Link
                  prefetch={false}
                  href={`/users/${c.authorTsuriId}`}
                  className="font-semibold text-foreground hover:underline"
                >
                  {c.authorNickname}
                </Link>
                <span className="ml-2 text-muted-foreground">{formatRelative(c.createdAt)}</span>
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed">
                {c.text}
              </p>
            </div>
            {viewerId && (viewerId === c.authorTsuriId || viewerId === postAuthorTsuriId) ? (
              <button
                onClick={() => remove(c.id)}
                disabled={deletingId === c.id}
                className="rounded-md p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-50"
                aria-label="コメントを削除"
                title="削除"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            ) : (
              !flaggedIds.has(c.id) && (
                <button
                  onClick={() => flag(c.id)}
                  className="rounded-md p-1 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  aria-label="コメントを通報"
                  title="不適切なコメントを通報"
                >
                  <Flag className="size-3.5" aria-hidden="true" />
                </button>
              )
            )}
          </li>
        ))}
        {comments.length === 0 && (
          <li className="text-sm text-muted-foreground">まだコメントはありません。</li>
        )}
      </ul>

      {status === "authenticated" ? (
        <div className="mt-4">
          <div className="flex items-start gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 100))}
              rows={2}
              placeholder="コメントを書く"
              aria-label="コメント入力"
              className="min-h-9 flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button size="sm" onClick={submit} disabled={submitting || text.trim().length === 0}>
              {submitting ? "送信中..." : "送信"}
            </Button>
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground tabular-nums">
            {text.length}/100
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          コメントするには
          <Link prefetch={false} href="/login" className="mx-1 underline hover:text-foreground">
            ログイン
          </Link>
          してください。
        </p>
      )}
    </section>
  );
}
