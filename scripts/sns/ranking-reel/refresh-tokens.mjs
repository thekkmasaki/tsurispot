#!/usr/bin/env node
/**
 * Instagram / Threads の長期トークン（有効60日）を延長して Redis に保存する。週1で実行。
 * 投稿側は Redis の値を優先し、無ければ GitHub Secrets の初期値を使う。
 */
import { getToken, redis, TOKEN_KEYS, discord } from "./lib.mjs";

async function refresh(platform) {
  const token = await getToken(platform);
  if (!token) return `⏭️ ${platform}: トークン未設定`;
  let url;
  if (platform === "threads") {
    url = `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${token}`;
  } else if (token.startsWith("IG")) {
    url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`;
  } else {
    if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) return `⚠️ ${platform}: META_APP_ID/SECRET 未設定で延長不可`;
    url = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${token}`;
  }
  const json = await (await fetch(url)).json();
  if (!json.access_token) throw new Error(`${platform}: ${json.error?.message ?? "延長失敗"}`);
  await redis(["SET", TOKEN_KEYS[platform], json.access_token]);
  const days = json.expires_in ? Math.round(json.expires_in / 86400) : "?";
  return `✅ ${platform}: 延長OK（残り約${days}日）`;
}

const lines = [];
let failed = false;
for (const p of ["instagram", "threads"]) {
  try { lines.push(await refresh(p)); } catch (e) { failed = true; lines.push(`❌ ${e.message}`); }
}
console.log(lines.join("\n"));
if (failed) await discord(`⚠️ **SNSトークン延長** 失敗あり（放置すると投稿が止まります）\n${lines.join("\n")}`);
process.exit(failed ? 1 : 0);
