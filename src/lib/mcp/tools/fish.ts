// 魚種: 今釣れる魚・魚の情報・おすすめ仕掛けと道具
import type { FishSpecies } from "@/types";
import { fishingSpots } from "@/lib/data/spots";
import { fishSpecies } from "@/lib/data/fish";
import { getMonthlyRigs } from "@/lib/data/monthly-rigs";
import { getHookSizeData } from "@/lib/data/hook-sizes";
import { getRelevantAffiliateProducts } from "@/lib/data/affiliate-products";
import { getAmazonUrl, getRakutenUrl } from "@/lib/affiliate-config";
import { formatMonthRanges } from "@/lib/spot-restrictions";
import {
  type ToolDef,
  ToolInputError,
  LEVEL_LABELS,
  str,
  month,
  norm,
  currentMonthJST,
  resolveFishSlugs,
  requireSpot,
  fishInMonth,
  truncate,
  siteUrl,
} from "./shared";

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
// 魚名 → 1魚種
// ---------------------------------------------------------------------------

/** 魚名から代表の1魚種を選ぶ（名前の完全一致 > 人気順の先頭）。候補が複数なら他候補名も返す */
export function pickFish(args: Record<string, unknown>): { fish: FishSpecies; others: string[] } {
  const query = str(args.fish, 30);
  if (!query) throw new ToolInputError("fish に魚の名前を指定してください（例: アジ、アオリイカ）");
  const slugs = resolveFishSlugs(query);
  const candidates = fishSpecies.filter((f) => slugs.has(f.slug));
  if (candidates.length === 0) {
    throw new ToolInputError(`魚種「${query}」はツリスポに登録がありません。一般的な和名（例: マアジ、クロダイ）で指定してください`);
  }
  const q = norm(query);
  const fish = candidates.find((f) => norm(f.name) === q) ?? candidates[0];
  return { fish, others: candidates.filter((f) => f !== fish).slice(0, 5).map((f) => f.name) };
}

const CATEGORY_LABELS: Record<FishSpecies["category"], string> = {
  sea: "海水魚",
  freshwater: "淡水魚",
  brackish: "汽水域の魚",
};

const DANGER_LABELS = { low: "低", medium: "中", high: "高" } as const;

// ---------------------------------------------------------------------------
// get_fish_info
// ---------------------------------------------------------------------------

export function getFishInfo(args: Record<string, unknown>) {
  const { fish, others } = pickFish(args);
  const spotCount = fishingSpots.filter(
    (s) => s.fishingBan?.scope !== "full" && s.catchableFish.some((cf) => cf.fish.slug === fish.slug),
  ).length;
  const hasDanger = fish.isPoisonous || fish.dangerLevel || (fish.dangerNotes?.length ?? 0) > 0;

  return {
    name: fish.name,
    kana: fish.nameKana,
    english: fish.nameEnglish || undefined,
    scientificName: fish.scientificName || undefined,
    category: CATEGORY_LABELS[fish.category],
    family: fish.family,
    description: truncate(fish.description, 300),
    size: fish.sizeCm,
    difficulty: LEVEL_LABELS[fish.difficulty],
    taste: `${fish.tasteRating}/5`,
    season: formatMonthRanges(fish.seasonMonths) || undefined,
    peakSeason: formatMonthRanges(fish.peakMonths) || undefined,
    methods: (fish.fishingMethods ?? []).slice(0, 6).map((fm) => ({
      method: fm.methodName,
      difficulty: LEVEL_LABELS[fm.difficulty],
      bestSeason: fm.bestSeason,
    })),
    danger: hasDanger
      ? {
          poisonous: fish.isPoisonous ?? false,
          poisonType: fish.poisonType,
          level: fish.dangerLevel ? DANGER_LABELS[fish.dangerLevel] : undefined,
          notes: fish.dangerNotes?.slice(0, 4),
        }
      : undefined,
    cookingTips: fish.cookingTips.slice(0, 3).map((t) => truncate(t, 120)),
    spotsListed: spotCount,
    otherMatches: others.length > 0 ? others : undefined,
    url: siteUrl(`/fish/${fish.slug}`),
    hint: "釣れる釣り場は search_spots の fish、道具は recommend_gear で調べられます",
  };
}

