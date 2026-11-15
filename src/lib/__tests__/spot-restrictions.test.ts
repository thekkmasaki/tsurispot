import { describe, expect, it } from "vitest";
import { formatMonthRanges, getSpotRestrictionSummary, isMonthInRange } from "@/lib/spot-restrictions";

describe("formatMonthRanges", () => {
  it("連続月を範囲にまとめる", () => {
    expect(formatMonthRanges([3, 4, 5, 9, 10, 11])).toBe("3〜5月・9〜11月");
  });
  it("年またぎを1範囲にする", () => {
    expect(formatMonthRanges([11, 12, 1, 2])).toBe("11〜2月");
  });
  it("単月と通年", () => {
    expect(formatMonthRanges([7])).toBe("7月");
    expect(formatMonthRanges([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe("通年");
    expect(formatMonthRanges([])).toBe("");
  });
});

describe("isMonthInRange", () => {
  it("年またぎに対応", () => {
    expect(isMonthInRange(1, 11, 3)).toBe(true);
    expect(isMonthInRange(6, 11, 3)).toBe(false);
    expect(isMonthInRange(6, 4, 8)).toBe(true);
  });
});

describe("getSpotRestrictionSummary", () => {
  const baseRules = { castingAllowed: true, lureAllowed: true, chumAllowed: true, fishingLicenseRequired: false };

  it("データが無ければ null（推測で禁止を足さない）", () => {
    expect(getSpotRestrictionSummary({})).toBeNull();
    expect(getSpotRestrictionSummary({ rules: baseRules })).toBeNull();
  });

  it("fishingBan を最優先し、出典と確認日を持つ", () => {
    const s = getSpotRestrictionSummary({
      fishingBan: { scope: "full", reason: "立入禁止", sourceUrls: ["https://www.pref.example.lg.jp/a"], confirmedAt: "2026-08-17" },
      rules: { ...baseRules, castingAllowed: false },
    });
    expect(s?.level).toBe("ban-full");
    expect(s?.sourceUrls).toHaveLength(1);
    expect(s?.confirmedAt).toBe("2026-08-17");
  });

  it("禁止釣法を列挙する", () => {
    const s = getSpotRestrictionSummary({ rules: { ...baseRules, castingAllowed: false, chumAllowed: false, nightFishing: false } });
    expect(s?.level).toBe("method");
    expect(s?.label).toBe("投げ釣り・コマセ（撒き餌）・夜釣りは禁止");
  });
});
