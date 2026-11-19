// 最近の釣果（ユーザー投稿＋釣果週報）
//
// 個人情報の扱い:
//  - 投稿者名はプロフィール非公開の人を「非公開の釣り人」に伏せる（スポット詳細ページと同じルール）。
//    データ取得側（getCatchReportsBySpotAsync）でも伏せているが、取得途中の例外で伏せる前の配列が
//    残る経路があるため、ここでもう一度 fail-closed で伏せてから返す。
//  - 写真URL・投稿ID・tsuriId・コメント本文・IP は返さない（魚・サイズ・釣り方・日付・ニックネームのみ）。
//  - サンプル釣果（id: cr-*）は架空なので pickRecentUgcCatches で必ず除外する。
import { getCatchReportsBySpotCached, getWeeklyCatchesBySpot } from "@/lib/data/spot-weekly-catches";
import type { CatchReport } from "@/lib/data/catch-reports";
import type { SpotWeeklyCatchRow } from "@/lib/spot-catch-summary";
import { pickRecentUgcCatches } from "@/lib/spot-recent-catch";
import { maskPrivateAuthors } from "@/lib/private-author";
import { getUserVisibilityCached } from "@/lib/private-author-lookup";
import { type ToolDef, int, requireSpot, siteUrl, withTimeout } from "./shared";

const IO_TIMEOUT_MS = 6000;

async function loadUgc(slug: string): Promise<CatchReport[]> {
  const reports = await getCatchReportsBySpotCached(slug);
  return maskPrivateAuthors(reports, getUserVisibilityCached);
}

export async function getRecentCatches(args: Record<string, unknown>) {
  const spot = requireSpot(args);
  const limit = int(args.limit, 1, 10) ?? 5;

  const [ugc, weeklyBySpot] = await Promise.all([
    withTimeout(loadUgc(spot.slug), IO_TIMEOUT_MS, [] as CatchReport[], "recent catches (ugc)"),
    withTimeout(
      getWeeklyCatchesBySpot(),
      IO_TIMEOUT_MS,
      {} as Record<string, SpotWeeklyCatchRow[]>,
      "recent catches (weekly)",
    ),
  ]);

  const catches = pickRecentUgcCatches(ugc, limit).map((r) => ({
    date: r.date,
    fish: r.fishName,
    sizeCm: r.sizeCm,
    method: r.method || undefined,
    nickname: r.userName || "匿名の釣り人",
  }));
  const weekly = (weeklyBySpot[spot.slug] ?? []).slice(0, limit).map((w) => ({
    reportDate: w.publishedAt,
    fish: w.fish,
    size: w.size || undefined,
    method: w.method || undefined,
    area: w.areaLabel,
    articleUrl: siteUrl(w.articleHref),
  }));

  return {
    spot: spot.name,
    userCatches: catches,
    weeklyReports: weekly,
    note:
      catches.length === 0 && weekly.length === 0
        ? "このスポットの最近の釣果報告はまだありません。時期の目安は get_catchable_fish で確認できます"
        : "userCatches はツリスポ利用者の投稿、weeklyReports はツリスポ編集部の釣果週報に掲載された記録です",
    url: siteUrl(`/spots/${spot.slug}`),
  };
}

export const CATCH_TOOLS: ToolDef[] = [
  {
    name: "get_recent_catches",
    title: "最近の釣果",
    description:
      "釣り場の最近の釣果（ツリスポ利用者の釣果投稿と、編集部の釣果週報でこの釣り場に紐づく行）を新しい順に返します。" +
      "魚・サイズ・釣り方・日付・ニックネームのみで、写真や個人を特定できる情報は含みません。" +
      "「最近◯◯で何が釣れてる？」に使ってください。例: {\"slug\":\"daikoku-futo\",\"limit\":5}",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "search_spots が返した slug" },
        limit: { type: "integer", minimum: 1, maximum: 10, description: "それぞれの最大件数（既定5）" },
      },
      required: ["slug"],
    },
    run: getRecentCatches,
  },
];
