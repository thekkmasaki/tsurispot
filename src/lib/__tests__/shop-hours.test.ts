import { describe, expect, it } from "vitest";
import { getShopHoursTraits, shopHoursLabels } from "@/lib/shop-hours";
import { tackleShops } from "@/lib/data/shops";

describe("getShopHoursTraits", () => {
  it("24時間営業の単独表記だけを24時間とみなす", () => {
    expect(getShopHoursTraits("24時間営業").is24h).toBe(true);
    expect(getShopHoursTraits("平日3:00〜23:00 / 金・土・祝前日 24時間営業").is24h).toBe(false);
  });

  it("5時台以前の開店を早朝とみなす", () => {
    expect(getShopHoursTraits("5:00〜22:00（季節により変動あり）").early).toBe(true);
    expect(getShopHoursTraits("平日 10:00〜21:00 / 土日祝 4:00〜20:00").early).toBe(true);
    expect(getShopHoursTraits("6:00〜21:00").early).toBe(false);
    expect(getShopHoursTraits("10:00〜20:00").early).toBe(false);
  });

  it("22時以降の閉店・日またぎを深夜とみなす", () => {
    expect(getShopHoursTraits("10:00〜22:00").lateNight).toBe(true);
    expect(getShopHoursTraits("18:00〜翌2:00").lateNight).toBe(true);
    expect(getShopHoursTraits("10:00〜21:00").lateNight).toBe(false);
  });

  it("時刻が読めない表記はどれにも該当させない", () => {
    const t = getShopHoursTraits("お問い合わせください");
    expect(t).toEqual({ is24h: false, early: false, lateNight: false, earliestOpenMinutes: null });
    expect(shopHoursLabels("営業時間は店舗にお問い合わせください")).toEqual([]);
  });

  it("全店舗データで例外を出さず、24時間店は早朝・深夜ラベルを重ねない", () => {
    for (const s of tackleShops) {
      const labels = shopHoursLabels(s.businessHours);
      if (labels.includes("24時間営業")) expect(labels).toHaveLength(1);
    }
  });
});
