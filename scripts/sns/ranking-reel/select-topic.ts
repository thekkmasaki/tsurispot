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
import { facilityLabel, feeShortText, openingHoursText } from "@/lib/managed-pond";
import banAudit from "./ban-audit.json";
import spotExclude from "./spot-exclude.json";

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
// 週次の事前チェック（PRECHECK.md）で外したスポット。run.mjs が承認データから渡す
const excludeSpots = list(arg("exclude-spots"));
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
  // 2026-11-24 サワラ千葉TOP10リールに「片貝漁港は釣り禁止」とコメントが2件。民間サイトで右岸約200m・北堤防・
  // 新堤防先端の立入禁止が複数報告されているが、九十九里町・漁協の公式発表は未確認のため fishingBan は付けない
  "katakai-gyoko", "kujukuri-katakai-shinteibu-a13",
]);
// 2026-11-25 個別調査（掲載候補を1件ずつ WebSearch。二次情報も含む）で禁止・立入禁止の指摘が見つかった所。
// 一部禁止でも「〇〇港」と載せると全体で釣れるように見えるので除く（禁止が解除済み＝lifted は除かない）
const BAN_AUDIT_EXCLUDE = new Set(
  Object.entries((banAudit as { entries: Record<string, { verdict: string }> }).entries)
    .filter(([, e]) => e.verdict !== "lifted")
    .map(([slug]) => slug)
);
// 2026-11-25 冬のお題（管理釣り場・釣り堀・海上釣り堀・ワカサギ）の個別調査で見つかった、閉業・名称変更・実在不明・冬季休業・禁漁/不漁の所。
// months があればその月だけ除外（冬季休業など）、無ければ常に除外
const SPOT_EXCLUDE = (spotExclude as { entries: Record<string, { months?: number[] }> }).entries;
const spotExcluded = (slug: string) => {
  const e = SPOT_EXCLUDE[slug];
  return !!e && (!e.months || e.months.includes(monthNum));
};
function snsSafe(s: (typeof fishingSpots)[number]) {
  if (spotExcluded(s.slug)) return false;
  if (s.fishingBan || SNS_EXCLUDE_NAME.test(s.name) || SNS_EXCLUDE_SLUGS.has(s.slug) || BAN_AUDIT_EXCLUDE.has(s.slug) || excludeSpots.has(s.slug)) return false;
  return !BAN_HINT.test(JSON.stringify({ ...s, catchableFish: undefined }));
}

type Spot = (typeof fishingSpots)[number];

/** ランキングの範囲。県で6件に満たないものは地方→全国にまとめる */
interface Area { slug: string; name: string; short: string; scope: "pref" | "region" | "national"; prefNames: Set<string> }
const REGION_SLUG: Record<string, string> = {
  北海道: "region-hokkaido", 東北: "region-tohoku", 関東: "region-kanto", 中部: "region-chubu",
  近畿: "region-kinki", 中国: "region-chugoku", 四国: "region-shikoku", "九州・沖縄": "region-kyushu",
};
const prefArea = (p: (typeof prefectures)[number]): Area =>
  ({ slug: p.slug, name: p.name, short: p.nameShort, scope: "pref", prefNames: new Set([p.name]) });

/** スポット群を 県（6件以上）→ 残りを地方（6件以上）にまとめる。national=true なら全国もお題にする */
function areaGroups(spots: Spot[], national: boolean): { area: Area; count: number }[] {
  const out: { area: Area; count: number }[] = [];
  const byRegion = new Map<string, Spot[]>();
  for (const p of prefectures) {
    const xs = spots.filter((s) => s.region.prefecture === p.name);
    if (xs.length >= MIN_FOR_POST) out.push({ area: prefArea(p), count: xs.length });
    else if (xs.length) byRegion.set(p.regionGroup, [...(byRegion.get(p.regionGroup) ?? []), ...xs]);
  }
  for (const [rg, xs] of byRegion) {
    if (xs.length < MIN_FOR_POST) continue;
    const prefNames = new Set(xs.map((s) => s.region.prefecture));
    out.push({ area: { slug: REGION_SLUG[rg] ?? `region-${rg}`, name: rg, short: rg, scope: "region", prefNames }, count: xs.length });
  }
  if (national && spots.length >= MIN_FOR_POST) {
    out.push({ area: { slug: "japan", name: "全国", short: "全国", scope: "national", prefNames: new Set(spots.map((s) => s.region.prefecture)) }, count: spots.length });
  }
  return out;
}

