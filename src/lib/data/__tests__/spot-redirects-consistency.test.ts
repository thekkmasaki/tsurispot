import { describe, it, expect } from "vitest";
import { fishingSpots } from "../spots";
import spotRedirects from "../spot-redirects.json";

// spot-redirects.json の転送元が公開中だと、next.config.ts はその転送を黙ってスキップする。
// 重複排除（spots.ts）の勝者は魚種数などで決まるため、データ編集で勝者が入れ替わると
// 手動で決めた正規URLと逆向きの301が出る（#685 の泡瀬漁港、2026-04〜10 に79件が同様に反転）。
// 名前が違う重複（港/漁港など）は重複排除をすり抜けて両ページが公開されたままになる
// （日生・銚子・温泉津の3件。spot-merge-map.ts で統合済み）。このテストで両方を CI で検出する。
describe("spot-redirects.json の整合性", () => {
  it("転送元は公開中のスポットではない", () => {
    const live = new Set(fishingSpots.map((s) => s.slug));
    const liveSources = Object.keys(spotRedirects as Record<string, string>).filter((src) => live.has(src));
    expect(liveSources).toEqual([]);
  });
});
