import { describe, it, expect } from "vitest";
import { getSpotCategory, getSpotCategoryDetail } from "@/lib/spot-category";

describe("getSpotCategory", () => {
  it("海の種別は「海」", () => {
    for (const t of ["port", "beach", "rocky", "pier", "breakwater", "surf"] as const) {
      expect(getSpotCategory({ spotType: t })).toBe("sea");
    }
  });
  it("川・湖池", () => {
    expect(getSpotCategory({ spotType: "river" })).toBe("river");
    expect(getSpotCategory({ spotType: "lake" })).toBe("lake");
  });
  it("管理釣り場は種別に関係なく施設の種類で決まる", () => {
    expect(getSpotCategory({ spotType: "pond", isManagedPond: true })).toBe("managed");
    expect(getSpotCategory({ spotType: "river", isManagedPond: true })).toBe("managed");
    expect(getSpotCategory({ spotType: "pond", isManagedPond: true, facilityKind: "tsuribori" })).toBe("tsuribori");
    expect(getSpotCategory({ spotType: "pier", isManagedPond: true, facilityKind: "kaijo" })).toBe("tsuribori");
  });
  it("補足ラベル", () => {
    expect(getSpotCategoryDetail({ spotType: "pier", isManagedPond: true, facilityKind: "kaijo" })).toBe("海上釣り堀");
    expect(getSpotCategoryDetail({ spotType: "river", isManagedPond: true })).toBe("渓流");
    expect(getSpotCategoryDetail({ spotType: "pond", isManagedPond: true })).toBeNull();
    expect(getSpotCategoryDetail({ spotType: "port" })).toBeNull();
  });
});
