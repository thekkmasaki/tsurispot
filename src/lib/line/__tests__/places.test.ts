import { describe, expect, it } from "vitest";
import { MAX_PLACES, addPlace, buildPlacesFlex, parsePlacesCommand, placeLabelFromAddress, type SavedPlace } from "@/lib/line/places";
import { buildFishFlex, selectFishRows } from "@/lib/line/chouka-reply";
import type { LatestWeeklyCatch } from "@/lib/data/weekly-report-latest";

const fushimi = { lat: 34.94, lng: 135.77, label: "京都市" };
const yokohama = { lat: 35.45, lng: 139.63, label: "横浜市" };

describe("登録した場所", () => {
  it("近い場所（10km以内）は更新、離れていれば追加、4か所目は一番古いものと入れ替え", () => {
    let r = addPlace([], fushimi, 1);
    expect(r.list).toHaveLength(1);
    r = addPlace(r.list, { lat: 34.95, lng: 135.76, label: "京都市" }, 2);
    expect(r.updated).toBe(true);
    expect(r.list).toHaveLength(1);
    r = addPlace(r.list, yokohama, 3);
    r = addPlace(r.list, { lat: 33.59, lng: 130.4, label: "福岡市" }, 4);
    expect(r.list).toHaveLength(MAX_PLACES);
    r = addPlace(r.list, { lat: 43.06, lng: 141.35, label: "札幌市" }, 5);
    expect(r.list).toHaveLength(MAX_PLACES);
    expect(r.dropped?.label).toBe("京都市");
  });

  it("位置は約1kmに丸めて保存", () => {
    expect(addPlace([], { lat: 34.94567, lng: 135.77123 }).list[0]).toMatchObject({ lat: 34.95, lng: 135.77 });
  });

  it("住所から市区町村名", () => {
    expect(placeLabelFromAddress("日本、〒612-8083 京都府京都市伏見区京町３丁目１８３")).toBe("京都市");
    expect(placeLabelFromAddress("日本、〒100-0001 東京都千代田区千代田１")).toBe("千代田区");
    expect(placeLabelFromAddress("日本、〒231-0023 神奈川県横浜市中区山下町")).toBe("横浜市");
    expect(placeLabelFromAddress(undefined, "京都府")).toBe("京都府");
  });

  it("コマンド", () => {
    expect(parsePlacesCommand("登録地")).toEqual({ type: "list" });
    expect(parsePlacesCommand("場所2を消す")).toEqual({ type: "delete", index: 1 });
    expect(parsePlacesCommand("場所２を消す")).toEqual({ type: "delete", index: 1 });
    expect(parsePlacesCommand("場所をすべて消す")).toEqual({ type: "clear" });
    expect(parsePlacesCommand("スポット")).toBeNull();
  });

  it("一覧カード: 削除ボタンと位置情報ボタン（LINEの上限内）", () => {
    const list: SavedPlace[] = [{ ...fushimi, at: Date.UTC(2026, 10, 14) }, { ...yokohama, at: Date.UTC(2026, 10, 15) }];
    const f = buildPlacesFlex(list);
    expect(f.quickReply).toEqual(["場所1を消す", "場所2を消す", "場所をすべて消す", "釣果"]);
    expect(f.askLocation).toBeTruthy();
    expect(JSON.stringify(f.contents)).toContain("京都市");
    expect(buildPlacesFlex([]).altText).toContain("まだありません");
  });
});

describe("複数の場所で絞る", () => {
  const row = (areaSlug: string, heat = 2): LatestWeeklyCatch => ({
    spot: `${areaSlug}の堤防`, spotHref: null, fish: "タチウオ", size: "指3本", method: "テンヤ", heat,
    areaSlug, areaLabel: areaSlug, articleHref: "/blog/x", publishedAt: "2026-11-12",
  });
  const rows = [row("tokyobay-yokohama"), row("osaka-sennan"), row("fukuoka-kitakyushu")];
  const tachiuo = { slug: "tachiuo", name: "タチウオ" };

  it("どれかの場所から範囲内なら出す（京都＋横浜 → 大阪湾と東京湾、福岡は出ない）", () => {
    expect(selectFishRows(tachiuo, rows, null, [fushimi, yokohama]).map((r) => r.areaSlug).sort()).toEqual(["osaka-sennan", "tokyobay-yokohama"]);
  });

  it("複数登録なら、どの場所から何kmかを出す", () => {
    const s = JSON.stringify(buildFishFlex(tachiuo, rows, null, [fushimi, yokohama]).contents);
    expect(s).toMatch(/osaka-sennan（京都市から約\d+km）/);
    expect(s).toMatch(/tokyobay-yokohama（横浜市から約\d+km）/);
    expect(s).toContain("登録した2か所のどこかから");
  });
});
