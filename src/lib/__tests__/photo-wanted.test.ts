import { describe, expect, it } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { getWantedSpots, isPhotoWanted, countWantedByPrefecture } from "@/lib/photo-wanted";

describe("photo-wanted", () => {
  const wanted = getWantedSpots(fishingSpots);
  it("写真のないスポットだけを人気順で返す", () => {
    expect(wanted.length).toBeGreaterThan(0);
    expect(wanted.length).toBeLessThan(fishingSpots.length);
    for (let i = 1; i < Math.min(wanted.length, 50); i++) expect(wanted[i - 1].pop).toBeGreaterThanOrEqual(wanted[i].pop);
  });
  it("一覧のスポットはすべて isPhotoWanted", () => {
    const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));
    expect(wanted.slice(0, 200).every((w) => isPhotoWanted(bySlug.get(w.slug)!))).toBe(true);
  });
  it("県別の合計が全体と一致", () => {
    const sum = [...countWantedByPrefecture(wanted).values()].reduce((a, b) => a + b, 0);
    expect(sum).toBe(wanted.length);
  });
});
