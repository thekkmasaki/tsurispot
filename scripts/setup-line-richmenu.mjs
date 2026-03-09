#!/usr/bin/env node
/**
 * LINE リッチメニュー セットアップスクリプト
 * 使い方: node scripts/setup-line-richmenu.mjs
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local からトークン読み込み
const envPath = join(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const tokenMatch = envContent.match(/LINE_CHANNEL_ACCESS_TOKEN=(.+)/);
if (!tokenMatch) {
  console.error("LINE_CHANNEL_ACCESS_TOKEN が .env.local に見つかりません");
  process.exit(1);
}
const TOKEN = tokenMatch[1].trim();

const API = "https://api.line.me/v2/bot";
const API_DATA = "https://api-data.line.me/v2/bot";

async function apiCall(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...options.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Error ${res.status}: ${text}`);
    process.exit(1);
  }
  return text ? JSON.parse(text) : null;
}

// Step 1: 既存のデフォルトリッチメニューを削除
console.log("1. 既存のデフォルトリッチメニューを確認中...");
try {
  const existing = await fetch(`${API}/user/all/richmenu`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (existing.ok) {
    const data = await existing.json();
    console.log(`   既存: ${data.richMenuId}`);
    await fetch(`${API}/user/all/richmenu`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    console.log("   既存のデフォルトを解除しました");
  } else {
    console.log("   デフォルトなし");
  }
} catch {
  console.log("   デフォルトなし");
}

// Step 2: リッチメニューを作成
console.log("2. リッチメニューを作成中...");
const richMenu = {
  size: { width: 2500, height: 1686 },
  selected: true,
  name: "ツリスポ メインメニュー",
  chatBarText: "メニュー",
  areas: [
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: { type: "message", text: "スポット" },
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: { type: "message", text: "今釣れる" },
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: { type: "message", text: "初心者" },
    },
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: { type: "message", text: "釣果" },
    },
    {
      bounds: { x: 833, y: 843, width: 834, height: 843 },
      action: { type: "message", text: "道具" },
    },
    {
      bounds: { x: 1667, y: 843, width: 833, height: 843 },
      action: { type: "message", text: "使い方" },
    },
  ],
};

const created = await apiCall(`${API}/richmenu`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(richMenu),
});
const richMenuId = created.richMenuId;
console.log(`   作成完了: ${richMenuId}`);

// Step 3: 画像をアップロード
console.log("3. 画像をアップロード中...");
const imagePath = join(
  __dirname,
  "..",
  "public",
  "images",
  "line",
  "richmenu.jpg"
);
const imageBuffer = readFileSync(imagePath);
await apiCall(`${API_DATA}/richmenu/${richMenuId}/content`, {
  method: "POST",
  headers: { "Content-Type": "image/jpeg" },
  body: imageBuffer,
});
console.log("   アップロード完了");

// Step 4: デフォルトに設定
console.log("4. デフォルトリッチメニューに設定中...");
await apiCall(`${API}/user/all/richmenu/${richMenuId}`, {
  method: "POST",
});
console.log("   設定完了");

console.log("\n✅ リッチメニューのセットアップが完了しました！");
console.log(`   Rich Menu ID: ${richMenuId}`);
