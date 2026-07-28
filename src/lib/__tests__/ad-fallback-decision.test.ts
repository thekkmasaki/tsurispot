import { describe, it, expect } from "vitest";
import { decideAdSlotOutcome } from "../ad-fallback-decision";

/**
 * fallback判定エンジンのユニットテスト。
 * PR#295監査で確定した誤発火モード（F1: 遅い回線での誤blocked / M2: no-fill取り逃し）を
 * 回帰させないことが目的。「確定情報が無い間は必ず pending」が安全性の核。
 */
describe("decideAdSlotOutcome", () => {
  // --- F1回帰: スクリプト取得中は絶対に fallback しない ---
  it("スクリプトロード中は adStatus に関わらず pending（遅い回線の誤blocked根絶）", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "loading", pushed: true, adStatus: null })
    ).toBe("pending");
  });

  it("スクリプトロード中は push 済みでも pending", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "loading", pushed: true, adStatus: null })
    ).toBe("pending");
  });

  // --- 幅ガード保留中の枠は評価しない ---
  it("未push（幅ガード保留/非表示コンテナ）は scriptState が blocked でも pending", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "blocked", pushed: false, adStatus: null })
    ).toBe("pending");
  });

  it("未pushはロード済みでも pending", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "loaded", pushed: false, adStatus: null })
    ).toBe("pending");
  });

  // --- blocked: スクリプト取得失敗が確定した時のみ ---
  it("push済み + スクリプト取得失敗 → blocked", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "blocked", pushed: true, adStatus: null })
    ).toBe("blocked");
  });

  // --- ロード済み: data-ad-status の確定値でのみ判定 ---
  it("ロード済み + filled → filled", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "loaded", pushed: true, adStatus: "filled" })
    ).toBe("filled");
  });

  it("ロード済み + unfilled → unfilled（no-fillのfallback）", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "loaded", pushed: true, adStatus: "unfilled" })
    ).toBe("unfilled");
  });

  // --- M2回帰: 処理中（status未確定）を filled と誤確定しない ---
  it("ロード済み + adStatus未付与（リクエスト中）→ pending（偽filled確定の根絶）", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "loaded", pushed: true, adStatus: null })
    ).toBe("pending");
  });

  // --- 未知の属性値は安全側（pending）に倒す ---
  it("ロード済み + 未知の adStatus 値（例: unfill-optimized 等の将来値）→ pending", () => {
    expect(
      decideAdSlotOutcome({ scriptState: "loaded", pushed: true, adStatus: "unfill-optimized" })
    ).toBe("pending");
  });
});
