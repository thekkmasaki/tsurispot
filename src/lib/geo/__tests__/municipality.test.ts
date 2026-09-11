import { describe, it, expect } from "vitest";
import { extractMunicipality } from "../municipality";

/**
 * 住所→市区町村抽出の回帰テスト。エリアページを市区町村単位で束ねる土台
 * （area-groups.ts）が依存するため、抽出の代表ケースを固定する。
 */
describe("extractMunicipality", () => {
  const cases: [string, string, string | null][] = [
    ["〒626-0424 京都府伊根町亀島450", "京都府", "伊根町"],
    ["京都府与謝郡伊根町本庄浜", "京都府", "伊根町"], // 郡は基礎自治体でないため除去
    ["神奈川県横浜市中区本牧", "神奈川県", "横浜市"], // 政令市は市単位に統合
    ["東京都江東区若洲", "東京都", "江東区"], // 東京23区は区が基礎自治体
    ["岐阜県郡上市八幡町", "岐阜県", "郡上市"], // 「郡」で始まる市名を郡と誤除去しない
    ["大阪府大阪市住之江区南港南", "大阪府", "大阪市"],
    ["宮城県石巻市北上町", "宮城県", "石巻市"],
    ["大阪湾・武庫川河口沖", "大阪府", null], // 市区町村を含まない非住所
  ];
  it.each(cases)("%s → %s", (address, prefecture, expected) => {
    expect(extractMunicipality(address, prefecture)).toBe(expected);
  });
});
