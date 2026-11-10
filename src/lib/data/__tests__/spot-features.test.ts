import { describe, expect, it } from "vitest";
import {
  MIN_SPOTS_PER_PREF,
  SPOT_FEATURES,
  getFeaturePrefCombos,
  getFeatureSpots,
  getFeaturesForPref,
} from "@/lib/data/spot-features";
import { getPrefectureBySlug } from "@/lib/data/prefectures";

describe("spot-features", () => {
  it("feature slug は一意", () => {
    const slugs = SPOT_FEATURES.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("各 feature に全国で十分なスポットがある（薄いページを作らない）", () => {
    for (const f of SPOT_FEATURES) {
      expect(getFeatureSpots(f).length, f.slug).toBeGreaterThanOrEqual(50);
    }
  });

  it("県ページの組み合わせはすべて実在県・基準件数以上・釣り禁止スポットを含まない", () => {
    const combos = getFeaturePrefCombos();
    expect(combos.length).toBeGreaterThan(100);
    for (const c of combos) {
      const pref = getPrefectureBySlug(c.prefecture);
      expect(pref, c.prefecture).toBeDefined();
      const f = SPOT_FEATURES.find((x) => x.slug === c.feature)!;
      const spots = getFeatureSpots(f, pref!.name);
      expect(spots.length).toBeGreaterThanOrEqual(MIN_SPOTS_PER_PREF);
      expect(spots.every((s) => !s.fishingBan && f.match(s))).toBe(true);
    }
  });

  it("getFeaturesForPref は県ページが存在する feature だけ返す", () => {
    const combos = new Set(getFeaturePrefCombos().map((c) => `${c.feature}/${c.prefecture}`));
    const hyogo = getPrefectureBySlug("hyogo")!;
    for (const { feature } of getFeaturesForPref(hyogo.name)) {
      expect(combos.has(`${feature.slug}/hyogo`)).toBe(true);
    }
  });
});
