#!/usr/bin/env node
/**
 * 週報の取りこぼし検知: 最新の週報が古い（止まっている）／エリアが欠けている ときに Discord に知らせる。
 *   node scripts/sns/weekly-carousel/check-fresh.mjs
 * 過去に週ごと抜け（8月第4週・9月第2〜3週など）や、同じ3エリアの連続欠落（10月第3週・11月第1週）があったため。
 */
import { discord } from "../ranking-reel/lib.mjs";
import { latestWeekTag, fetchWeekArticles } from "./data.mjs";

// 毎週出す主要10エリア（src/lib/weekly-report-areas.ts の MAIN_WEEKLY_AREA_SLUGS と同じ）
const MAIN = [
  "akashi-kobe", "osaka-sennan", "tokyobay-yokohama", "fukuoka-kitakyushu", "suruga-izu",
  "chita-mikawa", "nanki-shirahama", "setouchi-hiroshima", "sendai-ishinomaki", "otaru-ishikari",
];
const STALE_DAYS = 8;

const tag = await latestWeekTag();
if (!tag) { await discord("⚠️ **釣果週報** 週報が1件も見つかりません"); process.exit(1); }
const articles = await fetchWeekArticles(tag);
const newest = Math.max(...articles.map((a) => Date.parse(a.publishedAt ?? "") || 0));
const ageDays = newest ? (Date.now() - newest) / 864e5 : Infinity;
const missing = MAIN.filter((s) => !articles.some((a) => a.slug === `chouka-shuho-${s}-${tag}`));
console.log(`最新週 ${tag}: ${articles.length}件・最終公開から${ageDays.toFixed(1)}日・欠け ${missing.join(",") || "なし"}`);

const msgs = [];
if (ageDays > STALE_DAYS) msgs.push(`最後の週報から${Math.floor(ageDays)}日経っています（${tag}）。\`/weekly-report\` を実行してください。`);
if (missing.length) msgs.push(`${tag} に欠けているエリアがあります: ${missing.join(", ")}。\`/weekly-report --week ${tag}\` で埋め戻せます。`);
if (msgs.length) await discord(`⚠️ **釣果週報の取りこぼし**\n${msgs.join("\n")}`);
