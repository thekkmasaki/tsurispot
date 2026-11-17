import { describe, it, expect } from "vitest";
import { fishingSpots, dedupRedirects } from "@/lib/data/spots";
import { allRawSpots } from "@/lib/data/spots-registry";
import { spotMergeMap } from "@/lib/data/spot-merge-map";

/**
 * 同一施設の重複ページ統合（spot-merge-map.ts / deduplicateSpots Pass5）の回帰テスト。
 * 統合表の全エントリが実際に効いていること（敗者が消え、勝者へ 301 されること）と、
 * 統合で釣れる魚・釣り禁止情報が失われないことを保証する。
 */
const live = new Map(fishingSpots.map((s) => [s.slug, s]));
const entries = Object.entries(spotMergeMap);

describe("spot-merge-map（同一施設の重複統合）", () => {
  it("統合表は空でなく、チェーン（勝者が別エントリの敗者）を含まない", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [, winner] of entries) {
      expect(spotMergeMap[winner], `${winner} が敗者側にもある`).toBeUndefined();
    }
  });

  it("敗者は公開スポットから消え、勝者は公開中で、敗者→勝者のリダイレクトがある", () => {
    for (const [loser, winner] of entries) {
      expect(live.has(loser), `${loser} がまだ公開されている`).toBe(false);
      expect(live.has(winner), `${winner} が公開されていない`).toBe(true);
      expect(dedupRedirects.get(loser), `${loser} のリダイレクト先`).toBe(winner);
    }
  });

  it("勝者は敗者の釣れる魚をすべて引き継いでいる", () => {
    const rawBySlug = new Map(allRawSpots.map((s) => [s.slug, s]));
    for (const [loser, winner] of entries) {
      const raw = rawBySlug.get(loser);
      expect(raw, `${loser} の生データが無い`).toBeDefined();
      const winnerFish = new Set(live.get(winner)!.catchableFish.map((cf) => cf.fish.slug));
      for (const cf of raw!.catchableFish) {
        expect(winnerFish.has(cf.fish.slug), `${winner} に ${loser} の ${cf.fish.slug} が無い`).toBe(true);
      }
    }
  });

  it("釣り禁止情報を持つスポットを禁止情報の無い勝者へ統合していない", () => {
    const rawBySlug = new Map(allRawSpots.map((s) => [s.slug, s]));
    for (const [loser, winner] of entries) {
      if (rawBySlug.get(loser)?.fishingBan) {
        expect(live.get(winner)!.fishingBan, `${loser} の釣り禁止情報が ${winner} で失われる`).toBeDefined();
      }
    }
  });

  it("公開スポットの slug は一意", () => {
    expect(new Set(fishingSpots.map((s) => s.slug)).size).toBe(fishingSpots.length);
  });
});
