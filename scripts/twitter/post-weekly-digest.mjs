#!/usr/bin/env node
/**
 * X (Twitter) 週報ダイジェスト自動投稿スクリプト
 *
 * 使い方:
 *   node scripts/twitter/post-weekly-digest.mjs           # 最新週報をスレッド投稿
 *   node scripts/twitter/post-weekly-digest.mjs --dry-run  # 投稿せずに内容を確認
 */

import { TwitterApi } from "twitter-api-v2";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const REPORTS_DIR = join(ROOT, "scripts/weekly-reports");

// .env.local を手動パース
function loadEnv() {
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

/** HTMLタグを除去する */
function stripHtml(text) {
  return text.replace(/<[^>]*>/g, "").trim();
}

/** テキストを指定文字数以内に短縮する */
function truncate(text, maxLen) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "…";
}

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
function buildMainTweet(areaReports) {
  const areaCount = areaReports.length;
  const header = `今週の釣果週報！全${areaCount}エリアの最新情報\n\n`;
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
const dryRun = args.includes("--dry-run");

async function main() {
  const { files, year, month, week } = getLatestWeekFiles();
  console.log(`最新週報: ${year}年${month}月 第${week}週（${files.length}エリア）\n`);

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

  // メインツイート
  const mainTweet = buildMainTweet(areaReports);

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

  if (dryRun) {
    console.log("[dry-run] 投稿はスキップ");
    return;
  }

  // Twitter API クライアント初期化
  const {
    X_API_KEY,
    X_API_KEY_SECRET,
    X_ACCESS_TOKEN,
    X_ACCESS_TOKEN_SECRET,
  } = process.env;
  if (
    !X_API_KEY ||
    !X_API_KEY_SECRET ||
    !X_ACCESS_TOKEN ||
    !X_ACCESS_TOKEN_SECRET
  ) {
    console.error("X API の環境変数が設定されていません");
    console.error(
      "必要: X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET"
    );
    process.exit(1);
  }

  const client = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_KEY_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  });

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
