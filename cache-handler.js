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
//  本体  pk=ISR#{buildId}        sk=KEY#{cacheKey}  data=gzip(JSON) を B型バイナリ保存  ttl=epoch
//  タグ  pk=ISRTAG#{buildId}#{tag} sk=KEY#{cacheKey}  ttl=epoch
// 2026-07: data は旧 base64 文字列から gzip 生バイトの B型バイナリ保存へ変更。base64 の 33% 膨張を
// 除去し WRU（書込課金）を約 25% 削減。読み返しは SDK が素の Uint8Array で返すため両形式対応で復元。
//
// 2026-07 (S3移行): DynamoDB は 1KB=1WRU 課金のため平均 ~150KB のエントリで 1 Put ~150WRU を
// 消費し、書込がコストの 85%（月$66-78ペース）を占めていた。ISR_CACHE_BACKEND=s3 で
// ペイロード本体を S3 へ置く（PUT 課金はサイズ非依存 → 月$4-8 見込み）:
//  本体  s3://{ISR_CACHE_S3_BUCKET}/{ISR_CACHE_S3_PREFIX}/{buildId}/{sha256(cacheKey)}  Body=gzip(JSON)
//  タグ  従来どおり DynamoDB（pk=ISRTAG#...。~1WRU/行で誤差のため温存し、UGC 即時反映の
//        revalidateTag の Query→Delete フローを変えない）
//  TTL   S3 Lifecycle（ISR/ 14日 Expiration）が代替。上書き PUT で延命され、旧 buildId 世代は自然消滅。
//  分割  S3 は 400KB 制約が無いため分割保存(parts/gen)は不使用。アトミック上書き＋strong consistency
//        により gen 世代検証そのものが不要。
// DynamoDB 経路はロールバック用に温存（env 未設定時のデフォルトは dynamodb ＝安全側）。

const zlib = require("node:zlib");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const TABLE = "tsurispot";

// ── キャッシュバックエンド選択 ─────────────────────────────────────────────
// "s3": ペイロード本体を S3、タグ逆引きは DynamoDB のハイブリッド。
// デフォルトは dynamodb: env が消えた場合に従来挙動へ自動フォールバックする安全側。
const BACKEND = process.env.ISR_CACHE_BACKEND === "s3" ? "s3" : "dynamodb";
const S3_BUCKET = process.env.ISR_CACHE_S3_BUCKET || "tsurispot-isr-cache";
const S3_PREFIX = process.env.ISR_CACHE_S3_PREFIX || "ISR";
// S3 は分割不要なので上限による set スキップは無いが、異常な巨大ページの観測用しきい値は残す
const S3_WARN_BYTES = Number(process.env.ISR_CACHE_S3_WARN_BYTES || 2_000_000);
// タグ逆引き行（DynamoDB）の TTL。S3 本体は Lifecycle（ISR/ 14日）で消えるため、索引がそれより
// 短命だと 7〜14日窓で「索引だけ先に失効 → revalidateTag が本体 S3 に到達できず無効化が空振り」
// になる。索引は本体寿命（Lifecycle 14日）を必ず上回るよう 15日に取り、本体到達性を保証する。
const S3_TAG_TTL_SECONDS = Number(
  process.env.ISR_CACHE_S3_TAG_TTL_SECONDS || 60 * 60 * 24 * 15
);
if (process.env.NODE_ENV === "production") {
  // デプロイ後の稼働バックエンド確認用（App Runner ログで backend=s3 を確認する運用手順あり）
  console.log(
    `[isr-cache] backend=${BACKEND}` +
      (BACKEND === "s3" ? ` bucket=${S3_BUCKET} prefix=${S3_PREFIX}` : "")
  );
}

