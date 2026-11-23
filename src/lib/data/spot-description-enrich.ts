/**
 * 薄い紹介文（<100字）の補完ロジック。
 *
 * 旧実装は 100字未満の description を generateSpotIntro() の自動生成文に丸ごと差し替えていたため、
 * 人手で書いた注意書き（「遊漁券が必要」「遊泳禁止」「立入制限あり」など）が本番から消えていた
 * （2026-11-23 水月湖の件）。元の紹介文を必ず先頭に残し、自動生成文は既出の文を除いて後ろに足す。
 */

/** 文の重複判定用に、空白と句読点・括弧類を落とす */
function normalizeSentence(s: string): string {
  return s.replace(/[\s　。、，．,.!！?？・「」『』（）()]/g, "");
}

/** 「。」「！」「？」で文に分割する（区切り文字は各文の末尾に残す） */
export function splitSentences(text: string): string[] {
  return (text.match(/[^。！？!?]+[。！？!?]?/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

const TERMINAL = /[。！？!?」』）)]$/;

/**
 * 元の紹介文 original を先頭に残したまま、自動生成文 generated の文のうち
 * original にすでに含まれる（または original の文を含む）ものを除いて後ろに足す。
 * original が空なら generated をそのまま返す。
 */
export function mergeDescription(original: string, generated: string): string {
  const base = (original || "").trim();
  if (!base) return generated;
  const head = TERMINAL.test(base) ? base : `${base}。`;

  const baseNorm = normalizeSentence(head);
  const baseSentences = splitSentences(head)
    .map(normalizeSentence)
    .filter((s) => s.length > 0);

  const seen = new Set<string>();
  const extra: string[] = [];
  for (const sentence of splitSentences(generated)) {
    const n = normalizeSentence(sentence);
    if (!n || seen.has(n)) continue;
    seen.add(n);
    if (baseNorm.includes(n)) continue;
    if (baseSentences.some((b) => n.includes(b))) continue;
    extra.push(/[。！？!?]$/.test(sentence) ? sentence : `${sentence}。`);
  }
  return head + extra.join("");
}
