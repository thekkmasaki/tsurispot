/* eslint-disable @typescript-eslint/no-require-imports -- Next が runtime で require する CommonJS モジュールのため require/module.exports が必須 */
// Next.js カスタム ISR / データキャッシュハンドラ（CommonJS / Next が runtime で require する）
//
// 目的: App Runner のローカルディスク ISR キャッシュ（2026-05-19 に ENOSPC で
// 空 HTML を焼き付けた障害の原因）を、共有キャッシュ（DynamoDB 単一テーブル tsurispot）に
// 置き換える。これで「生成ページ数 = Docker イメージ容量」の結合を断ち、部分 SSG +
// オンデマンド ISR を安全化する（全件 SSG に戻さなくても空 HTML が出ない）。
// 旧実装は Upstash Redis だったが、月間リクエスト上限に達するため AWS(DynamoDB) に移行。
//
// 設計上の不変条件（旧実装から維持）:
//  - 空 / 壊れた HTML は絶対にキャッシュしない（空 HTML 焼付きの直接対策）
//  - バックエンド失敗時は必ずミス扱いにフォールバックし、Next に再生成させる（安全側）
//  - ビルド ID で名前空間を分け、デプロイ毎に新世代キャッシュ（旧構造 HTML 混入を防止）
//  - L1 インメモリキャッシュで連続 read を吸収し、バックエンドアクセス数を抑える
//
// DynamoDB データモデル:
//  本体  pk=ISR#{buildId}        sk=KEY#{cacheKey}  data=base64(gzip(JSON))  ttl=epoch
//  タグ  pk=ISRTAG#{buildId}#{tag} sk=KEY#{cacheKey}  ttl=epoch

const zlib = require("node:zlib");
const fs = require("node:fs");
const path = require("node:path");

const TABLE = "tsurispot";

// DynamoDB item は最大 400KB。pk/sk/ttl の余白を見て gzip 後 base64 の上限を保守的に。
// 超える巨大ページはキャッシュせず毎回オンデマンド生成（正しく動くが遅いだけ）。
const MAX_CACHE_BYTES = Number(process.env.ISR_CACHE_MAX_BYTES || 360_000);
// 未アクセス時に自然消滅させる TTL（秒）。SWR のため revalidate より十分長く取る。
const DEFAULT_TTL_SECONDS = Number(
  process.env.ISR_CACHE_TTL_SECONDS || 60 * 60 * 24 * 7
);

// ── L1 インメモリキャッシュ（プロセス内・最小限）─────────────────────────────
// 目的: 同一キーの連続 read（クローラの再訪・人気ページ）で毎回 DynamoDB GET を叩かず、
// 読み取り回数を削減する。cacheMaxMemorySize:0 で Next 既定の LRU を切っているため、
// ここで小さな L1 を持つ。
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
  // 巨大エントリはメモリ保護のため L1 に載せない（バックエンド経由は従来どおり機能）
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

let _doc = null; // null=未初期化 / false=無効 / DocumentClient=有効
function getDoc() {
  if (_doc !== null) return _doc || null;
  try {
    // 遅延require: ビルド時・テスト時に aws-sdk を読み込まない。
    // 依存が解決できない環境でも throw せず無効化（安全側フォールバック）。
    const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
    const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "ap-northeast-1",
    });
    _doc = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  } catch {
    _doc = false;
  }
  return _doc || null;
}

