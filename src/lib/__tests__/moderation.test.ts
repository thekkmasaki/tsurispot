import { describe, it, expect } from "vitest";
import { checkNgWords } from "../moderation";

describe("checkNgWords", () => {
  it("正常なテキストはOK", () => {
    const result = checkNgWords(["釣りキチ太郎", "アジ", "朝マヅメにサビキで20匹釣れました！"]);
    expect(result.ok).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("空テキストはOK", () => {
    const result = checkNgWords(["", "", ""]);
    expect(result.ok).toBe(true);
  });

  it("NGワード（暴言）を検出", () => {
    const result = checkNgWords(["テスト", "死ね", "コメント"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("不適切");
  });

  it("NGワード（差別語）を検出", () => {
    const result = checkNgWords(["ガイジ", "アジ", "テスト"]);
    expect(result.ok).toBe(false);
  });

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

  it("連続同一文字（荒らし）を検出", () => {
    const result = checkNgWords(["太郎", "アジ", "ああああああああ"]);
    expect(result.ok).toBe(false);
    expect(result.reason).toContain("パターン");
  });

  it("4文字繰り返しはセーフ", () => {
    const result = checkNgWords(["太郎", "アジ", "ああああ良い天気"]);
    expect(result.ok).toBe(true);
  });

  it("LINE検出", () => {
    const result = checkNgWords(["太郎", "アジ", "LINEで連絡ください"]);
    expect(result.ok).toBe(false);
  });

  it("複数フィールドにまたがるNGワードは検出しない（結合時に偶然一致しない限り）", () => {
    // 各フィールド単体ではOKだがスペース結合で一致するケースは想定外
    const result = checkNgWords(["太郎", "アジ3匹", "楽しかった"]);
    expect(result.ok).toBe(true);
  });
});
