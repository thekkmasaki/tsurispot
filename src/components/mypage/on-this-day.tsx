"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, MapPin, Calendar, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CatchReport {
  id?: string;
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  comment?: string;
}

interface ThisDayData {
  onThisDay: CatchReport[];
  sameMonthThisYear: CatchReport[];
  past7Days: CatchReport[];
}

function MiniReport({ report }: { report: CatchReport }) {
  if (!report.spotSlug) {
    return (
      <div className="rounded-md border bg-background p-2 text-xs">
        <p className="font-medium">{report.fishName ?? "釣果"}</p>
        <p className="text-muted-foreground">{report.date}</p>
      </div>
    );
  }
  return (
    <Link prefetch={false}
      href={`/spots/${report.spotSlug}`}
      className="block rounded-md border bg-background p-2 text-xs transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start gap-2">
        {report.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.photoUrl}
            alt={`${report.fishName ?? "釣果"}の写真`}
            className="h-10 w-10 shrink-0 rounded object-cover"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{report.fishName}</p>
          <div className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" />
              {report.spotName}
            </span>
            <span className="flex items-center gap-0.5">
              <Calendar className="h-2.5 w-2.5" />
              {report.date}
            </span>
            {report.sizeCm && (
              <span className="flex items-center gap-0.5">
                <Ruler className="h-2.5 w-2.5" />
                {report.sizeCm}cm
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function OnThisDay() {
  const [data, setData] = useState<ThisDayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/this-day")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return null;
  const { onThisDay, sameMonthThisYear, past7Days } = data;
  if (onThisDay.length === 0 && sameMonthThisYear.length === 0 && past7Days.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">
          <Sparkles className="h-5 w-5 text-amber-500" />
          振り返り
        </h2>

        {onThisDay.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
              📅 過去の今日 ({onThisDay.length}件)
            </h3>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {onThisDay.map((r) => (
                <MiniReport key={r.id ?? `${r.spotSlug}-${r.date}`} report={r} />
              ))}
            </div>
          </div>
        )}

        {sameMonthThisYear.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
              🌸 今月のこれまでの釣果 ({sameMonthThisYear.length}件)
            </h3>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {sameMonthThisYear.map((r) => (
                <MiniReport key={r.id ?? `${r.spotSlug}-${r.date}`} report={r} />
              ))}
            </div>
          </div>
        )}

        {past7Days.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
              📆 直近1週間 ({past7Days.length}件)
            </h3>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {past7Days.map((r) => (
                <MiniReport key={r.id ?? `${r.spotSlug}-${r.date}`} report={r} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
