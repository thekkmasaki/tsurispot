/**
 * 都道府県 → 潮汐観測地点 の導線データ（/prefecture/[slug] の潮見表セクション用）。
 * 内陸県に海の潮見表を出さないこと、沿岸県で妥当な地点が返ることを保証する。
 */
import { describe, it, expect } from "vitest";
import { getStationsForPrefecture } from "@/lib/tide/station-spots";
import { getStationSlug } from "@/lib/tide/station-slugs";
import { prefectures } from "@/lib/data/prefectures";

const LANDLOCKED = ["埼玉県", "群馬県", "栃木県", "山梨県", "長野県", "岐阜県", "滋賀県", "奈良県"];

describe("getStationsForPrefecture", () => {
  it("内陸県は空配列（海の潮見表を出さない）", () => {
    for (const pref of LANDLOCKED) {
      expect(getStationsForPrefecture(pref), pref).toEqual([]);
    }
  });

  it("沿岸県は1件以上返り、全地点に /tides slug がある", () => {
    const coastal = prefectures.filter((p) => !LANDLOCKED.includes(p.name));
    for (const p of coastal) {
      const list = getStationsForPrefecture(p.name);
      expect(list.length, p.name).toBeGreaterThan(0);
      for (const st of list) {
        expect(getStationSlug(st.code), `${p.name}/${st.code}`).not.toBeNull();
      }
    }
  });

  it("スポット数の多い順・limit で切れる", () => {
    const list = getStationsForPrefecture("兵庫県", 3);
    expect(list.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].spotCount).toBeGreaterThanOrEqual(list[i].spotCount);
    }
  });

  it("兵庫県には明石海峡周辺の地点（神戸 or 明石）が含まれる", () => {
    const names = getStationsForPrefecture("兵庫県").map((s) => s.name);
    expect(names.some((n) => n.includes("神戸") || n.includes("明石"))).toBe(true);
  });
});
