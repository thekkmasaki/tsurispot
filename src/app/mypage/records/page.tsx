"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Trophy, Award, Sparkles, MapPin, Ruler } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";

interface CatchReport {
  id?: string;
  spotSlug?: string;
  spotName?: string;
  fishName?: string;
  date?: string;
  sizeCm?: number;
  method?: string;
  photoUrl?: string;
}

interface RecordsData {
  totalReports: number;
  overallBest: CatchReport | null;
  fishRecords: CatchReport[];
  firstChallenges: CatchReport[];
  seasonBest: {
    spring: CatchReport | null;
    summer: CatchReport | null;
    autumn: CatchReport | null;
    winter: CatchReport | null;
  };
  topSpots: { spotSlug: string; spotName: string; count: number }[];
}

const SEASON_LABELS = {
  spring: { label: "春", emoji: "🌸" },
  summer: { label: "夏", emoji: "🌞" },
  autumn: { label: "秋", emoji: "🍁" },
  winter: { label: "冬", emoji: "❄️" },
} as const;

function ReportCard({ report, big = false }: { report: CatchReport; big?: boolean }) {
  if (!report.spotSlug) {
    return (
      <div className="rounded-md border bg-background p-3">
        <p className="font-medium">{report.fishName ?? "釣果"}</p>
      </div>
    );
  }
  return (
    <Link
      href={`/spots/${report.spotSlug}`}
      className={`flex gap-3 rounded-md border bg-background transition-colors hover:bg-muted/50 ${
        big ? "p-3" : "p-2"
      }`}
    >
      {report.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={report.photoUrl}
          alt=""
          className={`shrink-0 rounded object-cover ${big ? "h-16 w-16" : "h-12 w-12"}`}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${big ? "text-base" : "text-sm"}`}>
          {report.fishName}
          {report.sizeCm && (
            <span className="ml-2 text-primary">
              <Ruler className="mr-0.5 inline h-3 w-3" />
              {report.sizeCm}cm
            </span>
          )}
        </p>
        <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <MapPin className="h-3 w-3" />
            {report.spotName}
          </span>
          <span>{report.date}</span>
          {report.method && <span>{report.method}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function RecordsPage() {
  const { status } = useSession();
  const [data, setData] = useState<RecordsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user/personal-records")
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground">ログインが必要です。</p>
        <Link
          href="/login"
          className="mt-3 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          ログイン
        </Link>
      </div>
    );
  }

  if (!data || data.totalReports === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <Breadcrumb
          items={[
            { label: "ホーム", href: "/" },
            { label: "マイページ", href: "/mypage" },
            { label: "個人記録" },
          ]}
        />
        <Link
          href="/mypage"
          className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          マイページに戻る
        </Link>
        <p className="text-sm text-muted-foreground">
          まだ釣果がありません。釣果を投稿すると個人記録が表示されます。
        </p>
      </div>
    );
  }

  const { overallBest, fishRecords, firstChallenges, seasonBest, topSpots } = data;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "マイページ", href: "/mypage" },
          { label: "個人記録" },
        ]}
      />

      <Link
        href="/mypage"
        className="mb-4 inline-flex items-center gap-1 py-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        マイページに戻る
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Trophy className="h-6 w-6 text-amber-500" />
          個人記録 (PR)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          通算{data.totalReports}件の釣果から、あなたのベスト記録をピックアップ
        </p>
      </div>

      <div className="space-y-5">
        {overallBest && overallBest.sizeCm && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-4">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-bold sm:text-base">
                <Award className="h-5 w-5 text-amber-500" />
                自己最大魚
              </h2>
              <ReportCard report={overallBest} big />
            </CardContent>
          </Card>
        )}

        {fishRecords.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">
                <Trophy className="h-5 w-5 text-amber-500" />
                魚種別ベストサイズ TOP {fishRecords.length}
              </h2>
              <div className="space-y-1.5">
                {fishRecords.map((r, idx) => (
                  <div
                    key={r.id ?? `${r.spotSlug}-${idx}`}
                    className="flex items-center gap-2"
                  >
                    <span className="w-6 text-right text-xs font-bold text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <ReportCard report={r} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">
              <Sparkles className="h-5 w-5 text-purple-500" />
              季節別ベスト
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(SEASON_LABELS) as Array<keyof typeof SEASON_LABELS>).map(
                (season) => {
                  const r = seasonBest[season];
                  const meta = SEASON_LABELS[season];
                  return (
                    <div key={season}>
                      <h3 className="mb-1 text-xs font-medium text-muted-foreground">
                        {meta.emoji} {meta.label}
                      </h3>
                      {r ? (
                        <ReportCard report={r} />
                      ) : (
                        <div className="rounded-md border bg-muted/30 p-2 text-xs text-muted-foreground">
                          記録なし
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>

        {firstChallenges.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                直近の初挑戦魚種
              </h2>
              <div className="space-y-1.5">
                {firstChallenges.map((r, idx) => (
                  <ReportCard key={r.id ?? idx} report={r} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {topSpots.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold sm:text-base">
                <MapPin className="h-5 w-5 text-sky-500" />
                よく行くスポット TOP {topSpots.length}
              </h2>
              <div className="space-y-1.5">
                {topSpots.map((s, idx) => (
                  <Link
                    key={s.spotSlug}
                    href={`/spots/${s.spotSlug}`}
                    className="flex items-center justify-between rounded-md border bg-background p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 text-right text-xs font-bold text-muted-foreground">
                        {idx + 1}.
                      </span>
                      <span className="text-sm font-medium">{s.spotName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{s.count}件</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