// DynamoDB item は最大 400KB。pk/sk/ttl の余白を見て gzip 後の実保存バイトの上限を保守的に。
// 超える巨大ページはキャッシュせず毎回オンデマンド生成（正しく動くが遅いだけ）。
// 2026-06: トップ(/)のシリアライズ後が ~360KB 近辺で上限を超え set スキップ→毎回フル再生成
// (TTFB 7-9s) になっていたため、400KB item 上限に対し pk/sk/ttl 分の余白を残しつつ 380KB へ引上げ。
// 2026-07: gzip 生バイトを B型バイナリ保存に変更したため、サイズ判定は実保存バイト（gzip後の生バイト）
// を見る。旧 base64 は 33% 膨張していたため、同じ 380KB 上限でも実質的にキャッシュ可能サイズが +33%
// 緩和され、トップ等の大ページがキャッシュに載りやすくなる（TTFB 改善方向）。
const MAX_CACHE_BYTES = Number(process.env.ISR_CACHE_MAX_BYTES || 380_000);
// ── マルチアイテム分割保存（2026-07: experimental.inlineCss 対応）───────────────
// inlineCss で全ページの HTML に CSS(gzip後 +~110KB) が焼き込まれ、トップ(/)のシリアライズ後が
// ~480KB となり単一 item の 380KB 上限を確実に超える。従来は「上限超え = setスキップ = 毎回フル
// 再生成」で、トップの TTFB 7-9s 障害(2026-06)の再発条件になるため、上限超えのエントリは
// PART_BYTES 以下のチャンクに分割して複数 item(sk=KEY#{key}#p{n}) で保存する。
//  - MAX_CACHE_BYTES 以下: 従来どおり単一 item（形式不変・後方互換）
//  - 超え〜PART_BYTES×MAX_PARTS: 分割保存（先頭 item に parts数と世代genを記録）
//  - PART_BYTES×MAX_PARTS 超: 従来どおり非キャッシュ（warn、毎回生成で正常動作）
// 整合性: 書込は「末尾パート→先頭」の順、読出は gen 一致を全パートで検証し、
// 世代混在（同時書換え中の読み）は必ずミス扱い→Next が再生成（安全側）。
const PART_BYTES = Number(process.env.ISR_CACHE_PART_BYTES || 350_000);
const MAX_PARTS = Number(process.env.ISR_CACHE_MAX_PARTS || 4);
// 未アクセス時に自然消滅させる TTL（秒）。SWR のため revalidate より十分長く取る。
const DEFAULT_TTL_SECONDS = Number(
  process.env.ISR_CACHE_TTL_SECONDS || 60 * 60 * 24 * 7
);

// payload を PART_BYTES 以下のチャンク配列に分割する（純関数・テスト対象）
function splitPayload(payload) {
  const parts = [];
  for (let off = 0; off < payload.length; off += PART_BYTES) {
    parts.push(payload.subarray(off, off + PART_BYTES));
  }
  return parts;
}

// ── L1 インメモリキャッシュ（プロセス内）────────────────────────────────────
// 目的: 同一キーの連続 read（クローラの再訪・人気ページ）で毎回 DynamoDB GET ＋
// gunzip + JSON.parse + reviver（Buffer/Map 復元）を払わず、デシリアライズ済みエントリを
// プロセス内に常駐させる。cacheMaxMemorySize:0 で Next 既定の LRU を切っているため、
// この L1 が唯一のインメモリ層。
// チューニング (2026-06): 既定 128件/30s では人気ページもすぐ追い出され、ほぼ毎リクエストで
// 上記デシリアライズ（1エントリ ~144KB→展開で重い）を払い、App Runner のCPU床が健全期の
// 4-5倍に上昇していた。インスタンスのメモリ使用率は遊休が大半（4GB中 ~22%）。
// 実測: L1 を 128→512件/10分 にした結果、深夜CPU床 ~45%→~26%（半減）・レイテンシ床 ~1.5s→~1s、
// メモリは 22%→~31% で安全だった（512件で実質 +~0.3GB＝展開後 ~0.5-0.7MB/件）。
// まだメモリに大幅な余裕があるため 1536件 に増やし、ホット集合をより広く常駐させてピーク時の
// 配信デシリアライズをさらに削減する。概算メモリ +~1GB（合計 ~48%）。256KB超は L1 非載で保護。
// 安全性: set()/revalidateTag() で必ず無効化するので「二重キャッシュで古い HTML が滞留」は
// 起きない（L1 はこのハンドラが単一の権威として管理）。TTL は revalidate(86400s) より十分短い。
// 2026-07 (inlineCss対応): 全ページの gzip 後サイズが +~110KB 底上げされるため、
// 256KB のままだとスポット詳細(~260KB)やトップ(~480KB)が軒並み L1 非載になり、
// 2026-06 に修正した「毎リクエスト DynamoDB GET+デシリアライズで CPU 床 4-5倍」が再発する。
// エントリ上限を 520KB に引上げ（トップを含むホット集合を維持）、件数を 1536→1024 に減らして
// メモリ総量を概ね相殺する（展開後 ~0.8-1.0MB/件 × 1024 ≈ ~1GB、4GB 中 ~50% 以内を維持）。
// 2026-07 (S3移行): inlineCss は無効化済み（next.config.ts）でエントリは ~110KB 縮小したのに
// 件数が 1024 のままだった。S3 バックエンドでは L1 ミスのレイテンシが +20-50ms 増えるため
// 吸収層としての L1 の重要度が上がる。2048 件へ拡大（展開後 ~0.5-0.7MB/件 × 2048 ≈ ~1.2GB、
// 1536 件時代の安全実績と同水準）。
const L1_TTL_MS = Number(process.env.ISR_L1_TTL_MS || 600_000);
const L1_MAX_ENTRIES = Number(process.env.ISR_L1_MAX_ENTRIES || 2048);
const L1_MAX_ENTRY_BYTES = Number(process.env.ISR_L1_MAX_ENTRY_BYTES || 520_000);
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

