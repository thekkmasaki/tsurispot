import { describe, it, expect } from "vitest";
import { splitFishNames } from "@/lib/fish-name";

describe("splitFishNames", () => {
  it("単一魚種はそのまま", () => {
    expect(splitFishNames("アジ")).toEqual(["アジ"]);
  });

  it("全角読点・半角カンマ・中黒・スラッシュで分割", () => {
    expect(splitFishNames("アジ、サバ")).toEqual(["アジ", "サバ"]);
    expect(splitFishNames("アジ,サバ")).toEqual(["アジ", "サバ"]);
    expect(splitFishNames("アジ・サバ")).toEqual(["アジ", "サバ"]);
    expect(splitFishNames("アジ/サバ")).toEqual(["アジ", "サバ"]);
    expect(splitFishNames("アジ／サバ")).toEqual(["アジ", "サバ"]);
  });

  it("空白まじり・空要素・重複を整理", () => {
    expect(splitFishNames(" アジ , サバ ,, アジ ")).toEqual(["アジ", "サバ"]);
  });

  it("3種以上もOK", () => {
    expect(splitFishNames("アジ、サバ、イワシ")).toEqual([
      "アジ",
      "サバ",
      "イワシ",
    ]);
  });

  it("null/undefined/空文字は空配列", () => {
    expect(splitFishNames(null)).toEqual([]);
    expect(splitFishNames(undefined)).toEqual([]);
    expect(splitFishNames("")).toEqual([]);
    expect(splitFishNames("、、")).toEqual([]);
  });
});
