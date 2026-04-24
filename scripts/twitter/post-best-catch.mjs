#!/usr/bin/env node
/**
 * X (Twitter) 今週のベスト釣果 自動投稿スクリプト
 *
 * 全エリアの最新週報JSONを横断的に分析し、好調度（🔥数）上位3件を
 * 「今週のベスト釣果」としてツイートする。
 *
 * 使い方:
 *   node scripts/twitter/post-best-catch.mjs           # ベスト釣果を投稿
 *   node scripts/twitter/post-best-catch.mjs --dry-run  # 投稿せずに内容を確認
 */

import { loadEnv, isDryRun, postTweet, makeUrl, stripHtml, ROOT } from "./lib/x-client.mjs";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

loadEnv();

// ── 定数 ──

const REPORTS_DIR = join(ROOT, "scripts/weekly-reports");

const AREA_NAME_MAP = {
  "akashi-kobe": "明石・神戸",
  "osaka-sennan": "大阪湾・泉南",
  "tokyobay": "東京湾・横浜",
  "fukuoka-kitakyushu": "福岡・北九州",
  "suruga-izu": "駿河湾・伊豆",
  "chita-mikawa": "知多・三河",
  "nanki-shirahama": "南紀・白浜",
  "setouchi-hiroshima": "瀬戸内・広島",
  "sendai-ishinomaki": "仙台・石巻",
  "otaru-ishikari": "小樽・石狩",
};

// ── ユーティリティ ──

/**
 * ファイル名から年・月・週番号・エリアスラッグを抽出する
 * 形式: {area-slug}-{year}-{month}-week{N}.json
 */
function parseFilename(filename) {
  const match = filename.match(/^(.+)-(\d{4})-(\d{2})-week(\d+)\.json$/);
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
    files = readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".json") && f.includes("-week"));
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
    (p) => p.year === latest.year && p.month === latest.month && p.week === latest.week
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

/**
 * HTMLコンテンツのテーブルから釣果データを抽出する
 * テーブルヘッダ: スポット, 魚種, サイズ, 釣り方, 好調度
 * @returns {{ spot: string, fish: string, size: string, method: string, rating: number }[]}
 */
function parseTableFromHtml(html) {
  if (!html) return [];

  const results = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const rowHtml = trMatch[1];
    // ヘッダ行はスキップ
    if (/<th[\s>]/i.test(rowHtml)) continue;

    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(stripHtml(tdMatch[1]));
    }

    // 5カラム: スポット, 魚種, サイズ, 釣り方, 好調度
    if (cells.length >= 5) {
      const ratingText = cells[4];
      const rating = (ratingText.match(/\u{1F525}/gu) || []).length;
      results.push({
        spot: cells[0],
        fish: cells[1],
        size: cells[2],
        method: cells[3],
        rating,
      });
    }
  }

  return results;
}

/**
 * サイズ文字列から数値（cm / kg）を抽出してソート用の値を返す
 * 大きい方を優先。"30〜40cm" → 40、"〜2kg" → 2000（グラム換算）
 */
function parseSizeValue(sizeStr) {
  if (!sizeStr) return 0;

  // kg表記を優先チェック（kg は cm より大きな単位として扱う）
  const kgMatch = sizeStr.match(/([\d.]+)\s*kg/i);
  if (kgMatch) {
    return parseFloat(kgMatch[1]) * 1000; // グラム換算で大きくする
  }

  // cm表記 — 範囲がある場合は最大値を取る
  const cmMatches = sizeStr.match(/(\d+(?:\.\d+)?)\s*cm/gi);
  if (cmMatches && cmMatches.length > 0) {
    const values = cmMatches.map((m) => parseFloat(m));
    return Math.max(...values);
  }

  // 数字だけ拾う（単位なし）
  const numMatches = sizeStr.match(/(\d+(?:\.\d+)?)/g);
  if (numMatches && numMatches.length > 0) {
    return Math.max(...numMatches.map(Number));
  }

  return 0;
}

/**
 * Twitter の文字数を計算する（日本語=2文字、ASCII=1文字、URLは23文字固定）
 */
function twitterCharCount(text) {
  const urlRegex = /https?:\/\/\S+/g;
  const urls = text.match(urlRegex) || [];
  const textWithoutUrls = text.replace(urlRegex, "");

  let count = 0;
  for (const char of textWithoutUrls) {
    const code = char.codePointAt(0);
    count += code <= 0x10FF ? 1 : 2;
  }

  count += urls.length * 23;
  return count;
}

/**
 * メダル絵文字を返す
 */
function medalEmoji(rank) {
  if (rank === 1) return "1️⃣";
  if (rank === 2) return "2️⃣";
  if (rank === 3) return "3️⃣";
  return `${rank}.`;
}

// ── メイン処理 ──

