import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createHash } from "node:crypto";
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
  __l1Bytes,
  __L1_MAX_ENTRIES,
  __L1_MAX_ENTRY_BYTES,
  __L1_MAX_BYTES,
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
  __l1Bytes: () => number;
  __L1_MAX_ENTRIES: number;
  __L1_MAX_ENTRY_BYTES: number;
  __L1_MAX_BYTES: number;
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

// 2026-07 バイト基準LRU: 件数だけでなく合計バイトでも上限管理し、エントリサイズの偏りによる
// V8 ヒープ OOM（2026-07-08〜09 の本番障害）を構造的に防ぐ退行テスト。
describe("cache-handler L1 バイト基準LRU（OOM 構造対策）", () => {
  beforeEach(() => __l1Clear());

  it("合計バイトが上限を超えると、件数に余裕があっても最古から追い出す", () => {
    // 1件は L1_MAX_ENTRY_BYTES(520KB) 未満にしないと L1 に載らない。その範囲で、
    // 合計が L1_MAX_BYTES(160MB) を超える件数を入れる。件数は上限(1024)未満に収まるため、
    // 「件数には余裕があるがバイト超過で追い出す」経路を検証できる。
    const per = __L1_MAX_ENTRY_BYTES - 1;
    const count = Math.ceil(__L1_MAX_BYTES / per) + 20; // 上限を確実に超える件数
    for (let i = 0; i < count; i++) __l1Set(`b-${i}`, { value: i }, per);
    // 合計は常に上限以内に収まっている
    expect(__l1Bytes()).toBeLessThanOrEqual(__L1_MAX_BYTES);
    // 件数上限(1024)には達していないのに、バイト超過で件数が減っている
    expect(count).toBeLessThan(__L1_MAX_ENTRIES);
    expect(__l1Size()).toBeLessThan(count);
    expect(__l1Get("b-0")).toBeNull(); // 最古は追い出された
    expect(__l1Get(`b-${count - 1}`)).toEqual({ value: count - 1 }); // 最新は残る
  });

  it("l1Set/l1Delete/期限切れ/clear で合計バイトが正しく増減する", () => {
    __l1Set("x", { value: 1 }, 1000);
    __l1Set("y", { value: 2 }, 2000);
    expect(__l1Bytes()).toBe(3000);
    // 同一キーの置換は旧バイトを減算してから新バイトを加算
    __l1Set("x", { value: 1 }, 500);
    expect(__l1Bytes()).toBe(2500);
    // 削除で減算
    __l1Delete("y");
    expect(__l1Bytes()).toBe(500);
    // clear で 0
    __l1Clear();
    expect(__l1Bytes()).toBe(0);
  });

  it("上限超過エントリ(>520KB)は L1 に載らず合計バイトも増えない", () => {
    __l1Set("huge", { value: "x" }, __L1_MAX_ENTRY_BYTES + 1);
    expect(__l1Get("huge")).toBeNull();
    expect(__l1Size()).toBe(0);
    expect(__l1Bytes()).toBe(0);
  });

  it("大量投入後も合計バイトは常に上限以内（OOM の直接ゲート）", () => {
    // 平均 ~150KB 相当を 5000 件投入しても、合計バイトが上限を超えない＝ヒープが読める
    for (let i = 0; i < 5000; i++) __l1Set(`k-${i}`, { value: i }, 150_000);
    expect(__l1Bytes()).toBeLessThanOrEqual(__L1_MAX_BYTES);
    expect(__l1Size()).toBeLessThanOrEqual(__L1_MAX_ENTRIES);
  });
});

