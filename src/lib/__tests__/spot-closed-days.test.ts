import { describe, it, expect } from "vitest";
import { parseClosedWeekdays, isSpotClosedOn } from "../spot-closed-days";
import { getSpotBySlug } from "../data/spots";

describe("parseClosedWeekdays", () => {
  it("単純な曜日指定を読む", () => {
    expect(parseClosedWeekdays("毎週木曜日（祝日は開園）、1月1日")).toEqual([4]);
    expect(parseClosedWeekdays("毎週火・水曜日")).toEqual([2, 3]);
    expect(parseClosedWeekdays("毎週月曜")).toEqual([1]);
  });
  it("読めない表記は null（休みと決めつけない）", () => {
    for (const t of ["不定休", "年中無休", "なし", "第2火曜日", "冬季休業", "", undefined]) {
      expect(parseClosedWeekdays(t), String(t)).toBeNull();
    }
  });
});

describe("isSpotClosedOn", () => {
  const spot = { managementInfo: { closedDays: "毎週木曜日（祝日は開園）、1月1日" } };
  it("木曜は休園、他の曜日は開園", () => {
    expect(isSpotClosedOn(spot, "2026-11-19")).toBe(true); // 木
    expect(isSpotClosedOn(spot, "2026-11-20")).toBe(false); // 金
    expect(isSpotClosedOn(spot, "2026-11-22")).toBe(false); // 日
  });
  it("定休日情報が無いスポットは常に false", () => {
    expect(isSpotClosedOn({}, "2026-11-19")).toBe(false);
  });
  it("平磯海づり公園は木曜（2026-11-19）が休園日", () => {
    const hiraiso = getSpotBySlug("hiraiso-fishing-park");
    expect(hiraiso).toBeTruthy();
    expect(isSpotClosedOn(hiraiso!, "2026-11-19")).toBe(true);
    expect(isSpotClosedOn(hiraiso!, "2026-11-21")).toBe(false);
  });
});
