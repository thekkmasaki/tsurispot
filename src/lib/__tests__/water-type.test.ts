import { describe, expect, it } from "vitest";
import { countByWaterType, pickForWaterFilter, waterTypeOf } from "../water-type";

describe("water-type", () => {
  it("spotType を 海／川／湖・池 にまとめる", () => {
    expect(waterTypeOf("port")).toBe("sea");
    expect(waterTypeOf("surf")).toBe("sea");
    expect(waterTypeOf("river")).toBe("river");
    expect(waterTypeOf("lake")).toBe("lake");
    expect(waterTypeOf("pond")).toBe("lake");
  });

  it("全体の上位に入らない川の釣り場も種類ごとの上位として含める", () => {
    const spots = [
      { id: "a", spotType: "port" as const },
      { id: "b", spotType: "port" as const },
      { id: "c", spotType: "river" as const },
      { id: "d", spotType: "river" as const },
      { id: "e", spotType: "port" as const },
    ];
    const picked = pickForWaterFilter(spots, 2);
    expect(picked.map((p) => p.spot.id)).toEqual(["a", "b", "c", "d"]);
    expect(picked.filter((p) => p.inAll).map((p) => p.spot.id)).toEqual(["a", "b"]);
    expect(countByWaterType(spots)).toEqual({ sea: 3, river: 2, lake: 0 });
  });
});
