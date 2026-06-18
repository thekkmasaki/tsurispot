/* eslint-disable @typescript-eslint/no-require-imports -- Next が runtime で require する CommonJS モジュールのため require/module.exports が必須 */
// Next.js カスタム ISR / データキャッシュハンドラ（CommonJS / Next が runtime で require する）
//
// 目的: App Runner のローカルディスク ISR キャッシュ（2026-05-19 に ENOSPC で
// 空 HTML を焼き付けた障害の原因）を、既存の Upstash Redis 共有キャッシュに置き換える。
// これで「生成ページ数 = Docker イメージ容量」の結合を断ち、部分 SSG + オンデマンド ISR を
// 安全化する（全件 SSG に戻さなくても空 HTML が出ない）。
//
// 設計上の不変条件:
//  - 空 / 壊れた HTML は絶対にキャッシュしない（空 HTML 焼付きの直接対策）
//  - Redis 失敗時は必ずミス扱いにフォールバックし、Next に再生成させる（安全側）
//  - ビルド ID で名前空間を分け、デプロイ毎に新世代キャッシュ（旧構造 HTML 混入を防止）

const zlib = require("node:zlib");
const fs = require("node:fs");
const path = require("node:path");

// Upstash REST の 1 リクエスト上限を超えないための保守的な上限（gzip 後 base64 バイト数）。
// 超える巨大ページはキャッシュせず毎回オンデマンド生成（正しく動くが遅いだけ）。
const MAX_CACHE_BYTES = Number(process.env.ISR_CACHE_MAX_BYTES || 900_000);
// 未アクセス時に Redis から自然消滅させる TTL（秒）。SWR のため revalidate より十分長く取る。
const DEFAULT_TTL_SECONDS = Number(
  process.env.ISR_CACHE_TTL_SECONDS || 60 * 60 * 24 * 7
);

// ── L1 インメモリキャッシュ（プロセス内・最小限）─────────────────────────────
// 目的: 同一キーの連続 read（クローラの再訪・人気ページ）で毎回 Redis GET を叩かず、
// Upstash のコマンド数を削減する（上限超過の再発防止）。cacheMaxMemorySize:0 で Next
// 既定の LRU を切っているため、ここで小さな L1 を持つ。
// 安全性: TTL を revalidate より十分短く（既定30s）取り、set()/revalidateTag() で必ず
// 無効化するので「二重キャッシュで古い HTML が滞留」する問題は起きない（L1 はこのハンドラ
// が単一の権威として管理する）。巨大エントリは L1 に載せずメモリを保護する。
const L1_TTL_MS = Number(process.env.ISR_L1_TTL_MS || 30_000);
const L1_MAX_ENTRIES = Number(process.env.ISR_L1_MAX_ENTRIES || 128);
const L1_MAX_ENTRY_BYTES = Number(process.env.ISR_L1_MAX_ENTRY_BYTES || 256_000);
const _l1 = new Map(); // key -> { entry, expiresAt }

function l1Get(key) {
  const hit = _l1.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    _l1.delete(key);
    return null;
  }
  return hit.entry;
}
function l1Set(key, entry, sizeBytes) {
  // 巨大エントリはメモリ保護のため L1 に載せない（Redis 経由は従来どおり機能）
  if (typeof sizeBytes === "number" && sizeBytes > L1_MAX_ENTRY_BYTES) {
    _l1.delete(key);
    return;
  }
  // delete→set で挿入順を更新（Map は挿入順を保持＝近似 LRU）
  _l1.delete(key);
  _l1.set(key, { entry, expiresAt: Date.now() + L1_TTL_MS });
  // 件数上限を超えたら最古を捨てる
  while (_l1.size > L1_MAX_ENTRIES) {
    const oldest = _l1.keys().next().value;
    if (oldest === undefined) break;
    _l1.delete(oldest);
  }
}
function l1Delete(key) {
  _l1.delete(key);
}
function l1Clear() {
  _l1.clear();
}

let _redis = null; // null=未初期化 / false=無効 / Redis=有効
function getRedis() {
  if (_redis !== null) return _redis || null;
  const url = (process.env.UPSTASH_REDIS_REST_URL || "").trim();
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || "").trim();
  if (url.startsWith("https://") && token.length > 10) {
    try {
      // 遅延require: 未設定時・ビルド時・テスト時に @upstash/redis を読み込まない。
      // 依存が解決できない環境でも throw せず無効化（安全側フォールバック）。
      const { Redis } = require("@upstash/redis");
      // automaticDeserialization=false: base64 文字列をそのまま往復させる
      _redis = new Redis({ url, token, automaticDeserialization: false });
    } catch {
      _redis = false;
    }
  } else {
    _redis = false;
  }
  return _redis || null;
}

// Buffer / Uint8Array（RSC payload・body 等）を JSON で安全に往復させる
function serializeEntry(entry) {
  const json = JSON.stringify(entry, (_key, value) => {
    // 重要: JSON.stringify は replacer より先に値の toJSON() を呼ぶ。Buffer は
    // toJSON() で { type: "Buffer", data: number[] } に変換済みで届くため、
    // Buffer.isBuffer では捕捉できない。このシェイプを検出して base64 化する。
    if (
      value &&
      typeof value === "object" &&
      value.type === "Buffer" &&
      Array.isArray(value.data)
    ) {
      return { __isrBuf: Buffer.from(value.data).toString("base64") };
    }
    // 素の Uint8Array は toJSON を持たないため raw のまま届く。
    if (value instanceof Uint8Array)
      return { __isrBuf: Buffer.from(value).toString("base64") };
    return value;
  });
  return zlib.gzipSync(Buffer.from(json, "utf8")).toString("base64");
}
function deserializeEntry(b64) {
  const json = zlib.gunzipSync(Buffer.from(b64, "base64")).toString("utf8");
  return JSON.parse(json, (_key, value) => {
    if (value && typeof value === "object" && typeof value.__isrBuf === "string")
      return Buffer.from(value.__isrBuf, "base64");
    return value;
  });
}

