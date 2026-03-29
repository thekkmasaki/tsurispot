"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Fish, Calendar, User, Loader2, Ruler, Flag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CatchReport } from "@/lib/data/catch-reports";
import { getTitle } from "@/lib/titles";

interface CatchReportListProps {
  spotSlug: string;
  initialReports: CatchReport[];
}

const WEATHER_ICONS: Record<string, string> = {
  "晴れ": "☀️",
  "曇り": "☁️",
  "雨": "🌧️",
  "風強い": "💨",
};

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

export function CatchReportList({ spotSlug, initialReports }: CatchReportListProps) {
  const { data: session } = useSession();
  const [reports, setReports] = useState<CatchReport[]>(initialReports);
  const [loading, setLoading] = useState(false);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(`/api/catch-reports?spot=${encodeURIComponent(spotSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.ok && Array.isArray(data.reports)) {
          setReports(data.reports);
        }
      })
      .catch(() => {
        // ハードコード分をそのまま使う
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [spotSlug]);

  const handleDelete = useCallback(async (reportId: string) => {
    if (!confirm("この釣果を削除しますか？")) return;

    setDeletingIds((prev) => new Set(prev).add(reportId));
    try {
      const res = await fetch("/api/catch-report-ugc", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, spotSlug }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        alert(data.error || "削除に失敗しました");
      }
    } catch {
      alert("削除に失敗しました。もう一度お試しください。");
    }
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(reportId);
      return next;
    });
  }, [spotSlug]);

  const handleFlag = useCallback(async (reportId: string) => {
    if (!confirm("この投稿を不適切として通報しますか？")) return;

    try {
      const res = await fetch("/api/report-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, sessionId: getSessionId() }),
      });
      const data = await res.json();
      alert(data.message || "通報を受け付けました");
      setFlaggedIds((prev) => new Set(prev).add(reportId));
    } catch {
      alert("通報に失敗しました。もう一度お試しください。");
    }
  }, []);

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" />
        読み込み中...
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
        <Fish className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">
          まだ釣果報告がありません。最初の報告者になりましょう！
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground/70">
          🎣 投稿すると<a href="/titles" className="font-medium text-ocean-mid underline hover:text-ocean-deep">称号</a>がもらえます！投稿するほどランクアップ！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id} className="group relative py-3">
          <CardContent className="px-4">
            {/* 通報ボタン（ホバーで表示） */}
            {!flaggedIds.has(report.id) && (
              <button
                onClick={() => handleFlag(report.id)}
                className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                title="不適切な投稿を通報"
                aria-label="通報"
              >
                <Flag className="size-3.5" />
              </button>
            )}
            <div className="flex items-start gap-3">
              {report.photoUrl ? (
                <img
                  src={report.photoUrl}
                  alt={`${report.fishName}の釣果写真`}
                  className="size-20 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Fish className="size-4 text-emerald-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">
                  <span className="text-emerald-700">{report.userName}</span>
                  {(() => {
                    const title = report.reportCount ? getTitle(report.reportCount) : null;
                    if (!title) return null;
                    return (
                      <span className={`ml-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none ${title.className}`}>
                        {title.emoji}{title.label}
                      </span>
                    );
                  })()}
                  さんが
                  <span className="font-bold text-foreground">{report.fishName}</span>
                  を釣りました！
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(report.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {report.userName}
                  </span>
                  {report.sizeCm && (
                    <Badge variant="secondary" className="gap-0.5 px-1.5 py-0 text-xs font-normal">
                      <Ruler className="size-3" />
                      {report.sizeCm}cm
                    </Badge>
                  )}
                  {report.method && (
                    <Badge variant="outline" className="px-1.5 py-0 text-xs font-normal">
                      {report.method}
                    </Badge>
                  )}
                  {report.weather && (
                    <span className="flex items-center gap-0.5">
                      {WEATHER_ICONS[report.weather] || ""} {report.weather}
                    </span>
                  )}
                </div>
                {report.comment && (
                  <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                    {report.comment}
                  </p>
                )}
                {/* 自分の投稿の削除ボタン */}
                {session?.user?.tsuriId && report.userId === session.user.tsuriId && (
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingIds.has(report.id)}
                    className="mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingIds.has(report.id) ? (
                      <><Loader2 className="size-3 animate-spin" />削除中...</>
                    ) : (
                      <><Trash2 className="size-3" />この投稿を削除</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {loading && (
        <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
          <Loader2 className="mr-1 size-3 animate-spin" />
          更新を確認中...
        </div>
      )}
    </div>
  );
}