let _s3 = null; // null=未初期化 / false=無効 / S3Client=有効
function getS3() {
  if (_s3 !== null) return _s3 || null;
  try {
    // 遅延require: getDoc() と同じパターン。依存が解決できない環境でも throw せず無効化。
    const https = require("node:https");
    const { S3Client } = require("@aws-sdk/client-s3");
    _s3 = new S3Client({
      region: process.env.AWS_REGION || "ap-northeast-1",
      // 「失敗=ミス=再生成」の安全側設計に合わせ、ハングよりタイムアウトを優先して短めに切る。
      // SDK デフォルト maxAttempts=3 だと S3 劣化時に 3×requestTimeout でブロックが伸び、
      // オリジンにリクエストが滞留する。GET ミスはページ再生成にフォールバックすれば済むので
      // fail-fast 寄り(2回)にして、劣化を素早くミス扱いへ倒す。
      maxAttempts: 2,
      // keepAlive は高頻度 GET（L1 ミス時）とデプロイ後ウォームアップのバーストに備え明示。
      requestHandler: {
        connectionTimeout: 1500,
        requestTimeout: 6000,
        httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 64 }),
      },
    });
  } catch {
    _s3 = false;
  }
  return _s3 || null;
}

function s3Cmds() {
  const {
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
  } = require("@aws-sdk/client-s3");
  return { GetObjectCommand, PutObjectCommand, DeleteObjectCommand };
}

// S3 の想定外エラー（AccessDenied・タイムアウト・バケット名/リージョン誤り等）を顕在化させる。
// 正常なミス（NoSuchKey/NotFound=未生成ページ）は静かにする。無言で握り潰すと
// IAM/バケット設定ミスが「全ミス→毎回再生成→CPU100%」としてサイレントに進行する（2026-06の教訓）。
// 全ミス時のログ洪水を避けるため 30 秒に 1 回へスロットルする。
let _lastS3Warn = 0;
function isNormalMiss(err) {
  const name = err && err.name;
  return name === "NoSuchKey" || name === "NotFound";
}
function warnS3(op, err) {
  if (isNormalMiss(err)) return;
  const now = Date.now();
  if (now - _lastS3Warn < 30_000) return;
  _lastS3Warn = now;
  console.warn(
    `[isr-cache] S3 ${op} error: ${(err && err.name) || err}: ${(err && err.message) || ""}`
  );
}

// cacheKey は URL パス等で S3 キーに不向きな文字を含み得るため sha256 hex に正規化する
function s3KeyFor(buildId, cacheKey) {
  const hash = crypto.createHash("sha256").update(String(cacheKey)).digest("hex");
  return `${S3_PREFIX}/${buildId}/${hash}`;
}

