#!/usr/bin/env node

/**
 * Google Search Console URL Inspection API - バッチインデックスリクエストスクリプト
 *
 * サイトマップからURL一覧を取得し、Google Search Console の
 * URL Inspection API を使ってインデックス登録リクエストを自動送信します。
 *
 * ============================================================
 * セットアップ手順
 * ============================================================
 *
 * 1. Google Cloud Console でプロジェクトを作成
 *    - https://console.cloud.google.com/ にアクセス
 *    - 新しいプロジェクトを作成（例: tsurispot-indexing）
 *
 * 2. Web Search Indexing API を有効化
 *    - Google Cloud Console > APIとサービス > ライブラリ
 *    - 「Web Search Indexing API」を検索して有効化
 *
 * 3. サービスアカウントを作成
 *    - Google Cloud Console > IAMと管理 > サービスアカウント
 *    - 「サービスアカウントを作成」をクリック
 *    - 名前: tsurispot-indexing（任意）
 *    - 「キー」タブ > 「鍵を追加」 > 「新しい鍵を作成」 > JSON
 *    - ダウンロードした JSON ファイルを credentials.json としてこのスクリプトと同じディレクトリに配置
 *
 * 4. Search Console にサービスアカウントを追加
 *    - Google Search Console (https://search.google.com/search-console) を開く
 *    - 対象プロパティの「設定」 > 「ユーザーと権限」
 *    - 「ユーザーを追加」
 *    - サービスアカウントのメールアドレス（credentials.json 内の client_email）を入力
 *    - 権限: 「オーナー」に設定
 *
 * 5. 依存パッケージのインストール
 *    npm install googleapis
 *    または
 *    yarn add googleapis
 *
 * 6. 実行
 *    node scripts/request-indexing.js
 *
 *    オプション:
 *    --dry-run       : 実際にリクエストを送信せず、対象URLの一覧だけ表示
 *    --limit <数>    : 送信するURL数の上限を指定（デフォルト: 200）
 *    --sitemap <URL> : サイトマップのURLを直接指定
 *    --resume        : 前回の続きから実行（progress.jsonを利用）
 *
 * ============================================================
 * API利用制限について
 * ============================================================
 * - Google Indexing API は 1日あたり200リクエストが上限
 * - このスクリプトはデフォルトで200件/実行に制限
 * - 1000件以上のURLがある場合は、数日に分けて実行してください
 * - --resume オプションで前回の続きから実行できます
 * - リクエスト間に1秒の待機時間を設けて、レートリミットを回避
 *
 * ============================================================
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { parseString } = require("xml2js") || {};

// ==== 設定 ====
const SITE_URL = "https://tsurispot.com";
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const PROGRESS_PATH = path.join(__dirname, "indexing-progress.json");
const DAILY_LIMIT = 200;
const DELAY_MS = 1100; // リクエスト間の待機時間（ミリ秒）

// ==== コマンドライン引数の解析 ====
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isResume = args.includes("--resume");
const limitIdx = args.indexOf("--limit");
const maxRequests = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : DAILY_LIMIT;
const sitemapIdx = args.indexOf("--sitemap");
const customSitemap = sitemapIdx !== -1 ? args[sitemapIdx + 1] : null;

// ==== ユーティリティ ====
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(msg) {
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.log(`[${timestamp}] ${msg}`);
}

function logError(msg) {
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  console.error(`[${timestamp}] ERROR: ${msg}`);
}

// ==== サイトマップからURLを取得 ====
async function fetchSitemapUrls(sitemapUrl) {
  log(`サイトマップを取得中: ${sitemapUrl}`);

  const xml = await new Promise((resolve, reject) => {
    https.get(sitemapUrl, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // リダイレクト対応
        https.get(res.headers.location, (res2) => {
          let data = "";
          res2.on("data", (chunk) => (data += chunk));
          res2.on("end", () => resolve(data));
          res2.on("error", reject);
        });
        return;
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });

  const urls = [];

  // サイトマップインデックスかどうか判定
  if (xml.includes("<sitemapindex")) {
    // サイトマップインデックス → 子サイトマップのURLを抽出して再帰的に取得
    const sitemapLocs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    log(`サイトマップインデックスを検出: ${sitemapLocs.length}個の子サイトマップ`);
    for (const loc of sitemapLocs) {
      const childUrls = await fetchSitemapUrls(loc);
      urls.push(...childUrls);
    }
  } else {
    // 通常のサイトマップ → <loc>タグからURLを抽出
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    urls.push(...locs);
  }

  return urls;
}

// ==== 進捗管理 ====
function loadProgress() {
  if (fs.existsSync(PROGRESS_PATH)) {
    const data = JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"));
    return data;
  }
  return { completedUrls: [], lastRun: null };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress, null, 2), "utf-8");
}

// ==== メイン処理 ====
async function main() {
  console.log("========================================");
  console.log("  GSC Indexing Request Tool");
  console.log("  サイト: " + SITE_URL);
  console.log("========================================\n");

  // credentials.json の存在確認
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    logError("credentials.json が見つかりません。");
    console.log("\nセットアップ手順:");
    console.log("1. Google Cloud Console でサービスアカウントを作成");
    console.log("2. JSON キーをダウンロード");
    console.log(`3. ${CREDENTIALS_PATH} として配置`);
    console.log("4. Search Console にサービスアカウントのメールをオーナーとして追加");
    console.log("\n詳しくはこのスクリプト冒頭のコメントを参照してください。");
    process.exit(1);
  }

  // 認証
  log("Google API 認証中...");
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const client = await auth.getClient();

  // サイトマップからURL取得
  const sitemapUrl = customSitemap || SITEMAP_URL;
  let allUrls;
  try {
    allUrls = await fetchSitemapUrls(sitemapUrl);
  } catch (err) {
    logError(`サイトマップの取得に失敗: ${err.message}`);
    process.exit(1);
  }
  log(`合計 ${allUrls.length} 件のURLをサイトマップから取得`);

  // 進捗管理
  const progress = isResume ? loadProgress() : { completedUrls: [], lastRun: null };
  const completedSet = new Set(progress.completedUrls);

  // 未処理のURLを抽出
  const pendingUrls = allUrls.filter((url) => !completedSet.has(url));
  log(`未処理: ${pendingUrls.length} 件 / 処理済み: ${completedSet.size} 件`);

  // 送信対象を制限
  const targetUrls = pendingUrls.slice(0, maxRequests);
  log(`今回の送信対象: ${targetUrls.length} 件（上限: ${maxRequests}件）`);

  if (targetUrls.length === 0) {
    log("送信対象のURLがありません。全URLが処理済みです。");
    return;
  }

  // ドライラン
  if (isDryRun) {
    console.log("\n--- DRY RUN: 以下のURLにリクエストを送信します ---\n");
    targetUrls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));
    console.log(`\n合計: ${targetUrls.length} 件`);
    console.log("実際に送信するには --dry-run を外して実行してください。");
    return;
  }

  // バッチ送信
  console.log("\n--- インデックス登録リクエスト開始 ---\n");
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < targetUrls.length; i++) {
    const url = targetUrls[i];
    const progress_str = `[${i + 1}/${targetUrls.length}]`;

    try {
      await client.request({
        url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
        method: "POST",
        data: {
          url: url,
          type: "URL_UPDATED",
        },
      });
      log(`${progress_str} OK: ${url}`);
      successCount++;
      completedSet.add(url);
    } catch (err) {
      const status = err.response?.status || "unknown";
      const message = err.response?.data?.error?.message || err.message;
      logError(`${progress_str} FAIL (${status}): ${url} - ${message}`);
      errorCount++;
      errors.push({ url, status, message });

      // 429 (Rate Limited) の場合は待機時間を増やす
      if (status === 429) {
        log("レートリミットに到達。60秒待機します...");
        await sleep(60000);
      }
    }

    // 進捗を定期保存（10件ごと）
    if ((i + 1) % 10 === 0 || i === targetUrls.length - 1) {
      saveProgress({
        completedUrls: Array.from(completedSet),
        lastRun: new Date().toISOString(),
      });
    }

    // リクエスト間の待機
    if (i < targetUrls.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  // 結果サマリー
  console.log("\n========================================");
  console.log("  実行結果");
  console.log("========================================");
  console.log(`  成功: ${successCount} 件`);
  console.log(`  失敗: ${errorCount} 件`);
  console.log(`  処理済み合計: ${completedSet.size} / ${allUrls.length} 件`);
  console.log(`  残り: ${allUrls.length - completedSet.size} 件`);

  if (errors.length > 0) {
    console.log("\n--- エラー詳細 ---");
    errors.forEach((e) => console.log(`  ${e.url} (${e.status}): ${e.message}`));
  }

  if (allUrls.length - completedSet.size > 0) {
    console.log(`\n残りのURLは翌日以降に --resume オプション付きで再実行してください:`);
    console.log(`  node scripts/request-indexing.js --resume`);
  }

  // 最終進捗保存
  saveProgress({
    completedUrls: Array.from(completedSet),
    lastRun: new Date().toISOString(),
  });
  log(`進捗を ${PROGRESS_PATH} に保存しました。`);
}

main().catch((err) => {
  logError(`予期せぬエラー: ${err.message}`);
  console.error(err);
  process.exit(1);
});
