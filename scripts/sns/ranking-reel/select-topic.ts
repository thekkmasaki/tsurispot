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
// 出世魚は同じ魚として扱う（ブリの直後にイナダ、のような実質同じお題の連続を避ける）
const FISH_GROUP: Record<string, string> = { inada: "buri" };
const groupOf = (slug: string) => FISH_GROUP[slug] ?? slug;
// 台帳は新しい順。直近2本（朝夜2本なら前日夜と当日朝など）の魚
const lastTwoFish = new Set([...recentFish].slice(0, 2).map(groupOf));
// SNSは拡散されるため、禁止の気配があるスポットは安全側に倒して載せない（このフィルタ自体はサイト表示に影響しない）。
// 2026-11-20 静岡タチウオの回で「田子の浦も沼津港も釣り禁止では？」と指摘された。
// - 田子の浦港: 港湾管理者が釣り人を含む関係者以外の立入を断っている → 各スポットに fishingBan(full) を付与済み。
// - 沼津港: 外港入口に「関係者以外立入禁止」の看板あり（県のパブコメ資料 2015）。港内の大半が禁止との民間情報が
//   複数あるが現行の一次情報は未確認のため fishingBan は付けず、SNSでは名前で除外する。
// 「〇〇港」とだけ載せると港全体で釣れるように見えてしまう。
const SNS_EXCLUDE_NAME = /田子の浦|沼津(内|外)?港/;
// 説明やルール欄に禁止・立入禁止の記載がある所も除く（全体の約3%）
const BAN_HINT = /釣り禁止|立入禁止|立ち入り禁止/;
// 2026-11-21 一斉監査（全5,610件）で禁止の疑いが出たが、公式で裏が取れず fishingBan を付けていない所。
// サイトには載せたまま、SNSにだけは出さない（港湾管理者の公表がない＝釣りができる、ではないため）。
// 未確認: 二次情報で禁止の指摘がある港（気仙沼・銚子・勝浦・下関・田原・鹿児島港など）
// 一部禁止: 港湾ルールの一部区域に当たる港（長崎・壱岐・対馬・五島・水島・玉島・苅田・高松・清水・焼津・名古屋潮見・柏崎・直江津など）
// 公式未確認の禁止判定: 福浦岸壁・名古屋港ガーデンふ頭・明石海峡大橋下・早川河口テトラ
// （焼津漁港と玉原湖は公式で確認できたので spot-ban-overrides.ts で fishingBan を付けた。ここにも残すのは二重の安全策）
const SNS_EXCLUDE_SLUGS = new Set([
  // 未確認
  "katsuura-port", "katsuura-suminawa-breakwater", "kesennuma-ko", "kesennuma-oshima-seto", "kesennuma-oshima-e8",
  "kesennuma-oura-port-a11", "kesennuma-shishiori-port-a13", "kesennuma-karakuwa-kosaba-port-a13",
  "kesennuma-motoyoshi-oya-port-a13", "choshi-gaiko", "choshi-kou", "choshi-soto-boutei-e8", "choshi-marina6",
  "choshi-marina-teibo", "shimonoseki-port", "tahara-kou", "kagoshima-port", "kagoshima-kita-futo-w6",
  // 一部禁止
  "nagasaki-port", "nagasaki-mizubenomori-w6", "iki-gonoura-port", "iki-gounoura-w6", "tsushima-izuhara-w6",
  "tsushima-hitakatsu-kou-s8", "fukue-kou-w6", "fukue-kou-terminal-s8", "mizushima-kou-c8", "tamashima-kou-okayama-w6",
  "tamashima-e-chiku", "tamashima-kou-otoshima", "kurashiki-tamashima-e-ganpeki", "kurashiki-mizushima-nishi-futou",
  "okayama-kurashiki-tamashima-kurosaki-bulk", "mizushima-kou-gogan-a12", "tamashima-kou-gogan-a13", "kanda-kou-s8",
  "shiraishi-gyokou-kanda-w6", "kagawa-takamatsu-asahi-futo-bulk", "sunport-takamatsu-kagawa", "takamatsu-sunport-gokan",
  "takamatsu-sunport-c8", "shimizu-hinode-futo", "shimizu-ejiri-futo", "yaizu-ko", "yaizu-shinko", "yaizu-kogawa-kou",
  "yaizu-ogawa-kou-e8", "tsuruhama-gogan", "nagoyakou-shiomi-futou", "nagoyakou-shiomi-futou-a13", "shiomi-futo-nagoya",
  "maiko-kouen-gogan-a12", "tarumi-gyokou-gogan-a13", "marinpia-kobe-gogan", "kanazawa-suisaisen-ryokuchi", "umi-no-koen",
  "kashiwazaki-port", "kashiwazaki-nishi-bohatei-a10", "naoetsu-daisan-higashi-teibo", "joetsu-minatomachi-tottei",
  "sado-ryotsu-higashi-futo", "shinminato-east-breakwater", "toyama-shinko-higashi-bohatei", "kaiomaru-park-gogan-imizu-a12",
  "sakaiminato-mihonoseki", "sakaiminato-marina-c8",
  // 公式未確認の禁止判定
  "fukuura-ganpeki", "nagoya-garden-futo", "nagoya-garden-futou-e8", "akashi-kaikyo-bridge-shita", "yaizu-shinko-teibo",
  "hayakawa-kakou-tetra-e8", "tambarako-dam-a12",
  // 2026-11-23 アオリイカ千葉TOP10リールに「坂田漁港は立入禁止・駐車場なし」とコメントで指摘（一次情報は未確認）
  "bandakou",
]);
function snsSafe(s: (typeof fishingSpots)[number]) {
  if (s.fishingBan || SNS_EXCLUDE_NAME.test(s.name) || SNS_EXCLUDE_SLUGS.has(s.slug)) return false;
  return !BAN_HINT.test(JSON.stringify({ ...s, catchableFish: undefined }));
}

function matchingSpots(prefName: string, fishSlug: string) {
  return fishingSpots
    .filter((s) => s.region.prefecture === prefName && snsSafe(s) && isFishListedAtSpot(s, fishSlug))
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
// 重点魚種: 最盛期（fish.peakMonths）の間だけ最優先し、旬が終われば自動で通常の選定に戻る。
// 2026-11 の初期実績でアオリイカ(1.5万再生)・タチウオ(1万)が他魚種(400〜500)を大きく上回ったため。
// 2026-11-18 この時期に関心の高い青物（ブリ・サワラ・イナダ）を追加。ブリは12月も旬なので年末まで続く。
// 重点魚種どうしは「直近2本と同じ魚」だけ避けて順に回す（県×魚の60日重複回避はそのまま）
const FOCUS_FISH = new Set(["aoriika", "tachiuo", "buri", "sawara", "inada"]);
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
    // 重点魚種でも直近2本で使った魚は重点扱いしない（旬の重点魚種が1種だけの月に、毎回同じ魚になるのを防ぐ）
    const usedRecently = lastTwoFish.has(groupOf(c.fishSlug));
    if (FOCUS_FISH.has(c.fishSlug) && isPeakMonth && !usedRecently) s += 100;
    else if (recentFish.has(c.fishSlug) || usedRecently) s -= 60; // 連日同じ魚は避ける
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
