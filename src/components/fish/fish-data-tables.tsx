import Link from "next/link";
import { CalendarRange, MapPinned } from "lucide-react";
import type { FishSpecies, RegionSlug, RegionalSeasonData } from "@/types";
import { fishingSpots } from "@/lib/data/spots";
import { isFishListedAtSpot } from "@/lib/data/fish-aptitude";
import { getPrefectureByName } from "@/lib/data/prefectures";
import { REGION_SLUG_TO_NAME, ALL_REGION_SLUGS } from "@/lib/data/fish-regional-seasons";
import { isMonthInRange } from "@/lib/spot-restrictions";

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function mark(month: number, season: number[], peak: number[]): { sym: string; cls: string; label: string } {
  if (peak.includes(month)) return { sym: "◎", cls: "font-bold text-emerald-600", label: "最盛期" };
  if (season.includes(month)) return { sym: "○", cls: "text-sky-600", label: "シーズン" };
  return { sym: "−", cls: "text-muted-foreground", label: "シーズン外" };
}

/** 月ごとに「その月に狙える掲載スポット数」を数える（釣れる度ゲート通過スポットのみ） */
function countSpotsByMonth(fishSlug: string): number[] {
  const counts = new Array<number>(12).fill(0);
  for (const spot of fishingSpots) {
    if (!isFishListedAtSpot(spot, fishSlug)) continue;
    const entries = spot.catchableFish.filter((cf) => cf.fish.slug === fishSlug);
    for (const m of MONTHS) {
      if (entries.some((cf) => isMonthInRange(m, cf.monthStart, cf.monthEnd))) counts[m - 1]++;
    }
  }
  return counts;
}

/**
 * 魚種ページ「月別の釣れやすさ」表（サーバーコンポーネント）。
 * 行: 全国（魚種データの seasonMonths/peakMonths）＋地域差データがある地域＋月別の掲載スポット数。
 * 既存のカレンダー(クライアント・地域切替)は視覚用、こちらは SSR の表で AI/検索が読み取れる形。
 */