// ---------------------------------------------------------------------------
// recommend_gear
// ---------------------------------------------------------------------------

/** 釣り方 → 解説ガイド（実在する /guide 配下のみ） */
const METHOD_GUIDES: { keys: string[]; path: string; label: string }[] = [
  { keys: ["サビキ"], path: "/guide/sabiki", label: "サビキ釣りガイド" },
  { keys: ["エギング"], path: "/guide/eging", label: "エギングガイド" },
  { keys: ["ちょい投げ", "チョイ投げ"], path: "/guide/choinage", label: "ちょい投げガイド" },
  { keys: ["ウキ釣り", "ウキフカセ"], path: "/guide/float-fishing", label: "ウキ釣りガイド" },
  { keys: ["泳がせ"], path: "/guide/oyogase", label: "泳がせ釣りガイド" },
  { keys: ["穴釣り"], path: "/guide/anazuri", label: "穴釣りガイド" },
  { keys: ["カゴ釣り"], path: "/guide/entou-kago", label: "遠投カゴ釣りガイド" },
  { keys: ["ジギング", "ショアジギ"], path: "/guide/jigging", label: "ジギングガイド" },
  { keys: ["ルアー"], path: "/guide/lure", label: "ルアー釣りガイド" },
];

const methodMatches = (a: string, b: string) => {
  const x = norm(a);
  const y = norm(b);
  return x.includes(y) || y.includes(x);
};

const MAX_METHODS = 3;
const MAX_PRODUCTS = 4;

export function recommendGear(args: Record<string, unknown>) {
  const { fish } = pickFish(args);
  const methodQuery = str(args.method, 30);
  const m = month(args.month) ?? currentMonthJST();

  const allMethods = (fish.fishingMethods ?? []).map((fm, index) => ({ fm, index }));
  const matched = methodQuery ? allMethods.filter(({ fm }) => methodMatches(fm.methodName, methodQuery)) : allMethods;
  const methods = (matched.length > 0 ? matched : allMethods).slice(0, MAX_METHODS);
  const methodNote =
    methodQuery && matched.length === 0
      ? `「${methodQuery}」は${fish.name}の登録釣り方にありません。登録済みの釣り方: ${allMethods.map(({ fm }) => fm.methodName).join("・") || "なし"}`
      : undefined;

  const rigs = getMonthlyRigs(m).filter(
    (r) => r.fishSlug === fish.slug && (!methodQuery || methodMatches(r.method, methodQuery)),
  );

  // 商品は「この魚 or この釣り方」に効くものだけ（無関係な商品は出さない＝アフィリエイト運用ルール）
  const methodNames = [...methods.map(({ fm }) => fm.methodName), ...rigs.map((r) => r.method)];
  if (methodQuery) methodNames.push(methodQuery);
  const fishNames = [fish.name, ...(fish.aliases ?? [])];
  const isRelevant = (p: { methodKeywords: string[]; fishKeywords?: string[] }) =>
    (p.fishKeywords ?? []).some((k) => fishNames.some((n) => n.includes(k) || k.includes(n))) ||
    p.methodKeywords.some((k) => methodNames.some((n) => n.includes(k)));
  const products = getRelevantAffiliateProducts(methodNames, m, 30, false, undefined, fishNames)
    .filter(isRelevant)
    .slice(0, MAX_PRODUCTS);

  const guideSet = new Map<string, string>();
  for (const r of rigs) if (r.guideLink) guideSet.set(r.guideLink, r.guideLinkLabel ?? "解説ガイド");
  for (const g of METHOD_GUIDES) {
    if (methodNames.some((n) => g.keys.some((k) => n.includes(k)))) guideSet.set(g.path, g.label);
  }

  return {
    fish: fish.name,
    month: m,
    methods: methods.map(({ fm, index }) => {
      const hook = getHookSizeData(fish.slug, index);
      const hm = hook?.months[m - 1];
      return {
        method: fm.methodName,
        difficulty: LEVEL_LABELS[fm.difficulty],
        tackle: {
          rod: fm.tackle.rod,
          reel: fm.tackle.reel,
          line: fm.tackle.line,
          hookOrLure: fm.tackle.hookOrLure,
          other: fm.tackle.otherItems.slice(0, 5),
        },
        hookSizeThisMonth: hook && hm
          ? { type: hook.hookType, size: hm.size === "-" ? "オフシーズン" : hm.size, note: hm.note || undefined }
          : undefined,
        tips: fm.tips.slice(0, 2).map((t) => truncate(t, 120)),
        shopSearch: {
          amazon: getAmazonUrl(`${fish.name} ${fm.methodName} 仕掛け`),
          rakuten: getRakutenUrl(`${fish.name} ${fm.methodName} 仕掛け`),
        },
      };
    }),
    monthlyRig: rigs.map((r) => ({
      method: r.method,
      items: r.items.map((i) => `${i.name}: ${i.spec}`),
    })),
    products: products.map((p) => ({
      name: p.name,
      description: truncate(p.description, 100),
      priceRange: p.priceRange,
      url: p.url,
    })),
    methodNote,
    guides: [
      { label: `${fish.name}の釣り方・仕掛け（ツリスポ魚図鑑）`, url: siteUrl(`/fish/${fish.slug}`) },
      ...[...guideSet.entries()].map(([path, label]) => ({ label, url: siteUrl(path) })),
    ],
    disclosure:
      products.length > 0 || methods.length > 0
        ? "products と shopSearch の URL はツリスポのアフィリエイトリンク（広告）です。紹介する場合はその旨を添えてください"
        : undefined,
  };
}

