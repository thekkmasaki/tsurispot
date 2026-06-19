import { describe, it, expect } from "vitest";
import { getHighValuePrefMonthFishCombos } from "@/lib/data";
import { fishMetadata } from "@/lib/data/fish-metadata";

/**
 * マトリクス（県×月×魚種）の厳選 index 化が「薄い noindex の尾」を作らないことを保証する。
 * 高価値組合せだけが index / 事前生成(SSG) / sitemap 掲載され、その集合は
 * 人気魚種 × スポット数多 × 旬 を満たし、かつ数百規模に圧縮されていること。
 */
describe("マトリクス厳選index化（高価値組合せ）", () => {
  const combos = getHighValuePrefMonthFishCombos();

  it("数百規模に収まる（薄いページの大量indexに戻らない）", () => {
    console.log(`[matrix high-value] index対象 = ${combos.length} 件`);
    // 旧挙動（count>=2 全件 ≒ 数千）への退行を検出。県数 × perPrefLimit の数百規模を担保。
    expect(combos.length).toBeGreaterThan(100);
    expect(combos.length).toBeLessThan(1500);
  });

  it("全組合せがスポット数・人気魚種の基準を満たす（index対象の品質保証）", () => {
    for (const c of combos) {
      expect(c.count).toBeGreaterThanOrEqual(5);
      const rank = fishMetadata[c.fishSlug]?.popularity;
      expect(rank, `fish ${c.fishSlug} の popularity 未定義`).toBeDefined();
      expect(rank!).toBeLessThanOrEqual(30);
    }
  });

  it("組合せに重複がない（同一URLの二重生成を防ぐ）", () => {
    const keys = combos.map((c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("同じ県×魚種が多数の月で乱立しない（旬の月に集約されている）", () => {
    const perPrefFish = new Map<string, number>();
    for (const c of combos) {
      const key = `${c.prefSlug}/${c.fishSlug}`;
      perPrefFish.set(key, (perPrefFish.get(key) || 0) + 1);
    }
    const maxMonths = Math.max(...perPrefFish.values());
    // 12ヶ月分が並ぶ旧挙動の検出（既定 perFishMonthLimit=3、余裕を見て 4 まで許容）
    expect(maxMonths).toBeLessThanOrEqual(4);
  });

  it("決定的（呼び出しごとに件数が変わらない）", () => {
    expect(getHighValuePrefMonthFishCombos().length).toBe(combos.length);
  });
});
