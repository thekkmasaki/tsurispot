#!/usr/bin/env node
/**
 * 中の人「今日絡むべき候補リスト」配膳スクリプト（Phase 2）
 *
 * 釣り界隈で認知される存在になるには中の人の手動交流が要だが、X検索APIは
 * Basic(≒¥30,000/月)で予算外。そこで **APIを使わず** 毎朝Discordに:
 *   1) 自サイトの新着ユーザー釣果（/api/catch-reports/recent・無料）
 *   2) Xの検索ディープリンク（タップ→公式アプリで引用/リプ）
 * を配膳し、中の人が1日10-15分で交流できるようにする。
 *
 * 使い方:
 *   node scripts/sns/daily-engage-digest.mjs            # Discordへ配膳
 *   node scripts/sns/daily-engage-digest.mjs --dry-run  # 送信せず内容を表示
 *
 * 環境変数: DISCORD_ENGAGE_WEBHOOK_URL（無ければ DISCORD_WEBHOOK_URL）
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const isDryRun = process.argv.includes("--dry-run");
const SITE = "https://tsurispot.com";

// .env.local を手動パース（CIでは環境変数で渡るためファイルが無くても動作）
function loadEnv() {
  try {
    const content = readFileSync(join(ROOT, ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq);
      let val = t.slice(eq + 1);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    /* CIでは環境変数で渡る */
  }
}
loadEnv();

// 月ごとの代表的な旬魚（Xで「◯◯ 釣れた」検索して絡む用）
const SEASONAL_FISH_BY_MONTH = {
  1: ["メバル", "ヤリイカ", "カサゴ"],
  2: ["メバル", "アオリイカ", "ヒラメ"],
  3: ["メバル", "アオリイカ", "マダイ"],
  4: ["アオリイカ", "マダイ", "メバル"],
  5: ["アオリイカ", "キス", "クロダイ"],
  6: ["キス", "クロダイ", "アジ"],
  7: ["キス", "アジ", "タチウオ"],
  8: ["アジ", "タチウオ", "カマス"],
  9: ["タチウオ", "アオリイカ", "青物"],
  10: ["アオリイカ", "青物", "タチウオ"],
  11: ["アオリイカ", "青物", "カワハギ"],
  12: ["ヤリイカ", "メバル", "ブリ"],
};

// 地域×釣りで絡む用（日替わりでローテーション）
const REGIONS = ["大阪", "神戸", "東京湾", "横浜", "福岡", "名古屋", "和歌山", "広島", "仙台", "北海道"];

/** X の live 検索ディープリンク */
function xSearch(query) {
  return `https://x.com/search?q=${encodeURIComponent(query)}&f=live`;
}

/** JST の日付・曜日ラベルと日付インデックス */
function jstToday() {
  const nowMs = Date.now();
  const jst = new Date(nowMs + 9 * 3600 * 1000);
  const dow = ["日", "月", "火", "水", "木", "金", "土"][jst.getUTCDay()];
  const label = `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}(${dow})`;
  const month = jst.getUTCMonth() + 1;
  const dayIndex = Math.floor(nowMs / 86_400_000);
  return { label, month, dayIndex };
}

/** 自サイトの新着ユーザー釣果を取得 */
async function fetchRecentCatches(limit = 8) {
  try {
    const res = await fetch(`${SITE}/api/catch-reports/recent?limit=${limit}`, {
      headers: { "User-Agent": "tsurispot-engage-digest" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.reports) ? data.reports : [];
  } catch (e) {
    console.warn(`釣果フィード取得失敗: ${e?.message || e}`);
    return [];
  }
}

function buildMessage(reports, { label, month, dayIndex }) {
  const lines = [];
  lines.push(`🎣 **今日の「界隈で絡む」候補リスト** ${label}`);
  lines.push("");

  // 1) 自サイトの新着釣果
  lines.push("**▼ ツリスポの新着釣果（スポットで反応 or 投稿者と交流）**");
  if (reports.length === 0) {
    lines.push("（新着なし。Xの検索リンクから絡みましょう）");
  } else {
    for (const r of reports.slice(0, 8)) {
      const size = typeof r.sizeCm === "number" && r.sizeCm > 0 ? ` ${r.sizeCm}cm` : "";
      const who = r.userName ? `（${r.userName}）` : "";
      const url = r.spotSlug ? ` ${SITE}/spots/${r.spotSlug}` : "";
      lines.push(`・${r.spotName || "?"} — ${r.fishName || "?"}${size}${who}${url}`);
    }
  }
  lines.push("");

  // 2) Xの検索ディープリンク（日替わり）
  const fishes = SEASONAL_FISH_BY_MONTH[month] || ["アジ"];
  const region = REGIONS[dayIndex % REGIONS.length];
  const region2 = REGIONS[(dayIndex + 3) % REGIONS.length];
  lines.push("**▼ Xで絡む検索リンク（タップ→公式アプリで引用RT/リプ）**");
  lines.push(`・#ツリスポ釣果: ${xSearch("#ツリスポ釣果")}`);
  for (const f of fishes.slice(0, 2)) {
    lines.push(`・${f} 釣れた: ${xSearch(`${f} 釣れた`)}`);
  }
  lines.push(`・釣り ${region}: ${xSearch(`釣り ${region} 釣果`)}`);
  lines.push(`・釣り ${region2}: ${xSearch(`釣り ${region2} 釣果`)}`);
  lines.push(`・仲間を探す: ${xSearch("#釣り好きな人と繋がりたい")}`);
  lines.push("");

  // 3) 10-15分ルーティン
  lines.push("**▼ 10〜15分ルーティン**");
  lines.push("① 上の新着釣果に反応(5分) ② 検索リンクから旬の釣果に「ナイスフィッシュ！」引用RT(8分) ③ 良い人をフォロー(2分)");
  lines.push("※詳細は docs/sns/persona.md");

  return lines.join("\n");
}

async function postDiscord(content) {
  const url = process.env.DISCORD_ENGAGE_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!url) {
    console.error("DISCORD_ENGAGE_WEBHOOK_URL / DISCORD_WEBHOOK_URL が未設定です");
    process.exit(1);
  }
  // Discord本文は2000文字制限
  const body = content.length > 1900 ? content.slice(0, 1900) + "\n…(省略)" : content;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: body }),
  });
  if (!res.ok) {
    throw new Error(`Discord送信失敗: ${res.status} ${await res.text().catch(() => "")}`);
  }
}

async function main() {
  const today = jstToday();
  const reports = await fetchRecentCatches(8);
  const message = buildMessage(reports, today);

  console.log("=== 配膳メッセージ ===");
  console.log(message);
  console.log(`\n（${message.length}文字）`);

  if (isDryRun) {
    console.log("\n[dry-run] Discord送信はスキップ");
    return;
  }
  await postDiscord(message);
  console.log("\n✅ Discordへ配膳しました");
}

main().catch((err) => {
  console.error("エラー:", err.message);
  process.exit(1);
});
