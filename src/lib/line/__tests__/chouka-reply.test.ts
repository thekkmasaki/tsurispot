import { describe, expect, it } from "vitest";
import {
  buildChoukaReplyText,
  areaKm,
  nearestReachableArea,
  REACH_KM,
  selectChouka,
  selectFishRows,
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
    expect(text).toContain("都道府県名か位置情報を送ると");
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

import { buildChoukaFlex, buildFishFlex } from "../chouka-reply";

/** Flex の全 text 要素と button label を集める */
function walk(node: unknown, out: { texts: string[]; labels: string[] } = { texts: [], labels: [] }) {
  if (Array.isArray(node)) node.forEach((n) => walk(n, out));
  else if (node && typeof node === "object") {
    const o = node as Record<string, unknown>;
    if (o.type === "text") out.texts.push(String(o.text));
    if (o.type === "button") out.labels.push(String((o.action as Record<string, unknown>).label));
    Object.values(o).forEach((v) => walk(v, out));
  }
  return out;
}

describe("Flex（カード）", () => {
  const rows = [row("tokyo", 1, "カサゴ"), row("osaka", 3, "タチウオ（指3本）"), row("kobe", 2), row("sendai", 2, "アジ・サバ")];

  it("釣果カード: マイエリア→全国、空の text なし、ボタンは /chouka", () => {
    const f = buildChoukaFlex(rows, { slug: "tokyo", label: "東京湾・横浜" });
    const { texts, labels } = walk(f.contents);
    expect(texts.every((t) => t.trim().length > 0)).toBe(true);
    expect(texts.indexOf("📍 マイエリア　東京湾・横浜")).toBeLessThan(texts.indexOf("🗾 全国の好調エリア"));
    expect(labels).toEqual(["エリア別の最新釣果を見る"]);
    expect(JSON.stringify(f.contents)).toContain(CHOUKA_URL);
    expect(f.altText).toContain("tokyoエリア");
    expect(f.altText.length).toBeLessThanOrEqual(400);
  });

  it("候補ボタンは今週の報告が多い魚（20文字以内・最大4つ）", () => {
    const f = buildChoukaFlex(rows);
    expect(f.quickReply).toContain("タチウオ");
    expect(f.quickReply).toContain("アジ");
    expect(f.quickReply.length).toBeLessThanOrEqual(4);
    expect(f.quickReply.every((q) => q.length <= 20)).toBe(true);
  });

  it("魚カード: 該当行のみ・/chouka/fish へ、報告なしは解説ページ", () => {
    const aji = FISH[0];
    const f = buildFishFlex(aji, rows);
    expect(JSON.stringify(f.contents)).toContain("/chouka/fish/aji?");
    expect(walk(f.contents).texts).not.toContain("osakaエリア");
    expect(f.quickReply[0]).toBe("釣果");
    expect(f.quickReply).not.toContain("アジ");

    const none = buildFishFlex(FISH[2], [row("kobe", 2)]);
    expect(none.altText).toContain("報告はありませんでした");
    expect(JSON.stringify(none.contents)).toContain("/fish/tachiuo?");
  });

  it("週報が取れないときもカードを作れる", () => {
    const { texts } = walk(buildChoukaFlex([]).contents);
    expect(texts.every((t) => t.trim().length > 0)).toBe(true);
  });
});

describe("現在地から行ける範囲に絞る", () => {
  // 京都・伏見（ユーザーのスクショの例）
  const fushimi = { lat: 34.94, lng: 135.77 };
  const tachi = (area: string, heat: number) => row(area, heat, "タチウオ", { areaLabel: area });
  const rows = [
    tachi("tokyobay-yokohama", 3),
    tachi("nanki-shirahama", 3),
    tachi("osaka-sennan", 2),
    tachi("akashi-kobe", 1),
    tachi("chita-mikawa", 3),
  ];

  it("距離の目安", () => {
    expect(areaKm("osaka-sennan", fushimi)).toBeLessThan(REACH_KM);
    expect(areaKm("tokyobay-yokohama", fushimi)).toBeGreaterThan(REACH_KM);
    expect(areaKm("unknown", fushimi)).toBeNull();
  });

  it("魚名: 範囲内だけを近い順に（東京湾・南紀は出さない）", () => {
    const hits = selectFishRows(FISH[2], rows, null, fushimi);
    expect(hits.map((r) => r.areaSlug)).toEqual(["osaka-sennan", "akashi-kobe", "chita-mikawa"]);
    const s = JSON.stringify(buildFishFlex(FISH[2], rows, null, fushimi).contents);
    expect(s).toContain("120km以内");
    expect(s).toMatch(/osaka-sennan（約\d+km）/);
    expect(s).not.toContain("tokyobay-yokohama");
    expect(buildFishReplyText(FISH[2], rows, null, fushimi)).not.toContain("nanki-shirahama");
  });

  it("魚名: 範囲内に無ければそう言い、いちばん近い報告を添える", () => {
    const far = [tachi("tokyobay-yokohama", 3), tachi("nanki-shirahama", 2)];
    const s = JSON.stringify(buildFishFlex(FISH[2], far, null, fushimi).contents);
    expect(s).toContain("報告はありませんでした");
    expect(s).toContain("いちばん近い報告：nanki-shirahama");
  });

  it("現在地が無ければ従来どおり全国", () => {
    expect(selectFishRows(FISH[2], rows, null).length).toBe(5);
  });

  it("釣果: 好調エリアは範囲内だけ、範囲内のいちばん近いエリアをマイエリア扱いにできる", () => {
    const all = [row("tokyobay-yokohama", 3), row("osaka-sennan", 2), row("akashi-kobe", 1)];
    expect(selectChouka(all, null, fushimi).picks.map((r) => r.areaSlug)).toEqual(["osaka-sennan", "akashi-kobe"]);
    expect(nearestReachableArea(all, fushimi)?.slug).toBe("osaka-sennan");
    expect(buildChoukaReplyText(all, null, fushimi)).toContain("近くの好調エリア");
    // 範囲内に1つも無ければ全国に戻す
    expect(selectChouka([row("tokyobay-yokohama", 3)], null, fushimi).picks.length).toBe(1);
  });
});
