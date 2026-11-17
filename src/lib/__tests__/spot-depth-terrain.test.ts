import { describe, expect, it } from "vitest";
import depthData from "@/lib/data/spot-depth-contour.json";
import { fishingSpots } from "@/lib/data/spots";
import { classifyDepthTerrain, getSpotDepthTerrain } from "@/lib/spot-depth-terrain";

describe("classifyDepthTerrain", () => {
  it("20mラインが300m以内なら「岸近くから深い」でイカ・根魚のヒントを付ける", () => {
    const t = classifyDepthTerrain(300);
    expect(t.kind).toBe("steep");
    expect(t.hint).toContain("イカ");
    expect(t.detail).toBe("沖合約300mで水深20m");
  });

  it("100m未満は細かい数字を出さず「100m以内」にする", () => {
    expect(classifyDepthTerrain(40).detail).toBe("沖合100m以内で水深20m");
  });

  it("300m超〜1km以内は「やや深場が近い」でヒントなし", () => {
    const t = classifyDepthTerrain(720);
    expect(t.kind).toBe("moderate");
    expect(t.hint).toBeUndefined();
    expect(t.detail).toBe("沖合約700mで水深20m");
  });

  it("1km超・線が見つからない場合は「浅め」", () => {
    expect(classifyDepthTerrain(1010).kind).toBe("shallow");
    expect(classifyDepthTerrain(null).kind).toBe("shallow");
  });
});

describe("spot-depth-contour.json", () => {
  const entries = Object.entries(depthData.spots as Record<string, number | null>);
  const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));

  it("海のスポット以外（川・池・湖）は含まない", () => {
    const nonMarine = entries.filter(([slug]) => {
      const s = bySlug.get(slug);
      return s && ["river", "pond", "lake"].includes(s.spotType);
    });
    expect(nonMarine).toEqual([]);
  });

  it("距離は0以上の数値か null", () => {
    for (const [, d] of entries) expect(d === null || (typeof d === "number" && d >= 0)).toBe(true);
  });

  it("データに無いスポットは null（行を出さない）", () => {
    expect(getSpotDepthTerrain("__no_such_spot__")).toBeNull();
  });
});
