import { describe, it, expect } from "vitest";
import { fishingSpots, getSpotBySlug } from "@/lib/data/spots";
import overrides from "@/lib/data/generated/spot-region-overrides.json";

/**
 * 県・エリア・住所の補正表（2026-11 監査）の回帰テスト。
 * 千葉のスポットが東京都、富山のスポットが新潟県、函館が「稚内・宗谷」と表示されていた。
 * 住所と県の食い違いが増えないことは spot-legality.test.ts が見ている。
 */
describe("spot-region-overrides", () => {
  it("補正表のslugはすべて公開中のスポット", () => {
    const live = new Set(fishingSpots.map((s) => s.slug));
    for (const slug of Object.keys(overrides)) {
      expect(live.has(slug), slug).toBe(true);
    }
  });

  it("監査で指摘された県の誤りが直っている", () => {
    const cases: [string, string][] = [
      ["tateyama-ko6", "千葉県"],
      ["kurobe-gyoko", "富山県"],
      ["okutama-ko6", "東京都"],
      ["mukogawa-ichimonji-k8", "兵庫県"],
    ];
    for (const [slug, prefecture] of cases) {
      expect(getSpotBySlug(slug)?.region.prefecture, slug).toBe(prefecture);
    }
  });

  it("監査で指摘されたエリアの誤りが直っている", () => {
    const hakodate = fishingSpots.find((s) => s.name === "函館港緑の島");
    expect(hakodate?.region.areaName).not.toBe("稚内・宗谷");
    const shimizu = getSpotBySlug("shimizu-port");
    expect(shimizu?.region.areaName).not.toBe("伊豆・熱海");
  });
});
