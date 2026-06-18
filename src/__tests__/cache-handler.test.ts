import { describe, it, expect, beforeEach } from "vitest";
import CacheHandler from "../../cache-handler.js";

// cache-handler.js は @upstash/redis を getRedis() 内で遅延 require するため、
// モジュール import 時に依存を読み込まない（純粋関数のみテスト可能）。
const {
  __serializeEntry,
  __deserializeEntry,
  __isCacheableValue,
  __l1Get,
  __l1Set,
  __l1Delete,
  __l1Clear,
  __l1Size,
  __L1_MAX_ENTRIES,
  __L1_MAX_ENTRY_BYTES,
} = CacheHandler as unknown as {
  __serializeEntry: (entry: unknown) => string;
  __deserializeEntry: (b64: string) => unknown;
  __isCacheableValue: (value: unknown) => boolean;
  __l1Get: (key: string) => unknown;
  __l1Set: (key: string, entry: unknown, sizeBytes?: number) => void;
  __l1Delete: (key: string) => void;
  __l1Clear: () => void;
  __l1Size: () => number;
  __L1_MAX_ENTRIES: number;
  __L1_MAX_ENTRY_BYTES: number;
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

describe("cache-handler L1 インメモリキャッシュ（Redis コマンド削減）", () => {
  beforeEach(() => __l1Clear());

  it("set した値を get で返す（同一 read を Redis なしで吸収）", () => {
    const entry = { value: { html: "<html>x</html>" }, lastModified: 1, tags: [] };
    __l1Set("k1", entry, 100);
    expect(__l1Get("k1")).toEqual(entry);
  });

  it("未登録キーは null", () => {
    expect(__l1Get("missing")).toBeNull();
  });

  it("delete で消える", () => {
    __l1Set("k2", { value: 1 }, 10);
    __l1Delete("k2");
    expect(__l1Get("k2")).toBeNull();
  });

  it("clear で全消去（revalidateTag の古い HTML 滞留防止）", () => {
    __l1Set("a", { value: 1 }, 10);
    __l1Set("b", { value: 2 }, 10);
    __l1Clear();
    expect(__l1Size()).toBe(0);
  });

  it("巨大エントリは L1 に載せない（メモリ保護）", () => {
    __l1Set("big", { value: "x" }, __L1_MAX_ENTRY_BYTES + 1);
    expect(__l1Get("big")).toBeNull();
    expect(__l1Size()).toBe(0);
  });

  it("件数上限を超えると最古を捨てる（近似 LRU）", () => {
    for (let i = 0; i < __L1_MAX_ENTRIES + 10; i++) {
      __l1Set(`key-${i}`, { value: i }, 10);
    }
    expect(__l1Size()).toBe(__L1_MAX_ENTRIES);
    // 最初に入れたものは押し出されている
    expect(__l1Get("key-0")).toBeNull();
    // 最後に入れたものは残っている
    expect(__l1Get(`key-${__L1_MAX_ENTRIES + 9}`)).toEqual({ value: __L1_MAX_ENTRIES + 9 });
  });
});
