import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import { toListSpot } from "@/lib/data/list-spot";
import { spotSearchMatch, normalizeForSearch } from "@/lib/search/spot-match";
import { fishNameMatches } from "@/lib/search/fish-terms";
import { buildFishSearchTerms } from "@/lib/search/fish-terms-build";
import { fishSpecies } from "@/lib/data/fish";
import generatedFishTerms from "@/lib/data/generated/fish-search-terms.json";

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

describe("spotSearchMatch: 魚名の完全一致と別名（2026-11 監査: アジでシマアジを拾う）", () => {
  const norm = (s: string) => normalizeForSearch(s);
  /** 名前・エリア・住所・釣法に語を含まない（＝魚名でしか当たり得ない）スポット */
  const onlyViaFish = (s: (typeof listSpots)[number], word: string) =>
    ![s.name, s.region.areaName, s.address ?? "", ...s.methods].some((t) => norm(t).includes(norm(word)));

  it("「アジ」はシマアジ・ロウニンアジだけのスポットに当たらない", () => {
    const others = listSpots.filter(
      (s) =>
        !s.fishNames.includes("アジ") &&
        s.fishNames.some((f) => f === "シマアジ" || f === "ロウニンアジ") &&
        onlyViaFish(s, "アジ"),
    );
    expect(others.length).toBeGreaterThan(0);
    for (const s of others) expect(spotSearchMatch("アジ", s), s.name).toBe(false);
  });

  it("「アジ」はアジのいるスポットを全部拾う", () => {
    const aji = listSpots.filter((s) => s.fishNames.includes("アジ"));
    for (const s of aji) expect(spotSearchMatch("アジ", s), s.name).toBe(true);
  });

  it("「シマアジ」はシマアジのスポットを拾い、アジだけのスポットは拾わない", () => {
    const shima = listSpots.filter((s) => s.fishNames.includes("シマアジ"));
    for (const s of shima) expect(spotSearchMatch("シマアジ", s)).toBe(true);
    const ajiOnly = listSpots.filter(
      (s) => s.fishNames.includes("アジ") && !s.fishNames.includes("シマアジ") && onlyViaFish(s, "シマアジ"),
    );
    for (const s of ajiOnly.slice(0, 50)) expect(spotSearchMatch("シマアジ", s)).toBe(false);
  });

  it("別名「チヌ」「ガシラ」で正式名のスポットが出る", () => {
    for (const [alias, name] of [["チヌ", "クロダイ"], ["ガシラ", "カサゴ"]] as const) {
      const target = listSpots.filter((s) => s.fishNames.includes(name));
      expect(target.length).toBeGreaterThan(0);
      for (const s of target.slice(0, 50)) expect(spotSearchMatch(alias, s), `${alias}→${s.name}`).toBe(true);
    }
  });

  it("別名を含む複数語（「明石 チヌ」）も効く", () => {
    const hits = listSpots.filter((s) => spotSearchMatch("明石 チヌ", s));
    expect(hits.length).toBeGreaterThan(0);
    for (const s of hits) expect(s.fishNames).toContain("クロダイ");
  });

  it("総称（「イカ」）は従来どおり部分一致でアオリイカ等を拾う", () => {
    const aori = listSpots.filter((s) => s.fishNames.includes("アオリイカ"));
    for (const s of aori.slice(0, 50)) expect(spotSearchMatch("イカ", s)).toBe(true);
  });

  it("別名「マス」はニジマス等の部分一致も残す（別名データの地方名重複で取りこぼさない）", () => {
    const niji = listSpots.filter((s) => s.fishNames.includes("ニジマス"));
    for (const s of niji.slice(0, 50)) expect(spotSearchMatch("マス", s)).toBe(true);
  });

  it("検索用の魚名・別名JSONが魚種データと一致している（ずれたら scripts/gen-fish-search-terms.ts を実行）", () => {
    expect(generatedFishTerms).toEqual(buildFishSearchTerms(fishSpecies));
  });
});

describe("fishNameMatches", () => {
  it("正式名は完全一致、別名は指す魚に一致", () => {
    expect(fishNameMatches(normalizeForSearch("アジ"), "アジ")).toBe(true);
    expect(fishNameMatches(normalizeForSearch("アジ"), "シマアジ")).toBe(false);
    expect(fishNameMatches(normalizeForSearch("あじ"), "アジ")).toBe(true);
    expect(fishNameMatches(normalizeForSearch("チヌ"), "クロダイ")).toBe(true);
    expect(fishNameMatches(normalizeForSearch("シーバス"), "シーバス")).toBe(true);
    expect(fishNameMatches(normalizeForSearch("イカ"), "アオリイカ")).toBe(true);
  });
});
