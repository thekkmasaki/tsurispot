import { describe, it, expect } from "vitest";
import { fishingSpots } from "../spots";
import {
  spotAliases,
  getSpotAliasNames,
  getVisibleSpotAliases,
  MAX_ALIASES_PER_SPOT,
} from "../spot-aliases";

describe("スポットの別名・旧名（spot-aliases）", () => {
  const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));

  it("別名はすべて公開中のスポットに付いている", () => {
    // 重複統合で負けた slug に書くと何も表示されない（黙って消える）ので検出する
    for (const slug of Object.keys(spotAliases)) {
      expect(bySlug.get(slug), `${slug}: 公開中のスポットに無い（統合後の slug を指定する）`).toBeDefined();
    }
  });

  it("1スポットの別名は上限以内で、空文字・重複が無い", () => {
    for (const [slug, e] of Object.entries(spotAliases)) {
      expect(e.names.length, slug).toBeGreaterThan(0);
      expect(e.names.length, slug).toBeLessThanOrEqual(MAX_ALIASES_PER_SPOT);
      expect(new Set(e.names).size, slug).toBe(e.names.length);
      for (const n of e.names) expect(n.trim(), slug).toBe(n);
      expect(e.source.trim().length, `${slug}: 根拠(source)が無い`).toBeGreaterThan(0);
    }
  });

  it("GSC由来でない別名は、そのスポットの公開データに書かれている（推測で作らない）", () => {
    for (const [slug, e] of Object.entries(spotAliases)) {
      if (e.source.startsWith("GSC")) continue;
      const spot = bySlug.get(slug);
      if (!spot) continue;
      const text = [spot.name, spot.description, ...(spot.managementInfo?.notes ?? [])].join("\n");
      for (const n of e.names) {
        expect(text.includes(n), `${slug}: 「${n}」が公開データに無い（根拠を source に書き、データにも残す）`).toBe(true);
      }
    }
  });

  it("別名が他の公開スポットの名前に含まれない（同じ検索語での自サイト内競合を防ぐ）", () => {
    for (const [slug, e] of Object.entries(spotAliases)) {
      for (const n of e.names) {
        const others = fishingSpots.filter((s) => s.slug !== slug && s.name.includes(n)).map((s) => `${s.slug}:${s.name}`);
        expect(others, `${slug}: 「${n}」は別スポットの名前にも含まれる`).toEqual([]);
      }
    }
  });

  it("画面表示は正式名に含まれない別名だけ", () => {
    // 須磨海岸（千守突堤）: 千守突堤は見出しに出ているので重ねて表示しない
    expect(getVisibleSpotAliases("suma-senmori-tottei", "須磨海岸（千守突堤）")).toBeNull();
    expect(getVisibleSpotAliases("ibo-port-takasago", "伊保港")).toEqual({ kind: "alias", names: ["関電白灯"] });
    expect(getVisibleSpotAliases("no-such-spot", "x")).toBeNull();
    // 構造化データ・検索用は正式名に含まれていても持たせる
    expect(getSpotAliasNames("suma-senmori-tottei", "須磨海岸（千守突堤）")).toEqual(["千守突堤"]);
    expect(getSpotAliasNames("no-such-spot")).toEqual([]);
  });
});
