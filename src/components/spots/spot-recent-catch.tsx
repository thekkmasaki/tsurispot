import Link from "next/link";
import { Fish, Newspaper, MessageSquare, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CATCH_RATING_LABELS } from "@/types";
import type { MonthTargetFish, RecentCatchItem } from "@/lib/spot-recent-catch";
import { formatMonthDay } from "@/lib/spot-recent-catch";
import type { WeeklyReportSummary } from "@/lib/weekly-report-areas";
import { MAIN_WEEKLY_AREA_SLUGS, weeklyAreaHubPath } from "@/lib/weekly-report-areas";
import type { NearbyRecentCatch, SpotCatchSummary, SpotWeeklyCatchRow } from "@/lib/spot-catch-summary";
import { formatCatchMonthDay } from "@/lib/spot-catch-summary";

interface SpotRecentCatchProps {
  spotName: string;
  /** 最新のユーザー投稿釣果（サンプルデータは呼び出し側で除外済み） */
  recentCatches: RecentCatchItem[];
  /** 投稿総数（UGCのみ）。「ほか N 件」表示用 */
  ugcTotal: number;
  /** 該当エリアの最新週報。無ければ null で非表示 */
  weekly: WeeklyReportSummary | null;
  /** このスポット自体の最新釣果サマリー（UGC＋週報のスポット行）。無ければ null */
  latestCatch?: SpotCatchSummary | null;
  /** 釣果週報の表でこのスポットにリンクされた行（新しい順） */
  spotWeeklyCatches?: SpotWeeklyCatchRow[];
  /** 自スポットに最新釣果が無いときの、近くの釣り場の直近釣果 */
  nearbyRecentCatches?: NearbyRecentCatch[];
  /** 今月シーズン中の対象魚（釣れる度順） */
  monthTargets: MonthTargetFish[];
  /** 表示上の「今月」（JST、1-12） */
  month: number;
  /** 釣り禁止スポットでは投稿導線を出さない */
  allowPosting: boolean;
}

const TIER_CLASS: Record<MonthTargetFish["tier"], string> = {
  excellent: "text-emerald-600 font-bold",
  good: "text-sky-600",
  fair: "text-muted-foreground",
};

/**
 * 「◯◯の釣果・最近の様子」ブロック（サーバーコンポーネント・タブ外で SSR 本文に必ず入る）。
 *
 * 「[地名] 釣果」クエリは“最近いつ何が釣れたか”を求めているのに、既存ページは
 * 釣果報告がタブ内の下部に置かれ、投稿ゼロのスポットでは釣果に答える本文が無かった。
 * ここでは実在データのみを優先順に出す:
 *   (a) 最新UGC釣果 → (b) エリア最新週報（リンク＋冒頭要約） → (c) 今月の対象魚（既存の季節データ）
 * (a)(b) が無いスポットは (c) と投稿導線だけを出し、空の見出し・架空の釣果は出さない。
 */
