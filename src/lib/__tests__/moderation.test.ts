import { describe, it, expect } from "vitest";
import { checkNgWords } from "../moderation";

describe("checkNgWords", () => {
  // === 正常系（セーフ） ===
  it("正常なテキストはOK", () => {
    const result = checkNgWords(["釣りキチ太郎", "アジ", "朝マヅメにサビキで20匹釣れました！"]);
    expect(result.ok).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("空テキストはOK", () => {
    const result = checkNgWords(["", "", ""]);
    expect(result.ok).toBe(true);
  });

  // === 釣り用語の誤検出回避 ===
  it("「ゴミが多い」はセーフ（現場報告）", () => {
    expect(checkNgWords(["太郎", "アジ", "堤防にゴミが多いので持ち帰りましょう"]).ok).toBe(true);
  });

  it("「カスミアジ」はセーフ（魚名）", () => {
    expect(checkNgWords(["太郎", "カスミアジ", "テスト"]).ok).toBe(true);
  });

  it("「ボケで釣った」はセーフ（釣り餌）", () => {
    expect(checkNgWords(["太郎", "チヌ", "ボケで釣りました"]).ok).toBe(true);
  });

  it("「PEライン」はセーフ（釣り糸）", () => {
    expect(checkNgWords(["太郎", "シーバス", "PEライン1号で"]).ok).toBe(true);
  });

  it("「LINEで釣果共有」はセーフ（勧誘でないLINE言及）", () => {
    expect(checkNgWords(["太郎", "アジ", "LINEで友達に報告"]).ok).toBe(true);
  });

  it("「障害者用トイレあり」はセーフ（バリアフリー情報）", () => {
    expect(checkNgWords(["太郎", "アジ", "障害者用トイレあり"]).ok).toBe(true);
  });

  // === NGワード検出 ===
  it("NGワード（暴言）を検出", () => {
    const result = checkNgWords(["テスト", "死ね", "コメント"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("不適切");
  });

  it("NGワード（差別語）を検出", () => {
    expect(checkNgWords(["ガイジ", "アジ", "テスト"]).ok).toBe(false);
  });

  it("NGワード（犯罪系）を検出", () => {
    expect(checkNgWords(["太郎", "アジ", "覚醒剤"]).ok).toBe(false);
  });

  // === スパム検出 ===
  it("URLを含むテキストをスパム検出", () => {
    const result = checkNgWords(["太郎", "アジ", "https://spam.example.com で購入！"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("URL");
  });

  it("メールアドレスをスパム検出", () => {
    const result = checkNgWords(["太郎", "アジ", "連絡はtest@example.comまで"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("URL");
  });

  it("電話番号をスパム検出", () => {
    const result = checkNgWords(["太郎", "アジ", "090-1234-5678に連絡"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("URL");
  });

  it("LINE ID交換の勧誘を検出", () => {
    expect(checkNgWords(["太郎", "アジ", "LINE ID教えて"]).ok).toBe(false);
    expect(checkNgWords(["太郎", "アジ", "LINE交換しよう"]).ok).toBe(false);
    expect(checkNgWords(["太郎", "アジ", "LINE追加して"]).ok).toBe(false);
  });

  // === 荒らし検出 ===
  it("連続同一文字（荒らし）を検出", () => {
    const result = checkNgWords(["太郎", "アジ", "ああああああああ"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("パターン");
  });

  it("4文字繰り返しはセーフ", () => {
    expect(checkNgWords(["太郎", "アジ", "ああああ良い天気"]).ok).toBe(true);
  });

  // === その他 ===
  it("複数フィールドにまたがるNGワードは検出しない（結合時に偶然一致しない限り）", () => {
    const result = checkNgWords(["太郎", "アジ3匹", "楽しかった"]);
    expect(result.ok).toBe(true);
  });
});
