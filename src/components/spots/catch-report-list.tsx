import { Fish, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CatchReport } from "@/lib/data/catch-reports";

interface CatchReportListProps {
  reports: CatchReport[];
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

export function CatchReportList({ reports }: CatchReportListProps) {
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
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Fish className="size-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">
                  <span className="text-emerald-700">{report.userName}</span>
                  さんが
                  <span className="font-bold text-foreground">{report.fishName}</span>
                  を釣りました！
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(report.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="size-3" />
                    {report.userName}
                  </span>
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
