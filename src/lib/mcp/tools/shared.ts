// ツリスポ MCP ツール共通ヘルパー
//
// 返す URL には utm を付け、GA4 で AI アシスタント経由の流入を計測できるようにする
// （canonical はページ側で固定されているため SEO への影響はない）。
import type { FishingSpot } from "@/types";
import { fishingSpots, dedupRedirects } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { katakanaToHiragana } from "@/lib/search/spot-match";

const SITE = "https://tsurispot.com";
const UTM = "utm_source=ai_mcp&utm_medium=referral";

export function siteUrl(path: string): string {
  // #アンカーは utm の後ろに回す（クエリより後ろにないとブラウザが utm をアンカー扱いする）
  const hashAt = path.indexOf("#");
  const base = hashAt >= 0 ? path.slice(0, hashAt) : path;
  const hash = hashAt >= 0 ? path.slice(hashAt) : "";
  return `${SITE}${base}${base.includes("?") ? "&" : "?"}${UTM}${hash}`;
}

export const SPOT_TYPE_LABELS: Record<FishingSpot["spotType"], string> = {
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

export const DIFFICULTY_LABELS: Record<FishingSpot["difficulty"], string> = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
  all: "誰でも",
};

export const LEVEL_LABELS: Record<"beginner" | "intermediate" | "advanced", string> = {
  beginner: "初心者向け",
  intermediate: "中級者向け",
  advanced: "上級者向け",
};

export const RULES_NOTICE =
  "釣り禁止・立入禁止は変更されることがあります。現地の掲示と管理者の指示を優先してください。";

// ---------------------------------------------------------------------------
// エラー
// ---------------------------------------------------------------------------

/** AI にそのまま見せてよいメッセージを持つツールエラー（isError のツール結果になる） */
export class ToolError extends Error {}

/** 入力ミス。AI が引数を直して再試行できるよう、何が悪いかを書く */
export class ToolInputError extends ToolError {}

// ---------------------------------------------------------------------------
// ツール定義
// ---------------------------------------------------------------------------

export interface ToolDef {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => unknown | Promise<unknown>;
  /** READ_ONLY の既定を上書きする注釈（例: 外部APIを呼ぶツールは openWorldHint: true） */
  annotations?: Partial<typeof READ_ONLY>;
}

/** 1回の呼び出しで返す一覧の上限（一覧系ツール共通。詳細系は1件のみ返す） */
export const MAX_LIST = 20;

export const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

// ---------------------------------------------------------------------------
// 入力の正規化
// ---------------------------------------------------------------------------

/** JST の今日 "YYYY-MM-DD" */
export function todayJST(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}

/** "YYYY-MM-DD" に日数を足す（暦日計算。タイムゾーンに依存しない） */
export function addDaysYmd(ymd: string, days: number): string {
  const t = Date.parse(`${ymd}T00:00:00Z`) + days * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export function norm(s: string): string {
  return katakanaToHiragana(s.normalize("NFKC")).toLowerCase().trim();
}

export function isMonthInRange(month: number, start: number, end: number): boolean {
  return start <= end ? month >= start && month <= end : month >= start || month <= end;
}

export function str(v: unknown, max = 100): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, max);
  return t || undefined;
}

