#!/usr/bin/env node
/**
 * X (Twitter) 自動クイズ投稿スクリプト
 *
 * 使い方:
 *   node scripts/twitter/post-quiz.mjs           # ランダムなクイズを投稿
 *   node scripts/twitter/post-quiz.mjs --dry-run  # 投稿せずに内容を確認
 *   node scripts/twitter/post-quiz.mjs --type fish # 魚クイズのみ
 *   node scripts/twitter/post-quiz.mjs --type spot # スポットクイズのみ
 */

import { TwitterApi } from "twitter-api-v2";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");

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
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
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

// ── クイズデータ ──

const fishQuizzes = [
  {
    question: "🐟 この漢字、読めますか？\n\n「鰯」\n\nA. サバ\nB. イワシ\nC. サンマ\nD. アジ",
    answer: "正解は B.イワシ！\n「弱」いという字が入っているのは、水から出すとすぐ弱ってしまうから🐟",
    url: "https://tsurispot.com/fish/iwashi",
    tags: "#釣り #魚クイズ #イワシ #漢字クイズ",
  },
  {
    question: "🐟 この漢字、読めますか？\n\n「鱸」\n\nA. スズキ\nB. タチウオ\nC. サワラ\nD. ヒラメ",
    answer: "正解は A.スズキ！\nシーバスとも呼ばれ、ルアーフィッシングの大人気ターゲット🎣",
    url: "https://tsurispot.com/fish/suzuki",
    tags: "#釣り #魚クイズ #シーバス #スズキ",
  },
  {
    question: "🐟 この漢字、読めますか？\n\n「鯛」\n\nA. サケ\nB. タイ\nC. フグ\nD. カレイ",
    answer: "正解は B.タイ！\n「めでたい」の語呂合わせでお祝い魚の代表🎉",
    url: "https://tsurispot.com/fish/madai",
    tags: "#釣り #魚クイズ #真鯛 #タイ",
  },
  {
    question: "🐟 この漢字、読めますか？\n\n「鰈」\n\nA. ヒラメ\nB. カレイ\nC. エイ\nD. カワハギ",
    answer: "正解は B.カレイ！\n「左ヒラメに右カレイ」— 目が右側にあるのがカレイです👀",
    url: "https://tsurispot.com/fish/karei",
    tags: "#釣り #魚クイズ #カレイ #漢字クイズ",
  },
  {
    question: "🐟 この漢字、読めますか？\n\n「鮃」\n\nA. カレイ\nB. ヒラメ\nC. コチ\nD. マゴチ",
    answer: "正解は B.ヒラメ！\n高級魚の代表格。泳がせ釣りで大物が狙えます🐟",
    url: "https://tsurispot.com/fish/hirame",
    tags: "#釣り #魚クイズ #ヒラメ",
  },
  {
    question: "🐟 この漢字、読めますか？\n\n「鰤」\n\nA. ブリ\nB. カンパチ\nC. ハマチ\nD. サワラ",
    answer: "正解は A.ブリ！\n「師走(12月)」に旬を迎えるから「魚」+「師」で鰤🐟",
    url: "https://tsurispot.com/fish/buri",
    tags: "#釣り #魚クイズ #ブリ #出世魚",
  },
  {
    question: "🐟 この漢字、読めますか？\n\n「鱧」\n\nA. ハモ\nB. ウナギ\nC. アナゴ\nD. ドジョウ",
    answer: "正解は A.ハモ！\n京都の夏の風物詩。骨切りの技術が必要な高級魚🔪",
    url: "https://tsurispot.com/fish/hamo",
    tags: "#釣り #魚クイズ #ハモ #京料理",
  },
  {
    question: "🤔 カレイとヒラメの見分け方、知ってる？\n\nA. 色が違う\nB. 目の位置が左右逆\nC. 大きさが違う\nD. ヒレの形が違う",
    answer: "正解は B.目の位置！\n「左ヒラメに右カレイ」\nお腹を下にしたとき、目が左→ヒラメ、右→カレイ👀",
    url: "https://tsurispot.com/fish/karei",
    tags: "#釣り #魚クイズ #カレイ #ヒラメ #見分け方",
  },
  {
    question: "🎣 ブリの出世魚の順番、正しいのは？\n\nA. ワカシ→イナダ→ワラサ→ブリ\nB. イナダ→ワカシ→ワラサ→ブリ\nC. ワカシ→ワラサ→イナダ→ブリ\nD. ハマチ→ワカシ→イナダ→ブリ",
    answer: "正解は A！\nワカシ(〜35cm)→イナダ(〜60cm)→ワラサ(〜80cm)→ブリ(80cm〜)\n※関西ではツバス→ハマチ→メジロ→ブリ🐟",
    url: "https://tsurispot.com/fish/buri",
    tags: "#釣り #魚クイズ #ブリ #出世魚",
  },
  {
    question: "🐡 フグの毒「テトロドトキシン」はどこに多い？\n\nA. 身（筋肉）\nB. 肝臓と卵巣\nC. ヒレ\nD. 目",
    answer: "正解は B.肝臓と卵巣！\n⚠️ 釣ったフグは絶対に自分でさばかないで！免許を持った専門家に任せましょう",
    url: "https://tsurispot.com/fish/fugu",
    tags: "#釣り #魚クイズ #フグ #釣り安全",
  },
  {
    question: "🎣 「サビキ釣り」ってどんな釣り方？\n\nA. ルアーを投げて巻く\nB. エサを撒いて疑似餌の仕掛けで釣る\nC. 生きたエサを泳がせる\nD. 水底に仕掛けを沈めて待つ",
    answer: "正解は B！\nサビキ釣りは初心者に最もおすすめの釣り方。アジ・サバ・イワシが数釣りできます🎣",
    url: "https://tsurispot.com/fish/aji",
    tags: "#釣り #魚クイズ #サビキ釣り #初心者",
  },
  {
    question: "🌊 「朝マズメ」ってどの時間帯のこと？\n\nA. 日の出前後\nB. 正午\nC. 夕方\nD. 深夜",
    answer: "正解は A.日の出前後！\n魚の活性が最も高く、釣果が期待できるゴールデンタイム🌅",
    url: "https://tsurispot.com/guides/march",
    tags: "#釣り #魚クイズ #朝マズメ #釣り用語",
  },
  {
    question: "🐟 メバルの名前の由来は？\n\nA. 目が張っている\nB. 春に釣れるから\nC. 岩に張り付くから\nD. 味が良いから",
    answer: "正解は A.目が張っている！\n大きな目が特徴的なので「目張（メバル）」と呼ばれています👁️",
    url: "https://tsurispot.com/fish/mebaru",
    tags: "#釣り #魚クイズ #メバル #メバリング",
  },
  {
    question: "🎣 タチウオの体が銀色に光る理由は？\n\nA. ウロコが反射\nB. グアニンという物質\nC. 粘液が光る\nD. 筋肉が発光",
    answer: "正解は B.グアニン！\nタチウオのウロコは退化し、代わりにグアニンという銀色の物質で覆われています✨",
    url: "https://tsurispot.com/fish/tachiuo",
    tags: "#釣り #魚クイズ #タチウオ #太刀魚",
  },
  {
    question: "🦀 ガザミ（ワタリガニ）の旬はいつ？\n\nA. 春（3-5月）\nB. 夏（6-8月）\nC. 秋〜冬（10-2月）\nD. 一年中同じ",
    answer: "正解は C.秋〜冬！\nオスは秋、メスは冬が旬。内子（卵）が詰まった冬のメスは絶品🦀",
    url: "https://tsurispot.com/fish/gazami",
    tags: "#釣り #魚クイズ #ワタリガニ #カニ",
  },
];

