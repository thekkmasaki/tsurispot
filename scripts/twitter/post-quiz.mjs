#!/usr/bin/env node
/**
 * X (Twitter) 自動クイズ投稿スクリプト（240問DB・日付決定論・投票対応）
 *
 * 改善点（旧実装からの変更）:
 *  - 18問ハードコード → src/lib/data/quiz-questions.ts の 240問プールを使用
 *  - 純ランダム + CIでstate消失で重複 → 日付ハッシュの決定論選択（state不要・
 *    約240日で一巡し重複ゼロ）
 *  - 捨てていた解説(explanation)を固定リプで発表（旧: リンクのみのバイト＆スイッチ）
 *  - 選択肢が短ければ native poll（投票）で出題しエンゲージメント最大化
 *  - コミュニティタグ(#釣り好きな人と繋がりたい) と UTM付きリンクを付与
 *
 * 使い方:
 *   node scripts/twitter/post-quiz.mjs
 *   node scripts/twitter/post-quiz.mjs --dry-run
 *   node scripts/twitter/post-quiz.mjs --day 5   # 決定論の日付オフセット指定（テスト用）
 */

import { loadEnv, getClient, isDryRun, makeUrl } from "./lib/x-client.mjs";
import { loadAllQuizzes } from "./lib/quiz-data.mjs";

loadEnv();

const CHOICE_LETTERS = ["A", "B", "C", "D"];
const POLL_OPTION_MAX = 25; // X の投票選択肢は各25文字まで
const TWEET_MAX = 280;
const COMMUNITY_TAGS = "#釣りクイズ #釣り #釣り好きな人と繋がりたい";

/**
 * Twitter 加重文字数（U+0000〜U+10FF=1、それ以外=2、URL=23）
 * ※日本語・全角・絵文字は2としてカウント（Xの既定レンジに準拠）
 */
function weightedLen(text) {
  const urls = text.match(/https?:\/\/\S+/g) || [];
  const body = text.replace(/https?:\/\/\S+/g, "");
  let n = 0;
  for (const ch of body) {
    n += ch.codePointAt(0) <= 0x10ff ? 1 : 2;
  }
  return n + urls.length * 23;
}

/** 文字列の安定ハッシュ（FNV-1a） */
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * カテゴリを round-robin で交互に並べた決定論的な出題順を作る。
 * カテゴリ内は id ハッシュで安定シャッフル。これにより連続する日は必ず
 * 別カテゴリ（8カテゴリ→8日周期で一巡）になり、単調さを避けられる。
 */
function buildRotationOrder(quizzes) {
  const byCat = new Map();
  for (const q of quizzes) {
    if (!byCat.has(q.category)) byCat.set(q.category, []);
    byCat.get(q.category).push(q);
  }
  const cats = [...byCat.keys()].sort(); // カテゴリ順は固定（決定論）
  for (const c of cats) byCat.get(c).sort((a, b) => hashStr(a.id) - hashStr(b.id));

  const order = [];
  for (let round = 0, added = true; added; round++) {
    added = false;
    for (const c of cats) {
      const arr = byCat.get(c);
      if (round < arr.length) {
        order.push(arr[round]);
        added = true;
      }
    }
  }
  return order;
}

/**
 * 日付インデックスで決定論的に1問選ぶ。
 * CIでstateが消えても同日は同じ問題／翌日は別カテゴリ、と重複が起きない
 * （約240日で全問一巡）。
 */
function pickDeterministic(quizzes) {
  const order = buildRotationOrder(quizzes);
  const args = process.argv;
  const dayArg = args.includes("--day")
    ? parseInt(args[args.indexOf("--day") + 1], 10)
    : NaN;
  const dayIndex = Number.isNaN(dayArg)
    ? Math.floor(Date.now() / 86_400_000)
    : dayArg;
  const idx = ((dayIndex % order.length) + order.length) % order.length;
  return order[idx];
}

/** 関連リンクの href から UTM 付き詳細URLを作る（無ければ /quiz） */
function detailUrl(quiz) {
  const href = quiz.relatedLinks?.[0]?.href || "/quiz";
  return makeUrl(href, "quiz");
}

