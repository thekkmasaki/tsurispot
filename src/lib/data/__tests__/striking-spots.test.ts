import { describe, it, expect } from "vitest";
import { strikingSpots, getStrikingSpotsByPref } from "../striking-spots";
import { fishingSpots } from "../spots";
import { prefectures } from "../prefectures";

/**
 * G2（県ハブ→注目spotの内部リンク強化）の対象データ整合性を保証する。
 * striking-spots.ts は GSC実測ベースの手動データなので、slug の打ち間違い・
 * spot削除・リダイレクト化があると県ハブが 404 リンクを吐く。CIで機械的に検出する。
 */
describe("striking-spots (G2 内部リンク対象)", () => {
  const spotBySlug = new Map(fishingSpots.map((s) => [s.slug, s]));
  const validPrefSlugs = new Set(prefectures.map((p) => p.slug));

  it("全slugが実在するspotを指す（404/リンク切れ防止）", () => {
    const missing = strikingSpots.filter((s) => !spotBySlug.has(s.slug)).map((s) => s.slug);
    expect(missing, `fishingSpots に存在しない slug: ${missing.join(", ")}`).toEqual([]);
  });

  it("prefSlugが全て有効な都道府県slug", () => {
    const bad = strikingSpots.filter((s) => !validPrefSlugs.has(s.prefSlug)).map((s) => s.prefSlug);
    expect(bad, `無効な prefSlug: ${bad.join(", ")}`).toEqual([]);
  });

  it("slugに重複がない（同一spotの二重リンク防止）", () => {
    const slugs = strikingSpots.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("posはstriking distance帯（5〜15）・impは下限150以上", () => {
    for (const s of strikingSpots) {
      expect(s.pos, `${s.slug} の pos ${s.pos}`).toBeGreaterThanOrEqual(5);
      expect(s.pos, `${s.slug} の pos ${s.pos}`).toBeLessThanOrEqual(15);
      expect(s.imp, `${s.slug} の imp ${s.imp}`).toBeGreaterThanOrEqual(150);
    }
  });

  it("getStrikingSpotsByPref は imp 降順で返す", () => {
    const hk = getStrikingSpotsByPref("hokkaido");
    expect(hk.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < hk.length; i++) {
      expect(hk[i - 1].imp).toBeGreaterThanOrEqual(hk[i].imp);
    }
  });
});
