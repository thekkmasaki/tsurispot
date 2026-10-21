/**
 * スポット詳細「◯◯の釣果・最近の様子」ブロックの純粋ロジック。
 *  - 今月の対象魚: catchableFish の月データ（既存の実データ）から、今月シーズン中の魚を
 *    釣れる度（◎○△）→旬→名前順で返す。架空の釣果・数字は一切生成しない。
 *  - 最新UGC釣果の整形: 既存の CatchReport（ユーザー投稿のみ、サンプル cr-* は除外）を
 *    表示用に間引く。
 *
 * 釣れる度の判定（getCatchAssessment）は fish-aptitude 側の責務なので、ここでは
 * tier 解決関数を注入してもらう（テストを純粋に保ち、循環 import を避ける）。
 */
import type { CatchTier } from "@/lib/data/fish-aptitude/types";

export interface MonthTargetFish {
  slug: string;
  name: string;
  method: string;
  tier: Exclude<CatchTier, "excluded">;
  peakSeason: boolean;
}

const TIER_ORDER: Record<Exclude<CatchTier, "excluded">, number> = {
  excellent: 0,
  good: 1,
  fair: 2,
};

/** 年またぎ（例: 10月〜3月）対応の月判定 */
export function isMonthInSeason(month: number, start: number, end: number): boolean {
  if (start <= end) return month >= start && month <= end;
  return month >= start || month <= end;
}

/** JST の現在月（1-12）。ISR 生成時刻基準なので月替わり直後は最大 7 日ずれ得る */
export function getJstMonth(now: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en", { timeZone: "Asia/Tokyo", month: "numeric" }).format(now),
  );
}

/**
 * 今月シーズン中の対象魚を釣れる度順に返す。同一魚種は旬フラグ優先で1件に集約。
 * tierOf が "excluded"（生息域外）を返した魚は除外する。
 */
export function getCurrentMonthTargets(
  catchableFish: {
    fish: { slug: string; name: string };
    monthStart: number;
    monthEnd: number;
    peakSeason: boolean;
    method: string;
  }[],
  month: number,
  tierOf: (fishSlug: string) => CatchTier,
  limit = 5,
): MonthTargetFish[] {
  const bySlug = new Map<string, MonthTargetFish>();
  for (const cf of catchableFish) {
    if (!isMonthInSeason(month, cf.monthStart, cf.monthEnd)) continue;
    const tier = tierOf(cf.fish.slug);
    if (tier === "excluded") continue;
    const cand: MonthTargetFish = {
      slug: cf.fish.slug,
      name: cf.fish.name,
      method: cf.method,
      tier,
      peakSeason: cf.peakSeason,
    };
    const prev = bySlug.get(cf.fish.slug);
    if (!prev || (!prev.peakSeason && cand.peakSeason)) bySlug.set(cf.fish.slug, cand);
  }
  return [...bySlug.values()]
    .sort(
      (a, b) =>
        TIER_ORDER[a.tier] - TIER_ORDER[b.tier] ||
        Number(b.peakSeason) - Number(a.peakSeason) ||
        a.name.localeCompare(b.name, "ja"),
    )
    .slice(0, limit);
}

export interface RecentCatchItem {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  fishName: string;
  sizeCm?: number;
  method?: string;
  userName: string;
}

/**
 * 表示用の最新UGC釣果。サンプルデータ（id: cr-*）は架空のため必ず除外し、
 * 承認済みのみ・日付降順・limit 件。
 */
export function pickRecentUgcCatches(
  reports: {
    id: string;
    date: string;
    fishName: string;
    sizeCm?: number;
    method?: string;
    userName: string;
    approved: boolean;
  }[],
  limit = 3,
): RecentCatchItem[] {
  return reports
    .filter((r) => r.approved && !r.id.startsWith("cr-"))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
    .map((r) => ({
      id: r.id,
      date: r.date,
      fishName: r.fishName,
      sizeCm: r.sizeCm,
      method: r.method,
      userName: r.userName,
    }));
}

/** 「2026-10-18」→「10/18」 */
export function formatMonthDay(ymd: string): string {
  const parts = ymd.split("-");
  if (parts.length !== 3) return ymd;
  return `${Number(parts[1])}/${Number(parts[2])}`;
}
