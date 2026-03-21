import { describe, it, expect } from "vitest";
import { tackleShops, getShopBySlug } from "../shops";
import { fishingSpots } from "../spots";

describe("tackle shops data", () => {
  it("tackleShops配列が空でない", () => {
    expect(tackleShops.length).toBeGreaterThan(0);
  });

  it("slugの一意性", () => {
    const slugs = tackleShops.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("idの一意性", () => {
    const ids = tackleShops.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("必須フィールド存在", () => {
    tackleShops.forEach((s) => {
      expect(s.name).toBeTruthy();
      expect(s.slug).toBeTruthy();
      expect(s.address).toBeTruthy();
      expect(s.phone).toBeDefined();
      expect(s.businessHours).toBeTruthy();
      expect(s.region).toBeDefined();
      expect(s.region.prefecture).toBeTruthy();
    });
  });

  it("regionのprefectureが47都道府県に含まれる", () => {
    const prefectures = [
      "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
      "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
      "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
      "岐阜県", "静岡県", "愛知県", "三重県",
      "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
      "鳥取県", "島根県", "岡山県", "広島県", "山口県",
      "徳島県", "香川県", "愛媛県", "高知県",
      "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
    ];
    tackleShops.forEach((s) => {
      expect(prefectures).toContain(s.region.prefecture);
    });
  });

  it("nearbySpotSlugsの各slugが実際のスポットに存在する", () => {
    const spotSlugs = new Set(fishingSpots.map((s) => s.slug));
    tackleShops.forEach((shop) => {
      shop.nearbySpotSlugs.forEach((slug) => {
        expect(spotSlugs.has(slug)).toBe(true);
      });
    });
  });

  it("ratingが0-5範囲", () => {
    tackleShops.forEach((s) => {
      expect(s.rating).toBeGreaterThanOrEqual(0);
      expect(s.rating).toBeLessThanOrEqual(5);
    });
  });

  it("座標が日本国内（緯度20-50、経度120-155）", () => {
    tackleShops.forEach((s) => {
      expect(s.latitude).toBeGreaterThan(20);
      expect(s.latitude).toBeLessThan(50);
      expect(s.longitude).toBeGreaterThan(120);
      expect(s.longitude).toBeLessThan(155);
    });
  });

  it("planLevelが有効値かundefined", () => {
    tackleShops.forEach((s) => {
      if (s.planLevel !== undefined) {
        expect(["free", "basic", "pro"]).toContain(s.planLevel);
      }
    });
  });

  it("getShopBySlugが正しく動作する", () => {
    const firstShop = tackleShops[0];
    const found = getShopBySlug(firstShop.slug);
    expect(found).toBeDefined();
    expect(found?.name).toBe(firstShop.name);
  });

  it("存在しないスラッグでundefinedを返す", () => {
    expect(getShopBySlug("nonexistent-shop-xxx")).toBeUndefined();
  });
});
