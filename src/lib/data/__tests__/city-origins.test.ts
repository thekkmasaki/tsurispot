import { describe, it, expect } from "vitest";
import {
  CITY_ORIGINS,
  CITY_LIST_LIMIT,
  MAX_OVERLAP,
  MIN_SPOTS_FOR_CITY,
  NEAR_RADIUS_WIDE_KM,
  OVERLAP_TOP_N,
  formatKm,
  getCityNearbySpots,
  getIndexableCities,
  getSpotsNear,
} from "../city-origins";
import { isSitemapEligible } from "@/lib/seo-quality";

describe("都市から近い釣り場（city-origins）", () => {
  it("slug・都市名に重複が無く、座標が日本の範囲内", () => {
    expect(new Set(CITY_ORIGINS.map((c) => c.slug)).size).toBe(CITY_ORIGINS.length);
    expect(new Set(CITY_ORIGINS.map((c) => c.name)).size).toBe(CITY_ORIGINS.length);
    for (const c of CITY_ORIGINS) {
      expect(c.slug).toMatch(/^[a-z-]+$/);
      expect(c.lat, c.name).toBeGreaterThan(24);
      expect(c.lat, c.name).toBeLessThan(46);
      expect(c.lng, c.name).toBeGreaterThan(122);
      expect(c.lng, c.name).toBeLessThan(146);
    }
  });

  it("ページを作る都市は、60km圏に掲載品質のスポットが下限以上ある", () => {
    const cities = getIndexableCities();
    expect(cities.length).toBeGreaterThan(0);
    for (const c of cities) {
      expect(getSpotsNear(c.lat, c.lng, NEAR_RADIUS_WIDE_KM).length, c.name).toBeGreaterThanOrEqual(MIN_SPOTS_FOR_CITY);
    }
  });

  it("どの2都市も、近い順上位の顔ぶれの重なりが上限未満（似たページの量産を防ぐ）", () => {
    const tops = getIndexableCities().map((c) => ({
      name: c.name,
      set: new Set(getSpotsNear(c.lat, c.lng, NEAR_RADIUS_WIDE_KM).slice(0, OVERLAP_TOP_N).map((s) => s.slug)),
    }));
    for (let i = 0; i < tops.length; i++) {
      for (let j = i + 1; j < tops.length; j++) {
        const a = tops[i].set;
        const b = tops[j].set;
        const inter = [...a].filter((x) => b.has(x)).length;
        const jaccard = inter / (a.size + b.size - inter);
        expect(jaccard, `${tops[i].name} と ${tops[j].name}`).toBeLessThan(MAX_OVERLAP);
      }
    }
  });

  it("一覧は近い順・半径以内で、掲載品質を満たし釣り禁止情報の無いスポットだけ", () => {
    for (const c of getIndexableCities()) {
      const { radiusKm, spots } = getCityNearbySpots(c);
      expect(spots.length, c.name).toBeGreaterThanOrEqual(Math.min(CITY_LIST_LIMIT, MIN_SPOTS_FOR_CITY));
      for (let i = 0; i < spots.length; i++) {
        const s = spots[i];
        expect(s.distanceKm).toBeLessThanOrEqual(radiusKm);
        expect(isSitemapEligible(s), s.slug).toBe(true);
        expect(s.fishingBan, s.slug).toBeFalsy();
        if (i > 0) expect(s.distanceKm).toBeGreaterThanOrEqual(spots[i - 1].distanceKm);
      }
    }
  });

  it("距離の表示", () => {
    expect(formatKm(4.66)).toBe("約4.7km");
    expect(formatKm(0.3)).toBe("約0.3km");
    expect(formatKm(23.4)).toBe("約23km");
  });
});
