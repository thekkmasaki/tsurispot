#!/usr/bin/env node
/**
 * Instagram リール自動投稿スクリプト
 *
 * 使い方:
 *   node post-reel.mjs                   # inbox/ 内の全動画を投稿
 *   node post-reel.mjs --dry-run         # テスト（実際には投稿しない）
 *   node post-reel.mjs --file video.mp4  # 特定ファイルだけ投稿
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToS3, deleteFromS3 } from "./upload-s3.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INBOX_DIR = path.join(__dirname, "inbox");
const POSTED_DIR = path.join(__dirname, "posted");

// .env読み込み
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const IG_USER_ID = process.env.INSTAGRAM_USER_ID;
const IG_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const S3_BUCKET = process.env.S3_BUCKET || "tsurispot-instagram";
const S3_REGION = process.env.S3_REGION || "ap-northeast-1";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SPECIFIC_FILE = args.includes("--file")
  ? args[args.indexOf("--file") + 1]
  : null;

// デフォルトハッシュタグ
const DEFAULT_HASHTAGS = [
  "#釣り",
  "#釣り初心者",
  "#fishing",
  "#堤防釣り",
  "#海釣り",
  "#釣りスタグラム",
  "#釣り好きな人と繋がりたい",
  "#ツリスポ",
  "#tsurispot",
].join(" ");

/**
 * inbox/ から投稿対象のファイルペアを取得
 * video.mp4 + video.txt（キャプション）のペア
 */
function getInboxItems() {
  if (!fs.existsSync(INBOX_DIR)) {
    fs.mkdirSync(INBOX_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(INBOX_DIR);
  const videos = files.filter((f) =>
    /\.(mp4|mov|avi|webm)$/i.test(f)
  );

  if (SPECIFIC_FILE) {
    const target = videos.find((v) => v === SPECIFIC_FILE);
    if (!target) {
      console.error(`❌ ファイルが見つかりません: ${SPECIFIC_FILE}`);
      return [];
    }
    return [buildItem(target)];
  }

  return videos.map(buildItem);
}

function buildItem(videoFile) {
  const baseName = videoFile.replace(/\.[^.]+$/, "");
  const captionFile = `${baseName}.txt`;
  const captionPath = path.join(INBOX_DIR, captionFile);

  let caption = "";
  if (fs.existsSync(captionPath)) {
    caption = fs.readFileSync(captionPath, "utf-8").trim();
  }

  // キャプションにハッシュタグがなければデフォルトを追加
  if (!caption.includes("#")) {
    caption = caption ? `${caption}\n\n${DEFAULT_HASHTAGS}` : DEFAULT_HASHTAGS;
  }

  return {
    videoFile,
    videoPath: path.join(INBOX_DIR, videoFile),
    captionFile,
    caption,
  };
}

/**
 * Instagram Graph API でリール投稿
 */
async function postReel(videoUrl, caption) {
  // Step 1: メディアコンテナ作成
  console.log("  📤 メディアコンテナ作成中...");
  const createRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: videoUrl,
        caption: caption,
        access_token: IG_ACCESS_TOKEN,
      }),
    }
  );

  const createData = await createRes.json();
  if (createData.error) {
    throw new Error(
      `コンテナ作成失敗: ${createData.error.message}`
    );
  }

  const containerId = createData.id;
  console.log(`  📦 コンテナID: ${containerId}`);

  // Step 2: 動画処理完了を待つ（最大5分）
  console.log("  ⏳ 動画処理中...");
  let status = "IN_PROGRESS";
  let attempts = 0;
  const MAX_ATTEMPTS = 30;

  while (status === "IN_PROGRESS" && attempts < MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, 10000)); // 10秒待機
    attempts++;

    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${IG_ACCESS_TOKEN}`
    );
    const statusData = await statusRes.json();
    status = statusData.status_code;
    console.log(
      `  ⏳ ステータス: ${status} (${attempts}/${MAX_ATTEMPTS})`
    );
  }

  if (status !== "FINISHED") {
    throw new Error(
      `動画処理タイムアウト。最終ステータス: ${status}`
    );
  }

  // Step 3: 公開
  console.log("  🚀 公開中...");
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: IG_ACCESS_TOKEN,
      }),
    }
  );

  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`公開失敗: ${publishData.error.message}`);
  }

  return publishData.id;
}

/**
 * 投稿済みファイルを posted/ に移動
 */
function moveToPosted(item) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const destVideo = path.join(
    POSTED_DIR,
    `${timestamp}_${item.videoFile}`
  );
  fs.renameSync(item.videoPath, destVideo);

  const captionPath = path.join(INBOX_DIR, item.captionFile);
  if (fs.existsSync(captionPath)) {
    const destCaption = path.join(
      POSTED_DIR,
      `${timestamp}_${item.captionFile}`
    );
    fs.renameSync(captionPath, destCaption);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log("🎣 ツリスポ Instagram リール自動投稿");
  console.log("====================================");

  if (DRY_RUN) {
    console.log("🔍 ドライランモード（実際には投稿しません）\n");
  }

  // 環境変数チェック
  const missing = [];
  if (!IG_USER_ID) missing.push("INSTAGRAM_USER_ID");
  if (!IG_ACCESS_TOKEN) missing.push("INSTAGRAM_ACCESS_TOKEN");

  if (missing.length > 0) {
    console.error("❌ .env に以下の設定が必要です:");
    missing.forEach((k) => console.error(`   - ${k}`));
    console.error("\n📖 セットアップ手順は setup-meta-api.md を参照");
    process.exit(1);
  }

  // inbox確認
  const items = getInboxItems();
  if (items.length === 0) {
    console.log("📭 inbox/ に投稿する動画がありません。");
    console.log("   MP4ファイルを inbox/ に置いてください。");
    console.log(
      "   キャプションは同名の .txt ファイルで指定できます。"
    );
    process.exit(0);
  }

  console.log(`📬 ${items.length}件の動画を処理します\n`);

  for (const item of items) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎬 ${item.videoFile}`);
    console.log(`📝 キャプション: ${item.caption.slice(0, 80)}...`);

    if (DRY_RUN) {
      console.log("✅ [ドライラン] スキップ\n");
      continue;
    }

    try {
      // S3にアップロード
      console.log("  ☁️ S3にアップロード中...");
      const s3Key = `reels/${Date.now()}_${item.videoFile}`;
      const videoUrl = await uploadToS3(
        item.videoPath,
        S3_BUCKET,
        s3Key,
        S3_REGION
      );
      console.log(`  ☁️ URL: ${videoUrl}`);

      // Instagram投稿
      const mediaId = await postReel(videoUrl, item.caption);
      console.log(`  ✅ 投稿完了！ Media ID: ${mediaId}`);

      // S3から削除（Instagram側にコピーされるので不要）
      await deleteFromS3(S3_BUCKET, s3Key, S3_REGION);

      // posted/ に移動
      moveToPosted(item);
      console.log(`  📁 posted/ に移動しました\n`);
    } catch (err) {
      console.error(`  ❌ エラー: ${err.message}\n`);
    }
  }

  console.log("====================================");
  console.log("🎣 完了！");
}

main().catch(console.error);