// 空 / 壊れたページ値はキャッシュ拒否（kind 名がバージョンで変わっても html 空で弾く）
function isCacheableValue(value) {
  if (value == null || typeof value !== "object") return true;
  if ("html" in value) {
    const html = value.html;
    if (html == null) return false;
    if (typeof html === "string" && html.trim().length === 0) return false;
  }
  return true;
}

function readBuildId(options) {
  const candidates = [];
  if (options && options.serverDistDir)
    candidates.push(path.join(options.serverDistDir, "..", "BUILD_ID"));
  candidates.push(path.join(process.cwd(), ".next", "BUILD_ID"));
  for (const p of candidates) {
    try {
      const id = fs.readFileSync(p, "utf8").trim();
      if (id) return id;
    } catch {
      /* 次の候補へ */
    }
  }
  return process.env.NEXT_BUILD_ID || "nobuild";
}

module.exports = class IsrRedisCacheHandler {
  constructor(options) {
    this.options = options || {};
    const buildId = readBuildId(this.options);
    this.keyPrefix = `isr:${buildId}:`;
    this.tagPrefix = `isrtag:${buildId}:`;
  }

  _k(cacheKey) {
    return this.keyPrefix + cacheKey;
  }
  _tk(tag) {
    return this.tagPrefix + tag;
  }

  async get(cacheKey) {
    const k = this._k(cacheKey);
    const cached = l1Get(k);
    if (cached) return cached; // L1 ヒット → Redis を叩かない（コマンド削減）
    const redis = getRedis();
    if (!redis) return null;
    try {
      const stored = await redis.get(k);
      if (!stored || typeof stored !== "string") return null;
      const entry = deserializeEntry(stored); // { value, lastModified, tags }
      l1Set(k, entry, stored.length); // 次回の同一 read を L1 で吸収
      return entry;
    } catch {
      return null; // 失敗 → ミス扱い → Next が再生成（安全）
    }
  }

  async set(cacheKey, data, ctx) {
    const k = this._k(cacheKey);
    const redis = getRedis();
    if (!redis) {
      l1Delete(k); // Redis 無しでも L1 に古いものを残さない
      return;
    }
    try {
      // 削除指示
      if (data == null) {
        await redis.del(k);
        l1Delete(k);
        return;
      }
      // 空 / 壊れたページは絶対に焼き付けない
      if (!isCacheableValue(data)) {
        l1Delete(k);
        return;
      }

      const tags = (ctx && ctx.tags) || (data && data.tags) || [];
      const now = Date.now();
      const payload = serializeEntry({ value: data, lastModified: now, tags });
      if (payload.length > MAX_CACHE_BYTES) {
        l1Delete(k);
        return; // 大きすぎ → 非キャッシュ（毎回生成で正常動作）
      }

      const revalidate =
        ctx && typeof ctx.revalidate === "number" ? ctx.revalidate : 0;
      const ttl = Math.max(revalidate, DEFAULT_TTL_SECONDS);
      await redis.set(k, payload, { ex: ttl });
      // L1 も更新（Redis と同じ shape）。ISR 再生成直後の read が即 fresh を返す。
      l1Set(k, { value: data, lastModified: now, tags }, payload.length);

      if (Array.isArray(tags) && tags.length > 0) {
        const pipeline = redis.pipeline();
        for (const tag of tags) {
          pipeline.sadd(this._tk(tag), cacheKey);
          pipeline.expire(this._tk(tag), ttl);
        }
        await pipeline.exec();
      }
    } catch {
      // 書込失敗は致命でない（次回再生成）。壊れたエントリは残さない。
      l1Delete(k);
    }
  }

  async revalidateTag(tags) {
    // タグ無効化時は L1 を全クリア（低頻度なのでコスト無視。古い HTML 滞留を防ぐ安全側）
    l1Clear();
    const redis = getRedis();
    if (!redis) return;
    const list = Array.isArray(tags) ? tags : [tags];
    try {
      for (const tag of list) {
        if (!tag) continue;
        const members = await redis.smembers(this._tk(tag));
        const pipeline = redis.pipeline();
        if (Array.isArray(members)) {
          for (const k of members) pipeline.del(this._k(k));
        }
        pipeline.del(this._tk(tag));
        await pipeline.exec();
      }
    } catch {
      /* ベストエフォート */
    }
  }

  resetRequestCache() {}
};

// テスト用にシリアライズ補助を公開（本体動作には影響しない）
module.exports.__serializeEntry = serializeEntry;
module.exports.__deserializeEntry = deserializeEntry;
module.exports.__isCacheableValue = isCacheableValue;
// テスト用に L1 ヘルパーを公開（本体動作には影響しない）
module.exports.__l1Get = l1Get;
module.exports.__l1Set = l1Set;
module.exports.__l1Delete = l1Delete;
module.exports.__l1Clear = l1Clear;
module.exports.__l1Size = () => _l1.size;
module.exports.__L1_MAX_ENTRIES = L1_MAX_ENTRIES;
module.exports.__L1_MAX_ENTRY_BYTES = L1_MAX_ENTRY_BYTES;
