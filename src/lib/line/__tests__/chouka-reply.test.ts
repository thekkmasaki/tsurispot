import { describe, expect, it } from "vitest";
import { buildChoukaReplyText, CHOUKA_URL, pickLineHighlights } from "../chouka-reply";
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

describe("pickLineHighlights", () => {
  it("1エリア1行・好調度順に最大3エリア、好調度0は除外", () => {
    const picks = pickLineHighlights([
      row("a", 1), row("a", 3, "サバ"), row("b", 2), row("c", 0), row("d", 1), row("e", 2),
    ]);
    expect(picks.map((p) => [p.areaSlug, p.fish])).toEqual([["a", "サバ"], ["b", "アジ"], ["e", "アジ"]]);
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
  });

  it("週報が取れないときも /chouka を返す", () => {
    const text = buildChoukaReplyText([]);
    expect(text).toContain(CHOUKA_URL);
  });
});
