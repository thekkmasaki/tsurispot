"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { User, Calendar, Flag, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import type { SpotContribution } from "@/lib/data/spot-contributions";

interface SpotContributionListProps {
  initialContributions: SpotContribution[];
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${Number(parts[0])}年${Number(parts[1])}月${Number(parts[2])}日`;
}

function getSessionId(): string {
  const key = "tsurispot_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function SpotContributionList({ initialContributions }: SpotContributionListProps) {
  // 投稿成功時の router.refresh() で最新が反映されるよう prop を直接使う（釣果一覧と同方針）。
  const contributions = initialContributions;
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // 通報は釣果と同じ /api/report-flag を共用（REPORT#{id}/FLAGGED が立つ → 描画側で除外）。
  const submitFlag = useCallback(async (id: string) => {
    setSubmittingId(id);
    try {
      const res = await fetch("/api/report-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: id, sessionId: getSessionId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "通報を受け付けました");
        setFlaggedIds((prev) => new Set(prev).add(id));
      } else {
        toast.error(data.message || "通報に失敗しました。もう一度お試しください。");
      }
    } catch {
      toast.error("通報に失敗しました。もう一度お試しください。");
    }
    setSubmittingId(null);
    setConfirmingId(null);
  }, []);

  if (contributions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
        <Lightbulb className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">
          まだ釣り場情報がありません。あなたが最初の貢献者になりましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contributions.map((c) => (
        <Card key={c.id} className="group relative py-3">
          <CardContent className="px-4">
            {/* 通報ボタン（インライン確認方式・釣果と共通） */}
            {!flaggedIds.has(c.id) &&
              (confirmingId === c.id ? (
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <button
                    onClick={() => submitFlag(c.id)}
                    disabled={submittingId === c.id}
                    className="rounded-md bg-destructive px-2 py-0.5 text-xs font-medium text-white transition-opacity disabled:opacity-50"
                  >
                    {submittingId === c.id ? "送信中..." : "通報する"}
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingId(c.id)}
                  className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  title="不適切な投稿を通報"
                  aria-label="通報"
                >
                  <Flag className="size-3.5" aria-hidden="true" />
                </button>
              ))}
            <div className="flex items-start gap-2.5">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.text}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <User className="size-3" aria-hidden="true" />
                    {c.tsuriId ? (
                      <Link prefetch={false} href={`/users/${c.tsuriId}`} className="hover:text-foreground hover:underline">
                        {c.userName}
                      </Link>
                    ) : (
                      c.userName
                    )}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" aria-hidden="true" />
                    {formatDate(c.date)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
