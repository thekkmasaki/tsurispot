import { describe, it, expect } from "vitest";
import { getShopBySlug, tackleShops } from "../data/shops";

describe("shop-plan", () => {
  it("サンプル店舗が3種類存在する", () => {
    const free = getShopBySlug("sample-free");
    const basic = getShopBySlug("sample-basic");
    const premium = getShopBySlug("sample-premium");
    expect(free).toBeDefined();
    expect(basic).toBeDefined();
    expect(premium).toBeDefined();
  });

  it("無料プランの店舗: isPremium=false, planLevel=free", () => {
    const shop = getShopBySlug("sample-free");
    expect(shop?.isPremium).toBe(false);
    expect(shop?.planLevel).toBe("free");
  });

  it("ベーシックプランの店舗: planLevel=basic", () => {
    const shop = getShopBySlug("sample-basic");
    expect(shop?.planLevel).toBe("basic");
  });

  it("プロプランの店舗: isPremium=true, planLevel=pro", () => {
    const shop = getShopBySlug("sample-premium");
    expect(shop?.isPremium).toBe(true);
    expect(shop?.planLevel).toBe("pro");
  });

  it("プロプランの店舗にはクーポンがある", () => {
    const shop = getShopBySlug("sample-premium");
    expect(shop?.coupon).toBeDefined();
    if (shop?.coupon) {
      expect(shop.coupon.title).toBeTruthy();
      expect(shop.coupon.description).toBeTruthy();
    }
  });

  it("プロプランの店舗にはownerMessageがある", () => {
    const shop = getShopBySlug("sample-premium");
    expect(shop?.ownerMessage).toBeTruthy();
  });

  it("サンプル店舗と通常店舗の分離", () => {
    const sampleSlugs = ["sample-free", "sample-basic", "sample-premium"];
    const samples = tackleShops.filter((s) => sampleSlugs.includes(s.slug));
    const nonSamples = tackleShops.filter((s) => !sampleSlugs.includes(s.slug));
    expect(samples.length).toBe(3);
    expect(nonSamples.length).toBeGreaterThan(0);
    // 通常店舗はisPremium=falseのはず
    nonSamples.forEach((s) => {
      expect(s.isPremium).toBe(false);
    });
  });

  it("全店舗のplanLevelが有効値かundefined", () => {
    tackleShops.forEach((s) => {
      if (s.planLevel !== undefined) {
        expect(["free", "basic", "pro"]).toContain(s.planLevel);
      }
    });
  });
});
