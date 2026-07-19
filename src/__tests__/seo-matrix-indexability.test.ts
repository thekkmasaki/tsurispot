import { describe, it, expect } from "vitest";
import {
  getHighValuePrefMonthFishCombos,
  getEligiblePrefMonthFishCombos,
  getEligiblePrefFishCombos,
  getSpotsByPrefectureAndFish,
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
    // matrix ページ本体のレンダ判定（getMatchingSpots(...).length >= MIN_SPOTS =
    // **ユニークスポット数**）と同一ロジックで期待集合を再導出し、ヘルパのドリフトを検出。
    // 旧実装は catchableFish 出現数で数えており、「sitemap 掲載なのにページは 301」の
    // 組合せ（GSC「送信された URL にリダイレクトがあります」）を構造的に生んでいた。
    const expected = new Set<string>();
    for (const pref of prefectures) {
      const prefSpots = fishingSpots.filter(
        (s) => s.region.prefecture === pref.name
      );
      for (const month of MONTHS) {
        const fishMap = new Map<string, number>();
        for (const spot of prefSpots) {
          const seen = new Set<string>();
          for (const cf of spot.catchableFish) {
            if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
              seen.add(cf.fish.slug);
            }
          }
          for (const fSlug of seen) {
            fishMap.set(fSlug, (fishMap.get(fSlug) || 0) + 1);
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

  it("全組合せがレンダ判定（ユニークスポット数>=MIN_SPOTS）を満たす＝sitemap掲載URLが301されない", () => {
    // matrix ページ本体は matchingSpots.length（ユニークスポット数）< MIN_SPOTS で
    // permanentRedirect する。eligible の count がユニークスポット数であることを
    // 実データで直接検証し、「sitemap 掲載 ∧ 301」の再発を防ぐ。
    for (const c of eligible) {
      const pref = prefectures.find((p) => p.slug === c.prefSlug)!;
      const month = MONTHS.find((m) => m.slug === c.monthSlug)!;
      const uniqueSpots = fishingSpots.filter(
        (s) =>
          s.region.prefecture === pref.name &&
          s.catchableFish.some(
            (cf) =>
              cf.fish.slug === c.fishSlug &&
              isMonthInRange(month.num, cf.monthStart, cf.monthEnd)
          )
      ).length;
      expect(
        uniqueSpots,
        `${c.prefSlug}/${c.monthSlug}/${c.fishSlug} はユニークスポット${uniqueSpots}件で301対象なのにsitemap掲載`
      ).toBeGreaterThanOrEqual(MIN_SPOTS);
      expect(c.count).toBe(uniqueSpots);
    }
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

describe("県×魚種: sitemap 掲載としきい値 noindex の整合", () => {
  // prefecture/[slug]/fish/[fishSlug] の generateMetadata は
  // `index: getSpotsByPrefectureAndFish(...).length >= 3`（ユニークスポット数）。
  // sitemap 掲載ゲート getEligiblePrefFishCombos(3) が同じ基準であることを検証し、
  // 「sitemap 掲載なのに noindex」（GSC「送信された URL に noindex タグが追加されています」）
  // の再発を防ぐ。
  it("sitemap掲載の県×魚種は全てページ側で index される（ユニークスポット>=3）", () => {
    for (const c of getEligiblePrefFishCombos(3)) {
      const pref = prefectures.find((p) => p.slug === c.prefSlug)!;
      const uniqueSpots = getSpotsByPrefectureAndFish(pref.name, c.fishSlug).length;
      expect(
        uniqueSpots,
        `${c.prefSlug}/fish/${c.fishSlug} はユニークスポット${uniqueSpots}件でnoindexなのにsitemap掲載`
      ).toBeGreaterThanOrEqual(3);
      expect(c.count).toBe(uniqueSpots);
    }
  });
});
