"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Fish, Calendar, User, Ruler, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import type { CatchReport } from "@/lib/data/catch-reports";

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
  // initialReports を useState で固定すると router.refresh() 後も古い一覧のままになるため、
  // prop を直接使う（投稿成功時の router.refresh() で新しい釣果が反映される）。
  const reports = initialReports;
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // ネイティブ confirm()/alert() を排除し、インライン確認 + 二重送信ガード + トースト通知に置換。
  const submitFlag = useCallback(async (reportId: string) => {
    setSubmittingId(reportId);
    try {
      const res = await fetch("/api/report-flag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, sessionId: getSessionId() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "通報を受け付けました");
        setFlaggedIds((prev) => new Set(prev).add(reportId));
      } else {
        toast.error(data.message || "通報に失敗しました。もう一度お試しください。");
      }
    } catch {
      toast.error("通報に失敗しました。もう一度お試しください。");
    }
    setSubmittingId(null);
    setConfirmingId(null);
  }, []);

  if (reports.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-6 text-center">
        <Fish className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm text-muted-foreground">
          まだ釣果報告がありません。最初の報告者になりましょう！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id} className="group relative py-3">
          <CardContent className="px-4">
            {/* 通報ボタン（インライン確認方式） */}
            {!flaggedIds.has(report.id) && (
              confirmingId === report.id ? (
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <button
                    onClick={() => submitFlag(report.id)}
                    disabled={submittingId === report.id}
                    className="rounded-md bg-destructive px-2 py-0.5 text-xs font-medium text-white transition-opacity disabled:opacity-50"
                  >
                    {submittingId === report.id ? "送信中..." : "通報する"}
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
                  onClick={() => setConfirmingId(report.id)}
                  className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground/30 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                  title="不適切な投稿を通報"
                  aria-label="通報"
                >
                  <Flag className="size-3.5" aria-hidden="true" />
                </button>
              )
            )}
            <div className="flex items-start gap-3">
              {report.photoUrl ? (
                <Image
                  src={report.photoUrl}
                  alt={`${report.fishName}の釣果写真`}
                  width={80}
                  height={80}
                  className="size-20 shrink-0 rounded-lg border object-cover"
                  unoptimized
                />
              ) : (
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <Fish className="size-4 text-emerald-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">
                  {report.tsuriId ? (
                    <Link prefetch={false}
                      href={`/users/${report.tsuriId}`}
                      className="text-emerald-700 hover:underline"
                    >
                      {report.userName}
                    </Link>
                  ) : (
                    <span className="text-emerald-700">{report.userName}</span>
                  )}
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
                    {report.tsuriId ? (
                      <Link prefetch={false}
                        href={`/users/${report.tsuriId}`}
                        className="hover:underline hover:text-foreground"
                      >
                        {report.userName}
                      </Link>
                    ) : (
                      report.userName
                    )}
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
                      <span aria-hidden="true">{WEATHER_ICONS[report.weather] || ""}</span> {report.weather}
                    </span>
                  )}
                </div>
                {report.comment && (
                  <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                    {report.comment}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
