import { describe, it, expect } from "vitest";
import { monthLastModified, INDEX_POLICY_DATE } from "../sitemap-dates";

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

describe("monthLastModified", () => {
  it("INDEX_POLICY_DATE は 2026-06-23 (robots方針転換日 #157/#179)", () => {
    expect(INDEX_POLICY_DATE.toISOString()).toBe("2026-06-23T00:00:00.000Z");
  });

  it("buildDate=2026-07-05: 過去月(1〜6月)は POLICY_DATE にクランプされる", () => {
    const build = utc(2026, 7, 5);
    for (let m = 1; m <= 6; m++) {
      expect(monthLastModified(m, build).toISOString()).toBe(
        "2026-06-23T00:00:00.000Z",
      );
    }
  });

  it("buildDate=2026-07-05: 当月(7月)は 2026-07-01（POLICY_DATE より新しいのでそのまま）", () => {
    expect(monthLastModified(7, utc(2026, 7, 5)).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
  });

  it("buildDate=2026-07-05: 未来月(8〜12月)は前年の月1日→POLICY_DATE にクランプ（未来日付を出さない）", () => {
    const build = utc(2026, 7, 5);
    for (let m = 8; m <= 12; m++) {
      expect(monthLastModified(m, build).toISOString()).toBe(
        "2026-06-23T00:00:00.000Z",
      );
    }
  });

  it("buildDate=2026-09-01: 8月が到来したら 2026-08-01 に更新される（年1回だけ動く）", () => {
    expect(monthLastModified(8, utc(2026, 9, 1)).toISOString()).toBe(
      "2026-08-01T00:00:00.000Z",
    );
  });

  it("恒久ガード: 全12ヶ月×複数buildDateで未来日付を絶対に返さない", () => {
    const builds = [
      utc(2026, 6, 23),
      utc(2026, 7, 5),
      utc(2026, 12, 31),
      utc(2027, 1, 1),
      utc(2027, 8, 15),
      utc(2030, 3, 1),
    ];
    for (const build of builds) {
      for (let m = 1; m <= 12; m++) {
        const result = monthLastModified(m, build);
        expect(
          result.getTime() <= build.getTime() ||
            result.getTime() === INDEX_POLICY_DATE.getTime(),
        ).toBe(true);
      }
    }
  });

  it("決定性: 同じ入力なら同じ出力（ビルド間で安定）", () => {
    const build = utc(2026, 7, 5);
    for (let m = 1; m <= 12; m++) {
      expect(monthLastModified(m, build).getTime()).toBe(
        monthLastModified(m, build).getTime(),
      );
    }
  });

  it("月1日そのものがbuildDateの場合は当年扱い（境界）", () => {
    expect(monthLastModified(7, utc(2026, 7, 1)).toISOString()).toBe(
      "2026-07-01T00:00:00.000Z",
    );
  });
});
