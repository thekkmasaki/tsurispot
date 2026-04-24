#!/usr/bin/env node
/**
 * X (Twitter) 釣果速報 自動投稿スクリプト
 *
 * 最新の週報JSONからエリア別の釣果速報ツイートを投稿する。
 * HTMLテーブルから釣果データを抽出し、好調度（🔥数）上位3件をピックアップ。
 * 同じ週に同じエリアを重複投稿しないようトラッキングファイルで管理。
 *
 * 使い方:
 *   node scripts/twitter/post-catch-report.mjs           # 釣果速報を投稿
 *   node scripts/twitter/post-catch-report.mjs --dry-run  # 投稿せずに内容を確認
 */

import { loadEnv, isDryRun, postTweet, makeUrl, stripHtml, truncate, ROOT } from "./lib/x-client.mjs";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

loadEnv();

// ── 定数 ──

const REPORTS_DIR = join(ROOT, "scripts/weekly-reports");
const POSTED_FILE = join(ROOT, "scripts/twitter/.posted-catch-reports.json");

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
  // <tr>...</tr> を全て抽出（thead含む）
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let trMatch;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const rowHtml = trMatch[1];
    // <th>を含む行（ヘッダ行）はスキップ
    if (/<th[\s>]/i.test(rowHtml)) continue;

    // <td>の中身を順番に抽出
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells = [];
    let tdMatch;
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(stripHtml(tdMatch[1]));
    }

    // 5カラム: スポット, 魚種, サイズ, 釣り方, 好調度
    if (cells.length >= 5) {
      const ratingText = cells[4];
      // 🔥（U+1F525）の個数をカウント
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
 * 投稿済みエリアのトラッキングファイルを読み込む
 * @returns {{ weekKey: string, areas: string[], date: string }[]}
 */
function getPostedAreas() {
  try {
    return JSON.parse(readFileSync(POSTED_FILE, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * 投稿済みエリアをトラッキングファイルに保存する
 */
function savePostedAreas(data) {
  writeFileSync(POSTED_FILE, JSON.stringify(data, null, 2));
}

/**
 * 今週の週キーを生成（例: "2026-04-week2"）
 */
function makeWeekKey(year, month, week) {
  return `${year}-${String(month).padStart(2, "0")}-week${week}`;
}

/**
 * Twitter の文字数を計算する（日本語=2文字、ASCII=1文字、URLは23文字固定）
 * 参考: https://developer.twitter.com/en/docs/counting-characters
 */
function twitterCharCount(text) {
  // URLを先に除去して23文字としてカウント
  const urlRegex = /https?:\/\/\S+/g;
  const urls = text.match(urlRegex) || [];
  const textWithoutUrls = text.replace(urlRegex, "");

  let count = 0;
  for (const char of textWithoutUrls) {
    // ASCII範囲（U+0000〜U+10FF）は1文字、それ以外は2文字
    // ただし一部の絵文字は2文字
    const code = char.codePointAt(0);
    if (code <= 0x10FF) {
      count += 1;
    } else {
      count += 2;
    }
  }

  // URL は1つにつき23文字
  count += urls.length * 23;

  return count;
}

/**
 * エリアのハッシュタグを生成する
 * エリア名と上位魚種から生成
 */
function makeHashtags(areaName, topEntries) {
  const tags = ["#釣果", "#釣り", "#ツリスポ"];

  // エリア名から短縮ハッシュタグ（「・」で分割して最初の部分）
  const areaShort = areaName.split("・")[0];
  tags.splice(1, 0, `#${areaShort}`);

  // 上位魚種のハッシュタグ（重複排除、最大2つ）
  const fishNames = [...new Set(topEntries.map((e) => e.fish.split("・")[0]))];
  for (const fish of fishNames.slice(0, 2)) {
    tags.splice(tags.length - 1, 0, `#${fish}`);
  }

  return tags.join(" ");
}

/**
 * 好調度を日本語テキストに変換
 */
function ratingToText(rating) {
  if (rating >= 5) return "絶好調！";
  if (rating >= 4) return "好調！";
  if (rating >= 3) return "まずまず";
  return "ぼちぼち";
}

// ── メイン処理 ──

async function main() {
  const { files, year, month, week } = getLatestWeekFiles();
  const weekKey = makeWeekKey(year, month, week);
  console.log(`最新週報: ${year}年${month}月 第${week}週（${files.length}エリア）`);

  // 投稿済みエリアを確認
  const postedData = getPostedAreas();
  const thisWeekRecord = postedData.find((r) => r.weekKey === weekKey);
  const postedSlugs = new Set(thisWeekRecord?.areas || []);

  // content フィールドを持つ（テーブルデータあり）ファイルのみ対象
  const candidates = files.filter((f) => {
    if (postedSlugs.has(f.slug)) {
      console.log(`  スキップ（投稿済み）: ${AREA_NAME_MAP[f.slug] || f.slug}`);
      return false;
    }
    const report = loadReport(f.filename);
    if (!report.content) {
      console.log(`  スキップ（テーブルデータなし）: ${AREA_NAME_MAP[f.slug] || f.slug}`);
      return false;
    }
    return true;
  });

  if (candidates.length === 0) {
    console.log("\n今週投稿可能なエリアがありません（全て投稿済みまたはテーブルデータなし）");
    process.exit(0);
  }

  // ランダムにエリアを1つ選択
  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  const areaName = AREA_NAME_MAP[selected.slug] || selected.slug;
  const report = loadReport(selected.filename);

  console.log(`\n選択エリア: ${areaName}`);

  // テーブルから釣果データを抽出
  const entries = parseTableFromHtml(report.content);

  if (entries.length === 0) {
    console.error("テーブルから釣果データを抽出できませんでした");
    process.exit(1);
  }

  // 好調度（🔥数）順にソートし、上位3件を取得
  entries.sort((a, b) => b.rating - a.rating);
  const topEntries = entries.slice(0, 3);

  console.log(`\n抽出した釣果データ（上位${topEntries.length}件）:`);
  for (const e of topEntries) {
    console.log(`  ${"🔥".repeat(e.rating)} ${e.spot}: ${e.fish} ${e.size}（${e.method}）`);
  }

  // ツイート本文を組み立て
  const blogUrl = makeUrl(`/blog/${report.slug}`, "catch-report");
  const hashtags = makeHashtags(areaName, topEntries);

  // 釣果サマリー行を生成
  const summaryLines = topEntries.map((e) => {
    const status = ratingToText(e.rating);
    return `${e.fish} ${e.size} ${e.method}で${status}`;
  });

  // description から要約文を取得（冒頭のエリア名部分を除去）
  let summary = stripHtml(report.description);
  summary = summary.replace(/^.+?エリア.+?の釣果[。．]\s*/, "");
  summary = truncate(summary, 40);

  // CTA
  const cta = "あなたの今週の釣果を教えてください！";

  // ツイート組み立て（280文字制限を意識）
  const tweetParts = [
    `🔥 ${areaName} 釣果速報`,
    "",
    ...summaryLines,
    "",
    summary,
    "",
    `詳細→ ${blogUrl}`,
    hashtags,
  ];

  let tweetText = tweetParts.join("\n");

  // 文字数チェック（280文字超えの場合はCTAを省略、それでも超えたらサマリー行を削る）
  if (twitterCharCount(tweetText) <= 280) {
    // CTAを追加する余裕があれば追加
    const withCta = [...tweetParts.slice(0, -1), "", cta, tweetParts[tweetParts.length - 1]].join("\n");
    if (twitterCharCount(withCta) <= 280) {
      tweetText = withCta;
    }
  } else {
    // summaryを削って再構成
    const shortParts = [
      `🔥 ${areaName} 釣果速報`,
      "",
      ...summaryLines.slice(0, 2),
      "",
      `詳細→ ${blogUrl}`,
      hashtags,
    ];
    tweetText = shortParts.join("\n");
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

  // 投稿済みに記録
  if (thisWeekRecord) {
    thisWeekRecord.areas.push(selected.slug);
    thisWeekRecord.date = new Date().toISOString();
  } else {
    postedData.push({
      weekKey,
      areas: [selected.slug],
      date: new Date().toISOString(),
    });
  }
  savePostedAreas(postedData);
  console.log(`\n投稿済みエリアを記録: ${areaName}（${weekKey}）`);
}

main().catch((err) => {
  console.error("エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
