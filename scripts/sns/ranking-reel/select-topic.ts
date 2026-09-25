/**
 * SNSランキング投稿のお題選定（県×月×魚種 TOP10）
 *
 * サイトの県×月×魚種ページ（/prefecture/[slug]/[month]/[fishSlug]）と同じ掲載基準
 * （釣れる度ゲート isFishListedAtSpot + 月範囲）でスポットを抽出し、
 * 旬 → 釣れる度スコア → rating の順に並べる。
 *
 * 使い方:
 *   npx --yes tsx@4.23.15 scripts/sns/ranking-reel/select-topic.ts [--date 2026-10-01] [--pref hyogo --fish tachiuo --month 10]
 *   [--exclude "hyogo/tachiuo,osaka/aji"]   … 直近投稿済みの 県/魚 を除外（publish 側が台帳から渡す）
 *   [--recent-fish "tachiuo,aji"] [--recent-pref "hyogo"] … 連日の同一魚種・同一県を避ける
 * 出力: JSON（stdout）
 */
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { prefectures } from "@/lib/data/prefectures";
import { getEligiblePrefMonthFishCombos, getCatchScore, isFishListedAtSpot } from "@/lib/data";
import { MONTHS, isMonthInRange } from "@/lib/data/fishing-methods";
import { resolveSpotImageSrc } from "@/lib/data/spot-image-resolver";
import { SPOT_TYPE_LABELS } from "@/types";

const TOP_N = 10;
const MIN_FOR_POST = 6; // これ未満の組合せはランキングとして薄いので投稿しない

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const list = (v?: string) => new Set((v ?? "").split(",").map((s) => s.trim()).filter(Boolean));

// JST 日付
const dateStr = arg("date") ?? new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const monthNum = Number(arg("month") ?? Number(dateStr.slice(5, 7)));
const month = MONTHS.find((m) => m.num === monthNum)!;
const exclude = list(arg("exclude"));
const recentFish = list(arg("recent-fish"));
const recentPref = list(arg("recent-pref"));

function matchingSpots(prefName: string, fishSlug: string) {
  return fishingSpots
    // SNSは拡散されるため、一部禁止(partial)を含め釣り禁止情報のあるスポットは載せない
    .filter((s) => s.region.prefecture === prefName && !s.fishingBan && isFishListedAtSpot(s, fishSlug))
    .map((spot) => {
      const cfs = spot.catchableFish.filter(
        (cf) => cf.fish.slug === fishSlug && isMonthInRange(monthNum, cf.monthStart, cf.monthEnd)
      );
      if (cfs.length === 0) return null;
      return { spot, isPeak: cfs.some((cf) => cf.peakSeason), score: getCatchScore(spot, fishSlug) };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) =>
      a.isPeak !== b.isPeak ? (a.isPeak ? -1 : 1) : b.score - a.score || b.spot.rating - a.spot.rating
    );
}

/** 写真が使えるか（実体あり＋外部URLならクレジット必須） */
function usablePhoto(spot: (typeof fishingSpots)[number]) {
  const src = resolveSpotImageSrc(spot.mainImageUrl);
  if (!src) return null;
  if (src.startsWith("http") && !spot.imageAttribution) return null;
  return { src, credit: spot.imageAttribution ?? "Wikimedia Commons" };
}

// 釣り人口（検索需要）の大きい県を優先する
const DEMAND_TIER1 = new Set(["tokyo", "kanagawa", "chiba", "osaka", "hyogo", "aichi", "shizuoka", "fukuoka"]);
const DEMAND_TIER2 = new Set(["ibaraki", "wakayama", "mie", "hiroshima", "kyoto", "miyagi", "hokkaido", "niigata", "nagasaki", "yamaguchi", "okayama", "kagawa", "ehime", "oita", "kumamoto", "kagoshima", "ishikawa", "toyama", "fukui", "shimane", "tokushima", "kochi"]);

/** 同じ場所の言い換え（「〇〇河口」と「〇〇市〇〇河口左岸」等）を同一視するキー */
function placeKey(name: string, prefName: string) {
  return name
    .replace(/（.*?）|\(.*?\)/g, "")
    .replace(new RegExp("^" + prefName.replace(/[都道府県]$/, "")), "")
    .replace(/^[^\s]{1,5}?[市町村]/, "")
    .replace(/(左岸|右岸|サーフ|周辺|一帯|護岸|海岸|付近)$/g, "")
    .replace(/[\s　・･,、\-－]/g, "")
    .replace(/漁港|港/g, "");
}

/** 表記ゆれ（「焼津新港」と「焼津港 新港」、「白灯台堤防」と「白灯堤防」）を同一視する */
function samePlace(a: string, b: string) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) >= 3 && (a.includes(b) || b.includes(a))) return true;
  // 「清水港」と「清水港日の出埠頭」のような港全体と一部
  if (Math.min(a.length, b.length) >= 2 && (a.startsWith(b) || b.startsWith(a))) return true;
  const grams = (s: string) => new Set(Array.from({ length: Math.max(0, s.length - 1) }, (_, i) => s.slice(i, i + 2)));
  const A = grams(a), B = grams(b);
  if (A.size === 0 || B.size === 0) return false;
  let common = 0;
  for (const g of A) if (B.has(g)) common++;
  return (2 * common) / (A.size + B.size) >= 0.7;
}

