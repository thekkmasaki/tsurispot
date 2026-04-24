#!/usr/bin/env node
/**
 * X (Twitter) 週末おすすめスポット投稿スクリプト
 *
 * 今月の旬魚が釣れるスポットをランダムに選んで投稿する。
 * 金曜12:00に GitHub Actions cron で自動実行される想定。
 *
 * 使い方:
 *   node scripts/twitter/post-weekend-spot.mjs           # スポットを投稿
 *   node scripts/twitter/post-weekend-spot.mjs --dry-run  # 投稿せずに内容を確認
 */

import { loadEnv, isDryRun, postTweet, makeUrl, ROOT, SCRIPTS_DIR } from "./lib/x-client.mjs";
import { getFishSummary, getSpotSummary } from "./lib/export-data.mjs";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

loadEnv();

// ─── 投稿済みスポット管理 ───

const POSTED_FILE = join(SCRIPTS_DIR, ".posted-weekend-spots.json");

/**
 * 投稿済みスポットのslug一覧を取得する
 * @returns {{ slug: string, date: string }[]}
 */
function getPostedSpots() {
  try {
    return JSON.parse(readFileSync(POSTED_FILE, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * 投稿済みスポットを記録する
 * @param {string} slug
 */
function markAsPosted(slug) {
  const posted = getPostedSpots();
  posted.push({ slug, date: new Date().toISOString() });
  writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2), "utf-8");
}

// ─── 地域名マッピング ───

/**
 * regionID からざっくりとした地方名を推定する
 * 正確なマッピングはTSの regions.ts にあるが、ここでは簡易版で対応
 */
const REGION_LABELS = {
  hokkaido: "北海道",
  tohoku: "東北",
  kanto: "関東",
  chubu: "中部",
  kinki: "近畿",
  chugoku: "中国",
  shikoku: "四国",
  kyushu: "九州",
  okinawa: "沖縄",
};

// ─── スポットタイプの日本語表記 ───

const SPOT_TYPE_LABELS = {
  port: "漁港",
  breakwater: "堤防",
  beach: "砂浜",
  rocky: "磯",
  river: "河川",
  lake: "湖沼",
  pier: "桟橋",
  surf: "サーフ",
  canal: "運河",
  managed: "管理釣り場",
};

// ─── メインロジック ───

async function main() {
  console.log("=== 週末おすすめスポット投稿 ===\n");

  // データ取得
  const fishList = await getFishSummary();
  const spotList = await getSpotSummary();

  if (spotList.length === 0) {
    console.error("スポットデータが空です。キャッシュを再生成してください。");
    console.error("  node scripts/twitter/lib/export-data.mjs --force");
    process.exit(1);
  }

  // 今月のピーク魚種を特定
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const peakFishSlugs = new Set(
    fishList
      .filter((f) => f.peakMonths.includes(currentMonth))
      .map((f) => f.slug)
  );

  console.log(`今月（${currentMonth}月）のピーク魚種: ${peakFishSlugs.size}種`);

  if (peakFishSlugs.size === 0) {
    console.log("今月のピーク魚種がありません。シーズン中の魚種にフォールバックします。");
    // peakMonths がなくても seasonMonths にある魚種を使う
    fishList
      .filter((f) => f.seasonMonths.includes(currentMonth))
      .forEach((f) => peakFishSlugs.add(f.slug));
  }

  // ピーク魚種が釣れるスポットを抽出し、マッチ数でスコアリング
  const scoredSpots = spotList
    .map((spot) => {
      const matchingFish = spot.fishSlugs.filter((slug) => peakFishSlugs.has(slug));
      return { ...spot, matchingFish, score: matchingFish.length };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scoredSpots.length === 0) {
    console.log("ピーク魚種が釣れるスポットが見つかりません。ランダムに選択します。");
    // フォールバック: 全スポットからランダム
    const randomSpot = spotList[Math.floor(Math.random() * spotList.length)];
    await postSpotTweet(randomSpot, [], fishList);
    return;
  }

  // 投稿済みスポットを除外
  const postedSlugs = new Set(getPostedSpots().map((p) => p.slug));
  let candidates = scoredSpots.filter((s) => !postedSlugs.has(s.slug));

  if (candidates.length === 0) {
    console.log("全スポット投稿済み。リセットして最初から。");
    writeFileSync(POSTED_FILE, "[]", "utf-8");
    candidates = scoredSpots;
  }

  // 上位スコアのスポットからランダムに選択（トップ20%以内）
  const topThreshold = Math.max(1, Math.ceil(candidates.length * 0.2));
  const topCandidates = candidates.slice(0, topThreshold);
  const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

  console.log(
    `候補: ${candidates.length}件 / トップ: ${topCandidates.length}件 / 選択: ${selected.name}`
  );

  await postSpotTweet(selected, selected.matchingFish, fishList);
}

/**
 * スポット投稿を作成して投稿する
 * @param {object} spot - スポットサマリオブジェクト
 * @param {string[]} matchingFishSlugs - 今月のピーク魚種のslug配列
 * @param {object[]} fishList - 全魚種サマリ配列
 */
async function postSpotTweet(spot, matchingFishSlugs, fishList) {
  // マッチした魚種の名前を取得
  const fishNames = matchingFishSlugs
    .map((slug) => {
      const fish = fishList.find((f) => f.slug === slug);
      return fish ? fish.name : null;
    })
    .filter(Boolean)
    .slice(0, 4); // 最大4種表示

  // スポットタイプの日本語化
  const spotTypeLabel = SPOT_TYPE_LABELS[spot.spotType] || "";

  // ツイート本文を組み立て
  const lines = [];
  lines.push("🎣 今週末のおすすめスポット\n");
  lines.push(`📍 ${spot.name}`);

  if (fishNames.length > 0) {
    lines.push(`🐟 今が旬: ${fishNames.join("・")}`);
  }

  if (spotTypeLabel) {
    lines.push(`📌 ${spotTypeLabel}`);
  }

  lines.push("");
  lines.push("週末の釣り計画はこちら👇");
  lines.push(makeUrl(`/spots/${spot.slug}`, "weekend-spot"));
  lines.push("#釣り場 #週末釣り #ツリスポ");

  const tweetText = lines.join("\n");

  console.log("\n=== ツイート内容 ===");
  console.log(tweetText);
  console.log(`\n文字数: ${tweetText.length}字`);

  if (isDryRun) {
    console.log("\n[dry-run] 投稿はスキップ");
    return;
  }

  await postTweet(tweetText);
  markAsPosted(spot.slug);
  console.log(`\n投稿済みスポットに記録: ${spot.slug}`);
}

// ─── 実行 ───

main().catch((err) => {
  console.error("エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
