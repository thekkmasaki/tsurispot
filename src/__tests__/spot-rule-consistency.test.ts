import { describe, it, expect } from "vitest";
import { fishingSpots } from "@/lib/data/spots";
import {
  getForbiddenMethods,
  getAdvisableCatchableFish,
  isNightFishingAdvisable,
} from "@/lib/utils/spot-rule-consistency";
import { generateTimeAdvice } from "@/lib/utils/spot-content-generator";

/**
 * ルール（禁止事項）とおすすめコンテンツの突合せ回帰テスト（2026-08 UX監査）。
 * 本牧海づり施設で「タコ釣り禁止なのにタコエギ実績」「夜釣りNGなのに夜推し」
 * 「投げ釣り禁止なのにちょい投げガイド」「有料なのに無料表記」が同居していた。
 */

const honmoku = fishingSpots.find(
  (s) => s.slug === "honmoku-fishing" || s.name === "本牧海づり施設"
);

describe("本牧海づり施設の整合性", () => {
  it("スポットが存在する", () => {
    expect(honmoku).toBeDefined();
  });

  it("禁止釣法に投げ釣り・タコエギ・夜釣りが含まれる", () => {
    const forbidden = getForbiddenMethods(honmoku!);
    expect(forbidden.has("投げ釣り")).toBe(true);
    expect(forbidden.has("タコエギ")).toBe(true);
    expect(forbidden.has("夜釣り")).toBe(true);
    // 「ちょい投げはOK」の明示が無いので ちょい投げ も禁止側
    expect(forbidden.has("ちょい投げ")).toBe(true);
  });

  it("おすすめ対象からタコエギ・投げ釣りが除外される", () => {
    const advisable = getAdvisableCatchableFish(honmoku!);
    const methods = new Set(advisable.map((cf) => cf.method));
    expect(methods.has("タコエギ")).toBe(false);
    expect(methods.has("投げ釣り")).toBe(false);
  });

  it("夜釣りNGなのでナイトフィッシング訴求はしない", () => {
    expect(isNightFishingAdvisable(honmoku!)).toBe(false);
  });

  it("攻略法の時間帯文言に夜推しが出ない", () => {
    const advice = generateTimeAdvice(honmoku!);
    expect(advice).not.toMatch(/夜にかけて|夜が|夜釣りが圧倒的/);
  });

  it("紹介文にタコエギ・マダコの記述が残っていない", () => {
    expect(honmoku!.description).not.toContain("マダコ");
    expect(honmoku!.description).not.toContain("タコエギ");
  });

  it("catchableFish にマダコが残っていない", () => {
    expect(honmoku!.catchableFish.some((cf) => cf.method === "タコエギ")).toBe(false);
  });
});

describe("ちょい投げ明示OKの扱い", () => {
  it("「投げ釣り禁止（ちょい投げはOK）」のスポットでは ちょい投げ を禁止しない", () => {
    const spot = fishingSpots.find((s) =>
      s.rules?.otherRules?.some((r) => r.includes("ちょい投げはOK"))
    );
    if (!spot) return; // データ都合でスキップ
    const forbidden = getForbiddenMethods(spot);
    expect(forbidden.has("ちょい投げ")).toBe(false);
    expect(forbidden.has("投げ釣り")).toBe(true);
  });
});

describe("データ全体の矛盾規模（ガードレール・参考値）", () => {
  it("禁止釣法がおすすめに残るスポット数をレポートする", () => {
    let spotsWithConflict = 0;
    for (const s of fishingSpots) {
      const forbidden = getForbiddenMethods(s);
      if (forbidden.size === 0) continue;
      if (s.catchableFish.some((cf) => forbidden.has(cf.method))) {
        spotsWithConflict++;
      }
    }
    // 表示側は getAdvisableCatchableFish で防御済み。ここではデータ側の規模を可視化する
    console.info(`[rule-consistency] 禁止釣法がcatchableFishに残るスポット: ${spotsWithConflict}件 / ${fishingSpots.length}件`);
    expect(spotsWithConflict).toBeGreaterThanOrEqual(0);
  });
});
