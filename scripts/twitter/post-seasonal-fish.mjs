#!/usr/bin/env node
/**
 * X (Twitter) 旬魚ガイド投稿スクリプト
 *
 * 今月のピークシーズンの魚種を1つ選んで紹介ツイートを投稿する。
 * 土曜12:00に GitHub Actions cron で自動実行される想定。
 *
 * 使い方:
 *   node scripts/twitter/post-seasonal-fish.mjs           # 旬魚ガイドを投稿
 *   node scripts/twitter/post-seasonal-fish.mjs --dry-run  # 投稿せずに内容を確認
 */

import { loadEnv, isDryRun, postTweet, makeUrl, ROOT, SCRIPTS_DIR } from "./lib/x-client.mjs";
import { getFishSummary } from "./lib/export-data.mjs";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

loadEnv();

// ─── 投稿済み魚種管理 ───

const POSTED_FILE = join(SCRIPTS_DIR, ".posted-seasonal-fish.json");

/**
 * 投稿済み魚種のslug一覧を取得する
 * @returns {{ slug: string, date: string, month: number }[]}
 */
function getPostedFish() {
  try {
    return JSON.parse(readFileSync(POSTED_FILE, "utf-8"));
  } catch {
    return [];
  }
}

/**
 * 投稿済み魚種を記録する
 * @param {string} slug
 * @param {number} month
 */
function markAsPosted(slug, month) {
  const posted = getPostedFish();
  posted.push({ slug, date: new Date().toISOString(), month });
  writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2), "utf-8");
}

// ─── 人気魚種の詳細情報マップ ───

/**
 * 人気魚種の釣り方・説明文
 * ツイート本文に使う補足情報。ここにない魚種はジェネリックテンプレートを使用する。
 */
const FISH_DESCRIPTIONS = {
  aji: {
    method: "サビキ釣り",
    desc: "群れで回遊する初心者の定番ターゲット",
    tip: "朝マヅメ・夕マヅメが狙い目",
  },
  saba: {
    method: "サビキ釣り・ジグサビキ",
    desc: "力強い引きが楽しめる回遊魚",
    tip: "鮮度が落ちやすいのでクーラーボックス必須",
  },
  iwashi: {
    method: "サビキ釣り",
    desc: "ファミリーフィッシングの定番",
    tip: "群れが入ればバケツ一杯も夢じゃない",
  },
  aoriika: {
    method: "エギング",
    desc: "春の大型接岸シーズン到来",
    tip: "春は3.5号エギでボトム中心に攻める",
  },
  madai: {
    method: "タイラバ・フカセ",
    desc: "桜鯛シーズン、ピンク色の美しい魚体",
    tip: "潮の変わり目が最大のチャンス",
  },
  kurodai: {
    method: "ウキフカセ・落とし込み",
    desc: "チヌとも呼ばれる堤防釣りの王道",
    tip: "警戒心が強いので静かに釣ること",
  },
  kisu: {
    method: "投げ釣り（ちょい投げ）",
    desc: "天ぷらが絶品のキス釣りシーズン",
    tip: "砂浜のカケアガリを狙うのがコツ",
  },
  mebaru: {
    method: "メバリング",
    desc: "春告魚の名を持つ早春のターゲット",
    tip: "常夜灯周りの明暗部が好ポイント",
  },
  tachiuo: {
    method: "テンヤ・ワインド",
    desc: "銀色に輝く刀のような美しい魚体",
    tip: "夕マヅメから夜がゴールデンタイム",
  },
  hirame: {
    method: "泳がせ釣り・ルアー",
    desc: "高級白身魚の代表格",
    tip: "離岸流の周りにエサの小魚が溜まりやすい",
  },
  seabass: {
    method: "ルアー（ミノー・バイブレーション）",
    desc: "シーバス（スズキ）はルアー釣りの王道",
    tip: "河口域のベイトの動きを観察して攻める",
  },
  buri: {
    method: "ショアジギング",
    desc: "出世魚の頂点、冬の脂乗りは格別",
    tip: "朝マヅメの回遊を見逃すな",
  },
  karei: {
    method: "投げ釣り",
    desc: "冬の投げ釣りターゲットの王様",
    tip: "エサはアオイソメの房掛けが効果的",
  },
  kasago: {
    method: "穴釣り・ブラクリ",
    desc: "テトラの穴に潜む身近なロックフィッシュ",
    tip: "底に着いたら少し持ち上げて待つのが基本",
  },
  nijimasu: {
    method: "ルアー（スプーン）・フライ",
    desc: "管理釣り場の主力ターゲット",
    tip: "スプーンのカラーローテーションが鍵",
  },
};

// ─── 月の日本語表記 ───

const MONTH_NAMES = [
  "", "1", "2", "3", "4", "5", "6",
  "7", "8", "9", "10", "11", "12",
];