const spotQuizzes = [
  {
    question: "📍 日本で最も釣り場が多い都道府県はどこ？\n\nA. 北海道\nB. 長崎県\nC. 沖縄県\nD. 千葉県",
    answer: "正解は B.長崎県！\n海岸線の長さが日本2位で、離島も多く釣り場が豊富🏝️",
    url: "https://tsurispot.com/area/nagasaki",
    tags: "#釣り #釣りスポット #長崎 #釣り場",
  },
  {
    question: "🏖️ 「堤防釣り」と「磯釣り」、初心者におすすめなのは？\n\nA. 堤防釣り\nB. 磯釣り\nC. どちらも同じ\nD. 船釣り",
    answer: "正解は A.堤防釣り！\n足場が安定していて、トイレや駐車場も近い。まずは堤防から始めよう🎣",
    url: "https://tsurispot.com/",
    tags: "#釣り #堤防釣り #初心者 #釣りスポット",
  },
  {
    question: "🗾 「釣りの聖地」と呼ばれる三浦半島があるのは何県？\n\nA. 神奈川県\nB. 千葉県\nC. 静岡県\nD. 三重県",
    answer: "正解は A.神奈川県！\n東京から1時間で行ける釣りの楽園。城ヶ島や三崎港が有名🐟",
    url: "https://tsurispot.com/area/kanagawa",
    tags: "#釣り #三浦半島 #神奈川 #釣りスポット",
  },
];

