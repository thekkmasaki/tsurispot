import { describe, it, expect } from "vitest";
import { fishingSpots } from "../spots";
import spotRedirects from "../spot-redirects.json";

// spot-redirects.json の転送元が公開中だと、next.config.ts はその転送を黙ってスキップする。
// 重複排除（spots.ts）の勝者は魚種数などで決まるため、データ編集で勝者が入れ替わると
// 手動で決めた正規URLと逆向きの301が出る（#685 の泡瀬漁港、2026-04〜10 に79件が同様に反転）。
// このテストは、勝者の入れ替わりを CI で検出する。

// 名前が異なる重複（港/漁港）で、両方のページが公開されている既知の3件。
// 統合は spot-merge-map.ts で行えるが、choshi-kou には公式の立入禁止注記（#704）があり、
// 統合すると勝者側に引き継がれないため、統合するかは別途判断する。増やさないこと。
const KNOWN_LIVE_DUPLICATE_SOURCES = new Set([
  "hinase-port-okayama", // 日生漁港 → 日生港（0.56km）
  "choshi-kou", // 銚子港 → 銚子漁港（0.9km）
  "yunotsu-gyokou-shimane", // 温泉津漁港 → 温泉津港（0.94km）
]);

describe("spot-redirects.json の整合性", () => {
  const live = new Set(fishingSpots.map((s) => s.slug));
  const entries = Object.entries(spotRedirects as Record<string, string>);

  it("転送元は公開中のスポットではない（既知の重複3件を除く）", () => {
    const liveSources = entries
      .map(([src]) => src)
      .filter((src) => live.has(src) && !KNOWN_LIVE_DUPLICATE_SOURCES.has(src));
    expect(liveSources).toEqual([]);
  });

  it("既知の重複リストに、もう公開されていないものが残っていない", () => {
    const stale = [...KNOWN_LIVE_DUPLICATE_SOURCES].filter((src) => !live.has(src));
    expect(stale).toEqual([]);
  });
});
