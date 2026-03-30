#!/usr/bin/env node
/**
 * Instagram 画像投稿スクリプト
 *
 * 使い方:
 *   node post-image.mjs --file image.png --caption "キャプション"
 *   node post-image.mjs --file image.png --caption-file caption.txt
 *   node post-image.mjs --file image.png --caption "..." --dry-run
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uploadToS3, deleteFromS3 } from "./upload-s3.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const FILE_ARG = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;
const CAPTION_ARG = args.includes("--caption") ? args[args.indexOf("--caption") + 1] : null;
const CAPTION_FILE_ARG = args.includes("--caption-file") ? args[args.indexOf("--caption-file") + 1] : null;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    console.error("❌ .env に INSTAGRAM_USER_ID と INSTAGRAM_ACCESS_TOKEN を設定してください");
    process.exit(1);
  }

  if (!FILE_ARG) {
    console.error("❌ --file <画像ファイルパス> を指定してください");
    process.exit(1);
  }

  // ファイルパス解決
  const filePath = path.isAbsolute(FILE_ARG) ? FILE_ARG : path.resolve(FILE_ARG);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ファイルが見つかりません: ${filePath}`);
    process.exit(1);
  }

  // キャプション取得
  let caption = "";
  if (CAPTION_FILE_ARG) {
    const captionPath = path.isAbsolute(CAPTION_FILE_ARG) ? CAPTION_FILE_ARG : path.resolve(CAPTION_FILE_ARG);
    caption = fs.readFileSync(captionPath, "utf-8").trim();
  } else if (CAPTION_ARG) {
    caption = CAPTION_ARG;
  }

  const fileName = path.basename(filePath);
  console.log(`\n📸 画像投稿: ${fileName}`);
  console.log(`📝 キャプション: ${caption.slice(0, 100)}...`);

  if (DRY_RUN) {
    console.log("\n🔸 ドライラン: 実際の投稿はスキップ");
    return;
  }

  // Step 1: S3にアップロード
  const s3Key = `instagram/${Date.now()}-${fileName}`;
  console.log(`\n☁️  S3アップロード中... (${s3Key})`);
  const imageUrl = await uploadToS3(filePath, S3_BUCKET, s3Key, S3_REGION);
  console.log(`✅ S3: ${imageUrl}`);

  try {
    // Step 2: メディアコンテナ作成
    console.log(`\n📦 Instagramメディアコンテナ作成中...`);
    const createRes = await fetch(
      `https://graph.facebook.com/v21.0/${IG_USER_ID}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: IG_ACCESS_TOKEN,
        }),
      }
    );

    const createData = await createRes.json();
    if (createData.error) {
      throw new Error(`メディアコンテナ作成失敗: ${JSON.stringify(createData.error)}`);
    }

    const creationId = createData.id;
    console.log(`✅ コンテナID: ${creationId}`);

    // Step 3: ステータス確認（画像は即座に利用可能な場合が多い）
    console.log(`\n⏳ メディア処理待ち...`);
    let status = "IN_PROGRESS";
    let attempts = 0;
    while (status === "IN_PROGRESS" && attempts < 30) {
      await sleep(2000);
      const statusRes = await fetch(
        `https://graph.facebook.com/v21.0/${creationId}?fields=status_code&access_token=${IG_ACCESS_TOKEN}`
      );
      const statusData = await statusRes.json();
      status = statusData.status_code || "FINISHED";
      attempts++;
      process.stdout.write(".");
    }
    console.log(` ${status}`);

    if (status === "ERROR") {
      throw new Error("メディア処理に失敗しました");
    }

    // Step 4: 公開
    console.log(`\n🚀 投稿公開中...`);
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${IG_USER_ID}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: creationId,
          access_token: IG_ACCESS_TOKEN,
        }),
      }
    );

    const publishData = await publishRes.json();
    if (publishData.error) {
      throw new Error(`投稿公開失敗: ${JSON.stringify(publishData.error)}`);
    }

    console.log(`\n🎉 投稿成功! Media ID: ${publishData.id}`);
  } finally {
    // S3クリーンアップ
    console.log(`\n🧹 S3クリーンアップ...`);
    await deleteFromS3(S3_BUCKET, s3Key, S3_REGION);
  }
}

main().catch((err) => {
  console.error(`\n❌ エラー: ${err.message}`);
  process.exit(1);
});
