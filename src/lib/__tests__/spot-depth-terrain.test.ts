import { describe, expect, it } from "vitest";
import depthData from "@/lib/data/spot-depth-contour.json";
import { fishingSpots } from "@/lib/data/spots";
import { toListSpot } from "@/lib/data/list-spot";
import { classifyDepthTerrain, getSpotDepthKind, getSpotDepthTerrain } from "@/lib/spot-depth-terrain";
import { isDepthTerrainKind, terrainMatchesWord } from "@/lib/depth-terrain";
import { normalizeForSearch, spotSearchMatch } from "@/lib/search/spot-match";
import type { ListSpot } from "@/types";

describe("classifyDepthTerrain", () => {
  it("300m以内は steep で、海しるの距離を事実として出す", () => {
    const t = classifyDepthTerrain(300);
    expect(t.kind).toBe("steep");
    expect(t.fact).toBe("水深20mの等深線まで 沖合約300m");
  });

  it("100m未満は「100m以内」に丸める", () => {
    expect(classifyDepthTerrain(40).fact).toBe("水深20mの等深線まで 沖合100m以内");
  });

  it("300m超〜1km以内は moderate で50m単位に丸める", () => {
    const t = classifyDepthTerrain(720);
    expect(t.kind).toBe("moderate");
    expect(t.fact).toBe("水深20mの等深線まで 沖合約700m");
  });

  it("1km超・線が見つからない場合は「なし」", () => {
    expect(classifyDepthTerrain(1010).kind).toBe("shallow");
    expect(classifyDepthTerrain(null).fact).toBe("沖合約1km以内に水深20mの等深線なし");
  });

  it("「釣れる」等の解釈は付けない", () => {
    for (const d of [40, 720, null]) expect(classifyDepthTerrain(d).fact).not.toMatch(/イカ|根魚|狙/);
  });
});

describe("terrainMatchesWord（キーワード検索）", () => {
  const m = (kind: "steep" | "moderate" | "shallow", q: string) => terrainMatchesWord(kind, normalizeForSearch(q));

  it("「深場」「深い」は深い側2タイプに当たり、浅めには当たらない", () => {
    for (const q of ["深場", "深い"]) {
      expect(m("steep", q)).toBe(true);
      expect(m("moderate", q)).toBe(true);
      expect(m("shallow", q)).toBe(false);
    }
  });

  it("「ドン深」「どん深」「急深」は最も深いタイプだけ", () => {
    for (const q of ["ドン深", "どん深", "急深"]) {
      expect(m("steep", q)).toBe(true);
      expect(m("moderate", q)).toBe(false);
    }
  });

  it("「遠浅」「浅い」は浅めだけ", () => {
    expect(m("shallow", "遠浅")).toBe(true);
    expect(m("shallow", "浅い")).toBe(true);
    expect(m("steep", "遠浅")).toBe(false);
  });

  it("1文字や無関係な語では当たらない（「深」単独・地名）", () => {
    expect(m("steep", "深")).toBe(false);
    expect(m("steep", "深浦")).toBe(false);
    expect(m("shallow", "浅草")).toBe(false);
  });
});

describe("spotSearchMatch と地形", () => {
  const base: ListSpot = {
    id: "x", slug: "x", name: "テスト漁港", address: "千葉県館山市", region: { prefecture: "千葉県", areaName: "館山" } as ListSpot["region"],
    latitude: 35, longitude: 139.8, spotType: "port", category: "port" as ListSpot["category"], categoryDetail: undefined as unknown as ListSpot["categoryDetail"],
    difficulty: "beginner", isFree: true, hasParking: true, hasToilet: true, hasConvenienceStore: false, hasFishingShop: false,
    hasRentalRod: false, mainImageUrl: "", rating: 4, fishNames: [], methods: [], isHiddenGem: false, hasPremiumFish: false,
  };

  it("単語「深場」で深い地形のスポットに当たる", () => {
    expect(spotSearchMatch("深場", { ...base, depthTerrain: "steep" })).toBe(true);
    expect(spotSearchMatch("深場", { ...base, depthTerrain: "shallow" })).toBe(false);
    expect(spotSearchMatch("深場", base)).toBe(false);
  });

  it("複数語「千葉 ドン深」は県名＋地形の両方で絞る", () => {
    expect(spotSearchMatch("千葉 ドン深", { ...base, depthTerrain: "steep" })).toBe(true);
    expect(spotSearchMatch("千葉 ドン深", { ...base, depthTerrain: "moderate" })).toBe(false);
    expect(spotSearchMatch("神奈川 ドン深", { ...base, depthTerrain: "steep" })).toBe(false);
  });
});

describe("spot-depth-contour.json とスポットの対応", () => {
  const entries = Object.entries(depthData.spots as Record<string, number | null>);
  const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));

  it("海のスポット以外（川・池・湖）は含まない", () => {
    const nonMarine = entries.filter(([slug]) => {
      const s = bySlug.get(slug);
      return s && ["river", "pond", "lake"].includes(s.spotType);
    });
    expect(nonMarine).toEqual([]);
  });

  it("距離は0以上の数値か null", () => {
    for (const [, d] of entries) expect(d === null || (typeof d === "number" && d >= 0)).toBe(true);
  });

  it("データに無いスポットは null / undefined（表示・絞り込みに出さない）", () => {
    expect(getSpotDepthTerrain("__no_such_spot__")).toBeNull();
    expect(getSpotDepthKind("__no_such_spot__")).toBeUndefined();
  });

  it("toListSpot は地形タイプを載せ、川・池・湖には載せない", () => {
    const marine = fishingSpots.find((s) => s.slug in depthData.spots);
    const inland = fishingSpots.find((s) => s.spotType === "river");
    expect(marine && isDepthTerrainKind(toListSpot(marine).depthTerrain)).toBe(true);
    expect(inland && toListSpot(inland).depthTerrain).toBeUndefined();
  });
});
