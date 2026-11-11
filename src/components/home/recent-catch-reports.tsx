"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Fish, Calendar, MapPin, Camera } from "lucide-react";
import { catchReports, type CatchReport } from "@/lib/data/catch-reports";
import { SectionHeading } from "@/components/ui/section-heading";
import { SECTION_INNER, SECTION_HEADING_GAP } from "@/components/ui/page-section";

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
    <section className={`${SECTION_INNER} py-10 sm:py-16`}>
      <SectionHeading
        title="みんなの最近の釣果"
        subtitle="全国の釣り人から届いた釣果"
        action={{ href: "/post", label: "投稿する" }}
        className={SECTION_HEADING_GAP}
      />
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide sm:-mx-0 sm:px-0">
        {recent.map((report) => (
          <Link
            key={report.id}
            href={`/spots/${report.spotSlug}`}
            prefetch={false}
            className="w-64 shrink-0 snap-start rounded-2xl bg-card p-4 transition-shadow hover:shadow-md sm:w-72"
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
      <Link
        href="/post"
        prefetch={false}
        className="mt-3 block rounded-2xl bg-card px-4 py-3 text-center text-sm transition-colors hover:text-primary"
      >
        <span className="font-semibold text-primary">あなたの釣果も投稿しよう</span>
        <span className="ml-2 text-muted-foreground">— タップして投稿へ（スポット詳細からはログイン不要）</span>
      </Link>
    </section>
  );
}
