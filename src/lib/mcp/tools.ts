// ツリスポ MCP サーバーのツール実装（読み取り専用）
//
// Claude / ChatGPT などの AI アシスタントが「明日◯◯で何が釣れる？」「近くの初心者向け釣り場は？」
// に答えるとき、ツリスポのデータを根拠として引用し、詳細ページへ送客するための窓口。
// 書き込み（釣果投稿）は第2段階。ここでは個人情報・投稿データには一切触れない。
//
// 返す URL には utm を付け、GA4 で AI アシスタント経由の流入を計測できるようにする
// （canonical はページ側で固定されているため SEO への影響はない）。
import type { FishingSpot } from "@/types";
import { fishingSpots, dedupRedirects } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { katakanaToHiragana } from "@/lib/search/spot-match";
import { getTideStationForSpot, getTideDisplayMode } from "@/lib/tide/nearest-station";
import { getTideDay } from "@/lib/tide/tide-data";
import { getMoonAgeJST, getTideTypeFromMoonAge } from "@/lib/tide/moon";

const SITE = "https://tsurispot.com";
const UTM = "utm_source=ai_mcp&utm_medium=referral";

export function siteUrl(path: string): string {
  return `${SITE}${path}${path.includes("?") ? "&" : "?"}${UTM}`;
}

const SPOT_TYPE_LABELS: Record<FishingSpot["spotType"], string> = {
  port: "漁港",
  beach: "海岸・浜",
  rocky: "磯",
  river: "河川",
  pier: "桟橋・釣り公園",
  breakwater: "堤防",
  surf: "サーフ",
  lake: "湖",
  pond: "池・管理釣り場",
};

const DIFFICULTY_LABELS: Record<FishingSpot["difficulty"], string> = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
  all: "誰でも",
};

// ---------------------------------------------------------------------------
// 共通ヘルパー
// ---------------------------------------------------------------------------

export class ToolInputError extends Error {}

/** JST の今日 "YYYY-MM-DD" */
export function todayJST(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

function norm(s: string): string {
  return katakanaToHiragana(s.normalize("NFKC")).toLowerCase().trim();
}

export function isMonthInRange(month: number, start: number, end: number): boolean {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

function str(v: unknown, max = 100): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, max);
  return t || undefined;
}

