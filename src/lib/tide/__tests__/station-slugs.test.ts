/**
 * /tides/[station] の slug マップ整合性テスト。
 * 手書きマップ（station-slugs.ts）が観測地点マスタ（stations.ts、自動生成）と
 * 1:1 で対応し続けることを保証する（地点の増減・打ち間違いを検出）。
 */
import { describe, it, expect } from "vitest";
import { TIDE_STATIONS } from "@/lib/tide/stations";
import {
  CODE_BY_SLUG,
  STATION_SLUGS,
  TIDE_REGION_LABELS,
  TIDE_REGION_ORDER,
} from "@/lib/tide/station-slugs";

describe("station-slugs", () => {
  it("全観測地点に slug がある（過不足なし）", () => {
    const stationCodes = new Set(TIDE_STATIONS.map((s) => s.code));
    const slugCodes = new Set(Object.keys(STATION_SLUGS));
    const missing = [...stationCodes].filter((c) => !slugCodes.has(c));
    const extra = [...slugCodes].filter((c) => !stationCodes.has(c));
    expect(missing, `slug未定義の地点: ${missing.join(",")}`).toEqual([]);
    expect(extra, `マスタに無い地点code: ${extra.join(",")}`).toEqual([]);
    expect(Object.keys(STATION_SLUGS).length).toBe(239);
  });

  it("slug は一意・URL安全（小文字英数とハイフンのみ）", () => {
    const slugs = Object.values(STATION_SLUGS).map((e) => e.slug);
    expect(new Set(slugs).size, "slug重複あり").toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("逆引き CODE_BY_SLUG が全件解決する", () => {
    for (const [code, e] of Object.entries(STATION_SLUGS)) {
      expect(CODE_BY_SLUG[e.slug]).toBe(code);
    }
  });

  it("region は定義済みの区分のみ・全区分に1地点以上", () => {
    const used = new Set(Object.values(STATION_SLUGS).map((e) => e.region));
    for (const r of used) {
      expect(TIDE_REGION_LABELS[r]).toBeTruthy();
    }
    for (const r of TIDE_REGION_ORDER) {
      expect(used.has(r), `区分 ${r} に地点がない`).toBe(true);
    }
  });
});
