import { describe, it, expect } from "vitest";
import { fishingSpots } from "../spots";
import { spotFacilityOverrides } from "../spot-facility-overrides";

describe("公式施設の掲載情報の上書き（spot-facility-overrides）", () => {
  const bySlug = new Map(fishingSpots.map((s) => [s.slug, s]));

  it("上書きはすべて公開中のスポットに効いている", () => {
    // 重複統合で負けた slug に書くと何も起きない（公式値への修正が黙って消える）ので検出する
    for (const [slug, o] of Object.entries(spotFacilityOverrides)) {
      const spot = bySlug.get(slug);
      expect(spot, `${slug}: 公開中のスポットに無い（統合後の slug を指定する）`).toBeDefined();
      if (o.feeDetail) expect(spot!.feeDetail).toBe(o.feeDetail);
      if (o.parkingDetail) expect(spot!.parkingDetail).toBe(o.parkingDetail);
      if (o.isFree !== undefined) expect(spot!.isFree).toBe(o.isFree);
    }
  });

  it("公式値で直した施設には、確認日と確認に使った公式ページがある", () => {
    for (const [slug, o] of Object.entries(spotFacilityOverrides)) {
      if (!o.managementInfo) continue;
      expect(o.managementInfo.verifiedAt, `${slug}: verifiedAt が無い`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(o.managementInfo.sourceUrl, `${slug}: sourceUrl が無い`).toMatch(/^https?:\/\//);
    }
  });

  it("上書きの rules を当てたスポットの rules は必須項目がそろっている", () => {
    for (const [slug, o] of Object.entries(spotFacilityOverrides)) {
      if (!o.rules) continue;
      const rules = bySlug.get(slug)?.rules;
      if (!rules) continue; // 必須項目がそろわない上書きは当てない仕様
      for (const key of ["castingAllowed", "lureAllowed", "chumAllowed", "fishingLicenseRequired"] as const) {
        expect(typeof rules[key], `${slug}: rules.${key}`).toBe("boolean");
      }
    }
  });

  it("有料施設の料金欄に「無料」とだけ書かれていない", () => {
    for (const [slug, o] of Object.entries(spotFacilityOverrides)) {
      if (o.isFree !== false || !o.feeDetail) continue;
      expect(o.feeDetail, `${slug}: 有料なのに料金欄が無料`).not.toMatch(/^(入園)?無料$/);
    }
  });
});
