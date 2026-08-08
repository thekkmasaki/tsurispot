import { FishingSpot } from "@/types";

// スポットのルール（禁止事項）とおすすめコンテンツの突合せ（2026-08 UX監査）。
// 従来 spot.rules は SpotRulesCard の描画専用で、おすすめ釣り方・使えるガイド・
// 攻略法の生成側は一切参照していなかった。その結果「投げ釣り禁止なのに
// ちょい投げガイドを推奨」「タコ釣り禁止なのにタコエギ実績を紹介」
// 「夜釣りNGなのに夜推し」等の自己矛盾が本番に露出していた。

// castingAllowed=false で禁止とみなす釣法。
// 「投げ釣り禁止（ちょい投げはOK）」のような明示許可が otherRules にある場合は
// ちょい投げ系を除外しない。
const CASTING_METHODS = ["投げ釣り", "ちょい投げ", "ちょい投げ釣り", "遠投カゴ釣り"];
const CHOI_NAGE_METHODS = new Set(["ちょい投げ", "ちょい投げ釣り"]);

// lureAllowed=false で禁止とみなす釣法
const LURE_METHODS = [
  "ルアー釣り",
  "ルアー",
  "メバリング",
  "アジング",
  "エギング",
  "ショアジギング",
  "ジギング",
  "タコエギ",
];

// chumAllowed=false（コマセ禁止）で禁止とみなす釣法
const CHUM_METHODS = ["サビキ釣り", "フカセ釣り", "カゴ釣り", "遠投カゴ釣り"];

// otherRules の文言 → 禁止釣法のマッピング（実データの語彙に合わせた保守的な辞書）
const OTHER_RULE_PATTERNS: { pattern: RegExp; methods: string[] }[] = [
  { pattern: /タコ[^。]*禁止/, methods: ["タコエギ", "タコ釣り"] },
  { pattern: /エギング[^。]*禁止/, methods: ["エギング"] },
  { pattern: /ルアー[^。]*禁止/, methods: LURE_METHODS },
  { pattern: /投げ釣り[^。]*禁止/, methods: ["投げ釣り"] },
];

/**
 * このスポットで禁止されている釣法名の集合を返す。
 * catchableFish 由来のおすすめ釣り方・ガイドリンク・バッジは、この集合に
 * 含まれる釣法を表示前に除外すること。
 */
export function getForbiddenMethods(spot: FishingSpot): Set<string> {
  const forbidden = new Set<string>();
  const rules = spot.rules;
  if (!rules) return forbidden;
  const otherRules = rules.otherRules ?? [];

  if (rules.castingAllowed === false) {
    const choiNageOk = otherRules.some((r) => /ちょい投げ[^。]*(OK|可)/.test(r));
    for (const m of CASTING_METHODS) {
      if (choiNageOk && CHOI_NAGE_METHODS.has(m)) continue;
      forbidden.add(m);
    }
  }
  if (rules.lureAllowed === false) {
    for (const m of LURE_METHODS) forbidden.add(m);
  }
  if (rules.chumAllowed === false) {
    for (const m of CHUM_METHODS) forbidden.add(m);
  }
  if (rules.nightFishing === false) {
    forbidden.add("夜釣り");
  }
  for (const rule of otherRules) {
    for (const { pattern, methods } of OTHER_RULE_PATTERNS) {
      if (pattern.test(rule)) {
        for (const m of methods) forbidden.add(m);
      }
    }
  }
  return forbidden;
}

/**
 * 夜間の釣りを訴求してよいスポットか。
 * catchableFish の recommendedTime に「夜」があっても、ルールで夜釣り禁止なら false。
 * （夜釣りNGなのにナイトフィッシングガイドやメバリング推奨が出ていた実バグの対策）
 */
export function isNightFishingAdvisable(spot: FishingSpot): boolean {
  if (spot.rules?.nightFishing === false) return false;
  return spot.catchableFish.some((cf) => cf.recommendedTime.includes("夜"));
}

/**
 * おすすめとして表示してよい catchableFish エントリだけを返す。
 * 禁止釣法のエントリと、夜釣り禁止スポットでの夜専用おすすめを除外する。
 */
export function getAdvisableCatchableFish(spot: FishingSpot): FishingSpot["catchableFish"] {
  const forbidden = getForbiddenMethods(spot);
  const nightBanned = spot.rules?.nightFishing === false;
  return spot.catchableFish.filter((cf) => {
    if (forbidden.has(cf.method)) return false;
    // 夜専用（recommendedTime が夜のみ）のおすすめは夜釣り禁止スポットでは出さない。
    // 「夕マヅメ〜夜」のような夕方を含むものは許容する。
    if (nightBanned && cf.recommendedTime.includes("夜") && !cf.recommendedTime.includes("夕")) {
      return false;
    }
    return true;
  });
}
