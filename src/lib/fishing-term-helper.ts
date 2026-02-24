/**
 * 釣り用語の初心者向け解説を付与するユーティリティ
 * 表示レイヤーで使用し、データファイルには触れない
 */

import { TIME_GLOSSARY, METHOD_GLOSSARY, GEAR_GLOSSARY } from "./data/fishing-glossary";

/**
 * 時間帯テキストに括弧書き解説を付与
 * 例: "朝マヅメ" → "朝マヅメ（日の出前後1時間・魚が最もよく釣れる時間帯）"
 * 例: "朝マヅメ〜日中" → "朝マヅメ（日の出前後1時間）〜日中"
 */
export function explainTime(text: string): string {
  if (!text) return text;

  let result = text;
  // 長いキーから順にマッチさせる（「朝マヅメ」が「マヅメ」に先にマッチしないように）
  const sortedKeys = Object.keys(TIME_GLOSSARY).sort((a, b) => b.length - a.length);
  const matched = new Set<string>();

  for (const term of sortedKeys) {
    if (result.includes(term) && !matched.has(term)) {
      // この用語の部分文字列として既にマッチ済みの場合はスキップ
      let skip = false;
      for (const m of matched) {
        if (m.includes(term)) { skip = true; break; }
      }
      if (skip) continue;

      const explanation = TIME_GLOSSARY[term];
      // 最初の出現のみ置換（短めの解説）
      const shortExplanation = explanation.split("・")[0];
      result = result.replace(term, `${term}（${shortExplanation}）`);
      matched.add(term);
    }
  }

  return result;
}

/**
 * 釣り方名の解説テキストを返す
 * 例: "サビキ釣り" → "撒き餌カゴと疑似餌針で小魚を釣る初心者定番の方法"
 */
export function explainMethod(method: string): string | null {
  if (!method) return null;

  // 完全一致
  if (METHOD_GLOSSARY[method]) return METHOD_GLOSSARY[method];

  // 部分一致（長いキーから順に）
  const sortedKeys = Object.keys(METHOD_GLOSSARY).sort((a, b) => b.length - a.length);
  for (const term of sortedKeys) {
    if (method.includes(term)) return METHOD_GLOSSARY[term];
  }

  return null;
}

/**
 * ギア仕様テキストの主要用語1つに解説を付与
 * 例: "スピニングリール 2500番" → "スピニングリール（初心者はこれ一択） 2500番（万能サイズ）"
 */
export function explainGearSpec(text: string): string {
  if (!text) return text;

  let result = text;
  let matchCount = 0;
  const maxMatches = 2; // 1テキストにつき最大2つまで解説付与

  // 長いキーから順にマッチ
  const sortedKeys = Object.keys(GEAR_GLOSSARY).sort((a, b) => b.length - a.length);
  const matched = new Set<string>();

  for (const term of sortedKeys) {
    if (matchCount >= maxMatches) break;
    if (result.includes(term) && !matched.has(term)) {
      // 部分文字列チェック
      let skip = false;
      for (const m of matched) {
        if (m.includes(term) || term.includes(m)) { skip = true; break; }
      }
      if (skip) continue;

      // 既に括弧書きが付いていないか確認
      const idx = result.indexOf(term);
      const afterTerm = result.substring(idx + term.length);
      if (afterTerm.startsWith("（")) continue;

      const explanation = GEAR_GLOSSARY[term];
      const shortExplanation = explanation.split("・")[0];
      result = result.replace(term, `${term}（${shortExplanation}）`);
      matched.add(term);
      matchCount++;
    }
  }

  return result;
}

/**
 * 釣り方と難易度から「釣具店での頼み方」テキストを自動生成
 */
export function generateShopAdvice(method: string, difficulty: "beginner" | "intermediate" | "advanced"): string | null {
  if (difficulty !== "beginner") return null;

  const adviceMap: Record<string, string> = {
    "サビキ釣り": "「サビキ釣りセットをください」と言えばOK。カゴ・仕掛け・エサ（アミエビ）がセットになったものがあります",
    "サビキ": "「サビキ釣りセットをください」と言えばOK。カゴ・仕掛け・エサ（アミエビ）がセットになったものがあります",
    "ちょい投げ": "「ちょい投げセットをください。キス（or カレイ）狙いです」と伝えましょう。仕掛けとエサを見繕ってもらえます",
    "ウキ釣り": "「ウキ釣りで○○を狙いたいです」と伝えましょう。ウキ・仕掛け・エサをまとめて選んでもらえます",
    "フカセ釣り": "「フカセ釣りを始めたいです」と伝えましょう。撒き餌・仕掛け一式を見繕ってもらえます",
    "フカセ": "「フカセ釣りを始めたいです」と伝えましょう。撒き餌・仕掛け一式を見繕ってもらえます",
    "穴釣り": "「穴釣り用のブラクリとエサをください」と言えばOK。竿は短くて安いもので十分です",
    "ブラクリ": "「穴釣り用のブラクリとエサをください」と言えばOK。竿は短くて安いもので十分です",
    "エギング": "「エギングを始めたいです。エギのおすすめサイズを教えてください」と聞きましょう",
    "アジング": "「アジングを始めたいです。ジグヘッドとワームのおすすめを教えてください」と聞きましょう",
    "メバリング": "「メバリングを始めたいです」と伝えれば、ジグヘッドとワームを選んでもらえます",
    "ショアジギング": "「ショアジギングを始めたいです。○○g前後のジグをください」と伝えましょう",
    "ライトショアジギング": "「ライトショアジギングを始めたいです」と伝えましょう。20〜40gのジグがおすすめです",
    "泳がせ釣り": "「泳がせ釣りをしたいです。活きアジはありますか？」と聞きましょう",
    "のませ釣り": "「のませ（泳がせ）釣りをしたいです。活きエサはありますか？」と聞きましょう",
    "胴突き仕掛け": "「胴突き仕掛けでカサゴを狙いたいです」と伝えれば、仕掛けとエサを見繕ってもらえます",
    "胴突き": "「胴突き仕掛けでカサゴを狙いたいです」と伝えれば、仕掛けとエサを見繕ってもらえます",
    "渓流釣り": "「渓流釣りを始めたいです。エサ釣りが良いです」と伝えましょう。ミミズや川虫も購入できます",
    "延べ竿釣り": "「延べ竿で○○を狙いたいです」と言えばOK。仕掛けセットが売っています",
    "延べ竿": "「延べ竿で○○を狙いたいです」と言えばOK。仕掛けセットが売っています",
    "カゴ釣り": "「カゴ釣りで○○を狙いたいです」と伝えましょう。カゴ・ウキ・仕掛けを選んでもらえます",
  };

  // 完全一致
  if (adviceMap[method]) return adviceMap[method];

  // 部分一致
  for (const [key, value] of Object.entries(adviceMap)) {
    if (method.includes(key)) return value;
  }

  // 汎用アドバイス
  return `「${method}を始めたいのですが、必要な道具を教えてください」と店員さんに聞けば、一式揃えてもらえます`;
}
