import { describe, it, expect } from "vitest";
import {
  DESCRIPTION_MIN,
  composeMetaDescription,
  joinNames,
  firstSentence,
  buildMatrixDescription,
  buildPrefFishDescription,
  buildSpotMetaDescription,
  buildPrefMonthDescription,
  buildPrefMethodDescription,
} from "@/lib/seo/meta-description";
import { DESCRIPTION_MAX } from "@/lib/utils/seo";
import {
  getEligiblePrefMonthFishCombos,
  getEligiblePrefFishCombos,
  getSpotsByPrefectureAndFish,
} from "@/lib/data";
import { prefectures, getPrefectureBySlug } from "@/lib/data/prefectures";
import { fishSpecies, getFishBySlug } from "@/lib/data/fish";
import { fishingSpots } from "@/lib/data/spots";
import {
  MONTHS,
  FISHING_METHODS,
  getMonthBySlug,
  isMonthInRange,
} from "@/lib/data/fishing-methods";
import {
  REGIONAL_WATER_TEMP,
  type RegionGroup,
} from "@/lib/data/prefecture-month-enrichment";

/** コードポイント長（SERP の体感長・ビルダーの内部計測と一致）。 */
const cp = (s: string) => [...s].length;

/** 配列を最大 max 件へ均等サンプリング（都道府県間の偏りを避ける）。 */
function sample<T>(arr: T[], max = 500): T[] {
  if (arr.length <= max) return arr;
  const out: T[] = [];
  const step = arr.length / max;
  for (let i = 0; i < arr.length; i += step) out.push(arr[Math.floor(i)]);
  return out;
}

/** 全 description が 120..158 字であることを検証。 */
function expectAllInRange(descriptions: string[]) {
  for (const desc of descriptions) {
    const len = cp(desc);
    expect(
      len,
      `長さ ${len} が範囲外 (期待 ${DESCRIPTION_MIN}..${DESCRIPTION_MAX}): "${desc}"`,
    ).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(
      len,
      `長さ ${len} が範囲外 (期待 ${DESCRIPTION_MIN}..${DESCRIPTION_MAX}): "${desc}"`,
    ).toBeLessThanOrEqual(DESCRIPTION_MAX);
  }
}

/** 同一種別内で完全一致の重複がゼロであることを検証。 */
function expectUnique(descriptions: string[]) {
  expect(new Set(descriptions).size).toBe(descriptions.length);
}

// マトリクス page.tsx の WATER_TEMP と一致させること。
const WATER_TEMP: Record<number, string> = {
  1: "8〜12℃",
  2: "7〜10℃",
  3: "10〜14℃",
  4: "13〜17℃",
  5: "16〜20℃",
  6: "19〜23℃",
  7: "22〜27℃",
  8: "25〜29℃",
  9: "23〜27℃",
  10: "19〜23℃",
  11: "15〜19℃",
  12: "11〜15℃",
};

