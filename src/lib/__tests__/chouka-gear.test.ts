import { describe, expect, it } from "vitest";
import { pickChoukaGear, splitMethods, tallyMethods } from "@/lib/chouka-gear";

describe("splitMethods", () => {
  it("区切り文字で分け、空や不明を除く", () => {
    expect(splitMethods("エギング・ヤエン")).toEqual(["エギング", "ヤエン"]);
    expect(splitMethods("ウキ釣り、カゴ釣り／サビキ")).toEqual(["ウキ釣り", "カゴ釣り", "サビキ"]);
    expect(splitMethods("—")).toEqual([]);
    expect(splitMethods("ルアー（ミノー）")).toEqual(["ルアー（ミノー）"]);
  });
});

describe("tallyMethods", () => {
  it("件数の多い順に集計し、1行内の重複は1件", () => {
    const rows = [{ method: "エギング・ヤエン" }, { method: "エギング" }, { method: "サビキ・サビキ" }];
    expect(tallyMethods(rows)).toEqual([
      { label: "エギング", count: 2 },
      { label: "ヤエン", count: 1 },
      { label: "サビキ", count: 1 },
    ]);
  });
});

describe("pickChoukaGear", () => {
  it("釣り方か魚種が一致した商品だけを返す（汎用品で埋めない）", () => {
    const picked = pickChoukaGear({ methods: ["エギング"], fishNames: ["アオリイカ"], month: 11 });
    expect(picked.length).toBeGreaterThan(0);
    expect(picked.length).toBeLessThanOrEqual(4);
    for (const p of picked) {
      const hit =
        p.methodKeywords.some((k) => "エギング".includes(k)) ||
        (p.fishKeywords ?? []).some((k) => "アオリイカ".includes(k) || k.includes("アオリイカ"));
      expect(hit).toBe(true);
    }
  });

  it("手がかりが無ければ空", () => {
    expect(pickChoukaGear({ methods: [], fishNames: [], month: 11 })).toEqual([]);
  });

  it("どの商品にも一致しない釣り方なら空", () => {
    expect(pickChoukaGear({ methods: ["ＸＸＸ"], fishNames: ["ＹＹＹ"], month: 11 })).toEqual([]);
  });
});
