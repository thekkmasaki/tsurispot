import Link from "next/link";
import { Fish, Calendar, MapPin, Camera, ArrowRight } from "lucide-react";
import { catchReports } from "@/lib/data/catch-reports";

/**
 * PR-INV-1: ホームに「最近の釣果」 mini feed 表示。
 * 投稿動線改善 + chicken-and-egg 解消の第一歩。
 *
 * 既存 catch-reports.ts の approved データから最新 5 件を pick。
 */
export function RecentCatchReports() {
  const recent = catchReports
    .filter((r) => r.approved)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold sm:text-lg">
          <Fish className="size-5 text-primary" />
          みんなの最近の釣果
        </h2>
        <Link
          href="/spots"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          投稿する
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide sm:-mx-0 sm:px-0">
        {recent.map((report) => (
          <Link
            key={report.id}
            href={`/spots/${report.spotSlug}`}
            className="w-64 shrink-0 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md sm:w-72"
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
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {report.comment}
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              by {report.userName}
            </p>
          </Link>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-primary/5 px-4 py-3 text-center text-sm">
        <span className="font-semibold text-primary">あなたの釣果も投稿しよう</span>
        <span className="ml-2 text-muted-foreground">— 各スポット詳細から「釣果を報告する」 をクリック (ログイン不要)</span>
      </div>
    </section>
  );
}
