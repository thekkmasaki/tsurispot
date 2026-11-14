import { describe, expect, it } from "vitest";
import { affiliateProducts } from "@/lib/data/affiliate-products";
import { GEAR_METHODS, buildGearFlex, buildGearMenuFlex, buildGearReplyText, findGearMethod } from "@/lib/line/gear-reply";

const ids = new Set(affiliateProducts.map((p) => p.id));

describe("LINE 道具の返信", () => {
  it("どの釣り方の商品も affiliate-products に実在する", () => {
    for (const m of GEAR_METHODS) for (const [id] of m.items) expect(ids.has(id), `${m.name}: ${id}`).toBe(true);
  });

  it("専用でない竿を載せない（汎用ロッドは使わない・エギングだけ専用ロッド）", () => {
    for (const m of GEAR_METHODS) {
      const rodIds = m.items.map(([id]) => id).filter((id) => /rod-shimano/.test(id));
      expect(rodIds, m.name).toEqual([]);
    }
    expect(GEAR_METHODS.find((m) => m.key === "エギング")!.items.map(([id]) => id)).toContain("af-eging-rod");
  });

  it("釣り方ごとに商品の組み合わせが違う（以前は全部同じ竿・リール）", () => {
    const sets = GEAR_METHODS.map((m) => m.items.map(([id]) => id).sort().join(","));
    expect(new Set(sets).size).toBe(sets.length);
  });

  it("「サビキの道具」「カゴ釣りの道具」「ジギングの道具」を見分ける", () => {
    expect(findGearMethod("サビキの道具")?.name).toBe("サビキ釣り");
    expect(findGearMethod("カゴ釣りの道具")?.name).toBe("遠投カゴ釣り");
    expect(findGearMethod("ジギングの道具")?.name).toBe("ショアジギング");
    expect(findGearMethod("道具")).toBeNull();
  });

  it("PR 表記がカード・代替テキストの両方にある", () => {
    for (const m of GEAR_METHODS) {
      const f = buildGearFlex(m);
      expect(f.altText).toMatch(/^【PR】/);
      expect(JSON.stringify(f.contents)).toContain("アフィリエイト広告を利用しています");
      expect(buildGearReplyText(m)).toMatch(/^【PR】[\s\S]*アフィリエイト広告/);
    }
  });

  it("LINE の制限内（バブル30KB・ラベル20字・クイックリプライ13個）", () => {
    for (const f of [...GEAR_METHODS.map(buildGearFlex), buildGearMenuFlex()]) {
      expect(new TextEncoder().encode(JSON.stringify(f.contents)).length).toBeLessThan(30_000);
      expect(f.quickReply.length).toBeLessThanOrEqual(13);
      const labels = [...JSON.stringify(f.contents).matchAll(/"label":"([^"]*)"/g)].map((x) => x[1]);
      for (const l of labels) expect(l.length).toBeLessThanOrEqual(20);
    }
  });

  it("釣り方の選択カードは全釣り方を「◯◯の道具」で送る", () => {
    const s = JSON.stringify(buildGearMenuFlex().contents);
    for (const m of GEAR_METHODS) {
      expect(s).toContain(`"text":"${m.key}の道具"`);
      expect(findGearMethod(`${m.key}の道具`)?.key).toBe(m.key);
    }
  });
});
