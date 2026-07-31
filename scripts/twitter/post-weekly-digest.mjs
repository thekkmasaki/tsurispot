#!/usr/bin/env node
/**
 * X (Twitter) 週報ダイジェスト自動投稿スクリプト
 *
 * 使い方:
 *   node scripts/twitter/post-weekly-digest.mjs           # 最新週報をスレッド投稿
 *   node scripts/twitter/post-weekly-digest.mjs --dry-run  # 投稿せずに内容を確認
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { loadEnv, getClient, isDryRun, ROOT, stripHtml, truncate, assessWeekFreshness, allowStale } from "./lib/x-client.mjs";

const REPORTS_DIR = join(ROOT, "scripts/weekly-reports");

loadEnv();

// ── エリア名マッピング ──

const AREA_NAME_MAP = {
  "akashi-kobe": "明石・神戸",
  "osaka-sennan": "大阪湾・泉南",
  tokyobay: "東京湾・横浜",
  "fukuoka-kitakyushu": "福岡・北九州",
  "suruga-izu": "駿河湾・伊豆",
  "chita-mikawa": "知多・三河",
  "nanki-shirahama": "南紀・白浜",
  "setouchi-hiroshima": "瀬戸内・広島",
  "sendai-ishinomaki": "仙台・石巻",
  "otaru-ishikari": "小樽・石狩",
};

// ── ユーティリティ ──

/** 指定ミリ秒待機する */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── 最新週報ファイルの取得 ──

/**
 * ファイル名から年・月・週番号を抽出する
 * 形式: {area-slug}-{year}-{month}-week{N}.json
 */
function parseFilename(filename) {
  const match = filename.match(
    /^(.+)-(\d{4})-(\d{2})-week(\d+)\.json$/
  );
  if (!match) return null;
  return {
    slug: match[1],
    year: parseInt(match[2]),
    month: parseInt(match[3]),
    week: parseInt(match[4]),
    filename,
  };
}

/**
 * scripts/weekly-reports/ から最新週のファイル群を取得する
 */
function getLatestWeekFiles() {
  let files;
  try {
    files = readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".json"));
  } catch {
    console.error("weekly-reports ディレクトリが見つかりません:", REPORTS_DIR);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error("週報ファイルが見つかりません");
    process.exit(1);
  }

  const parsed = files.map(parseFilename).filter(Boolean);
  if (parsed.length === 0) {
    console.error("有効な週報ファイルが見つかりません");
    process.exit(1);
  }

  // 最新の年・月・週を特定
  parsed.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.month !== b.month) return b.month - a.month;
    return b.week - a.week;
  });

  const latest = parsed[0];
  const latestFiles = parsed.filter(
    (p) =>
      p.year === latest.year &&
      p.month === latest.month &&
      p.week === latest.week
  );

  return { files: latestFiles, year: latest.year, month: latest.month, week: latest.week };
}

/**
 * JSONファイルを読み込んでパースする
 */
function loadReport(filename) {
  const filepath = join(REPORTS_DIR, filename);
  const raw = readFileSync(filepath, "utf-8");
  return JSON.parse(raw);
}

// ── ツイート組み立て ──

/**
 * descriptionからハイライト（短い要約）を生成する
 * descriptionの冒頭「{エリア名}エリアの{月}月第{N}週釣果。」を除去してコンパクトにする
 */
function makeHighlight(areaName, description) {
  let clean = stripHtml(description);
  // 「明石・神戸エリアの3月第3週釣果。」のような冒頭を除去
  clean = clean.replace(/^.+?エリアの\d+月第\d+週釣果[。．]\s*/, "");
  return `${areaName}: ${truncate(clean, 20)}`;
}

/**
 * メインツイートを組み立てる
 * 140文字（日本語）以内に収める
 */
