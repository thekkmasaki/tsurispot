#!/usr/bin/env node
// Discord通知。既存の deploy.yml と同じ DISCORD_WEBHOOK_URL を使う。
// .env.local からも読む(ヘッドレス実行時に環境変数が無い場合の保険)。
//
// CLI:   node scripts/agent/notify-discord.mjs "メッセージ"
// import: import { notifyDiscord } from "./notify-discord.mjs"

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");

function readEnvLocal(key) {
  if (process.env[key]) return process.env[key];
  try {
    const txt = fs.readFileSync(path.join(REPO_ROOT, ".env.local"), "utf8");
    const m = txt.match(new RegExp(`^${key}=(.*)$`, "m"));
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch { /* noop */ }
  return null;
}

export async function notifyDiscord(content) {
  const url = readEnvLocal("DISCORD_WEBHOOK_URL");
  if (!url) {
    console.error("⚠ DISCORD_WEBHOOK_URL 未設定 → 通知スキップ");
    return false;
  }
  // Discordは2000字上限
  const body = { content: String(content).slice(0, 1900) };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) { console.error(`Discord通知失敗 (${res.status})`); return false; }
    return true;
  } catch (e) {
    console.error("Discord通知例外:", e.message);
    return false;
  }
}

if (process.argv[1]?.endsWith("notify-discord.mjs")) {
  const msg = process.argv.slice(2).join(" ") || "(テスト) ツリスポ自己改善エージェント通知";
  notifyDiscord(msg).then((ok) => process.exit(ok ? 0 : 1));
}
