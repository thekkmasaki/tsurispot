#!/usr/bin/env node
// 1日のデプロイ(自動merge)回数の上限を機械的に強制する。
// config.autonomy.maxDeploysPerDay を実体化するカウンタ。SKILL.md の散文だけでは
// 各サイクルが独立プロセスで前回数を知らず形骸化するため、原子的カウンタを持つ。
//
// CLI:
//   node scripts/agent/deploy-budget.mjs check       # 上限未満? 0=OK / 10=上限到達(これ以上自動mergeしない)
//   node scripts/agent/deploy-budget.mjs increment    # 自動merge成功直後に+1
//   node scripts/agent/deploy-budget.mjs status [--json]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const COUNTER_PATH = path.join(REPO_ROOT, "memory", "agent", "deploy-counter.json");

function loadConfig() { return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, "config", "agent.config.json"), "utf8")); }
function today() { return new Date().toISOString().slice(0, 10); }

function read() {
  try {
    const c = JSON.parse(fs.readFileSync(COUNTER_PATH, "utf8"));
    if (c.date !== today()) return { date: today(), count: 0 }; // 日替わりでリセット
    return c;
  } catch { return { date: today(), count: 0 }; }
}
function write(c) {
  fs.mkdirSync(path.dirname(COUNTER_PATH), { recursive: true });
  fs.writeFileSync(COUNTER_PATH, JSON.stringify(c, null, 2) + "\n");
}

const cmd = process.argv[2];
const cfg = loadConfig();
const max = cfg.autonomy?.maxDeploysPerDay ?? 3;
const c = read();

if (cmd === "check") {
  const ok = c.count < max;
  console.log(`本日のデプロイ ${c.count}/${max} → ${ok ? "OK(余裕あり)" : "上限到達(これ以上自動mergeしない)"}`);
  process.exit(ok ? 0 : 10);
} else if (cmd === "increment") {
  c.count += 1; write(c);
  console.log(`デプロイカウント +1 → ${c.count}/${max}`);
  process.exit(0);
} else if (cmd === "status") {
  if (process.argv.includes("--json")) console.log(JSON.stringify({ ...c, max }, null, 2));
  else console.log(`本日(${c.date}) ${c.count}/${max}`);
  process.exit(0);
} else {
  console.error("usage: deploy-budget.mjs <check|increment|status>");
  process.exit(1);
}
