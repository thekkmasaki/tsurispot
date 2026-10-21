import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  getHighValuePrefMonthFishCombos,
  getEligiblePrefMonthFishCombos,
  getIndexablePrefMonthFishCombos,
  getEligiblePrefFishCombos,
  getSpotsByPrefectureAndFish,
  isDemandPrefMonthFish,
  explainPrefMonthFishDemand,
  resolveFishSlugsByName,
  UNAGI_SUMMER_MONTH_SLUGS,
  MATRIX_DEMAND_RULE,
} from "@/lib/data";
import { fishMetadata } from "@/lib/data/fish-metadata";
import { fishSpecies } from "@/lib/data/fish";
import { monthlyGuides } from "@/lib/data/monthly-guides";
import { prefectureInfoList } from "@/lib/data/prefecture-info";
import { prefectures } from "@/lib/data/prefectures";
import { fishingSpots } from "@/lib/data/spots";
import { MONTHS, isMonthInRange } from "@/lib/data/fishing-methods";
import { isFishListedAtSpot } from "@/lib/data/fish-aptitude";

/**
 * マトリクス（県×月×魚種）の index 方針を保証する。
 *
 * 3 セット:
 *  - 事前生成(SSG)セット = getHighValuePrefMonthFishCombos()（厳選）。SSG枚数=Dockerイメージ容量
 *    なので数百規模に抑える（コンテナ起動不能の再発防止）。
 *  - 配信セット = getEligiblePrefMonthFishCombos()（count>=2 の配信される全ページ。301 されない）。
 *  - index/sitemap セット = getIndexablePrefMonthFishCombos()（配信 ∧ 需要あり isDemandPrefMonthFish）。
 *    需要ゼロの組合せ（マイナー淡水魚等）は配信はするが noindex,follow・sitemap 非掲載・内部リンク対象外。
 *  - SSG ⊂ index ⊂ 配信（事前生成したページは必ず index される）。
 */

// matrix ページ page.tsx の MIN_SPOTS と一致させること。
const MIN_SPOTS = 2;

describe("事前生成(SSG)セット = 高価値組合せ（容量ガード）", () => {
  const ssg = getHighValuePrefMonthFishCombos();

  it("数百規模に収まる（SSG枚数=イメージ容量の暴走を防ぐ）", () => {
    console.log(`[matrix SSG] 事前生成対象 = ${ssg.length} 件`);
    expect(ssg.length).toBeGreaterThan(100);
    expect(ssg.length).toBeLessThan(1500);
  });

  it("全組合せがスポット数・人気魚種の基準を満たす（事前生成の品質保証）", () => {
    for (const c of ssg) {
      expect(c.count).toBeGreaterThanOrEqual(5);
      const rank = fishMetadata[c.fishSlug]?.popularity;
      expect(rank, `fish ${c.fishSlug} の popularity 未定義`).toBeDefined();
      expect(rank!).toBeLessThanOrEqual(30);
    }
  });

  it("同じ県×魚種が多数の月で乱立しない（旬の月に集約）", () => {
    const perPrefFish = new Map<string, number>();
    for (const c of ssg) {
      const key = `${c.prefSlug}/${c.fishSlug}`;
      perPrefFish.set(key, (perPrefFish.get(key) || 0) + 1);
    }
    const maxMonths = Math.max(...perPrefFish.values());
    expect(maxMonths).toBeLessThanOrEqual(4);
  });

  it("決定的（呼び出しごとに件数が変わらない）", () => {
    expect(getHighValuePrefMonthFishCombos().length).toBe(ssg.length);
  });
});

