import { describe, it, expect } from "vitest";
import {
  getHighValuePrefMonthFishCombos,
  getEligiblePrefMonthFishCombos,
} from "@/lib/data";
import { fishMetadata } from "@/lib/data/fish-metadata";
import { prefectures } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";
import { MONTHS, isMonthInRange } from "@/lib/data/fishing-methods";

/**
 * マトリクス（県×月×魚種）の index 方針を保証する。
 *
 * 非対称な2セット:
 *  - 事前生成(SSG)セット = getHighValuePrefMonthFishCombos()（厳選）。SSG枚数=Dockerイメージ容量
 *    なので数百規模に抑える（コンテナ起動不能の再発防止）。
 *  - index/sitemap セット = getEligiblePrefMonthFishCombos()（count>=2 の配信される全ページ）。
 *    薄いページも積極 index してロングテール検索流入を最大化する。
 *  - 前者は後者の部分集合（事前生成したページは必ず index される）。
 */

// matrix ページ page.tsx の MIN_SPOTS と一致させること。
const MIN_SPOTS = 2;

describe("事前生成(SSG)セット = 高価値組合せ（容量ガード）", () => {
  const ssg = getHighValuePrefMonthFishCombos();

  it("数百規模に収まる（SSG枚数=イメージ容量の暴走を防ぐ）", () => {
    console.log(`[matrix SSG] 事前生成対象 = ${ssg.length} 件`);
    expect(ssg.length).toBeGreaterThan(100);
    expect(ssg.length).toBeLessThan(1500);
  });

  it("全組合せがスポット数・人気魚種の基準を満たす（事前生成の品質保証）", () => {
    for (const c of ssg) {
      expect(c.count).toBeGreaterThanOrEqual(5);
      const rank = fishMetadata[c.fishSlug]?.popularity;
      expect(rank, `fish ${c.fishSlug} の popularity 未定義`).toBeDefined();
      expect(rank!).toBeLessThanOrEqual(30);
    }
  });

  it("同じ県×魚種が多数の月で乱立しない（旬の月に集約）", () => {
    const perPrefFish = new Map<string, number>();
    for (const c of ssg) {
      const key = `${c.prefSlug}/${c.fishSlug}`;
      perPrefFish.set(key, (perPrefFish.get(key) || 0) + 1);
    }
    const maxMonths = Math.max(...perPrefFish.values());
    expect(maxMonths).toBeLessThanOrEqual(4);
  });

  it("決定的（呼び出しごとに件数が変わらない）", () => {
    expect(getHighValuePrefMonthFishCombos().length).toBe(ssg.length);
  });
});

describe("index/sitemap セット = 配信される全組合せ（薄いページも積極index）", () => {
  const eligible = getEligiblePrefMonthFishCombos();

  it("広いセットである（sitemap が高価値の数百件に誤接続していない）", () => {
    console.log(`[matrix index] index/sitemap対象 = ${eligible.length} 件`);
    // 厳選セット(<1500)ではなく、ロングテール全件(数千)であることを担保。
    expect(eligible.length).toBeGreaterThan(1500);
  });

  it("全組合せが count>=MIN_SPOTS（301される薄い組合せを含まない＝品質下限）", () => {
    for (const c of eligible) {
      expect(c.count).toBeGreaterThanOrEqual(MIN_SPOTS);
    }
  });

  it("組合せに重複がない（同一URLの二重生成・二重掲載を防ぐ）", () => {
    const keys = eligible.map(
      (c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("matrix ページが実際にレンダリングする集合と完全一致する（index=配信=sitemap）", () => {
    // page.tsx の buildValidCombos と同一ロジックで期待集合を再導出し、ヘルパのドリフトを検出。
    const expected = new Set<string>();
    for (const pref of prefectures) {
      const prefSpots = fishingSpots.filter(
        (s) => s.region.prefecture === pref.name
      );
      for (const month of MONTHS) {
        const fishMap = new Map<string, number>();
        for (const spot of prefSpots) {
          for (const cf of spot.catchableFish) {
            if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
              fishMap.set(cf.fish.slug, (fishMap.get(cf.fish.slug) || 0) + 1);
            }
          }
        }
        for (const [fSlug, count] of fishMap) {
          if (count >= MIN_SPOTS) {
            expected.add(`${pref.slug}/${month.slug}/${fSlug}`);
          }
        }
      }
    }
    const actual = new Set(
      eligible.map((c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`)
    );
    expect(actual.size).toBe(expected.size);
    for (const k of expected) expect(actual.has(k)).toBe(true);
  });

  it("事前生成(SSG)セットは index セットの部分集合（事前生成ページは必ずindexされる）", () => {
    const eligibleKeys = new Set(
      eligible.map((c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`)
    );
    for (const c of getHighValuePrefMonthFishCombos()) {
      const key = `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`;
      expect(
        eligibleKeys.has(key),
        `SSG組合せ ${key} が index セットに含まれない`
      ).toBe(true);
    }
  });

  it("決定的（呼び出しごとに件数が変わらない）", () => {
    expect(getEligiblePrefMonthFishCombos().length).toBe(eligible.length);
  });
});
