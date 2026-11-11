import { describe, expect, it } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { getShakurhythmSpotContext } from "@/lib/shakurhythm";

describe("getShakurhythmSpotContext", () => {
  it("アオリイカが釣れるスポットだけに出る（1,000件超）", () => {
    const withCtx = fishingSpots.filter((s) => getShakurhythmSpotContext(s, 10));
    expect(withCtx.length).toBeGreaterThan(1000);
    expect(withCtx.every((s) => s.catchableFish.some((cf) => cf.fish.slug === "aoriika"))).toBe(true);
  });

  it("夜釣り禁止のスポットでは夜を勧めない", () => {
    const banned = fishingSpots.find(
      (s) => s.rules?.nightFishing === false && getShakurhythmSpotContext(s, 10)
    );
    if (banned) expect(getShakurhythmSpotContext(banned, 10)?.night).toBe("banned");
  });

  it("時期外は highSeason にならない", () => {
    const spot = fishingSpots.find((s) => getShakurhythmSpotContext(s, 10))!;
    expect(getShakurhythmSpotContext(spot, 2)?.highSeason).toBe(false);
  });
});
