import { describe, it, expect } from "vitest";
import { fishSpecies, getFishBySlug, getCatchableNow, getPeakFish } from "../fish";

describe("fish data", () => {
  it("should have 30 fish species", () => {
    expect(fishSpecies.length).toBe(30);
  });

  it("should have unique slugs", () => {
    const slugs = fishSpecies.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("should have unique ids", () => {
    const ids = fishSpecies.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getFishBySlug should return correct fish", () => {
    const aji = getFishBySlug("aji");
    expect(aji).toBeDefined();
    expect(aji?.name).toBe("アジ");
  });

  it("getFishBySlug should return undefined for non-existent slug", () => {
    expect(getFishBySlug("nonexistent")).toBeUndefined();
  });

  it("getCatchableNow should return fish for summer months", () => {
    const summerFish = getCatchableNow(7);
    expect(summerFish.length).toBeGreaterThan(0);
    summerFish.forEach((f) => {
      expect(f.seasonMonths).toContain(7);
    });
  });

  it("all fish should have valid season months (1-12)", () => {
    fishSpecies.forEach((f) => {
      f.seasonMonths.forEach((m) => {
        expect(m).toBeGreaterThanOrEqual(1);
        expect(m).toBeLessThanOrEqual(12);
      });
      f.peakMonths.forEach((m) => {
        expect(m).toBeGreaterThanOrEqual(1);
        expect(m).toBeLessThanOrEqual(12);
      });
    });
  });

  it("peak months should be subset of season months", () => {
    fishSpecies.forEach((f) => {
      f.peakMonths.forEach((pm) => {
        expect(f.seasonMonths).toContain(pm);
      });
    });
  });

  it("all fish should have required fields", () => {
    fishSpecies.forEach((f) => {
      expect(f.name).toBeTruthy();
      expect(f.slug).toBeTruthy();
      expect(f.description).toBeTruthy();
      expect(f.category).toMatch(/^(sea|freshwater|brackish)$/);
      expect(f.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
      expect(f.tasteRating).toBeGreaterThanOrEqual(1);
      expect(f.tasteRating).toBeLessThanOrEqual(5);
      expect(f.seasonMonths.length).toBeGreaterThan(0);
      expect(f.cookingTips.length).toBeGreaterThan(0);
    });
  });
});