function int(v: unknown, min: number, max: number): number | undefined {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function month(v: unknown): number | undefined {
  const m = int(v, 1, 12);
  if (v !== undefined && v !== null && m === undefined) {
    throw new ToolInputError("month は 1〜12 の数値で指定してください");
  }
  return m;
}

function currentMonthJST(): number {
  return Number(todayJST().slice(5, 7));
}

/** 魚名（和名・かな・英名・別名）→ 一致する魚種 slug 群 */
export function resolveFishSlugs(query: string): Set<string> {
  const q = norm(query);
  const out = new Set<string>();
  if (!q) return out;
  for (const f of fishSpecies) {
    const names = [f.name, f.nameKana, f.nameEnglish, f.slug, ...(f.aliases ?? [])].map(norm);
    if (names.some((n) => n === q)) out.add(f.slug);
  }
  if (out.size > 0) return out;
  // 完全一致がなければ部分一致（「アジ」→「マアジ」等）
  for (const f of fishSpecies) {
    const names = [f.name, f.nameKana, ...(f.aliases ?? [])].map(norm);
    if (names.some((n) => n.includes(q) || (n.length >= 2 && q.includes(n)))) out.add(f.slug);
  }
  return out;
}

function findSpot(slug: string): FishingSpot | undefined {
  const s = slug.trim().replace(/^.*\/spots\//, "").replace(/[/?#].*$/, "");
  const target = dedupRedirects.get(s) ?? s;
  return fishingSpots.find((x) => x.slug === target);
}

function requireSpot(args: Record<string, unknown>): FishingSpot {
  const slug = str(args.slug, 200);
  if (!slug) throw new ToolInputError("slug を指定してください（search_spots の結果に含まれます）");
  const spot = findSpot(slug);
  if (!spot) {
    throw new ToolInputError(`スポット "${slug}" が見つかりません。search_spots で検索してから指定してください`);
  }
  return spot;
}

function banInfo(spot: FishingSpot) {
  if (!spot.fishingBan) return undefined;
  return {
    scope: spot.fishingBan.scope === "full" ? "全面釣り禁止" : "一部区域・条件付きで釣り禁止",
    reason: spot.fishingBan.reason,
    confirmedAt: spot.fishingBan.confirmedAt,
  };
}

function fishInMonth(spot: FishingSpot, m: number) {
  return spot.catchableFish
    .filter((cf) => isMonthInRange(m, cf.monthStart, cf.monthEnd))
    .sort((a, b) => Number(b.peakSeason) - Number(a.peakSeason));
}

// ---------------------------------------------------------------------------
// search_spots
// ---------------------------------------------------------------------------

export function searchSpots(args: Record<string, unknown>) {
  const query = str(args.query);
  const prefecture = str(args.prefecture, 10);
  const fish = str(args.fish, 30);
  const spotType = str(args.spotType, 20) as FishingSpot["spotType"] | undefined;
  const m = month(args.month);
  const beginnerOnly = args.beginnerFriendly === true;
  const limit = int(args.limit, 1, 20) ?? 10;

  if (!query && !prefecture && !fish) {
    throw new ToolInputError("query・prefecture・fish のいずれかを指定してください");
  }
  if (spotType && !(spotType in SPOT_TYPE_LABELS)) {
    throw new ToolInputError(`spotType は ${Object.keys(SPOT_TYPE_LABELS).join(" / ")} のいずれかです`);
  }

  const fishSlugs = fish ? resolveFishSlugs(fish) : null;
  if (fishSlugs && fishSlugs.size === 0) {
    return { total: 0, spots: [], note: `魚種「${fish}」はツリスポに登録がありません` };
  }
  const q = query ? norm(query) : null;
  const prefNorm = prefecture?.replace(/[都道府県]$/, "");

  const scored: { spot: FishingSpot; score: number }[] = [];
  for (const spot of fishingSpots) {
    if (spot.fishingBan?.scope === "full") continue; // 全面禁止は推薦しない
    if (prefNorm && !spot.region.prefecture.startsWith(prefNorm)) continue;
    if (spotType && spot.spotType !== spotType) continue;
    if (beginnerOnly && spot.difficulty !== "beginner" && spot.difficulty !== "all") continue;
    if (q) {
      const hay = norm(
        [spot.name, spot.region.areaName, spot.region.prefecture, spot.address ?? ""].join(" "),
      );
      if (!hay.includes(q)) continue;
    }

    let score = spot.rating || 0;
    if (fishSlugs) {
      const hits = spot.catchableFish.filter(
        (cf) => fishSlugs.has(cf.fish.slug) && (m === undefined || isMonthInRange(m, cf.monthStart, cf.monthEnd)),
      );
      if (hits.length === 0) continue;
      score += 3 + (hits.some((h) => h.peakSeason) ? 2 : 0) + (hits.some((h) => h.source) ? 1 : 0);
    }
    // 出典付きの魚種データがあるスポット（裏取り済み）を優先
    score += Math.min(2, spot.catchableFish.filter((cf) => cf.source).length * 0.5);
    scored.push({ spot, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const m2 = m ?? currentMonthJST();
  return {
    total: scored.length,
    month: m2,
    spots: scored.slice(0, limit).map(({ spot }) => ({
      slug: spot.slug,
      name: spot.name,
      prefecture: spot.region.prefecture,
      area: spot.region.areaName,
      type: SPOT_TYPE_LABELS[spot.spotType],
      difficulty: DIFFICULTY_LABELS[spot.difficulty],
      fishInSeason: fishInMonth(spot, m2)
        .slice(0, 6)
        .map((cf) => cf.fish.name + (cf.peakSeason ? "（最盛期）" : "")),
      facilities: facilityList(spot),
      warning: spot.fishingBan ? `一部釣り禁止: ${spot.fishingBan.reason}` : undefined,
      url: siteUrl(`/spots/${spot.slug}`),
    })),
  };
}

function facilityList(spot: FishingSpot): string[] {
  const f: string[] = [];
  if (spot.isFree) f.push("無料");
  if (spot.hasParking) f.push("駐車場");
  if (spot.hasToilet) f.push("トイレ");
  if (spot.hasFishingShop) f.push("釣具店");
  if (spot.hasConvenienceStore) f.push("コンビニ");
  if (spot.hasRentalRod) f.push("レンタル竿");
  return f;
}

// ---------------------------------------------------------------------------
// get_spot_details
// ---------------------------------------------------------------------------

export function getSpotDetails(args: Record<string, unknown>) {
  const spot = requireSpot(args);
  return {
    slug: spot.slug,
    name: spot.name,
    prefecture: spot.region.prefecture,
    area: spot.region.areaName,
    address: spot.address,
    latitude: spot.latitude,
    longitude: spot.longitude,
    type: SPOT_TYPE_LABELS[spot.spotType],
    difficulty: DIFFICULTY_LABELS[spot.difficulty],
    description: truncate(spot.description, 500),
    access: truncate(spot.accessInfo, 300),
    fee: spot.isFree ? "無料" : spot.feeDetail ?? "有料",
    parking: spot.hasParking ? spot.parkingDetail ?? "あり" : "なし",
    facilities: facilityList(spot),
    catchableFish: spot.catchableFish.slice(0, 20).map((cf) => ({
      fish: cf.fish.name,
      season: `${cf.monthStart}月〜${cf.monthEnd}月`,
      peakSeason: cf.peakSeason,
      method: cf.method,
      bestTime: cf.recommendedTime,
      difficulty: cf.catchDifficulty,
    })),
    bestTimes: spot.bestTimes.map((b) => `${b.label}（${b.timeRange}）`),
    rules: spot.rules
      ? {
          castingAllowed: spot.rules.castingAllowed,
          lureAllowed: spot.rules.lureAllowed,
          chumAllowed: spot.rules.chumAllowed,
          nightFishing: spot.rules.nightFishing,
          other: spot.rules.otherRules,
        }
      : undefined,
    fishingBan: banInfo(spot),
    safetyNotes: spot.safetyNotes,
    url: siteUrl(`/spots/${spot.slug}`),
    notice: "釣り禁止・立入禁止は変更されることがあります。現地の掲示と管理者の指示を優先してください。",
  };
}

function truncate(s: string | undefined, n: number): string | undefined {
  if (!s) return undefined;
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

// ---------------------------------------------------------------------------
// get_tide
// ---------------------------------------------------------------------------

export function getTide(args: Record<string, unknown>) {
  const spot = requireSpot(args);
  const date = str(args.date, 10) ?? todayJST();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw new ToolInputError("date は YYYY-MM-DD 形式で指定してください");
  }

  const phase = getTideTypeFromMoonAge(getMoonAgeJST(date));
  const mode = getTideDisplayMode(spot);
  const base = {
    spot: spot.name,
    date,
    tideType: phase.tideLabel,
    moonAge: Math.round(phase.moonAge * 10) / 10,
    url: siteUrl(`/spots/${spot.slug}`),
  };
  if (mode === "none") {
    return { ...base, note: "淡水（湖・池・内陸）のスポットのため潮汐の影響はありません" };
  }
  const station = getTideStationForSpot(spot);
  const day = station && mode === "full" ? getTideDay(station.code, date) : null;
  if (!station || !day) {
    return {
      ...base,
      note:
        mode === "phase-only"
          ? "河川のスポットのため潮回りのみ表示しています"
          : "この日付の満干潮データはまだありません（潮回りのみ）",
    };
  }
  return {
    ...base,
    station: `${station.name}（約${station.distanceKm}km）`,
    highTides: day.hi.map(([t, cm]) => ({ time: t, levelCm: cm })),
    lowTides: day.lo.map(([t, cm]) => ({ time: t, levelCm: cm })),
    source: "気象庁 潮位表（天文潮推算値）",
  };
}

// ---------------------------------------------------------------------------
// get_catchable_fish
// ---------------------------------------------------------------------------

export function getCatchableFish(args: Record<string, unknown>) {
  const m = month(args.month) ?? currentMonthJST();

  if (str(args.slug, 200)) {
    const spot = requireSpot(args);
    return {
      spot: spot.name,
      month: m,
      fish: fishInMonth(spot, m).map((cf) => ({
        fish: cf.fish.name,
        peakSeason: cf.peakSeason,
        method: cf.method,
        bestTime: cf.recommendedTime,
        difficulty: cf.catchDifficulty,
        fishUrl: siteUrl(`/fish/${cf.fish.slug}`),
      })),
      url: siteUrl(`/spots/${spot.slug}`),
    };
  }

  const prefecture = str(args.prefecture, 10);
  if (!prefecture) throw new ToolInputError("slug か prefecture のどちらかを指定してください");
  const prefNorm = prefecture.replace(/[都道府県]$/, "");

  const agg = new Map<string, { name: string; spots: number; peak: number; examples: string[] }>();
  let spotCount = 0;
  for (const spot of fishingSpots) {
    if (!spot.region.prefecture.startsWith(prefNorm) || spot.fishingBan?.scope === "full") continue;
    spotCount++;
    for (const cf of fishInMonth(spot, m)) {
      const e = agg.get(cf.fish.slug) ?? { name: cf.fish.name, spots: 0, peak: 0, examples: [] };
      e.spots++;
      if (cf.peakSeason) e.peak++;
      if (e.examples.length < 3) e.examples.push(spot.name);
      agg.set(cf.fish.slug, e);
    }
  }
  if (spotCount === 0) {
    throw new ToolInputError(`「${prefecture}」のスポットが見つかりません。都道府県名で指定してください`);
  }
  const ranked = [...agg.entries()]
    .sort((a, b) => b[1].peak * 2 + b[1].spots - (a[1].peak * 2 + a[1].spots))
    .slice(0, 15);
  return {
    prefecture,
    month: m,
    spotsAnalyzed: spotCount,
    fish: ranked.map(([slug, e]) => ({
      fish: e.name,
      spotsCatchable: e.spots,
      spotsPeakSeason: e.peak,
      exampleSpots: e.examples,
      fishUrl: siteUrl(`/fish/${slug}`),
    })),
  };
}

// ---------------------------------------------------------------------------
// ツール定義（MCP tools/list）
// ---------------------------------------------------------------------------

interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => unknown;
}

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

export const TOOLS: ToolDef[] = [
  {
    name: "search_spots",
    title: "釣り場を探す",
    description:
      "日本全国の釣り場（約4,000か所）を、地名・都道府県・狙いたい魚・月・釣り場の種類で検索します。" +
      "釣りに行く場所を提案するときに使ってください。各スポットの slug は他のツールに渡せます。",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "地名やスポット名（例: 横浜、大黒、湘南）" },
        prefecture: { type: "string", description: "都道府県（例: 神奈川県、千葉）" },
        fish: { type: "string", description: "狙いたい魚（例: アジ、アオリイカ、シーバス）" },
        month: { type: "integer", minimum: 1, maximum: 12, description: "釣行予定の月。fish と併用するとその月に釣れるスポットに絞る" },
        spotType: {
          type: "string",
          enum: Object.keys(SPOT_TYPE_LABELS),
          description: "port=漁港, breakwater=堤防, pier=釣り公園, beach=浜, surf=サーフ, rocky=磯, river=河川, lake=湖, pond=池・管理釣り場",
        },
        beginnerFriendly: { type: "boolean", description: "true なら初心者・ファミリー向けのみ" },
        limit: { type: "integer", minimum: 1, maximum: 20, description: "最大件数（既定10）" },
      },
    },
    run: searchSpots,
  },
  {
    name: "get_spot_details",
    title: "釣り場の詳細",
    description:
      "釣り場1か所の詳細（アクセス・駐車場・トイレ・釣れる魚と時期・釣り方・ルール・釣り禁止情報）を返します。",
    inputSchema: {
      type: "object",
      properties: { slug: { type: "string", description: "search_spots が返した slug" } },
      required: ["slug"],
    },
    run: getSpotDetails,
  },
  {
    name: "get_tide",
    title: "潮汐（満潮・干潮）",
    description:
      "釣り場の指定日の潮回り（大潮・小潮など）と満潮・干潮の時刻・潮位を返します（気象庁の推算値、最寄り観測地点）。",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "search_spots が返した slug" },
        date: { type: "string", description: "日付 YYYY-MM-DD（省略時は今日・日本時間）" },
      },
      required: ["slug"],
    },
    run: getTide,
  },
  {
    name: "get_catchable_fish",
    title: "今釣れる魚",
    description:
      "指定月に釣れる魚を返します。slug を指定するとその釣り場、prefecture を指定すると都道府県全体の傾向（釣れるスポット数順）。",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "釣り場の slug（search_spots の結果）" },
        prefecture: { type: "string", description: "都道府県（例: 千葉県）" },
        month: { type: "integer", minimum: 1, maximum: 12, description: "月（省略時は今月）" },
      },
    },
    run: getCatchableFish,
  },
].map((t) => ({ ...t, annotations: { title: t.title, ...READ_ONLY } }));