// ── メイン処理 ──

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const typeFilter = args.includes("--type") ? args[args.indexOf("--type") + 1] : null;

const POSTED_FILE = join(__dirname, ".posted-quizzes.json");

function getPostedQuizzes() {
  try {
    return JSON.parse(readFileSync(POSTED_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function pickQuiz() {
  let pool = [];

  if (typeFilter === "fish" || !typeFilter) {
    pool.push(...fishQuizzes.map((q, i) => ({ ...q, type: "fish", index: i })));
  }
  if (typeFilter === "spot" || !typeFilter) {
    pool.push(...spotQuizzes.map((q, i) => ({ ...q, type: "spot", index: i })));
  }

  const posted = getPostedQuizzes();
  const postedKeys = new Set(posted.map((p) => `${p.type}-${p.index}`));
  const available = pool.filter((q) => !postedKeys.has(`${q.type}-${q.index}`));

  if (available.length === 0) {
    console.log("全クイズ投稿済み。リセットして最初から。");
    writeFileSync(POSTED_FILE, "[]");
    return pool[Math.floor(Math.random() * pool.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

async function main() {
  const quiz = pickQuiz();

  const tweetText = `${quiz.question}\n\n答えはリプライのリンクから👇\n${quiz.tags}`;
  const replyText = `答えはこちら👇\n${quiz.url}\n\nフォローで毎日クイズ配信中🎣`;

  console.log("=== 本文（ツイート）===");
  console.log(tweetText);
  console.log(`\n=== リプライ（答え）===`);
  console.log(replyText);
  console.log(`\n文字数: 本文${tweetText.length}字 / リプライ${replyText.length}字`);

  if (dryRun) {
    console.log("\n[dry-run] 投稿はスキップ");
    return;
  }

  const { X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } = process.env;
  if (!X_API_KEY || !X_API_KEY_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
    console.error("❌ X API の環境変数が設定されていません");
    console.error("必要: X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET");
    process.exit(1);
  }

  const client = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_KEY_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  });

  console.log("\n投稿中...");
  const tweet = await client.v2.tweet(tweetText);
  console.log(`✅ 本文投稿完了: https://x.com/tsurispot_jp/status/${tweet.data.id}`);

  const reply = await client.v2.reply(replyText, tweet.data.id);
  console.log(`✅ リプライ投稿完了: https://x.com/tsurispot_jp/status/${reply.data.id}`);

  // 投稿済みに記録
  const posted = getPostedQuizzes();
  posted.push({ index: quiz.index, type: quiz.type, date: new Date().toISOString() });
  writeFileSync(POSTED_FILE, JSON.stringify(posted, null, 2));
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
