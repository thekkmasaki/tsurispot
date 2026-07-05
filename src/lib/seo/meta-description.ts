/**
 * meta description ビルダー（各ページ種別の <meta name="description"> 生成）。
 *
 * 背景: Bing Webmaster が「description が短すぎるページ 11,000」を [Moderate] として警告。
 * Bing 推奨は 150-160 字だが、実測でマトリクス 58 字・県×魚種 81 字・スポット 93 字と不足していた。
 * 各ページ固有の実データ（スポット名・件数・水温・最盛期・釣り方）を織り込んで 120〜158 字化し、
 * SERP での説明性と CTR を底上げする。
 *
 * 設計原則:
 *  - **一意性**: 11,000 ページ間で同一定型文の使い回しにしない。先頭文に「県・月・魚種・スポット名」など
 *    ページを一意に識別するトークンを必ず埋め込む（固定句は全体の 4 割未満）。
 *  - **純関数**: 引数はプレーンデータのみ。ページコンポーネントや Next.js API を import しない。
 *  - **文単位で組み立て**: 句点（。）区切りの「文アトム」を max を超えない範囲で貪欲に連結する。
 *    途中でぶつ切りにしないので SERP で不自然な切れ方をしない。データが薄い場合は fallbackTail で
 *    最低長を担保する。
 */
import { DESCRIPTION_MAX, trimDescription } from "@/lib/utils/seo";

/** description の最小長（Bing 警告回避の安全圏。コードポイント基準）。 */
export const DESCRIPTION_MIN = 120;

/** コードポイント数（絵文字・サロゲートペアを 1 文字として数える。SERP の体感長に一致）。 */
function cpLength(text: string): number {
  return [...text].length;
}

/**
 * 名前配列を「・」で結合（先頭 limit 件）。空配列は空文字。
 */
export function joinNames(names: string[], limit = 3): string {
  return names.slice(0, limit).join("・");
}

/**
 * テキストの先頭 1 文（句点まで）を返す。句点が無ければ全体。
 * maxLen を超える長文は説明文への埋め込みに不向きなので "" を返す（呼び出し側でスキップ）。
 */
export function firstSentence(text: string, maxLen = 48): string {
  if (!text) return "";
  const idx = text.indexOf("。");
  const sentence = idx >= 0 ? text.slice(0, idx + 1) : text;
  return cpLength(sentence) <= maxLen ? sentence : "";
}

/**
 * 文アトムを結合して description を組み立てる。
 *  - falsy（false/null/undefined/空文字）を除去
 *  - max を超えない範囲で文アトムを順に連結（文の途中で切らない）
 *  - 先頭アトム単独で max 超のときのみ既存の trimDescription（句点トリム）で安全に詰める
 *  - min 未満なら fallbackTail を順に、max を超えない範囲で足して最低長を担保
 */
export function composeMetaDescription(
  parts: Array<string | false | null | undefined>,
  opts: { min?: number; max?: number; fallbackTail?: string[] } = {},
): string {
  const min = opts.min ?? DESCRIPTION_MIN;
  const max = opts.max ?? DESCRIPTION_MAX;
  const atoms = parts.filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0,
  );

  let text = "";
  for (const atom of atoms) {
    if (text === "") {
      text = atom;
    } else if (cpLength(text + atom) <= max) {
      text += atom;
    }
    // 入れると max 超になるアトムはスキップし、後続の短いアトム（締めの一文）を拾えるようにする。
  }
  // 先頭アトム単独で max 超のときだけ句点トリム。builder の先頭文は短いので通常は発火しない。
  if (cpLength(text) > max) text = trimDescription(text, max);

  for (const tail of opts.fallbackTail ?? []) {
    if (cpLength(text) >= min) break;
    if (cpLength(text + tail) <= max) text += tail;
  }
  return text;
}

// ───────────────────────────── ページ種別ビルダー ─────────────────────────────

/** マトリクス（都道府県×月×魚種）ページ。8,897 ページ。 */
export function buildMatrixDescription(d: {
  prefName: string;
  monthName: string;
  fishName: string;
  spotCount: number;
  topSpotNames: string[];
  topMethods: string[];
  waterTemp?: string;
  isPeak: boolean;
}): string {
  const spots = joinNames(d.topSpotNames, 2);
  const methods = joinNames(d.topMethods, 2);
  return composeMetaDescription(
    [
      `${d.prefName}で${d.monthName}に${d.fishName}が釣れる釣り場${d.spotCount}件を掲載。`,
      d.isPeak
        ? `${d.monthName}は最盛期で数釣りのチャンスです。`
        : `${d.monthName}は${d.fishName}の狙い目シーズンです。`,
      spots ? `実績ポイントは${spots}などが有力。` : false,
      methods ? `釣り方は${methods}が中心です。` : false,
      d.waterTemp
        ? `水温${d.waterTemp}を踏まえた時間帯・仕掛け・アクセスまで釣行前にまとめました。`
        : `時間帯・仕掛け・混雑予測・アクセスまで釣行前にまとめました。`,
    ],
    {
      fallbackTail: [
        `${d.prefName}の${d.fishName}釣りの計画に役立ちます。`,
        `混雑予測やおすすめの装備も確認できます。`,
        `初心者から上級者まで参考になる情報を掲載しています。`,
      ],
    },
  );
}