function buildMainTweet(areaReports, headline) {
  const header = `${headline}\n\n`;
  const footer = `\n\n詳しくはリプライから\n#釣果 #釣り #ツリスポ`;

  // ハイライトを入れられるだけ入れる
  const highlights = [];
  let currentLen = header.length + footer.length;

  for (const { areaName, description } of areaReports) {
    const highlight = makeHighlight(areaName, description);
    const lineLen = highlight.length + 1; // +1 for newline
    if (currentLen + lineLen > 135) break; // 安全マージン
    highlights.push(highlight);
    currentLen += lineLen;
  }

  // ハイライトが1つも入らない場合はエリア名だけ列挙
  if (highlights.length === 0) {
    const names = areaReports.map((r) => r.areaName).join("・");
    const truncatedNames = truncate(names, 135 - header.length - footer.length);
    return `${header}${truncatedNames}${footer}`;
  }

  return `${header}${highlights.join("\n")}${footer}`;
}

/**
 * エリアごとのリプライツイートを組み立てる
 */
function buildReplyTweet(areaName, description, slug) {
  const clean = stripHtml(description);
  const shortDesc = truncate(clean, 100);
  const url = `https://tsurispot.com/blog/${slug}`;
  return `${areaName}\n${shortDesc}\n\n${url}`;
}

// ── メイン処理 ──

const args = process.argv.slice(2);

async function main() {
  const { files, year, month, week } = getLatestWeekFiles();
  console.log(`最新週報: ${year}年${month}月 第${week}週（${files.length}エリア）\n`);

  // 鮮度ガード: 古い週報を「今週の」と称して投稿すると信頼を失うため防ぐ
  const { freshness, daysOld, monthWeekLabel } = assessWeekFreshness(year, month, week);
  if (freshness === "stale" && !allowStale) {
    console.log(
      `[skip] 最新週報が約${daysOld}日前（${monthWeekLabel}）と古いため、週報ダイジェスト投稿を見送りました。\n` +
        `週報を更新してください（--allow-stale で強制投稿可）。`
    );
    return;
  }

  // 各エリアのデータを読み込み
  const areaReports = files.map((f) => {
    const report = loadReport(f.filename);
    const areaName = AREA_NAME_MAP[f.slug] || f.slug;
    return {
      areaName,
      slug: f.slug,
      title: report.title,
      description: report.description,
      blogSlug: report.slug,
    };
  });

  // 鮮度に応じて見出しを切替（fresh=「今週の」/ recent=「◯月第◯週の」）
  const headline =
    freshness === "fresh"
      ? `今週の釣果週報！全${areaReports.length}エリアの最新情報`
      : `${monthWeekLabel}の釣果まとめ！全${areaReports.length}エリア`;

  // メインツイート
  const mainTweet = buildMainTweet(areaReports, headline);

  // リプライツイート
  const replies = areaReports.map((r) =>
    buildReplyTweet(r.areaName, r.description, r.blogSlug)
  );

  // プレビュー表示
  console.log("=== メインツイート ===");
  console.log(mainTweet);
  console.log(`（${mainTweet.length}文字）\n`);

  for (let i = 0; i < replies.length; i++) {
    console.log(`=== リプライ ${i + 1}/${replies.length}: ${areaReports[i].areaName} ===`);
    console.log(replies[i]);
    console.log(`（${replies[i].length}文字）\n`);
  }

  if (isDryRun) {
    console.log("[dry-run] 投稿はスキップ");
    return;
  }

  // Twitter API クライアント初期化
  const client = getClient();

  // メインツイート投稿
  console.log("メインツイート投稿中...");
  const tweet = await client.v2.tweet(mainTweet);
  console.log(
    `メインツイート投稿完了: https://x.com/tsurispot_jp/status/${tweet.data.id}`
  );

  // リプライをスレッドとして投稿（レート制限対策: 2秒間隔）
  let lastTweetId = tweet.data.id;
  for (let i = 0; i < replies.length; i++) {
    await sleep(2000);
    console.log(
      `リプライ投稿中 (${i + 1}/${replies.length}): ${areaReports[i].areaName}...`
    );
    const reply = await client.v2.reply(replies[i], lastTweetId);
    console.log(
      `  投稿完了: https://x.com/tsurispot_jp/status/${reply.data.id}`
    );
    lastTweetId = reply.data.id;
  }

  console.log(`\n全${replies.length + 1}件のスレッド投稿完了`);
}

main().catch((err) => {
  console.error("エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
