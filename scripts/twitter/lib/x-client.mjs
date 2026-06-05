#!/usr/bin/env node
/**
 * X (Twitter) 共通認証モジュール
 *
 * loadEnv() と TwitterApi クライアント初期化を一元化。
 * 全投稿スクリプトから import して使用する。
 */

import { TwitterApi } from "twitter-api-v2";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const ROOT = join(__dirname, "../../..");
export const SCRIPTS_DIR = join(__dirname, "..");

/**
 * .env.local を手動パースして process.env にセット
 * GitHub Actions では環境変数で直接渡されるため、ファイルがなくても動作する
 */
export function loadEnv() {
  try {
    const envPath = join(ROOT, ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex);
      let value = trimmed.slice(eqIndex + 1);
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // GitHub Actions では環境変数で渡す
  }
}

/**
 * 認証済み TwitterApi クライアントを返す
 * 環境変数が不足している場合は process.exit(1) で終了
 */
export function getClient() {
  const { X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } =
    process.env;
  if (!X_API_KEY || !X_API_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
    console.error("X API の環境変数が設定されていません");
    console.error(
      "必要: X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET"
    );
    process.exit(1);
  }

  return new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_KEY_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  });
}

/**
 * 単一ツイートを投稿して結果を返す
 * @param {string} text - ツイート本文
 * @returns {Promise<{id: string}>}
 */
export async function postTweet(text) {
  const client = getClient();
  const result = await client.v2.tweet(text);
  console.log(`投稿完了: https://x.com/tsurispot_jp/status/${result.data.id}`);
  return result.data;
}

/**
 * スレッド（複数ツイート）を投稿する
 * @param {string[]} tweets - ツイート本文の配列（最初がメイン、以降がリプライ）
 * @param {number} [delay=2000] - リプライ間の待機時間(ms)
 * @returns {Promise<{ids: string[]}>}
 */
export async function postThread(tweets, delay = 2000) {
  const client = getClient();
  const ids = [];

  // メインツイート
  const main = await client.v2.tweet(tweets[0]);
  ids.push(main.data.id);
  console.log(`メインツイート: https://x.com/tsurispot_jp/status/${main.data.id}`);

  // リプライ
  let lastId = main.data.id;
  for (let i = 1; i < tweets.length; i++) {
    await new Promise((r) => setTimeout(r, delay));
    const reply = await client.v2.reply(tweets[i], lastId);
    ids.push(reply.data.id);
    console.log(`リプライ ${i}/${tweets.length - 1}: https://x.com/tsurispot_jp/status/${reply.data.id}`);
    lastId = reply.data.id;
  }

  return { ids };
}

/**
 * 魚スラッグからローカル魚画像のパスを解決（無ければ null）
 * @param {string} slug
 * @returns {string|null}
 */
export function resolveFishImage(slug) {
  if (!slug) return null;
  for (const ext of ["jpg", "png", "webp"]) {
    const p = join(ROOT, `public/images/fish/${slug}.${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * スポットスラッグ（とspotType）からローカルスポット画像のパスを解決
 * wikimedia実写 → spotType別デフォルト の順でフォールバック（無ければ null）
 * @param {string} slug
 * @param {string} [spotType]
 * @returns {string|null}
 */
export function resolveSpotImage(slug, spotType) {
  if (slug) {
    for (const ext of ["webp", "jpg", "png"]) {
      const p = join(ROOT, `public/images/spots/wikimedia/${slug}.${ext}`);
      if (existsSync(p)) return p;
    }
  }
  // spotType別デフォルト画像（6種すべて public/images/spots/default-*.jpg に存在）
  const def = `default-${spotType}`;
  if (spotType) {
    const p = join(ROOT, `public/images/spots/${def}.jpg`);
    if (existsSync(p)) return p;
  }
  // spotType不明時は breakwater をフォールバック
  const fallback = join(ROOT, "public/images/spots/default-breakwater.jpg");
  return existsSync(fallback) ? fallback : null;
}

/**
 * 画像つきツイートを投稿する（釣り系Xはビジュアルでリーチが大きく変わる）。
 * 画像が解決できない/アップロード失敗時はテキストのみにフォールバックする。
 * @param {string} text - ツイート本文
 * @param {string[]} imagePaths - ローカル画像ファイルパス（最大4枚・null/未存在は除外）
 * @returns {Promise<{id: string}>}
 */
export async function postTweetWithMedia(text, imagePaths = []) {
  const client = getClient();
  const paths = (imagePaths || []).filter((p) => p && existsSync(p)).slice(0, 4);
  let mediaIds = [];
  if (paths.length > 0) {
    try {
      mediaIds = await Promise.all(paths.map((p) => client.v1.uploadMedia(p)));
    } catch (e) {
      console.warn(`画像アップロード失敗（テキストのみで投稿）: ${e?.message || e}`);
      mediaIds = [];
    }
  }
  const result =
    mediaIds.length > 0
      ? await client.v2.tweet(text, { media: { media_ids: mediaIds } })
      : await client.v2.tweet(text);
  const tag = mediaIds.length > 0 ? `画像${mediaIds.length}枚付き` : "テキストのみ";
  console.log(`投稿完了(${tag}): https://x.com/tsurispot_jp/status/${result.data.id}`);
  return result.data;
}

/**
 * --dry-run フラグの判定
 */
export const isDryRun = process.argv.includes("--dry-run");

/**
 * テキストを指定文字数以内に短縮
 */
export function truncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

/**
 * HTMLタグを除去
 */
export function stripHtml(text) {
  return text.replace(/<[^>]*>/g, "").trim();
}

/**
 * UTM付きURLを生成
 * @param {string} path - サイトパス（例: /blog/slug）
 * @param {string} campaign - キャンペーン名
 */
export function makeUrl(path, campaign) {
  const base = "https://tsurispot.com";
  const url = path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  return `${url}?utm_source=twitter&utm_campaign=${campaign}`;
}