export function SpotRecentCatch({
  spotName,
  recentCatches,
  ugcTotal,
  weekly,
  latestCatch = null,
  spotWeeklyCatches = [],
  nearbyRecentCatches = [],
  monthTargets,
  month,
  allowPosting,
}: SpotRecentCatchProps) {
  const hasCatches = recentCatches.length > 0;
  const hasTargets = monthTargets.length > 0;
  const hasWeeklyRows = spotWeeklyCatches.length > 0;
  const hasNearby = nearbyRecentCatches.length > 0;
  // 出せる実データが何も無いときはブロックごと非表示（空見出しを出さない）
  if (!hasCatches && !weekly && !hasTargets && !hasWeeklyRows && !hasNearby) return null;
  // 釣果ハブ（/chouka）への導線: 週報エリアのハブがあればそこ、無ければ全国の一覧
  const hubAreaSlug = weekly?.areaSlug ?? spotWeeklyCatches[0]?.areaSlug;
  const choukaHref =
    hubAreaSlug && MAIN_WEEKLY_AREA_SLUGS.includes(hubAreaSlug) ? weeklyAreaHubPath(hubAreaSlug) : "/chouka";
  const choukaLabel =
    choukaHref === "/chouka"
      ? "全国エリア別の最新釣果を見る"
      : `${weekly?.areaLabel ?? spotWeeklyCatches[0]?.areaLabel}エリアの最新釣果をまとめて見る`;

  return (
    <section id="recent-catch" className="mb-6" aria-labelledby="recent-catch-heading">
      <h2 id="recent-catch-heading" className="mb-3 flex items-center gap-2 text-lg font-bold sm:text-xl">
        <Fish className="size-5 text-primary" aria-hidden="true" />
        {spotName}の釣果・最近の様子
      </h2>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-4 sm:p-5">
          {latestCatch && (
            <p className="text-sm">
              <span className="font-bold">最新釣果 {formatCatchMonthDay(latestCatch.latestDate)}</span>
              <span className="text-muted-foreground">（直近4週間で{latestCatch.count}件</span>
              <span className="text-muted-foreground">
                {latestCatch.ugcCount > 0 && latestCatch.weeklyCount > 0
                  ? `：投稿${latestCatch.ugcCount}・釣果週報${latestCatch.weeklyCount}）`
                  : latestCatch.ugcCount > 0
                    ? "：ユーザー投稿）"
                    : "：釣果週報）"}
              </span>
              {latestCatch.fishNames.length > 0 && (
                <span className="ml-1">最近釣れた魚: <span className="font-medium">{latestCatch.fishNames.join("・")}</span></span>
              )}
            </p>
          )}

          {/* (a) 最新のユーザー釣果 */}
          {hasCatches && (
            <div>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <MessageSquare className="size-4 text-primary" aria-hidden="true" />
                最新の釣果報告
                <span className="text-xs font-normal text-muted-foreground">（ユーザー投稿）</span>
              </h3>
              <ul className="space-y-1.5">
                {recentCatches.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                    <time dateTime={c.date} className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatMonthDay(c.date)}
                    </time>
                    <span className="font-medium">{c.fishName}</span>
                    {c.sizeCm ? <span className="text-xs text-muted-foreground">{c.sizeCm}cm</span> : null}
                    {c.method ? <span className="text-xs text-muted-foreground">{c.method}</span> : null}
                  </li>
                ))}
              </ul>
              <Link
                prefetch={false}
                href="#catch-report"
                className="mt-1.5 inline-block text-xs text-primary underline-offset-2 hover:underline"
              >
                {ugcTotal > recentCatches.length
                  ? `ほか${ugcTotal - recentCatches.length}件の釣果報告を見る`
                  : "釣果報告の詳細・写真を見る"}
              </Link>
            </div>
          )}

          {/* (a2) 釣果週報の表に載ったこのスポットの釣果（施設・釣具店の公開情報を編集部がまとめたもの） */}
          {hasWeeklyRows && (
            <div className={hasCatches ? "border-t pt-4" : undefined}>
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
                <Newspaper className="size-4 text-primary" aria-hidden="true" />
                釣果週報に載った{spotName}の釣果
              </h3>
              <ul className="space-y-1.5">
                {spotWeeklyCatches.map((r, i) => (
                  <li key={`${r.articleHref}-${i}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                    <time dateTime={r.publishedAt} className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {formatCatchMonthDay(r.publishedAt)}週報
                    </time>
                    <span className="font-medium">{r.fish}</span>
                    {r.size && <span className="text-xs text-muted-foreground">{r.size}</span>}
                    {r.method && <span className="text-xs text-muted-foreground">{r.method}</span>}
                    <Link prefetch={false} href={r.articleHref} className="text-xs text-primary underline-offset-2 hover:underline">
                      出典
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* (b) エリアの最新週報 */}
          {weekly && (
            <div className={hasCatches || hasWeeklyRows ? "border-t pt-4" : undefined}>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold">
                <Newspaper className="size-4 text-primary" aria-hidden="true" />
                {weekly.areaLabel}エリアの最新釣果週報
                <time dateTime={weekly.publishedAt} className="text-xs font-normal text-muted-foreground">
                  {weekly.publishedAt.replace(/-/g, "/")}
                </time>
              </h3>
              <Link
                prefetch={false}
                href={weekly.href}
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                {weekly.title}
              </Link>
              {weekly.description && (
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{weekly.description}</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                ※ エリア全体の釣果まとめです。{spotName}自体の釣果は上の「釣果報告」をご確認ください。
              </p>
            </div>
          )}

          {/* (c) 今月の対象魚 */}
          {hasTargets && (
            <div className={hasCatches || weekly || hasWeeklyRows ? "border-t pt-4" : undefined}>
              <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold">
                <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                {month}月に{spotName}で狙える魚
              </h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                {monthTargets.map((f) => (
                  <li key={f.slug}>
                    <Link
                      prefetch={false}
                      href={`/fish/${f.slug}`}
                      className="inline-flex items-center gap-0.5 hover:text-primary hover:underline"
                      title={`${f.name}の釣り方・釣れる時期`}
                    >
                      <span className={TIER_CLASS[f.tier]}>{CATCH_RATING_LABELS[f.tier]}</span>
                      <span className="font-medium">{f.name}</span>
                      <span className="text-[10px] text-muted-foreground">（{f.method}）</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[10px] text-muted-foreground">
                ◎よく釣れる／○釣れる／△まずまず（このスポットの季節データにもとづく目安）
              </p>
            </div>
          )}

          {/* (e) 自スポットに最新釣果が無いとき: 近くの釣り場の直近釣果（実データのみ） */}
          {hasNearby && (
            <div className="border-t pt-4">
              <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-bold">
                <Fish className="size-4 text-primary" aria-hidden="true" />
                近くの別の釣り場の最新釣果
              </h3>
              <p className="mb-1.5 text-xs text-muted-foreground">
                この釣り場の最近の釣果報告はまだありません。以下は近くにある別の釣り場の釣果です。
              </p>
              <ul className="space-y-1 text-sm">
                {nearbyRecentCatches.map((n) => (
                  <li key={n.slug} className="flex flex-wrap items-baseline gap-x-2">
                    <Link prefetch={false} href={`/spots/${n.slug}`} className="font-medium text-primary underline-offset-2 hover:underline">
                      {n.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatCatchMonthDay(n.latestDate)}
                      {n.fishNames.length > 0 && ` ${n.fishNames.join("・")}`}
                      （直線約{Math.max(1, Math.round(n.distanceKm))}km）
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 釣果ハブへの導線 */}
          <p className="border-t pt-3 text-xs">
            <Link prefetch={false} href={choukaHref} className="font-medium text-primary underline-offset-2 hover:underline">
              {choukaLabel}
            </Link>
          </p>

          {/* 投稿導線（UGCが無いときほど強調） */}
          {allowPosting && (
            <p className={`text-xs text-muted-foreground ${hasCatches || weekly || hasTargets ? "border-t pt-3" : ""}`}>
              {hasCatches
                ? "最近釣れた魚があれば"
                : `${spotName}の最初の釣果を投稿しませんか？最初の投稿者は「開拓者」としてこのページに表示されます。`}
              <a href="#catch-report" className="mx-1 font-medium text-primary underline-offset-2 hover:underline">
                釣果を投稿する
              </a>
              （ログイン不要・1分）
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