// Buffer / Uint8Array / Map（RSC payload・body・segmentData 等）を JSON で安全に往復させる
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
    // Next.js 16 の App Page キャッシュ値は segmentData を Map<string, Buffer> で持つ。
    // Map は toJSON を持たず JSON.stringify で {} に化けるため、エントリ配列で保持する。
    // 中の Buffer 値は再帰的に上の __isrBuf 分岐で base64 化される。
    if (value instanceof Map) {
      return { __isrMap: Array.from(value.entries()) };
    }
    return value;
  });
  return zlib.gzipSync(Buffer.from(json, "utf8"));
}
function deserializeEntry(stored) {
  // 旧形式: base64文字列 / 新形式: B型バイナリ（SDKは素のUint8Arrayで返す）
  const buf = typeof stored === "string" ? Buffer.from(stored, "base64") : stored;
  const json = zlib.gunzipSync(buf).toString("utf8");
  return JSON.parse(json, (_key, value) => {
    if (value && typeof value === "object" && typeof value.__isrBuf === "string")
      return Buffer.from(value.__isrBuf, "base64");
    // reviver は内側から処理されるため、__isrMap のエントリ内 Buffer は復元済みで届く。
    if (value && typeof value === "object" && Array.isArray(value.__isrMap))
      return new Map(value.__isrMap);
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
    this.buildId = buildId; // S3 キーの名前空間（デプロイ毎に新世代）
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
  _s3Key(cacheKey) {
    return s3KeyFor(this.buildId, cacheKey);
  }

  async get(cacheKey) {
    const lk = this._lk(cacheKey);
    const cached = l1Get(lk);
    if (cached) return cached; // L1 ヒット → バックエンドを叩かない

    if (BACKEND === "s3") {
      const s3 = getS3();
      if (!s3) return null;
      try {
        const { GetObjectCommand } = s3Cmds();
        const res = await s3.send(
          new GetObjectCommand({ Bucket: S3_BUCKET, Key: this._s3Key(cacheKey) })
        );
        if (!res.Body) return null;
        const bytes = await res.Body.transformToByteArray(); // Uint8Array → deserializeEntry がそのまま受理
        const entry = deserializeEntry(bytes);
        l1Set(lk, entry, bytes.length);
        return entry;
      } catch (err) {
        // NoSuchKey（正常なミス）も権限/ネットワーク失敗もミス扱い → Next が再生成（安全側）。
        // ただし想定外エラー（AccessDenied 等）はログして設定ミスを顕在化させる（無言だと全ミスが隠れる）。
        warnS3("get", err);
        return null;
      }
    }

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
      if (!stored || (typeof stored !== "string" && !(stored instanceof Uint8Array)))
        return null;

      // 分割エントリ: 先頭 item の parts>1 なら残りパートを並列取得して結合。
      // gen 不一致 / 欠損パートは世代混在（同時書換え中）なのでミス扱い→再生成（安全側）。
      const partCount = res.Item.parts;
      let payload = stored;
      if (typeof partCount === "number" && partCount > 1) {
        if (typeof stored === "string") return null; // 分割は新形式(バイナリ)のみ
        const gen = res.Item.gen;
        const rest = await Promise.all(
          Array.from({ length: partCount - 1 }, (_, i) =>
            doc.send(
              new GetCommand({
                TableName: TABLE,
                Key: { pk: this.pk, sk: `${this._sk(cacheKey)}#p${i + 1}` },
              })
            )
          )
        );
        const chunks = [Buffer.from(stored)];
        for (const r of rest) {
          const d = r.Item && r.Item.data;
          if (!(d instanceof Uint8Array) || r.Item.gen !== gen) return null;
          chunks.push(Buffer.from(d));
        }
        payload = Buffer.concat(chunks);
      }

      const entry = deserializeEntry(payload); // { value, lastModified, tags }
      l1Set(lk, entry, payload.length); // 次回の同一 read を L1 で吸収
      return entry;
    } catch {
      return null; // 失敗 → ミス扱い → Next が再生成（安全）
    }
  }

  async set(cacheKey, data, ctx) {
    const lk = this._lk(cacheKey);
    if (BACKEND === "s3") return this._setS3(lk, cacheKey, data, ctx);
    const doc = getDoc();
    if (!doc) {
      l1Delete(lk); // バックエンド無しでも L1 に古いものを残さない
      return;
    }
    try {
      const { PutCommand, DeleteCommand } = cmds();
      // 削除指示（分割パートも掃除。存在しなくても Delete は冪等なのでまとめて投げる）
      if (data == null) {
        await Promise.all([
          doc.send(
            new DeleteCommand({
              TableName: TABLE,
              Key: { pk: this.pk, sk: this._sk(cacheKey) },
            })
          ),
          ...Array.from({ length: MAX_PARTS - 1 }, (_, i) =>
            doc
              .send(
                new DeleteCommand({
                  TableName: TABLE,
                  Key: { pk: this.pk, sk: `${this._sk(cacheKey)}#p${i + 1}` },
                })
              )
              .catch(() => {})
          ),
        ]);
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
      if (payload.length > PART_BYTES * MAX_PARTS) {
        console.warn(`[isr-cache] set skip: key=${cacheKey} size=${payload.length}B > ${PART_BYTES * MAX_PARTS}B (非キャッシュ・毎回再生成)`);
        l1Delete(lk);
        return; // 分割上限すら超える異常サイズ → 非キャッシュ（毎回生成で正常動作）
      }

      const revalidate =
        ctx && typeof ctx.revalidate === "number" ? ctx.revalidate : 0;
      const ttl = Math.max(revalidate, DEFAULT_TTL_SECONDS);
      const exp = ttlEpoch(ttl);
      if (payload.length <= MAX_CACHE_BYTES) {
        // 単一 item（従来形式・後方互換。parts/gen 属性なし = 旧リーダーもそのまま読める）
        await doc.send(
          new PutCommand({
            TableName: TABLE,
            Item: { pk: this.pk, sk: this._sk(cacheKey), data: payload, ttl: exp },
          })
        );
      } else {
        // 分割保存: 末尾パート(#p1..)を先に書き、最後に先頭(パート数+世代gen)を書く。
        // 読者が書換え途中を掴んでも、先頭が旧なら旧genのパートを読む（新パートはgen不一致→ミス）、
        // 先頭が新なら新パートは書込済み、で必ず一貫する。
        const parts = splitPayload(payload);
        const gen = `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        await Promise.all(
          parts.slice(1).map((part, i) =>
            doc.send(
              new PutCommand({
                TableName: TABLE,
                Item: {
                  pk: this.pk,
                  sk: `${this._sk(cacheKey)}#p${i + 1}`,
                  data: part,
                  gen,
                  ttl: exp,
                },
              })
            )
          )
        );
        await doc.send(
          new PutCommand({
            TableName: TABLE,
            Item: {
              pk: this.pk,
              sk: this._sk(cacheKey),
              data: parts[0],
              parts: parts.length,
              gen,
              ttl: exp,
            },
          })
        );
      }
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

  // S3 バックエンドの set。本体は S3 単一 PUT（分割不要）、タグ逆引きのみ DynamoDB。
  async _setS3(lk, cacheKey, data, ctx) {
    const s3 = getS3();
    if (!s3) {
      l1Delete(lk); // バックエンド無しでも L1 に古いものを残さない
      return;
    }
    try {
      const { PutObjectCommand, DeleteObjectCommand } = s3Cmds();
      // 削除指示（DeleteObject は存在しなくても成功する＝冪等）
      if (data == null) {
        await s3.send(
          new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: this._s3Key(cacheKey) })
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
      if (payload.length > S3_WARN_BYTES) {
        // S3 に 400KB 制約は無いのでキャッシュは続行。異常肥大の観測用 warn のみ。
        console.warn(
          `[isr-cache] large entry: key=${cacheKey} size=${payload.length}B (>${S3_WARN_BYTES}B、S3のためキャッシュ続行)`
        );
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: this._s3Key(cacheKey),
          Body: payload,
          ContentType: "application/gzip",
          // キーは sha256 で人間可読でないため、運用デバッグ用に元キーをメタデータへ。
          // S3 メタデータは ASCII のみ・合計 2KB 制限のため encode + 切詰め。
          Metadata: { "cache-key": encodeURIComponent(cacheKey).slice(0, 1800) },
        })
      );
      // L1 も更新（バックエンドと同じ shape）。ISR 再生成直後の read が即 fresh を返す。
      l1Set(lk, { value: data, lastModified: now, tags }, payload.length);

      // タグ → cacheKey の逆引きは従来どおり DynamoDB（revalidateTag の Query→Delete を温存）。
      // TTL は S3 本体（Lifecycle 14日）を上回る 15日にし、無効化の到達性を保証する。
      if (Array.isArray(tags) && tags.length > 0) {
        const doc = getDoc();
        if (doc) {
          const { PutCommand } = cmds();
          const revalidate =
            ctx && typeof ctx.revalidate === "number" ? ctx.revalidate : 0;
          const exp = ttlEpoch(Math.max(revalidate, S3_TAG_TTL_SECONDS));
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
      }
    } catch (err) {
      // 書込失敗は致命でない（次回再生成）。壊れた L1 を残さない。想定外エラーはログして顕在化。
      warnS3("set", err);
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
        // 本体エントリとタグ逆引きの両方を削除。
        // 分割エントリはタグ逆引きが先頭 sk のみを指すため先頭だけ消えるが、
        // 先頭なしのパート(#p1..)は到達不能な孤児となり TTL で自然消滅する（読者に影響なし）。
        for (const sk of members) {
          if (BACKEND === "s3") {
            // S3 本体を削除。失敗時はタグ行を残して再 revalidateTag で回復可能にする
            // （無条件にタグ行を消すと索引が壊れ、本体が S3 に残ったまま再無効化できなくなる）。
            const s3 = getS3();
            let bodyDeleted = false;
            if (s3) {
              const { DeleteObjectCommand } = s3Cmds();
              const cacheKey = sk.slice("KEY#".length);
              try {
                await s3.send(
                  new DeleteObjectCommand({
                    Bucket: S3_BUCKET,
                    Key: this._s3Key(cacheKey),
                  })
                );
                bodyDeleted = true;
              } catch (err) {
                warnS3("revalidateTag delete", err);
              }
            }
            // env flip ロールバック（同一 buildId で s3→dynamodb へ戻す）で、S3 モード中に
            // 無効化した旧 DynamoDB 本体行が「有効キャッシュ」として復活しないよう冪等に掃除
            // （~1WRU、存在しなければ無害）。revalidateTag は低頻度なのでコスト無視。
            await doc
              .send(new DeleteCommand({ TableName: TABLE, Key: { pk: this.pk, sk } }))
              .catch(() => {});
            // タグ行は S3 本体削除が成功したときだけ消す（失敗時は残す）
            if (bodyDeleted) {
              await doc.send(
                new DeleteCommand({ TableName: TABLE, Key: { pk: tagPk, sk } })
              );
            }
          } else {
            // DynamoDB 経路（従来どおり・挙動不変）: 本体行→タグ行。throw は外側 catch で
            // 中断し、残メンバーのタグ行が残るためリトライで回復可能。
            await doc.send(
              new DeleteCommand({ TableName: TABLE, Key: { pk: this.pk, sk } })
            );
            await doc.send(
              new DeleteCommand({ TableName: TABLE, Key: { pk: tagPk, sk } })
            );
          }
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
module.exports.__splitPayload = splitPayload;
module.exports.__PART_BYTES = PART_BYTES;
module.exports.__MAX_PARTS = MAX_PARTS;
module.exports.__MAX_CACHE_BYTES = MAX_CACHE_BYTES;
// テスト用に L1 ヘルパーを公開（本体動作には影響しない）
module.exports.__l1Get = l1Get;
module.exports.__l1Set = l1Set;
module.exports.__l1Delete = l1Delete;
module.exports.__l1Clear = l1Clear;
module.exports.__l1Size = () => _l1.size;
module.exports.__L1_MAX_ENTRIES = L1_MAX_ENTRIES;
module.exports.__L1_MAX_ENTRY_BYTES = L1_MAX_ENTRY_BYTES;
// テスト用: S3/DynamoDB クライアントを決定的に注入する（遅延 require への vi.mock 依存を避ける。
// 2026-06 の cache-handler 改修ミス障害の教訓としてテストの確実性を優先）
module.exports.__setClientsForTest = (clients) => {
  if (clients && "s3" in clients) _s3 = clients.s3;
  if (clients && "doc" in clients) _doc = clients.doc;
};
module.exports.__s3KeyFor = s3KeyFor;
module.exports.__BACKEND = BACKEND;
module.exports.__S3_BUCKET = S3_BUCKET;
