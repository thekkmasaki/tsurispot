import { describe, expect, it } from "vitest";
import { lineUrl } from "@/lib/line/line-url";
import { buildNearbyFlex, buildNearbyText, formatKm, nearestSpots, parseNearbyKind, type CoordSpot } from "@/lib/line/nearby-reply";
import {
  QUICK_PREFS,
  UNKNOWN_QUICK,
  buildHelpFlex,
  buildSpotsFlex,
  buildUnknownText,
  buildWelcomeFlex,
} from "@/lib/line/menu-reply";
import { prefectures } from "@/lib/data/prefectures";
import type { LineFlexReply } from "@/lib/line/chouka-reply";

const spots: CoordSpot[] = [
  { s: "a", n: "城ヶ島", la: 35.135, lo: 139.62, t: "rocky", p: "神奈川県", a: "三浦", f: true },
  { s: "b", n: "大黒海づり施設", la: 35.462, lo: 139.68, t: "pier", p: "神奈川県", a: "横浜" },
  { s: "c", n: "小樽港", la: 43.198, lo: 141.014, t: "port", p: "北海道", a: "小樽・石狩", f: true },
];

function withinLimits(f: LineFlexReply) {
  expect(new TextEncoder().encode(JSON.stringify(f.contents)).length).toBeLessThan(30_000);
  expect(f.quickReply.length + (f.askLocation ? 1 : 0)).toBeLessThanOrEqual(13);
  for (const [, l] of JSON.stringify(f.contents).matchAll(/"label":"([^"]*)"/g)) expect(l.length).toBeLessThanOrEqual(20);
}

describe("lineUrl", () => {
  it("全リンクに LINE の UTM を付ける", () => {
    expect(lineUrl("/map", "nearby")).toBe("https://tsurispot.com/map?utm_source=line&utm_medium=reply&utm_campaign=nearby");
    expect(lineUrl("/spots/x?a=1", "s")).toContain("a=1&utm_source=line");
  });
});

describe("近くの釣り場", () => {
  it("近い順に並べる", () => {
    const list = nearestSpots(spots, 35.14, 139.62, 2);
    expect(list.map((n) => n.spot.s)).toEqual(["a", "b"]);
    expect(list[0].km).toBeLessThan(1);
  });

  it("座標の壊れたスポットは除く", () => {
    expect(nearestSpots([...spots, { s: "x", n: "x", la: NaN, lo: 1, t: "port", p: "" }], 35, 139).some((n) => n.spot.s === "x")).toBe(false);
  });

  it("距離の表示", () => {
    expect(formatKm(0.42)).toBe("420m");
    expect(formatKm(3.21)).toBe("3.2km");
    expect(formatKm(48.6)).toBe("49km");
  });

  it("カードに釣り場・距離・UTM付きリンク", () => {
    const f = buildNearbyFlex(nearestSpots(spots, 35.14, 139.62), "📍 マイエリアを「神奈川」に登録しました");
    const s = JSON.stringify(f.contents);
    expect(s).toContain("城ヶ島");
    expect(s).toContain("utm_campaign=nearby");
    expect(s).toContain("マイエリアを「神奈川」");
    expect(f.altText).toMatch(/^近くの釣り場：城ヶ島/);
    withinLimits(f);
    expect(buildNearbyText(nearestSpots(spots, 35.14, 139.62))).toContain("1. 城ヶ島");
  });

  it("近くに無いとき（50km超）はそう伝える", () => {
    expect(JSON.stringify(buildNearbyFlex(nearestSpots(spots, 26.2, 127.7)).contents)).toContain("見つかりませんでした");
  });

  it("スポットが取れなかったときも壊れない", () => {
    withinLimits(buildNearbyFlex([]));
  });
});

describe("案内の返信", () => {
  it("あいさつ: 位置情報ボタン＋都道府県ボタン（実在の都道府県名のみ）", () => {
    const f = buildWelcomeFlex();
    expect(f.askLocation).toBeTruthy();
    expect(f.quickReply).toEqual(QUICK_PREFS);
    for (const p of QUICK_PREFS) expect(prefectures.some((x) => x.nameShort === p), p).toBe(true);
    withinLimits(f);
  });

  it("使い方: マイエリアの有無で一言が変わる", () => {
    expect(JSON.stringify(buildHelpFlex("神奈川").contents)).toContain("マイエリア：神奈川");
    expect(JSON.stringify(buildHelpFlex(null).contents)).toContain("マイエリアを登録できます");
    withinLimits(buildHelpFlex("神奈川"));
  });

  it("釣り場を探す: 位置情報ボタン、マイエリアがあればその県のリンク", () => {
    const f = buildSpotsFlex({ slug: "kanagawa", nameShort: "神奈川" });
    expect(f.askLocation).toBeTruthy();
    expect(JSON.stringify(f.contents)).toContain("/prefecture/kanagawa?utm_source=line");
    withinLimits(f);
  });

  it("分からない言葉: 短く返す（長い文は省略）", () => {
    expect(buildUnknownText("ありがとう")).toContain("「ありがとう」");
    expect(buildUnknownText("あ".repeat(40))).toContain("…");
    expect(buildUnknownText("ありがとう").length).toBeLessThan(100);
    expect(UNKNOWN_QUICK).toContain("使い方");
  });
});

describe("海・川湖の絞り込み", () => {
  const mixed: CoordSpot[] = [
    { s: "r", n: "宇治川", la: 34.89, lo: 135.8, t: "river", p: "京都府" },
    { s: "l", n: "琵琶湖", la: 35.0, lo: 135.87, t: "lake", p: "滋賀県" },
    { s: "m", n: "舞鶴港", la: 35.47, lo: 135.38, t: "port", p: "京都府" },
    { s: "o", n: "大阪南港", la: 34.62, lo: 135.42, t: "breakwater", p: "大阪府" },
  ];

  it("コマンド", () => {
    expect(parseNearbyKind("海だけ")).toBe("sea");
    expect(parseNearbyKind("川・湖だけ")).toBe("fresh");
    expect(parseNearbyKind("川")).toBe("fresh");
    expect(parseNearbyKind("海も川も")).toBe("all");
    expect(parseNearbyKind("海釣り公園")).toBeNull();
  });

  it("海だけ・川湖だけで絞る", () => {
    expect(nearestSpots(mixed, 34.94, 135.77, 5, "sea").map((n) => n.spot.s)).toEqual(["o", "m"]);
    expect(nearestSpots(mixed, 34.94, 135.77, 5, "fresh").map((n) => n.spot.s)).toEqual(["r", "l"]);
    expect(nearestSpots(mixed, 34.94, 135.77).length).toBe(4);
  });

  it("カードに切り替えボタン（今の絞り込み以外）", () => {
    const all = buildNearbyFlex(nearestSpots(mixed, 34.94, 135.77));
    expect(all.quickReply.slice(0, 2)).toEqual(["海だけ", "川・湖だけ"]);
    const sea = buildNearbyFlex(nearestSpots(mixed, 34.94, 135.77, 5, "sea"), undefined, "sea");
    expect(sea.quickReply.slice(0, 2)).toEqual(["海も川も", "川・湖だけ"]);
    expect(JSON.stringify(sea.contents)).toContain("海の釣り場だけ");
    withinLimits(sea);
  });
});
