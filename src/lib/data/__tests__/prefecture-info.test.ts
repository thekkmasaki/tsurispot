import { describe, it, expect } from "vitest";
import { prefectureInfoList } from "../prefecture-info";
import { fishingSpots } from "../spots";

describe("prefectureInfoList", () => {
  it("全47都道府県分のエントリがある", () => {
    expect(prefectureInfoList.length).toBe(47);
  });

  it("slugが重複していない", () => {
    const slugs = prefectureInfoList.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  describe("areaOverviews（定義されている県のみ）", () => {
    const withOverviews = prefectureInfoList.filter(
      (p) => p.areaOverviews && p.areaOverviews.length > 0
    );

    it("エリア数は2〜4件", () => {
      for (const p of withOverviews) {
        expect(p.areaOverviews!.length, p.slug).toBeGreaterThanOrEqual(2);
        expect(p.areaOverviews!.length, p.slug).toBeLessThanOrEqual(4);
      }
    });

    it("各エリア解説は200字以上600字以下", () => {
      for (const p of withOverviews) {
        for (const o of p.areaOverviews!) {
          expect(o.text.length, `${p.slug}/${o.area}`).toBeGreaterThanOrEqual(200);
          expect(o.text.length, `${p.slug}/${o.area}`).toBeLessThanOrEqual(600);
        }
      }
    });

    it("エリア名が県内で重複していない", () => {
      for (const p of withOverviews) {
        const areas = p.areaOverviews!.map((o) => o.area);
        expect(new Set(areas).size, p.slug).toBe(areas.length);
      }
    });

    it("解説内の「」で囲まれたスポット名が実データに存在する", () => {
      const spotNames = new Set(fishingSpots.map((s) => s.name));
      for (const p of withOverviews) {
        const texts = [
          ...p.areaOverviews!.map((o) => o.text),
          p.editorComment ?? "",
        ].join("");
        const quoted = texts.match(/「([^」]+)」/g) ?? [];
        for (const q of quoted) {
          const name = q.slice(1, -1);
          // スポット名として言及される「」はデータに実在すること（一般語の場合はスキップ不可のため、
          // 執筆ルール上「」はスポット名の引用にのみ使う）
          expect(spotNames.has(name), `${p.slug}: 「${name}」が spots に存在しない`).toBe(true);
        }
      }
    });
  });

  describe("editorComment（定義されている県のみ）", () => {
    const withComment = prefectureInfoList.filter((p) => p.editorComment);

    it("100字以上300字以下", () => {
      for (const p of withComment) {
        expect(p.editorComment!.length, p.slug).toBeGreaterThanOrEqual(100);
        expect(p.editorComment!.length, p.slug).toBeLessThanOrEqual(300);
      }
    });

    it("禁止表現（虚偽・実釣経験の捏造）を含まない", () => {
      const banned = ["兵庫県在住", "行ってきました", "釣ってきました", "釣れました"];
      for (const p of withComment) {
        for (const word of banned) {
          expect(p.editorComment!.includes(word), `${p.slug}: 禁止表現「${word}」`).toBe(false);
        }
      }
    });
  });
});
