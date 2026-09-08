import { describe, it, expect } from "vitest";
import { getFishSpeciesWithSpots } from "@/lib/data";
import { fishSpecies } from "@/lib/data/fish";
import {
  fishRegionalAptitude,
  spotTypeOverrides,
  getSpotTypeAptitude,
} from "@/lib/data/fish-aptitude";
import { fishRegionalSeasons } from "@/lib/data/fish-regional-seasons";
import { resolveBroadSea } from "@/lib/geo/sea-label";
import type { RegionSlug, SpotSummary } from "@/types";

/**
 * 「釣れる度」判定（fish-aptitude）の回帰テスト。
 *
 * 目的:
 * - 生息域外スポットが一覧・件数に混入しない（例: 北海道のアオリイカ）
 * - 地形不適合が混入しない（例: 湖沼の海水魚・海の淡水魚）
 * - 地域偏重の是正が維持される（アオリイカのTOP30に日本海側が十分入る）
 * - 過剰除外の検知（件数バンド）
 */

const allFish = getFishSpeciesWithSpots();
const bySlug = new Map(allFish.map((f) => [f.slug, f]));
const validSlugs = new Set(fishSpecies.map((f) => f.slug));

describe("適性データの整合性", () => {
  it("全116魚種に地域適性が定義されている（網羅性・P3完了で有効化）", () => {
    const missing = fishSpecies
      .filter((f) => !(f.slug in fishRegionalAptitude))
      .map((f) => f.slug);
    expect(missing, `地域適性が未定義: ${missing.join(", ")}`).toEqual([]);
  });

  it("地域適性のキーが実在する魚種slugのみ", () => {
    for (const slug of Object.keys(fishRegionalAptitude)) {
      expect(validSlugs.has(slug), `未知の魚種slug: ${slug}`).toBe(true);
    }
  });

  it("地形適性オーバーライドのキーが実在する魚種slugのみ", () => {
    for (const slug of Object.keys(spotTypeOverrides)) {
      expect(validSlugs.has(slug), `未知の魚種slug: ${slug}`).toBe(true);
    }
  });

  it("全ての地域適性に根拠（rationale）が記載されている", () => {
    for (const [slug, apt] of Object.entries(fishRegionalAptitude)) {
      expect(apt.rationale.length, `${slug} の rationale が空`).toBeGreaterThan(20);
    }
  });

  it("海水魚は湖沼・管理釣り場で適性0、淡水魚は海の地形で適性0", () => {
    for (const fish of fishSpecies) {
      if (fish.category === "sea") {
        expect(getSpotTypeAptitude(fish.slug, "sea", "lake"), `${fish.slug}×lake`).toBe(0);
        expect(getSpotTypeAptitude(fish.slug, "sea", "pond"), `${fish.slug}×pond`).toBe(0);
      }
      if (fish.category === "freshwater") {
        // unagi は降河回遊魚のため港湾・汽水域の適性1を意図的に許容（例外）
        if (fish.slug === "unagi") continue;
        for (const st of ["port", "breakwater", "rocky", "surf", "pier"] as const) {
          expect(getSpotTypeAptitude(fish.slug, "freshwater", st), `${fish.slug}×${st}`).toBe(0);
        }
      }
    }
  });

  it("地域適性0の地域には fishRegionalSeasons のシーズン定義が無い（矛盾防止）", () => {
    for (const [slug, apt] of Object.entries(fishRegionalAptitude)) {
      if (!apt.regionOverrides) continue;
      for (const [region, level] of Object.entries(apt.regionOverrides)) {
        if (level !== 0) continue;
        const seasons = fishRegionalSeasons[slug]?.[region as RegionSlug];
        expect(
          seasons,
          `${slug} は ${region} で適性0（生息せず）なのにシーズン定義がある`
        ).toBeUndefined();
      }
    }
  });
});

describe("生息域外の除外", () => {
  it("アオリイカ: 北海道・岩手（分布外）のスポットが0件", () => {
    const spots = bySlug.get("aoriika")!.spots;
    const outOfRange = spots.filter(
      (s) => s.region.prefecture === "北海道" || s.region.prefecture === "岩手県"
    );
    expect(outOfRange.map((s) => `${s.region.prefecture}:${s.slug}`)).toEqual([]);
  });

  it("メバル・スズキ: 沖縄（分布外）のスポットが0件", () => {
    for (const slug of ["mebaru", "suzuki"]) {
      const okinawa = bySlug.get(slug)!.spots.filter((s) => s.region.prefecture === "沖縄県");
      expect(okinawa.map((s) => s.slug), `${slug} が沖縄に掲載`).toEqual([]);
    }
  });

  it("アオリイカ: 境界域（山形・秋田等）は「◎よく釣れる」にならない", () => {
    const spots = bySlug.get("aoriika")!.spots;
    const boundary = spots.filter((s) =>
      ["山形県", "秋田県", "青森県", "宮城県", "福島県"].includes(s.region.prefecture)
    );
    for (const s of boundary) {
      expect(s.catchRating, `${s.region.prefecture} ${s.slug} が ${s.catchRating}`).toBe("fair");
    }
  });
});

describe("地域偏重の是正（アオリイカ）", () => {
  const spots = bySlug.get("aoriika")!.spots;

  it("件数が過剰除外されていない（900〜1,250件の帯）", () => {
    expect(spots.length).toBeGreaterThanOrEqual(900);
    expect(spots.length).toBeLessThanOrEqual(1250);
  });

  it("TOP30に日本海側（対馬暖流域含む）が12件以上", () => {
    const top30 = spots.slice(0, 30);
    const japanSea = top30.filter(
      (s) => resolveBroadSea(s.latitude, s.longitude) === "日本海"
    );
    expect(japanSea.length).toBeGreaterThanOrEqual(12);
  });

  it("並び順が釣れる度スコア降順（決定的）", () => {
    for (let i = 1; i < spots.length; i++) {
      expect((spots[i - 1].catchScore ?? 0) >= (spots[i].catchScore ?? 0)).toBe(true);
    }
    // 2回呼んでも同一順序
    const again = getFishSpeciesWithSpots().find((f) => f.slug === "aoriika")!.spots;
    expect(again.map((s: SpotSummary) => s.slug)).toEqual(spots.map((s) => s.slug));
  });

  it("△まずまず（fair）が実際に生成されている（デッドコード解消）", () => {
    expect(spots.some((s) => s.catchRating === "fair")).toBe(true);
  });
});
