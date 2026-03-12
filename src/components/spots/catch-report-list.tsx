"use client";

import { useEffect, useState } from "react";
import { Fish, Calendar, User, Loader2, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export function CatchReportList({ spotSlug, initialReports }: CatchReportListProps) {
  const [reports, setReports] = useState<CatchReport[]>(initialReports);
  const [loading, setLoading] = useState(false);

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
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card key={report.id} className="py-3">
          <CardContent className="px-4">
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