export function FishMonthlyTable({
  fish,
  regionalData,
}: {
  fish: Pick<FishSpecies, "slug" | "name" | "seasonMonths" | "peakMonths">;
  regionalData?: Partial<Record<RegionSlug, RegionalSeasonData>>;
}) {
  if (fish.seasonMonths.length === 0 && fish.peakMonths.length === 0) return null;
  const regionRows = ALL_REGION_SLUGS.filter((r) => regionalData?.[r]).map((r) => ({
    label: REGION_SLUG_TO_NAME[r],
    data: regionalData![r]!,
  }));
  const spotCounts = countSpotsByMonth(fish.slug);
  const hasSpotCounts = spotCounts.some((c) => c > 0);

  return (
    <section className="mb-6 sm:mb-8" aria-labelledby="fish-monthly-table-heading">
      <h2 id="fish-monthly-table-heading" className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
        <CalendarRange className="size-5 text-primary" aria-hidden="true" />
        {fish.name}の月別の釣れやすさ（一覧表）
      </h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-center text-xs sm:text-sm">
          <caption className="sr-only">{fish.name}の月別シーズン（◎最盛期・○シーズン・−シーズン外）と掲載スポット数</caption>
          <thead className="bg-muted/40">
            <tr>
              <th scope="col" className="px-2 py-2 text-left font-medium">地域</th>
              {MONTHS.map((m) => (
                <th key={m} scope="col" className="px-1 py-2 font-medium">{m}月</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <th scope="row" className="whitespace-nowrap px-2 py-2 text-left font-medium">全国</th>
              {MONTHS.map((m) => {
                const k = mark(m, fish.seasonMonths, fish.peakMonths);
                return (
                  <td key={m} className={`px-1 py-2 ${k.cls}`} title={k.label}>
                    <span aria-label={k.label}>{k.sym}</span>
                  </td>
                );
              })}
            </tr>
            {regionRows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="whitespace-nowrap px-2 py-2 text-left font-medium">{row.label}</th>
                {MONTHS.map((m) => {
                  const k = mark(m, row.data.seasonMonths, row.data.peakMonths);
                  return (
                    <td key={m} className={`px-1 py-2 ${k.cls}`} title={k.label}>
                      <span aria-label={k.label}>{k.sym}</span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {hasSpotCounts && (
              <tr className="bg-muted/20">
                <th scope="row" className="whitespace-nowrap px-2 py-2 text-left font-medium">狙える掲載スポット数</th>
                {spotCounts.map((c, i) => (
                  <td key={i} className="px-1 py-2 tabular-nums text-muted-foreground">{c}</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        ◎最盛期　○シーズン　−シーズン外。地域行は地域差のある魚種のみ表示。スポット数はツリスポ掲載スポットのうち、その月に{fish.name}が狙える釣り場の数です。
      </p>
    </section>
  );
}

/**
 * 魚種ページ「よく釣れる都道府県と代表スポット」表（サーバーコンポーネント）。
 * fish.spots は釣れる度スコア降順（getFishSpeciesWithSpots）なので、県ごとの先頭が代表スポット。
 */
export function FishPrefectureTable({
  fish,
  limit = 10,
}: {
  fish: Pick<FishSpecies, "slug" | "name" | "spots">;
  limit?: number;
}) {
  if (fish.spots.length === 0) return null;
  const byPref = new Map<string, { name: string; count: number; excellent: number; top: FishSpecies["spots"][number] }>();
  for (const s of fish.spots) {
    const key = s.region.prefecture;
    const cur = byPref.get(key);
    if (cur) {
      cur.count++;
      if (s.catchRating === "excellent") cur.excellent++;
    } else {
      byPref.set(key, { name: key, count: 1, excellent: s.catchRating === "excellent" ? 1 : 0, top: s });
    }
  }
  const rows = [...byPref.values()]
    .sort((a, b) => b.count - a.count || b.excellent - a.excellent)
    .slice(0, limit);
  if (rows.length === 0) return null;

  return (
    <section className="mb-6 sm:mb-8" aria-labelledby="fish-pref-table-heading">
      <h2 id="fish-pref-table-heading" className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
        <MapPinned className="size-5 text-primary" aria-hidden="true" />
        {fish.name}がよく釣れる都道府県と代表スポット
      </h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <caption className="sr-only">{fish.name}が釣れる掲載スポット数の多い都道府県と、各県で釣れる度が最も高い代表スポット</caption>
          <thead className="bg-muted/40 text-left">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">都道府県</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">掲載スポット数</th>
              <th scope="col" className="px-3 py-2 font-medium">代表スポット</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => {
              const pref = getPrefectureByName(r.name);
              // 県×魚種ページは3件以上の県のみ（既存の都道府県別リンクと同じ基準）
              const prefHref = pref && r.count >= 3 ? `/prefecture/${pref.slug}/fish/${fish.slug}` : null;
              return (
                <tr key={r.name}>
                  <th scope="row" className="px-3 py-2 text-left font-medium">
                    {prefHref ? (
                      <Link prefetch={false} href={prefHref} className="text-primary underline-offset-2 hover:underline">
                        {r.name}
                      </Link>
                    ) : (
                      r.name
                    )}
                  </th>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {r.count}件
                    {r.excellent > 0 && <span className="ml-1 text-xs text-emerald-600">（◎{r.excellent}）</span>}
                  </td>
                  <td className="px-3 py-2">
                    <Link prefetch={false} href={`/spots/${r.top.slug}`} className="text-primary underline-offset-2 hover:underline">
                      {r.top.name}
                    </Link>
                    <span className="ml-1 text-xs text-muted-foreground">{r.top.region.areaName}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        ツリスポ掲載スポットの集計（全{fish.spots.length}件）。◎は釣れる度「よく釣れる」の件数、代表スポットは各県で釣れる度スコアが最も高い釣り場です。
      </p>
    </section>
  );
}
