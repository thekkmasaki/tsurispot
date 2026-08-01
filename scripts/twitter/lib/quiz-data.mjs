#!/usr/bin/env node
/**
 * クイズ問題DB（240問）を .mjs から読み込むローダー。
 *
 * src/lib/data/quiz-questions-part{1,2}.ts は TypeScript だが、
 * `export const quizQuestionsPartN: QuizQuestion[] = [ ... ]` の
 * 配列リテラル部分は純粋な JavaScript（キー無引用符・ネスト配列・複数行文字列
 * すべて有効な JS）のため、型注釈を除いて new Function で評価する。
 * これにより正規表現パースより堅牢に全フィールド（choices/correctIndex/
 * explanation/relatedLinks 等）を取得できる。
 */

import { readFileSync } from "fs";
import { join } from "path";
import { ROOT } from "./x-client.mjs";

/**
 * `export const <name> ... = [ ... ]` の配列リテラルを、文字列と括弧の対応を
 * 追跡して安全に抽出する（ネスト配列・文字列中の "[" "]" を誤検出しない）。
 * @param {string} src
 * @param {string} exportName
 * @returns {string} "[ ... ]"
 */
function extractArrayLiteral(src, exportName) {
  const anchor = src.indexOf(`export const ${exportName}`);
  if (anchor === -1) throw new Error(`${exportName} が見つかりません`);
  // 型注釈 `: QuizQuestion[]` の "[]" を誤検出しないよう、代入 "=" の後の "[" を探す
  const eq = src.indexOf("=", anchor);
  if (eq === -1) throw new Error(`${exportName} の代入が見つかりません`);
  const open = src.indexOf("[", eq);
  if (open === -1) throw new Error(`${exportName} の配列開始が見つかりません`);

  let depth = 0;
  let inStr = null; // 現在の文字列クオート種別（" ' `）
  let esc = false;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      continue;
    }
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) return src.slice(open, i + 1);
    }
  }
  throw new Error(`${exportName} の配列終端が見つかりません`);
}

/**
 * TS ファイルから指定 export の配列を評価して返す
 * @param {string} relPath ROOT からの相対パス
 * @param {string} exportName
 * @returns {object[]}
 */
function loadQuizFile(relPath, exportName) {
  const src = readFileSync(join(ROOT, relPath), "utf-8");
  const literal = extractArrayLiteral(src, exportName);
  try {
    // 配列リテラルは純データ（関数呼び出し・変数参照なし）のため安全に評価できる
    return new Function(`return (${literal});`)();
  } catch (e) {
    throw new Error(`${exportName} の評価に失敗: ${e?.message || e}`);
  }
}

/**
 * 全240問を返す（part1 + part2）
 * @returns {{id:string,category:string,difficulty:string,question:string,choices:string[],correctIndex:number,explanation:string,relatedLinks?:{label:string,href:string}[],imageUrl?:string}[]}
 */
export function loadAllQuizzes() {
  const part1 = loadQuizFile("src/lib/data/quiz-questions-part1.ts", "quizQuestionsPart1");
  const part2 = loadQuizFile("src/lib/data/quiz-questions-part2.ts", "quizQuestionsPart2");
  return [...part1, ...part2];
}