async function main() {
  const { files, year, month, week } = getLatestWeekFiles();
  console.log(`最新週報: ${year}年${month}月 第${week}週（${files.length}エリア）\n`);

  // 全エリアの釣果データを収集
  /** @type {{ areaSlug: string, areaName: string, spot: string, fish: string, size: string, method: string, rating: number }[]} */
  const allEntries = [];

  for (const f of files) {
    const report = loadReport(f.filename);
    const areaName = AREA_NAME_MAP[f.slug] || f.slug;

    if (!report.content) {
      console.log(`  スキップ（テーブルデータなし）: ${areaName}`);
      continue;
    }

    const entries = parseTableFromHtml(report.content);
    console.log(`  ${areaName}: ${entries.length}件の釣果データ`);

    for (const entry of entries) {
      allEntries.push({
        areaSlug: f.slug,
        areaName,
        ...entry,
      });
    }
  }

  if (allEntries.length === 0) {
    console.error("\n釣果データが見つかりません（テーブルデータを持つ週報がありません）");
    process.exit(1);
  }

  console.log(`\n全${allEntries.length}件の釣果データを収集`);

  // 好調度（🔥数）→ サイズの順でソート
  allEntries.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return parseSizeValue(b.size) - parseSizeValue(a.size);
  });

  // 上位3件を選定（同じエリア・魚種の重複はなるべく避ける）
  const top3 = [];
  const usedKeys = new Set();

  for (const entry of allEntries) {
    if (top3.length >= 3) break;

    // エリア+魚種の組み合わせで重複チェック（同じスポットの同じ魚は1回だけ）
    const key = `${entry.areaSlug}-${entry.fish}`;
    if (usedKeys.has(key)) continue;

    usedKeys.add(key);
    top3.push(entry);
  }

  console.log(`\nベスト釣果 TOP${top3.length}:`);
  for (let i = 0; i < top3.length; i++) {
    const e = top3[i];
    console.log(`  ${i + 1}. ${"🔥".repeat(e.rating)} ${e.areaName}・${e.spot}: ${e.fish} ${e.size}（${e.method}）`);
  }

  // ツイート本文を組み立て
  const url = makeUrl("/", "best-catch");

  const rankLines = top3.map((e, i) => {
    const medal = medalEmoji(i + 1);
    // スポット名を短縮（長い場合は括弧部分を除去）
    const shortSpot = e.spot.replace(/（.*?）/g, "").replace(/\(.*?\)/g, "");
    // サイズと釣り方をコンパクトに
    const sizeInfo = e.size ? ` ${e.size}` : "";
    const methodInfo = e.method ? `（${e.method}）` : "";
    return `${medal} ${e.areaName}・${shortSpot}: ${e.fish}${sizeInfo}${methodInfo}`;
  });

  const tweetParts = [
    "🏆 今週のベスト釣果",
    "",
    ...rankLines,
    "",
    `来週はどこが釣れる？→ ${url}`,
    "#釣果 #週報 #釣り #ツリスポ",
  ];

  let tweetText = tweetParts.join("\n");

  // 280文字チェック — 超える場合はランク行を短縮
  if (twitterCharCount(tweetText) > 280) {
    // 釣り方を省略して再構成
    const shortRankLines = top3.map((e, i) => {
      const medal = medalEmoji(i + 1);
      const shortSpot = e.spot.replace(/（.*?）/g, "").replace(/\(.*?\)/g, "");
      const sizeInfo = e.size ? ` ${e.size}` : "";
      return `${medal} ${e.areaName}・${shortSpot}: ${e.fish}${sizeInfo}`;
    });

    tweetText = [
      "🏆 今週のベスト釣果",
      "",
      ...shortRankLines,
      "",
      `来週はどこが釣れる？→ ${url}`,
      "#釣果 #週報 #釣り #ツリスポ",
    ].join("\n");
  }

  // さらに超える場合はスポット名も省略
  if (twitterCharCount(tweetText) > 280) {
    const minimalRankLines = top3.map((e, i) => {
      const medal = medalEmoji(i + 1);
      return `${medal} ${e.areaName}: ${e.fish} ${e.size}`;
    });

    tweetText = [
      "🏆 今週のベスト釣果",
      "",
      ...minimalRankLines,
      "",
      `詳細→ ${url}`,
      "#釣果 #週報 #釣り #ツリスポ",
    ].join("\n");
  }

  // プレビュー表示
  console.log("\n=== ツイート内容 ===");
  console.log(tweetText);
  console.log(`\n文字数: ${tweetText.length}字（Twitter換算: 約${twitterCharCount(tweetText)}文字）`);

  if (isDryRun) {
    console.log("\n[dry-run] 投稿はスキップ");
    return;
  }

  // 投稿
  console.log("\n投稿中...");
  await postTweet(tweetText);
  console.log("\nベスト釣果ツイート投稿完了");
}

main().catch((err) => {
  console.error("エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
