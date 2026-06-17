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
    const redis = getRedis();
    if (!redis) return null;
    try {
      const stored = await redis.get(this._k(cacheKey));
      if (!stored || typeof stored !== "string") return null;
      return deserializeEntry(stored); // { value, lastModified, tags }
    } catch {
      return null; // 失敗 → ミス扱い → Next が再生成（安全）
    }
  }

  async set(cacheKey, data, ctx) {
    const redis = getRedis();
    if (!redis) return;
    try {
      // 削除指示
      if (data == null) {
        await redis.del(this._k(cacheKey));
        return;
      }
      // 空 / 壊れたページは絶対に焼き付けない
      if (!isCacheableValue(data)) return;

      const tags = (ctx && ctx.tags) || (data && data.tags) || [];
      const payload = serializeEntry({ value: data, lastModified: Date.now(), tags });
      if (payload.length > MAX_CACHE_BYTES) return; // 大きすぎ → 非キャッシュ（毎回生成で正常動作）

      const revalidate =
        ctx && typeof ctx.revalidate === "number" ? ctx.revalidate : 0;
      const ttl = Math.max(revalidate, DEFAULT_TTL_SECONDS);
      await redis.set(this._k(cacheKey), payload, { ex: ttl });

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
    }
  }

  async revalidateTag(tags) {
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
