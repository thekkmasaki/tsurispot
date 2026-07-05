import { describe, it, expect, beforeEach, vi } from "vitest";
import CacheHandler from "../../cache-handler.js";

// cache-handler.js は @upstash/redis を getRedis() 内で遅延 require するため、
// モジュール import 時に依存を読み込まない（純粋関数のみテスト可能）。
const {
  __serializeEntry,
  __deserializeEntry,
  __isCacheableValue,
  __splitPayload,
  __PART_BYTES,
  __MAX_PARTS,
  __MAX_CACHE_BYTES,
  __l1Get,
  __l1Set,
  __l1Delete,
  __l1Clear,
  __l1Size,
  __L1_MAX_ENTRIES,
  __L1_MAX_ENTRY_BYTES,
} = CacheHandler as unknown as {
  __serializeEntry: (entry: unknown) => Buffer;
  __deserializeEntry: (stored: string | Uint8Array) => unknown;
  __isCacheableValue: (value: unknown) => boolean;
  __splitPayload: (payload: Buffer) => Buffer[];
  __PART_BYTES: number;
  __MAX_PARTS: number;
  __MAX_CACHE_BYTES: number;
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

  // 退行防止: Next.js 16 の App Page キャッシュ値は segmentData を Map<string, Buffer> で持つ。
  // Map を JSON 往復で保持できないと、キャッシュ HIT 時に Next が segmentData.get() を呼んだ瞬間
  // `TypeError: segmentData.get is not a function` で落ち、全 ISR ページが毎リクエスト
  // フル動的レンダにフォールバックして CPU が 100% に張り付く（2026-06 本番障害の真因）。
  it("segmentData（Map<string, Buffer>）を Map のまま復元し .get() が動く", () => {
    const entry = {
      value: {
        kind: "APP_PAGE",
        html: Buffer.from("<html>ok</html>"),
        rscData: Buffer.from("RSC"),
        segmentData: new Map([
          ["/__PAGE__", Buffer.from("seg-buf")],
          ["/layout", Buffer.from("seg2")],
        ]),
        status: 200,
      },
      lastModified: 123,
      tags: ["spot"],
    };
    const restored = __deserializeEntry(__serializeEntry(entry)) as {
      value: { segmentData: Map<string, Buffer>; html: Buffer };
    };
    const sd = restored.value.segmentData;
    expect(sd).toBeInstanceOf(Map);
    // 本番障害のクラッシュ条件そのもの: HIT 時に .get() が呼べること
    const seg = sd.get("/__PAGE__");
    expect(Buffer.isBuffer(seg)).toBe(true);
    expect((seg as Buffer).toString()).toBe("seg-buf");
    expect((sd.get("/layout") as Buffer).toString()).toBe("seg2");
    // 入れ子の Buffer も保持される
    expect(Buffer.isBuffer(restored.value.html)).toBe(true);
    expect(restored.value.html.toString()).toBe("<html>ok</html>");
  });

  it("空の Map も Map として復元する", () => {
    const restored = __deserializeEntry(
      __serializeEntry({ value: { segmentData: new Map() } })
    ) as { value: { segmentData: Map<string, Buffer> } };
    expect(restored.value.segmentData).toBeInstanceOf(Map);
    expect(restored.value.segmentData.size).toBe(0);
  });

  // (1) serializeEntry の返り値は Buffer（B型バイナリ保存用）で、base64 文字列ではない
  it("serializeEntry は Buffer を返す（base64 文字列ではない＝WRU 膨張を排除）", () => {
    const out = __serializeEntry({ value: { html: "<html>x</html>" }, lastModified: 1, tags: [] });
    expect(Buffer.isBuffer(out)).toBe(true);
  });

  // (2) 後方互換: 旧形式（base64 文字列）でも復元できる
  it("旧形式（base64 文字列）を復元する（デプロイ跨ぎの保険）", () => {
    const entry = { value: { kind: "PAGE", html: "<html>old</html>" }, lastModified: 42, tags: ["b"] };
    const legacyB64 = __serializeEntry(entry).toString("base64");
    expect(__deserializeEntry(legacyB64)).toEqual(entry);
  });

  // (3) SDK 戻り値シミュレーション: lib-dynamodb は B型を素の Uint8Array で返す
  it("新形式（素の Uint8Array）を復元する（SDK 戻り値の実体）", () => {
    const entry = { value: { kind: "PAGE", html: "<html>new</html>" }, lastModified: 7, tags: ["c"] };
    const sdkReturned = new Uint8Array(__serializeEntry(entry));
    expect(Buffer.isBuffer(sdkReturned)).toBe(false); // 落とし穴の確認: Buffer ではない
    expect(__deserializeEntry(sdkReturned)).toEqual(entry);
  });

  // (4) 大きい値（数百KB）でもバイナリ往復で一致する
  it("数百KB の値をバイナリ往復で復元する", () => {
    const bigHtml = "あ".repeat(300_000); // マルチバイトで実サイズを稼ぐ
    const entry = { value: { kind: "PAGE", html: bigHtml }, lastModified: 99, tags: [] };
    const restored = __deserializeEntry(__serializeEntry(entry)) as typeof entry;
    expect(restored.value.html).toBe(bigHtml);
    expect(restored).toEqual(entry);
  });

  // (5) tags 付きエントリの tags が復元される
  it("tags 付きエントリの tags を復元する", () => {
    const entry = { value: { html: "<html>t</html>" }, lastModified: 5, tags: ["spot", "fish"] };
    const restored = __deserializeEntry(__serializeEntry(entry)) as typeof entry;
    expect(restored.tags).toEqual(["spot", "fish"]);
  });
});