/** 県×魚種ページ。 */
export function buildPrefFishDescription(d: {
  prefName: string;
  fishName: string;
  spotCount: number;
  topSpotNames: string[];
  peakMonths: string[];
  topMethods: string[];
  easyCount: number;
}): string {
  const spots = joinNames(d.topSpotNames, 2);
  const methods = joinNames(d.topMethods, 2);
  const peaks = joinNames(d.peakMonths, 3);
  const closing =
    d.easyCount > 0
      ? `初心者でも狙いやすい${d.easyCount}スポットを含め、アクセスや季節の狙い目まで掲載しています。`
      : `アクセスや季節の狙い目まで、釣行前に役立つ情報をまとめました。`;
  return composeMetaDescription(
    [
      `${d.prefName}で${d.fishName}が釣れる釣り場${d.spotCount}件を厳選しました。`,
      peaks ? `最盛期は${peaks}で好釣果が期待できます。` : false,
      spots ? `実績ポイントは${spots}など。` : false,
      methods ? `狙い方は${methods}が中心です。` : false,
      closing,
    ],
    {
      fallbackTail: [
        `${d.prefName}の${d.fishName}釣りの計画に役立ちます。`,
        `シーズンや釣り方・タックルの詳細も確認できます。`,
        `近くの釣り場探しにもご活用ください。`,
      ],
    },
  );
}

/** スポット詳細ページ。5,278 ページ。 */
export function buildSpotMetaDescription(spot: {
  name: string;
  description: string;
  region: { prefecture: string; areaName: string };
  spotType?: string;
  difficulty?: string;
  isFree?: boolean;
  hasParking?: boolean;
  hasToilet?: boolean;
  catchableFish: { fish: { name: string }; method?: string }[];
}): string {
  const top3 = joinNames(
    spot.catchableFish.slice(0, 3).map((cf) => cf.fish.name),
    3,
  );
  const fishCount = spot.catchableFish.length;
  const topMethod = spot.catchableFish[0]?.method;

  const facility: string[] = [];
  if (spot.hasParking) facility.push("駐車場");
  if (spot.hasToilet) facility.push("トイレ");
  let facilitySentence: string | false = false;
  if (facility.length > 0) {
    facilitySentence = `${facility.join("・")}あり${spot.isFree ? "・無料" : ""}で楽しめます。`;
  } else if (spot.isFree) {
    facilitySentence = "無料で楽しめる釣り場です。";
  } else if (spot.difficulty === "beginner") {
    facilitySentence = "初心者でも足場が安定して楽しめる釣り場です。";
  }

  return composeMetaDescription(
    [
      `${spot.name}（${spot.region.prefecture}${spot.region.areaName}）の釣り場・釣果情報。`,
      firstSentence(spot.description, 40) || false,
      top3 && topMethod
        ? `釣れる魚は${top3}など${fishCount}種で、${topMethod}が定番。`
        : top3
          ? `釣れる魚は${top3}など${fishCount}種。`
          : false,
      facilitySentence,
      `仕掛け・季節の狙い目・混雑予測・アクセスまで掲載しています。`,
    ],
    {
      fallbackTail: [
        `${spot.region.prefecture}の釣りスポット情報として役立ちます。`,
        `駐車場やトイレなど設備の有無も確認できます。`,
        `初心者やファミリーの釣行計画にもご活用ください。`,
      ],
    },
  );
}

/** 県×月ページ。 */
export function buildPrefMonthDescription(d: {
  prefName: string;
  monthName: string;
  fishCount: number;
  topFishNames: string[];
  spotCount: number;
  topSpotNames: string[];
  waterTemp?: string;
  season: string;
}): string {
  const fish = joinNames(d.topFishNames, 3);
  const spots = joinNames(d.topSpotNames, 2);
  return composeMetaDescription(
    [
      `${d.prefName}の${d.monthName}に釣れる魚${d.fishCount}種とおすすめ釣り場${d.spotCount}件を紹介します。`,
      fish ? `${d.monthName}は${fish}などが狙い目です。` : false,
      spots ? `実績ポイントは${spots}など。` : false,
      d.waterTemp
        ? `水温は${d.waterTemp}が目安で、${d.season}シーズンの狙い方を解説します。`
        : `${d.season}シーズンの狙い方を解説します。`,
      `釣り方・時間帯・仕掛けのコツから釣行の注意点まで、${d.prefName}の釣りに役立つ情報をまとめました。`,
    ],
    {
      fallbackTail: [
        `月別の釣れる魚やおすすめ装備も確認できます。`,
        `${d.prefName}の他の月の釣り情報にもリンクしています。`,
        `初心者の釣行計画にもご活用ください。`,
      ],
    },
  );
}

/** 県×釣り方ページ。 */
export function buildPrefMethodDescription(d: {
  prefName: string;
  methodName: string;
  spotCount: number;
  topSpotNames: string[];
  topFishNames: string[];
}): string {
  const spots = joinNames(d.topSpotNames, 2);
  const fish = joinNames(d.topFishNames, 3);
  return composeMetaDescription(
    [
      `${d.prefName}で${d.methodName}ができる釣り場${d.spotCount}件を紹介します。`,
      fish ? `${d.methodName}で狙えるのは${fish}など。` : false,
      spots ? `実績ポイントは${spots}などが有力です。` : false,
      `攻略法・ベストシーズン・仕掛け・タックルのコツまで${d.prefName}の${d.methodName}の釣行に役立つ情報をまとめました。`,
    ],
    {
      fallbackTail: [
        `月別に釣れるスポット数や難易度の分布も確認できます。`,
        `${d.prefName}の他の釣り方の情報にもリンクしています。`,
        `初心者から上級者まで参考になります。`,
      ],
    },
  );
}