// ---------------------------------------------------------------------------
// 定義
// ---------------------------------------------------------------------------

export const FISH_TOOLS: ToolDef[] = [
  {
    name: "get_catchable_fish",
    title: "今釣れる魚",
    description:
      "指定月に釣れる魚を返します。slug を指定するとその釣り場、prefecture を指定すると都道府県全体の傾向（釣れるスポット数順）。" +
      "例: {\"prefecture\":\"千葉県\",\"month\":11}",
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
  {
    name: "get_fish_info",
    title: "魚の図鑑情報",
    description:
      "魚1種の図鑑情報（釣れる時期・最盛期・大きさ・釣りの難易度・味・主な釣り方・毒やトゲなどの危険・料理のコツ）を返します。" +
      "「アイゴって食べられる？」「タチウオはいつ釣れる？」などに使ってください。例: {\"fish\":\"タチウオ\"}",
    inputSchema: {
      type: "object",
      properties: { fish: { type: "string", description: "魚の名前（和名・かな・別名可。例: タチウオ、あおりいか、シーバス）" } },
      required: ["fish"],
    },
    run: getFishInfo,
  },
  {
    name: "recommend_gear",
    title: "おすすめの仕掛け・道具",
    description:
      "狙う魚（と釣り方・月）に合ったタックル（竿・リール・道糸・針/ルアー）、その月の針サイズ、月別の定番仕掛け、関連商品と解説ガイドを返します。" +
      "商品はその魚・釣り方に関係するものだけです。例: {\"fish\":\"アジ\",\"method\":\"サビキ\",\"month\":7}",
    inputSchema: {
      type: "object",
      properties: {
        fish: { type: "string", description: "狙う魚（例: アジ、アオリイカ）" },
        method: { type: "string", description: "釣り方（例: サビキ、エギング、ちょい投げ）。省略時は主な釣り方を最大3つ" },
        month: { type: "integer", minimum: 1, maximum: 12, description: "釣行月（省略時は今月）。針サイズ・季節商品に反映" },
      },
      required: ["fish"],
    },
    run: recommendGear,
  },
];
