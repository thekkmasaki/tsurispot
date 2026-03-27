#!/usr/bin/env node
/**
 * Instagram長期アクセストークン自動更新
 * 60日で失効するため、月1回実行推奨
 *
 * 使い方: node refresh-token.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

async function refreshToken() {
  const currentToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!currentToken) {
    console.error("❌ INSTAGRAM_ACCESS_TOKEN が .env にありません");
    process.exit(1);
  }

  console.log("🔄 トークン更新中...");

  const res = await fetch(
    `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.META_APP_ID}&` +
      `client_secret=${process.env.META_APP_SECRET}&` +
      `fb_exchange_token=${currentToken}`
  );

  const data = await res.json();

  if (data.error) {
    console.error(`❌ 更新失敗: ${data.error.message}`);
    process.exit(1);
  }

  const newToken = data.access_token;
  const expiresIn = data.expires_in; // 秒
  const expiresDays = Math.floor(expiresIn / 86400);

  // .envファイルのトークンを更新
  const envPath = path.join(__dirname, ".env");
  let envContent = fs.readFileSync(envPath, "utf-8");
  envContent = envContent.replace(
    /INSTAGRAM_ACCESS_TOKEN=.*/,
    `INSTAGRAM_ACCESS_TOKEN=${newToken}`
  );
  fs.writeFileSync(envPath, envContent);

  console.log(`✅ トークン更新完了！`);
  console.log(`   有効期限: ${expiresDays}日後`);
  console.log(`   次回更新: 30日後を推奨`);
}

refreshToken().catch(console.error);