export function int(v: unknown, min: number, max: number): number | undefined {
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** 有限な数値（文字列の数値も可）。それ以外は undefined */
export function num(v: unknown): number | undefined {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

export function month(v: unknown): number | undefined {
  const m = int(v, 1, 12);
  if (v !== undefined && v !== null && m === undefined) {
    throw new ToolInputError("month は 1〜12 の数値で指定してください");
  }
  return m;
}

export function currentMonthJST(): number {
  return Number(todayJST().slice(5, 7));
}

/** YYYY-MM-DD の検証（省略時は undefined） */
export function ymd(v: unknown): string | undefined {
  const d = str(v, 10);
  if (d === undefined) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) {
    throw new ToolInputError("date は YYYY-MM-DD 形式で指定してください");
  }
  return d;
}

/** 日本周辺（沖縄・小笠原〜北海道）の緯度経度か。範囲外・未指定は ToolInputError */
export function requireJapanLatLng(args: Record<string, unknown>): { lat: number; lng: number } {
  const lat = num(args.latitude);
  const lng = num(args.longitude);
  if (lat === undefined || lng === undefined) {
    throw new ToolInputError("latitude と longitude を数値で指定してください（例: 35.45, 139.64）");
  }
  if (lat < 20 || lat > 46 || lng < 122 || lng > 154) {
    throw new ToolInputError("日本国内の緯度経度を指定してください（緯度20〜46・経度122〜154）");
  }
  return { lat, lng };
}

export function truncate(s: string | undefined, n: number): string | undefined {
  if (!s) return undefined;
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// 魚・スポットの解決
// ---------------------------------------------------------------------------

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

export function findSpot(slug: string): FishingSpot | undefined {
  const s = slug.trim().replace(/^.*\/spots\//, "").replace(/[/?#].*$/, "");
  const target = dedupRedirects.get(s) ?? s;
  return fishingSpots.find((x) => x.slug === target);
}

export function requireSpot(args: Record<string, unknown>): FishingSpot {
  const slug = str(args.slug, 200);
  if (!slug) throw new ToolInputError("slug を指定してください（search_spots の結果に含まれます）");
  const spot = findSpot(slug);
  if (!spot) {
    throw new ToolInputError(`スポット "${slug}" が見つかりません。search_spots で検索してから指定してください`);
  }
  return spot;
}

export function banInfo(spot: FishingSpot) {
  if (!spot.fishingBan) return undefined;
  return {
    scope: spot.fishingBan.scope === "full" ? "全面釣り禁止" : "一部区域・条件付きで釣り禁止",
    reason: spot.fishingBan.reason,
    confirmedAt: spot.fishingBan.confirmedAt,
  };
}

export function fishInMonth(spot: FishingSpot, m: number) {
  return spot.catchableFish
    .filter((cf) => isMonthInRange(m, cf.monthStart, cf.monthEnd))
    .sort((a, b) => Number(b.peakSeason) - Number(a.peakSeason));
}

export function facilityList(spot: FishingSpot): string[] {
  const f: string[] = [];
  if (spot.isFree) f.push("無料");
  if (spot.hasParking) f.push("駐車場");
  if (spot.hasToilet) f.push("トイレ");
  if (spot.hasFishingShop) f.push("釣具店");
  if (spot.hasConvenienceStore) f.push("コンビニ");
  if (spot.hasRentalRod) f.push("レンタル竿");
  return f;
}

/** 一覧向けのスポット要約（search_spots / find_nearby_spots 共通） */
export function spotSummary(spot: FishingSpot, m: number) {
  return {
    slug: spot.slug,
    name: spot.name,
    prefecture: spot.region.prefecture,
    area: spot.region.areaName,
    type: SPOT_TYPE_LABELS[spot.spotType],
    difficulty: DIFFICULTY_LABELS[spot.difficulty],
    fishInSeason: fishInMonth(spot, m)
      .slice(0, 6)
      .map((cf) => cf.fish.name + (cf.peakSeason ? "（最盛期）" : "")),
    facilities: facilityList(spot),
    warning: spot.fishingBan ? `一部釣り禁止: ${spot.fishingBan.reason}` : undefined,
    url: siteUrl(`/spots/${spot.slug}`),
  };
}

/** Promise にタイムアウトを付け、超過・失敗時は fallback を返す（外部I/Oの劣化運転用） */
export async function withTimeout<T>(p: Promise<T>, ms: number, fallback: T, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => {
          console.warn(`[mcp] ${label} timed out after ${ms}ms`);
          resolve(fallback);
        }, ms);
      }),
    ]);
  } catch (e) {
    console.error(`[mcp] ${label} failed`, e);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
