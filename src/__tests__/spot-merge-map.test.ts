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
    // 同じ slug の生データが複数ファイルにある場合（例: hashidate-gyoko）、dedup Pass4 で
    // 生き残ったどれか1つが統合元の実体になる。その実体の魚種が全て引き継がれていればよい。
    const rawDefs = new Map<string, typeof allRawSpots>();
    for (const s of allRawSpots) rawDefs.set(s.slug, [...(rawDefs.get(s.slug) ?? []), s]);
    for (const [loser, winner] of entries) {
      const defs = rawDefs.get(loser);
      expect(defs, `${loser} の生データが無い`).toBeDefined();
      const winnerFish = new Set(live.get(winner)!.catchableFish.map((cf) => cf.fish.slug));
      const missing = defs!.map((d) => d.catchableFish.filter((cf) => !winnerFish.has(cf.fish.slug)).map((cf) => cf.fish.slug));
      expect(
        missing.some((m) => m.length === 0),
        `${winner} に ${loser} の魚種が無い: ${missing.map((m) => m.join(",")).join(" / ")}`,
      ).toBe(true);
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