/**
 * peakMonths配列を「4〜6月、9〜11月」のような読みやすい文字列に変換する
 * @param {number[]} months - ピーク月の配列（例: [4,5,6,9,10,11]）
 * @returns {string}
 */
function formatMonthRange(months) {
  if (!months || months.length === 0) return "通年";

  // ソート済みにする
  const sorted = [...months].sort((a, b) => a - b);

  // 連続する月をグループ化
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i];
    } else {
      ranges.push([start, prev]);
      start = sorted[i];
      prev = sorted[i];
    }
  }
  ranges.push([start, prev]);

  // 文字列化
  return ranges
    .map(([s, e]) => (s === e ? `${s}月` : `${s}〜${e}月`))
    .join("、");
}

/**
 * 季節を表すキーワードを返す
 * @param {number} month - 月（1-12）
 * @returns {string}
 */
function getSeasonWord(month) {
  if (month >= 3 && month <= 5) return "春";
  if (month >= 6 && month <= 8) return "夏";
  if (month >= 9 && month <= 11) return "秋";
  return "冬";
}

// ─── メインロジック ───

async function main() {
  console.log("=== 旬魚ガイド投稿 ===\n");

  const fishList = await getFishSummary();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const season = getSeasonWord(currentMonth);

  // 今月のピーク魚種
  let peakFish = fishList.filter((f) => f.peakMonths.includes(currentMonth));

  console.log(`今月（${currentMonth}月）のピーク魚種: ${peakFish.length}種`);

  if (peakFish.length === 0) {
    console.log("ピーク魚種が見つかりません。シーズン中の魚種にフォールバックします。");
    peakFish = fishList.filter((f) => f.seasonMonths.includes(currentMonth));
  }

  if (peakFish.length === 0) {
    console.error("対象魚種が見つかりません。データを確認してください。");
    process.exit(1);
  }

  // 投稿済みを除外
  const posted = getPostedFish();
  const postedSlugs = new Set(
    posted.filter((p) => p.month === currentMonth).map((p) => p.slug)
  );
  let candidates = peakFish.filter((f) => !postedSlugs.has(f.slug));

  if (candidates.length === 0) {
    console.log(`${currentMonth}月の全魚種投稿済み。リセットして最初から。`);
    // 今月分だけリセット
    const remaining = posted.filter((p) => p.month !== currentMonth);
    writeFileSync(POSTED_FILE, JSON.stringify(remaining, null, 2), "utf-8");
    candidates = peakFish;
  }

  // ランダムに1種選択（FISH_DESCRIPTIONSにある魚を優先）
  const withDesc = candidates.filter((f) => FISH_DESCRIPTIONS[f.slug]);
  const pool = withDesc.length > 0 ? withDesc : candidates;
  const selected = pool[Math.floor(Math.random() * pool.length)];

  console.log(`選択: ${selected.name}（${selected.slug}）`);

  await postFishTweet(selected, currentMonth, season);
}

/**
 * 旬魚ガイドツイートを作成して投稿する
 * @param {object} fish - 魚種サマリオブジェクト
 * @param {number} month - 現在の月
 * @param {string} season - 季節名
 */
async function postFishTweet(fish, month, season) {
  const info = FISH_DESCRIPTIONS[fish.slug];

  // ツイート本文を組み立て
  const lines = [];
  lines.push(`🐟 ${month}月の旬魚ガイド【${fish.name}】\n`);

  if (info) {
    // 詳細情報ありの場合
    lines.push(`${season}の${fish.name}シーズン到来！`);
    lines.push(info.desc);
    lines.push("");
    lines.push(`📍 おすすめの釣り方: ${info.method}`);
  } else {
    // ジェネリックテンプレート
    lines.push(`${season}に狙いたい${fish.name}が好シーズン！`);
    lines.push("");
  }

  lines.push(`📅 ベストシーズン: ${formatMonthRange(fish.peakMonths)}`);

  if (info && info.tip) {
    lines.push(`💡 ${info.tip}`);
  }

  lines.push("");
  lines.push(`図鑑はこちら→ ${makeUrl(`/fish/${fish.slug}`, "seasonal-fish")}`);
  lines.push(`#${fish.name} #${month}月の釣り #旬の魚 #釣り #ツリスポ`);

  const tweetText = lines.join("\n");

  console.log("\n=== ツイート内容 ===");
  console.log(tweetText);
  console.log(`\n文字数: ${tweetText.length}字`);

  // 280文字制限チェック（日本語は1文字=2としてカウントされる場合があるので注意）
  if (tweetText.length > 280) {
    console.warn(`注意: ${tweetText.length}文字（280文字制限超過の可能性あり）`);
  }

  if (isDryRun) {
    console.log("\n[dry-run] 投稿はスキップ");
    return;
  }

  await postTweet(tweetText);
  markAsPosted(fish.slug, month);
  console.log(`\n投稿済み魚種に記録: ${fish.slug}（${month}月）`);
}

// ─── 実行 ───

main().catch((err) => {
  console.error("エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
