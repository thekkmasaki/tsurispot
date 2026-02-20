import { describe, it, expect } from "vitest";
import { getFishSpeciesWithSpots } from "../index";
import { fishingSpots } from "../spots";
import { fishSpecies } from "../fish";

describe("data integration", () => {
  it("getFishSpeciesWithSpots should return all fish with spots", () => {
    const fishWithSpots = getFishSpeciesWithSpots();
    expect(fishWithSpots.length).toBe(fishSpecies.length);
  });

  it("catchableFish references should be valid FishSpecies", () => {
    fishingSpots.forEach((spot) => {
      spot.catchableFish.forEach((cf) => {
        expect(cf.fish).toBeDefined();
        expect(cf.fish.name).toBeTruthy();
        expect(cf.fish.slug).toBeTruthy();
      });
    });
  });

  it("all fish referenced in spots should exist in fishSpecies", () => {
    const fishSlugs = new Set(fishSpecies.map((f) => f.slug));
    fishingSpots.forEach((spot) => {
      spot.catchableFish.forEach((cf) => {
        expect(fishSlugs.has(cf.fish.slug)).toBe(true);
      });
    });
  });

  it("catchableFish month ranges should be valid", () => {
    fishingSpots.forEach((spot) => {
      spot.catchableFish.forEach((cf) => {
        expect(cf.monthStart).toBeGreaterThanOrEqual(1);
        expect(cf.monthStart).toBeLessThanOrEqual(12);
        expect(cf.monthEnd).toBeGreaterThanOrEqual(1);
        expect(cf.monthEnd).toBeLessThanOrEqual(12);
      });
    });
  });

  it("all spot regions should have valid prefecture", () => {
    const validPrefectures = [
      "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
      "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
      "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
      "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
      "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
      "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
      "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
    ];
    fishingSpots.forEach((spot) => {
      expect(validPrefectures).toContain(spot.region.prefecture);
    });
  });
});
