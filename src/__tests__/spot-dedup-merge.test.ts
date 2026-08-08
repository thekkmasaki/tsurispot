import { describe, it, expect } from "vitest";
import { fishingSpots, dedupRedirects } from "@/lib/data/spots";
import { isSameSpotName, normalizeSpotName } from "@/lib/data/spot-name-normalize";

/**
 * 表記ゆれ名寄せ（deduplicateSpots Pass3）の回帰テスト（2026-08 UX監査）。
 * 「本牧海づり施設 / 横浜本牧海づり施設 / 横浜・本牧海づり施設」等の同一地物が
 * 別ページとして生存し、互いの「周辺スポット」に並んでいた問題の再発を防ぐ。
 */

const HONMOKU_FACILITY_SLUGS = [
  "honmoku-fishing",
  "honmoku-umizuri-add2",
  "yokohama-honmoku-fishing",
  "yokohama-honmoku6",
  "honmoku-umizuri",
  "honmoku-umizuri-e8",
  "honmoku-umizuri-shisetsu-a9",
  "honmoku-umizuri-shisetsu-a10",
];

const DAIKOKU_FACILITY_SLUGS = [
  "daikoku-fishing",
  "daikoku-fishing-facility",
  "daikoku-umizuri",
  "daikoku-umizuri-e8",
  "yokohama-daikoku-umizuri-a13",
];

describe("正規化名寄せユーティリティ", () => {
  it("海づり/海釣り・中黒・地名プレフィックスの差を同一視する", () => {
    expect(isSameSpotName("本牧海づり施設", "横浜・本牧海づり施設")).toBe(true);
    expect(isSameSpotName("本牧海づり施設", "横浜本牧海づり施設")).toBe(true);
    expect(isSameSpotName("大黒海釣り施設", "大黒海づり施設")).toBe(true);
    expect(normalizeSpotName("横浜・本牧海づり施設")).toBe(normalizeSpotName("横浜本牧海釣り施設"));
  });

  it("接尾辞が異なる別地物は同一視しない", () => {
    expect(isSameSpotName("本牧海づり施設", "横浜・本牧釣り施設跡護岸")).toBe(false);
    expect(isSameSpotName("大黒海づり施設", "大黒埠頭緑地公園")).toBe(false);
  });
});

describe("重複スポットの統合", () => {
  it("本牧海づり施設系は1件だけ生存し、他は勝者へリダイレクトされる", () => {
    const alive = fishingSpots.filter((s) => HONMOKU_FACILITY_SLUGS.includes(s.slug));
    expect(alive.map((s) => s.slug)).toHaveLength(1);
    const winner = alive[0].slug;
    for (const slug of HONMOKU_FACILITY_SLUGS) {
      if (slug === winner) continue;
      const target = dedupRedirects.get(slug);
      expect(target, `${slug} のリダイレクトが無い`).toBeDefined();
      expect(target).toBe(winner);
    }
  });

  it("大黒海づり施設系は1件だけ生存し、他は勝者へリダイレクトされる", () => {
    const alive = fishingSpots.filter((s) => DAIKOKU_FACILITY_SLUGS.includes(s.slug));
    expect(alive.map((s) => s.slug)).toHaveLength(1);
    const winner = alive[0].slug;
    for (const slug of DAIKOKU_FACILITY_SLUGS) {
      if (slug === winner) continue;
      expect(dedupRedirects.get(slug), `${slug} のリダイレクトが無い`).toBe(winner);
    }
  });

  it("別地物（跡護岸・緑地公園）は統合されず生存している", () => {
    expect(fishingSpots.some((s) => s.slug === "yokohama-honmoku-gogan-a12")).toBe(true);
    expect(fishingSpots.some((s) => s.slug === "daikoku-futo-ryokuchi-kouen")).toBe(true);
  });

  it("同一都道府県・5km以内に正規化名が同一のスポットは残っていない", () => {
    const byPrefNorm = new Map<string, { slug: string; lat: number; lng: number }[]>();
    for (const s of fishingSpots) {
      const key = `${s.region.prefecture}:${normalizeSpotName(s.name)}`;
      const list = byPrefNorm.get(key) ?? [];
      list.push({ slug: s.slug, lat: s.latitude, lng: s.longitude });
      byPrefNorm.set(key, list);
    }
    const offenders: string[] = [];
    for (const [key, list] of byPrefNorm) {
      if (list.length < 2) continue;
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const dLat = ((list[j].lat - list[i].lat) * Math.PI) / 180;
          const dLng = ((list[j].lng - list[i].lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((list[i].lat * Math.PI) / 180) *
              Math.cos((list[j].lat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (km <= 5) offenders.push(`${key}: ${list[i].slug} / ${list[j].slug}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("統合レポート（PR用）: 名寄せで消えたslugの件数を出力する", () => {
    // Pass1/2 由来も含む全リダイレクト数（参考値としてログ出力）
    console.info(`[dedup] リダイレクト総数: ${dedupRedirects.size}, 生存スポット数: ${fishingSpots.length}`);
    expect(dedupRedirects.size).toBeGreaterThan(0);
  });
});