describe("cache-handler マルチアイテム分割保存（inlineCss 対応）", () => {
  // 分割条件の境界: MAX_CACHE_BYTES(380KB) 以下=単一 / 超え=分割 / PART_BYTES×MAX_PARTS 超=スキップ
  it("PART_BYTES 以下のペイロードは分割しない（単一チャンク）", () => {
    const payload = Buffer.alloc(__PART_BYTES);
    const parts = __splitPayload(payload);
    expect(parts.length).toBe(1);
    expect(parts[0].length).toBe(__PART_BYTES);
  });

  it("PART_BYTES 超は複数チャンクに分割され、結合すると元と一致する（ラウンドトリップ）", () => {
    // 実物に近い擬似ペイロード: inlineCss 後のトップ相当 ~480KB のランダムバイト
    const payload = Buffer.from(
      Array.from({ length: 480_000 }, () => Math.floor(Math.random() * 256))
    );
    const parts = __splitPayload(payload);
    expect(parts.length).toBe(2);
    expect(parts.every((p) => p.length <= __PART_BYTES)).toBe(true);
    expect(Buffer.concat(parts).equals(payload)).toBe(true);
  });

  it("分割チャンクの結合を deserializeEntry に通すと元エントリに戻る（保存経路の等価性）", () => {
    // serialize → split → concat → deserialize が split 無しと同一結果になること
    const bigHtml = "あ".repeat(400_000); // gzip 後も MAX_CACHE_BYTES 近辺になる大きさ
    const entry = { value: { kind: "PAGE", html: bigHtml }, lastModified: 1, tags: ["big"] };
    const payload = __serializeEntry(entry);
    const rejoined = Buffer.concat(__splitPayload(payload));
    expect(__deserializeEntry(rejoined)).toEqual(entry);
  });

  it("分割上限（PART_BYTES×MAX_PARTS）超のペイロードは console.warn を出してキャッシュしない", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const handler = new (CacheHandler as unknown as new () => {
        set: (key: string, data: unknown, ctx?: unknown) => Promise<void>;
      })();
      // 非圧縮性の巨大文字列（ランダム）で gzip 後も PART_BYTES×MAX_PARTS(1.4MB) を確実に超えさせる。
      // サイズチェックは doc.send より前に return するため AWS 実呼出は発生しない。
      const cap = __PART_BYTES * __MAX_PARTS;
      let random = "";
      for (let i = 0; i < cap + 400_000; i++) {
        random += String.fromCharCode(33 + Math.floor(Math.random() * 94));
      }
      await handler.set("big-key", { kind: "PAGE", html: random });
      expect(warnSpy).toHaveBeenCalledTimes(1);
      const msg = String(warnSpy.mock.calls[0][0]);
      expect(msg).toContain("[isr-cache] set skip");
      expect(msg).toContain("big-key");
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("定数の健全性: 分割上限は inlineCss 後のトップ(~480KB)を余裕でカバーする", () => {
    expect(__PART_BYTES * __MAX_PARTS).toBeGreaterThanOrEqual(1_000_000);
    expect(__MAX_CACHE_BYTES).toBeLessThanOrEqual(__PART_BYTES * __MAX_PARTS);
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
