#!/usr/bin/env node
/**
 * format-spot.mjs — spot-generator の中核整形ロジック。
 *
 * 候補リスト（正規化済み JSON 配列）を受け取り、
 * src/lib/data/spots-gen-{run-id}-{batch}.ts を生成する。
 *
 * Claude セッションが事前に description を生成済みで渡す想定:
 *   入力 1件 = {
 *     name: "三国港",
 *     lat: 36.21,
 *     lng: 136.15,
 *     prefecture: "福井県",
 *     city?: "坂井市",
 *     address?: "〒...",
 *     accessInfo?: "...",
 *     spotType?: "port"|"beach"|...,
 *     difficulty?: "beginner"|...,
 *     fishCandidates?: ["aji","kisu"],
 *     description: "オリジナル200-400字",
 *     isFree?: bool, hasParking?: bool, ...
 *   }
 *
 * 不足フィールドは spotType と都道府県から推定して補完する。
 * description が空のものはエラーで弾く（手抜きの丸パクリ防止）。
 *
 * slug は name から romaji 化、prefecture 接頭辞 + suffix `-sg{run-tag}` を付ける。
 * 既存 slug と衝突したら -2, -3 ...最大5まで自動リネーム。それ以上は skip して errors に記録。
 *
 * Usage:
 *   node scripts/spot-generator/format-spot.mjs \
 *     --candidates=/tmp/spotgen/{run-id}/candidates-batch-01.json \
 *     --existing=/tmp/spotgen/{run-id}/existing.json \
 *     --run-id=20260527-1030-fukui \
 *     --batch-n=1 \
 *     --out=src/lib/data/spots-gen-20260527-1030-fukui-01.ts
 *
 * 出力 (stdout): JSON {ok, added_slugs, skipped, near_misses, errors}
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function parseArgs(argv) {
  const args = {};
  for (const a of argv) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

// --- ローマ字化（slug 用） ---
// 改善版ヘボン式の簡易実装。多くのケースで十分。完璧主義は不要。
const HEPBURN_MAP = {
  あ:"a",い:"i",う:"u",え:"e",お:"o",
  か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",
  さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",
  た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",
  な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",
  は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",
  ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",
  や:"ya",ゆ:"yu",よ:"yo",
  ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",
  わ:"wa",を:"wo",ん:"n",
  が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",
  ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",
  だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",
  ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",
  ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",
  ゃ:"ya",ゅ:"yu",ょ:"yo",っ:"",
  ー:"",
};

function toSlugCore(text) {
  // ひらがな・カタカナ → ローマ字
  // カタカナはひらがなに正規化
  const hira = text.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  );
  let out = "";
  for (const ch of hira) {
    if (HEPBURN_MAP[ch] !== undefined) out += HEPBURN_MAP[ch];
    else if (/[a-zA-Z0-9]/.test(ch)) out += ch.toLowerCase();
    else if (/\s/.test(ch)) out += "-";
    // 漢字は捨てる（呼び出し側で英名/読み付与を期待）
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 都道府県名 → ローマ字 prefix
const PREF_SLUG = {
  北海道: "hokkaido", 青森県: "aomori", 岩手県: "iwate", 宮城県: "miyagi",
  秋田県: "akita", 山形県: "yamagata", 福島県: "fukushima",
  茨城県: "ibaraki", 栃木県: "tochigi", 群馬県: "gunma", 埼玉県: "saitama",
  千葉県: "chiba", 東京都: "tokyo", 神奈川県: "kanagawa",
  新潟県: "niigata", 富山県: "toyama", 石川県: "ishikawa", 福井県: "fukui",
  山梨県: "yamanashi", 長野県: "nagano",
  岐阜県: "gifu", 静岡県: "shizuoka", 愛知県: "aichi", 三重県: "mie",
  滋賀県: "shiga", 京都府: "kyoto", 大阪府: "osaka", 兵庫県: "hyogo",
  奈良県: "nara", 和歌山県: "wakayama",
  鳥取県: "tottori", 島根県: "shimane", 岡山県: "okayama", 広島県: "hiroshima", 山口県: "yamaguchi",
  徳島県: "tokushima", 香川県: "kagawa", 愛媛県: "ehime", 高知県: "kochi",
  福岡県: "fukuoka", 佐賀県: "saga", 長崎県: "nagasaki", 熊本県: "kumamoto",
  大分県: "oita", 宮崎県: "miyazaki", 鹿児島県: "kagoshima", 沖縄県: "okinawa",
};

function buildSlug(cand, runTag) {
  const prefSlug = PREF_SLUG[cand.prefecture] ?? "jp";
  const nameSlug = toSlugCore(cand.name) || "spot";
  return `${prefSlug}-${nameSlug}-sg${runTag}`;
}

// --- spotType 推定 ---
function inferSpotType(name) {
  if (/漁港|港$|港湾/.test(name)) return "port";
  if (/海岸|サーフ|浜/.test(name)) return "beach";
  if (/堤防|防波堤|突堤/.test(name)) return "breakwater";
  if (/磯/.test(name)) return "rocky";
  if (/桟橋|海釣り(公園|施設)/.test(name)) return "pier";
  if (/(川|河川|河口)$/.test(name)) return "river";
  if (/湖|沼|ダム|池$/.test(name)) return "lake";
  return "port"; // フォールバック
}

// --- 都道府県 → mazume / region category ---
function inferMazume(pref) {
  if (["北海道","青森県","秋田県","岩手県","山形県","宮城県","福島県"].includes(pref)) return "mazumeTohoku";
  if (["茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県"].includes(pref)) return "mazumeKanto";
  if (["新潟県","富山県","石川県","福井県"].includes(pref)) return "mazumeHokuriku";
  if (["山梨県","長野県","岐阜県","静岡県","愛知県","三重県"].includes(pref)) return "mazumeChubu";
  if (["滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県"].includes(pref)) return "mazumeKansai";
  if (["鳥取県","島根県","岡山県","広島県","山口県"].includes(pref)) return "mazumeChugoku";
  if (["徳島県","香川県","愛媛県","高知県"].includes(pref)) return "mazumeShikoku";
  if (["福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県"].includes(pref)) return "mazumeKyushu";
  if (pref === "沖縄県") return "mazumeOkinawa";
  return "mazumeKanto";
}

function inferTide(spotType) {
  switch (spotType) {
    case "port": return "tidePort";
    case "beach": return "tideSurf";
    case "rocky": return "tideRocky";
    case "breakwater": return "tideBreakwater";
    case "pier": return "tidePier";
    case "river": return "tideFreshwater";
    case "lake": return "tideFreshwater";
    default: return "tidePort";
  }
}

function inferBestTimes(spotType) {
  if (spotType === "rocky" || spotType === "beach") return "btMorning";
  if (spotType === "lake" || spotType === "river") return "btAllDay";
  return "btEvening";
}

// --- catchableFish 標準セット ---
const DEFAULT_FISH = {
  port: [
    { slug: "aji", monthStart: 5, monthEnd: 11, peak: true, diff: "easy", time: "夕マヅメ", method: "サビキ釣り" },
    { slug: "saba", monthStart: 6, monthEnd: 10, peak: false, diff: "easy", time: "朝マヅメ", method: "サビキ釣り" },
    { slug: "kisu", monthStart: 5, monthEnd: 10, peak: false, diff: "easy", time: "日中", method: "ちょい投げ" },
  ],
  breakwater: [
    { slug: "aji", monthStart: 5, monthEnd: 11, peak: true, diff: "easy", time: "夕マヅメ", method: "サビキ釣り" },
    { slug: "mebaru", monthStart: 11, monthEnd: 5, peak: true, diff: "medium", time: "夜", method: "メバリング" },
    { slug: "kasago", monthStart: 1, monthEnd: 12, peak: false, diff: "easy", time: "夜", method: "穴釣り" },
  ],
  beach: [
    { slug: "kisu", monthStart: 5, monthEnd: 10, peak: true, diff: "easy", time: "日中", method: "投げ釣り" },
    { slug: "hirame", monthStart: 9, monthEnd: 4, peak: true, diff: "hard", time: "朝マヅメ", method: "ルアー" },
    { slug: "magochi", monthStart: 6, monthEnd: 9, peak: false, diff: "medium", time: "朝マヅメ", method: "ルアー" },
  ],
  rocky: [
    { slug: "mejina", monthStart: 11, monthEnd: 4, peak: true, diff: "medium", time: "日中", method: "フカセ釣り" },
    { slug: "kasago", monthStart: 1, monthEnd: 12, peak: false, diff: "easy", time: "夜", method: "穴釣り" },
    { slug: "aoriika", monthStart: 9, monthEnd: 12, peak: true, diff: "medium", time: "朝マヅメ", method: "エギング" },
  ],
  pier: [
    { slug: "aji", monthStart: 5, monthEnd: 11, peak: true, diff: "easy", time: "夕マヅメ", method: "サビキ釣り" },
    { slug: "saba", monthStart: 6, monthEnd: 10, peak: false, diff: "easy", time: "朝マヅメ", method: "サビキ釣り" },
    { slug: "iwashi", monthStart: 5, monthEnd: 11, peak: false, diff: "easy", time: "朝マヅメ", method: "サビキ釣り" },
  ],
  river: [
    { slug: "ayu", monthStart: 6, monthEnd: 9, peak: true, diff: "medium", time: "日中", method: "友釣り" },
    { slug: "haze", monthStart: 8, monthEnd: 11, peak: false, diff: "easy", time: "日中", method: "ちょい投げ" },
    { slug: "iwana", monthStart: 4, monthEnd: 9, peak: false, diff: "medium", time: "朝マヅメ", method: "フライ" },
  ],
  lake: [
    { slug: "blackbass", monthStart: 4, monthEnd: 11, peak: true, diff: "medium", time: "夕マヅメ", method: "ルアー" },
    { slug: "wakasagi", monthStart: 11, monthEnd: 3, peak: true, diff: "easy", time: "日中", method: "ワカサギ釣り" },
    { slug: "herabuna", monthStart: 4, monthEnd: 10, peak: false, diff: "medium", time: "日中", method: "ヘラ釣り" },
  ],
};

function emitCatchableFish(fishCandidates, spotType) {
  const list = (fishCandidates && fishCandidates.length > 0
    ? fishCandidates.map((slug) => ({ slug, monthStart: 5, monthEnd: 11, peak: true, diff: "medium", time: "夕マヅメ", method: "サビキ釣り" }))
    : DEFAULT_FISH[spotType] ?? DEFAULT_FISH.port);
  return list
    .map(
      (f) =>
        `    { fish: fish("${f.slug}"), monthStart: ${f.monthStart}, monthEnd: ${f.monthEnd}, peakSeason: ${f.peak}, catchDifficulty: "${f.diff}", recommendedTime: "${f.time}", method: "${f.method}" }`,
    )
    .join(",\n");
}

// --- 1スポット TS スニペット生成 ---
function renderSpot(spot, idCounter, runTag) {
  const id = `sg${runTag}${String(idCounter).padStart(3, "0")}`;
  return `  {
    id: "${id}", name: ${JSON.stringify(spot.name)}, slug: "${spot.slug}",
    description: ${JSON.stringify(spot.description)},
    latitude: ${spot.lat}, longitude: ${spot.lng},
    address: ${JSON.stringify(spot.address ?? "")},
    accessInfo: ${JSON.stringify(spot.accessInfo ?? "")},
    region: localRegion("${spot.regionId}"), spotType: "${spot.spotType}", difficulty: "${spot.difficulty}",
    isFree: ${spot.isFree ?? true}, hasParking: ${spot.hasParking ?? false}, hasToilet: ${spot.hasToilet ?? false},
    hasConvenienceStore: ${spot.hasConvenienceStore ?? false}, hasFishingShop: ${spot.hasFishingShop ?? false}, hasRentalRod: false,
    mainImageUrl: "/images/spots/placeholder.svg", images: [], rating: 4.0, reviewCount: 0,
    catchableFish: [
${emitCatchableFish(spot.fishCandidates, spot.spotType)}
    ],
    bestTimes: ${spot.bestTimes}, tideAdvice: ${spot.tideAdvice}, mazumeInfo: ${spot.mazumeInfo},
  }`;
}

// --- ファイル全体生成 ---
function renderFile(spots, runId, batchN) {
  const runTag = runId.replace(/-/g, "").slice(0, 12); // 衝突回避用の短縮タグ
  const exportName = `spotsGen${runTag.replace(/^./, (c) => c.toUpperCase())}B${batchN}`;
  const localRegions = collectLocalRegions(spots, runId, batchN);
  const spotLines = spots.map((s, i) => renderSpot(s, i + 1, runTag)).join(",\n");
  return `import { FishingSpot, FishSpecies, Region } from "@/types";
import { getFishBySlug } from "./fish";
import { regions } from "./regions";

function fish(slug: string): FishSpecies { const f = getFishBySlug(slug); if (!f) throw new Error(\`Fish not found: \${slug}\`); return f; }
function region(id: string) { const r = regions.find((r) => r.id === id); if (!r) throw new Error(\`Region not found: \${id}\`); return r; }

const localRegions: Region[] = [
${localRegions.map((r) => `  { id: ${JSON.stringify(r.id)}, prefecture: ${JSON.stringify(r.prefecture)}, areaName: ${JSON.stringify(r.areaName)}, slug: ${JSON.stringify(r.slug)} }`).join(",\n")}
];

function localRegion(id: string) { return localRegions.find((r) => r.id === id) || region(id); }

const mazumeKanto = { springSunrise: "5:10頃", springSunset: "18:10頃", summerSunrise: "4:30頃", summerSunset: "18:55頃", autumnSunrise: "5:30頃", autumnSunset: "17:00頃", winterSunrise: "6:45頃", winterSunset: "16:30頃", tip: "東京湾・相模湾は黒潮の影響で魚種が多い。" };
const mazumeChubu = { springSunrise: "5:10頃", springSunset: "18:20頃", summerSunrise: "4:35頃", summerSunset: "19:05頃", autumnSunrise: "5:30頃", autumnSunset: "17:05頃", winterSunrise: "6:50頃", winterSunset: "16:40頃", tip: "駿河湾は深海魚も含め魚種が非常に豊富。" };
const mazumeHokuriku = { springSunrise: "5:10頃", springSunset: "18:30頃", summerSunrise: "4:30頃", summerSunset: "19:10頃", autumnSunrise: "5:30頃", autumnSunset: "17:10頃", winterSunrise: "6:55頃", winterSunset: "16:40頃", tip: "日本海側は冬の荒天に注意。" };
const mazumeKansai = { springSunrise: "5:25頃", springSunset: "18:25頃", summerSunrise: "4:45頃", summerSunset: "19:15頃", autumnSunrise: "5:45頃", autumnSunset: "17:15頃", winterSunrise: "7:00頃", winterSunset: "16:50頃", tip: "瀬戸内・大阪湾は潮汐差が大きく潮通しが重要。" };
const mazumeTohoku = { springSunrise: "4:50頃", springSunset: "18:30頃", summerSunrise: "4:10頃", summerSunset: "19:10頃", autumnSunrise: "5:10頃", autumnSunset: "17:20頃", winterSunrise: "6:50頃", winterSunset: "16:25頃", tip: "東北は寒暖差が大きく、季節ごとに狙う魚を切り替える。" };
const mazumeChugoku = { springSunrise: "5:30頃", springSunset: "18:30頃", summerSunrise: "4:50頃", summerSunset: "19:20頃", autumnSunrise: "5:50頃", autumnSunset: "17:20頃", winterSunrise: "7:05頃", winterSunset: "16:55頃", tip: "瀬戸内側は穏やか、日本海側は潮の動きをよく見る。" };
const mazumeShikoku = { springSunrise: "5:30頃", springSunset: "18:30頃", summerSunrise: "4:50頃", summerSunset: "19:20頃", autumnSunrise: "5:50頃", autumnSunset: "17:20頃", winterSunrise: "7:05頃", winterSunset: "16:55頃", tip: "黒潮の影響で青物実績も高い。" };
const mazumeKyushu = { springSunrise: "5:50頃", springSunset: "18:45頃", summerSunrise: "5:10頃", summerSunset: "19:30頃", autumnSunrise: "6:10頃", autumnSunset: "17:35頃", winterSunrise: "7:20頃", winterSunset: "17:10頃", tip: "黒潮・対馬暖流の双方の影響で魚種が非常に豊富。" };
const mazumeOkinawa = { springSunrise: "6:20頃", springSunset: "19:00頃", summerSunrise: "5:40頃", summerSunset: "19:30頃", autumnSunrise: "6:30頃", autumnSunset: "18:00頃", winterSunrise: "7:20頃", winterSunset: "17:50頃", tip: "亜熱帯魚種が多く一年中楽しめる。" };

const btMorning = [{ label: "朝マヅメ", timeRange: "5:00〜7:30", rating: "best" as const }, { label: "日中", timeRange: "10:00〜14:00", rating: "good" as const }, { label: "夕マヅメ", timeRange: "16:30〜18:30", rating: "good" as const }, { label: "夜", timeRange: "20:00〜23:00", rating: "fair" as const }];
const btEvening = [{ label: "朝マヅメ", timeRange: "5:00〜7:00", rating: "good" as const }, { label: "日中", timeRange: "10:00〜15:00", rating: "fair" as const }, { label: "夕マヅメ", timeRange: "16:00〜18:30", rating: "best" as const }, { label: "夜", timeRange: "19:00〜22:00", rating: "good" as const }];
const btAllDay = [{ label: "朝", timeRange: "6:00〜9:00", rating: "best" as const }, { label: "日中", timeRange: "10:00〜15:00", rating: "good" as const }, { label: "夕方", timeRange: "15:00〜18:00", rating: "best" as const }, { label: "夜", timeRange: "19:00〜21:00", rating: "fair" as const }];

const tidePort = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "港内は満潮前後に小魚が入りやすい。" };
const tideBreakwater = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮〜満潮", description: "堤防では潮が動く時間帯にアジやサバの回遊が活発になる。" };
const tideSurf = { bestTide: "大潮〜中潮", bestTidePhase: "下げ始め", description: "サーフでは下げ潮で離岸流が発生し魚が集まりやすい。" };
const tideRocky = { bestTide: "中潮〜大潮", bestTidePhase: "上げ潮", description: "磯は上げ潮時に活性が上がりやすい。" };
const tideFreshwater = { bestTide: "なし", bestTidePhase: "なし", description: "淡水域のため潮汐の影響はありませんが、気圧変化や水温で活性が変わります。" };
const tidePier = { bestTide: "中潮〜大潮", bestTidePhase: "満潮前後", description: "桟橋・海釣り施設では潮位が高い時間帯が狙い目。" };

export const ${exportName}: FishingSpot[] = [
${spotLines}
];
`;
}

// --- localRegions の自動生成 ---
// 同一バッチ内で都道府県ごとに1個ずつ作る簡易実装。
function collectLocalRegions(spots, runId, batchN) {
  const runTag = runId.replace(/-/g, "").slice(0, 12);
  const seen = new Map();
  for (const s of spots) {
    if (seen.has(s.prefecture)) continue;
    const prefSlug = PREF_SLUG[s.prefecture] ?? "jp";
    const id = `rg${runTag}${String(batchN).padStart(2, "0")}${String(seen.size + 1).padStart(2, "0")}`;
    seen.set(s.prefecture, {
      id,
      prefecture: s.prefecture,
      areaName: s.city ?? s.prefecture,
      slug: `${prefSlug}-${s.city ? toSlugCore(s.city) : "all"}-sg${runTag}`,
    });
  }
  for (const s of spots) {
    s.regionId = seen.get(s.prefecture).id;
  }
  return [...seen.values()];
}

// --- メイン ---
function main() {
  const args = parseArgs(process.argv.slice(2));
  for (const k of ["candidates", "existing", "run-id", "batch-n", "out"]) {
    if (!args[k]) {
      console.error(`missing --${k}`);
      process.exit(1);
    }
  }

  const candidates = JSON.parse(fs.readFileSync(args.candidates, "utf8"));
  const existing = JSON.parse(fs.readFileSync(args.existing, "utf8"));
  const existingSlugs = new Set(existing.map((e) => e.slug));
  const existingCoords = existing.map((e) => ({ lat: e.lat, lng: e.lng }));

  const runId = args["run-id"];
  const runTag = runId.replace(/-/g, "").slice(0, 12);
  const batchN = Number(args["batch-n"]);

  const added = [];
  const skipped = [];
  const nearMisses = [];
  const errors = [];

  for (const raw of candidates) {
    try {
      if (!raw.description || raw.description.length < 80) {
        errors.push({ name: raw.name, reason: "description が短すぎる（80字未満）。Claude のオリジナル生成が必須" });
        continue;
      }
      const spotType = raw.spotType ?? inferSpotType(raw.name);
      let slug = buildSlug(raw, runTag);
      // 衝突 -> -2 -3 で最大5回まで
      let renamed = 0;
      while (existingSlugs.has(slug) && renamed < 5) {
        renamed++;
        slug = `${buildSlug(raw, runTag)}-${renamed + 1}`;
      }
      if (existingSlugs.has(slug)) {
        skipped.push({ name: raw.name, reason: "slug 衝突を5回リネームしても解消せず" });
        continue;
      }
      // 座標範囲チェック
      if (
        typeof raw.lat !== "number" || typeof raw.lng !== "number" ||
        raw.lat < 24 || raw.lat > 46 || raw.lng < 122 || raw.lng > 146
      ) {
        errors.push({ name: raw.name, reason: `座標が日本範囲外: ${raw.lat},${raw.lng}` });
        continue;
      }
      // 300m 近接チェック
      const near = existingCoords.find(
        (e) => haversine(e.lat, e.lng, raw.lat, raw.lng) < 300,
      );
      if (near) {
        nearMisses.push({ name: raw.name, lat: raw.lat, lng: raw.lng, near });
        // 警告のみ。追加は続行
      }
      existingSlugs.add(slug);
      added.push({
        ...raw,
        slug,
        spotType,
        difficulty: raw.difficulty ?? "beginner",
        bestTimes: inferBestTimes(spotType),
        tideAdvice: inferTide(spotType),
        mazumeInfo: inferMazume(raw.prefecture),
      });
    } catch (e) {
      errors.push({ name: raw?.name ?? "(unknown)", reason: e.message });
    }
  }

  if (added.length === 0) {
    console.log(
      JSON.stringify({ ok: false, added_slugs: [], skipped, near_misses: nearMisses, errors, reason: "no candidates passed validation" }),
    );
    process.exit(0);
  }

  const tsContent = renderFile(added, runId, batchN);
  const outPath = path.isAbsolute(args.out) ? args.out : path.join(REPO_ROOT, args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, tsContent, "utf8");

  console.log(
    JSON.stringify({
      ok: true,
      added_slugs: added.map((a) => a.slug),
      skipped,
      near_misses: nearMisses,
      errors,
      file: outPath,
    }),
  );
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

main();