/** 投票が使えるか（選択肢2〜4個かつ全て25文字以内） */
function pollFits(quiz) {
  return (
    Array.isArray(quiz.choices) &&
    quiz.choices.length >= 2 &&
    quiz.choices.length <= 4 &&
    quiz.choices.every((c) => typeof c === "string" && c.length <= POLL_OPTION_MAX)
  );
}

/** 投票用の本文（選択肢は投票UIに出るので本文には入れない） */
function buildPollText(quiz) {
  const full = `🎣【釣りクイズ】\n${quiz.question}\n\n👇タップで回答！正解は固定リプで発表\n${COMMUNITY_TAGS}`;
  if (weightedLen(full) <= TWEET_MAX) return full;
  return `🎣【釣りクイズ】\n${quiz.question}\n\n👇タップで回答！正解は固定リプで\n#釣りクイズ`;
}

/** テキスト4択の本文（投票が使えない長い選択肢向け） */
function buildTextChoices(quiz) {
  const lines = quiz.choices.map((c, i) => `${CHOICE_LETTERS[i]}. ${c}`);
  const full = `🎣【釣りクイズ】\n${quiz.question}\n\n${lines.join("\n")}\n\n答えは固定リプで👇\n${COMMUNITY_TAGS}`;
  if (weightedLen(full) <= TWEET_MAX) return full;
  return `🎣【釣りクイズ】\n${quiz.question}\n\n${lines.join("\n")}\n\n答えは固定リプで👇\n#釣りクイズ`;
}

/** 正解＋解説＋リンク＋フォローCTA の固定リプ本文 */
function buildReply(quiz) {
  const letter = CHOICE_LETTERS[quiz.correctIndex] || "?";
  const answer = quiz.choices?.[quiz.correctIndex] || "";
  return [
    `正解は【${letter}】${answer}`,
    "",
    quiz.explanation,
    "",
    `くわしく→ ${detailUrl(quiz)}`,
    "",
    "毎日1問出題中🎣 フォローで挑戦！",
  ].join("\n");
}

async function main() {
  const quizzes = loadAllQuizzes();
  console.log(`クイズDB: ${quizzes.length}問 読込`);

  const quiz = pickDeterministic(quizzes);
  const usePoll = pollFits(quiz);
  const mainText = usePoll ? buildPollText(quiz) : buildTextChoices(quiz);
  const replyText = buildReply(quiz);

  console.log(`\n=== 選択問題: ${quiz.id} / ${quiz.category} / ${quiz.difficulty} ===`);
  console.log(`形式: ${usePoll ? "投票(poll)" : "テキスト4択"}`);
  console.log("\n--- 本文 ---");
  console.log(mainText);
  if (usePoll) {
    console.log(
      `\n[投票選択肢] ${quiz.choices.map((c, i) => `${CHOICE_LETTERS[i]}.${c}`).join(" / ")}`
    );
  }
  console.log("\n--- 固定リプ（正解）---");
  console.log(replyText);
  console.log(`\n加重文字数: 本文${weightedLen(mainText)} / リプ${weightedLen(replyText)}`);

  if (isDryRun) {
    console.log("\n[dry-run] 投稿はスキップ");
    return;
  }

  const client = getClient();
  console.log("\n投稿中...");
  const tweet = usePoll
    ? await client.v2.tweet(mainText, {
        poll: { duration_minutes: 1440, options: quiz.choices },
      })
    : await client.v2.tweet(mainText);
  console.log(`✅ 本文投稿: https://x.com/tsurispot_jp/status/${tweet.data.id}`);

  const reply = await client.v2.reply(replyText, tweet.data.id);
  console.log(`✅ 固定リプ投稿: https://x.com/tsurispot_jp/status/${reply.data.id}`);
}

main().catch((err) => {
  console.error("❌ エラー:", err.message);
  if (err.data) console.error("API詳細:", JSON.stringify(err.data, null, 2));
  process.exit(1);
});
