#!/usr/bin/env node
// 実験台帳マネージャ。真実源は experiments.json、人間可読の experiments.md を自動描画。
// 自己改善サイクルが「仮説→変更→測定→判定」を1対1で追跡するための中核。
//
// CLI:
//   node scripts/agent/ledger.mjs add --json '{"targetPath":"/spots/x","hypothesis":"...","changeType":"title-ctr","prNumber":123,"before":{...},"measureInDays":14,"phase":2}'
//   node scripts/agent/ledger.mjs update <id> --json '{"verdict":"win","after":{...},"prMerged":true}'
//   node scripts/agent/ledger.mjs due           # 計測予定日を過ぎた pending 実験を列挙
//   node scripts/agent/ledger.mjs list [--json]
//
// import: import { addExperiment, updateExperiment, dueExperiments } from "./ledger.mjs"

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const AGENT_DIR = path.join(REPO_ROOT, "memory", "agent");
const JSON_PATH = path.join(AGENT_DIR, "experiments.json");
const MD_PATH = path.join(AGENT_DIR, "experiments.md");

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function load() {
  try { return JSON.parse(fs.readFileSync(JSON_PATH, "utf8")); }
  catch { return { experiments: [], nextId: 1 }; }
}
function save(db) {
  ensureDir(AGENT_DIR);
  fs.writeFileSync(JSON_PATH, JSON.stringify(db, null, 2) + "\n");
  renderMarkdown(db);
}

function isoDate(d = new Date()) { return d.toISOString().slice(0, 10); }
function addDaysIso(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}
function defaultMeasureInDays() {
  // before(直近28日窓)とafter窓の重複・季節ノイズを避けるため config で最低6週後を既定にする
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8"));
    return cfg.measurement?.measureInDays ?? 42;
  } catch { return 42; }
}

export function addExperiment(rec) {
  const db = load();
  const id = db.nextId++;
  const exp = {
    id,
    createdAt: isoDate(),
    phase: rec.phase ?? null,
    targetPath: rec.targetPath || null,
    targetUrl: rec.targetUrl || null,
    hypothesis: rec.hypothesis || "",
    changeType: rec.changeType || "",
    prNumber: rec.prNumber ?? null,
    prMerged: rec.prMerged ?? false,
    before: rec.before || null, // {position,clicks,ctr,impressions,affiliateClicks}
    after: null,
    measureOn: rec.measureOn || addDaysIso(rec.measureInDays ?? defaultMeasureInDays()),
    verdict: "pending", // pending | win | flat | loss | reverted
    note: rec.note || "",
  };
  db.experiments.push(exp);
  save(db);
  return exp;
}

export function updateExperiment(id, patch) {
  const db = load();
  const exp = db.experiments.find((e) => e.id === Number(id));
  if (!exp) throw new Error(`実験 id=${id} が見つかりません`);
  Object.assign(exp, patch, { updatedAt: isoDate() });
  save(db);
  return exp;
}

export function dueExperiments(asOf = isoDate()) {
  const db = load();
  return db.experiments.filter((e) => e.verdict === "pending" && e.measureOn <= asOf);
}

function renderMarkdown(db) {
  const rows = db.experiments
    .slice()
    .sort((a, b) => b.id - a.id)
    .map((e) => {
      const b = e.before || {};
      const a = e.after || {};
      const fmt = (o) => (o && o.position != null ? `pos${o.position}/clk${o.clicks ?? "-"}/aff${o.affiliateClicks ?? "-"}` : "-");
      const vmark = { win: "🟢win", flat: "⚪flat", loss: "🔴loss", reverted: "↩reverted", pending: "⏳pending" }[e.verdict] || e.verdict;
      return `| ${e.id} | ${e.createdAt} | P${e.phase ?? "-"} | ${e.targetPath ?? "-"} | ${truncate(e.hypothesis, 40)} | ${e.changeType} | ${e.prNumber ? `#${e.prNumber}` : "-"}${e.prMerged ? "✅" : ""} | ${e.measureOn} | ${fmt(b)} | ${fmt(a)} | ${vmark} |`;
    });

  const counts = db.experiments.reduce((acc, e) => { acc[e.verdict] = (acc[e.verdict] || 0) + 1; return acc; }, {});
  const md = `# 実験台帳 (experiments.md)

> 自動生成（真実源: experiments.json）。手で編集しない。
> 自己改善エージェントが1サイクル=1改善で追記し、measureOn 到来後に判定する。

集計: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(" / ") || "なし"}

| id | 日付 | phase | 対象 | 仮説 | 変更種別 | PR | 計測予定 | Before | After | 判定 |
|----|------|-------|------|------|----------|----|----------|--------|-------|------|
${rows.join("\n")}
`;
  fs.writeFileSync(MD_PATH, md);
}

function truncate(s, n) { return (s || "").length > n ? s.slice(0, n - 1) + "…" : (s || ""); }

// CLI
function parseJsonFlag() {
  const i = process.argv.indexOf("--json");
  if (i >= 0 && process.argv[i + 1]) return JSON.parse(process.argv[i + 1]);
  return {};
}

if (process.argv[1]?.endsWith("ledger.mjs")) {
  const cmd = process.argv[2];
  try {
    if (cmd === "add") {
      const exp = addExperiment(parseJsonFlag());
      console.log(`追加: 実験 id=${exp.id} measureOn=${exp.measureOn}`);
    } else if (cmd === "update") {
      const id = process.argv[3];
      const exp = updateExperiment(id, parseJsonFlag());
      console.log(`更新: 実験 id=${exp.id} verdict=${exp.verdict}`);
    } else if (cmd === "due") {
      const due = dueExperiments();
      console.log(JSON.stringify(due, null, 2));
      console.error(`計測期日到来: ${due.length}件`);
    } else if (cmd === "list") {
      const db = load();
      if (process.argv.includes("--json")) console.log(JSON.stringify(db, null, 2));
      else console.log(`実験 ${db.experiments.length}件 (台帳: memory/agent/experiments.md)`);
    } else {
      console.error("usage: ledger.mjs <add|update <id>|due|list> [--json '<obj>']");
      process.exit(1);
    }
  } catch (e) {
    console.error("ledger エラー:", e.message);
    process.exit(1);
  }
}
