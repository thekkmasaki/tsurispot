import { describe, expect, it } from "vitest";
import {
  buildSpotCatchSummary,
  pickNearbyRecentCatches,
  splitFishNames,
  type SpotWeeklyCatchRow,
} from "@/lib/spot-catch-summary";
import { buildSpotTitle, TITLE_MAX } from "@/lib/utils/seo";
import { buildSpotMetaDescription } from "@/lib/seo/meta-description";
import { haversineKm } from "@/lib/geo/distance";

const NOW = new Date("2026-11-15T12:00:00+09:00");

const row = (publishedAt: string, fish: string): SpotWeeklyCatchRow => ({
  publishedAt,
  fish,
  size: "",
  method: "",
  heat: 1,
  articleHref: "/blog/x",
  areaSlug: "tokyobay-yokohama",
  areaLabel: "東京湾・横浜",
  spotLabel: "本牧",
});

describe("splitFishNames", () => {
  it("自由記述・括弧・区切りを処理する", () => {
    expect(splitFishNames("タチウオ・カマス・アジ")).toEqual(["タチウオ", "カマス", "アジ"]);
    expect(splitFishNames("尺アジ　サバ")).toEqual(["尺アジ", "サバ"]);
    expect(splitFishNames("豆アジ（15cm）")).toEqual(["豆アジ"]);
    expect(splitFishNames("アジやガシラ")).toEqual(["アジ", "ガシラ"]);
  });
});

describe("buildSpotCatchSummary", () => {
  it("実データが無ければ null（文言を出さない）", () => {
    expect(buildSpotCatchSummary({ ugc: [], weekly: [] }, NOW)).toBeNull();
  });

  it("サンプル(cr-*)・未承認・古い・未来日は数えない", () => {
    const s = buildSpotCatchSummary(
      {
        ugc: [
          { id: "cr-001", date: "2026-11-10", fishName: "アジ", approved: true },
          { id: "ugc-1", date: "2026-11-10", fishName: "アジ", approved: false },
          { id: "ugc-2", date: "2026-09-01", fishName: "サバ", approved: true },
          { id: "ugc-3", date: "2026-12-01", fishName: "サバ", approved: true },
        ],
        weekly: [row("2026-09-01", "タチウオ")],
      },
      NOW,
    );
    expect(s).toBeNull();
  });

  it("UGC と週報を合算し、最新日・件数・魚（新しい順）を返す", () => {
    const s = buildSpotCatchSummary(
      {
        ugc: [{ id: "ugc-1", date: "2026-11-12", fishName: "アナゴ", approved: true }],
        weekly: [row("2026-11-10", "アジ"), row("2026-11-10", "タチウオ"), row("2026-11-03", "クロダイ")],
      },
      NOW,
    );
    expect(s).toEqual({
      latestDate: "2026-11-12",
      count: 4,
      fishNames: ["アナゴ", "アジ", "タチウオ"],
      ugcCount: 1,
      weeklyCount: 3,
    });
  });
});

describe("buildSpotTitle（最新釣果あり）", () => {
  const spot = { name: "本牧海づり施設", catchableFish: [{ fish: { name: "アジ" }, method: "サビキ釣り" }] };
  it("日付・件数・魚を含む", () => {
    expect(buildSpotTitle(spot, { latestDate: "2026-11-10", count: 3, fishNames: ["アジ", "タチウオ"] })).toBe(
      "本牧海づり施設の最新釣果【11/10・3件】アジ・タチウオ｜釣り情報",
    );
  });
  it("釣果が無ければ従来 title", () => {
    expect(buildSpotTitle(spot, null)).toContain("本牧海づり施設の釣果・釣り情報");
  });
  it("長い名前でも上限内に収める", () => {
    const long = { ...spot, name: "とても長い名前の釣り場とても長い名前の釣り場とても長い名前の釣り場" };
    const t = buildSpotTitle(long, { latestDate: "2026-11-10", count: 12, fishNames: ["アジ", "タチウオ"] });
    expect(t.length).toBeLessThanOrEqual(TITLE_MAX);
  });
});

describe("buildSpotMetaDescription（最新釣果あり）", () => {
  it("先頭に最新釣果の文を置く", () => {
    const d = buildSpotMetaDescription(
      {
        name: "本牧海づり施設",
        description: "横浜の海釣り施設。",
        region: { prefecture: "神奈川県", areaName: "横浜" },
        catchableFish: [{ fish: { name: "アジ" }, method: "サビキ釣り" }],
      },
      { latestCatch: { latestDate: "2026-11-10", count: 3, fishNames: ["アジ", "タチウオ"] } },
    );
    expect(d.startsWith("本牧海づり施設の最新釣果は11月10日（直近3件）、アジ・タチウオが釣れました。")).toBe(true);
    expect(d.length).toBeLessThanOrEqual(158);
  });
});

describe("pickNearbyRecentCatches", () => {
  it("自分を除き、距離内・新鮮なものを近い順に返す", () => {
    const coords: Record<string, { name: string; latitude: number; longitude: number }> = {
      near: { name: "近い", latitude: 35.61, longitude: 140.01 },
      far: { name: "遠い", latitude: 34.0, longitude: 135.0 },
      stale: { name: "古い", latitude: 35.6, longitude: 140.0 },
    };
    const out = pickNearbyRecentCatches(
      { slug: "self", latitude: 35.6, longitude: 140.0 },
      {
        self: [row("2026-11-10", "アジ")],
        near: [row("2026-11-10", "アジ")],
        far: [row("2026-11-10", "アジ")],
        stale: [row("2026-09-10", "アジ")],
        missing: [row("2026-11-10", "アジ")],
      },
      (s) => coords[s],
      haversineKm,
      { now: NOW },
    );
    expect(out.map((o) => o.slug)).toEqual(["near"]);
  });
});
