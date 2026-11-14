import { describe, expect, it } from "vitest";
import {
  buildChoukaReplyText,
  buildFishReplyText,
  CHOUKA_URL,
  findFishInText,
  pickLineHighlights,
  weeklyAreaForPrefecture,
} from "../chouka-reply";
import type { LatestWeeklyCatch } from "@/lib/data/weekly-report-latest";

const row = (areaSlug: string, heat: number, fish = "アジ", extra: Partial<LatestWeeklyCatch> = {}): LatestWeeklyCatch => ({
  spot: `${areaSlug}の堤防`,
  spotHref: null,
  fish,
  size: "20cm",
  method: "サビキ",
  heat,
  areaSlug,
  areaLabel: `${areaSlug}エリア`,
  articleHref: `/blog/chouka-shuho-${areaSlug}`,
  publishedAt: "2026-11-12",
  ...extra,
});

const FISH = [
  { slug: "aji", name: "アジ", aliases: ["マアジ", "鯵"] },
  { slug: "shimaaji", name: "シマアジ" },
  { slug: "tachiuo", name: "タチウオ", aliases: ["太刀魚"] },
  { slug: "ei", name: "エ" },
];

describe("pickLineHighlights", () => {
  it("1エリア1行・好調度順に最大3エリア、好調度0は除外", () => {
    const picks = pickLineHighlights([
      row("a", 1), row("a", 3, "サバ"), row("b", 2), row("c", 0), row("d", 1), row("e", 2),
    ]);
    expect(picks.map((p) => [p.areaSlug, p.fish])).toEqual([["a", "サバ"], ["b", "アジ"], ["e", "アジ"]]);
  });
  it("除外エリアは出さない", () => {
    expect(pickLineHighlights([row("a", 3), row("b", 1)], "a").map((p) => p.areaSlug)).toEqual(["b"]);
  });
});

describe("weeklyAreaForPrefecture", () => {
  it("主要10エリアの県だけ対応する", () => {
    expect(weeklyAreaForPrefecture("神奈川県")?.slug).toBe("tokyobay-yokohama");
    expect(weeklyAreaForPrefecture("北海道")?.slug).toBe("otaru-ishikari");
    expect(weeklyAreaForPrefecture("千葉県")).toBeNull(); // 房総は主要10エリア外
    expect(weeklyAreaForPrefecture(undefined)).toBeNull();
  });
});

describe("buildChoukaReplyText", () => {
  it("上位エリアと /chouka リンクを含む", () => {
    const text = buildChoukaReplyText([row("tokyo", 3), row("osaka", 2, "タチウオ", { size: "—" })]);
    expect(text).toContain("🔥🔥🔥 tokyoエリア");
    expect(text).toContain("アジ 20cm（tokyoの堤防）");
    expect(text).toContain("タチウオ（osakaの堤防）");
    expect(text).toContain(CHOUKA_URL);
    expect(text).not.toContain("/blog");
    expect(text).toContain("都道府県名を送ると");
  });

  it("マイエリアを先頭に出し、全国枠からは除く", () => {
    const text = buildChoukaReplyText([row("tokyo", 1, "カサゴ"), row("osaka", 3)], { slug: "tokyo", label: "東京湾・横浜" });
    expect(text.indexOf("📍 マイエリア（東京湾・横浜）")).toBeLessThan(text.indexOf("全国の好調エリア"));
    expect(text).toContain("カサゴ 20cm（tokyoの堤防）");
    expect(text).not.toContain("tokyoエリア");
    expect(text).not.toContain("都道府県名を送ると");
  });

  it("マイエリアに報告が無いときは全国だけ", () => {
    const text = buildChoukaReplyText([row("osaka", 3)], { slug: "tokyo", label: "東京湾・横浜" });
    expect(text).not.toContain("マイエリア");
    expect(text).toContain("今週の好調エリア");
  });

  it("週報が取れないときも /chouka を返す", () => {
    expect(buildChoukaReplyText([])).toContain(CHOUKA_URL);
  });
});

describe("findFishInText", () => {
  it("名前・別名・最長一致で魚を特定する", () => {
    expect(findFishInText("アジ", FISH)?.slug).toBe("aji");
    expect(findFishInText("鯵釣れてる？", FISH)?.slug).toBe("aji");
    expect(findFishInText("シマアジ", FISH)?.slug).toBe("shimaaji");
    expect(findFishInText("太刀魚どこ", FISH)?.slug).toBe("tachiuo");
  });
  it("1文字の名前・長文・無関係な語は拾わない", () => {
    expect(findFishInText("エサ", FISH)).toBeNull();
    expect(findFishInText("初心者", FISH)).toBeNull();
    expect(findFishInText("週末に家族でアジ釣りに行きたいのですがどこがおすすめですか", FISH)).toBeNull();
  });
});

describe("buildFishReplyText", () => {
  const aji = FISH[0];
  it("その魚の行だけ、マイエリア優先→好調度順で /chouka/fish へ", () => {
    const text = buildFishReplyText(
      aji,
      [row("osaka", 3), row("tokyo", 1), row("kobe", 2, "タチウオ"), row("sendai", 2, "マアジ（豆）")],
      { slug: "tokyo", label: "東京湾・横浜" },
    );
    expect(text).toContain("アジが今釣れている場所");
    expect(text.indexOf("📍 tokyoエリア")).toBeLessThan(text.indexOf("osakaエリア"));
    expect(text).toContain("sendaiエリア");
    expect(text).not.toContain("kobe");
    expect(text).toContain("https://tsurispot.com/chouka/fish/aji?");
  });
  it("報告が無ければ魚の解説ページと /chouka", () => {
    const text = buildFishReplyText(aji, [row("osaka", 3, "タチウオ")]);
    expect(text).toContain("報告はありませんでした");
    expect(text).toContain("https://tsurispot.com/fish/aji?");
    expect(text).toContain(CHOUKA_URL);
  });
});