function matchingSpots(area: Area, fishSlug: string) {
  return fishingSpots
    .filter((s) => area.prefNames.has(s.region.prefecture) && snsSafe(s) && isFishListedAtSpot(s, fishSlug))
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
function usablePhoto(spot: Spot) {
  const src = resolveSpotImageSrc(spot.mainImageUrl);
  if (!src) return null;
  if (src.startsWith("http") && !spot.imageAttribution) return null;
  return { src, credit: spot.imageAttribution ?? "Wikimedia Commons" };
}

// ── 施設お題（管理釣り場・釣り堀・海上釣り堀）──
// 魚種ではなく施設の種類でランキングを作る。台帳の fish 欄にはこのキーを入れる。
// コツ欄は施設を問わず当てはまる一般的な注意だけにする（個別施設の料金・イベントは断言しない）
const FACILITIES = {
  managed: {
    label: "管理釣り場",
    method: { name: "エリアトラウト（ルアー）", tips: ["冬はマスが活発でハイシーズン", "レンタル竿の有無は事前に確認", "スプーンの色と巻く速さを変えて探る"], hook: "スプーン・クランク" },
  },
  tsuribori: {
    label: "釣り堀",
    method: { name: "エサ釣り（ウキ釣り）", tips: ["竿・エサの貸し出しがある所が多い", "時間制か釣った分の料金かを確認", "子ども連れの釣りデビューに最適"], hook: "練りエサ・赤虫" },
  },
  kaijo: {
    label: "海上釣り堀",
    method: { name: "エサ釣り（ウキ・ズボ釣り）", tips: ["予約制の施設が多いので事前に確認", "タナ（深さ）合わせが釣果の決め手", "防寒着とライフジャケットは必須"], hook: "エビ・ダンゴ・魚の切り身" },
  },
} as const;
type FacilityKey = keyof typeof FACILITIES;
const isFacilityKey = (k: string): k is FacilityKey => k in FACILITIES;
const facilitySpots = (key: FacilityKey) =>
  fishingSpots.filter((s) => s.isManagedPond && facilityLabel(s) === FACILITIES[key].label && snsSafe(s));

// 釣り人口（検索需要）の大きい県を優先する
const DEMAND_TIER1 = new Set(["tokyo", "kanagawa", "chiba", "osaka", "hyogo", "aichi", "shizuoka", "fukuoka"]);
const DEMAND_TIER2 = new Set(["ibaraki", "wakayama", "mie", "hiroshima", "kyoto", "miyagi", "hokkaido", "niigata", "nagasaki", "yamaguchi", "okayama", "kagawa", "ehime", "oita", "kumamoto", "kagoshima", "ishikawa", "toyama", "fukui", "shimane", "tokushima", "kochi"]);
// 管理釣り場は内陸の県に多い。その県の需要を海釣りと同じ物差しで測ると不利なので底上げする
const DEMAND_INLAND = new Set(["saitama", "tochigi", "gunma", "yamanashi", "nagano", "gifu"]);

// 重点魚種（10〜11月用）: 最盛期（fish.peakMonths）の間だけ最優先し、旬が終われば自動で通常の選定に戻る。
// 2026-11 の初期実績でアオリイカ(1.5万再生)・タチウオ(1万)が他魚種(400〜500)を大きく上回ったため。
// 2026-11-18 この時期に関心の高い青物（ブリ・サワラ・イナダ）を追加。
// 重点魚種どうしは「直近2本と同じ魚」だけ避けて順に回す（県×魚の60日重複回避はそのまま）
const FOCUS_FISH = new Set(["aoriika", "tachiuo", "buri", "sawara", "inada"]);

// 月ごとの重点お題（MONTH_FOCUS がある月は FOCUS_FISH の代わりにこちらを使う）。
// 2026-11-24 ユーザー判断: 12月以降はアオリイカ・青物は厳しいので出さず、冬に人気の
// 管理釣り場・釣り堀・海上釣り堀・コブダイ・ワカサギ・カサゴ/メバル（穴釣り・メバリング）・マゴチ/ヒラメを回す。
// 同日、カレイは外してマゴチに差し替え（ユーザー判断）。マゴチは現データでは全スポットの時期が4〜10月のため、
// 冬のスポットが登録されるまでは候補が出ない（データ上の掲載基準で自動的に判定）。
// 重点お題どうしは「最後に使ってから一番間が空いたもの」を優先して全部を均等に回す（--history の台帳を使う）。
const WINTER_FOCUS = ["managed", "tsuribori", "kaijo", "kobudai", "wakasagi", "kasago", "mebaru", "magochi", "hirame",
  // 同日追加: 12月にデータがそろっていて冬に狙える定番（クロダイ・メジナ・シーバス・アイナメ・サヨリ）と、12月が旬で地域需要の強いハタハタ（秋田）
  "kurodai", "mejina", "suzuki", "ainame", "sayori", "hatahata"];
const MONTH_FOCUS: Record<number, string[]> = { 12: WINTER_FOCUS, 1: WINTER_FOCUS, 2: WINTER_FOCUS };
// 何本前まで遡って使用履歴を見るか（重点お題の数より十分大きく）
const FOCUS_HISTORY = 30;
// 冬は回遊が落ちて釣れにくいので出さない魚
const WINTER_SKIP = new Set(["aoriika", "buri", "inada", "sawara", "kanpachi", "hiramasa", "shiira", "katsuo"]);
// 釣れても冬のリールには出さない魚（ユーザー判断）
const WINTER_SKIP_EXTRA = ["karei"];
const WINTER_SKIP_ALL = new Set([...WINTER_SKIP, ...WINTER_SKIP_EXTRA]);
const MONTH_SKIP: Record<number, Set<string>> = { 12: WINTER_SKIP_ALL, 1: WINTER_SKIP_ALL, 2: WINTER_SKIP_ALL };
// 岸から釣れなくなっていて、ランキングにすると「情報が古い」と受け取られる 県/魚 のお題（--pref/--fish で強制した場合は出す）。
// 2026-11-25 香川タチウオTOP10に「香川で釣れてたのはもう何年も前」「今はどこにも接岸してない」とコメント2件。
// 釣具店ブログ・釣果投稿でも数年前から香川の岸にほぼ入らない年が続いている（サイト側も出典なしの香川のタチウオは削除済み）
// 同日、同じ瀬戸内中部の岡山（地元ブログ「ここ数年は岡山近海まで入ってこない」）・広島（中国新聞: 県の漁獲量が2010年962t→2018年179t、
// 呉の中心漁協はほぼゼロ）も確認して追加。愛媛は南予（宇和海）の堤防で2025年も釣果があるので外さない
// 同日、全国のタチウオを確認。大分（県の漁獲は1996年5,562t→2015年789t、大分市の港内に群れが入るのは年に数日）と
// 山口（防波堤からは難しいとの記述、周防大島の釣果集計も低調）も岸のランキングには向かないので外す。
// サイトのデータは「年に数日は釣れる」ため削除しない（香川・岡山・広島は「何年も岸に入っていない」ため削除済み）
// 2026-11-25 タチウオ以外の全魚種（県×魚 639組）も確認して追加（docs/sns-spot-audit-2026-11-25.md）。
// - 激減: 秋田ハタハタ（2023年110t・2025年は接岸群ほぼなし／秋田魁新報・県）、霞ヶ浦北浦ワカサギ（2019年以降1t未満／県水試）、
//   余呉湖ワカサギ（2025年記録的不漁）、東京湾のマコガレイ（年1000t超→10〜20t、千葉R5評価「低位」）、茨城のカレイ（県評価「低位・減少」）、
//   千葉のキス（主要漁協 2000年185t→2024年12t）、太平洋北部のサバ（マサバ太平洋系群が2019年以降減少・2024漁期は10年で最大の不漁）
// - 船が主で岸の釣果がほぼ無い: 北海道マダラ、沖縄スジアラ、三重シマアジ、鳥取・島根ヤリイカ
// - 種の当て方が不正確: 沖縄のクロダイ（実際はミナミクロダイ等）、沖縄のキジハタ・ハゼ（サイトのデータも削除済み）
const TOPIC_SKIP = new Set([
  "kagawa/tachiuo", "okayama/tachiuo", "hiroshima/tachiuo", "oita/tachiuo", "yamaguchi/tachiuo",
  "akita/hatahata", "ibaraki/wakasagi", "shiga/wakasagi",
  "tokyo/karei", "kanagawa/karei", "chiba/karei", "ibaraki/karei", "chiba/kisu",
  "iwate/saba", "miyagi/saba", "fukushima/saba", "ibaraki/saba", "chiba/saba",
  "hokkaido/madara", "okinawa/sujiara", "mie/shimaaji", "tottori/yariika", "shimane/yariika",
  "okinawa/kurodai", "okinawa/hata", "okinawa/haze",
]);
// 県で6件に満たなくても地方・全国でまとめてお題にする魚（データが少ないが人気のある魚）
const WIDE_AREA_FISH = new Set(["kobudai"]);

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
const forcedPref = arg("pref");
const forcedFish = arg("fish");
const forced = !!(forcedPref || forcedFish);
const focusList = MONTH_FOCUS[monthNum];
const focusSet = new Set(focusList ?? []);
const skipSet = MONTH_SKIP[monthNum] ?? new Set<string>();
// 台帳の新しい順の魚（お題キー）。重点お題の順回し用。未指定なら --recent-fish で代用
const history = (arg("history") ?? arg("recent-fish") ?? "").split(",").map((x) => groupOf(x.trim())).filter(Boolean).slice(0, FOCUS_HISTORY);
/** 最後に使ってから何本空いたか（使っていなければ FOCUS_HISTORY） */
const sinceLastUse = (key: string) => {
  const i = history.indexOf(groupOf(key));
  return i < 0 ? FOCUS_HISTORY : i;
};

interface Candidate {
  kind: "fish" | "facility";
  key: string; // 魚slug または 施設キー
  name: string;
  area: Area;
  count: number;
  popularity: number;
  isPeakMonth: boolean;
}
const candidates: Candidate[] = [];

// 1) 魚種 × 県（サイトの県×月×魚ページと同じ基準）
for (const c of getEligiblePrefMonthFishCombos(MIN_FOR_POST)) {
  if (c.monthSlug !== month.slug) continue;
  const fish = fishBySlug.get(c.fishSlug);
  const p = prefectures.find((x) => x.slug === c.prefSlug);
  if (!fish || !p) continue;
  // SNS映えと需要の大きい海釣りに限定（重点お題の淡水魚＝ワカサギ等は例外）
  if (fish.category !== "sea" && !focusSet.has(fish.slug) && !forcedFish) continue;
  candidates.push({ kind: "fish", key: fish.slug, name: fish.name, area: prefArea(p), count: c.count,
    popularity: fish.popularity ?? 99, isPeakMonth: fish.peakMonths?.includes(monthNum) ?? false });
}
// 2) 地方・全国でまとめる魚（コブダイ等）。県単位で6件あるものは 1) と重複するので除く
for (const slug of WIDE_AREA_FISH) {
  const fish = fishBySlug.get(slug);
  if (!fish || !(focusSet.has(slug) || forcedFish === slug)) continue;
  const all = matchingSpots({ slug: "japan", name: "全国", short: "全国", scope: "national", prefNames: new Set(prefectures.map((p) => p.name)) }, slug).map((x) => x.spot);
  for (const g of areaGroups(all, true)) {
    if (g.area.scope === "pref") continue;
    candidates.push({ kind: "fish", key: slug, name: fish.name, area: g.area, count: g.count,
      popularity: fish.popularity ?? 99, isPeakMonth: fish.peakMonths?.includes(monthNum) ?? false });
  }
}
// 3) 施設（重点お題の月だけ。--fish managed 等で強制も可）
for (const key of Object.keys(FACILITIES) as FacilityKey[]) {
  if (!(focusSet.has(key) || forcedFish === key)) continue;
  for (const g of areaGroups(facilitySpots(key), false)) {
    candidates.push({ kind: "facility", key, name: FACILITIES[key].label, area: g.area, count: g.count,
      popularity: 10, isPeakMonth: true });
  }
}

const scored = candidates
  .filter((c) => (!forcedPref || c.area.slug === forcedPref) && (!forcedFish || c.key === forcedFish))
  .map((c) => {
    if (!forced && exclude.has(`${c.area.slug}/${c.key}`)) return null;
    if (!forced && skipSet.has(c.key)) return null;
    if (!forced && TOPIC_SKIP.has(`${c.area.slug}/${c.key}`)) return null;
    let s = 0;
    s += Math.max(0, 40 - c.popularity); // 人気魚種ほど高い（popularity は小さいほど人気）
    s += c.isPeakMonth ? 25 : 0; // 旬の月
    s += Math.min(c.count, 20); // 掲載スポットが多いほどランキングが充実
    const demand = c.area.scope !== "pref" ? 10
      : DEMAND_TIER1.has(c.area.slug) ? 15
      : DEMAND_TIER2.has(c.area.slug) || (c.kind === "facility" && DEMAND_INLAND.has(c.area.slug)) ? 7 : 0;
    s += demand;
    const g = groupOf(c.key);
    if (focusList) {
      // 冬など月ごとの重点お題: 間が空いているほど高くし、全部を順番に回す
      // （1本空くごとに +15。人気・件数・需要の差（最大100程度）より順番を優先する）
      if (focusSet.has(c.key)) s += 100 + sinceLastUse(c.key) * 15 - (sinceLastUse(c.key) < 2 ? 200 : 0);
      else if (recentFish.has(g)) s -= 60;
    } else {
      // 重点魚種でも直近2本で使った魚は重点扱いしない（旬の重点魚種が1種だけの月に、毎回同じ魚になるのを防ぐ）
      const usedRecently = lastTwoFish.has(g);
      if (FOCUS_FISH.has(c.key) && c.isPeakMonth && !usedRecently) s += 100;
      else if (recentFish.has(c.key) || usedRecently) s -= 60; // 連日同じ魚は避ける
    }
    if (recentPref.has(c.area.slug)) s -= 30;
    s += hash(`${dateStr}|${c.area.slug}|${c.key}`) * 12; // 日替わりの揺らぎ
    return { c, s };
  })
  .filter((x): x is NonNullable<typeof x> => x !== null)
  .sort((a, b) => b.s - a.s);

if (scored.length === 0) {
  console.error(`候補なし: month=${monthNum} pref=${forcedPref ?? "-"} fish=${forcedFish ?? "-"}`);
  process.exit(2);
}

// ランキング母集団（スコア順）。同じ場所の言い換えを除いて6件に満たなければ次点のお題にする
type Ranked = { spot: Spot; isPeak: boolean };
// 直近に作ったランキングの母集団（上位20件）。事前チェックで予備候補も確認するために出力する
let lastPool: Ranked[] = [];
function buildRanking(c: Candidate): Ranked[] {
  let ordered: Ranked[];
  if (c.kind === "facility" && isFacilityKey(c.key)) {
    // 施設: 評価 → 料金・営業時間の情報がそろっている順（比較表として役立つ順）
    const info = (s: Spot) => (feeShortText(s) ? 2 : 0) + (openingHoursText(s) ? 1 : 0);
    ordered = facilitySpots(c.key)
      .filter((s) => c.area.prefNames.has(s.region.prefecture))
      .sort((a, b) => b.rating - a.rating || info(b) - info(a) || a.name.localeCompare(b.name, "ja"))
      .map((spot) => ({ spot, isPeak: false }));
  } else {
    ordered = matchingSpots(c.area, c.key);
  }
  // スコア上位20件の中から写真ありを優先して10件選び、最終的な並びはスコア順を保つ
  const seenPlace: string[] = [];
  const pool = ordered
    .filter((x) => {
      const k = placeKey(x.spot.name, x.spot.region.prefecture);
      if (!k || seenPlace.some((p) => samePlace(p, k))) return false;
      seenPlace.push(k);
      return true;
    })
    .slice(0, TOP_N * 2);
  const withPhoto = pool.filter((x) => usablePhoto(x.spot));
  const chosen = new Set([...new Set([...withPhoto, ...pool])].slice(0, TOP_N));
  lastPool = pool;
  return pool.filter((x) => chosen.has(x));
}

let pickIndex = scored.findIndex((x) => buildRanking(x.c).length >= MIN_FOR_POST);
if (pickIndex < 0) pickIndex = 0;
const pick = scored[pickIndex].c;
const area = pick.area;
const ranked = buildRanking(pick);

const cityOf = (s: Spot) => {
  const a = s.region.areaName || "";
  const m = (s.address || "").match(/(?:都|道|府|県)(.+?[市郡])(.+?[区町村])?/);
  const city = m ? (m[1].endsWith("郡") ? m[2] ?? m[1] : m[1] + (m[2]?.endsWith("区") ? m[2] : "")) : a;
  // 地方・全国ランキングは県名を付ける
  if (area.scope === "pref") return city;
  const p = prefectures.find((x) => x.name === s.region.prefecture);
  return `${p?.nameShort ?? ""} ${city}`.trim();
};

const fishOfPick = pick.kind === "fish" ? fishBySlug.get(pick.key) : undefined;
const fishMethod = fishOfPick?.fishingMethods?.find((m) => m.difficulty === "beginner") ?? fishOfPick?.fishingMethods?.[0];
const method = pick.kind === "facility" && isFacilityKey(pick.key)
  ? { ...FACILITIES[pick.key].method, tips: [...FACILITIES[pick.key].method.tips] }
  : fishMethod
    ? { name: fishMethod.methodName, tips: fishMethod.tips.slice(0, 3), hook: fishMethod.tackle.hookOrLure }
    : null;

const url = pick.kind === "facility"
  ? `https://tsurispot.com/managed-ponds${area.scope === "pref" ? `/${area.slug}` : ""}`
  : area.scope === "pref"
    ? `https://tsurispot.com/prefecture/${area.slug}/${month.slug}/${pick.key}`
    : `https://tsurispot.com/fish/${pick.key}`;

const out = {
  date: dateStr,
  kind: pick.kind,
  month: { num: monthNum, name: month.name, slug: month.slug },
  // 台帳・ファイル名の互換のため、範囲は pref、施設キーは fish に入れる
  pref: { slug: area.slug, name: area.name, short: area.short, scope: area.scope },
  fish: { slug: pick.key, name: pick.name, isPeakMonth: pick.isPeakMonth, category: fishOfPick?.category ?? (pick.key === "kaijo" ? "sea" : "freshwater") },
  url,
  totalSpots: pick.count,
  method,
  spots: ranked.map(({ spot, isPeak }) => {
    const others = spot.catchableFish
      .map((cf) => cf.fish.name)
      .filter((n, i, arr) => n !== pick.name && arr.indexOf(n) === i)
      .slice(0, 2);
    const fee = pick.kind === "facility" ? feeShortText(spot) : undefined;
    const note = pick.kind === "facility"
      ? [others.join("・"), fee && fee.length <= 14 ? fee : ""].filter(Boolean).join("｜")
      : others.length ? "一緒に: " + others.join("・") : "";
    return {
      name: spot.name.replace(/（.*?）|\(.*?\)/g, "").trim(),
      slug: spot.slug,
      city: cityOf(spot),
      type: pick.kind === "facility" ? facilityLabel(spot) : SPOT_TYPE_LABELS[spot.spotType] ?? "",
      difficulty: spot.difficulty,
      isPeak,
      others,
      note,
      photo: usablePhoto(spot),
    };
  }),
  // 母集団（上位20件）。事前チェックでは除外が出たときの繰り上がり候補も確認する
  pool: lastPool.map(({ spot }) => ({ slug: spot.slug, name: spot.name, city: cityOf(spot), type: SPOT_TYPE_LABELS[spot.spotType] ?? "" })),
  alternatives: scored.filter((_, i) => i !== pickIndex).slice(0, 5).map((x) => `${x.c.area.slug}/${x.c.key}`),
};
console.log(JSON.stringify(out, null, 2));
