#!/usr/bin/env node
/**
 * SNSランキングリールの「事前チェック」用: 向こう N 日の投稿予定を作る / チェック結果（承認）を保存する。
 * 手順は PRECHECK.md。GitHub Actions「SNSランキング 事前チェック」（sns-reel-precheck.yml）から実行する。
 *
 *   node plan-week.mjs plan  [--from YYYY-MM-DD] [--days 7]
 *     台帳（Redis）から run.mjs と同じ重複回避条件を作り、日付×枠（am→pm）の順にお題を決めていく。
 *     決めたお題は仮の台帳行として先頭に積むので、翌枠以降の選定は本番と同じになる。
 *     結果（各枠の上位10件＋母集団20件）を標準出力に ===PLAN-JSON=== で挟んで出し、out/sns-precheck/plan.json にも書く。
 *
 *   node plan-week.mjs apply   （環境変数 PRECHECK_DECISIONS に JSON）
 *     [{ "date":"2026-12-03", "slot":"am", "pref":"hyogo", "fish":"kasago", "excludeSpots":["slug",...], "note":"..." }, ...]
 *     を検証して Redis のハッシュ sns:ranking:approved（フィールド "日付-枠"）に保存し、Discord に要約を送る。
 *     run.mjs は投稿時にこれを読み、承認されたお題・除外スポットで投稿する。承認のない枠は投稿しない。
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { readLedger, redis, discord, APPROVED_KEY } from "./lib.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const mode = argv[0];
const arg = (k) => { const i = argv.indexOf(`--${k}`); return i >= 0 ? argv[i + 1] : undefined; };
const jstToday = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const addDays = (d, n) => new Date(Date.parse(d) + n * 864e5).toISOString().slice(0, 10);

if (mode === "plan") {
  const from = arg("from") ?? addDays(jstToday(), 1);
  const days = Number(arg("days") ?? 7);
  const ledger = await readLedger(90).catch((e) => { console.warn("台帳読込失敗:", e.message); return []; });
  const plan = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(from, i);
    for (const slot of ["am", "pm"]) {
      // run.mjs と同じ条件
      const since = Date.parse(date) - 60 * 864e5;
      const exclude = ledger.filter((e) => Date.parse(e.date) >= since).map((e) => `${e.pref}/${e.fish}`);
      const selArgs = ["--yes", "tsx@4.23.15", path.join(here, "select-topic.ts"), "--date", date,
        "--exclude", exclude.join(","), "--recent-fish", ledger.slice(0, 6).map((e) => e.fish).join(","),
        "--recent-pref", ledger.slice(0, 2).map((e) => e.pref).join(","),
        "--history", ledger.slice(0, 30).map((e) => e.fish).join(",")];
      let topic;
      try {
        topic = JSON.parse(execFileSync("npx", selArgs, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }));
      } catch (e) {
        plan.push({ date, slot, error: String(e.message).slice(0, 200) });
        continue;
      }
      plan.push({
        date, slot, pref: topic.pref.slug, prefName: topic.pref.name, fish: topic.fish.slug, fishName: topic.fish.name,
        month: topic.month.num, url: topic.url, alternatives: topic.alternatives,
        spots: topic.spots.map((s) => `${s.slug}|${s.name}|${s.city}|${s.type}`),
        pool: topic.pool.map((s) => `${s.slug}|${s.name}|${s.city}|${s.type}`),
      });
      ledger.unshift({ date, slot, pref: topic.pref.slug, fish: topic.fish.slug, ok: true, simulated: true });
    }
  }
  const out = path.resolve("out/sns-precheck");
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, "plan.json"), JSON.stringify(plan, null, 1));
  console.log("===PLAN-JSON===");
  console.log(JSON.stringify(plan));
  console.log("===PLAN-JSON-END===");
  await discord(`🗓️ **SNSランキング 事前チェック** ${from} から ${days} 日分（${plan.length}枠）の投稿予定を作りました。チェック待ちです。\n` +
    plan.map((p) => `・${p.date} ${p.slot} ${p.prefName ?? "?"}×${p.fishName ?? p.error}`).join("\n"));
} else if (mode === "apply") {
  const raw = process.env.PRECHECK_DECISIONS ?? "";
  let decisions;
  try { decisions = JSON.parse(raw); } catch { console.error("PRECHECK_DECISIONS が JSON ではありません"); process.exit(1); }
  if (!Array.isArray(decisions) || decisions.length === 0 || decisions.length > 40) { console.error("配列（1〜40件）で渡してください"); process.exit(1); }
  const slugRe = /^[a-z0-9-]{1,80}$/;
  const rows = [];
  for (const d of decisions) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !["am", "pm"].includes(d.slot)) { console.error("date/slot が不正:", JSON.stringify(d)); process.exit(1); }
    if (d.skip !== true && (!slugRe.test(d.pref ?? "") || !slugRe.test(d.fish ?? ""))) { console.error("pref/fish が不正:", JSON.stringify(d)); process.exit(1); }
    const excludeSpots = (d.excludeSpots ?? []).filter((s) => slugRe.test(s)).slice(0, 40);
    const row = { date: d.date, slot: d.slot, pref: d.pref, fish: d.fish, excludeSpots, skip: d.skip === true,
      note: String(d.note ?? "").slice(0, 300), approvedAt: new Date().toISOString() };
    rows.push(row);
    await redis(["HSET", APPROVED_KEY, `${d.date}-${d.slot}`, JSON.stringify(row)]);
  }
  // 古い承認を掃除（30日より前）
  const keys = (await redis(["HKEYS", APPROVED_KEY])) ?? [];
  const old = keys.filter((k) => k.slice(0, 10) < addDays(jstToday(), -30));
  if (old.length) await redis(["HDEL", APPROVED_KEY, ...old]);
  console.log(`承認を保存: ${rows.length}枠`);
  await discord(`✅ **SNSランキング 事前チェック完了** ${rows.length}枠を承認・保存しました\n` +
    rows.map((r) => `・${r.date} ${r.slot} ${r.skip ? "投稿しない" : `${r.pref}×${r.fish}`}${r.excludeSpots.length ? `（除外${r.excludeSpots.length}件）` : ""}${r.note ? ` — ${r.note}` : ""}`).join("\n").slice(0, 1800));
} else {
  console.error("使い方: plan-week.mjs plan|apply");
  process.exit(1);
}
