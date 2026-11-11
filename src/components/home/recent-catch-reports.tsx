"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fish, Calendar, MapPin, Camera } from "lucide-react";
import { catchReports, type CatchReport } from "@/lib/data/catch-reports";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION_INNER, SECTION_HEADING_GAP, SectionMore } from "@/components/ui/page-section";

/**
 * PR-INV-1: ホームに「最近の釣果」 mini feed 表示。
 * 投稿動線改善 + chicken-and-egg 解消の第一歩。
 *
 * 表示ソース: /api/catch-reports/recent（全スポット横断の実投稿 = Redis グローバルリスト）。
 * SSR/JS無効時・API失敗時はハードコードのサンプル承認済みデータを fallback として描画する。
 */
const fallbackReports: CatchReport[] = catchReports
  .filter((r) => r.approved)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 5);

export function RecentCatchReports() {
  const [recent, setRecent] = useState<CatchReport[]>(fallbackReports);

  useEffect(() => {
    let active = true;
    fetch("/api/catch-reports/recent?limit=5")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (
          active &&
          data?.ok &&
          Array.isArray(data.reports) &&
          data.reports.length > 0
        ) {
          setRecent(data.reports as CatchReport[]);
        }
      })
      .catch(() => {
        // 取得失敗時は fallback 表示のまま
      });
    return () => {
      active = false;
    };
  }, []);

  if (recent.length === 0) return null;

  return (
    <section className={`${SECTION_INNER} py-12 sm:py-16`}>
      <SectionHeading
        title="みんなの最近の釣果"
        subtitle="全国の釣り人から届いた釣果"
        className={SECTION_HEADING_GAP}
      />
      <div className="-mx-5 divide-y border-y sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:divide-y-0 sm:border-0 lg:grid-cols-3">
        {recent.map((report) => (
          <Link
            key={report.id}
            href={`/spots/${report.spotSlug}`}
            prefetch={false}
            className="block px-5 py-4 transition-colors hover:bg-muted/60 sm:rounded-lg sm:border sm:p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              {report.date}
              {report.photoUrl && (
                <span className="ml-auto inline-flex items-center gap-0.5">
                  <Camera className="size-3" />
                </span>
              )}
            </div>
            <div className="mb-1 flex items-center gap-2">
              <Fish className="size-4 text-primary" />
              <span className="font-semibold">{report.fishName}</span>
              {report.sizeCm && (
                <span className="text-xs text-muted-foreground">{report.sizeCm}cm</span>
              )}
            </div>
            <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              <span className="truncate">{report.spotName}</span>
            </div>
            {report.comment && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {report.comment}
              </p>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              by {report.userName}
            </p>
          </Link>
        ))}
      </div>
      <SectionMore href="/post" label="あなたの釣果も投稿しよう" />
      <p className="mt-2 text-center text-xs text-muted-foreground">スポット詳細からはログイン不要で投稿できます</p>
    </section>
  );
}