describe("composeMetaDescription（基礎）", () => {
  it("falsy を除去して結合する", () => {
    expect(composeMetaDescription(["A。", false, null, undefined, "B。"])).toBe(
      "A。B。",
    );
  });

  it("min 未満なら fallbackTail を必要なだけ足して最低長を担保する", () => {
    const out = composeMetaDescription(["短い説明です。"], {
      fallbackTail: [
        "季節ごとに多彩な魚が狙える釣り場です。",
        "駐車場やトイレの有無も掲載しています。",
        "アクセスや地図の情報もまとめています。",
        "初心者にもやさしいスポットを紹介します。",
        "ファミリーでの釣行にもおすすめです。",
        "近くの釣り場探しにも役立ちます。",
        "ぜひ釣行前の計画にご活用ください。",
      ],
    });
    expect(cp(out)).toBeGreaterThanOrEqual(DESCRIPTION_MIN);
    expect(cp(out)).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it("max を超えるアトムは足さない（文の途中で切らない）", () => {
    const long = "あ".repeat(60) + "。";
    const out = composeMetaDescription([long, long, long, long]);
    expect(cp(out)).toBeLessThanOrEqual(DESCRIPTION_MAX);
    // 60字の文がちょうど2つ入り、3つ目は入らない（180>158）
    expect(cp(out)).toBe(122);
  });

  it("joinNames は先頭 limit 件を『・』で結合する", () => {
    expect(joinNames(["A", "B", "C", "D"], 2)).toBe("A・B");
    expect(joinNames([])).toBe("");
  });

  it("firstSentence は句点までを返し、長すぎる文は空にする", () => {
    expect(firstSentence("これは最初の文です。次の文。", 40)).toBe(
      "これは最初の文です。",
    );
    expect(firstSentence("あ".repeat(80) + "。", 40)).toBe("");
  });
});

describe("buildMatrixDescription（県×月×魚種）", () => {
  const combos = sample(getEligiblePrefMonthFishCombos(2));

  const descriptions = combos
    .map((c) => {
      const pref = getPrefectureBySlug(c.prefSlug);
      const month = getMonthBySlug(c.monthSlug);
      const fish = fishSpecies.find((f) => f.slug === c.fishSlug);
      if (!pref || !month || !fish) return null;

      const matchingSpots = fishingSpots
        .filter((s) => s.region.prefecture === pref.name)
        .map((spot) => {
          const matchingCf = spot.catchableFish.filter(
            (cf) =>
              cf.fish.slug === c.fishSlug &&
              isMonthInRange(month.num, cf.monthStart, cf.monthEnd),
          );
          if (matchingCf.length === 0) return null;
          return {
            spot,
            isPeak: matchingCf.some((cf) => cf.peakSeason),
            methods: matchingCf.map((cf) => cf.method),
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null)
        .sort((a, b) => {
          if (a.isPeak !== b.isPeak) return a.isPeak ? -1 : 1;
          return b.spot.rating - a.spot.rating;
        });

      const methodCount = new Map<string, number>();
      for (const m of matchingSpots)
        for (const method of m.methods)
          methodCount.set(method, (methodCount.get(method) || 0) + 1);

      return buildMatrixDescription({
        prefName: pref.name,
        monthName: month.name,
        fishName: fish.name,
        spotCount: matchingSpots.length,
        topSpotNames: matchingSpots.map((m) => m.spot.name),
        topMethods: [...methodCount.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([m]) => m),
        waterTemp: WATER_TEMP[month.num],
        isPeak: matchingSpots.some((m) => m.isPeak),
      });
    })
    .filter((d): d is string => d !== null);

  it(`全件 ${DESCRIPTION_MIN}..${DESCRIPTION_MAX} 字（${combos.length}件サンプル）`, () => {
    expect(descriptions.length).toBeGreaterThan(0);
    expectAllInRange(descriptions);
  });

  it("完全一致の重複ゼロ", () => {
    expectUnique(descriptions);
  });
});

describe("buildPrefFishDescription（県×魚種）", () => {
  const combos = sample(getEligiblePrefFishCombos(3));

  const descriptions = combos
    .map((c) => {
      const pref = getPrefectureBySlug(c.prefSlug);
      const fish = getFishBySlug(c.fishSlug);
      if (!pref || !fish) return null;

      const spots = getSpotsByPrefectureAndFish(pref.name, c.fishSlug);
      const methodMap = new Map<string, number>();
      for (const s of spots) {
        const cf = s.catchableFish.find((x) => x.fish.slug === c.fishSlug);
        if (cf) methodMap.set(cf.method, (methodMap.get(cf.method) || 0) + 1);
      }
      const easyCount = spots.filter((s) => {
        const cf = s.catchableFish.find((x) => x.fish.slug === c.fishSlug);
        return cf?.catchDifficulty === "easy";
      }).length;

      return buildPrefFishDescription({
        prefName: pref.name,
        fishName: fish.name,
        spotCount: spots.length,
        topSpotNames: [...spots]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 2)
          .map((s) => s.name),
        peakMonths: fish.peakMonths.sort((a, b) => a - b).map((m) => `${m}月`),
        topMethods: [...methodMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([m]) => m),
        easyCount,
      });
    })
    .filter((d): d is string => d !== null);

  it(`全件 ${DESCRIPTION_MIN}..${DESCRIPTION_MAX} 字（${combos.length}件サンプル）`, () => {
    expect(descriptions.length).toBeGreaterThan(0);
    expectAllInRange(descriptions);
  });

  it("完全一致の重複ゼロ", () => {
    expectUnique(descriptions);
  });
});

describe("buildSpotMetaDescription（スポット詳細）", () => {
  const spots = sample(fishingSpots);
  const descriptions = spots.map((s) => buildSpotMetaDescription(s));

  it(`全件 ${DESCRIPTION_MIN}..${DESCRIPTION_MAX} 字（${spots.length}件サンプル）`, () => {
    expect(descriptions.length).toBeGreaterThan(0);
    expectAllInRange(descriptions);
  });

  it("完全一致の重複ゼロ", () => {
    expectUnique(descriptions);
  });
});

describe("buildPrefMonthDescription（県×月）", () => {
  const combos: { pref: (typeof prefectures)[number]; month: (typeof MONTHS)[number] }[] =
    [];
  for (const pref of prefectures)
    for (const month of MONTHS) combos.push({ pref, month });

  const descriptions = sample(combos)
    .map(({ pref, month }) => {
      const prefSpots = fishingSpots.filter(
        (s) => s.region.prefecture === pref.name,
      );
      const fishMap = new Map<string, { name: string; count: number }>();
      for (const spot of prefSpots)
        for (const cf of spot.catchableFish)
          if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
            const e = fishMap.get(cf.fish.slug);
            if (e) e.count++;
            else fishMap.set(cf.fish.slug, { name: cf.fish.name, count: 1 });
          }
      const catchableFishList = [...fishMap.values()].sort(
        (a, b) => b.count - a.count,
      );
      const spotsWithMatch = prefSpots
        .map((spot) => ({
          spot,
          matchCount: spot.catchableFish.filter((cf) =>
            isMonthInRange(month.num, cf.monthStart, cf.monthEnd),
          ).length,
        }))
        .filter(({ matchCount }) => matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount || b.spot.rating - a.spot.rating);

      if (spotsWithMatch.length === 0) return null;

      return buildPrefMonthDescription({
        prefName: pref.name,
        monthName: month.name,
        fishCount: catchableFishList.length,
        topFishNames: catchableFishList.slice(0, 3).map((f) => f.name),
        spotCount: spotsWithMatch.length,
        topSpotNames: spotsWithMatch.slice(0, 2).map((x) => x.spot.name),
        waterTemp: REGIONAL_WATER_TEMP[pref.regionGroup as RegionGroup]?.[month.num],
        season: month.season,
      });
    })
    .filter((d): d is string => d !== null);

  it(`全件 ${DESCRIPTION_MIN}..${DESCRIPTION_MAX} 字`, () => {
    expect(descriptions.length).toBeGreaterThan(0);
    expectAllInRange(descriptions);
  });

  it("完全一致の重複ゼロ", () => {
    expectUnique(descriptions);
  });
});

describe("buildPrefMethodDescription（県×釣り方）", () => {
  const combos: { prefName: string; method: (typeof FISHING_METHODS)[number] }[] =
    [];
  for (const pref of prefectures)
    for (const method of FISHING_METHODS)
      combos.push({ prefName: pref.name, method });

  const descriptions = sample(combos)
    .map(({ prefName, method }) => {
      const matchingSpots = fishingSpots.filter(
        (s) =>
          s.region.prefecture === prefName &&
          s.catchableFish.some((cf) => method.methods.includes(cf.method)),
      );
      if (matchingSpots.length < 3) return null;

      const fishMap = new Map<string, { name: string; count: number }>();
      for (const spot of matchingSpots)
        for (const cf of spot.catchableFish)
          if (method.methods.includes(cf.method)) {
            const e = fishMap.get(cf.fish.slug);
            if (e) e.count++;
            else fishMap.set(cf.fish.slug, { name: cf.fish.name, count: 1 });
          }
      const catchableFishList = [...fishMap.values()].sort(
        (a, b) => b.count - a.count,
      );

      return buildPrefMethodDescription({
        prefName,
        methodName: method.name,
        spotCount: matchingSpots.length,
        topSpotNames: [...matchingSpots]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 2)
          .map((s) => s.name),
        topFishNames: catchableFishList.slice(0, 3).map((f) => f.name),
      });
    })
    .filter((d): d is string => d !== null);

  it(`全件 ${DESCRIPTION_MIN}..${DESCRIPTION_MAX} 字`, () => {
    expect(descriptions.length).toBeGreaterThan(0);
    expectAllInRange(descriptions);
  });

  it("完全一致の重複ゼロ", () => {
    expectUnique(descriptions);
  });
});
