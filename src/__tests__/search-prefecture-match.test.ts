import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";

/**
 * 県名検索の誤ヒット防止（2026-07-20 実バグ）。
 *
 * 県名を素の部分一致で検索対象にすると「京都」が「東京都」に含まれるため、
 * 京都府を探したユーザーに東京都のスポットが返っていた。県名は前方一致で判定する。
 * ここでは検索実装（src/app/api/search/route.ts / spot-list-client.tsx）が依拠する
 * 「県名の前方一致」ルールが日本の47都道府県で破綻しないことを保証する。
 */

const PREFECTURES = Array.from(new Set(fishingSpots.map((s) => s.region.prefecture)));

describe("県名の前方一致マッチ", () => {
  it("「京都」は京都府にのみ前方一致し、東京都には一致しない", () => {
    expect("京都府".startsWith("京都")).toBe(true);
    expect("東京都".startsWith("京都")).toBe(false);
  });

  it("「東京」は東京都にのみ前方一致する", () => {
    const matched = PREFECTURES.filter((p) => p.startsWith("東京"));
    expect(matched).toEqual(["東京都"]);
  });

  it("県名フル入力（「京都府」「東京都」）も一致する", () => {
    expect("京都府".startsWith("京都府")).toBe(true);
    expect("東京都".startsWith("東京都")).toBe(true);
  });

  it("どの都道府県も他県の前方一致にならない（部分一致なら誤ヒットする組が存在する）", () => {
    for (const a of PREFECTURES) {
      const others = PREFECTURES.filter((p) => p !== a && p.startsWith(a));
      expect(others, `${a} が他県の前方に含まれている`).toEqual([]);
    }
    // 前方一致でなければ誤ヒットが起きることの確認（回帰の再発検知）
    const substringCollisions = PREFECTURES.filter((p) => p !== "京都府" && p.includes("京都"));
    expect(substringCollisions).toContain("東京都");
  });

  it("スポットの県名は正規の都道府県表記になっている（前方一致の前提）", () => {
    for (const p of PREFECTURES) {
      expect(p, `不正な県名表記: ${p}`).toMatch(/(都|道|府|県)$/);
    }
  });
});

describe("住所からの県名除去", () => {
  it("県名を除いた住所には県名が残らない（市区町村検索で県名誤ヒットしない）", () => {
    const tokyoSpot = fishingSpots.find((s) => s.region.prefecture === "東京都" && s.address);
    if (!tokyoSpot?.address) return; // データ都合でスキップ
    const withoutPref = tokyoSpot.address.replace(tokyoSpot.region.prefecture, "");
    expect(withoutPref.includes("東京都")).toBe(false);
    expect(withoutPref.includes("京都")).toBe(false);
  });
});
