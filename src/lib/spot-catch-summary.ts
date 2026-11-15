/**
 * スポット単位の「最新釣果サマリー」（純関数）。
 *
 * 「[スポット名] 釣果」クエリ（GSC: 表示4.5万/28日・CTR4.3%）は“最近いつ何が釣れたか”を求めている。
 * description の言い回し変更（#515）では CTR が動かなかったため、title/description/冒頭に
 * 実在する釣果データ（最新日付・件数・魚）そのものを出す。
 *
 * データ源は実在データのみ:
 *  - UGC 釣果投稿（承認済み・サンプル cr-* 除外）
 *  - 釣果週報（microCMS）の「釣果速報（一覧）」表で、そのスポットへリンクされた行
 * どちらも無い／古い（freshDays 超）スポットは null を返し、呼び出し側は文言を変えない（虚偽表示防止）。
 */

/** これより古い釣果は「最新釣果」として title 等に出さない */
export const SPOT_CATCH_FRESH_DAYS = 28;

export interface SpotWeeklyCatchRow {
  /** 週報の公開日 YYYY-MM-DD */
  publishedAt: string;
  fish: string;
  size: string;
  method: string;
  heat: number;
  /** 週報記事のパス */
  articleHref: string;
  areaSlug: string;
  areaLabel: string;
  /** 週報表のスポット表記 */
  spotLabel: string;
}

export interface SpotCatchSummary {
  /** 最新の釣果日（UGC は釣行日、週報は公開日） YYYY-MM-DD */
  latestDate: string;
  /** freshDays 以内の釣果件数（UGC 投稿数＋週報表の行数） */
  count: number;
  /** 最近釣れた魚（新しい順・重複なし・最大3） */
  fishNames: string[];
  ugcCount: number;
  weeklyCount: number;
}

function ymdToMs(ymd: string): number {
  return Date.parse(`${ymd}T00:00:00+09:00`);
}

/**
 * 魚名セル／投稿の自由記述（例「タチウオ・カマス・アジ」「尺アジ　サバ」「豆アジ（15cm）」「アジやガシラ」）
 * から、title に載せられる短い魚名だけを取り出す。
 */
export function splitFishNames(cell: string): string[] {
  return cell
    .replace(/[（(][^）)]*[）)]/g, "")
    .split(/[・、,，/／\s　]+|や|と/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && s.length <= 6 && !/[0-9０-９]/.test(s));
}

export function buildSpotCatchSummary(
  input: {
    ugc: { id: string; date: string; fishName: string; approved: boolean }[];
    weekly: SpotWeeklyCatchRow[];
  },
  now: Date = new Date(),
  freshDays: number = SPOT_CATCH_FRESH_DAYS,
): SpotCatchSummary | null {
  const nowMs = now.getTime();
  const isFresh = (ymd: string) => {
    const t = ymdToMs(ymd);
    if (Number.isNaN(t)) return false;
    // 未来日（入力ミス）は除外、freshDays 以内のみ
    return t <= nowMs && (nowMs - t) / 86_400_000 <= freshDays;
  };

  const entries: { date: string; fish: string }[] = [];
  let ugcCount = 0;
  let weeklyCount = 0;
  for (const r of input.ugc) {
    if (!r.approved || r.id.startsWith("cr-") || !isFresh(r.date)) continue;
    ugcCount++;
    entries.push({ date: r.date, fish: r.fishName });
  }
  for (const r of input.weekly) {
    if (!isFresh(r.publishedAt)) continue;
    weeklyCount++;
    entries.push({ date: r.publishedAt, fish: r.fish });
  }
  if (entries.length === 0) return null;

  entries.sort((a, b) => b.date.localeCompare(a.date));
  const fishNames: string[] = [];
  for (const e of entries) {
    for (const name of splitFishNames(e.fish)) {
      if (!fishNames.includes(name)) fishNames.push(name);
      if (fishNames.length >= 3) break;
    }
    if (fishNames.length >= 3) break;
  }
  return {
    latestDate: entries[0].date,
    count: entries.length,
    fishNames,
    ugcCount,
    weeklyCount,
  };
}

export interface NearbyRecentCatch {
  slug: string;
  name: string;
  distanceKm: number;
  latestDate: string;
  fishNames: string[];
}

/**
 * 自スポットに最新釣果が無いとき用: 近くで釣果週報に載った釣り場（直線距離 maxKm 以内・近い順）。
 * 座標は resolve で引く（このモジュールはスポットデータを import しない）。
 */
export function pickNearbyRecentCatches(
  self: { slug: string; latitude: number; longitude: number },
  bySpot: Record<string, SpotWeeklyCatchRow[]>,
  resolve: (slug: string) => { name: string; latitude: number; longitude: number } | undefined,
  distanceKm: (lat1: number, lng1: number, lat2: number, lng2: number) => number,
  opts: { maxKm?: number; limit?: number; now?: Date; freshDays?: number } = {},
): NearbyRecentCatch[] {
  const { maxKm = 40, limit = 3, now = new Date(), freshDays = SPOT_CATCH_FRESH_DAYS } = opts;
  const out: NearbyRecentCatch[] = [];
  for (const [slug, rows] of Object.entries(bySpot)) {
    if (slug === self.slug) continue;
    const s = resolve(slug);
    if (!s) continue;
    const d = distanceKm(self.latitude, self.longitude, s.latitude, s.longitude);
    if (!(d <= maxKm)) continue;
    const summary = buildSpotCatchSummary({ ugc: [], weekly: rows }, now, freshDays);
    if (!summary) continue;
    out.push({ slug, name: s.name, distanceKm: d, latestDate: summary.latestDate, fishNames: summary.fishNames });
  }
  return out.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, limit);
}

/** 「2026-11-10」→「11/10」 */
export function formatCatchMonthDay(ymd: string): string {
  const p = ymd.split("-");
  return p.length === 3 ? `${Number(p[1])}/${Number(p[2])}` : ymd;
}
