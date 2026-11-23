import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { isQuietSpot, QUIET_MAX_REVIEWS, QUIET_MIN_RATING } from "@/lib/quiet-spot";
import { isHiddenGem } from "@/lib/hidden-gem";
import { isSitemapEligible } from "@/lib/seo-quality";
import { REGION_GROUPS } from "@/lib/data/regions-group";

describe("近くの穴場（quiet-spot）", () => {
  const quiet = fishingSpots.filter(isQuietSpot);

  it("穴場は掲載品質を満たし、釣り禁止情報が無い", () => {
    expect(quiet.length).toBeGreaterThan(0);
    for (const s of quiet) {
      expect(isSitemapEligible(s), s.slug).toBe(true);
      expect(s.fishingBan, s.slug).toBeFalsy();
    }
  });

  it("穴場×高級魚でないものは、口コミ件数のデータがあり上限以下・評価が下限以上（データの無いものは穴場にしない）", () => {
    for (const s of quiet) {
      if (isHiddenGem(s)) continue;
      expect(s.googleReviewCount, s.slug).not.toBeUndefined();
      expect(s.googleReviewCount!, s.slug).toBeLessThanOrEqual(QUIET_MAX_REVIEWS);
      expect(s.googleRating ?? s.rating, s.slug).toBeGreaterThanOrEqual(QUIET_MIN_RATING);
      expect(s.isManagedPond, s.slug).toBeFalsy();
    }
  });

  it("全国の大半の地域に穴場がある（「近くの穴場」が成り立つ）", () => {
    const regionsWithQuiet = REGION_GROUPS.filter((rg) =>
      quiet.some((s) => rg.prefectures.includes(s.region.prefecture)),
    );
    expect(regionsWithQuiet.length).toBeGreaterThanOrEqual(REGION_GROUPS.length - 1);
  });
});
