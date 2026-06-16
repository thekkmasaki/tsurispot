import { describe, it, expect } from "vitest";
import CacheHandler from "../../cache-handler.js";

// cache-handler.js は @upstash/redis を getRedis() 内で遅延 require するため、
// モジュール import 時に依存を読み込まない（純粋関数のみテスト可能）。
const { __serializeEntry, __deserializeEntry, __isCacheableValue } =
  CacheHandler as unknown as {
    __serializeEntry: (entry: unknown) => string;
    __deserializeEntry: (b64: string) => unknown;
    __isCacheableValue: (value: unknown) => boolean;
  };

describe("cache-handler シリアライズ往復", () => {
  it("プレーンなオブジェクトを正しく復元する", () => {
    const entry = { value: { kind: "PAGE", html: "<html></html>" }, lastModified: 123, tags: ["a"] };
    expect(__deserializeEntry(__serializeEntry(entry))).toEqual(entry);
  });

  it("Buffer（RSC payload 等）を Buffer のまま復元する", () => {
    const buf = Buffer.from("RSC-PAYLOAD-バイナリ", "utf8");
    const restored = __deserializeEntry(__serializeEntry({ value: { rscData: buf } })) as {
      value: { rscData: Buffer };
    };
    expect(Buffer.isBuffer(restored.value.rscData)).toBe(true);
    expect(restored.value.rscData.equals(buf)).toBe(true);
  });

  it("Uint8Array を Buffer として復元する（内容一致）", () => {
    const u8 = new Uint8Array([0, 1, 2, 250, 255]);
    const restored = __deserializeEntry(__serializeEntry({ body: u8 })) as { body: Buffer };
    expect(Buffer.isBuffer(restored.body)).toBe(true);
    expect(Array.from(restored.body)).toEqual([0, 1, 2, 250, 255]);
  });
});

describe("cache-handler isCacheableValue（空/壊れHTMLを絶対にキャッシュしない）", () => {
  it("html が空文字なら拒否（空HTML焼付きの直接対策）", () => {
    expect(__isCacheableValue({ html: "" })).toBe(false);
  });

  it("html が空白のみなら拒否", () => {
    expect(__isCacheableValue({ html: "   \n\t " })).toBe(false);
  });

  it("html が null なら拒否", () => {
    expect(__isCacheableValue({ html: null })).toBe(false);
  });

  it("中身のある html は許可", () => {
    expect(__isCacheableValue({ html: "<!DOCTYPE html><html>...</html>" })).toBe(true);
  });

  it("html フィールドを持たない値（FETCH キャッシュ等）は許可", () => {
    expect(__isCacheableValue({ kind: "FETCH", data: { body: "x" } })).toBe(true);
  });

  it("null / プリミティブはそのまま許可（Next の挙動を壊さない）", () => {
    expect(__isCacheableValue(null)).toBe(true);
    expect(__isCacheableValue("string-value")).toBe(true);
  });
});
