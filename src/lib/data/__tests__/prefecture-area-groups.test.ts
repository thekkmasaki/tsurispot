import { describe, it, expect } from "vitest";
import { prefectures } from "../prefectures";
import { fishingSpots } from "../spots";
import { getPrefectureAreaGroups } from "../area-groups";

// 2026-11 UX監査: 兵庫県ページの「加古川下流」に佐賀県の伊万里港波止が混入していた。
// 原因はスポットファイル独自の localRegion と regions.ts の id 衝突（r4101 など67件）を
// 県ページが id だけで照合していたこと。県ページの束ねは getPrefectureAreaGroups に一本化した。
describe("getPrefectureAreaGroups（県ページのエリア別一覧）", () => {
  it("どの県のエリアにも他県のスポットが入らない", () => {
    const leaked: string[] = [];
    for (const pref of prefectures) {
      const { areaGroups, ungroupedSpots } = getPrefectureAreaGroups(pref.name);
      for (const s of [...areaGroups.flatMap((g) => g.spots), ...ungroupedSpots]) {
        if (s.region.prefecture !== pref.name) leaked.push(`${pref.name} ← ${s.name}(${s.region.prefecture})`);
      }
    }
    expect(leaked).toEqual([]);
  });

  it("県内の全スポットが重複も漏れもなく1回ずつ載る", () => {
    for (const pref of prefectures) {
      const { areaGroups, ungroupedSpots } = getPrefectureAreaGroups(pref.name);
      const ids = [...areaGroups.flatMap((g) => g.spots), ...ungroupedSpots].map((s) => s.id).sort();
      const expected = fishingSpots
        .filter((s) => s.region.prefecture === pref.name)
        .map((s) => s.id)
        .sort();
      expect(ids, pref.name).toEqual(expected);
    }
  });

  it("0件のエリアや同名エリアの重複が無い", () => {
    for (const pref of prefectures) {
      const { areaGroups } = getPrefectureAreaGroups(pref.name);
      expect(areaGroups.every((g) => g.spots.length > 0), pref.name).toBe(true);
      const names = areaGroups.map((g) => g.area.areaName);
      expect(new Set(names).size, pref.name).toBe(names.length);
    }
  });

  it("兵庫県: 伊万里港波止が載らず、明石は1エリアにまとまる", () => {
    const { areaGroups, ungroupedSpots } = getPrefectureAreaGroups("兵庫県");
    const all = [...areaGroups.flatMap((g) => g.spots), ...ungroupedSpots];
    expect(all.some((s) => s.slug === "imari-kou-hato")).toBe(false);
    expect(areaGroups.filter((g) => g.area.areaName.includes("明石"))).toHaveLength(1);
  });

  it("京都府: 神奈川県鶴見の大黒海づり施設・ふれーゆ裏が載らない（r891 の id 衝突）", () => {
    const { areaGroups, ungroupedSpots } = getPrefectureAreaGroups("京都府");
    const slugs = [...areaGroups.flatMap((g) => g.spots), ...ungroupedSpots].map((s) => s.slug);
    expect(slugs).not.toContain("daikoku-fishing-facility");
    expect(slugs).not.toContain("fureyu-ura");
  });

  it("兵庫県: 沼島・翼港・福良港・尼崎魚つり公園の別名重複が統合されている", () => {
    const slugs = new Set(fishingSpots.map((s) => s.slug));
    for (const loser of ["awaji-nushima-k8", "awaji-tsubasa-kou-k8", "awaji-fukura-kou-k8", "amagasaki-tsuuri-park-k8"]) {
      expect(slugs.has(loser), loser).toBe(false);
    }
    for (const winner of ["nushima", "tsubasa-port", "fukura-kou", "amagasaki-fishing-park"]) {
      expect(slugs.has(winner), winner).toBe(true);
    }
  });
});