// 決定的な擬似乱数（同じ日付なら同じお題）
function hash(s: string) {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 2 ** 32;
}

const fishBySlug = new Map(fishSpecies.map((f) => [f.slug, f]));
const prefBySlug = new Map(prefectures.map((p) => [p.slug, p]));

let candidates = getEligiblePrefMonthFishCombos(MIN_FOR_POST).filter((c) => c.monthSlug === month.slug);
const forcedPref = arg("pref");
const forcedFish = arg("fish");
if (forcedPref) candidates = candidates.filter((c) => c.prefSlug === forcedPref);
if (forcedFish) candidates = candidates.filter((c) => c.fishSlug === forcedFish);

const scored = candidates
  .map((c) => {
    const fish = fishBySlug.get(c.fishSlug)!;
    const pref = prefBySlug.get(c.prefSlug)!;
    if (!fish || !pref || fish.category !== "sea") return null; // SNS映えと需要の大きい海釣りに限定
    const forced = forcedPref || forcedFish;
    if (!forced && exclude.has(`${c.prefSlug}/${c.fishSlug}`)) return null;
    const pop = fish.popularity ?? 99;
    const isPeakMonth = fish.peakMonths?.includes(monthNum) ?? false;
    let s = 0;
    s += Math.max(0, 40 - pop); // 人気魚種ほど高い（popularity は小さいほど人気）
    s += isPeakMonth ? 25 : 0; // 旬の月
    s += Math.min(c.count, 20); // 掲載スポットが多いほどランキングが充実
    s += DEMAND_TIER1.has(c.prefSlug) ? 15 : DEMAND_TIER2.has(c.prefSlug) ? 7 : 0;
    if (recentFish.has(c.fishSlug)) s -= 60; // 連日同じ魚は避ける
    if (recentPref.has(c.prefSlug)) s -= 30;
    s += hash(`${dateStr}|${c.prefSlug}|${c.fishSlug}`) * 12; // 日替わりの揺らぎ
    return { c, fish, pref, isPeakMonth, s };
  })
  .filter((x): x is NonNullable<typeof x> => x !== null)
  .sort((a, b) => b.s - a.s);

if (scored.length === 0) {
  console.error(`候補なし: month=${monthNum} pref=${forcedPref ?? "-"} fish=${forcedFish ?? "-"}`);
  process.exit(2);
}

const pick = scored[0];
// スコア上位20件の中から写真ありを優先して10件選び、最終的な並びはスコア順を保つ
const seenPlace: string[] = [];
const pool = matchingSpots(pick.pref.name, pick.fish.slug)
  .filter((x) => {
    const k = placeKey(x.spot.name, pick.pref.name);
    if (!k || seenPlace.some((p) => samePlace(p, k))) return false;
    seenPlace.push(k);
    return true;
  })
  .slice(0, TOP_N * 2);
const withPhoto = pool.filter((x) => usablePhoto(x.spot));
const chosen = new Set([...new Set([...withPhoto, ...pool])].slice(0, TOP_N));
const ranked = pool.filter((x) => chosen.has(x));

const cityOf = (s: (typeof fishingSpots)[number]) => {
  const a = s.region.areaName || "";
  const m = (s.address || "").match(/(?:都|道|府|県)(.+?[市郡])(.+?[区町村])?/);
  return m ? (m[1].endsWith("郡") ? m[2] ?? m[1] : m[1] + (m[2]?.endsWith("区") ? m[2] : "")) : a;
};

const method = pick.fish.fishingMethods?.find((m) => m.difficulty === "beginner") ?? pick.fish.fishingMethods?.[0];

const out = {
  date: dateStr,
  month: { num: monthNum, name: month.name, slug: month.slug },
  pref: { slug: pick.pref.slug, name: pick.pref.name, short: pick.pref.nameShort },
  fish: { slug: pick.fish.slug, name: pick.fish.name, isPeakMonth: pick.isPeakMonth },
  url: `https://tsurispot.com/prefecture/${pick.pref.slug}/${month.slug}/${pick.fish.slug}`,
  totalSpots: pick.c.count,
  method: method
    ? { name: method.methodName, tips: method.tips.slice(0, 3), hook: method.tackle.hookOrLure }
    : null,
  spots: ranked.map(({ spot, isPeak }) => ({
    name: spot.name.replace(/（.*?）|\(.*?\)/g, "").trim(),
    slug: spot.slug,
    city: cityOf(spot),
    type: SPOT_TYPE_LABELS[spot.spotType] ?? "",
    difficulty: spot.difficulty,
    isPeak,
    others: spot.catchableFish
      .map((cf) => cf.fish.name)
      .filter((n, i, arr) => n !== pick.fish.name && arr.indexOf(n) === i)
      .slice(0, 2),
    photo: usablePhoto(spot),
  })),
  alternatives: scored.slice(1, 6).map((x) => `${x.pref.slug}/${x.fish.slug}`),
};
console.log(JSON.stringify(out, null, 2));
