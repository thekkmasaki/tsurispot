import { describe, it, expect } from "vitest";
import { buildGasBody } from "@/lib/gas-inbox";

describe("buildGasBody", () => {
  it("旧GAS（釣果報告扱い）でも読めるよう互換項目に要約を詰める", () => {
    const body = buildGasBody({
      type: "contact",
      summary: "不具合報告",
      senderName: "テスト太郎",
      details: [
        ["メール", "a@example.com"],
        ["内容", "表示が崩れています"],
        ["空欄", ""],
      ],
      fields: { name: "テスト太郎", email: "a@example.com", message: "表示が崩れています" },
    });
    expect(body.type).toBe("contact");
    expect(body.spotName).toBe("【お問い合わせ】");
    expect(body.fishName).toBe("不具合報告");
    expect(body.userName).toBe("テスト太郎");
    expect(body.comment).toBe("メール: a@example.com\n内容: 表示が崩れています");
    // 新GAS向けの元項目もそのまま残る
    expect(body.message).toBe("表示が崩れています");
    expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