describe("配信セット = count>=MIN_SPOTS の全組合せ（301 されない母集団）", () => {
  const eligible = getEligiblePrefMonthFishCombos();

  it("広いセットである（index 判定の母集団が高価値の数百件に誤接続していない）", () => {
    console.log(`[matrix eligible] 配信対象 = ${eligible.length} 件`);
    // 厳選セット(<1500)ではなく、ロングテール全件(数千)であることを担保。
    expect(eligible.length).toBeGreaterThan(1500);
  });

  it("全組合せが count>=MIN_SPOTS（301される薄い組合せを含まない＝品質下限）", () => {
    for (const c of eligible) {
      expect(c.count).toBeGreaterThanOrEqual(MIN_SPOTS);
    }
  });

  it("組合せに重複がない（同一URLの二重生成・二重掲載を防ぐ）", () => {
    const keys = eligible.map(
      (c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("matrix ページが実際にレンダリングする集合と完全一致する（配信セット = ページ本体の 301 判定）", () => {
    // matrix ページ本体のレンダ判定（getMatchingSpots(...).length >= MIN_SPOTS =
    // **ユニークスポット数**）と同一ロジックで期待集合を再導出し、ヘルパのドリフトを検出。
    // 旧実装は catchableFish 出現数で数えており、「sitemap 掲載なのにページは 301」の
    // 組合せ（GSC「送信された URL にリダイレクトがあります」）を構造的に生んでいた。
    const expected = new Set<string>();
    for (const pref of prefectures) {
      const prefSpots = fishingSpots.filter(
        (s) => s.region.prefecture === pref.name
      );
      for (const month of MONTHS) {
        const fishMap = new Map<string, number>();
        for (const spot of prefSpots) {
          const seen = new Set<string>();
          for (const cf of spot.catchableFish) {
            // ページ本体・combos集計と同じ釣れる度ゲート（fish-aptitude）を適用
            if (!isFishListedAtSpot(spot, cf.fish.slug)) continue;
            if (isMonthInRange(month.num, cf.monthStart, cf.monthEnd)) {
              seen.add(cf.fish.slug);
            }
          }
          for (const fSlug of seen) {
            fishMap.set(fSlug, (fishMap.get(fSlug) || 0) + 1);
          }
        }
        for (const [fSlug, count] of fishMap) {
          if (count >= MIN_SPOTS) {
            expected.add(`${pref.slug}/${month.slug}/${fSlug}`);
          }
        }
      }
    }
    const actual = new Set(
      eligible.map((c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`)
    );
    expect(actual.size).toBe(expected.size);
    for (const k of expected) expect(actual.has(k)).toBe(true);
  });

  it("全組合せがレンダ判定（ユニークスポット数>=MIN_SPOTS）を満たす＝sitemap掲載URLが301されない", () => {
    // matrix ページ本体は matchingSpots.length（ユニークスポット数）< MIN_SPOTS で
    // permanentRedirect する。eligible の count がユニークスポット数であることを
    // 実データで直接検証し、「sitemap 掲載 ∧ 301」の再発を防ぐ。
    for (const c of eligible) {
      const pref = prefectures.find((p) => p.slug === c.prefSlug)!;
      const month = MONTHS.find((m) => m.slug === c.monthSlug)!;
      const uniqueSpots = fishingSpots.filter(
        (s) =>
          s.region.prefecture === pref.name &&
          // matrix ページ本体のレンダ判定と同じゲート
          isFishListedAtSpot(s, c.fishSlug) &&
          s.catchableFish.some(
            (cf) =>
              cf.fish.slug === c.fishSlug &&
              isMonthInRange(month.num, cf.monthStart, cf.monthEnd)
          )
      ).length;
      expect(
        uniqueSpots,
        `${c.prefSlug}/${c.monthSlug}/${c.fishSlug} はユニークスポット${uniqueSpots}件で301対象なのにsitemap掲載`
      ).toBeGreaterThanOrEqual(MIN_SPOTS);
      expect(c.count).toBe(uniqueSpots);
    }
  });

  it("事前生成(SSG)セットは配信セットの部分集合（事前生成ページは 301 されない）", () => {
    const eligibleKeys = new Set(
      eligible.map((c) => `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`)
    );
    for (const c of getHighValuePrefMonthFishCombos()) {
      const key = `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`;
      expect(
        eligibleKeys.has(key),
        `SSG組合せ ${key} が index セットに含まれない`
      ).toBe(true);
    }
  });

  it("決定的（呼び出しごとに件数が変わらない）", () => {
    expect(getEligiblePrefMonthFishCombos().length).toBe(eligible.length);
  });
});

describe("県×魚種: sitemap 掲載としきい値 noindex の整合", () => {
  // prefecture/[slug]/fish/[fishSlug] の generateMetadata は
  // `index: getSpotsByPrefectureAndFish(...).length >= 3`（ユニークスポット数）。
  // sitemap 掲載ゲート getEligiblePrefFishCombos(3) が同じ基準であることを検証し、
  // 「sitemap 掲載なのに noindex」（GSC「送信された URL に noindex タグが追加されています」）
  // の再発を防ぐ。
  it("sitemap掲載の県×魚種は全てページ側で index される（ユニークスポット>=3）", () => {
    for (const c of getEligiblePrefFishCombos(3)) {
      const pref = prefectures.find((p) => p.slug === c.prefSlug)!;
      const uniqueSpots = getSpotsByPrefectureAndFish(pref.name, c.fishSlug).length;
      expect(
        uniqueSpots,
        `${c.prefSlug}/fish/${c.fishSlug} はユニークスポット${uniqueSpots}件でnoindexなのにsitemap掲載`
      ).toBeGreaterThanOrEqual(3);
      expect(c.count).toBe(uniqueSpots);
    }
  });
});

// =============================================================================
// 需要ベース index（isDemandPrefMonthFish）: robots・sitemap・内部リンクの単一ソース
// =============================================================================

const comboKey = (c: { prefSlug: string; monthSlug: string; fishSlug: string }) =>
  `${c.prefSlug}/${c.monthSlug}/${c.fishSlug}`;

describe("index/sitemap セット = 配信 ∧ 需要あり（isDemandPrefMonthFish）", () => {
  const eligible = getEligiblePrefMonthFishCombos();
  const indexable = getIndexablePrefMonthFishCombos();
  const eligibleKeys = new Set(eligible.map(comboKey));
  const indexableKeys = new Set(indexable.map(comboKey));

  it("index セットは配信セットの部分集合で、需要判定と完全一致する（sitemap 掲載 URL = isDemand=true）", () => {
    console.log(
      `[matrix index] 配信 ${eligible.length} 件 → index/sitemap ${indexable.length} 件（noindex,follow ${eligible.length - indexable.length} 件）`
    );
    for (const c of indexable) {
      expect(eligibleKeys.has(comboKey(c)), `${comboKey(c)} は配信対象外なのに index`).toBe(true);
      expect(isDemandPrefMonthFish(c.prefSlug, c.monthSlug, c.fishSlug)).toBe(true);
    }
    // 逆方向: 配信 ∧ 需要あり は必ず index セットに居る（sitemap からの漏れ防止）
    for (const c of eligible) {
      const demand = isDemandPrefMonthFish(c.prefSlug, c.monthSlug, c.fishSlug);
      expect(indexableKeys.has(comboKey(c)), `${comboKey(c)} demand=${demand}`).toBe(demand);
    }
  });

  it("需要判定は実際に絞り込んでいる（全件 index でも絞り過ぎでもない）", () => {
    // 全件 index（判定が常に true）や極端な絞り過ぎ（判定が壊れて false 連発）を検出する。
    // GSC 12 週実測で需要は魚種横断に分散しており、損失 ≤2% を守ると noindex は配信の数%（約300件）が上限。
    // 絞り幅は MATRIX_DEMAND_RULE で決める。ここでは「少なくとも 100 件は noindex」「半分以上は index」だけ固定。
    expect(eligible.length - indexable.length).toBeGreaterThanOrEqual(100);
    expect(indexable.length).toBeGreaterThan(eligible.length * 0.5);
    expect(indexable.length).toBeGreaterThan(1500);
  });

  it("全組合せが count>=MIN_SPOTS で重複なし（sitemap 掲載 URL が 301 されない・二重掲載しない）", () => {
    for (const c of indexable) expect(c.count).toBeGreaterThanOrEqual(MIN_SPOTS);
    expect(indexableKeys.size).toBe(indexable.length);
  });

  it("事前生成(SSG)セットは index セットの部分集合（事前生成ページは必ず index される）", () => {
    for (const c of getHighValuePrefMonthFishCombos()) {
      expect(indexableKeys.has(comboKey(c)), `SSG組合せ ${comboKey(c)} が noindex`).toBe(true);
      expect(explainPrefMonthFishDemand(c.prefSlug, c.monthSlug, c.fishSlug)).toContain("ssg");
    }
  });

  it("決定的・メモ化（呼び出しごとに件数が変わらない）", () => {
    expect(getIndexablePrefMonthFishCombos().length).toBe(indexable.length);
    expect(getIndexablePrefMonthFishCombos()).toBe(indexable);
  });
});

describe("需要判定ルール（A topFish / B prefecture-info / C 海水人気 / C' 淡水人気 / D ウナギ夏）", () => {
  const eligible = getEligiblePrefMonthFishCombos();

  it("A: monthlyGuides.topFish の slug は全て実在する魚種（tara→madara 等の無効 slug を防ぐ）", () => {
    const slugs = new Set(fishSpecies.map((f) => f.slug));
    for (const g of monthlyGuides) {
      for (const s of g.topFish) {
        expect(slugs.has(s), `monthlyGuides[${g.slug}].topFish に無効 slug "${s}"`).toBe(true);
      }
    }
    expect(monthlyGuides.length).toBe(12);
  });

  it("A: その月の topFish は県を問わず需要あり（存在しない県 slug でも純ルールとして true）", () => {
    for (const g of monthlyGuides) {
      for (const s of g.topFish) {
        expect(explainPrefMonthFishDemand("__no_such_pref__", g.slug, s)).toContain("monthly-top-fish");
      }
    }
  });

  it("C/C': 海水・汽水魚は seaPopularityMax、淡水魚は freshwaterPopularityMax 以下なら県・月を問わず需要あり", () => {
    for (const f of fishSpecies) {
      const rank = fishMetadata[f.slug]?.popularity;
      const reasons = explainPrefMonthFishDemand("__no_such_pref__", "january", f.slug);
      const expectC =
        f.category !== "freshwater" && rank !== undefined && rank <= MATRIX_DEMAND_RULE.seaPopularityMax;
      const expectC2 =
        f.category === "freshwater" && rank !== undefined && rank <= MATRIX_DEMAND_RULE.freshwaterPopularityMax;
      expect(reasons.includes("sea-popular"), `${f.slug}(${f.category}, pop=${rank})`).toBe(expectC);
      expect(reasons.includes("freshwater-popular"), `${f.slug}(${f.category}, pop=${rank})`).toBe(expectC2);
    }
  });

  it("GSC 12週実測で需要が確認された淡水魚（ayu/blackbass/oikawa/yamame/nijimasu/herabuna/koi/tanago）は配信ページを 100% index 維持", () => {
    // 2026-07-24〜10-18: ayu 257clicks / oikawa 161 / yamame 122 / blackbass 110 / herabuna 110 / tanago 95 / koi 85
    for (const slug of ["ayu", "blackbass", "oikawa", "yamame", "nijimasu", "herabuna", "koi", "tanago"]) {
      const combos = eligible.filter((c) => c.fishSlug === slug);
      expect(combos.length, `${slug} の配信ページが無い`).toBeGreaterThan(0);
      const dropped = combos.filter((c) => !isDemandPrefMonthFish(c.prefSlug, c.monthSlug, c.fishSlug));
      expect(dropped.map(comboKey), `${slug} が noindex 化された`).toEqual([]);
    }
  });

  it("主要海水魚（aji/tachiuo/aoriika/kisu/madako/suzuki/kurodai）は配信ページを 100% index 維持", () => {
    for (const slug of ["aji", "tachiuo", "aoriika", "kisu", "madako", "suzuki", "kurodai"]) {
      const combos = eligible.filter((c) => c.fishSlug === slug);
      expect(combos.length, `${slug} の配信ページが無い`).toBeGreaterThan(0);
      const dropped = combos.filter((c) => !isDemandPrefMonthFish(c.prefSlug, c.monthSlug, c.fishSlug));
      expect(dropped.map(comboKey), `${slug} が noindex 化された`).toEqual([]);
    }
  });

  it("D: ウナギは 6〜8月（土用の丑）だけホワイトリストで需要あり", () => {
    expect([...UNAGI_SUMMER_MONTH_SLUGS]).toEqual(["june", "july", "august"]);
    for (const m of MONTHS) {
      const reasons = explainPrefMonthFishDemand("__no_such_pref__", m.slug, "unagi");
      expect(reasons.includes("unagi-summer"), m.slug).toBe(UNAGI_SUMMER_MONTH_SLUGS.includes(m.slug));
    }
    // 実データ: 配信されるウナギ夏ページは全て index される（救済が効いている）
    const unagiSummer = eligible.filter(
      (c) => c.fishSlug === "unagi" && UNAGI_SUMMER_MONTH_SLUGS.includes(c.monthSlug)
    );
    expect(unagiSummer.length).toBeGreaterThan(0);
    for (const c of unagiSummer) expect(isDemandPrefMonthFish(c.prefSlug, c.monthSlug, c.fishSlug)).toBe(true);
  });

  it("需要ゼロの組合せは理由なし＝noindex（海水の外道 × 無関係な県）", () => {
    // bora(海水 pop78)・kibire(pop81) は A/C/D いずれにも該当せず、存在しない県なら B も該当しない
    for (const slug of ["bora", "kibire"]) {
      expect(explainPrefMonthFishDemand("__no_such_pref__", "january", slug)).toEqual([]);
      expect(isDemandPrefMonthFish("__no_such_pref__", "january", slug)).toBe(false);
    }
    // 実データ: 需要ゼロ帯の配信ページが実際に noindex 化されている（判定が形骸化していない）
    const boraDropped = eligible.filter(
      (c) => c.fishSlug === "bora" && !isDemandPrefMonthFish(c.prefSlug, c.monthSlug, c.fishSlug)
    );
    expect(boraDropped.length).toBeGreaterThan(50);
  });

  it("B: prefecture-info の魚名は別名・総称でも解決される（kurosoi/blackbass 等の救済）", () => {
    expect(resolveFishSlugsByName("アジ")).toEqual(["aji"]);
    // 別名: ハマチ = ブリ(buri) / イナダ(inada) の両方
    expect(resolveFishSlugsByName("ハマチ")).toEqual(expect.arrayContaining(["buri", "inada"]));
    // 総称: 青物 → 青物ルアーの代表種
    expect(resolveFishSlugsByName("青物")).toEqual(expect.arrayContaining(["buri", "inada"]));
    // 魚種データに無い種は空（誤って別の魚に倒さない）
    expect(resolveFishSlugsByName("サケ")).toEqual([]);
    expect(resolveFishSlugsByName("")).toEqual([]);
    // 実データ: prefecture-info の popularFish に別名・総称で書かれた魚が、その県で
    // "pref-info-alias" として需要判定に乗っている（alias 対応が機能している）
    const fishNames = new Set(fishSpecies.map((f) => f.slug));
    const nameSet = new Set(fishSpecies.map((f) => f.name));
    let checked = 0;
    for (const info of prefectureInfoList) {
      for (const name of info.popularFish) {
        if (nameSet.has(name)) continue;
        for (const slug of resolveFishSlugsByName(name)) {
          expect(fishNames.has(slug), `${name} → ${slug} が存在しない`).toBe(true);
          expect(
            explainPrefMonthFishDemand(info.slug, "january", slug),
            `${info.slug} popularFish「${name}」→ ${slug}`
          ).toContain("pref-info-alias");
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(0);
  });
});

describe("ドリフト防止: robots・sitemap・内部リンクが需要判定関数で駆動されている（ソース検査）", () => {
  const read = (rel: string) => fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");

  it("matrix ページの robots は isDemandPrefMonthFish で index/noindex を切る（常時 index:true に戻さない）", () => {
    const src = read("src/app/prefecture/[slug]/[month]/[fishSlug]/page.tsx");
    expect(src).toMatch(/isDemandPrefMonthFish\(/);
    expect(src).toMatch(/robots:\s*\{\s*index:\s*indexable,\s*follow:\s*true\s*\}/);
    expect(src).not.toMatch(/robots:\s*\{\s*index:\s*true/);
  });

  it("sitemap の matrix 節は getIndexablePrefMonthFishCombos()（配信全件 getEligible... を直接使わない）", () => {
    const src = read("src/app/sitemap.ts");
    expect(src).toMatch(/getIndexablePrefMonthFishCombos\(\)/);
    expect(src).not.toMatch(/getEligiblePrefMonthFishCombos/);
  });

  it("matrix への内部リンク生成テンプレは全て需要判定を参照する", () => {
    const templates = [
      "src/app/fish/[slug]/page.tsx",
      "src/app/monthly/[month]/page.tsx",
      "src/app/prefecture/[slug]/[month]/page.tsx",
      "src/app/prefecture/[slug]/fish/[fishSlug]/page.tsx",
    ];
    for (const t of templates) {
      const src = read(t);
      expect(
        /isDemandPrefMonthFish\(|getIndexablePrefMonthFishCombos\(\)/.test(src),
        `${t} が需要判定（isDemandPrefMonthFish / getIndexablePrefMonthFishCombos）を使っていない`
      ).toBe(true);
    }
  });
});
