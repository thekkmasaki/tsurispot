import { describe, it, expect } from "vitest";
import { evaluateModeration } from "../rekognition";

describe("evaluateModeration", () => {
  it("ラベルなし → safe", () => {
    const result = evaluateModeration({ ModerationLabels: [] });
    expect(result.safe).toBe(true);
    expect(result.labels).toHaveLength(0);
    expect(result.reason).toBeUndefined();
  });

  it("undefined → safe", () => {
    const result = evaluateModeration({ ModerationLabels: undefined });
    expect(result.safe).toBe(true);
  });

  it("無関係なラベルのみ → safe", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Suggestive", Confidence: 85, ParentName: "" },
        { Name: "Female Swimwear Or Underwear", Confidence: 72, ParentName: "Suggestive" },
      ],
    });
    expect(result.safe).toBe(true);
    expect(result.labels).toHaveLength(2);
  });

  it("Explicit Nudity → NG", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Explicit Nudity", Confidence: 95, ParentName: "" },
        { Name: "Graphic Male Nudity", Confidence: 90, ParentName: "Explicit Nudity" },
      ],
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Explicit Nudity");
  });

  it("Violence → NG", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Violence", Confidence: 88, ParentName: "" },
      ],
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Violence");
  });

  it("Visually Disturbing → NG", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Visually Disturbing", Confidence: 75, ParentName: "" },
      ],
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Visually Disturbing");
  });

  it("Drugs → NG", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Drugs", Confidence: 80, ParentName: "" },
        { Name: "Drug Products", Confidence: 78, ParentName: "Drugs" },
      ],
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Drugs");
  });

  it("Hate Symbols → NG", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Hate Symbols", Confidence: 92, ParentName: "" },
      ],
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Hate Symbols");
  });

  it("ブロック対象のサブカテゴリ（startsWith一致）→ NG", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Explicit Nudity - Partial", Confidence: 80, ParentName: "" },
      ],
    });
    // "Explicit Nudity" で startsWith 一致
    expect(result.safe).toBe(false);
  });

  it("ブロック対象 + 無関係が混在 → NG（全ラベル返却）", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Suggestive", Confidence: 60, ParentName: "" },
        { Name: "Violence", Confidence: 85, ParentName: "" },
      ],
    });
    expect(result.safe).toBe(false);
    expect(result.labels).toHaveLength(2);
    expect(result.reason).toContain("Violence");
    expect(result.reason).not.toContain("Suggestive");
  });

  it("複数ブロック対象 → reason に全て列挙", () => {
    const result = evaluateModeration({
      ModerationLabels: [
        { Name: "Violence", Confidence: 90, ParentName: "" },
        { Name: "Drugs", Confidence: 80, ParentName: "" },
      ],
    });
    expect(result.safe).toBe(false);
    expect(result.reason).toContain("Violence");
    expect(result.reason).toContain("Drugs");
  });
});