// ── S3 バックエンド（ISR_CACHE_BACKEND=s3）──────────────────────────────────
// BACKEND はモジュールロード時に確定するため、vi.resetModules + env 設定 → 動的 import で
// s3 モードのモジュールを別途ロードする。クライアントは __setClientsForTest で決定的に注入
// （遅延 require への vi.mock 依存を避ける。2026-06 の cache-handler 改修ミス障害の教訓）。
describe("cache-handler S3 バックエンド（ISR_CACHE_BACKEND=s3）", () => {
  type HandlerInstance = {
    get: (key: string) => Promise<unknown>;
    set: (key: string, data: unknown, ctx?: unknown) => Promise<void>;
    revalidateTag: (tags: string | string[]) => Promise<void>;
  };
  type CacheModule = (new (options?: unknown) => HandlerInstance) & {
    __setClientsForTest: (clients: { s3?: unknown; doc?: unknown }) => void;
    __s3KeyFor: (buildId: string, cacheKey: string) => string;
    __BACKEND: string;
    __S3_BUCKET: string;
    __l1Clear: () => void;
  };
  type AwsCall = { cmd: string; input: Record<string, unknown> };
  type FakeCommand = { constructor: { name: string }; input: Record<string, unknown> };

  // フェイク S3: PutObject の Body を Key 別に保持し、GetObject は実 SDK と同じ
  // { Body: { transformToByteArray } } シェイプ（Uint8Array）を返す。
  function makeFakeS3(store: Map<string, Uint8Array>, calls: AwsCall[]) {
    return {
      send: async (command: FakeCommand) => {
        const cmd = command.constructor.name;
        calls.push({ cmd, input: command.input });
        const key = String(command.input.Key);
        if (cmd === "PutObjectCommand") {
          store.set(key, new Uint8Array(command.input.Body as Buffer));
          return {};
        }
        if (cmd === "GetObjectCommand") {
          const stored = store.get(key);
          if (!stored) {
            const err = new Error("NoSuchKey");
            err.name = "NoSuchKey";
            throw err;
          }
          return { Body: { transformToByteArray: async () => stored } };
        }
        if (cmd === "DeleteObjectCommand") {
          store.delete(key);
          return {};
        }
        throw new Error(`unexpected S3 command: ${cmd}`);
      },
    };
  }

  // フェイク DynamoDB DocumentClient: タグ行の Put/Delete を記録し、Query は指定 Items を返す
  function makeFakeDoc(calls: AwsCall[], queryItems: Array<{ sk: string }> = []) {
    return {
      send: async (command: FakeCommand) => {
        const cmd = command.constructor.name;
        calls.push({ cmd, input: command.input });
        if (cmd === "QueryCommand") return { Items: queryItems, LastEvaluatedKey: undefined };
        return {};
      },
    };
  }

  async function loadModule(backend: "s3" | undefined): Promise<CacheModule> {
    vi.resetModules();
    if (backend) process.env.ISR_CACHE_BACKEND = backend;
    else delete process.env.ISR_CACHE_BACKEND;
    const mod = (await import("../../cache-handler.js")) as unknown as { default: CacheModule };
    return mod.default;
  }

  afterEach(() => {
    delete process.env.ISR_CACHE_BACKEND;
    vi.resetModules();
  });

  it("__s3KeyFor は prefix/buildId/sha256hex(64桁) を導出する（決定的）", async () => {
    const Mod = await loadModule("s3");
    const key = Mod.__s3KeyFor("build-abc", "/spots/hiraiso");
    const expectedHash = createHash("sha256").update("/spots/hiraiso").digest("hex");
    expect(Mod.__BACKEND).toBe("s3");
    expect(key).toBe(`ISR/build-abc/${expectedHash}`);
    expect(key.split("/")[2]).toMatch(/^[0-9a-f]{64}$/);
  });

  // 2026-06 本番障害（segmentData Map 往復欠落→全 ISR フル動的レンダ→CPU100%）の直接ゲート。
  // S3 経路の set→get で同一シェイプが Map#get() 可能な状態で復元されること。
  it("set→get フルラウンドトリップ: segmentData(Map<string,Buffer>) が Map のまま復元される", async () => {
    const Mod = await loadModule("s3");
    const store = new Map<string, Uint8Array>();
    const s3Calls: AwsCall[] = [];
    const docCalls: AwsCall[] = [];
    Mod.__setClientsForTest({ s3: makeFakeS3(store, s3Calls), doc: makeFakeDoc(docCalls) });
    Mod.__l1Clear();
    const handler = new Mod();

    const value = {
      kind: "APP_PAGE",
      html: Buffer.from("<html>s3-ok</html>"),
      rscData: Buffer.from("RSC"),
      segmentData: new Map([["/__PAGE__", Buffer.from("seg-buf")]]),
      status: 200,
    };
    await handler.set("/spots/test", value, { revalidate: 604800, tags: [] });

    // Put の内容検証（Bucket / ContentType / デバッグ用メタデータ）
    const put = s3Calls.find((c) => c.cmd === "PutObjectCommand");
    expect(put).toBeDefined();
    expect(put!.input.Bucket).toBe(Mod.__S3_BUCKET);
    expect(put!.input.ContentType).toBe("application/gzip");
    expect((put!.input.Metadata as Record<string, string>)["cache-key"]).toContain("spots");
    expect(String(put!.input.Key)).toMatch(/^ISR\/[^/]+\/[0-9a-f]{64}$/);

    // L1 を消して S3 読み経路を強制
    Mod.__l1Clear();
    const restored = (await handler.get("/spots/test")) as {
      value: { segmentData: Map<string, Buffer>; html: Buffer };
    };
    expect(s3Calls.some((c) => c.cmd === "GetObjectCommand")).toBe(true);
    expect(restored.value.segmentData).toBeInstanceOf(Map);
    expect((restored.value.segmentData.get("/__PAGE__") as Buffer).toString()).toBe("seg-buf");
    expect(restored.value.html.toString()).toBe("<html>s3-ok</html>");
    // 本体の DynamoDB 書込は発生しない（タグ無しなので doc は完全に未使用）
    expect(docCalls.length).toBe(0);
  });

  it("存在しないキーの get はミス（null）を返す", async () => {
    const Mod = await loadModule("s3");
    Mod.__setClientsForTest({ s3: makeFakeS3(new Map(), []), doc: makeFakeDoc([]) });
    Mod.__l1Clear();
    const handler = new Mod();
    expect(await handler.get("/spots/no-such-page")).toBeNull();
  });

  it("set(null) は S3 DeleteObject を発行し、DynamoDB 本体 Delete は発行しない", async () => {
    const Mod = await loadModule("s3");
    const s3Calls: AwsCall[] = [];
    const docCalls: AwsCall[] = [];
    Mod.__setClientsForTest({ s3: makeFakeS3(new Map(), s3Calls), doc: makeFakeDoc(docCalls) });
    Mod.__l1Clear();
    const handler = new Mod();
    await handler.set("/spots/gone", null);
    expect(s3Calls.map((c) => c.cmd)).toEqual(["DeleteObjectCommand"]);
    expect(docCalls.length).toBe(0);
  });

  it("tags 付き set は S3 Put + DynamoDB タグ逆引き行 Put の両方を発行する", async () => {
    const Mod = await loadModule("s3");
    const s3Calls: AwsCall[] = [];
    const docCalls: AwsCall[] = [];
    Mod.__setClientsForTest({ s3: makeFakeS3(new Map(), s3Calls), doc: makeFakeDoc(docCalls) });
    Mod.__l1Clear();
    const handler = new Mod();
    await handler.set(
      "/spots/tagged",
      { kind: "PAGE", html: "<html>t</html>" },
      { revalidate: 3600, tags: ["_N_T_/spots/tagged"] }
    );
    expect(s3Calls.filter((c) => c.cmd === "PutObjectCommand").length).toBe(1);
    const tagPuts = docCalls.filter((c) => c.cmd === "PutCommand");
    expect(tagPuts.length).toBe(1);
    const item = tagPuts[0].input.Item as { pk: string; sk: string; ttl: number };
    expect(item.pk).toContain("ISRTAG#");
    expect(item.pk).toContain("_N_T_/spots/tagged");
    expect(item.sk).toBe("KEY#/spots/tagged");
    expect(typeof item.ttl).toBe("number");
  });

  it("revalidateTag は本体を S3 DeleteObject、タグ行を DynamoDB Delete で消す", async () => {
    const Mod = await loadModule("s3");
    const s3Calls: AwsCall[] = [];
    const docCalls: AwsCall[] = [];
    // タグ partition に /spots/target がぶら下がっている状態を Query で返す
    Mod.__setClientsForTest({
      s3: makeFakeS3(new Map(), s3Calls),
      doc: makeFakeDoc(docCalls, [{ sk: "KEY#/spots/target" }]),
    });
    Mod.__l1Clear();
    const handler = new Mod();
    await handler.revalidateTag("_N_T_/spots/target");

    // 本体削除: S3 側で sha256(/spots/target) のキーを削除
    const del = s3Calls.find((c) => c.cmd === "DeleteObjectCommand");
    expect(del).toBeDefined();
    const expectedHash = createHash("sha256").update("/spots/target").digest("hex");
    expect(String(del!.input.Key).endsWith(expectedHash)).toBe(true);
    // DynamoDB Delete は2発: (1)env flip 復活防止の本体行(pk=ISR#)冪等掃除 (2)タグ行(pk=ISRTAG#)
    const docDeletes = docCalls.filter((c) => c.cmd === "DeleteCommand");
    expect(docDeletes.length).toBe(2);
    const pks = docDeletes.map((c) => (c.input.Key as { pk: string }).pk);
    expect(pks.some((pk) => pk.startsWith("ISR#"))).toBe(true);
    expect(pks.some((pk) => pk.startsWith("ISRTAG#"))).toBe(true);
  });

  it("revalidateTag: S3 本体削除が失敗したらタグ行を残す（再無効化を可能にする）", async () => {
    const Mod = await loadModule("s3");
    const docCalls: AwsCall[] = [];
    // S3 は DeleteObject で必ず throw、Get/Put は使わない
    const throwingS3 = {
      send: async (command: FakeCommand) => {
        if (command.constructor.name === "DeleteObjectCommand") throw new Error("S3 down");
        return {};
      },
    };
    Mod.__setClientsForTest({
      s3: throwingS3,
      doc: makeFakeDoc(docCalls, [{ sk: "KEY#/spots/target" }]),
    });
    Mod.__l1Clear();
    const handler = new Mod();
    await handler.revalidateTag("_N_T_/spots/target");
    // タグ行(pk=ISRTAG#)の Delete は発行されない（本体が残るので索引を残して再試行可能に）
    const tagDeletes = docCalls.filter(
      (c) => c.cmd === "DeleteCommand" && (c.input.Key as { pk: string }).pk.startsWith("ISRTAG#")
    );
    expect(tagDeletes.length).toBe(0);
  });

  it("S3 put が throw しても set は throw しない（ミス扱い・次回再生成）", async () => {
    const Mod = await loadModule("s3");
    const throwingS3 = { send: async () => { throw new Error("boom"); } };
    Mod.__setClientsForTest({ s3: throwingS3, doc: makeFakeDoc([]) });
    Mod.__l1Clear();
    const handler = new Mod();
    await expect(
      handler.set("/spots/err", { kind: "PAGE", html: "<html>x</html>" })
    ).resolves.toBeUndefined();
    // 失敗後の get もミス（壊れた L1 を残さない）
    expect(await handler.get("/spots/err")).toBeNull();
  });

  it("env 未設定（デフォルト）では S3 クライアントに一切触れない（現行挙動の凍結）", async () => {
    const Mod = await loadModule(undefined);
    expect(Mod.__BACKEND).toBe("dynamodb");
    const s3Calls: AwsCall[] = [];
    const docCalls: AwsCall[] = [];
    Mod.__setClientsForTest({ s3: makeFakeS3(new Map(), s3Calls), doc: makeFakeDoc(docCalls) });
    Mod.__l1Clear();
    const handler = new Mod();
    await handler.set("/spots/dyn", { kind: "PAGE", html: "<html>d</html>" }, { revalidate: 60 });
    Mod.__l1Clear();
    await handler.get("/spots/dyn");
    expect(s3Calls.length).toBe(0); // S3 は完全に不使用
    expect(docCalls.some((c) => c.cmd === "PutCommand")).toBe(true); // 従来どおり DynamoDB へ
    expect(docCalls.some((c) => c.cmd === "GetCommand")).toBe(true);
  });
});
