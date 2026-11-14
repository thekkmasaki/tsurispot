import { describe, expect, it } from "vitest";
import {
  SPOT_LAYOUT_A_PATH_REGEX,
  SPOT_LAYOUT_B_PATH_REGEX,
  isSpotLayoutB,
} from "@/lib/spot-layout-ab";
import { fishingSpots } from "@/lib/data/spots";

describe("spot-layout-ab", () => {
  it("slug の文字数が偶数なら B（新レイアウト）", () => {
    expect(isSpotLayoutB("otaru-port")).toBe(true); // 10文字
    expect(isSpotLayoutB("ishikari-shinko")).toBe(false); // 15文字
  });

  it("GA4 用の pagePath 正規表現が振り分けと一致する（集計がずれないこと）", () => {
    const b = new RegExp(SPOT_LAYOUT_B_PATH_REGEX);
    const a = new RegExp(SPOT_LAYOUT_A_PATH_REGEX);
    for (const spot of fishingSpots) {
      const path = `/spots/${spot.slug}`;
      expect(b.test(path)).toBe(isSpotLayoutB(spot.slug));
      expect(a.test(path)).toBe(!isSpotLayoutB(spot.slug));
    }
  });

  it("両群がおおむね半々に分かれる", () => {
    const nB = fishingSpots.filter((s) => isSpotLayoutB(s.slug)).length;
    const ratio = nB / fishingSpots.length;
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });
});
