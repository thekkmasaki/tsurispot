import { describe, it, expect } from "vitest";
import {
  monthLastModified,
  INDEX_POLICY_DATE,
  CONTENT_REVISION_DATE,
} from "../sitemap-dates";

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

  it("CONTENT_REVISION_DATE は 2026-07-31 (6/23以降の実コンテンツ改訂の再クロール信号)", () => {
    expect(CONTENT_REVISION_DATE.toISOString()).toBe(
      "2026-07-31T00:00:00.000Z",
    );
  });

  it("buildDate=2026-08-10（改訂日到来後）: 過去月(1〜7月)は CONTENT_REVISION_DATE(7/31)にクランプ", () => {
    const build = utc(2026, 8, 10);
    for (let m = 1; m <= 7; m++) {
      expect(monthLastModified(m, build).toISOString()).toBe(
        "2026-07-31T00:00:00.000Z",
      );
    }
    // 当月(8月)は 2026-08-01（改訂日より新しいのでそのまま）
    expect(monthLastModified(8, build).toISOString()).toBe(
      "2026-08-01T00:00:00.000Z",
    );
    // 未来月(9〜12月)は前年→改訂日にクランプ（未来日付を出さない）
    for (let m = 9; m <= 12; m++) {
      expect(monthLastModified(m, build).toISOString()).toBe(
        "2026-07-31T00:00:00.000Z",
      );
    }
  });

  it("改訂日より前のbuildDateでは CONTENT_REVISION_DATE を floor にしない（未来lastmod禁止）", () => {
    // build=2026-07-05 は 7/31 未到来 → 従来どおり 6/23 クランプ（回帰防止）
    for (let m = 1; m <= 6; m++) {
      expect(monthLastModified(m, utc(2026, 7, 5)).toISOString()).toBe(
        "2026-06-23T00:00:00.000Z",
      );
    }
  });
});
