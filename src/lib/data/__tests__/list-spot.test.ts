import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { toListSpot } from "@/lib/data/list-spot";
import { isHiddenGem, getPremiumFishForSpot } from "@/lib/hidden-gem";

describe("toListSpot", () => {
  it("fishNames は catchableFish の魚名を first-seen 順で unique 化する", () => {
    const spot = fishingSpots.find((s) => s.catchableFish.length > 1)!;
    const list = toListSpot(spot);
    const expected = [...new Set(spot.catchableFish.map((cf) => cf.fish.name))];
    expect(list.fishNames).toEqual(expected);
  });

  it("methods は cf.method を unique 化する（空文字は除外）", () => {
    const spot = fishingSpots.find((s) => s.catchableFish.some((cf) => cf.method))!;
    const list = toListSpot(spot);
    const expected = [...new Set(spot.catchableFish.map((cf) => cf.method).filter(Boolean))];
    expect(list.methods).toEqual(expected);
  });

  it("isHiddenGem / hasPremiumFish はサーバー計算（hidden-gem）と完全一致する", () => {
    // 全件で突合（フィルタ・バッジ表示の正しさを担保する核心）
    for (const spot of fishingSpots) {
      const list = toListSpot(spot);
      expect(list.isHiddenGem).toBe(isHiddenGem(spot));
      expect(list.hasPremiumFish).toBe(getPremiumFishForSpot(spot).length > 0);
    }
  });

  it("カード/フィルタが使うスカラーフィールドを正しくコピーする", () => {
    const spot = fishingSpots[0];
    const list = toListSpot(spot);
    expect(list.id).toBe(spot.id);
    expect(list.slug).toBe(spot.slug);
    expect(list.name).toBe(spot.name);
    expect(list.address).toBe(spot.address);
    expect(list.region.prefecture).toBe(spot.region.prefecture);
    expect(list.region.areaName).toBe(spot.region.areaName);
    expect(list.latitude).toBe(spot.latitude);
    expect(list.longitude).toBe(spot.longitude);
    expect(list.spotType).toBe(spot.spotType);
    expect(list.difficulty).toBe(spot.difficulty);
    expect(list.isFree).toBe(spot.isFree);
    expect(list.hasParking).toBe(spot.hasParking);
    expect(list.hasToilet).toBe(spot.hasToilet);
    expect(list.hasConvenienceStore).toBe(spot.hasConvenienceStore);
    expect(list.hasFishingShop).toBe(spot.hasFishingShop);
    expect(list.hasRentalRod).toBe(spot.hasRentalRod);
    expect(list.mainImageUrl).toBe(spot.mainImageUrl);
    expect(list.rating).toBe(spot.rating);
  });

  it("ListSpot は重いフィールド（description/catchableFish等）を持たない（ペイロード削減の保証）", () => {
    const list = toListSpot(fishingSpots[0]) as unknown as Record<string, unknown>;
    expect(list.description).toBeUndefined();
    expect(list.catchableFish).toBeUndefined();
    expect(list.tackleRecommendations).toBeUndefined();
    expect(list.accessInfo).toBeUndefined();
    expect(list.images).toBeUndefined();
  });
});
