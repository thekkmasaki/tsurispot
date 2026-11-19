import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { toListSpot } from "@/lib/data/list-spot";
import { spotSearchMatch } from "@/lib/search/spot-match";

/**
 * /spots のテキスト検索の回帰テスト（2026-08 UX監査）。
 *
 * 「横浜」で検索したとき、名前に横浜を含まなくても住所が横浜市のスポット
 * （大黒海づり施設など）がヒットすることを保証する。監査時、初期ロードで
 * 絞り込みが効かない・件数が数件しか出ないという症状の切り分けで
 * 「検索が名前一致のみではないか」という仮説が出たため、マッチング仕様を固定する。
 */

const listSpots = fishingSpots.map(toListSpot);

describe("spotSearchMatch: 地名検索", () => {
  it("「横浜」で住所が横浜市のスポット（名前に横浜なし）もヒットする", () => {
    const addressOnly = listSpots.filter(
      (s) => !s.name.includes("横浜") && (s.address ?? "").includes("横浜市")
    );
    expect(addressOnly.length).toBeGreaterThan(0);
    for (const s of addressOnly.slice(0, 10)) {
      expect(spotSearchMatch("横浜", s), `${s.name} (${s.address}) がヒットしない`).toBe(true);
    }
  });

  it("「横浜」のヒット総数は名前一致だけの場合より多い（住所・エリア名も対象）", () => {
    const total = listSpots.filter((s) => spotSearchMatch("横浜", s)).length;
    const nameOnly = listSpots.filter((s) => s.name.includes("横浜")).length;
    expect(total).toBeGreaterThan(nameOnly);
    expect(total).toBeGreaterThanOrEqual(20);
  });

  it("「京都」で東京都のスポットがヒットしない（2026-07-20 実バグの再発防止）", () => {
    const hits = listSpots.filter((s) => spotSearchMatch("京都", s));
    const wrong = hits.filter((s) => s.region.prefecture === "東京都" && !s.name.includes("京都"));
    expect(wrong.map((s) => `${s.name}/${s.address}`)).toEqual([]);
  });

  it("カタカナ/ひらがなを区別しない（「あじゅーる」→アジュール舞子）", () => {
    const target = listSpots.find((s) => s.name.includes("アジュール"));
    if (!target) return; // データ都合でスキップ
    expect(spotSearchMatch("あじゅーる", target)).toBe(true);
  });

  it("複数語クエリはAND（「神奈川 堤防」は神奈川県のスポットのみ）", () => {
    const hits = listSpots.filter((s) => spotSearchMatch("神奈川 横浜", s));
    for (const s of hits.slice(0, 10)) {
      expect(s.region.prefecture).toBe("神奈川県");
    }
  });
});

describe("spotSearchMatch: 魚名・釣法（2026-11 監査: タチウオが0件）", () => {
  it("「タチウオ」で、タチウオが釣れるスポットが全件ヒットする", () => {
    const expected = listSpots.filter((s) => s.fishNames.includes("タチウオ"));
    expect(expected.length).toBeGreaterThan(100);
    const hits = listSpots.filter((s) => spotSearchMatch("タチウオ", s));
    expect(hits.length).toBeGreaterThanOrEqual(expected.length);
  });

  it("ひらがなの「たちうお」でも同じ件数", () => {
    const a = listSpots.filter((s) => spotSearchMatch("タチウオ", s)).length;
    const b = listSpots.filter((s) => spotSearchMatch("たちうお", s)).length;
    expect(b).toBe(a);
  });

  it("「明石 タチウオ」は明石かつタチウオのスポットだけ", () => {
    const hits = listSpots.filter((s) => spotSearchMatch("明石 タチウオ", s));
    expect(hits.length).toBeGreaterThan(0);
    for (const s of hits) expect(s.fishNames.some((f) => f.includes("タチウオ"))).toBe(true);
  });

  it("1文字（「イ」）では魚名に当てない", () => {
    const viaFish = listSpots.filter(
      (s) => spotSearchMatch("イ", s) && !/[イい]/.test(s.name + s.region.areaName + (s.address ?? "")),
    );
    expect(viaFish).toEqual([]);
  });
});