// aws-sdk のコマンドを遅延 require（getDoc 同様、未解決でも安全側）
function cmds() {
  const {
    GetCommand,
    PutCommand,
    DeleteCommand,
    QueryCommand,
  } = require("@aws-sdk/lib-dynamodb");
  return { GetCommand, PutCommand, DeleteCommand, QueryCommand };
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

function ttlEpoch(seconds) {
  return Math.floor(Date.now() / 1000) + seconds;
}

module.exports = class IsrDynamoCacheHandler {
  constructor(options) {
    this.options = options || {};
    const buildId = readBuildId(this.options);
    this.pk = `ISR#${buildId}`; // 本体パーティション
    this.tagPrefix = `ISRTAG#${buildId}#`; // タグ別パーティション接頭辞
  }

  _lk(cacheKey) {
    // L1 用のプロセス内ユニークキー
    return `${this.pk}|${cacheKey}`;
  }
  _sk(cacheKey) {
    return `KEY#${cacheKey}`;
  }
  _tagPk(tag) {
    return `${this.tagPrefix}${tag}`;
  }

  async get(cacheKey) {
    const lk = this._lk(cacheKey);
    const cached = l1Get(lk);
    if (cached) return cached; // L1 ヒット → DynamoDB を叩かない
    const doc = getDoc();
    if (!doc) return null;
    try {
      const { GetCommand } = cmds();
      const res = await doc.send(
        new GetCommand({
          TableName: TABLE,
          Key: { pk: this.pk, sk: this._sk(cacheKey) },
        })
      );
      const stored = res.Item && res.Item.data;
      if (!stored || typeof stored !== "string") return null;
      const entry = deserializeEntry(stored); // { value, lastModified, tags }
      l1Set(lk, entry, stored.length); // 次回の同一 read を L1 で吸収
      return entry;
    } catch {
      return null; // 失敗 → ミス扱い → Next が再生成（安全）
    }
  }

  async set(cacheKey, data, ctx) {
    const lk = this._lk(cacheKey);
    const doc = getDoc();
    if (!doc) {
      l1Delete(lk); // バックエンド無しでも L1 に古いものを残さない
      return;
    }
    try {
      const { PutCommand, DeleteCommand } = cmds();
      // 削除指示
      if (data == null) {
        await doc.send(
          new DeleteCommand({
            TableName: TABLE,
            Key: { pk: this.pk, sk: this._sk(cacheKey) },
          })
        );
        l1Delete(lk);
        return;
      }
      // 空 / 壊れたページは絶対に焼き付けない
      if (!isCacheableValue(data)) {
        l1Delete(lk);
        return;
      }

      const tags = (ctx && ctx.tags) || (data && data.tags) || [];
      const now = Date.now();
      const payload = serializeEntry({ value: data, lastModified: now, tags });
      if (payload.length > MAX_CACHE_BYTES) {
        l1Delete(lk);
        return; // 大きすぎ（>DynamoDB item上限） → 非キャッシュ（毎回生成で正常動作）
      }

      const revalidate =
        ctx && typeof ctx.revalidate === "number" ? ctx.revalidate : 0;
      const ttl = Math.max(revalidate, DEFAULT_TTL_SECONDS);
      const exp = ttlEpoch(ttl);
      await doc.send(
        new PutCommand({
          TableName: TABLE,
          Item: { pk: this.pk, sk: this._sk(cacheKey), data: payload, ttl: exp },
        })
      );
      // L1 も更新（バックエンドと同じ shape）。ISR 再生成直後の read が即 fresh を返す。
      l1Set(lk, { value: data, lastModified: now, tags }, payload.length);

      // タグ → cacheKey の逆引きを別パーティションに記録（revalidateTag 用）
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tag of tags) {
          if (!tag) continue;
          await doc.send(
            new PutCommand({
              TableName: TABLE,
              Item: { pk: this._tagPk(tag), sk: this._sk(cacheKey), ttl: exp },
            })
          );
        }
      }
    } catch {
      // 書込失敗は致命でない（次回再生成）。壊れたエントリは残さない。
      l1Delete(lk);
    }
  }

  async revalidateTag(tags) {
    // タグ無効化時は L1 を全クリア（低頻度なのでコスト無視。古い HTML 滞留を防ぐ安全側）
    l1Clear();
    const doc = getDoc();
    if (!doc) return;
    const { QueryCommand, DeleteCommand } = cmds();
    const list = Array.isArray(tags) ? tags : [tags];
    try {
      for (const tag of list) {
        if (!tag) continue;
        const tagPk = this._tagPk(tag);
        // タグパーティションの全メンバー(sk=KEY#...)を取得
        const members = [];
        let lastKey = undefined;
        do {
          const res = await doc.send(
            new QueryCommand({
              TableName: TABLE,
              KeyConditionExpression: "pk = :pk",
              ExpressionAttributeValues: { ":pk": tagPk },
              ProjectionExpression: "sk",
              ExclusiveStartKey: lastKey,
            })
          );
          for (const it of res.Items || []) members.push(it.sk);
          lastKey = res.LastEvaluatedKey;
        } while (lastKey);
        // 本体エントリとタグ逆引きの両方を削除
        for (const sk of members) {
          await doc.send(
            new DeleteCommand({ TableName: TABLE, Key: { pk: this.pk, sk } })
          );
          await doc.send(
            new DeleteCommand({ TableName: TABLE, Key: { pk: tagPk, sk } })
          );
        }
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
