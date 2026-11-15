import Link from "next/link";
import { Table2 } from "lucide-react";
import type { FishingSpot } from "@/types";
import { isFishListedAtSpot } from "@/lib/data/fish-aptitude";
import { getPrefectureByName } from "@/lib/data/prefectures";
import { isMonthInRange } from "@/lib/spot-restrictions";

export interface MonthFishRow {
  slug: string;
  name: string;
  href: string;
  isPeak: boolean;
  methods: string[];
  areas: { label: string; href?: string }[];
  spotCount: number;
}

function topKeys(map: Map<string, number>, n: number): string[] {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

/**
 * 「この月に釣れる魚」表の行をスポットデータから集計する（釣れる度ゲート通過分のみ）。
 * - methods: その月・その魚のエントリで多い釣法（上位2）
 * - areas: groupBy=prefecture なら県（全国の月別ページ用）、area なら市区町村エリア（県×月ページ用）の上位2
 * - isPeak: peakOf を渡せばそれを優先（全国ページは魚種データの peakMonths）、無ければスポットの peakSeason
 */
export function buildMonthFishRows(
  spots: FishingSpot[],
  month: number,
  opts: {
    groupBy: "prefecture" | "area";
    fishOrder?: string[];
    peakOf?: (fishSlug: string) => boolean;
    hrefOf?: (fishSlug: string, spotCount: number) => string;
    limit?: number;
  },
): MonthFishRow[] {
  const agg = new Map<
    string,
    { name: string; peak: boolean; methods: Map<string, number>; areas: Map<string, number>; spotIds: Set<string> }
  >();
  for (const spot of spots) {
    for (const cf of spot.catchableFish) {
      if (!isMonthInRange(month, cf.monthStart, cf.monthEnd)) continue;
      if (!isFishListedAtSpot(spot, cf.fish.slug)) continue;
      let a = agg.get(cf.fish.slug);
      if (!a) {
        a = { name: cf.fish.name, peak: false, methods: new Map(), areas: new Map(), spotIds: new Set() };
        agg.set(cf.fish.slug, a);
      }
      a.peak = a.peak || cf.peakSeason;
      if (cf.method) a.methods.set(cf.method, (a.methods.get(cf.method) ?? 0) + 1);
      if (!a.spotIds.has(spot.id)) {
        a.spotIds.add(spot.id);
        const key = opts.groupBy === "prefecture" ? spot.region.prefecture : spot.region.areaName;
        a.areas.set(key, (a.areas.get(key) ?? 0) + 1);
      }
    }
  }

  const order = opts.fishOrder ?? [...agg.keys()];
  const rows: MonthFishRow[] = [];
  for (const slug of order) {
    const a = agg.get(slug);
    if (!a) continue;
    const spotCount = a.spotIds.size;
    rows.push({
      slug,
      name: a.name,
      href: opts.hrefOf ? opts.hrefOf(slug, spotCount) : `/fish/${slug}`,
      isPeak: opts.peakOf ? opts.peakOf(slug) : a.peak,
      methods: topKeys(a.methods, 2),
      areas: topKeys(a.areas, 2).map((label) => {
        if (opts.groupBy !== "prefecture") return { label };
        const pref = getPrefectureByName(label);
        return { label, href: pref ? `/prefecture/${pref.slug}` : undefined };
      }),
      spotCount,
    });
  }
  if (!opts.fishOrder) {
    rows.sort((a, b) => Number(b.isPeak) - Number(a.isPeak) || b.spotCount - a.spotCount);
  }
  return rows.slice(0, opts.limit ?? 20);
}

/**
 * 月別ページ・県×月ページの「今月釣れる魚」表（サーバーコンポーネント）。
 * 魚名・最盛期か・主な釣り方・代表エリア・掲載スポット数を1表にまとめ、AI/検索が引用しやすい形にする。
 */
export function MonthFishTable({
  heading,
  rows,
  areaHeader,
  note,
}: {
  heading: string;
  rows: MonthFishRow[];
  areaHeader: string;
  note?: string;
}) {
  if (rows.length === 0) return null;
  return (
    <section className="mb-8" aria-labelledby="month-fish-table-heading">
      <h2 id="month-fish-table-heading" className="mb-3 flex items-center gap-2 text-base font-bold sm:text-lg">
        <Table2 className="size-5 text-primary" aria-hidden="true" />
        {heading}
      </h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">{heading}（魚名・最盛期・主な釣り方・{areaHeader}・掲載スポット数）</caption>
          <thead className="bg-muted/40 text-left">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">魚</th>
              <th scope="col" className="px-3 py-2 font-medium">時期</th>
              <th scope="col" className="px-3 py-2 font-medium">主な釣り方</th>
              <th scope="col" className="px-3 py-2 font-medium">{areaHeader}</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">スポット数</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.slug}>
                <th scope="row" className="px-3 py-2 text-left font-medium">
                  <Link prefetch={false} href={r.href} className="text-primary underline-offset-2 hover:underline">
                    {r.name}
                  </Link>
                </th>
                <td className="whitespace-nowrap px-3 py-2">
                  {r.isPeak ? <span className="font-bold text-orange-600">最盛期</span> : <span className="text-muted-foreground">シーズン</span>}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{r.methods.length > 0 ? r.methods.join("・") : "—"}</td>
                <td className="px-3 py-2">
                  {r.areas.map((a, i) => (
                    <span key={a.label}>
                      {a.href ? (
                        <Link prefetch={false} href={a.href} className="underline-offset-2 hover:text-primary hover:underline">
                          {a.label}
                        </Link>
                      ) : (
                        a.label
                      )}
                      {i < r.areas.length - 1 && "・"}
                    </span>
                  ))}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{r.spotCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>}
    </section>
  );
}
