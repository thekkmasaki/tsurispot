import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Fish, Medal, Award } from "lucide-react";
import { getTitle } from "@/lib/titles";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { InArticleAd } from "@/components/ads/ad-unit";
import { redis } from "@/lib/redis";
import { dbBatchGet } from "@/lib/dynamodb";

// 全スポット横断の最新釣果フィード（/api/catch-report-ugc の POST が push）。投稿者ランキングの実データ源。
const GLOBAL_RECENT_KEY = "recent_reports:global";

interface RawReport {
  id?: string;
  userName?: string;
  spotSlug?: string;
  date?: string;
  approved?: boolean;
}

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "釣果投稿ランキング｜TOP 10 釣り人",
  description: "ツリスポで最も多く釣果を投稿している釣り人 TOP 10。 投稿数で競い合おう、 称号アップを目指そう。 あなたも釣果を投稿してランキングを目指せます。",
  alternates: { canonical: "https://tsurispot.com/ranking/reporters" },
  openGraph: {
    title: "釣果投稿ランキング｜TOP 10 釣り人 - ツリスポ",
    description: "ツリスポで最も活躍中の釣り人 TOP 10。",
    type: "website",
    url: "https://tsurispot.com/ranking/reporters",
    siteName: "ツリスポ",
  },
};

interface ReporterRank {
  userName: string;
  count: number;
  latestDate: string;
  spots: Set<string>;
}

// 実投稿（Redis グローバルリスト）から投稿者を集計する。通報フラグ付き投稿は除外。
// 注: 匿名 userName は一意性が無いため同名は合算される（暫定）。本格化時は投稿時 ZINCRBY の
// leaderboard へ移行する。ISR(revalidate=3600) でキャッシュされるため Redis 負荷は低い。
async function aggregateReporters(): Promise<ReporterRank[]> {
  let reports: RawReport[] = [];
  try {
    const raw = await redis.lrange<string>(GLOBAL_RECENT_KEY, 0, 49);
    const parsed: RawReport[] = [];
    for (const item of raw) {
      try {
        const r = typeof item === "string" ? JSON.parse(item) : item;
        // 自動公開方針下では approved===true のみ公開（fail-closed）
        if (r && r.id && r.approved === true && r.userName) parsed.push(r as RawReport);
      } catch {
        // 壊れたエントリはスキップ
      }
    }
    if (parsed.length > 0) {
      const flagKeys = parsed.map((r) => ({ pk: `REPORT#${r.id}`, sk: "FLAGGED" }));
      const flags = await dbBatchGet(flagKeys);
      reports = parsed.filter((_, i) => flags[i] === null);
    }
  } catch (err) {
    console.error("[reporters] Redis fetch error:", err);
  }

  const map = new Map<string, ReporterRank>();
  for (const report of reports) {
    const userName = report.userName as string;
    const date = report.date || "";
    const spotSlug = report.spotSlug || "";
    const existing = map.get(userName);
    if (existing) {
      existing.count++;
      if (date > existing.latestDate) existing.latestDate = date;
      existing.spots.add(spotSlug);
    } else {
      map.set(userName, {
        userName,
        count: 1,
        latestDate: date,
        spots: new Set([spotSlug]),
      });
    }
  }
  return [...map.values()]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.latestDate.localeCompare(a.latestDate);
    })
    .slice(0, 10);
}

function rankIcon(rank: number) {
  if (rank === 1) return <Trophy className="size-6 text-yellow-500" />;
  if (rank === 2) return <Medal className="size-6 text-slate-400" />;
  if (rank === 3) return <Award className="size-6 text-amber-700" />;
  return <span className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{rank}</span>;
}

export default async function ReporterRankingPage() {
  const ranking = await aggregateReporters();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "ランキング", href: "/ranking" },
          { label: "投稿者ランキング" },
        ]}
      />

      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Trophy className="size-6 text-amber-500" />
          <h1 className="text-2xl font-bold sm:text-3xl">釣果投稿ランキング TOP 10</h1>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">
          ツリスポで最も多く釣果を投稿している釣り人を一覧表示。
          投稿数を増やして称号アップを目指そう。
        </p>
      </header>

      {ranking.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            まだ投稿者がいません。 あなたが最初の 1 位になれます!
          </p>
          <Link
            href="/spots"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            釣り場を探して投稿する →
          </Link>
        </div>
      ) : (
        <ol className="space-y-2">
          {ranking.map((reporter, idx) => {
            const rank = idx + 1;
            const title = getTitle(reporter.count);
            return (
              <li
                key={reporter.userName}
                className="flex items-center gap-3 rounded-xl border bg-card p-3 sm:p-4"
              >
                <div className="shrink-0">{rankIcon(rank)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold sm:text-lg">{reporter.userName}</span>
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] leading-none ${title.className}`}>
                      {title.emoji}{title.label}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Fish className="size-3" />
                      {reporter.count} 件投稿
                    </span>
                    <span>スポット {reporter.spots.size} か所</span>
                    <span>最終: {reporter.latestDate}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <InArticleAd className="my-8" />

      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50 p-5 sm:p-6">
        <h2 className="mb-2 text-base font-bold sm:text-lg">あなたもランキングに名を残そう</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          釣果を投稿するごとに称号がアップし、 ランキングが上位に。 投稿はログイン不要、 ニックネームだけで OK。
        </p>
        <Link
          href="/spots"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          釣り場を選んで投稿する →
        </Link>
      </div>
    </div>
  );
}
