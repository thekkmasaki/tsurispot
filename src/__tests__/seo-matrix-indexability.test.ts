import { describe, it, expect } from "vitest";
import {
  getHighValuePrefMonthFishCombos,
  getEligiblePrefMonthFishCombos,
  highValuePrefMonthFishKeys,
} from "@/lib/data";
import { fishMetadata } from "@/lib/data/fish-metadata";
import { prefectures } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";
import { MONTHS, isMonthInRange } from "@/lib/data/fishing-methods";

/**
 * マトリクス（県×月×魚種）の index 方針を保証する（薄ページ剪定後 / Google May 2026 コアアップデート対策）。
 *
 *  - 配信(rendered)セット = getEligiblePrefMonthFishCombos()（count>=2 のレンダリング全ページ）。
 *    matrix ページは count<2 を 301、count>=2 を配信する。
 *  - 事前生成(SSG)セット = index/sitemap セット = getHighValuePrefMonthFishCombos()（高価値・厳選）。
 *    薄ページの大量indexによるサイト単位の品質希釈を避けるため、index/sitemap は高価値のみに絞る。
 *    残りの count>=2 配信ページは noindex,follow（クロール経路は維持）。
 *  - 高価値セット ⊆ 配信セット（index されるのは実在 count>=2 組合せのみ）。
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

describe("配信(rendered)セット = count>=2（301されない実在組合せ）", () => {
  const eligible = getEligiblePrefMonthFishCombos();

  it("count>=2 のレンダリング全ページを表す（配信は広い／ロングテール）", () => {
    console.log(`[matrix rendered] 配信(count>=2) = ${eligible.length} 件`);
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

  it("matrix ページが実際にレンダリングする集合と完全一致する（配信=count>=2）", () => {
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

  it("決定的（呼び出しごとに件数が変わらない）", () => {
    expect(getEligiblePrefMonthFishCombos().length).toBe(eligible.length);
  });
});

describe("index/sitemap セット = 高価値752（薄ページ剪定・コアアップデート対策）", () => {
  const highValue = getHighValuePrefMonthFishCombos();
  const eligibleKeys = new Set(
    getEligiblePrefMonthFishCombos().map(
      (c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`
    )
  );

  it("index/sitemap は高価値の数百件に絞る（薄ページの大量indexを避ける）", () => {
    console.log(`[matrix index] index/sitemap(高価値) = ${highValue.length} 件`);
    expect(highValue.length).toBeGreaterThan(100);
    expect(highValue.length).toBeLessThan(1500);
  });

  it("highValuePrefMonthFishKeys が高価値組合せと一致（robots.index ゲートの真実源）", () => {
    const keys = new Set(
      highValue.map((c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`)
    );
    expect(highValuePrefMonthFishKeys.size).toBe(keys.size);
    for (const k of keys) expect(highValuePrefMonthFishKeys.has(k)).toBe(true);
  });

  it("index対象(高価値)は配信集合(count>=2)の部分集合（indexは実在組合せのみ）", () => {
    for (const c of highValue) {
      const key = `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`;
      expect(eligibleKeys.has(key), `高価値 ${key} が配信集合にない`).toBe(true);
    }
  });
});
