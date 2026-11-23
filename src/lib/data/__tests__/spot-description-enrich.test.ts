import { describe, it, expect } from "vitest";
import { enrichDescriptions, fishingSpots } from "../spots";
import { allRawSpots } from "../spots-registry";
import { mergeDescription, splitSentences } from "../spot-description-enrich";

// 100字未満の紹介文を自動生成文で補完するとき、人手で書いた注意書きが消えないことを確かめる。
// 2026-11-23 水月湖（mikata-suigetsuko-a13）で「遊漁券が必要」が本番から消えていた件の再発防止。
const CAUTION = /遊漁券|禁止|立入|立ち入り|有料/;

describe("mergeDescription", () => {
  it("元の紹介文を先頭にそのまま残す", () => {
    const merged = mergeDescription("清流の渓流釣り場。遊漁券が必要。", "アユが狙える。ベストシーズンは7月頃。");
    expect(merged.startsWith("清流の渓流釣り場。遊漁券が必要。")).toBe(true);
    expect(merged).toContain("ベストシーズンは7月頃。");
  });

  it("元の紹介文に既にある文は足さない", () => {
    const merged = mergeDescription("アユが狙える。遊漁券が必要。", "アユが狙える。ベストシーズンは7月頃。");
    expect(merged).toBe("アユが狙える。遊漁券が必要。ベストシーズンは7月頃。");
  });

  it("自動生成文の中の重複文も1回だけ足す", () => {
    const merged = mergeDescription("元の文。", "追加の文。追加の文。別の文。");
    expect(merged).toBe("元の文。追加の文。別の文。");
  });

  it("文末に句点が無い元の紹介文には句点を補う", () => {
    expect(mergeDescription("遊泳禁止", "キスが狙える。")).toBe("遊泳禁止。キスが狙える。");
  });

  it("元の紹介文が空なら自動生成文をそのまま使う", () => {
    expect(mergeDescription("", "キスが狙える。")).toBe("キスが狙える。");
  });

  it("splitSentences は句点で区切り、区切り文字を残す", () => {
    expect(splitSentences("A。B！C")).toEqual(["A。", "B！", "C"]);
  });
});

describe("enrichDescriptions: 注意書きの保持", () => {
  it("100字未満で注意書きを含む元の紹介文は enrich 後も全文残る（釣り禁止スポット以外）", () => {
    const targets = allRawSpots.filter(
      (s) => !s.fishingBan && (s.description || "").length < 100 && CAUTION.test(s.description || "")
    );
    expect(targets.length).toBeGreaterThan(0);
    const enriched = enrichDescriptions(targets);
    enriched.forEach((s, i) => {
      expect(s.description.startsWith(targets[i].description.trim()), s.slug).toBe(true);
      expect(s.description.length, s.slug).toBeGreaterThanOrEqual(100);
    });
  });

  it("本番データで既知の注意書きが description に残っている", () => {
    const expected: Record<string, string> = {
      "uchiko-odagawa-w6": "遊漁券が必要",
      "ureshino-shiodagawa-w6": "遊漁券が必要",
      "ouchi-matsuuragawa-jouryuu-s8": "遊漁券が必要な区間あり",
      "katsura-hama-w6": "遊泳禁止",
      "ishigaki-kabira-bay": "遊泳禁止",
      "mikata-suigetsuko-a13": "遊漁券",
    };
    for (const [slug, phrase] of Object.entries(expected)) {
      const spot = fishingSpots.find((s) => s.slug === slug);
      expect(spot, slug).toBeDefined();
      expect(spot!.description, slug).toContain(phrase);
    }
  });

  it("100字以上の紹介文と釣り禁止スポットには手を付けない", () => {
    const long = allRawSpots.find((s) => !s.fishingBan && (s.description || "").length >= 100)!;
    const banned = allRawSpots.find((s) => s.fishingBan && (s.description || "").length < 100);
    expect(enrichDescriptions([long])[0].description).toBe(long.description);
    if (banned) expect(enrichDescriptions([banned])[0].description).toBe(banned.description);
  });
});
